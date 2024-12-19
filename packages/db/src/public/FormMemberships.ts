import type { ColumnType, Insertable, Selectable, Updateable } from "kysely";

import { z } from "zod";

import type { FormsId } from "./Forms";
import type { MemberGroupsId } from "./MemberGroups";
import type { PubsId } from "./Pubs";
import type { UsersId } from "./Users";
import { formsIdSchema } from "./Forms";
import { memberGroupsIdSchema } from "./MemberGroups";
import { pubsIdSchema } from "./Pubs";
import { usersIdSchema } from "./Users";

// @generated
// This file is automatically generated by Kanel. Do not modify manually.

/** Identifier type for public.form_memberships */
export type FormMembershipsId = string & { __brand: "FormMembershipsId" };

/** Represents the table public.form_memberships */
export interface FormMembershipsTable {
	id: ColumnType<FormMembershipsId, FormMembershipsId | undefined, FormMembershipsId>;

	formId: ColumnType<FormsId, FormsId, FormsId>;

	userId: ColumnType<UsersId | null, UsersId | null, UsersId | null>;

	memberGroupId: ColumnType<MemberGroupsId | null, MemberGroupsId | null, MemberGroupsId | null>;

	createdAt: ColumnType<Date, Date | string | undefined, Date | string>;

	updatedAt: ColumnType<Date, Date | string | undefined, Date | string>;

	pubId: ColumnType<PubsId | null, PubsId | null, PubsId | null>;
}

export type FormMemberships = Selectable<FormMembershipsTable>;

export type NewFormMemberships = Insertable<FormMembershipsTable>;

export type FormMembershipsUpdate = Updateable<FormMembershipsTable>;

export const formMembershipsIdSchema = z.string().uuid() as unknown as z.Schema<FormMembershipsId>;

export const formMembershipsSchema = z.object({
	id: formMembershipsIdSchema,
	formId: formsIdSchema,
	userId: usersIdSchema.nullable(),
	memberGroupId: memberGroupsIdSchema.nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	pubId: pubsIdSchema.nullable(),
});

export const formMembershipsInitializerSchema = z.object({
	id: formMembershipsIdSchema.optional(),
	formId: formsIdSchema,
	userId: usersIdSchema.optional().nullable(),
	memberGroupId: memberGroupsIdSchema.optional().nullable(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
	pubId: pubsIdSchema.optional().nullable(),
});

export const formMembershipsMutatorSchema = z.object({
	id: formMembershipsIdSchema.optional(),
	formId: formsIdSchema.optional(),
	userId: usersIdSchema.optional().nullable(),
	memberGroupId: memberGroupsIdSchema.optional().nullable(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
	pubId: pubsIdSchema.optional().nullable(),
});
