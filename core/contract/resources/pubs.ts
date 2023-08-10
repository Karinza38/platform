import { z } from "zod";
import { initContract } from "@ts-rest/core";

const c = initContract();

const PubFieldsSchema = z.any();

export type PubFieldsResponse = z.infer<typeof PubFieldsSchema>;

export const pubs = c.router({
	getPubFields: {
		method: "GET",
		path: "/pubs/:pub_id",
		summary: "Get all pubs",
		description: "A way to get every pub for an integration instance",
		responses: {
			200: z.array(PubFieldsSchema),
		},
		pathParams: z.object({
			pub_id: z.string(),
		}),
	},
	putPubFields: {
		method: "PUT",
		path: "/pubs",
		summary: "Adds field(s) to a pub",
		description: "A way to add a field to an existing pub",
		body: PubFieldsSchema,
		responses: {
			200: PubFieldsSchema,
		},
	},
});
