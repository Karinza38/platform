// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { type PubFieldsId } from "./PubFields";
import { type PubTypesId } from "./PubTypes";
import { type ColumnType, type Selectable, type Insertable, type Updateable } from "kysely";

/** Represents the table public._PubFieldToPubType */
export default interface PubFieldToPubTypeTable {
	A: ColumnType<PubFieldsId, PubFieldsId, PubFieldsId>;

	B: ColumnType<PubTypesId, PubTypesId, PubTypesId>;
}

export type PubFieldToPubType = Selectable<PubFieldToPubTypeTable>;

export type NewPubFieldToPubType = Insertable<PubFieldToPubTypeTable>;

export type PubFieldToPubTypeUpdate = Updateable<PubFieldToPubTypeTable>;
