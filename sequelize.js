const { Sequelize } = require("sequelize");

let sequelize;

console.log(process.env.NODE_ENV);
console.log(process.env.DB_DATABASE);
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);
console.log(process.env.DB_HOST);

if (process.env.NODE_ENV === "production") {
	sequelize = new Sequelize(
		process.env.DB_DATABASE,
		process.env.DB_USER,
		process.env.DB_PASSWORD,
		{
			host: process.env.DB_HOST,
			dialect: "postgres",
			dialectOptions: {
				ssl: true,
			},
		},
	);
} else {
	const DB_FILE_PATH = "./.data/pixel.db";
	sequelize = new Sequelize({
		dialect: "sqlite",
		storage: DB_FILE_PATH,
	});
}

module.exports = sequelize;
