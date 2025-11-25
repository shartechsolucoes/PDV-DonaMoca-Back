// Import the framework and instantiate it
import fastifyJwt from '@fastify/jwt';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import users from './src/routes/users.js';
import fastifyMultipart from '@fastify/multipart';
import path, { dirname } from 'path';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import images from "./src/routes/images.js";
import files from "./src/routes/files.js";
import sales from "./src/routes/sales.js";
import products from "./src/routes/products.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;
const fastify = Fastify({
	logger: true,
});

fastify.register(fastifyMultipart, {
	addToBody: true, // Adiciona os arquivos processados ao corpo da requisição
	limits: {
		fileSize: 10 * 1024 * 1024, // Limite de tamanho de arquivo (10MB)
	},
});

// Imagens de upload geral
fastify.register(fastifyStatic, {
	root: path.join(__dirname, 'public', 'uploads'),
	prefix: '/upload/',
	decorateReply: false,
});

await fastify.register(cors, {
	// put your options here
});
const secret = process.env.SECRET;
// Declare a route
fastify.register(fastifyJwt, {
	secret: secret,
});
fastify.register(users);
fastify.register(images);
fastify.register(files);
fastify.register(sales);
fastify.register(products);

// Run the server!
try {
	await fastify.listen({ port: PORT });
} catch (err) {
	fastify.log.error(err);
	process.exit(1);
}
