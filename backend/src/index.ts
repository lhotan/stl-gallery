import "dotenv/config";
import express from "express";
import path from "path";
import { Stream } from "stream";
import ModelEntry from "./Models/ModelEntry";

var cors = require("cors");

const app = express();
const port = process.env.PORT;

app.use(cors());

app.get("/init", async (req, res) => {
	await ModelEntry.sync({ force: true });
});

app.get("/models", async (req, res) => {
	const entries = await ModelEntry.findAll({
		attributes: ["id", "title", "color", "thumbnail"],
	});

	const entriesWithB64Images = entries.map((entry) => ({
		...entry.get(),
		thumbnail: entry.get("thumbnail")?.toString("base64"),
	}));

	res.json(entriesWithB64Images);
});

app.get("/thumbnail/:id", async (req, res) => {
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

app.get("/model/:id", async (req, res) => {
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

app.post("/model", async (req, res) => {
	await ModelEntry.create({});

	res.sendStatus(200);
});

app.use(express.static(path.join(__dirname, "static")));

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "static/index.html"));
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
