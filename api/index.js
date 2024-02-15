const fastify = require("fastify")();
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

fastify.get("/", async (request, reply) => {
	reply.send({
		success: true,
		message: "Pixel API",
	})
})

fastify.post("/pixel/create", async (request, reply) => {
	const { tag } = request.body;
	const { success, error, pixelId } = await newPixelId({ tag });
	reply.send({ success, error, pixelId });
});

fastify.get("/pixels", async (request, reply) => {
	const { success, error, pixels } = await getPixels();
	reply.send({ success, error, pixels });
});

fastify.get("/pixel/:pixelId", async (request, reply) => {
	const pixelId = request.params.pixelId;
	const headersJson = JSON.stringify(request.headers);
	const ip = request.ip;
	const { success, error } = await newPixelLog(pixelId, {
		headers: headersJson,
		ip_address: ip,
	});
	if (!success) {
		reply.code(403).send({ error });
		return;
	}
	reply.header("Content-Type", "image/gif");
	reply.header("Content-Length", 43);
	reply.header("Cache-Control", "no-cache, no-store, must-revalidate");
	reply.header("Pragma", "no-cache");
	reply.header("Expires", 0);

	reply.send(PIXEL_IMG);
});

fastify.get("/pixel/clear-xo3dq9h4v25t34sfk", async (request, reply) => {
	const { success, error, message } = await clearLogs();
	reply.send({ success, error, message });
});

fastify.get("/pixel/delete/:pixelId", async (request, reply) => {
	const pixelId = request.params.pixelId;
	const { success, error, message } = await removePixel(pixelId);
	reply.send({ success, error, message });
});

fastify.get("/logs", async (request, reply) => {
	const { success, logs, error } = await getLogs();
	reply.send({ success, data: logs, error });
});

fastify.get("/logs/:pixelId", async (request, reply) => {
	const pixelId = request.params.pixelId;
	const { success, logs, error } = await getLogsByPixelId(pixelId);
	reply.send({ success, data: logs, error });
});

module.exports = async (req, res) => {
  try {
    await sequelize.sync();
    await fastify.ready();
    fastify.server.emit('request', req, res);
  } catch (error) {
    console.error('Error syncing Sequelize models:', error);
    res.status(500).send('Internal Server Error');
  }
};

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  sequelize.sync().then(() => {
  	fastify.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  		if (err) {
  			console.error(err);
  			process.exit(1);
  		}
  		console.log(`Server running on port ${PORT}`);
  	});
  });
}