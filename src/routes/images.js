import {
    uploadImage,
    getImage
} from '../controllers/Images/index.js';
import { verifyJwt } from '../middleware/JWTAuth.js';

export default function (fastify, opts, done) {
    fastify.post('/image', (request, reply) => {
        return uploadImage(request, reply);
    });

    fastify.get('/image/:id', (request, reply) => {
        return getImage(request, reply);
    });

    done();
}
