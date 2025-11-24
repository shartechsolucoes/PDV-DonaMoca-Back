import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';
const { hashSync, genSaltSync, compareSync } = bcryptjs;

const prisma = new PrismaClient();

export const createUser = async (req, res) => {
	const {
		login,
		password,
		email,
		name,
		access_level,
		expiration,
		picture,
		phone,
		address,
		neighborhood,
		state,
		city,
		status,
	} = req.body;

	const level = parseInt(access_level);

	const salt = genSaltSync();
	const hash = hashSync(password, salt);

	const user = await prisma.account.findFirst({
		where: {
			login,
		},
	});

	if (user) {
		return res.status(400).send({ err: 'Used User name' });
	}

	const newUser = await prisma.user.create({
		data: {
			login,
			password: hash,
			name,
			access_level: level,
			expiration: 0,
			picture: picture || '',
			email,
			phone,
			address,
			neighborhood,
			state,
			city,
			status: true,
		},
	});

	return res.status(201).send({ msg: `User ${newUser.login} created` });
};

export const login = async (req, res) => {
	const { username, password } = req.body;

	const user = await prisma.account.findFirst({
		where: {
			username,
		},
	});

	if (!user) {
		return res.status(400).send({ err: 'User not found' });
	}

	const correctUser = compareSync(password, user.password);

	if (!correctUser) {
		return res.status(400).send({ err: 'Incorrect Password' });
	}

	if (!user.status) {
		return res.status(400).send({ err: 'User inactive' });
	}

	try {
		const token = await res.jwtSign(
			{ login: user.login },
			{ sign: { sub: user.id } }
		);
		return res.send({
			token,
			access_level: user.account_type_id,
			userId: user.id,
			userName: user.name,
			picture: user.picture,
		});
	} catch (err) {
		return res.status(400).send({ msg: 'Internal error', err });
	}
};

export const getUsers = async (req, res) => {
	const accounts = await prisma.account.findMany({
		omit: { password: true },
	});

	return res.send(accounts);
};

export const getUser = async (req, res) => {
	const { id } = req.params;
	const account_id  = Number(id);
	if (isNaN(account_id)) return reply.code(400).send({ error: "ID inválido" });

	const account = await prisma.account.findFirst({
		where: { account_id },
		omit: { password: true },
	});

	res.send(account);
};

export const updateUser = async (req, res) => {
	try {
		const {
			username,
			password,
			email,
			name,
			account_type_id,
			phone,
			address,
			city,
			state_id,
			status,
			image_id,
			color,
			background,
			birthday, // 👈 aqui
		} = req.body;

		const { id } = req.params;

		const user = await prisma.account.update({
			where: { account_id: Number(id) },
			data: {
				username,
				// password: hash,
				name,
				account_type_id: account_type_id ? Number(account_type_id) : null,
				email,
				phone,
				address,
				city,
				state_id,
				status: status ? Number(status) : 1,
				image_id: image_id ? Number(image_id) : 0,
				color: color || "#FFFFFF",
				background: background || "#000000",
				birthday: birthday ? new Date(birthday) : null, // 👈 conversão segura
				date_modified: new Date(),
			},
		});

		const { password: _, ...userWithoutPassword } = user;
		return res.status(201).send(userWithoutPassword);
	} catch (error) {
		console.error("❌ Erro ao atualizar usuário:", error);
		return res.status(500).json({ error: "Erro interno ao atualizar usuário." });
	}
};


export const changePassword = async (req, res) => {
	const { oldPassword, newPassword, userId } = req.body;

	const user = await prisma.user.findFirst({
		where: {
			id: userId,
		},
	});

	if (!user) {
		return res.status(500).send({ msg: 'User not found.' });
	}

	const samePassword = compareSync(oldPassword, user.password);

	if (!samePassword) {
		return res
			.status(500)
			.send({ msg: 'Error when try to change de password.' });
	}

	const salt = genSaltSync();
	const hash = hashSync(newPassword, salt);

	const newUser = await prisma.user.update({
		where: { id: userId },
		data: {
			password: hash,
		},
	});

	return res
		.status(201)
		.send({ msg: `User ${newUser.login} updated password` });
};

export const userActivities = async (req, res) => {
	const { id } = req.query;

	const activities = await prisma.order.findMany({
		where: { userId: id },
		take: 3,
		orderBy: { id: 'desc' },
	});

	const count = await prisma.order.count({ where: { userId: id } });

	if (!activities) {
		return res.status(400).send([]);
	}

	return res.status(200).send({ activities, count });
};
