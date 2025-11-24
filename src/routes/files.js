import {
    uploadFile,
    getFiles,
    getFile,
    deleteFile,
} from "../controllers/Files/index.js";
import { verifyJwt } from "../middleware/JWTAuth.js";

export default function (fastify, opts, done) {
    // Upload de arquivo
    fastify.post("/file", { preHandler: verifyJwt }, (request, reply) => {
        return uploadFile(request, reply);
    });

    // Listar todos
    fastify.get("/files", { preHandler: verifyJwt }, (request, reply) => {
        return getFiles(request, reply);
    });

    // Buscar por ID
    fastify.get("/file/:id", { preHandler: verifyJwt }, (request, reply) => {
        return getFile(request, reply);
    });
    
    fastify.get('/files/:id/view', async (req, reply) => {
        const { id } = req.params;
        const file = await prisma.files.findUnique({ where: { id: Number(id) } });
        if (!file) return reply.code(404).send({ error: 'Arquivo não encontrado.' });

        // Envia o arquivo com o nome correto e tipo MIME
        return reply.sendFile(file.filename, path.join(__dirname, 'public', 'uploads', 'files', String(file.id)));
    });

    // Deletar
    fastify.delete("/file/:id", { preHandler: verifyJwt }, (request, reply) => {
        return deleteFile(request, reply);
    });

    done();
}
