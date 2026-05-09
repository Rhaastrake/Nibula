const esbuild = require("esbuild");
const glob = require("glob");
const Image = require("@11ty/eleventy-img");
const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = "c:/laragon/www/Berna-Stencil-out";

module.exports = function (eleventyConfig) {

  // =====================================================
  // ESBUILD — Bundles and minifies JS files before build
  // =====================================================
  eleventyConfig.on("eleventy.before", async () => {
    const entryPoints = glob.sync("src/js/pages/*.js");
    await esbuild.build({
      entryPoints,
      bundle: true,
      outdir: `${OUTPUT_DIR}/js/pages`,
      minify: true,
    });
  });

  // =====================================================
  // PASSTHROUGH — Static files
  // =====================================================
  eleventyConfig.addPassthroughCopy("src/.htaccess");
  eleventyConfig.addPassthroughCopy("src/api");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  eleventyConfig.addPassthroughCopy({
    // Bootstrap
    "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js": "js/bootstrap.bundle.min.js",
    "node_modules/bootstrap-icons/font/fonts": "css/fonts",

    // Foundation
    // "node_modules/foundation-sites/dist/js/foundation.min.js": "js/foundation.min.js",

    // UIkit
    // "node_modules/uikit/dist/js/uikit.min.js": "js/uikit.min.js",
    // "node_modules/uikit/dist/js/uikit-icons.min.js": "js/uikit-icons.min.js",

    // Bulma — CSS only, no JS passthrough needed
  });

  eleventyConfig.addPassthroughCopy({ "src/data/lang.json": "data/lang.json" });

  // =====================================================
  // ELEVENTY IMAGE — Responsive images
  // =====================================================
  eleventyConfig.addShortcode("image", async function (src, alt) {
    let metadata = await Image(src, {
      widths: [320, 480, 720, 1280, 1920, 2048, 2560, 3840, 4096, 7680],
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
      output: OUTPUT_DIR,
      includes: "components",
      layouts: "components/layouts",
      data: "data",
    },
  };
};