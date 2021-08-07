const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["./src/index.tsx"],
    outfile: "www/assets/index.js",
    bundle: true,
    minify: true,
    platform: "browser",
    sourcemap: true,
    target: "esnext",
  })
  .catch(() => process.exit(1));
