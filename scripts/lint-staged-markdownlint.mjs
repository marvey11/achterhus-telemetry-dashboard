import { main } from "markdownlint-cli2";
import { relative, resolve, sep } from "node:path";
import process from "node:process";

const markdownFiles = process.argv.slice(2).filter((file) => {
  const relativePath = relative(process.cwd(), resolve(file))
    .split(sep)
    .join("/");
  return (
    relativePath.endsWith(".md") &&
    relativePath !== ".github/skills" &&
    !relativePath.startsWith(".github/skills/")
  );
});

if (markdownFiles.length > 0) {
  process.exitCode = await main({
    argv: markdownFiles,
    logMessage: (message) => process.stdout.write(`${message}\n`),
    logError: (message) => process.stderr.write(`${message}\n`),
    allowStdin: false,
  });
}
