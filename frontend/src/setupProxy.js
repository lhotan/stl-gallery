const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
	app.use(
		"/proxy/:url",
		createProxyMiddleware({
			changeOrigin: true,
			pathRewrite: { "^/proxy.*": "" },
			router: (req) => {
				return req.params.url;
			},
		})
	);

	// this is required to make SharedArrayBuffer that ffmpeg uses work, everything needs to be on the same origin
	app.use(function (request, response, next) {
		response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
		response.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
		next();
	});

	// the dev API has to be on the same origin because of previously set headers
	app.use(
		"/api",
		createProxyMiddleware({
			target: "http://localhost:8080",
			changeOrigin: true,
		})
	);
};
