import path from "path";
import pc from "picocolors";
import {
  PackageManager,
  isFolderEmpty,
  isWriteable,
  makeDir,
  tryGitInit,
} from "./utils";
import { installTemplate } from "../template";

export async function createApp({
  root,
  packageManager,
  template,
}: {
  root: string;
  packageManager: PackageManager;
  template: string;
}) {
  const appName = path.basename(root);

  if (!(await isWriteable(path.dirname(root)))) {
    console.error(
      "The application path is not writable, please check folder permissions and try again."
    );
    console.error(
      "It is likely you do not have write permissions for this folder."
    );
    process.exit(1);
  }

  await makeDir(root);
  if (!isFolderEmpty(root, appName)) {
    process.exit(1);
  }

  const originalDirectory = process.cwd();

  const useYarn = packageManager === "yarn";

  console.log(`Creating a new template in ${pc.green(root)}.`);
  console.log();

  process.chdir(root);

  try {
    await installTemplate({
      appName,
      root,
      template,
      packageManager,
    });

    if (tryGitInit(root)) {
      console.log("Initialized a git repository.");
    }

    console.log();
    console.log(`${pc.green("Success!")} Created ${appName} at ${root}`);

    let cdpath: string;
    if (path.join(originalDirectory, appName) === root) {
      cdpath = appName;
    } else {
      cdpath = root;
    }
    console.log("Inside that directory, you can run several commands:");
    console.log();
    console.log(pc.cyan(`  ${packageManager} ${useYarn ? "" : "run "}dev`));
    console.log("    Starts the development server.");
    console.log();
    console.log(pc.cyan(`  ${packageManager} ${useYarn ? "" : "run "}build`));
    console.log("    Builds the app for production.");
    console.log();
    console.log(pc.cyan(`  ${packageManager} ${useYarn ? "" : "run "}preview`));
    console.log("    Runs the built app in preview mode.");
    console.log();
    console.log("We suggest that you begin by typing:");
    console.log();
    console.log(pc.cyan("  cd"), cdpath);
    console.log(
      `  ${pc.cyan(`${packageManager} ${useYarn ? "" : "run "}dev`)}`
    );
    console.log();
  } catch (error) {
    function isErrorLike(err: unknown): err is { message: string } {
      return (
        typeof err === "object" &&
        err !== null &&
        typeof (err as { message?: unknown }).message === "string"
      );
    }
    throw new Error(isErrorLike(error) ? error.message : error + "");
  }
}
