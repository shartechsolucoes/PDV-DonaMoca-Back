import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadDir = path.join(__dirname, "../../../public/uploads/files");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Upload de arquivo (PDF, Word, Excel)
export const uploadFile = async (req, reply) => {
    try {
        const parts = req.parts();

        for await (const part of parts) {
            if (part.file) {
                const extension = path.extname(part.filename);
                const safeName = part.filename.replace(/\s+/g, "_");

                const last = await prisma.files.findFirst({
                    orderBy: { id: "desc" },
                });
                const nextId = last ? last.id + 1 : 1;

                // Cria pasta por ID
                const dirPath = path.join(uploadDir, String(nextId));
                if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

                const uploadPath = path.join(dirPath, safeName);
                const writeStream = fs.createWriteStream(uploadPath);
                part.file.pipe(writeStream);

                await new Promise((resolve, reject) => {
                    writeStream.on("finish", resolve);
                    writeStream.on("error", reject);
                });

                // pega o tamanho real
                const stats = fs.statSync(uploadPath);
                const fileSize = stats.size;

                const fileUrl = `http://127.0.0.1:8758/upload/files/${nextId}/${safeName}`;

                const saved = await prisma.files.create({
                    data: {
                        originalName: part.filename,
                        filename: safeName,
                        mimeType: extension,
                        size: fileSize,
                        path: uploadPath,
                        url: fileUrl,
                        createdAt: new Date(),
                    },
                });

                return reply.code(200).send(saved);
            }
        }

        return reply.code(400).send({ error: "Nenhum arquivo enviado." });
    } catch (err) {
        console.error(err);
        reply.code(500).send({ error: "Erro no upload do arquivo." });
    }
};


// ✅ Listar arquivos
export const getFiles = async (req, reply) => {
    try {
        const files = await prisma.files.findMany({
            orderBy: { createdAt: "desc" },
        });
        reply.send(files);
    } catch (err) {
        reply.code(500).send({ error: "Erro ao listar arquivos." });
    }
};

// ✅ Obter um arquivo
export const getFile = async (req, reply) => {
    try {
        const { id } = req.params;
        const file = await prisma.files.findUnique({
            where: { file_id: Number(id) },
        });

        if (!file) return reply.code(404).send({ error: "Arquivo não encontrado." });
        reply.send(file);
    } catch (err) {
        reply.code(500).send({ error: "Erro ao buscar arquivo." });
    }
};

// ✅ Deletar arquivo
export const deleteFile = async (req, reply) => {
    try {
        const { id } = req.params;
        const fileId = Number(id);

        const file = await prisma.files.findUnique({ where: { id: fileId } });
        if (!file) return reply.code(404).send({ error: "Arquivo não encontrado." });

        // Caminho físico
        const filePath = path.join(uploadDir, String(fileId), file.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        // Remove diretório se vazio
        const dirPath = path.join(uploadDir, String(fileId));
        if (fs.existsSync(dirPath) && fs.readdirSync(dirPath).length === 0) {
            fs.rmdirSync(dirPath);
        }

        // Remove registro no banco
        await prisma.files.delete({ where: { id: fileId } });

        return reply.code(200).send({ message: "Arquivo deletado com sucesso." });
    } catch (err) {
        console.error(err);
        return reply.code(500).send({ error: "Erro ao deletar arquivo." });
    }
};
