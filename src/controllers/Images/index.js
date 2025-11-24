// controllers/imageController.ts
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

export const uploadImage = async (req, res) => {
    const parts = req.parts();

    for await (const part of parts) {
        if (part.file) {
            const last = await prisma.image.findFirst({
                orderBy: { image_id: "desc" },
            });

            const nextId = last ? Number(last.image_id) + 1 : 1;

            const saved = await prisma.image.create({
                data: {
                    image_id: nextId,
                    name: part.filename,
                    legend: part.filename,
                    status: 1,
                    date_added: new Date(),
                },
            });

            // cria pasta com o ID
            const dirPath = path.join("public", "uploads", "images", String(nextId));
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            // caminho final do arquivo dentro da pasta
            const uploadPath = path.join(dirPath, part.filename);

            // salva o arquivo no disco
            const writeStream = fs.createWriteStream(uploadPath);
            part.file.pipe(writeStream);

            await new Promise((resolve, reject) => {
                writeStream.on("finish", resolve);
                writeStream.on("error", reject);
            });

            // monta a URL pública
            const fileUrl = `https://apiv2.moveisdevalor.com.br/upload/images/${nextId}/${part.filename}`;

            res.status(200).send({
                image_id: nextId,
                url: fileUrl,
                legend: part.filename,
            });
        } else {
            res.status(400).send({ error: "Nenhum arquivo encontrado." });
        }
    }
};

export const getImage = async (req, res) => {
    try {
        const { id } = req.params;
        const imageId = Number(id);

        if (isNaN(imageId)) {
            return res.status(400).send({ error: "ID inválido" });
        }

        const image = await prisma.image.findUnique({
            where: { image_id: imageId },
        });

        if (!image) {
            return res.status(404).send({ error: "Imagem não encontrada" });
        }

        // monta a URL pública igual ao upload
        const fileUrl = `https://apiv2.moveisdevalor.com.br/upload/images/${image.image_id}/${image.name}`;

        return res.status(200).send({
            image_id: image.image_id,
            url: fileUrl,
            legend: image.legend,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: "Erro ao buscar imagem" });
    }
};

// UPDATE - Editar legenda, nome ou status
export const updateImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, legend, status } = req.body;

        const updated = await prisma.image.update({
            where: { image_id: Number(id) },
            data: {
                name,
                legend,
                status: status ? Number(status) : undefined,
            },
        });

        res.json({ message: "Imagem atualizada!", image: updated });
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar imagem." });
    }
};

// DELETE - Remover arquivo e registro
export const deleteImage = async (req, res) => {
    try {
        const { id } = req.params;

        const image = await prisma.image.findUnique({
            where: { image_id: Number(id) },
        });

        if (!image) {
            return res.status(404).json({ error: "Imagem não encontrada." });
        }

        // Remover arquivo físico
        const filePath = path.join(uploadDir, image.name);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Remover registro no banco
        await prisma.image.delete({
            where: { image_id: Number(id) },
        });

        res.json({ message: "Imagem deletada com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar imagem." });
    }
};
