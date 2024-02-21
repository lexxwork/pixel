const { PixelLogs, Pixel } = require("./model");

const newPixelId = async ({ tag }) => {
	if (!tag) {
		return { success: false, error: "tag is required" };
	}
	try {
		const pixel = await Pixel.create({ tag });
		return { success: true, pixelId: pixel.pixel_id };
	} catch (error) {
		console.error("Error creating new pixel:", error);
		return { success: false, error: "Internal Server Error" };
	}
};
const newPixelLog = async (pixelId, { headers, ip_address }) => {
	const pixel = await getPixelId(pixelId);
	if (!pixel) {
		return { success: false, error: "Pixel not found" };
	}
	try {
		const newPixelLog = await PixelLogs.create({
			headers,
			ip_address,
			pixel_id: pixel.id,
		});
		return { success: true, id: newPixelLog.id };
	} catch (error) {
		console.error("Error creating new pixel log:", error);
		return { success: false, error };
	}
};

const getPixels = async () => {
	try {
		const pixels = (await Pixel.findAll()).map((pixel) => ({
			pixel_id: pixel.pixel_id,
			tag: pixel.tag,
		}));
		return { success: true, pixels };
	} catch (error) {
		console.error("Error retrieving pixels from the database:", error);
		return { success: false, error: "Internal Server Error" };
	}
};
const getLogs = async (where = {}) => {
	try {
		const logs = (
			await PixelLogs.findAll({
				where,
				include: { model: Pixel, attributes: ["pixel_id"] },
			})
		).map((log) => ({
			headers: log.headers,
			ip_address: log.ip_address,
			timestamp: log.timestamp,
			pixel_id: log.pixel.pixel_id,
		}));
		return { success: true, logs };
	} catch (error) {
		console.error("Error retrieving logs from the database:", error);
		return { success: false, error: "Internal Server Error" };
	}
};
const getPixelId = async (pixelId) => {
	const pixel = await Pixel.findOne({ where: { pixel_id: pixelId } });
	return pixel;
};

const getLogsByPixelId = async (pixelId) => {
	const pixel = await getPixelId(pixelId);
	if (!pixel) {
		return { success: false, error: "Pixel not found" };
	}
	try {
		return getLogs({ pixel_id: pixel.id });
	} catch (error) {
		console.error("Error retrieving logs by pixel id:", error);
		return {
			success: false,
			error: `Error retrieving logs by pixel id ${pixelId}`,
		};
	}
};

const clearLogsByPixelId = async (pixelId) => {
	const pixel = await getPixelId(pixelId);
	if (!pixel) {
		return { success: false, error: "Pixel not found" };
	}
	try {
		const removed = await PixelLogs.destroy({ where: { pixel_id: pixel.id } });
		return {
			success: true,
			message: removed ? "Logs cleared successfully" : "No logs to remove",
		};
	} catch (error) {
		console.error(`Error clearing logs by pixel id ${pixelId}:`, error);
		return {
			success: false,
			error: `Error clearing logs by pixel id ${pixelId}`,
		};
	}
};

const clearPixels = async () => {
	try {
		await Pixel.destroy({ where: {} });
		return { success: true, message: "Logs cleared successfully" };
	} catch (error) {
		console.error("Error removing pixels from the database:", error);
		return { success: false, error: "Internal Server Error" };
	}
};

const removePixel = async (pixelId) => {
	try {
		const removed = await Pixel.destroy({ where: { id: pixelId } });
		if (!removed) {
			return { success: false, error: "Pixel not found" };
		}
		return { success: true, message: "Pixel removed successfully" };
	} catch (error) {
		console.error("Error removing pixel from the database:", error);
		return { success: false, error: "Internal Server Error" };
	}
};

module.exports = {
	newPixelId,
	newPixelLog,
	getPixels,
	getLogs,
	getPixelId,
	getLogsByPixelId,
	clearPixels,
	removePixel,
	clearLogsByPixelId,
};
