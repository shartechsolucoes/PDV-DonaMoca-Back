import {
	getSales,
	createSale,
	updateSale,
	getSale,
	deleteSale
} from '../controllers/Sales/index.js';
import { verifyJwt } from '../middleware/JWTAuth.js';

export default function (fastify, opts, done) {
	fastify.get('/sales', { onRequest: [verifyJwt] }, (request, reply) => {
		return getSales(request, reply);
	});
	fastify.post('/sale', { onRequest: [verifyJwt] }, (request, reply) => {
		return createSale(request, reply);
	});
	fastify.put('/sale/:id', { onRequest: [verifyJwt] }, (request, reply) => {
		return updateSale(request, reply);
	});
	fastify.get('/sale/:id', { onRequest: [verifyJwt] }, (request, reply) => {
		return getSale(request, reply);
	});
	fastify.delete('/sale/:id', { onRequest: [verifyJwt] }, (request, reply) => {
		return deleteSale(request, reply);
	});
	done();
}

