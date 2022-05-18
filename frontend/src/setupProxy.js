module.exports = function (app) {
	// this is required to make ffmpeg work, unfortunately this breaks auth0 locally 🤷‍♂️
	app.use(function (request, response, next) {
		response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
		response.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
		next();
	});
};
