const esbuild = require("esbuild");
const http = require("http");

// Start esbuild's server on a random local port
esbuild
  .serve(
    {
      servedir: __dirname,
      port: 3002,
    },
    {
      entryPoints: ["./src/index.tsx"],
      outfile: "www/assets/index.js",
      bundle: true,
      platform: "browser",
      sourcemap: true,
      target: "esnext",
    }
  )
  .then((result) => {
    // The result tells us where esbuild's local server is
    const { host, port } = result;

    // Then start a proxy server on port 3000
    http
      .createServer((req, res) => {
        const esBuildOptions = {
          hostname: host,
          port: port,
          path: "/www/" + req.url,
          method: req.method,
          headers: req.headers,
        };

        const backendOptions = {
          hostname: host,
          port: 8000,
          path: req.url,
          method: req.method,
          headers: req.headers,
        };

        const backendReq = http.request(backendOptions, (backendRes) => {
          res.writeHead(backendRes.statusCode, backendRes.headers);
          backendRes.pipe(res, { end: true });
        });

        const esBuildReq = http.request(esBuildOptions, (esBuildRes) => {
          res.writeHead(esBuildRes.statusCode, esBuildRes.headers);
          esBuildRes.pipe(res, { end: true });
        });

        // Forward API requests to backend
        if (req.url.startsWith("/api/v1")) {
          req.pipe(backendReq, { end: true });
        } else {
          req.pipe(esBuildReq, { end: true });
        }
      })
      .listen(3001);

    console.log(`Front-end dev server listening on ${host}:${3001}`);
  });
