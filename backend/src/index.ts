import express from "express";
import sqlite3 from "sqlite3";

const db = new sqlite3.Database(":memory:");

const app = express();
const port = 4444;

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
