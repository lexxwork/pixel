const { Sequelize } = require("sequelize");

let sequelize;
const isVercel = process.env.VERCEL === "1";

if (isVercel) {
	sequelize = new Sequelize(
		process.env.DB_DATABASE,
		process.env.DB_USER,
		process.env.DB_PASSWORD,
		{
			host: process.env.DB_HOST,
			dialect: "postgres",
			dialectModule: require("pg"),
			dialectOptions: {
				ssl: true,
			},
			logging: false,
			logQueryParameters: false,
		},
	);
} else {
	const DB_FILE_PATH = "./.data/pixel.db";
	sequelize = new Sequelize({
		dialect: "sqlite",
		storage: DB_FILE_PATH,
		logging: false,
		logQueryParameters: false,
	});
}

module.exports = sequelize;
