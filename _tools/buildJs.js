const esbuild = require("esbuild");
const glob = require("glob");
const path = require("path");
const pkg = require("../package.json");

const isWatch = process.argv.includes("--watch");
const outputDir = pkg.outputDir || "out";

const jsFiles = glob.sync("src/frontend/js/pages/*.js");
const tsFiles = glob.sync("src/frontend/ts/pages/*.ts");
const entryPoints = [...jsFiles, ...tsFiles];

if (entryPoints.length === 0) {
  process.exit(0);
}

const options = {
  entryPoints,
  bundle: true,
  outdir: path.join(outputDir, "js/pages"),
  minify: !isWatch,
};

if (isWatch) {
  esbuild.context(options).then(ctx => ctx.watch()).catch(() => process.exit(1));
} else {
  esbuild.build(options).catch(() => process.exit(1));
}