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
import sqlite3 from "sqlite3";
import { Stream } from "stream";
import { v4 as uuidv4 } from "uuid";
import createModelFrames from "./model/createModelFrames";

var cors = require("cors");
//rmSync("./sqlite.db");
const db = new sqlite3.Database("./sqlite.db");

process.setMaxListeners(Infinity);

const app = express();
const port = 4444;

type DefaultData = {
	models: {
		title: string;
		path: string;
		thumbnail: string;
		lowResThumbnail: string;
		color: string;
	}[];
};

const defaultDataJson: DefaultData = JSON.parse(
	readFileSync("./data/default.json").toString()
);

const defaultData = defaultDataJson.models.map((model) => {
	const modelBlobs = readFileSync("./data/" + model.path);

	return {
		title: model.title,
		models: modelBlobs,
		thumbnail: undefined,
		lowResThumbnail: undefined,
		color: model.color,
	};
});

/* db.serialize(() => {
	db.run(
		"CREATE TABLE models (id TEXT, title TEXT, model BLOB, thumbnail BLOB, lowResThumbnail BLOB, color TEXT)"
	);

	const stmt = db.prepare(
		"INSERT INTO models(id,title,model,color) VALUES(?,?,?,?)"
	);

	defaultData.forEach((data) => {
		const id = uuidv4();
		stmt.run(id, data.title, data.models, data.color);
	});

	stmt.finalize();
});
 */
app.use(cors());

app.get("/models", (req, res) => {
	db.all(
		"SELECT id, title, model, lowResThumbnail, color FROM models",
		(err, row) => {
			res.json([
				...row.map(({ id, title, lowResThumbnail, color }) => ({
					id,
					title,
					thumbnail: lowResThumbnail.toString("base64"),
					color,
				})),
			]);
		}
	);
});

app.get("/thumbnail/:id", (req, res) => {
	const id = req.params["id"];

	// sql injection 🎉
	db.all(`SELECT thumbnail FROM models WHERE id = '${id}'`, (_, r) => {
		const row = r[0];

		const readStream = new Stream.PassThrough();
		readStream.end(row.thumbnail);

		res.set("Content-disposition", "attachment; filename=" + id + ".mp4");
		res.set("Content-Type", "text/plain");

		readStream.pipe(res);
	});
});

app.get("/model/:id", (req, res) => {
	const id = req.params["id"];

	// sql injection (for some reason I can't prepare statement with ID here)🎉
	db.all(`SELECT title, model FROM models WHERE id = '${id}'`, (_, r) => {
		const row = r[0];

		const readStream = new Stream.PassThrough();
		readStream.end(row.model);

		res.set("Content-disposition", "attachment; filename=" + id + ".stl");
		res.set("Content-Type", "text/plain");

		readStream.pipe(res);
	});
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

setTimeout(async () => {
	const dbRows = await new Promise<any[]>((resolve) => {
		db.all("SELECT id,model,thumbnail,color FROM models", (err, row) => {
			resolve(row);
		});
	});

	for await (const row of dbRows) {
		if (!row.thumbnail) {
			const { thumbnail, lowResThumbnail } = await createModelFrames(
				row.id,
				row.model,
				row.color
			);

			const stmt = db.prepare(
				`UPDATE models SET thumbnail = ?, lowResThumbnail = ? WHERE id = ?;`
			);

			stmt.run(thumbnail, lowResThumbnail, row.id);

			stmt.finalize();
		}
	}
}, 2000);
