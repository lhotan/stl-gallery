import "dotenv/config";
import express from "express";
import path from "path";
import { Stream } from "stream";
import { v4 as uuidv4 } from "uuid";
import ModelEntry from "./Models/ModelEntry";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

var cors = require("cors");

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json({ limit: "100MB" }));

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

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
