#!/usr/bin/env node

import pc from "picocolors";
import { Command } from "commander";
import fs from "fs";
import path from "path";
import prompts from "prompts";
import packageJson from "../package.json";
import { createApp } from "./create-app";
import {
  __root,
  checkGitStatus,
  getPackageManager,
  isFolderEmpty,
  isInGitRepository,
  validateNpmName,
} from "./utils";
import { execa } from "execa";
import ora from "ora";

let projectPath: string = "";

const handleSigTerm = () => process.exit(0);

process.on("SIGINT", handleSigTerm);
process.on("SIGTERM", handleSigTerm);

const onPromptState = (state: any) => {
  if (state.aborted) {
    // If we don't re-enable the terminal cursor before exiting
    // the program, the cursor will remain hidden
    process.stdout.write("\x1B[?25h");
    process.stdout.write("\n");
    process.exit(1);
  }
};

const program = new Command()
  .name(packageJson.name)
  .description(packageJson.description)
  .version(
    packageJson.version || "1.0.0",
    "-v, --version",
    "display the version number",
  )
  .arguments("[project-directory]")
  .usage(`${pc.green("[project-directory]")} [options]`)
  .action((name) => {
    projectPath = name;
  })
  .option("-t, --template <template>", `select template`)
  .option(
    "--use-npm",
    `

  Explicitly tell the CLI to bootstrap the application using npm
`,
  )
  .option(
    "--use-pnpm",
    `

  Explicitly tell the CLI to bootstrap the application using pnpm
`,
  )
  .option(
    "--use-yarn",
    `

  Explicitly tell the CLI to bootstrap the application using Yarn
`,
  )
  .parse(process.argv);

async function reRun() {
  const userArgs = process.argv.slice(2);
  try {
    await execa("create-agl-template", userArgs, {
      stdin: "inherit",
      stdout: "inherit",
    });
    process.exit();
  } catch (e: any) {
    if (e.exitCode === 1) {
      process.exit(1);
    } else {
      ora().fail("Re-running script failed!");
      console.log();
      console.log(e.message);
      console.log();
    }
  }
}

async function isNeededUpdate() {
  const gitStatus = await checkGitStatus();
  if (gitStatus !== "need-to-pull") return;

  console.log(
    pc.yellow("A new version of `create-agl-template` is available!"),
  );
  const cwd = __root;

  try {
    console.log();
    console.log(pc.yellow("Full Changelog:"));
    await execa("git", ["log", "..@{u}", "--oneline"], { stdio: "inherit", cwd });
    console.log();
  } catch (e) {}

  const res = await prompts({
    onState: onPromptState,
    type: "confirm",
    name: "update",
    message: "Update new version and continue?",
  });
  if (!res.update) return;

  const spinner = ora("Updating new version").start();
  try {
    await execa("git", ["pull"], { cwd });
    await execa("npm", ["run", "install:global"], { cwd });
    spinner.succeed("Update successful");
    await reRun();
  } catch (e: any) {
    spinner.fail("Update failed!");
    console.log();
    console.log(e.message);
    console.log();
  }
}

async function run(): Promise<void> {
  if (isInGitRepository(__root)) {
    await isNeededUpdate();
    execa("git", ["fetch"], {
      cwd: __root,
    });
  }

  if (typeof projectPath === "string") {
    projectPath = projectPath.trim();
  }

  if (!projectPath) {
    const res = await prompts({
      onState: onPromptState,
      type: "text",
      name: "path",
      message: "What is your project named?",
      initial: "my-app",
      validate: (name) => {
        const validation = validateNpmName(path.basename(path.resolve(name)));
        if (validation.valid) {
          return true;
        }
        return "Invalid project name: " + validation.problems![0];
      },
    });

    if (typeof res.path === "string") {
      projectPath = res.path.trim();
    }
  }

  if (!projectPath) {
    console.log(
      "\nPlease specify the project directory:\n" +
        `  ${pc.cyan(program.name())} ${pc.green("<project-directory>")}\n` +
        "For example:\n" +
        `  ${pc.cyan(program.name())} ${pc.green("my-next-app")}\n\n` +
        `Run ${pc.cyan(`${program.name()} --help`)} to see all options.`,
    );
    process.exit(1);
  }

  const root = path.resolve(projectPath);
  const projectName = path.basename(root);

  const { valid, problems } = validateNpmName(projectName);
  if (!valid) {
    console.error(
      `Could not create a project called ${pc.red(
        `"${projectName}"`,
      )} because of npm naming restrictions:`,
    );

    problems!.forEach((p) => console.error(`    ${pc.red(pc.bold("*"))} ${p}`));
    process.exit(1);
  }

  /**
   * Verify the project dir is empty or doesn't exist
   */
  const folderExists = fs.existsSync(root);

  if (folderExists && !isFolderEmpty(root, projectName)) {
    process.exit(1);
  }

  const options = program.opts();
  const argTemplate = options.template || options.t;

  type ColorFunc = (input: string | number | null | undefined) => string;
  interface Template {
    name: string;
    display: string;
    color: ColorFunc;
  }
  const TEMPLATES: Template[] = [
    {
      name: "ejs",
      display: "EJS",
      color: pc.magenta,
    },
    {
      name: "twig",
      display: "Twig",
      color: pc.green,
    },
    {
      name: "default",
      display: "Default",
      color: pc.gray,
    },
  ];

  let result: prompts.Answers<"template">;

  try {
    const isValidTemplate = TEMPLATES.find((t) => t.name === argTemplate);

    result = await prompts(
      [
        {
          type: argTemplate && isValidTemplate ? null : "select",
          name: "template",
          message:
            typeof argTemplate === "string" && !isValidTemplate
              ? pc.reset(
                  `"${argTemplate}" isn't a valid template. Please choose from below: `,
                )
              : pc.reset("Select a template:"),
          initial: 0,
          choices: TEMPLATES.map((framework) => {
            const frameworkColor = framework.color;
            return {
              title: frameworkColor(framework.display || framework.name),
              value: framework,
            };
          }),
        },
      ],
      {
        onCancel: () => {
          throw new Error(pc.red("✖") + " Operation cancelled");
        },
      },
    );
  } catch (cancelled: any) {
    console.log(cancelled.message);
    return;
  }

  const { template } = result;
  let selectedTemplate = template?.name || argTemplate;

  const packageManager = !!options.useNpm
    ? "npm"
    : !!options.usePnpm
      ? "pnpm"
      : !!options.useYarn
        ? "yarn"
        : getPackageManager();

  createApp({
    root,
    packageManager,
    template: selectedTemplate,
  });
}

run();
