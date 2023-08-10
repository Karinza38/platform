import { createNextRoute, createNextRouter } from "@ts-rest/next";
import { pubsApi } from "../../contract";
import prisma from "~/prisma/db";

const getPubFields = async (pub_id: string) => {
	const fields = await prisma.pubValue.findMany({
		where: { pubId: pub_id },
		distinct: ["fieldId"],
		orderBy: {
			createdAt: "desc",
		},
		include: {
			field: {
				select: {
					name: true,
				},
			},
		},
	});

	return fields.reduce((prev: any, curr) => {
		prev[curr.field.name] = curr.value;
		return prev;
	}, {});
};

const router = createNextRoute(pubsApi, {
	pubs: {
		getPubFields: async ({params}) => {
			const pubFieldValuePairs = await getPubFields(params.pub_id);
			return {
				status: 200,
				body: pubFieldValuePairs,
			};
		},
		putPubFields: async (body) => {
			// const body = await CreatePost.instance.execute();
			return {
				status: 200,
				body: {
					id: "qea",
					title: "Watch One Piece",
					body: "Just get to water 7. if you dont like it chill, watch sometyhing welse",
				},
			};
		},
	},
});

export default createNextRouter(pubsApi, router);
