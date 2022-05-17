import path from "path";
import os from "os";
import puppeteer, { Browser, FileChooser, Page } from "puppeteer";
import { mkdir, mkdtemp, readFile, writeFile } from "fs/promises";
import ModelEntry, { ModelEntryInput } from "./Models/ModelEntry";
import { existsSync } from "fs";
import util from "util";

const exec = util.promisify(require("child_process").exec);

class ThumbnailGenerator {
	studioUrl: string;
	tempDir: string;
	entryId: string;

	browser: Browser;
	page: Page;

	constructor(studioUrl: string) {
		this.studioUrl = studioUrl;
	}

	public async intializeBrowser() {
		this.tempDir = await mkdtemp(path.join(os.tmpdir(), "stl-gallery"));

		this.browser = await puppeteer.launch({
			headless: false,
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});

		this.page = await this.browser.newPage();

		await this.page.goto(this.studioUrl);

		console.log("[CHROMIUM] Chromium initialized");
	}

	public async uploadModel({ id, model, color }: ModelEntryInput) {
		this.entryId = id;

		const tempModelDirectory = `${this.tempDir}/${this.entryId}`;

		if (!existsSync(tempModelDirectory)) {
			await mkdir(tempModelDirectory, { recursive: true });
		}

		const modelPath = `${tempModelDirectory}/${this.entryId}.stl`;
		await writeFile(modelPath, model);

		const uploadModelFile = async () => {
			const [fileChooser] = await Promise.all([
				this.page.waitForFileChooser(),
				this.page.evaluate(() => {
					//@ts-ignore
					window.STUDIO_UPLOAD_MODEL();
				}),
			]);
			await fileChooser.accept([modelPath]);
		};

		try {
			await uploadModelFile();
		} catch (error) {
			await uploadModelFile();
		}

		// wait for model to load
		await this.page.waitForSelector("#studio-canvas");
		await this.page.waitForTimeout(500);
		await this.page.waitForNetworkIdle();

		if (color) {
			await this.page.evaluate((color) => {
				//@ts-ignore
				window.STUDIO_SET_COLOR(color);
			}, color);
		}
	}

	public async createThumbnail() {
		const thumbnailScreenshotPath = `${this.tempDir}/${this.entryId}/thumbnail.png`;

		await this.page.screenshot({
			path: thumbnailScreenshotPath,
		});

		const thumbnail = await readFile(thumbnailScreenshotPath);

		return thumbnail;
	}

	public async createVideoThumbnail() {
		const videoFramesPath = `${this.tempDir}/${this.entryId}/frames`;

		await this.page.evaluate(() => {
			//@ts-ignore
			return window.STUDIO_RESET_FRAMES();
		});

		await mkdir(videoFramesPath);

		let frame = 0;
		while (true) {
			console.log(this.entryId, "-", frame);
			//@ts-ignore
			const renderDone = await this.page.evaluate(() => {
				//@ts-ignore
				return window.STUDIO_RENDER_DONE;
			});

			if (renderDone) {
				break;
			}

			//@ts-ignore
			await this.page.evaluate(() => window.STUDIO_ROTATE_CAMERA());

			await this.page.screenshot({
				path: `${videoFramesPath}/${String(frame).padStart(4, "0")}.png`,
			});

			frame += 1;
		}

		await exec(`ffmpeg -framerate 30 -pattern_type glob -i '${videoFramesPath}/*.png' \
		-c:v libx264 -crf 15 -pix_fmt yuv420p ${videoFramesPath}/thumbnail.mp4`);

		const videoThumbnail = await readFile(`${videoFramesPath}/thumbnail.mp4`);

		return videoThumbnail;
	}
}

export default ThumbnailGenerator;
