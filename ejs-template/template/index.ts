import fs from "node:fs";
import os from "os";
import pc from "picocolors";
import { PackageManager, copy } from "@/src/utils";
import path from "path";
import { fileURLToPath } from "url";
import { execa } from "execa";

interface InstallTemplateArgs {
  appName: string;
  root: string;
  packageManager: PackageManager;
  template: string;
}
export async function installTemplate({
  appName,
  root,
  packageManager,
  template,
}: InstallTemplateArgs) {
  console.log(pc.bold(`Using ${packageManager}.`));

  /**
   * Copy the template files to the target directory.
   */
  console.log("\nInitializing project with template:", template);
  const templatePath = path.join(
    fileURLToPath(import.meta.url),
    "../..",
    "template",
    template
  );

  const copySource = [
    "**",
    "!package.json",
    "!package-lock.json",
    "!README.md",
  ];
  await copy(copySource, root, {
    parents: true,
    cwd: templatePath,
  });

  // Write package.json
  const pkg = JSON.parse(
    fs.readFileSync(path.join(templatePath, `package.json`), "utf-8")
  );

  pkg.name = appName;

  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify(pkg, null, 2) + os.EOL
  );

  // Write README.md
  let readme = fs.readFileSync(path.join(templatePath, `README.md`), "utf-8");
  readme = readme
    .replaceAll("[PACKAGE_MANAGER]", packageManager)
    .replaceAll("[RUN]", packageManager === "yarn" ? "" : "run ");

  fs.writeFileSync(path.join(root, "README.md"), readme);

  if (pkg.dependencies) {
    console.log("\nInstalling dependencies:");
    for (const dependency in pkg.dependencies)
      console.log(`- ${pc.cyan(dependency)}`);
  }

  if (pkg.devDependencies) {
    console.log("\nInstalling devDependencies:");
    for (const dependency in pkg.devDependencies)
      console.log(`- ${pc.cyan(dependency)}`);
  }
  console.log();

  // Install dependencies.
  await execa(packageManager, ["install"], {
    stdio: "inherit",
  });
}
