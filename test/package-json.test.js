import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("check script runs all verification commands", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  const checkCommands = packageJson.scripts.check.split(" && ");

  assert.deepEqual(checkCommands, [
    "npm run build",
    "npm run lint",
    "npm run format:check",
    "npm run typecheck",
    "npm test",
  ]);
});

test("package is the owned @rlch/lavish, private, with a `lavish` bin", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

  assert.equal(packageJson.name, "@rlch/lavish");
  assert.equal(packageJson.private, true);
  assert.equal(packageJson.bin.lavish, "dist/cli.mjs");
  assert.ok(packageJson.files.includes("dist"));
});

test("build copies local design assets for artifact injection", async () => {
  const buildScript = await readFile(new URL("../scripts/build.js", import.meta.url), "utf8");

  assert.match(buildScript, /daisyui\.css/);
  assert.match(buildScript, /daisyui-themes\.css/);
  assert.match(buildScript, /tailwindcss-browser\.js/);
});

test("package metadata points at the rlch/lavish repository", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

  assert.equal(packageJson.repository.url, "git+https://github.com/rlch/lavish.git");
  assert.equal(packageJson.bugs.url, "https://github.com/rlch/lavish/issues");
  assert.equal(packageJson.homepage, "https://github.com/rlch/lavish#readme");
});

test("no telemetry env remains in the build", async () => {
  const buildScript = await readFile(new URL("../scripts/build.js", import.meta.url), "utf8");

  assert.doesNotMatch(buildScript, /UMAMI/i);
});
