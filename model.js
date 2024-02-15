const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");

const Pixel = sequelize.define(
	"pixel",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		pixel_id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			unique: true,
		},
		tag: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{ timestamps: false },
);

const PixelLogs = sequelize.define(
	"pixel_logs",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		headers: {
			type: DataTypes.JSON,
			get() {
				return JSON.parse(this.getDataValue("headers"));
			}
		},
		ip_address: {
			type: DataTypes.STRING,
		},
		pixel_id: {
			type: DataTypes.INTEGER,
			references: {
				model: Pixel,
				key: "id",
			},
		},
		timestamp: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		timestamps: false,
	},
);

PixelLogs.belongsTo(Pixel, { foreignKey: "pixel_id", onDelete: "CASCADE" });

module.exports = { PixelLogs, Pixel };
