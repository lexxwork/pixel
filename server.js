const fastify = require('fastify')();
const { PixelLogs } = require('./model');
const sequelize = require('./sequelize');

const PORT = process.env.PORT || 3000;
const PIXEL_IMG = Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');

// Route to serve pixel image and log data
fastify.get('/pixel/:pixelId', async (request, reply) => {
  const pixelId = request.params.pixelId;
  const headersJson = JSON.stringify(request.headers);
  const ip = request.ip;

  try {
    await PixelLogs.create({ headers: headersJson, ip_address: ip, pixel_id: pixelId });
    console.log('Inserted log data into SQLite database');
  } catch (err) {
    console.error('Error inserting data into SQLite database:', err);
  }

  // Set response headers
  reply.header('Content-Type', 'image/gif');
  reply.header('Content-Length', 43);
  reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  reply.header('Pragma', 'no-cache');
  reply.header('Expires', 0);

  // Send the pixel
  reply.send(PIXEL_IMG);
});

// Route to retrieve all logs
fastify.get('/logs', async (request, reply) => {
  try {
    const logs = await PixelLogs.findAll();
    reply.send(logs);
  } catch (err) {
    console.error('Error retrieving logs from the database:', err);
    reply.code(500).send({ error: 'Internal Server Error' });
  }
});

// Route to get logs by pixel id
fastify.get('/logs/:pixelId', async (request, reply) => {
  const pixelId = request.params.pixelId;
  try {
    const logs = await PixelLogs.findAll({ where: { pixel_id: pixelId } });
    reply.send(logs);
  } catch (err) {
    console.error('Error retrieving logs from the database:', err);
    reply.code(500).send({ error: 'Internal Server Error' });
  }
});

// Route to clear all logs
fastify.get('/logs/clear-2o3ds9h4325t34s34', async (request, reply) => {
  try {
    await PixelLogs.destroy({ where: {} });
    reply.send({ message: 'Logs cleared successfully' });
  } catch (err) {
    console.error('Error clearing logs from the database:', err);
    reply.code(500).send({ error: 'Internal Server Error' });
  }
});

// Sync the model with the database and start the server
sequelize.sync().then(() => {
  fastify.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server running on port ${PORT}`);
  });
});
