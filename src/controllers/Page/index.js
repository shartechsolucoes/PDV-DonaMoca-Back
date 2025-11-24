import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const getPages = async (req, res) => {
	const pages = await prisma.page.findMany({
		omit: { password: true },
	});

	return res.send(pages);
};

export const getUser = async (req, res) => {
	const { id } = req.params;
	const user = await prisma.account.findFirst({
		where: { id },
		omit: { password: true },
	});

	res.send(user);
};

export const updateUser = async (req, res) => {
	const {
		page_id,
		title,
		content,
		type ,
		fixed,
		status,
		account_id,
		date_added ,
		date_modified,
	} = req.body;

	const { id } = req.params;

	const level = parseInt(access_level);
	// if (password) {
	// 	const salt = genSaltSync();
	// 	const hash = hashSync(password, salt);
	// }

	const user = await prisma.user.update({
		where: { id },
		data: {
			login,
			// password: hash,
			name,
			access_level: level,
			expiration: 0,
			// picture: picture || '',
			email,
			phone,
			address,
			neighborhood,
			state,
			city,
			status,
		},
		omit: { password: true },
	});

	return res.status(201).send(user);
};
