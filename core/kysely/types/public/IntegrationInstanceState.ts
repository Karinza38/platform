// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { type PubsId } from "./Pubs";
import { type IntegrationInstancesId } from "./IntegrationInstances";
import { type ColumnType, type Selectable, type Insertable, type Updateable } from "kysely";

/** Represents the table public.IntegrationInstanceState */
export default interface IntegrationInstanceStateTable {
	pub_id: ColumnType<PubsId, PubsId, PubsId>;

	instance_id: ColumnType<IntegrationInstancesId, IntegrationInstancesId, IntegrationInstancesId>;

	state: ColumnType<unknown, unknown, unknown>;
}

export type IntegrationInstanceState = Selectable<IntegrationInstanceStateTable>;

export type NewIntegrationInstanceState = Insertable<IntegrationInstanceStateTable>;

export type IntegrationInstanceStateUpdate = Updateable<IntegrationInstanceStateTable>;
