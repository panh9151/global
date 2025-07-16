import fg from "fast-glob";
import pc from "picocolors";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import validateProjectName from "validate-npm-package-name";
import { execa } from "execa";
import { fileURLToPath } from "url";

export type PackageManager = "npm" | "pnpm" | "yarn";

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const __root = path.join(__dirname, "..");

export async function isWriteable(directory: string): Promise<boolean> {
  try {
    await fs.promises.access(directory, (fs.constants || fs).W_OK);
    return true;
  } catch (err) {
    return false;
  }
}

export function makeDir(
  root: string,
  options = { recursive: true },
): Promise<string | undefined> {
  return fs.promises.mkdir(root, options);
}

interface CopyOption {
  cwd?: string;
  rename?: (basename: string) => string;
  parents?: boolean;
}
export const copy = async (
  src: string | string[],
  dest: string,
  { cwd, rename = (x: string) => x, parents = true }: CopyOption = {},
) => {
  const source = typeof src === "string" ? [src] : src;

  if (source.length === 0 || !dest) {
    throw new TypeError("`src` and `dest` are required");
  }

  const gitignore = cwd
    ? fs.readFileSync(path.join(cwd, `.gitignore`), "utf-8")
    : "";
  const ignore = gitignore.split("\n");

  const sourceFiles = await fg.async(source, {
    cwd,
    dot: true,
    absolute: false,
    stats: false,
    ignore,
  });

  const destRelativeToCwd = cwd ? path.resolve(cwd, dest) : dest;

  return Promise.all(
    sourceFiles.map(async (p) => {
      const dirname = path.dirname(p);
      const basename = rename(path.basename(p));

      const from = cwd ? path.resolve(cwd, p) : p;
      const to = parents
        ? path.join(destRelativeToCwd, dirname, basename)
        : path.join(destRelativeToCwd, basename);

      // Ensure the destination directory exists
      await fs.promises.mkdir(path.dirname(to), { recursive: true });

      return fs.promises.copyFile(from, to);
    }),
  );
};

export function isFolderEmpty(root: string, name: string): boolean {
  const validFiles = [
    ".DS_Store",
    ".git",
    ".gitattributes",
    ".gitignore",
    ".gitlab-ci.yml",
    ".hg",
    ".hgcheck",
    ".hgignore",
    ".idea",
    ".npmignore",
    ".travis.yml",
    "LICENSE",
    "Thumbs.db",
    "docs",
    "mkdocs.yml",
    "npm-debug.log",
    "yarn-debug.log",
    "yarn-error.log",
    "yarnrc.yml",
    ".yarn",
  ];

  const conflicts = fs
    .readdirSync(root)
    .filter((file) => !validFiles.includes(file))
    // Support IntelliJ IDEA-based editors
    .filter((file) => !/\.iml$/.test(file));

  if (conflicts.length > 0) {
    console.log(
      `The directory ${pc.green(name)} contains files that could conflict:`,
    );
    console.log();
    for (const file of conflicts) {
      try {
        const stats = fs.lstatSync(path.join(root, file));
        if (stats.isDirectory()) {
          console.log(`  ${pc.blue(file)}/`);
        } else {
          console.log(`  ${file}`);
        }
      } catch {
        console.log(`  ${file}`);
      }
    }
    console.log();
    console.log(
      "Either try using a new directory name, or remove the files listed above.",
    );
    console.log();
    return false;
  }

  return true;
}

export function getPackageManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent;

  if (!userAgent) {
    return "npm";
  }

  if (userAgent.startsWith("yarn")) {
    return "yarn";
  }

  if (userAgent.startsWith("pnpm")) {
    return "pnpm";
  }

  return "npm";
}

export function isInGitRepository(cwd?: string): boolean {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore", cwd });
    return true;
  } catch (_) {}
  return false;
}

function isInMercurialRepository(): boolean {
  try {
    execSync("hg --cwd . root", { stdio: "ignore" });
    return true;
  } catch (_) {}
  return false;
}

function isDefaultBranchSet(): boolean {
  try {
    execSync("git config init.defaultBranch", { stdio: "ignore" });
    return true;
  } catch (_) {}
  return false;
}

export async function checkGitStatus(): Promise<
  "up-to-date" | "need-to-pull" | "need-to-push" | "diverged" | "error"
> {
  try {
    const cwd = __root;
    const { stdout: local } = await execa("git", ["rev-parse", "@"], { cwd });
    const { stdout: remote } = await execa("git", ["rev-parse", "@{u}"], {
      cwd,
    });
    const { stdout: base } = await execa("git", ["merge-base", "@", "@{u}"], {
      cwd,
    });

    if (local === remote) {
      return "up-to-date";
    } else if (local === base) {
      return "need-to-pull";
    } else if (remote === base) {
      return "need-to-push";
    } else {
      return "diverged";
    }
  } catch (e) {
    return "error"
  }
}

export function tryGitInit(root: string): boolean {
  let didInit = false;
  try {
    execSync("git --version", { stdio: "ignore" });
    if (isInGitRepository() || isInMercurialRepository()) {
      return false;
    }

    execSync("git init", { stdio: "ignore" });
    didInit = true;

    if (!isDefaultBranchSet()) {
      execSync("git checkout -b main", { stdio: "ignore" });
    }

    execSync("git add -A", { stdio: "ignore" });
    execSync('git commit -m "Initial commit from Create AGL Template"', {
      stdio: "ignore",
    });
    return true;
  } catch (e) {
    if (didInit) {
      try {
        fs.rmSync(path.join(root, ".git"), { recursive: true, force: true });
      } catch (_) {}
    }
    return false;
  }
}

export function validateNpmName(name: string): {
  valid: boolean;
  problems?: string[];
} {
  const nameValidation = validateProjectName(name);
  if (nameValidation.validForNewPackages) {
    return { valid: true };
  }

  return {
    valid: false,
    problems: [
      ...(nameValidation.errors || []),
      ...(nameValidation.warnings || []),
    ],
  };
}
