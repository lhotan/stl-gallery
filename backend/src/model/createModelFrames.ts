import puppeteer from "puppeteer";

const createModelFrames = async () => {
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();
	await page.goto("http://localhost:3000/studio");

	const uploadButton = await page.$("input[type=file]");
	await uploadButton.uploadFile("./benchy.stl");

	// wait for model to load
	await page.waitForTimeout(2000);

	let frame = 0;
	while (true) {
		await page.waitForSelector("#button-rotate");
		const doneButton = await page.$("#button-done");

		if (doneButton) {
			break;
		}

		const rotateButton = await page.$("#button-rotate");
		await rotateButton.click();
		await page.screenshot({
			path: `frames/${String(frame).padStart(8, "0")}.png`,
		});

		frame += 1;
	}

	await browser.close();
};
