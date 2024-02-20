const fastify = require("fastify");
const fs = require("fs");
const path = require("path");

const sequelize = require("../sequelize");
const {
	newPixelId,
	newPixelLog,
	getLogs,
	getLogsByPixelId,
	clearLogs,
	removePixel,
	getPixels,
} = require("../service");

const PIXEL_IMG = Buffer.from(
	"R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
	"base64",
);

const isProduction = process.env.NODE_ENV === "production";
const isVercel = process.env.VERCEL === "1";
const isHTTPS = process.env.HTTPS === "1";
const certsPath = path.join(__dirname, "../.certs");

const server = fastify({
	https: !isHTTPS
		? {
				key: fs.readFileSync(path.join(certsPath, "key.pem")),
				cert: fs.readFileSync(path.join(certsPath, "cert.pem")),
		  }
		: undefined,
});

server.get("/", async (request, reply) => {
	reply.send({
		success: true,
		message: "Pixel API",
	});
});

server.post("/pixel/create", async (request, reply) => {
	const { tag } = request.body;
	const { success, error, pixelId } = await newPixelId({ tag });
	reply.send({ success, error, pixelId });
});

server.get("/pixels", async (request, reply) => {
	const { success, error, pixels } = await getPixels();
	reply.send({ success, error, pixels });
});

server.get("/pixel/:pixelId", async (request, reply) => {
	const pixelId = request.params.pixelId;
	const headersJson = JSON.stringify(request.headers);
	const ip = request.ip;

	reply.header("Content-Type", "image/gif");
	reply.header("Content-Length", 43);
	reply.header("Cache-Control", "no-cache, no-store, must-revalidate");
	reply.header("Pragma", "no-cache");
	reply.header("Expires", 0);
	reply.send(PIXEL_IMG);

	await newPixelLog(pixelId, { headers: headersJson, ip_address: ip });
});

server.get("/pixel/clear-xo3dq9h4v25t34sfk", async (request, reply) => {
	const { success, error, message } = await clearLogs();
	reply.send({ success, error, message });
});

server.get("/pixel/delete/:pixelId", async (request, reply) => {
	const pixelId = request.params.pixelId;
	const { success, error, message } = await removePixel(pixelId);
	reply.send({ success, error, message });
});

server.get("/logs", async (request, reply) => {
	const { success, logs, error } = await getLogs();
	reply.send({ success, data: logs, error });
});

server.get("/logs/:pixelId", async (request, reply) => {
	const pixelId = request.params.pixelId;
	const { success, logs, error } = await getLogsByPixelId(pixelId);
	reply.send({ success, data: logs, error });
});

if (isVercel) {
	module.exports = async (req, res) => {
		try {
			console.log("Running on Vercel");
			await sequelize.sync();
			await server.ready();
			server.server.emit("request", req, res);
		} catch (error) {
			console.error("Error syncing Sequelize models:", error);
			res.status(500).send("Internal Server Error");
		}
	};
} else {
	const PORT = process.env.PORT || 3000;

	sequelize.sync().then(() => {
		server.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
			if (err) {
				console.error(err);
				process.exit(1);
			}
			console.log(`Server running on port ${PORT}`);
		});
	});
}
