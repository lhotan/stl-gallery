const { mkdir, rm, cp } = require("fs/promises");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

(async () => {
	await Promise.all([exec("yarn build:frontend"), exec("yarn build:backend")]);

	await rm("app", { recursive: true });

	await Promise.all([
		mkdir("app/frontend", { recursive: true }),
		mkdir("app/backend", { recursive: true }),
	]);

	await Promise.all([
		cp("frontend/build", "app/frontend", { recursive: true }),
		cp("backend/build", "app/backend", { recursive: true }),
	]);
})();
