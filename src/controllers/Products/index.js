import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import { startOfDay, endOfDay } from "date-fns";

const prisma = new PrismaClient();

export const getProducts = async (req, res) => {
    try {
        const Products = await prisma.products.findMany({
            where: {
                deleteAt: null
            },
            orderBy: {
                createAt: 'desc'
            }
        });

        return res.send(Products);
    } catch (err) {
        console.error("Erro ao buscar:", err);
        return res.status(500).send({
            error: "Erro ao buscar",
            message: err.message,
            code: err.code,
        });
    }
};
export const createProduct = async (req, res) => {

    // Validação simples dos parâmetros
    if (!req.body.cod || !req.body.name) {
        return res.status(400).send({
            error: "Parâmetros inválidos",
            message: "cod e nome são obrigatórios"
        });
    }

    try {
        // Criando a venda no banco de dados
        const product = await prisma.products.create({
            data: {
                cod: req.body.cod,
                name: req.body.name,
                type: req.body.type,
                description: req.body.description,
                obs: req.body.obs,
                cost: req.body.cost,
                value: req.body.value,
                status: req.body.status,
                image_id: req.body.image_id,
                createAt: new Date(),
                updateAt: new Date(),
            }
        });

        // Retornando a venda criada
        return res.status(201).send(product);

    } catch (err) {
        console.error("Erro ao criar:", err);
        return res.status(500).send({
            error: "Erro ao criar",
            message: err.message,
            code: err.code,
        });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).send({
            error: "Parâmetros inválidos",
            message: "ID da venda é obrigatório"
        });
    }

    try {
        const updatedProduct = await prisma.products.update({
            where: { id: Number(id) },
            data: {
                cod: req.body.cod,
                name: req.body.name,
                type: req.body.type,
                description: req.body.description,
                obs: req.body.obs,
                cost: req.body.cost,
                value: req.body.value,
                status: req.body.status,
                imageId: req.body.imageId,
                updateAt: new Date()
            }
        });

        return res.send(updatedProduct);
    } catch (err) {
        console.error("Erro ao atualizar:", err);
        return res.status(500).send({
            error: "Erro ao atualizar",
            message: err.message,
            code: err.code,
        });
    }
};
export const getProduct = async (request, reply) => {
    try {
        const id = parseInt(request.params.id);
        if (isNaN(id)) return reply.status(400).send({ message: "ID inválido" });

        const product = await prisma.products.findUnique({
            where: { id: id },
        });

        if (!product) return reply.status(404).send({ message: "Não encontrado" });

        return reply.status(200).send(product);
    } catch (error) {
        console.error("Erro ao buscar:", error);
        return reply.status(500).send({ message: "Erro ao buscar", error });
    }
};
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Atualiza o campo deleteAt com a data/hora atual
        const product = await prisma.products.update({
            where: { id: Number(id) },
            data: {
                deleteAt: new Date()
            }
        });

        return res.send({
            message: "Marcada como excluída com sucesso.",
            product
        });

    } catch (err) {
        console.error("Erro ao marcar como excluída:", err);
        return res.status(500).send({
            error: "Erro ao marcar como excluída.",
            message: err.message,
            code: err.code,
        });
    }
};
