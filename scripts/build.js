const { mkdir, rm, cp } = require("fs/promises");
const { chdir } = require("process");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

(async () => {
	await Promise.all([exec("yarn build:frontend"), exec("yarn build:backend")]);

	await rm("app", { recursive: true });

	await Promise.all([
		mkdir("app/static", { recursive: true }),
		mkdir("app", { recursive: true }),
	]);

	await Promise.all([
		cp("frontend/build", "app/static", { recursive: true }),
		cp("backend/build", "app", { recursive: true }),
		cp("backend/package.json", "app/package.json"),
	]);
})();
