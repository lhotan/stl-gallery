import { Sequelize } from "sequelize";

const sequelize = new Sequelize(process.env.POSTGRES_CONNECTION_STRING);

export { sequelize };
