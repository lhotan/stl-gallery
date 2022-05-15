import { create } from "domain";
import express from "express";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	rm,
	rmSync,
	writeFileSync,
} from "fs";
import { Op } from "sequelize";
import sqlite3 from "sqlite3";
import { Stream } from "stream";
import { v4 as uuidv4 } from "uuid";
import createModelFrames from "./model/createModelFrames";
import ModelEntry from "./Models/ModelEntry";
import ThumbnailGenerator from "./ThumbnailGenerator";

var cors = require("cors");

const app = express();
const port = 8080;

type DefaultData = {
	models: {
		title: string;
		path: string;
		thumbnail: string;
		lowResThumbnail: string;
		color: string;
	}[];
};

app.use(cors());
app.use(express.static("static"));

app.get("/init", async (req, res) => {
	const defaultDataJson: DefaultData = JSON.parse(
		readFileSync("./data/default.json").toString()
	);

	const defaultData = defaultDataJson.models.map((model) => {
		const modelBlobs = readFileSync("./data/" + model.path);

		return {
			title: model.title,
			models: modelBlobs,
			thumbnail: undefined,
			color: model.color,
		};
	});

	await ModelEntry.sync({ force: true });
	for await (const data of defaultData) {
		await ModelEntry.create({
			id: uuidv4(),
			title: data.title,
			model: data.models,
			color: data.color,
		});
	}

	res.send("DONE");
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

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

const thumbnailGenerator = new ThumbnailGenerator(
	"http://localhost:3000/studio"
);

setTimeout(async () => {
	await thumbnailGenerator.intializeBrowser();

	console.log("[THUMBNAIL] Checking if any thumbnails need to be created");

	const entriesWithoutThumbnails = await ModelEntry.findAll({
		attributes: ["id", "color", "title"],
		where: {
			thumbnail: null,
		},
	});

	for await (const entry of entriesWithoutThumbnails) {
		console.log(
			`[THUMBNAIL] Generating thumbnail for ${entry.getDataValue("title")}`
		);

		const modelEntry = await ModelEntry.findOne({
			attributes: ["model"],
			where: {
				id: entry.getDataValue("id"),
			},
		});

		const data = {
			...entry.get(),
			...modelEntry.get(),
		};

		await thumbnailGenerator.uploadModel(data);
		const thumbnail = await thumbnailGenerator.createThumbnail();
		await ModelEntry.update(
			{
				thumbnail,
			},
			{
				where: {
					id: entry.getDataValue("id"),
				},
			}
		);

		console.log(
			`[THUMBNAIL] Done thumbnail for ${entry.getDataValue("title")}`
		);
	}

	console.log(
		"[VIDEO THUMBNAIL] Checking if any video thumbnails need to be created"
	);

	const entriesWithoutVideoThumbnails = await ModelEntry.findAll({
		attributes: ["id", "color", "title"],
		where: {
			videoThumbnail: null,
		},
	});

	for await (const entry of entriesWithoutVideoThumbnails) {
		console.log(
			`[VIDEO THUMBNAIL] Generating video thumbnail for ${entry.getDataValue(
				"title"
			)}`
		);

		const modelEntry = await ModelEntry.findOne({
			attributes: ["model"],
			where: {
				id: entry.getDataValue("id"),
			},
		});

		const data = {
			...entry.get(),
			...modelEntry.get(),
		};

		await thumbnailGenerator.uploadModel(data);
		const videoThumbnail = await thumbnailGenerator.createVideoThumbnail();

		await ModelEntry.update(
			{
				videoThumbnail,
			},
			{
				where: {
					id: entry.getDataValue("id"),
				},
			}
		);

		console.log(
			`[VIDEO THUMBNAIL] Done generating video thumbnail for ${entry.getDataValue(
				"title"
			)}`
		);
	}
}, 2000);
