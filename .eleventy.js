const esbuild = require("esbuild");
const glob = require("glob");
const Image = require("@11ty/eleventy-img");
const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = "_site"; // ← unica costante da modificare

module.exports = function (eleventyConfig) {

  // =====================================================
  // ESBUILD — Bundles and minifies JS files before build
  // =====================================================
  eleventyConfig.on("eleventy.before", async () => {
    const entryPoints = glob.sync("src/js/pages/*.js");
    await esbuild.build({
      entryPoints,
      bundle: true,
      outdir: `${OUTPUT_DIR}/js/pages`, // ← era "_site/js/pages"
      minify: true,
    });
  });

  // =====================================================
  // PASSTHROUGH — Static files
  // =====================================================
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/php/!(configExample.php)");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  eleventyConfig.addPassthroughCopy({
    "node_modules/bootstrap-icons/font/fonts": "css/fonts",
    "node_modules/frameworks/bootstrap/dist/js/bootstrap.bundle.min.js": "js/bootstrap.bundle.min.js",
  });

  eleventyConfig.addPassthroughCopy({ "src/_data/lang.json": "_data/lang.json" });

  // =====================================================
  // ELEVENTY IMAGE — Responsive images
  // =====================================================
  eleventyConfig.addShortcode("image", async function (src, alt) {
    let metadata = await Image(src, {
      widths: require("./src/_data/site.json").image_width,
      formats: ["webp", "jpeg"],
      outputDir: `${OUTPUT_DIR}/assets/images/`,
      urlPath: "/assets/images/",
    });

    return Image.generateHTML(metadata, {
      alt,
      sizes: "(max-width: 768px) 100vw, 50vw",
      loading: "lazy",
      decoding: "async",
    });
  });

  // =====================================================
  // WATCH & DIRECTORY CONFIG
  // =====================================================
  eleventyConfig.addWatchTarget("./src/scss");

  return {
    dir: {
      input: "src",
      output: OUTPUT_DIR, // ← mancava completamente
      includes: "components",
      layouts: "layouts",
    },
  };
};