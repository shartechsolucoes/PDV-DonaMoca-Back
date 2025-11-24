import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import { startOfDay, endOfDay } from "date-fns";

const prisma = new PrismaClient();

export const getSales = async (req, res) => {
	try {
		const Sales = await prisma.sales.findMany({
			orderBy: {
				createAt: 'desc' // se você quer usar dateUpdate
			}
		});

		return res.send(Sales);
	} catch (err) {
		console.error("Erro ao buscar Vendas:", err);
		return res.status(500).send({
			error: "Erro ao buscar Vendas",
			message: err.message,
			code: err.code,
		});
	}
};
// Criação de venda
export const createSale = async (req, res) => {
  const { idCliente, obs, paymentMethod } = req.body;

  // Validação simples dos parâmetros
  if (!idCliente || !obs) {
    return res.status(400).send({
      error: "Parâmetros inválidos",
      message: "idCliente e obs são obrigatórios"
    });
  }

  try {
    // Criando a venda no banco de dados
    const sale = await prisma.sales.create({
      data: {
        clienteId: idCliente,
        obs: obs,
        createAt: new Date(),
        updateAt: new Date(),
        deleteAt: new Date(), // ou pode ser `new Date()` se você preferir
		paymentMethod: paymentMethod,
      }
    });

    // Retornando a venda criada
    return res.status(201).send(sale);

  } catch (err) {
    console.error("Erro ao criar venda:", err);
    return res.status(500).send({
      error: "Erro ao criar venda",
      message: err.message,
      code: err.code,
    });
  }
};
// Atualizar venda
export const updateSale = async (req, res) => {
  const { id } = req.params;
  const { idCliente, obs, paymentMethod } = req.body;

  if (!id) {
    return res.status(400).send({
      error: "Parâmetros inválidos",
      message: "ID da venda é obrigatório"
    });
  }

  try {
    const updatedSale = await prisma.sales.update({
      where: { id: Number(id) },
      data: {
        clienteId: idCliente,
        obs: obs,
		paymentMethod: paymentMethod,
        updateAt: new Date()
      }
    });

    return res.send(updatedSale);
  } catch (err) {
    console.error("Erro ao atualizar venda:", err);
    return res.status(500).send({
      error: "Erro ao atualizar venda",
      message: err.message,
      code: err.code,
    });
  }
};
export const getSale = async (request, reply) => {
	try {
		const id = parseInt(request.params.id);
		if (isNaN(id)) return reply.status(400).send({ message: "ID inválido" });

		const author = await prisma.sales.findUnique({
			where: { id: id },
		});

		if (!author) return reply.status(404).send({ message: "Venda não encontrado" });

		return reply.status(200).send(author);
	} catch (error) {
		console.error("Erro ao buscar Venda:", error);
		return reply.status(500).send({ message: "Erro ao buscar Venda", error });
	}
};
export const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;

    // Atualiza o campo deleteAt com a data/hora atual
    const sale = await prisma.sales.update({
      where: { id: Number(id) },
      data: {
        deleteAt: new Date()
      }
    });

    return res.send({
      message: "Venda marcada como excluída com sucesso.",
      sale
    });

  } catch (err) {
    console.error("Erro ao marcar venda como excluída:", err);
    return res.status(500).send({
      error: "Erro ao marcar venda como excluída.",
      message: err.message,
      code: err.code,
    });
  }
};