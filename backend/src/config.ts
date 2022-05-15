import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
	"postgres://postgres:mysecretpassword@localhost:5432/postgres"
);

export { sequelize };
