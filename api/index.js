const fastify = require("fastify");
const fs = require("fs");
const path = require("path");

const sequelize = require("../sequelize");
const {
	newPixelId,
	newPixelLog,
	getLogs,
	getLogsByPixelId,
	clearPixels,
	removePixel,
	getPixels,
	clearLogsByPixelId,
} = require("../service");

const PIXEL_IMG = Buffer.from(
	"R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
	"base64",
);

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || "";
const IS_VERCEL = process.env.VERCEL === "1";
const IS_HTTPS = process.env.HTTPS === "1";
const CERT_PATH = path.join(__dirname, "../.certs");

const server = fastify({
	https: IS_HTTPS
		? {
				key: fs.readFileSync(path.join(CERT_PATH, "key.pem")),
				cert: fs.readFileSync(path.join(CERT_PATH, "cert.pem")),
		  }
		: undefined,
});

server.addHook("onRequest", (request, reply, done) => {
	if (request.url !== "/") {
		const apiKey = request.query?.api_key;
		if (API_KEY && apiKey !== API_KEY) {
			reply.code(401).send({ success: false, error: "Unauthorized!" });
		}
	}
	done();
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

server.get("/pixel/clear", async (request, reply) => {
	const { success, error, message } = await clearPixels();
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

server.get("/logs/:pixelId/clear", async (request, reply) => {
	const pixelId = request.params.pixelId;
	const { success, message, error } = await clearLogsByPixelId(pixelId);
	reply.send({ success, message, error });
});

if (IS_VERCEL) {
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
	sequelize.sync().then(() => {
		server.listen({ host: HOST, port: PORT }, (err) => {
			if (err) {
				console.error(err);
				process.exit(1);
			}
			console.log(`Server running on  http://${HOST}:${PORT}`);
		});
	});
}
