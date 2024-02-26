import * as React from "react";
// this import causes a cyclic dependency in pnpm but here we are
import Ajv, { JSONSchemaType } from "ajv";
import { GetPubTypeResponseBody } from "contracts";
import { Control, ControllerRenderProps } from "react-hook-form";
import {
	Checkbox,
	Confidence,
	FileUpload,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	Separator,
	Textarea,
} from "ui";
import { cn } from "utils";

// a bit of a hack, but allows us to use AJV's JSON schema type
type AnySchema = {};

export const buildFormSchemaFromFields = (
	pubType: GetPubTypeResponseBody,
	exclude: String[]
): JSONSchemaType<AnySchema> => {
	const schema = {
		$id: `urn:uuid:${pubType.id}`,
		title: `${pubType.name}`,
		type: "object",
		properties: {},
	} as JSONSchemaType<AnySchema>;
	if (pubType.fields) {
		for (const field of pubType.fields) {
			if (!exclude.includes(field.slug)) {
				if (field.schema) {
					schema.properties[field.slug] = field.schema
						.schema as JSONSchemaType<AnySchema>;
				} else {
					schema.properties[field.slug] = {
						type: "string",
						title: `${field.name}`,
						$id: `urn:uuid:${field.id}`,
						default: "",
						// Schemas without a schema are assumed to be short-form strings,
						// and rendered as <input type="text">.
						// TODO: Add maxLength to long-form string fields.
						maxLength: 100,
					};
				}
			}
		}
	}
	return schema;
};

// todo: array, and more complex types that we might want to handle
export const getFormField = (schema: JSONSchemaType<AnySchema>, field: ControllerRenderProps) => {
	const { title, description, type } = schema;
	const descriptionComponentWithHtml = (
		<FormDescription
			className="text-[0.8em]"
			dangerouslySetInnerHTML={{ __html: description }}
		/>
	);
	switch (type) {
		case "number":
			return (
				<FormItem className="mb-6">
					<FormLabel className="text-[0.9em]">{title}</FormLabel>
					{descriptionComponentWithHtml}
					<FormControl>
						<Input
							type="number"
							{...field}
							onChange={(event) => field.onChange(+event.target.value)}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			);
		case "boolean":
			return (
				<FormItem className={cn("mb-6 flex flex-row items-start space-x-3 space-y-0")}>
					<FormControl>
						<Checkbox
							{...field}
							className="relative top-1"
							defaultChecked={field.value}
							onCheckedChange={(checked) => {
								field.onChange(checked);
							}}
						/>
					</FormControl>
					<div className={cn("space-y-1 leading-none")}>
						<FormLabel className="text-[0.9em]">{title}</FormLabel>
						{descriptionComponentWithHtml}
						<FormMessage />
					</div>
				</FormItem>
			);
		default:
			return (
				<FormItem className="mb-6">
					<FormLabel className="text-[0.9em]">{schema.title}</FormLabel>
					{descriptionComponentWithHtml}
					<FormControl>
						{"maxLength" in schema && schema.maxLength <= 100 ? (
							<Input {...field} />
						) : (
							<Textarea {...field} />
						)}
					</FormControl>
					<FormMessage />
				</FormItem>
			);
	}
};

type ScalarFieldProps = {
	title: string;
	schema: JSONSchemaType<AnySchema>;
	control: Control;
};

const ScalarField = (props: ScalarFieldProps) => {
	return (
		<FormField
			control={props.control}
			name={props.title}
			defaultValue={props.schema.default ?? ""}
			render={({ field }) => getFormField(props.schema, field)}
		/>
	);
};

const customScalars = ["unjournal:100confidence", "unjournal:5confidence", "pubpub:fileUpload"];

const hasCustomRenderer = (id: string) => {
	return customScalars.includes(id);
};

type CustomRendererProps = {
	control: Control;
	fieldSchema: JSONSchemaType<AnySchema>;
	fieldName: string;
	upload: Function;
};
// todo: don't just use if statements, make more dynamic
const CustomRenderer = (props: CustomRendererProps) => {
	const { control, fieldSchema, fieldName } = props;
	if (
		fieldSchema.$id === "unjournal:100confidence" ||
		fieldSchema.$id === "unjournal:5confidence"
	) {
		// not sure why, but these need to be set outside of the render in FormField?
		const min = fieldSchema.items.minimum;
		const max = fieldSchema.items.maximum;
		return (
			<FormField
				control={control}
				name={fieldName}
				defaultValue={fieldSchema.default ?? [0, 0, 0]}
				render={({ field }) => (
					<FormItem className="mb-6">
						<FormLabel className="text-[0.9em]">{fieldSchema.title}</FormLabel>
						<FormDescription
							className="text-[0.8em]"
							dangerouslySetInnerHTML={{ __html: fieldSchema.description }}
						/>
						<FormControl>
							<Confidence
								{...field}
								min={min}
								max={max}
								onValueChange={(event) => field.onChange(event)}
								className="confidence"
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		);
	}
	if (fieldSchema.$id === "pubpub:fileUpload") {
		return (
			<FormField
				control={control}
				name={fieldName}
				defaultValue={fieldSchema.default ?? [{}]}
				render={({ field }) => (
					<FormItem className="mb-6">
						<FormLabel>{fieldSchema.title}</FormLabel>
						<FormDescription
							dangerouslySetInnerHTML={{ __html: fieldSchema.description }}
						/>
						<FormControl>
							<FileUpload
								{...field}
								upload={props.upload}
								onUpdateFiles={(event: any[]) => field.onChange(event)}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		);
	}
};

const isObjectSchema = (
	schema: JSONSchemaType<AnySchema>
): schema is JSONSchemaType<AnySchema> & { properties: JSONSchemaType<AnySchema>[] } => {
	return schema.properties && Object.keys(schema.properties).length > 0;
};

const hasRef = (schema: JSONSchemaType<AnySchema>) => {
	return schema.$ref;
};

const hasResolvedSchema = (compiledSchema: Ajv, schemaKey: string) => {
	const resolvedSchema = compiledSchema.getSchema(schemaKey);
	return resolvedSchema && resolvedSchema.schema;
};

const getDereferencedSchema = (
	schema: JSONSchemaType<AnySchema>,
	compiledSchema: Ajv,
	path?: string
) => {
	if (isObjectSchema(schema)) {
		for (const [fieldKey, fieldSchema] of Object.entries(schema.properties)) {
			const fieldPath = path
				? schema.$id
					? `${path}/${schema.$id}`
					: path
				: `${schema.$id}#/properties`;
			const dereffedField = getDereferencedSchema(fieldSchema, compiledSchema, fieldPath);
		}
	} else {
		if (schema.$ref) {
			const fieldPath = path + schema.$ref.split("#")[1];
			return compiledSchema.getSchema(fieldPath)!.schema;
		}
	}
};

export const buildFormFieldsFromSchema = (
	compiledSchema: Ajv,
	compiledSchemaKey: string,
	control: Control,
	upload: Function,
	path?: string,
	fieldSchema?: JSONSchemaType<AnySchema>,
	schemaPath?: string
) => {
	const fields: React.ReactNode[] = [];

	// probably should refactor into function and throw an error if the schema can't be resolved from the compiled schema
	const resolvedSchema = fieldSchema
		? fieldSchema
		: (compiledSchema.getSchema("schema")!.schema as JSONSchemaType<AnySchema>);

	if (isObjectSchema(resolvedSchema)) {
		for (const [fieldKey, fieldSchema] of Object.entries(resolvedSchema.properties)) {
			const fieldPath = path ? `${path}.${fieldKey}` : fieldKey;

			// for querying the compiled schema later -- pretty robust, but does assume defs are not at top level
			// may be better way to query just at last schema id, for example
			const fieldSchemaPath = schemaPath
				? resolvedSchema.$id
					? `${schemaPath}/${resolvedSchema.$id}`
					: schemaPath
				: `${resolvedSchema.$id}#/properties`;

			const fieldContent = isObjectSchema(fieldSchema) ? (
				<div key={fieldKey} className="mb-12">
					{!path && <Separator className="my-8" />}
					{path ? <h4>{fieldSchema.title}</h4> : <h3>{fieldSchema.title}</h3>}
					{fieldSchema.description && (
						<p dangerouslySetInnerHTML={{ __html: fieldSchema.description }} />
					)}
					{buildFormFieldsFromSchema(
						compiledSchema,
						compiledSchemaKey,
						control,
						upload,
						fieldPath,
						fieldSchema,
						fieldSchemaPath
					)}
				</div>
			) : (
				buildFormFieldsFromSchema(
					compiledSchema,
					compiledSchemaKey,
					control,
					upload,
					fieldPath,
					fieldSchema,
					fieldSchemaPath
				)
			);
			fields.push(fieldContent);
		}
	} else {
		const scalarSchema =
			hasRef(resolvedSchema) && hasResolvedSchema(compiledSchema, compiledSchemaKey)
				? (compiledSchema.getSchema(`${schemaPath}${resolvedSchema.$ref!.split("#")[1]}`)!
						.schema as JSONSchemaType<AnySchema>)
				: resolvedSchema;
		fields.push(
			scalarSchema.$id && hasCustomRenderer(scalarSchema.$id) ? (
				<CustomRenderer
					key={resolvedSchema.$id ?? path}
					control={control}
					fieldSchema={scalarSchema}
					fieldName={path ?? resolvedSchema.$id!.split("#")[1]}
					upload={upload}
				/>
			) : (
				<ScalarField
					title={path ?? resolvedSchema.$id!.split("#")[1]}
					schema={scalarSchema}
					control={control}
					key={resolvedSchema.$id ?? path}
				/>
			)
		);
	}
	return fields;
};
