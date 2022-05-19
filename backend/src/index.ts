import "dotenv/config";
import express from "express";
import path from "path";
import { Stream } from "stream";
import { v4 as uuidv4 } from "uuid";
import ModelEntry from "./Models/ModelEntry";
import multer from "multer";
import { createProxyMiddleware } from "http-proxy-middleware";
import { readFileSync } from "fs";
import http from "http";
import https from "https";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

var cors = require("cors");

const app = express();
const port = process.env.PORT;
const httpsPort = process.env.SSL_PORT;

// Certificate
const privateKey = readFileSync(
	"/etc/letsencrypt/live/gallery.lhotan.net/privkey.pem",
	"utf8"
);
const certificate = readFileSync(
	"/etc/letsencrypt/live/gallery.lhotan.net/cert.pem",
	"utf8"
);
const ca = readFileSync(
	"/etc/letsencrypt/live/gallery.lhotan.net/chain.pem",
	"utf8"
);

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca,
};

app.use(cors());

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

app.get("/api/init", async (req, res) => {
	await ModelEntry.sync({ force: true });
	res.send(200);
});

app.get("/api/models", async (req, res) => {
	const entries = await ModelEntry.findAll({
		attributes: ["id", "title", "color", "thumbnail"],
	});

	const entriesWithB64Images = entries.map((entry) => ({
		...entry.get(),
		thumbnail: entry.get("thumbnail")?.toString("base64"),
	}));

	res.json(entriesWithB64Images);
});

app.get("/api/thumbnail/:id", async (req, res) => {
	const id = req.params["id"];

	const foundEntry = await ModelEntry.findOne({
		attributes: ["videoThumbnail"],
		where: {
			id,
		},
	});

	if (foundEntry) {
		const readStream = new Stream.PassThrough();

		readStream.end(foundEntry.getDataValue("videoThumbnail"));

		res.set("Content-disposition", "attachment; filename=" + id + ".stl");
		res.set("Content-Type", "text/plain");

		readStream.pipe(res);
	} else {
		res.sendStatus(404);
	}
});

app.get("/api/model/:id", async (req, res) => {
	const id = req.params["id"];

	const foundEntry = await ModelEntry.findOne({
		attributes: ["model"],
		where: {
			id,
		},
	});

	if (foundEntry) {
		const readStream = new Stream.PassThrough();

		readStream.end(foundEntry.getDataValue("model"));

		res.set("Content-disposition", "attachment; filename=" + id + ".stl");
		res.set("Content-Type", "text/plain");
		res.set("Content-Length", `${foundEntry.getDataValue("model").byteLength}`);

		readStream.pipe(res);
	} else {
		res.sendStatus(404);
	}
});

const uploadFields = upload.fields([
	{ name: "model", maxCount: 1 },
	{ name: "thumbnail", maxCount: 1 },
	{ name: "videoThumbnail", maxCount: 1 },
]);

app.post("/api/model", uploadFields, async (req, res) => {
	const { title, color } = req.body as { title: string; color: string };
	console.log(req.files, req.body);

	const model = req.files["model"][0] as Express.Multer.File;
	const thumbnail = req.files["thumbnail"][0] as Express.Multer.File;
	const videoThumbnail = req.files["videoThumbnail"][0] as Express.Multer.File;

	await ModelEntry.create({
		id: uuidv4(),
		title,
		color,
		model: model.buffer,
		thumbnail: thumbnail.buffer,
		videoThumbnail: videoThumbnail.buffer,
	});

	res.sendStatus(200);
});

app.use(express.static(path.join(__dirname, "static")));

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "static/index.html"));
});

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(port, () => {
	console.log(`HTTP Server running on port ${port}`);
});

httpsServer.listen(httpsPort, () => {
	console.log(`HTTPS Server running on port ${httpsPort}`);
});
