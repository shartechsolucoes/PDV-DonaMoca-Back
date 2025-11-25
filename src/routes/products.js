import {
	getProducts,
	createProduct,
	updateProduct,
	getProduct,
	deleteProduct
} from '../controllers/Products/index.js';
import { verifyJwt } from '../middleware/JWTAuth.js';

export default function (fastify, opts, done) {
	fastify.get('/products', { onRequest: [verifyJwt] }, (request, reply) => {
		return getProducts(request, reply);
	});
	fastify.post('/product', { onRequest: [verifyJwt] }, (request, reply) => {
		return createProduct(request, reply);
	});
	fastify.put('/product/:id', { onRequest: [verifyJwt] }, (request, reply) => {
		return updateProduct(request, reply);
	});
	fastify.get('/product/:id', { onRequest: [verifyJwt] }, (request, reply) => {
		return getProduct(request, reply);
	});
	fastify.delete('/product/:id', { onRequest: [verifyJwt] }, (request, reply) => {
		return deleteProduct(request, reply);
	});
	done();
}

