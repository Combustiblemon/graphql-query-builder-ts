/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-underscore-dangle */
// TODO: Add tests for it.
// TODO: Fix a bug that allows a never[] to be passed as the fields of a query.
import { ArgsType, MutationType, operationVariables, QueryType } from './types';

type Primitive =
  | string
  | Function
  | number
  | boolean
  | symbol
  | undefined
  | null;

type ObjectToKeyArray<Object> = NonNullable<
  {
    [Key in keyof Object]: Object[Key] extends Primitive
      ? Key
      : NonNullable<Object[Key]> extends Primitive[]
      ? Key
      : NonNullable<Object[Key]> extends (infer U)[]
      ? {
          [Subkey in Key]: ObjectToKeyArray<NonNullable<U>> extends infer A
            ? Array<Exclude<A[keyof A], undefined>>
            : never;
        }
      : ObjectToKeyArray<NonNullable<Object[Key]>> extends infer U
      ? { [Subkey in Key]: Array<Exclude<U[keyof U], undefined>> }
      : never;
  } extends infer A
    ? Array<Exclude<A[keyof A], undefined>>
    : never
>;

export type OperationTypes = 'query' | 'mutation';

type Operations<T> = T extends 'query'
  ? Omit<QueryType, '__typename'>
  : Omit<MutationType, '__typename'>;

type FieldsType<T> = Exclude<ObjectToKeyArray<NonNullable<T>>, never>;

type ArgsFieldType<K> = K extends keyof ArgsType ? ArgsType[K] : never;

export type OperationType<Type extends OperationTypes> = {
  [K in keyof Operations<Type>]:
    | {
        alias?: string;
        args: ArgsFieldType<K>;
        fields: FieldsType<Operations<Type>[K]>;
      }
    | Array<{
        alias: string;
        args: ArgsFieldType<K>;
        fields: FieldsType<Operations<Type>[K]>;
      }>;
};

type FieldType = Array<string | { [key: string]: FieldType }>;

/* Creates a graphql query from passed data. This query uses variables
(https://graphql.org/learn/queries/#variables) and is safe against injection.
returns an array, position 1 is the query and position 2 is the variables
object ready to be passed to fetch. */

const fieldFormatter = (fields: FieldType, offset = 2): string => {
  const tab = '   '.repeat(offset);
  return fields.reduce((acc: string, field) => {
    let result = '';

    if (typeof field === 'string') {
      result = `${acc}${tab}${field}\n`;
    } else {
      result = Object.entries(field)
        .map(
          ([key, value]) =>
            `${acc}${tab}${key} {\n${fieldFormatter(
              value,
              offset + 1
            )}${tab}}\n`
        )
        .join('');
    }

    return result;
  }, '');
};

type VariableFieldType = {
  isArray: boolean;
  isRequired: boolean;
  type: string;
};

const variableFormatter = (
  endpoint: string,
  args: string[],
  alias?: string
) => {
  const variables = Object.entries(
    operationVariables[endpoint as keyof typeof operationVariables]
  )
    // keep only the variables that are passed in the args
    .filter(([key]) => args.includes(key))
    // format the variables to be used in the query
    .reduce((acc, [key, value]) => {
      const { isArray, isRequired, type } = value as VariableFieldType;

      return `${acc}  $${alias || endpoint}_${key}: ${
        isArray ? `[${type}]` : type
      }${isRequired ? '!' : ''},\n`;
    }, '');

  return `${variables}`;
};

const operationFormatter = <U extends OperationTypes>(
  value: unknown,
  endpoint: keyof Operations<U>
) => {
  const data = value as {
    alias: string;
    args: ArgsFieldType<typeof endpoint>;
    fields: FieldsType<Operations<U>[typeof endpoint]>;
  };

  const args = Object.keys(data.args).reduce(
    (acc, key) =>
      `${acc}    ${key}: $${data.alias || String(endpoint)}_${key},\n`,
    ''
  );

  return `${data?.alias ? `${data.alias}: ` : ''}${String(
    endpoint
  )}(\n${args}  ) {\n${fieldFormatter(data.fields)}   }`;
};

const queryVariableTransformer = <U>(
  endpoint: string,
  args: ArgsFieldType<U>
) => {
  return Object.entries(args).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [`${endpoint}_${key}`]: value,
    }),
    {}
  );
};

const queryBuilder = <U extends OperationTypes, T extends OperationType<U>>(
  type: U,
  operation: T
): [string, object] => {
  let variablesString = '';
  let variables: object = {};
  const operationFormatted = Object.entries(operation).reduce(
    (acc, [key, value]: [string, unknown]) => {
      const endpoint = key as keyof Operations<U>;

      let result = '';

      if (Array.isArray(value)) {
        const items = value as {
          alias: string;
          args: ArgsFieldType<typeof endpoint>;
          fields: FieldsType<Operations<U>[typeof endpoint]>;
        }[];

        result = items
          .map((item) => {
            variables = {
              ...variables,
              ...queryVariableTransformer(
                item.alias || String(endpoint),
                item.args
              ),
            };

            variablesString += variableFormatter(
              String(endpoint),
              Object.keys(item.args),
              item.alias
            );

            return `${acc}\n  ${operationFormatter<U>(item, endpoint)}`;
          })
          .join(',');
      } else {
        const item = value as {
          alias: string;
          args: ArgsFieldType<typeof endpoint>;
          fields: FieldsType<Operations<U>[typeof endpoint]>;
        };

        variables = {
          ...variables,
          ...queryVariableTransformer(
            item.alias || String(endpoint),
            item.args
          ),
        };

        variablesString += variableFormatter(
          String(endpoint),
          Object.keys(item.args),
          item.alias
        );

        result = `${acc}\n  ${operationFormatter<U>(item, endpoint)}`;
      }

      return result;
    },
    ''
  );

  return [
    `${type} ${type.toUpperCase()}(\n${variablesString}) {${operationFormatted}\n}`,
    variables,
  ];
};

export default queryBuilder;
