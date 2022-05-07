import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "fs";
import path from "path";
import os from "os";
import puppeteer from "puppeteer";
import util from "util";
import { readFile, rm } from "fs/promises";

const exec = util.promisify(require("child_process").exec);

const createModelFrames = async (
	id: string,
	model: Buffer,
	color: string
): Promise<{ thumbnail: Buffer; lowResThumbnail: Buffer }> => {
	const tempDir = mkdtempSync(path.join(os.tmpdir(), "stl-gallery"));
	const modelPath = `${tempDir}/${id}.stl`;
	writeFileSync(modelPath, model);

	const browser = await puppeteer.launch({
		headless: false,
	});

	const page = await browser.newPage();

	await page.goto("http://localhost:3000/studio");

	const uploadButton = await page.$("input[type=file]");
	await uploadButton.uploadFile(modelPath);

	// wait for model to load
	await page.waitForTimeout(2000);

	if (color) {
		await page.evaluate((color) => {
			//@ts-ignore
			window.STUDIO_SET_COLOR(color);
		}, color);
	}

	console.log(`[model] Creating thumbnail for ${id}`);

	if (existsSync(`./frames/${id}`)) {
		await rm(`./frames/${id}`, { recursive: true });
	}

	mkdirSync(`./frames/${id}`, { recursive: true });

	let frame = 0;
	while (true) {
		//@ts-ignore
		const renderDone = await page.evaluate(() => {
			//@ts-ignore
			return window.STUDIO_RENDER_DONE;
		});

		if (renderDone) {
			break;
		}

		//@ts-ignore
		await page.evaluate(() => window.STUDIO_ROTATE_CAMERA());

		await page.screenshot({
			path: `./frames/${id}/${String(frame).padStart(8, "0")}.png`,
		});

		frame += 1;
	}

	await browser.close();

	console.log(`[model] Done creating thumbnail for ${id}`);
	console.log(`[model] Stitching thumbnail for ${id}`);
	await exec(`ffmpeg -framerate 30 -pattern_type glob -i './frames/${id}/*.png' \
  -c:v libx264 -crf 15 -pix_fmt yuv420p ./frames/${id}/thumbnail.mp4`);
	console.log(`[model] Done stitching thumbnail for ${id}`);

	const lowResThumbnail = await readFile(`./frames/${id}/00000000.png`);
	const thumbnail = await readFile(`./frames/${id}/thumbnail.mp4`);

	return {
		lowResThumbnail,
		thumbnail,
	};
};

export default createModelFrames;
