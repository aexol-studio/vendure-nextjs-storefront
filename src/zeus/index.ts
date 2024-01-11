/* eslint-disable */

import { AllTypesProps, ReturnTypes, Ops } from './const';
export const HOST = 'http://localhost:3000/shop-api';

export const HEADERS = {};
export const apiSubscription = (options: chainOptions) => (query: string) => {
    try {
        const queryString = options[0] + '?query=' + encodeURIComponent(query);
        const wsString = queryString.replace('http', 'ws');
        const host = (options.length > 1 && options[1]?.websocket?.[0]) || wsString;
        const webSocketOptions = options[1]?.websocket || [host];
        const ws = new WebSocket(...webSocketOptions);
        return {
            ws,
            on: (e: (args: any) => void) => {
                ws.onmessage = (event: any) => {
                    if (event.data) {
                        const parsed = JSON.parse(event.data);
                        const data = parsed.data;
                        return e(data);
                    }
                };
            },
            off: (e: (args: any) => void) => {
                ws.onclose = e;
            },
            error: (e: (args: any) => void) => {
                ws.onerror = e;
            },
            open: (e: () => void) => {
                ws.onopen = e;
            },
        };
    } catch {
        throw new Error('No websockets implemented');
    }
};
const handleFetchResponse = (response: Response): Promise<GraphQLResponse> => {
    if (!response.ok) {
        return new Promise((_, reject) => {
            response
                .text()
                .then(text => {
                    try {
                        reject(JSON.parse(text));
                    } catch (err) {
                        reject(text);
                    }
                })
                .catch(reject);
        });
    }
    return response.json() as Promise<GraphQLResponse>;
};

export const apiFetch =
    (options: fetchOptions) =>
    (query: string, variables: Record<string, unknown> = {}) => {
        const fetchOptions = options[1] || {};
        if (fetchOptions.method && fetchOptions.method === 'GET') {
            return fetch(`${options[0]}?query=${encodeURIComponent(query)}`, fetchOptions)
                .then(handleFetchResponse)
                .then((response: GraphQLResponse) => {
                    if (response.errors) {
                        throw new GraphQLError(response);
                    }
                    return response.data;
                });
        }
        return fetch(`${options[0]}`, {
            body: JSON.stringify({ query, variables }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            ...fetchOptions,
        })
            .then(handleFetchResponse)
            .then((response: GraphQLResponse) => {
                if (response.errors) {
                    throw new GraphQLError(response);
                }
                return response.data;
            });
    };

export const InternalsBuildQuery = ({
    ops,
    props,
    returns,
    options,
    scalars,
}: {
    props: AllTypesPropsType;
    returns: ReturnTypesType;
    ops: Operations;
    options?: OperationOptions;
    scalars?: ScalarDefinition;
}) => {
    const ibb = (
        k: string,
        o: InputValueType | VType,
        p = '',
        root = true,
        vars: Array<{ name: string; graphQLType: string }> = [],
    ): string => {
        const keyForPath = purifyGraphQLKey(k);
        const newPath = [p, keyForPath].join(SEPARATOR);
        if (!o) {
            return '';
        }
        if (typeof o === 'boolean' || typeof o === 'number') {
            return k;
        }
        if (typeof o === 'string') {
            return `${k} ${o}`;
        }
        if (Array.isArray(o)) {
            const args = InternalArgsBuilt({
                props,
                returns,
                ops,
                scalars,
                vars,
            })(o[0], newPath);
            return `${ibb(args ? `${k}(${args})` : k, o[1], p, false, vars)}`;
        }
        if (k === '__alias') {
            return Object.entries(o)
                .map(([alias, objectUnderAlias]) => {
                    if (typeof objectUnderAlias !== 'object' || Array.isArray(objectUnderAlias)) {
                        throw new Error(
                            'Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}',
                        );
                    }
                    const operationName = Object.keys(objectUnderAlias)[0];
                    const operation = objectUnderAlias[operationName];
                    return ibb(`${alias}:${operationName}`, operation, p, false, vars);
                })
                .join('\n');
        }
        const hasOperationName = root && options?.operationName ? ' ' + options.operationName : '';
        const keyForDirectives = o.__directives ?? '';
        const query = `{${Object.entries(o)
            .filter(([k]) => k !== '__directives')
            .map(e => ibb(...e, [p, `field<>${keyForPath}`].join(SEPARATOR), false, vars))
            .join('\n')}}`;
        if (!root) {
            return `${k} ${keyForDirectives}${hasOperationName} ${query}`;
        }
        const varsString = vars.map(v => `${v.name}: ${v.graphQLType}`).join(', ');
        return `${k} ${keyForDirectives}${hasOperationName}${varsString ? `(${varsString})` : ''} ${query}`;
    };
    return ibb;
};

export const Thunder =
    (fn: FetchFunction) =>
    <O extends keyof typeof Ops, SCLR extends ScalarDefinition, R extends keyof ValueTypes = GenericOperation<O>>(
        operation: O,
        graphqlOptions?: ThunderGraphQLOptions<SCLR>,
    ) =>
    <Z extends ValueTypes[R]>(
        o: (Z & ValueTypes[R]) | ValueTypes[R],
        ops?: OperationOptions & { variables?: Record<string, unknown> },
    ) =>
        fn(
            Zeus(operation, o, {
                operationOptions: ops,
                scalars: graphqlOptions?.scalars,
            }),
            ops?.variables,
        ).then(data => {
            if (graphqlOptions?.scalars) {
                return decodeScalarsInResponse({
                    response: data,
                    initialOp: operation,
                    initialZeusQuery: o as VType,
                    returns: ReturnTypes,
                    scalars: graphqlOptions.scalars,
                    ops: Ops,
                });
            }
            return data;
        }) as Promise<InputType<GraphQLTypes[R], Z, SCLR>>;

export const Chain = (...options: chainOptions) => Thunder(apiFetch(options));

export const SubscriptionThunder =
    (fn: SubscriptionFunction) =>
    <O extends keyof typeof Ops, SCLR extends ScalarDefinition, R extends keyof ValueTypes = GenericOperation<O>>(
        operation: O,
        graphqlOptions?: ThunderGraphQLOptions<SCLR>,
    ) =>
    <Z extends ValueTypes[R]>(
        o: (Z & ValueTypes[R]) | ValueTypes[R],
        ops?: OperationOptions & { variables?: ExtractVariables<Z> },
    ) => {
        const returnedFunction = fn(
            Zeus(operation, o, {
                operationOptions: ops,
                scalars: graphqlOptions?.scalars,
            }),
        ) as SubscriptionToGraphQL<Z, GraphQLTypes[R], SCLR>;
        if (returnedFunction?.on && graphqlOptions?.scalars) {
            const wrapped = returnedFunction.on;
            returnedFunction.on = (fnToCall: (args: InputType<GraphQLTypes[R], Z, SCLR>) => void) =>
                wrapped((data: InputType<GraphQLTypes[R], Z, SCLR>) => {
                    if (graphqlOptions?.scalars) {
                        return fnToCall(
                            decodeScalarsInResponse({
                                response: data,
                                initialOp: operation,
                                initialZeusQuery: o as VType,
                                returns: ReturnTypes,
                                scalars: graphqlOptions.scalars,
                                ops: Ops,
                            }),
                        );
                    }
                    return fnToCall(data);
                });
        }
        return returnedFunction;
    };

export const Subscription = (...options: chainOptions) => SubscriptionThunder(apiSubscription(options));
export const Zeus = <
    Z extends ValueTypes[R],
    O extends keyof typeof Ops,
    R extends keyof ValueTypes = GenericOperation<O>,
>(
    operation: O,
    o: (Z & ValueTypes[R]) | ValueTypes[R],
    ops?: {
        operationOptions?: OperationOptions;
        scalars?: ScalarDefinition;
    },
) =>
    InternalsBuildQuery({
        props: AllTypesProps,
        returns: ReturnTypes,
        ops: Ops,
        options: ops?.operationOptions,
        scalars: ops?.scalars,
    })(operation, o as VType);

export const ZeusSelect = <T>() => ((t: unknown) => t) as SelectionFunction<T>;

export const Selector = <T extends keyof ValueTypes>(key: T) => key && ZeusSelect<ValueTypes[T]>();

export const TypeFromSelector = <T extends keyof ValueTypes>(key: T) => key && ZeusSelect<ValueTypes[T]>();
export const Gql = Chain(HOST, {
    headers: {
        'Content-Type': 'application/json',
        ...HEADERS,
    },
});

export const ZeusScalars = ZeusSelect<ScalarCoders>();

export const decodeScalarsInResponse = <O extends Operations>({
    response,
    scalars,
    returns,
    ops,
    initialZeusQuery,
    initialOp,
}: {
    ops: O;
    response: any;
    returns: ReturnTypesType;
    scalars?: Record<string, ScalarResolver | undefined>;
    initialOp: keyof O;
    initialZeusQuery: InputValueType | VType;
}) => {
    if (!scalars) {
        return response;
    }
    const builder = PrepareScalarPaths({
        ops,
        returns,
    });

    const scalarPaths = builder(initialOp as string, ops[initialOp], initialZeusQuery);
    if (scalarPaths) {
        const r = traverseResponse({ scalarPaths, resolvers: scalars })(initialOp as string, response, [
            ops[initialOp],
        ]);
        return r;
    }
    return response;
};

export const traverseResponse = ({
    resolvers,
    scalarPaths,
}: {
    scalarPaths: { [x: string]: `scalar.${string}` };
    resolvers: {
        [x: string]: ScalarResolver | undefined;
    };
}) => {
    const ibb = (k: string, o: InputValueType | VType, p: string[] = []): unknown => {
        if (Array.isArray(o)) {
            return o.map(eachO => ibb(k, eachO, p));
        }
        if (o == null) {
            return o;
        }
        const scalarPathString = p.join(SEPARATOR);
        const currentScalarString = scalarPaths[scalarPathString];
        if (currentScalarString) {
            const currentDecoder = resolvers[currentScalarString.split('.')[1]]?.decode;
            if (currentDecoder) {
                return currentDecoder(o);
            }
        }
        if (typeof o === 'boolean' || typeof o === 'number' || typeof o === 'string' || !o) {
            return o;
        }
        const entries = Object.entries(o).map(([k, v]) => [k, ibb(k, v, [...p, purifyGraphQLKey(k)])] as const);
        const objectFromEntries = entries.reduce<Record<string, unknown>>((a, [k, v]) => {
            a[k] = v;
            return a;
        }, {});
        return objectFromEntries;
    };
    return ibb;
};

export type AllTypesPropsType = {
    [x: string]:
        | undefined
        | `scalar.${string}`
        | 'enum'
        | {
              [x: string]:
                  | undefined
                  | string
                  | {
                        [x: string]: string | undefined;
                    };
          };
};

export type ReturnTypesType = {
    [x: string]:
        | {
              [x: string]: string | undefined;
          }
        | `scalar.${string}`
        | undefined;
};
export type InputValueType = {
    [x: string]: undefined | boolean | string | number | [any, undefined | boolean | InputValueType] | InputValueType;
};
export type VType =
    | undefined
    | boolean
    | string
    | number
    | [any, undefined | boolean | InputValueType]
    | InputValueType;

export type PlainType = boolean | number | string | null | undefined;
export type ZeusArgsType =
    | PlainType
    | {
          [x: string]: ZeusArgsType;
      }
    | Array<ZeusArgsType>;

export type Operations = Record<string, string>;

export type VariableDefinition = {
    [x: string]: unknown;
};

export const SEPARATOR = '|';

export type fetchOptions = Parameters<typeof fetch>;
type websocketOptions = typeof WebSocket extends new (...args: infer R) => WebSocket ? R : never;
export type chainOptions = [fetchOptions[0], fetchOptions[1] & { websocket?: websocketOptions }] | [fetchOptions[0]];
export type FetchFunction = (query: string, variables?: Record<string, unknown>) => Promise<any>;
export type SubscriptionFunction = (query: string) => any;
type NotUndefined<T> = T extends undefined ? never : T;
export type ResolverType<F> = NotUndefined<F extends [infer ARGS, any] ? ARGS : undefined>;

export type OperationOptions = {
    operationName?: string;
};

export type ScalarCoder = Record<string, (s: unknown) => string>;

export interface GraphQLResponse {
    data?: Record<string, any>;
    errors?: Array<{
        message: string;
    }>;
}
export class GraphQLError extends Error {
    constructor(public response: GraphQLResponse) {
        super('');
        console.error(response);
    }
    toString() {
        return 'GraphQL Response Error';
    }
}
export type GenericOperation<O> = O extends keyof typeof Ops ? (typeof Ops)[O] : never;
export type ThunderGraphQLOptions<SCLR extends ScalarDefinition> = {
    scalars?: SCLR | ScalarCoders;
};

const ExtractScalar = (mappedParts: string[], returns: ReturnTypesType): `scalar.${string}` | undefined => {
    if (mappedParts.length === 0) {
        return;
    }
    const oKey = mappedParts[0];
    const returnP1 = returns[oKey];
    if (typeof returnP1 === 'object') {
        const returnP2 = returnP1[mappedParts[1]];
        if (returnP2) {
            return ExtractScalar([returnP2, ...mappedParts.slice(2)], returns);
        }
        return undefined;
    }
    return returnP1 as `scalar.${string}` | undefined;
};

export const PrepareScalarPaths = ({ ops, returns }: { returns: ReturnTypesType; ops: Operations }) => {
    const ibb = (
        k: string,
        originalKey: string,
        o: InputValueType | VType,
        p: string[] = [],
        pOriginals: string[] = [],
        root = true,
    ): { [x: string]: `scalar.${string}` } | undefined => {
        if (!o) {
            return;
        }
        if (typeof o === 'boolean' || typeof o === 'number' || typeof o === 'string') {
            const extractionArray = [...pOriginals, originalKey];
            const isScalar = ExtractScalar(extractionArray, returns);
            if (isScalar?.startsWith('scalar')) {
                const partOfTree = {
                    [[...p, k].join(SEPARATOR)]: isScalar,
                };
                return partOfTree;
            }
            return {};
        }
        if (Array.isArray(o)) {
            return ibb(k, k, o[1], p, pOriginals, false);
        }
        if (k === '__alias') {
            return Object.entries(o)
                .map(([alias, objectUnderAlias]) => {
                    if (typeof objectUnderAlias !== 'object' || Array.isArray(objectUnderAlias)) {
                        throw new Error(
                            'Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}',
                        );
                    }
                    const operationName = Object.keys(objectUnderAlias)[0];
                    const operation = objectUnderAlias[operationName];
                    return ibb(alias, operationName, operation, p, pOriginals, false);
                })
                .reduce((a, b) => ({
                    ...a,
                    ...b,
                }));
        }
        const keyName = root ? ops[k] : k;
        return Object.entries(o)
            .filter(([k]) => k !== '__directives')
            .map(([k, v]) => {
                // Inline fragments shouldn't be added to the path as they aren't a field
                const isInlineFragment = originalKey.match(/^...\s*on/) != null;
                return ibb(
                    k,
                    k,
                    v,
                    isInlineFragment ? p : [...p, purifyGraphQLKey(keyName || k)],
                    isInlineFragment ? pOriginals : [...pOriginals, purifyGraphQLKey(originalKey)],
                    false,
                );
            })
            .reduce((a, b) => ({
                ...a,
                ...b,
            }));
    };
    return ibb;
};

export const purifyGraphQLKey = (k: string) => k.replace(/\([^)]*\)/g, '').replace(/^[^:]*\:/g, '');

const mapPart = (p: string) => {
    const [isArg, isField] = p.split('<>');
    if (isField) {
        return {
            v: isField,
            __type: 'field',
        } as const;
    }
    return {
        v: isArg,
        __type: 'arg',
    } as const;
};

type Part = ReturnType<typeof mapPart>;

export const ResolveFromPath = (props: AllTypesPropsType, returns: ReturnTypesType, ops: Operations) => {
    const ResolvePropsType = (mappedParts: Part[]) => {
        const oKey = ops[mappedParts[0].v];
        const propsP1 = oKey ? props[oKey] : props[mappedParts[0].v];
        if (propsP1 === 'enum' && mappedParts.length === 1) {
            return 'enum';
        }
        if (typeof propsP1 === 'string' && propsP1.startsWith('scalar.') && mappedParts.length === 1) {
            return propsP1;
        }
        if (typeof propsP1 === 'object') {
            if (mappedParts.length < 2) {
                return 'not';
            }
            const propsP2 = propsP1[mappedParts[1].v];
            if (typeof propsP2 === 'string') {
                return rpp(
                    `${propsP2}${SEPARATOR}${mappedParts
                        .slice(2)
                        .map(mp => mp.v)
                        .join(SEPARATOR)}`,
                );
            }
            if (typeof propsP2 === 'object') {
                if (mappedParts.length < 3) {
                    return 'not';
                }
                const propsP3 = propsP2[mappedParts[2].v];
                if (propsP3 && mappedParts[2].__type === 'arg') {
                    return rpp(
                        `${propsP3}${SEPARATOR}${mappedParts
                            .slice(3)
                            .map(mp => mp.v)
                            .join(SEPARATOR)}`,
                    );
                }
            }
        }
    };
    const ResolveReturnType = (mappedParts: Part[]) => {
        if (mappedParts.length === 0) {
            return 'not';
        }
        const oKey = ops[mappedParts[0].v];
        const returnP1 = oKey ? returns[oKey] : returns[mappedParts[0].v];
        if (typeof returnP1 === 'object') {
            if (mappedParts.length < 2) return 'not';
            const returnP2 = returnP1[mappedParts[1].v];
            if (returnP2) {
                return rpp(
                    `${returnP2}${SEPARATOR}${mappedParts
                        .slice(2)
                        .map(mp => mp.v)
                        .join(SEPARATOR)}`,
                );
            }
        }
    };
    const rpp = (path: string): 'enum' | 'not' | `scalar.${string}` => {
        const parts = path.split(SEPARATOR).filter(l => l.length > 0);
        const mappedParts = parts.map(mapPart);
        const propsP1 = ResolvePropsType(mappedParts);
        if (propsP1) {
            return propsP1;
        }
        const returnP1 = ResolveReturnType(mappedParts);
        if (returnP1) {
            return returnP1;
        }
        return 'not';
    };
    return rpp;
};

export const InternalArgsBuilt = ({
    props,
    ops,
    returns,
    scalars,
    vars,
}: {
    props: AllTypesPropsType;
    returns: ReturnTypesType;
    ops: Operations;
    scalars?: ScalarDefinition;
    vars: Array<{ name: string; graphQLType: string }>;
}) => {
    const arb = (a: ZeusArgsType, p = '', root = true): string => {
        if (typeof a === 'string') {
            if (a.startsWith(START_VAR_NAME)) {
                const [varName, graphQLType] = a.replace(START_VAR_NAME, '$').split(GRAPHQL_TYPE_SEPARATOR);
                const v = vars.find(v => v.name === varName);
                if (!v) {
                    vars.push({
                        name: varName,
                        graphQLType,
                    });
                } else {
                    if (v.graphQLType !== graphQLType) {
                        throw new Error(
                            `Invalid variable exists with two different GraphQL Types, "${v.graphQLType}" and ${graphQLType}`,
                        );
                    }
                }
                return varName;
            }
        }
        const checkType = ResolveFromPath(props, returns, ops)(p);
        if (checkType.startsWith('scalar.')) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [_, ...splittedScalar] = checkType.split('.');
            const scalarKey = splittedScalar.join('.');
            return (scalars?.[scalarKey]?.encode?.(a) as string) || JSON.stringify(a);
        }
        if (Array.isArray(a)) {
            return `[${a.map(arr => arb(arr, p, false)).join(', ')}]`;
        }
        if (typeof a === 'string') {
            if (checkType === 'enum') {
                return a;
            }
            return `${JSON.stringify(a)}`;
        }
        if (typeof a === 'object') {
            if (a === null) {
                return `null`;
            }
            const returnedObjectString = Object.entries(a)
                .filter(([, v]) => typeof v !== 'undefined')
                .map(([k, v]) => `${k}: ${arb(v, [p, k].join(SEPARATOR), false)}`)
                .join(',\n');
            if (!root) {
                return `{${returnedObjectString}}`;
            }
            return returnedObjectString;
        }
        return `${a}`;
    };
    return arb;
};

export const resolverFor = <X, T extends keyof ResolverInputTypes, Z extends keyof ResolverInputTypes[T]>(
    type: T,
    field: Z,
    fn: (
        args: Required<ResolverInputTypes[T]>[Z] extends [infer Input, any] ? Input : any,
        source: any,
    ) => Z extends keyof ModelTypes[T] ? ModelTypes[T][Z] | Promise<ModelTypes[T][Z]> | X : never,
) => fn as (args?: any, source?: any) => ReturnType<typeof fn>;

export type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
export type ZeusState<T extends (...args: any[]) => Promise<any>> = NonNullable<UnwrapPromise<ReturnType<T>>>;
export type ZeusHook<
    T extends (...args: any[]) => Record<string, (...args: any[]) => Promise<any>>,
    N extends keyof ReturnType<T>,
> = ZeusState<ReturnType<T>[N]>;

export type WithTypeNameValue<T> = T & {
    __typename?: boolean;
    __directives?: string;
};
export type AliasType<T> = WithTypeNameValue<T> & {
    __alias?: Record<string, WithTypeNameValue<T>>;
};
type DeepAnify<T> = {
    [P in keyof T]?: any;
};
type IsPayLoad<T> = T extends [any, infer PayLoad] ? PayLoad : T;
export type ScalarDefinition = Record<string, ScalarResolver>;

type IsScalar<S, SCLR extends ScalarDefinition> = S extends 'scalar' & { name: infer T }
    ? T extends keyof SCLR
        ? SCLR[T]['decode'] extends (s: unknown) => unknown
            ? ReturnType<SCLR[T]['decode']>
            : unknown
        : unknown
    : S;
type IsArray<T, U, SCLR extends ScalarDefinition> = T extends Array<infer R>
    ? InputType<R, U, SCLR>[]
    : InputType<T, U, SCLR>;
type FlattenArray<T> = T extends Array<infer R> ? R : T;
type BaseZeusResolver = boolean | 1 | string | Variable<any, string>;

type IsInterfaced<SRC extends DeepAnify<DST>, DST, SCLR extends ScalarDefinition> = FlattenArray<SRC> extends
    | ZEUS_INTERFACES
    | ZEUS_UNIONS
    ? {
          [P in keyof SRC]: SRC[P] extends '__union' & infer R
              ? P extends keyof DST
                  ? IsArray<R, '__typename' extends keyof DST ? DST[P] & { __typename: true } : DST[P], SCLR>
                  : IsArray<R, '__typename' extends keyof DST ? { __typename: true } : Record<string, never>, SCLR>
              : never;
      }[keyof SRC] & {
          [P in keyof Omit<
              Pick<
                  SRC,
                  {
                      [P in keyof DST]: SRC[P] extends '__union' & infer R ? never : P;
                  }[keyof DST]
              >,
              '__typename'
          >]: IsPayLoad<DST[P]> extends BaseZeusResolver ? IsScalar<SRC[P], SCLR> : IsArray<SRC[P], DST[P], SCLR>;
      }
    : {
          [P in keyof Pick<SRC, keyof DST>]: IsPayLoad<DST[P]> extends BaseZeusResolver
              ? IsScalar<SRC[P], SCLR>
              : IsArray<SRC[P], DST[P], SCLR>;
      };

export type MapType<SRC, DST, SCLR extends ScalarDefinition> = SRC extends DeepAnify<DST>
    ? IsInterfaced<SRC, DST, SCLR>
    : never;
// eslint-disable-next-line @typescript-eslint/ban-types
export type InputType<SRC, DST, SCLR extends ScalarDefinition = {}> = IsPayLoad<DST> extends { __alias: infer R }
    ? {
          [P in keyof R]: MapType<SRC, R[P], SCLR>[keyof MapType<SRC, R[P], SCLR>];
      } & MapType<SRC, Omit<IsPayLoad<DST>, '__alias'>, SCLR>
    : MapType<SRC, IsPayLoad<DST>, SCLR>;
export type SubscriptionToGraphQL<Z, T, SCLR extends ScalarDefinition> = {
    ws: WebSocket;
    on: (fn: (args: InputType<T, Z, SCLR>) => void) => void;
    off: (fn: (e: { data?: InputType<T, Z, SCLR>; code?: number; reason?: string; message?: string }) => void) => void;
    error: (fn: (e: { data?: InputType<T, Z, SCLR>; errors?: string[] }) => void) => void;
    open: () => void;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type FromSelector<SELECTOR, NAME extends keyof GraphQLTypes, SCLR extends ScalarDefinition = {}> = InputType<
    GraphQLTypes[NAME],
    SELECTOR,
    SCLR
>;

export type ScalarResolver = {
    encode?: (s: unknown) => string;
    decode?: (s: unknown) => unknown;
};

export type SelectionFunction<V> = <T>(t: T | V) => T;

type BuiltInVariableTypes = {
    ['String']: string;
    ['Int']: number;
    ['Float']: number;
    ['ID']: unknown;
    ['Boolean']: boolean;
};
type AllVariableTypes = keyof BuiltInVariableTypes | keyof ZEUS_VARIABLES;
type VariableRequired<T extends string> = `${T}!` | T | `[${T}]` | `[${T}]!` | `[${T}!]` | `[${T}!]!`;
type VR<T extends string> = VariableRequired<VariableRequired<T>>;

export type GraphQLVariableType = VR<AllVariableTypes>;

type ExtractVariableTypeString<T extends string> = T extends VR<infer R1>
    ? R1 extends VR<infer R2>
        ? R2 extends VR<infer R3>
            ? R3 extends VR<infer R4>
                ? R4 extends VR<infer R5>
                    ? R5
                    : R4
                : R3
            : R2
        : R1
    : T;

type DecomposeType<T, Type> = T extends `[${infer R}]`
    ? Array<DecomposeType<R, Type>> | undefined
    : T extends `${infer R}!`
      ? NonNullable<DecomposeType<R, Type>>
      : Type | undefined;

type ExtractTypeFromGraphQLType<T extends string> = T extends keyof ZEUS_VARIABLES
    ? ZEUS_VARIABLES[T]
    : T extends keyof BuiltInVariableTypes
      ? BuiltInVariableTypes[T]
      : any;

export type GetVariableType<T extends string> = DecomposeType<
    T,
    ExtractTypeFromGraphQLType<ExtractVariableTypeString<T>>
>;

type UndefinedKeys<T> = {
    [K in keyof T]-?: T[K] extends NonNullable<T[K]> ? never : K;
}[keyof T];

type WithNullableKeys<T> = Pick<T, UndefinedKeys<T>>;
type WithNonNullableKeys<T> = Omit<T, UndefinedKeys<T>>;

type OptionalKeys<T> = {
    [P in keyof T]?: T[P];
};

export type WithOptionalNullables<T> = OptionalKeys<WithNullableKeys<T>> & WithNonNullableKeys<T>;

export type Variable<T extends GraphQLVariableType, Name extends string> = {
    ' __zeus_name': Name;
    ' __zeus_type': T;
};

export type ExtractVariables<Query> = Query extends Variable<infer VType, infer VName>
    ? { [key in VName]: GetVariableType<VType> }
    : Query extends [infer Inputs, infer Outputs]
      ? ExtractVariables<Inputs> & ExtractVariables<Outputs>
      : Query extends string | number | boolean
        ? // eslint-disable-next-line @typescript-eslint/ban-types
          {}
        : UnionToIntersection<{ [K in keyof Query]: WithOptionalNullables<ExtractVariables<Query[K]>> }[keyof Query]>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export const START_VAR_NAME = `$ZEUS_VAR`;
export const GRAPHQL_TYPE_SEPARATOR = `__$GRAPHQL__`;

export const $ = <Type extends GraphQLVariableType, Name extends string>(name: Name, graphqlType: Type) => {
    return (START_VAR_NAME + name + GRAPHQL_TYPE_SEPARATOR + graphqlType) as unknown as Variable<Type, Name>;
};
type ZEUS_INTERFACES =
    | GraphQLTypes['PaginatedList']
    | GraphQLTypes['Node']
    | GraphQLTypes['ErrorResult']
    | GraphQLTypes['CustomField']
    | GraphQLTypes['Region'];
export type ScalarCoders = {
    JSON?: ScalarResolver;
    DateTime?: ScalarResolver;
    Upload?: ScalarResolver;
    Money?: ScalarResolver;
};
type ZEUS_UNIONS =
    | GraphQLTypes['UpdateOrderItemsResult']
    | GraphQLTypes['RemoveOrderItemsResult']
    | GraphQLTypes['SetOrderShippingMethodResult']
    | GraphQLTypes['ApplyCouponCodeResult']
    | GraphQLTypes['CustomFieldConfig']
    | GraphQLTypes['SearchResultPrice']
    | GraphQLTypes['AddPaymentToOrderResult']
    | GraphQLTypes['TransitionOrderToStateResult']
    | GraphQLTypes['SetCustomerForOrderResult']
    | GraphQLTypes['RegisterCustomerAccountResult']
    | GraphQLTypes['RefreshCustomerVerificationResult']
    | GraphQLTypes['VerifyCustomerAccountResult']
    | GraphQLTypes['UpdateCustomerPasswordResult']
    | GraphQLTypes['RequestUpdateCustomerEmailAddressResult']
    | GraphQLTypes['UpdateCustomerEmailAddressResult']
    | GraphQLTypes['RequestPasswordResetResult']
    | GraphQLTypes['ResetPasswordResult']
    | GraphQLTypes['NativeAuthenticationResult']
    | GraphQLTypes['AuthenticationResult']
    | GraphQLTypes['ActiveOrderResult'];

export type ValueTypes = {
    ['Query']: AliasType<{
        /** The active Channel */
        activeChannel?: ValueTypes['Channel'];
        /** The active Customer */
        activeCustomer?: ValueTypes['Customer'];
        /** The active Order. Will be `null` until an Order is created via `addItemToOrder`. Once an Order reaches the
state of `PaymentAuthorized` or `PaymentSettled`, then that Order is no longer considered "active" and this
query will once again return `null`. */
        activeOrder?: ValueTypes['Order'];
        /** An array of supported Countries */
        availableCountries?: ValueTypes['Country'];
        collections?: [
            { options?: ValueTypes['CollectionListOptions'] | undefined | null | Variable<any, string> },
            ValueTypes['CollectionList'],
        ];
        collection?: [
            {
                id?: string | undefined | null | Variable<any, string>;
                slug?: string | undefined | null | Variable<any, string>;
            },
            ValueTypes['Collection'],
        ];
        /** Returns a list of eligible shipping methods based on the current active Order */
        eligibleShippingMethods?: ValueTypes['ShippingMethodQuote'];
        /** Returns a list of payment methods and their eligibility based on the current active Order */
        eligiblePaymentMethods?: ValueTypes['PaymentMethodQuote'];
        facets?: [
            { options?: ValueTypes['FacetListOptions'] | undefined | null | Variable<any, string> },
            ValueTypes['FacetList'],
        ];
        facet?: [{ id: string | Variable<any, string> }, ValueTypes['Facet']];
        /** Returns information about the current authenticated User */
        me?: ValueTypes['CurrentUser'];
        /** Returns the possible next states that the activeOrder can transition to */
        nextOrderStates?: boolean | `@${string}`;
        order?: [{ id: string | Variable<any, string> }, ValueTypes['Order']];
        orderByCode?: [{ code: string | Variable<any, string> }, ValueTypes['Order']];
        product?: [
            {
                id?: string | undefined | null | Variable<any, string>;
                slug?: string | undefined | null | Variable<any, string>;
            },
            ValueTypes['Product'],
        ];
        products?: [
            { options?: ValueTypes['ProductListOptions'] | undefined | null | Variable<any, string> },
            ValueTypes['ProductList'],
        ];
        search?: [{ input: ValueTypes['SearchInput'] | Variable<any, string> }, ValueTypes['SearchResponse']];
        __typename?: boolean | `@${string}`;
    }>;
    ['Mutation']: AliasType<{
        addItemToOrder?: [
            { productVariantId: string | Variable<any, string>; quantity: number | Variable<any, string> },
            ValueTypes['UpdateOrderItemsResult'],
        ];
        removeOrderLine?: [{ orderLineId: string | Variable<any, string> }, ValueTypes['RemoveOrderItemsResult']];
        /** Remove all OrderLine from the Order */
        removeAllOrderLines?: ValueTypes['RemoveOrderItemsResult'];
        adjustOrderLine?: [
            { orderLineId: string | Variable<any, string>; quantity: number | Variable<any, string> },
            ValueTypes['UpdateOrderItemsResult'],
        ];
        applyCouponCode?: [{ couponCode: string | Variable<any, string> }, ValueTypes['ApplyCouponCodeResult']];
        removeCouponCode?: [{ couponCode: string | Variable<any, string> }, ValueTypes['Order']];
        transitionOrderToState?: [
            { state: string | Variable<any, string> },
            ValueTypes['TransitionOrderToStateResult'],
        ];
        setOrderShippingAddress?: [
            { input: ValueTypes['CreateAddressInput'] | Variable<any, string> },
            ValueTypes['ActiveOrderResult'],
        ];
        setOrderBillingAddress?: [
            { input: ValueTypes['CreateAddressInput'] | Variable<any, string> },
            ValueTypes['ActiveOrderResult'],
        ];
        setOrderCustomFields?: [
            { input: ValueTypes['UpdateOrderInput'] | Variable<any, string> },
            ValueTypes['ActiveOrderResult'],
        ];
        setOrderShippingMethod?: [
            { shippingMethodId: Array<string> | Variable<any, string> },
            ValueTypes['SetOrderShippingMethodResult'],
        ];
        addPaymentToOrder?: [
            { input: ValueTypes['PaymentInput'] | Variable<any, string> },
            ValueTypes['AddPaymentToOrderResult'],
        ];
        setCustomerForOrder?: [
            { input: ValueTypes['CreateCustomerInput'] | Variable<any, string> },
            ValueTypes['SetCustomerForOrderResult'],
        ];
        login?: [
            {
                username: string | Variable<any, string>;
                password: string | Variable<any, string>;
                rememberMe?: boolean | undefined | null | Variable<any, string>;
            },
            ValueTypes['NativeAuthenticationResult'],
        ];
        authenticate?: [
            {
                input: ValueTypes['AuthenticationInput'] | Variable<any, string>;
                rememberMe?: boolean | undefined | null | Variable<any, string>;
            },
            ValueTypes['AuthenticationResult'],
        ];
        /** End the current authenticated session */
        logout?: ValueTypes['Success'];
        registerCustomerAccount?: [
            { input: ValueTypes['RegisterCustomerInput'] | Variable<any, string> },
            ValueTypes['RegisterCustomerAccountResult'],
        ];
        refreshCustomerVerification?: [
            { emailAddress: string | Variable<any, string> },
            ValueTypes['RefreshCustomerVerificationResult'],
        ];
        updateCustomer?: [{ input: ValueTypes['UpdateCustomerInput'] | Variable<any, string> }, ValueTypes['Customer']];
        createCustomerAddress?: [
            { input: ValueTypes['CreateAddressInput'] | Variable<any, string> },
            ValueTypes['Address'],
        ];
        updateCustomerAddress?: [
            { input: ValueTypes['UpdateAddressInput'] | Variable<any, string> },
            ValueTypes['Address'],
        ];
        deleteCustomerAddress?: [{ id: string | Variable<any, string> }, ValueTypes['Success']];
        verifyCustomerAccount?: [
            { token: string | Variable<any, string>; password?: string | undefined | null | Variable<any, string> },
            ValueTypes['VerifyCustomerAccountResult'],
        ];
        updateCustomerPassword?: [
            { currentPassword: string | Variable<any, string>; newPassword: string | Variable<any, string> },
            ValueTypes['UpdateCustomerPasswordResult'],
        ];
        requestUpdateCustomerEmailAddress?: [
            { password: string | Variable<any, string>; newEmailAddress: string | Variable<any, string> },
            ValueTypes['RequestUpdateCustomerEmailAddressResult'],
        ];
        updateCustomerEmailAddress?: [
            { token: string | Variable<any, string> },
            ValueTypes['UpdateCustomerEmailAddressResult'],
        ];
        requestPasswordReset?: [
            { emailAddress: string | Variable<any, string> },
            ValueTypes['RequestPasswordResetResult'],
        ];
        resetPassword?: [
            { token: string | Variable<any, string>; password: string | Variable<any, string> },
            ValueTypes['ResetPasswordResult'],
        ];
        __typename?: boolean | `@${string}`;
    }>;
    ['Address']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        fullName?: boolean | `@${string}`;
        company?: boolean | `@${string}`;
        streetLine1?: boolean | `@${string}`;
        streetLine2?: boolean | `@${string}`;
        city?: boolean | `@${string}`;
        province?: boolean | `@${string}`;
        postalCode?: boolean | `@${string}`;
        country?: ValueTypes['Country'];
        phoneNumber?: boolean | `@${string}`;
        defaultShippingAddress?: boolean | `@${string}`;
        defaultBillingAddress?: boolean | `@${string}`;
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Asset']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        fileSize?: boolean | `@${string}`;
        mimeType?: boolean | `@${string}`;
        width?: boolean | `@${string}`;
        height?: boolean | `@${string}`;
        source?: boolean | `@${string}`;
        preview?: boolean | `@${string}`;
        focalPoint?: ValueTypes['Coordinate'];
        tags?: ValueTypes['Tag'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Coordinate']: AliasType<{
        x?: boolean | `@${string}`;
        y?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['AssetList']: AliasType<{
        items?: ValueTypes['Asset'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['AssetType']: AssetType;
    ['CurrentUser']: AliasType<{
        id?: boolean | `@${string}`;
        identifier?: boolean | `@${string}`;
        channels?: ValueTypes['CurrentUserChannel'];
        __typename?: boolean | `@${string}`;
    }>;
    ['CurrentUserChannel']: AliasType<{
        id?: boolean | `@${string}`;
        token?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        permissions?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Channel']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        token?: boolean | `@${string}`;
        defaultTaxZone?: ValueTypes['Zone'];
        defaultShippingZone?: ValueTypes['Zone'];
        defaultLanguageCode?: boolean | `@${string}`;
        availableLanguageCodes?: boolean | `@${string}`;
        currencyCode?: boolean | `@${string}`;
        defaultCurrencyCode?: boolean | `@${string}`;
        availableCurrencyCodes?: boolean | `@${string}`;
        /** Not yet used - will be implemented in a future release. */
        trackInventory?: boolean | `@${string}`;
        /** Not yet used - will be implemented in a future release. */
        outOfStockThreshold?: boolean | `@${string}`;
        pricesIncludeTax?: boolean | `@${string}`;
        seller?: ValueTypes['Seller'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Collection']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        slug?: boolean | `@${string}`;
        breadcrumbs?: ValueTypes['CollectionBreadcrumb'];
        position?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        featuredAsset?: ValueTypes['Asset'];
        assets?: ValueTypes['Asset'];
        parent?: ValueTypes['Collection'];
        parentId?: boolean | `@${string}`;
        children?: ValueTypes['Collection'];
        filters?: ValueTypes['ConfigurableOperation'];
        translations?: ValueTypes['CollectionTranslation'];
        productVariants?: [
            { options?: ValueTypes['ProductVariantListOptions'] | undefined | null | Variable<any, string> },
            ValueTypes['ProductVariantList'],
        ];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['CollectionBreadcrumb']: AliasType<{
        id?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        slug?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['CollectionTranslation']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        slug?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['CollectionList']: AliasType<{
        items?: ValueTypes['Collection'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['GlobalFlag']: GlobalFlag;
    ['AdjustmentType']: AdjustmentType;
    ['DeletionResult']: DeletionResult;
    /** @description
Permissions for administrators and customers. Used to control access to
GraphQL resolvers via the {@link Allow} decorator.

## Understanding Permission.Owner

`Permission.Owner` is a special permission which is used in some Vendure resolvers to indicate that that resolver should only
be accessible to the "owner" of that resource.

For example, the Shop API `activeCustomer` query resolver should only return the Customer object for the "owner" of that Customer, i.e.
based on the activeUserId of the current session. As a result, the resolver code looks like this:

@example
```TypeScript
\@Query()
\@Allow(Permission.Owner)
async activeCustomer(\@Ctx() ctx: RequestContext): Promise<Customer | undefined> {
  const userId = ctx.activeUserId;
  if (userId) {
    return this.customerService.findOneByUserId(ctx, userId);
  }
}
```

Here we can see that the "ownership" must be enforced by custom logic inside the resolver. Since "ownership" cannot be defined generally
nor statically encoded at build-time, any resolvers using `Permission.Owner` **must** include logic to enforce that only the owner
of the resource has access. If not, then it is the equivalent of using `Permission.Public`.


@docsCategory common */
    ['Permission']: Permission;
    ['SortOrder']: SortOrder;
    ['ErrorCode']: ErrorCode;
    ['LogicalOperator']: LogicalOperator;
    /** Returned when attempting an operation that relies on the NativeAuthStrategy, if that strategy is not configured. */
    ['NativeAuthStrategyError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if the user authentication credentials are not valid */
    ['InvalidCredentialsError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        authenticationError?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if there is an error in transitioning the Order state */
    ['OrderStateTransitionError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        transitionError?: boolean | `@${string}`;
        fromState?: boolean | `@${string}`;
        toState?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to create a Customer with an email address already registered to an existing User. */
    ['EmailAddressConflictError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to set the Customer on a guest checkout when the configured GuestCheckoutStrategy does not allow it. */
    ['GuestCheckoutError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        errorDetail?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when the maximum order size limit has been reached. */
    ['OrderLimitError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        maxItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to set a negative OrderLine quantity. */
    ['NegativeQuantityError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to add more items to the Order than are available */
    ['InsufficientStockError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        quantityAvailable?: boolean | `@${string}`;
        order?: ValueTypes['Order'];
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if the provided coupon code is invalid */
    ['CouponCodeInvalidError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        couponCode?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if the provided coupon code is invalid */
    ['CouponCodeExpiredError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        couponCode?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if the provided coupon code is invalid */
    ['CouponCodeLimitError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        couponCode?: boolean | `@${string}`;
        limit?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to modify the contents of an Order that is not in the `AddingItems` state. */
    ['OrderModificationError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to set a ShippingMethod for which the Order is not eligible */
    ['IneligibleShippingMethodError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when invoking a mutation which depends on there being an active Order on the
current session. */
    ['NoActiveOrderError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
    ['JSON']: unknown;
    /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
    ['DateTime']: unknown;
    /** The `Upload` scalar type represents a file upload. */
    ['Upload']: unknown;
    /** The `Money` scalar type represents monetary values and supports signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point). */
    ['Money']: unknown;
    ['PaginatedList']: AliasType<{
        items?: ValueTypes['Node'];
        totalItems?: boolean | `@${string}`;
        ['...on AssetList']?: Omit<ValueTypes['AssetList'], keyof ValueTypes['PaginatedList']>;
        ['...on CollectionList']?: Omit<ValueTypes['CollectionList'], keyof ValueTypes['PaginatedList']>;
        ['...on CustomerList']?: Omit<ValueTypes['CustomerList'], keyof ValueTypes['PaginatedList']>;
        ['...on FacetList']?: Omit<ValueTypes['FacetList'], keyof ValueTypes['PaginatedList']>;
        ['...on FacetValueList']?: Omit<ValueTypes['FacetValueList'], keyof ValueTypes['PaginatedList']>;
        ['...on HistoryEntryList']?: Omit<ValueTypes['HistoryEntryList'], keyof ValueTypes['PaginatedList']>;
        ['...on OrderList']?: Omit<ValueTypes['OrderList'], keyof ValueTypes['PaginatedList']>;
        ['...on ProductList']?: Omit<ValueTypes['ProductList'], keyof ValueTypes['PaginatedList']>;
        ['...on ProductVariantList']?: Omit<ValueTypes['ProductVariantList'], keyof ValueTypes['PaginatedList']>;
        ['...on PromotionList']?: Omit<ValueTypes['PromotionList'], keyof ValueTypes['PaginatedList']>;
        ['...on CountryList']?: Omit<ValueTypes['CountryList'], keyof ValueTypes['PaginatedList']>;
        ['...on ProvinceList']?: Omit<ValueTypes['ProvinceList'], keyof ValueTypes['PaginatedList']>;
        ['...on RoleList']?: Omit<ValueTypes['RoleList'], keyof ValueTypes['PaginatedList']>;
        ['...on ShippingMethodList']?: Omit<ValueTypes['ShippingMethodList'], keyof ValueTypes['PaginatedList']>;
        ['...on TagList']?: Omit<ValueTypes['TagList'], keyof ValueTypes['PaginatedList']>;
        ['...on TaxRateList']?: Omit<ValueTypes['TaxRateList'], keyof ValueTypes['PaginatedList']>;
        __typename?: boolean | `@${string}`;
    }>;
    ['Node']: AliasType<{
        id?: boolean | `@${string}`;
        ['...on Address']?: Omit<ValueTypes['Address'], keyof ValueTypes['Node']>;
        ['...on Asset']?: Omit<ValueTypes['Asset'], keyof ValueTypes['Node']>;
        ['...on Channel']?: Omit<ValueTypes['Channel'], keyof ValueTypes['Node']>;
        ['...on Collection']?: Omit<ValueTypes['Collection'], keyof ValueTypes['Node']>;
        ['...on CustomerGroup']?: Omit<ValueTypes['CustomerGroup'], keyof ValueTypes['Node']>;
        ['...on Customer']?: Omit<ValueTypes['Customer'], keyof ValueTypes['Node']>;
        ['...on FacetValue']?: Omit<ValueTypes['FacetValue'], keyof ValueTypes['Node']>;
        ['...on Facet']?: Omit<ValueTypes['Facet'], keyof ValueTypes['Node']>;
        ['...on HistoryEntry']?: Omit<ValueTypes['HistoryEntry'], keyof ValueTypes['Node']>;
        ['...on Order']?: Omit<ValueTypes['Order'], keyof ValueTypes['Node']>;
        ['...on OrderLine']?: Omit<ValueTypes['OrderLine'], keyof ValueTypes['Node']>;
        ['...on Payment']?: Omit<ValueTypes['Payment'], keyof ValueTypes['Node']>;
        ['...on Refund']?: Omit<ValueTypes['Refund'], keyof ValueTypes['Node']>;
        ['...on Fulfillment']?: Omit<ValueTypes['Fulfillment'], keyof ValueTypes['Node']>;
        ['...on Surcharge']?: Omit<ValueTypes['Surcharge'], keyof ValueTypes['Node']>;
        ['...on PaymentMethod']?: Omit<ValueTypes['PaymentMethod'], keyof ValueTypes['Node']>;
        ['...on ProductOptionGroup']?: Omit<ValueTypes['ProductOptionGroup'], keyof ValueTypes['Node']>;
        ['...on ProductOption']?: Omit<ValueTypes['ProductOption'], keyof ValueTypes['Node']>;
        ['...on Product']?: Omit<ValueTypes['Product'], keyof ValueTypes['Node']>;
        ['...on ProductVariant']?: Omit<ValueTypes['ProductVariant'], keyof ValueTypes['Node']>;
        ['...on Promotion']?: Omit<ValueTypes['Promotion'], keyof ValueTypes['Node']>;
        ['...on Region']?: Omit<ValueTypes['Region'], keyof ValueTypes['Node']>;
        ['...on Country']?: Omit<ValueTypes['Country'], keyof ValueTypes['Node']>;
        ['...on Province']?: Omit<ValueTypes['Province'], keyof ValueTypes['Node']>;
        ['...on Role']?: Omit<ValueTypes['Role'], keyof ValueTypes['Node']>;
        ['...on Seller']?: Omit<ValueTypes['Seller'], keyof ValueTypes['Node']>;
        ['...on ShippingMethod']?: Omit<ValueTypes['ShippingMethod'], keyof ValueTypes['Node']>;
        ['...on Tag']?: Omit<ValueTypes['Tag'], keyof ValueTypes['Node']>;
        ['...on TaxCategory']?: Omit<ValueTypes['TaxCategory'], keyof ValueTypes['Node']>;
        ['...on TaxRate']?: Omit<ValueTypes['TaxRate'], keyof ValueTypes['Node']>;
        ['...on User']?: Omit<ValueTypes['User'], keyof ValueTypes['Node']>;
        ['...on AuthenticationMethod']?: Omit<ValueTypes['AuthenticationMethod'], keyof ValueTypes['Node']>;
        ['...on Zone']?: Omit<ValueTypes['Zone'], keyof ValueTypes['Node']>;
        __typename?: boolean | `@${string}`;
    }>;
    ['ErrorResult']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        ['...on NativeAuthStrategyError']?: Omit<
            ValueTypes['NativeAuthStrategyError'],
            keyof ValueTypes['ErrorResult']
        >;
        ['...on InvalidCredentialsError']?: Omit<
            ValueTypes['InvalidCredentialsError'],
            keyof ValueTypes['ErrorResult']
        >;
        ['...on OrderStateTransitionError']?: Omit<
            ValueTypes['OrderStateTransitionError'],
            keyof ValueTypes['ErrorResult']
        >;
        ['...on EmailAddressConflictError']?: Omit<
            ValueTypes['EmailAddressConflictError'],
            keyof ValueTypes['ErrorResult']
        >;
        ['...on GuestCheckoutError']?: Omit<ValueTypes['GuestCheckoutError'], keyof ValueTypes['ErrorResult']>;
        ['...on OrderLimitError']?: Omit<ValueTypes['OrderLimitError'], keyof ValueTypes['ErrorResult']>;
        ['...on NegativeQuantityError']?: Omit<ValueTypes['NegativeQuantityError'], keyof ValueTypes['ErrorResult']>;
        ['...on InsufficientStockError']?: Omit<ValueTypes['InsufficientStockError'], keyof ValueTypes['ErrorResult']>;
        ['...on CouponCodeInvalidError']?: Omit<ValueTypes['CouponCodeInvalidError'], keyof ValueTypes['ErrorResult']>;
        ['...on CouponCodeExpiredError']?: Omit<ValueTypes['CouponCodeExpiredError'], keyof ValueTypes['ErrorResult']>;
        ['...on CouponCodeLimitError']?: Omit<ValueTypes['CouponCodeLimitError'], keyof ValueTypes['ErrorResult']>;
        ['...on OrderModificationError']?: Omit<ValueTypes['OrderModificationError'], keyof ValueTypes['ErrorResult']>;
        ['...on IneligibleShippingMethodError']?: Omit<
            ValueTypes['IneligibleShippingMethodError'],
            keyof ValueTypes['ErrorResult']
        >;
        ['...on NoActiveOrderError']?: Omit<ValueTypes['NoActiveOrderError'], keyof ValueTypes['ErrorResult']>;
        ['...on OrderPaymentStateError']?: Omit<ValueTypes['OrderPaymentStateError'], keyof ValueTypes['ErrorResult']>;
        ['...on IneligiblePaymentMethodError']?: Omit<
            ValueTypes['IneligiblePaymentMethodError'],
            keyof ValueTypes['ErrorResult']
        >;
        ['...on PaymentFailedError']?: Omit<ValueTypes['PaymentFailedError'], keyof ValueTypes['ErrorResult']>;
        ['...on PaymentDeclinedError']?: Omit<ValueTypes['PaymentDeclinedError'], keyof ValueTypes['ErrorResult']>;
        ['...on AlreadyLoggedInError']?: Omit<ValueTypes['AlreadyLoggedInError'], keyof ValueTypes['ErrorResult']>;
        ['...on MissingPasswordError']?: Omit<ValueTypes['MissingPasswordError'], keyof ValueTypes['ErrorResult']>;
        ['...on PasswordValidationError']?: Omit<
            ValueTypes['PasswordValidationError'],
            keyof ValueTypes['ErrorResult']
        >;
        ['...on PasswordAlreadySetError']?: Omit<
            ValueTypes['PasswordAlreadySetError'],
            keyof ValueTypes['ErrorResult']
        >;
        ['...on VerificationTokenInvalidError']?: Omit<
            ValueTypes['VerificationTokenInvalidError'],
            keyof ValueTypes['ErrorResult']
        >;
        ['...on VerificationTokenExpiredError']?: Omit<
            ValueTypes['VerificationTokenExpiredError'],
            keyof ValueTypes['ErrorResult']
        >;
        ['...on IdentifierChangeTokenInvalidError']?: Omit<
            ValueTypes['IdentifierChangeTokenInvalidError'],
            keyof ValueTypes['ErrorResult']
        >;
        ['...on IdentifierChangeTokenExpiredError']?: Omit<
            ValueTypes['IdentifierChangeTokenExpiredError'],
            keyof ValueTypes['ErrorResult']
        >;
        ['...on PasswordResetTokenInvalidError']?: Omit<
            ValueTypes['PasswordResetTokenInvalidError'],
            keyof ValueTypes['ErrorResult']
        >;
        ['...on PasswordResetTokenExpiredError']?: Omit<
            ValueTypes['PasswordResetTokenExpiredError'],
            keyof ValueTypes['ErrorResult']
        >;
        ['...on NotVerifiedError']?: Omit<ValueTypes['NotVerifiedError'], keyof ValueTypes['ErrorResult']>;
        __typename?: boolean | `@${string}`;
    }>;
    ['Adjustment']: AliasType<{
        adjustmentSource?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        amount?: boolean | `@${string}`;
        data?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['TaxLine']: AliasType<{
        description?: boolean | `@${string}`;
        taxRate?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ConfigArg']: AliasType<{
        name?: boolean | `@${string}`;
        value?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ConfigArgDefinition']: AliasType<{
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        list?: boolean | `@${string}`;
        required?: boolean | `@${string}`;
        defaultValue?: boolean | `@${string}`;
        label?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        ui?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ConfigurableOperation']: AliasType<{
        code?: boolean | `@${string}`;
        args?: ValueTypes['ConfigArg'];
        __typename?: boolean | `@${string}`;
    }>;
    ['ConfigurableOperationDefinition']: AliasType<{
        code?: boolean | `@${string}`;
        args?: ValueTypes['ConfigArgDefinition'];
        description?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['DeletionResponse']: AliasType<{
        result?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ConfigArgInput']: {
        name: string | Variable<any, string>;
        /** A JSON stringified representation of the actual value */
        value: string | Variable<any, string>;
    };
    ['ConfigurableOperationInput']: {
        code: string | Variable<any, string>;
        arguments: Array<ValueTypes['ConfigArgInput']> | Variable<any, string>;
    };
    /** Operators for filtering on a String field */
    ['StringOperators']: {
        eq?: string | undefined | null | Variable<any, string>;
        notEq?: string | undefined | null | Variable<any, string>;
        contains?: string | undefined | null | Variable<any, string>;
        notContains?: string | undefined | null | Variable<any, string>;
        in?: Array<string> | undefined | null | Variable<any, string>;
        notIn?: Array<string> | undefined | null | Variable<any, string>;
        regex?: string | undefined | null | Variable<any, string>;
        isNull?: boolean | undefined | null | Variable<any, string>;
    };
    /** Operators for filtering on an ID field */
    ['IDOperators']: {
        eq?: string | undefined | null | Variable<any, string>;
        notEq?: string | undefined | null | Variable<any, string>;
        in?: Array<string> | undefined | null | Variable<any, string>;
        notIn?: Array<string> | undefined | null | Variable<any, string>;
        isNull?: boolean | undefined | null | Variable<any, string>;
    };
    /** Operators for filtering on a Boolean field */
    ['BooleanOperators']: {
        eq?: boolean | undefined | null | Variable<any, string>;
        isNull?: boolean | undefined | null | Variable<any, string>;
    };
    ['NumberRange']: {
        start: number | Variable<any, string>;
        end: number | Variable<any, string>;
    };
    /** Operators for filtering on a Int or Float field */
    ['NumberOperators']: {
        eq?: number | undefined | null | Variable<any, string>;
        lt?: number | undefined | null | Variable<any, string>;
        lte?: number | undefined | null | Variable<any, string>;
        gt?: number | undefined | null | Variable<any, string>;
        gte?: number | undefined | null | Variable<any, string>;
        between?: ValueTypes['NumberRange'] | undefined | null | Variable<any, string>;
        isNull?: boolean | undefined | null | Variable<any, string>;
    };
    ['DateRange']: {
        start: ValueTypes['DateTime'] | Variable<any, string>;
        end: ValueTypes['DateTime'] | Variable<any, string>;
    };
    /** Operators for filtering on a DateTime field */
    ['DateOperators']: {
        eq?: ValueTypes['DateTime'] | undefined | null | Variable<any, string>;
        before?: ValueTypes['DateTime'] | undefined | null | Variable<any, string>;
        after?: ValueTypes['DateTime'] | undefined | null | Variable<any, string>;
        between?: ValueTypes['DateRange'] | undefined | null | Variable<any, string>;
        isNull?: boolean | undefined | null | Variable<any, string>;
    };
    /** Operators for filtering on a list of String fields */
    ['StringListOperators']: {
        inList: string | Variable<any, string>;
    };
    /** Operators for filtering on a list of Number fields */
    ['NumberListOperators']: {
        inList: number | Variable<any, string>;
    };
    /** Operators for filtering on a list of Boolean fields */
    ['BooleanListOperators']: {
        inList: boolean | Variable<any, string>;
    };
    /** Operators for filtering on a list of ID fields */
    ['IDListOperators']: {
        inList: string | Variable<any, string>;
    };
    /** Operators for filtering on a list of Date fields */
    ['DateListOperators']: {
        inList: ValueTypes['DateTime'] | Variable<any, string>;
    };
    /** Used to construct boolean expressions for filtering search results
by FacetValue ID. Examples:

* ID=1 OR ID=2: `{ facetValueFilters: [{ or: [1,2] }] }`
* ID=1 AND ID=2: `{ facetValueFilters: [{ and: 1 }, { and: 2 }] }`
* ID=1 AND (ID=2 OR ID=3): `{ facetValueFilters: [{ and: 1 }, { or: [2,3] }] }` */
    ['FacetValueFilterInput']: {
        and?: string | undefined | null | Variable<any, string>;
        or?: Array<string> | undefined | null | Variable<any, string>;
    };
    ['SearchInput']: {
        term?: string | undefined | null | Variable<any, string>;
        facetValueFilters?: Array<ValueTypes['FacetValueFilterInput']> | undefined | null | Variable<any, string>;
        collectionId?: string | undefined | null | Variable<any, string>;
        collectionSlug?: string | undefined | null | Variable<any, string>;
        groupByProduct?: boolean | undefined | null | Variable<any, string>;
        take?: number | undefined | null | Variable<any, string>;
        skip?: number | undefined | null | Variable<any, string>;
        sort?: ValueTypes['SearchResultSortParameter'] | undefined | null | Variable<any, string>;
        inStock?: boolean | undefined | null | Variable<any, string>;
    };
    ['SearchResultSortParameter']: {
        name?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        price?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
    };
    ['CreateCustomerInput']: {
        title?: string | undefined | null | Variable<any, string>;
        firstName: string | Variable<any, string>;
        lastName: string | Variable<any, string>;
        phoneNumber?: string | undefined | null | Variable<any, string>;
        emailAddress: string | Variable<any, string>;
        customFields?: ValueTypes['JSON'] | undefined | null | Variable<any, string>;
    };
    ['CreateAddressInput']: {
        fullName?: string | undefined | null | Variable<any, string>;
        company?: string | undefined | null | Variable<any, string>;
        streetLine1: string | Variable<any, string>;
        streetLine2?: string | undefined | null | Variable<any, string>;
        city?: string | undefined | null | Variable<any, string>;
        province?: string | undefined | null | Variable<any, string>;
        postalCode?: string | undefined | null | Variable<any, string>;
        countryCode: string | Variable<any, string>;
        phoneNumber?: string | undefined | null | Variable<any, string>;
        defaultShippingAddress?: boolean | undefined | null | Variable<any, string>;
        defaultBillingAddress?: boolean | undefined | null | Variable<any, string>;
        customFields?: ValueTypes['JSON'] | undefined | null | Variable<any, string>;
    };
    ['UpdateAddressInput']: {
        id: string | Variable<any, string>;
        fullName?: string | undefined | null | Variable<any, string>;
        company?: string | undefined | null | Variable<any, string>;
        streetLine1?: string | undefined | null | Variable<any, string>;
        streetLine2?: string | undefined | null | Variable<any, string>;
        city?: string | undefined | null | Variable<any, string>;
        province?: string | undefined | null | Variable<any, string>;
        postalCode?: string | undefined | null | Variable<any, string>;
        countryCode?: string | undefined | null | Variable<any, string>;
        phoneNumber?: string | undefined | null | Variable<any, string>;
        defaultShippingAddress?: boolean | undefined | null | Variable<any, string>;
        defaultBillingAddress?: boolean | undefined | null | Variable<any, string>;
        customFields?: ValueTypes['JSON'] | undefined | null | Variable<any, string>;
    };
    /** Indicates that an operation succeeded, where we do not want to return any more specific information. */
    ['Success']: AliasType<{
        success?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ShippingMethodQuote']: AliasType<{
        id?: boolean | `@${string}`;
        price?: boolean | `@${string}`;
        priceWithTax?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        /** Any optional metadata returned by the ShippingCalculator in the ShippingCalculationResult */
        metadata?: boolean | `@${string}`;
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['PaymentMethodQuote']: AliasType<{
        id?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        isEligible?: boolean | `@${string}`;
        eligibilityMessage?: boolean | `@${string}`;
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['UpdateOrderItemsResult']: AliasType<{
        ['...on Order']: ValueTypes['Order'];
        ['...on OrderModificationError']: ValueTypes['OrderModificationError'];
        ['...on OrderLimitError']: ValueTypes['OrderLimitError'];
        ['...on NegativeQuantityError']: ValueTypes['NegativeQuantityError'];
        ['...on InsufficientStockError']: ValueTypes['InsufficientStockError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['RemoveOrderItemsResult']: AliasType<{
        ['...on Order']: ValueTypes['Order'];
        ['...on OrderModificationError']: ValueTypes['OrderModificationError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['SetOrderShippingMethodResult']: AliasType<{
        ['...on Order']: ValueTypes['Order'];
        ['...on OrderModificationError']: ValueTypes['OrderModificationError'];
        ['...on IneligibleShippingMethodError']: ValueTypes['IneligibleShippingMethodError'];
        ['...on NoActiveOrderError']: ValueTypes['NoActiveOrderError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['ApplyCouponCodeResult']: AliasType<{
        ['...on Order']: ValueTypes['Order'];
        ['...on CouponCodeExpiredError']: ValueTypes['CouponCodeExpiredError'];
        ['...on CouponCodeInvalidError']: ValueTypes['CouponCodeInvalidError'];
        ['...on CouponCodeLimitError']: ValueTypes['CouponCodeLimitError'];
        __typename?: boolean | `@${string}`;
    }>;
    /** @description
ISO 4217 currency code

@docsCategory common */
    ['CurrencyCode']: CurrencyCode;
    ['CustomField']: AliasType<{
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        list?: boolean | `@${string}`;
        label?: ValueTypes['LocalizedString'];
        description?: ValueTypes['LocalizedString'];
        readonly?: boolean | `@${string}`;
        internal?: boolean | `@${string}`;
        nullable?: boolean | `@${string}`;
        ui?: boolean | `@${string}`;
        ['...on StringCustomFieldConfig']?: Omit<
            ValueTypes['StringCustomFieldConfig'],
            keyof ValueTypes['CustomField']
        >;
        ['...on LocaleStringCustomFieldConfig']?: Omit<
            ValueTypes['LocaleStringCustomFieldConfig'],
            keyof ValueTypes['CustomField']
        >;
        ['...on IntCustomFieldConfig']?: Omit<ValueTypes['IntCustomFieldConfig'], keyof ValueTypes['CustomField']>;
        ['...on FloatCustomFieldConfig']?: Omit<ValueTypes['FloatCustomFieldConfig'], keyof ValueTypes['CustomField']>;
        ['...on BooleanCustomFieldConfig']?: Omit<
            ValueTypes['BooleanCustomFieldConfig'],
            keyof ValueTypes['CustomField']
        >;
        ['...on DateTimeCustomFieldConfig']?: Omit<
            ValueTypes['DateTimeCustomFieldConfig'],
            keyof ValueTypes['CustomField']
        >;
        ['...on RelationCustomFieldConfig']?: Omit<
            ValueTypes['RelationCustomFieldConfig'],
            keyof ValueTypes['CustomField']
        >;
        ['...on TextCustomFieldConfig']?: Omit<ValueTypes['TextCustomFieldConfig'], keyof ValueTypes['CustomField']>;
        ['...on LocaleTextCustomFieldConfig']?: Omit<
            ValueTypes['LocaleTextCustomFieldConfig'],
            keyof ValueTypes['CustomField']
        >;
        __typename?: boolean | `@${string}`;
    }>;
    ['StringCustomFieldConfig']: AliasType<{
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        list?: boolean | `@${string}`;
        length?: boolean | `@${string}`;
        label?: ValueTypes['LocalizedString'];
        description?: ValueTypes['LocalizedString'];
        readonly?: boolean | `@${string}`;
        internal?: boolean | `@${string}`;
        nullable?: boolean | `@${string}`;
        pattern?: boolean | `@${string}`;
        options?: ValueTypes['StringFieldOption'];
        ui?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['StringFieldOption']: AliasType<{
        value?: boolean | `@${string}`;
        label?: ValueTypes['LocalizedString'];
        __typename?: boolean | `@${string}`;
    }>;
    ['LocaleStringCustomFieldConfig']: AliasType<{
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        list?: boolean | `@${string}`;
        length?: boolean | `@${string}`;
        label?: ValueTypes['LocalizedString'];
        description?: ValueTypes['LocalizedString'];
        readonly?: boolean | `@${string}`;
        internal?: boolean | `@${string}`;
        nullable?: boolean | `@${string}`;
        pattern?: boolean | `@${string}`;
        ui?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['IntCustomFieldConfig']: AliasType<{
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        list?: boolean | `@${string}`;
        label?: ValueTypes['LocalizedString'];
        description?: ValueTypes['LocalizedString'];
        readonly?: boolean | `@${string}`;
        internal?: boolean | `@${string}`;
        nullable?: boolean | `@${string}`;
        min?: boolean | `@${string}`;
        max?: boolean | `@${string}`;
        step?: boolean | `@${string}`;
        ui?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['FloatCustomFieldConfig']: AliasType<{
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        list?: boolean | `@${string}`;
        label?: ValueTypes['LocalizedString'];
        description?: ValueTypes['LocalizedString'];
        readonly?: boolean | `@${string}`;
        internal?: boolean | `@${string}`;
        nullable?: boolean | `@${string}`;
        min?: boolean | `@${string}`;
        max?: boolean | `@${string}`;
        step?: boolean | `@${string}`;
        ui?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['BooleanCustomFieldConfig']: AliasType<{
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        list?: boolean | `@${string}`;
        label?: ValueTypes['LocalizedString'];
        description?: ValueTypes['LocalizedString'];
        readonly?: boolean | `@${string}`;
        internal?: boolean | `@${string}`;
        nullable?: boolean | `@${string}`;
        ui?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Expects the same validation formats as the `<input type="datetime-local">` HTML element.
See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local#Additional_attributes */
    ['DateTimeCustomFieldConfig']: AliasType<{
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        list?: boolean | `@${string}`;
        label?: ValueTypes['LocalizedString'];
        description?: ValueTypes['LocalizedString'];
        readonly?: boolean | `@${string}`;
        internal?: boolean | `@${string}`;
        nullable?: boolean | `@${string}`;
        min?: boolean | `@${string}`;
        max?: boolean | `@${string}`;
        step?: boolean | `@${string}`;
        ui?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['RelationCustomFieldConfig']: AliasType<{
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        list?: boolean | `@${string}`;
        label?: ValueTypes['LocalizedString'];
        description?: ValueTypes['LocalizedString'];
        readonly?: boolean | `@${string}`;
        internal?: boolean | `@${string}`;
        nullable?: boolean | `@${string}`;
        entity?: boolean | `@${string}`;
        scalarFields?: boolean | `@${string}`;
        ui?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['TextCustomFieldConfig']: AliasType<{
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        list?: boolean | `@${string}`;
        label?: ValueTypes['LocalizedString'];
        description?: ValueTypes['LocalizedString'];
        readonly?: boolean | `@${string}`;
        internal?: boolean | `@${string}`;
        nullable?: boolean | `@${string}`;
        ui?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['LocaleTextCustomFieldConfig']: AliasType<{
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        list?: boolean | `@${string}`;
        label?: ValueTypes['LocalizedString'];
        description?: ValueTypes['LocalizedString'];
        readonly?: boolean | `@${string}`;
        internal?: boolean | `@${string}`;
        nullable?: boolean | `@${string}`;
        ui?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['LocalizedString']: AliasType<{
        languageCode?: boolean | `@${string}`;
        value?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['CustomFieldConfig']: AliasType<{
        ['...on StringCustomFieldConfig']: ValueTypes['StringCustomFieldConfig'];
        ['...on LocaleStringCustomFieldConfig']: ValueTypes['LocaleStringCustomFieldConfig'];
        ['...on IntCustomFieldConfig']: ValueTypes['IntCustomFieldConfig'];
        ['...on FloatCustomFieldConfig']: ValueTypes['FloatCustomFieldConfig'];
        ['...on BooleanCustomFieldConfig']: ValueTypes['BooleanCustomFieldConfig'];
        ['...on DateTimeCustomFieldConfig']: ValueTypes['DateTimeCustomFieldConfig'];
        ['...on RelationCustomFieldConfig']: ValueTypes['RelationCustomFieldConfig'];
        ['...on TextCustomFieldConfig']: ValueTypes['TextCustomFieldConfig'];
        ['...on LocaleTextCustomFieldConfig']: ValueTypes['LocaleTextCustomFieldConfig'];
        __typename?: boolean | `@${string}`;
    }>;
    ['CustomerGroup']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        customers?: [
            { options?: ValueTypes['CustomerListOptions'] | undefined | null | Variable<any, string> },
            ValueTypes['CustomerList'],
        ];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['CustomerListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined | null | Variable<any, string>;
        /** Takes n results, for use in pagination */
        take?: number | undefined | null | Variable<any, string>;
        /** Specifies which properties to sort the results by */
        sort?: ValueTypes['CustomerSortParameter'] | undefined | null | Variable<any, string>;
        /** Allows the results to be filtered */
        filter?: ValueTypes['CustomerFilterParameter'] | undefined | null | Variable<any, string>;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ValueTypes['LogicalOperator'] | undefined | null | Variable<any, string>;
    };
    ['Customer']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        title?: boolean | `@${string}`;
        firstName?: boolean | `@${string}`;
        lastName?: boolean | `@${string}`;
        phoneNumber?: boolean | `@${string}`;
        emailAddress?: boolean | `@${string}`;
        addresses?: ValueTypes['Address'];
        orders?: [
            { options?: ValueTypes['OrderListOptions'] | undefined | null | Variable<any, string> },
            ValueTypes['OrderList'],
        ];
        user?: ValueTypes['User'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['CustomerList']: AliasType<{
        items?: ValueTypes['Customer'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['FacetValue']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        facet?: ValueTypes['Facet'];
        facetId?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        translations?: ValueTypes['FacetValueTranslation'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['FacetValueTranslation']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Facet']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        values?: ValueTypes['FacetValue'];
        valueList?: [
            { options?: ValueTypes['FacetValueListOptions'] | undefined | null | Variable<any, string> },
            ValueTypes['FacetValueList'],
        ];
        translations?: ValueTypes['FacetTranslation'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['FacetTranslation']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['FacetList']: AliasType<{
        items?: ValueTypes['Facet'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['FacetValueListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined | null | Variable<any, string>;
        /** Takes n results, for use in pagination */
        take?: number | undefined | null | Variable<any, string>;
        /** Specifies which properties to sort the results by */
        sort?: ValueTypes['FacetValueSortParameter'] | undefined | null | Variable<any, string>;
        /** Allows the results to be filtered */
        filter?: ValueTypes['FacetValueFilterParameter'] | undefined | null | Variable<any, string>;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ValueTypes['LogicalOperator'] | undefined | null | Variable<any, string>;
    };
    ['FacetValueList']: AliasType<{
        items?: ValueTypes['FacetValue'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['HistoryEntry']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        data?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['HistoryEntryType']: HistoryEntryType;
    ['HistoryEntryList']: AliasType<{
        items?: ValueTypes['HistoryEntry'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['HistoryEntryListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined | null | Variable<any, string>;
        /** Takes n results, for use in pagination */
        take?: number | undefined | null | Variable<any, string>;
        /** Specifies which properties to sort the results by */
        sort?: ValueTypes['HistoryEntrySortParameter'] | undefined | null | Variable<any, string>;
        /** Allows the results to be filtered */
        filter?: ValueTypes['HistoryEntryFilterParameter'] | undefined | null | Variable<any, string>;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ValueTypes['LogicalOperator'] | undefined | null | Variable<any, string>;
    };
    /** @description
Languages in the form of a ISO 639-1 language code with optional
region or script modifier (e.g. de_AT). The selection available is based
on the [Unicode CLDR summary list](https://unicode-org.github.io/cldr-staging/charts/37/summary/root.html)
and includes the major spoken languages of the world and any widely-used variants.

@docsCategory common */
    ['LanguageCode']: LanguageCode;
    ['OrderType']: OrderType;
    ['Order']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        /** The date & time that the Order was placed, i.e. the Customer
completed the checkout and the Order is no longer "active" */
        orderPlacedAt?: boolean | `@${string}`;
        /** A unique code for the Order */
        code?: boolean | `@${string}`;
        state?: boolean | `@${string}`;
        /** An order is active as long as the payment process has not been completed */
        active?: boolean | `@${string}`;
        customer?: ValueTypes['Customer'];
        shippingAddress?: ValueTypes['OrderAddress'];
        billingAddress?: ValueTypes['OrderAddress'];
        lines?: ValueTypes['OrderLine'];
        /** Surcharges are arbitrary modifications to the Order total which are neither
ProductVariants nor discounts resulting from applied Promotions. For example,
one-off discounts based on customer interaction, or surcharges based on payment
methods. */
        surcharges?: ValueTypes['Surcharge'];
        discounts?: ValueTypes['Discount'];
        /** An array of all coupon codes applied to the Order */
        couponCodes?: boolean | `@${string}`;
        /** Promotions applied to the order. Only gets populated after the payment process has completed. */
        promotions?: ValueTypes['Promotion'];
        payments?: ValueTypes['Payment'];
        fulfillments?: ValueTypes['Fulfillment'];
        totalQuantity?: boolean | `@${string}`;
        /** The subTotal is the total of all OrderLines in the Order. This figure also includes any Order-level
discounts which have been prorated (proportionally distributed) amongst the items of each OrderLine.
To get a total of all OrderLines which does not account for prorated discounts, use the
sum of `OrderLine.discountedLinePrice` values. */
        subTotal?: boolean | `@${string}`;
        /** Same as subTotal, but inclusive of tax */
        subTotalWithTax?: boolean | `@${string}`;
        currencyCode?: boolean | `@${string}`;
        shippingLines?: ValueTypes['ShippingLine'];
        shipping?: boolean | `@${string}`;
        shippingWithTax?: boolean | `@${string}`;
        /** Equal to subTotal plus shipping */
        total?: boolean | `@${string}`;
        /** The final payable amount. Equal to subTotalWithTax plus shippingWithTax */
        totalWithTax?: boolean | `@${string}`;
        /** A summary of the taxes being applied to this Order */
        taxSummary?: ValueTypes['OrderTaxSummary'];
        history?: [
            { options?: ValueTypes['HistoryEntryListOptions'] | undefined | null | Variable<any, string> },
            ValueTypes['HistoryEntryList'],
        ];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** A summary of the taxes being applied to this order, grouped
by taxRate. */
    ['OrderTaxSummary']: AliasType<{
        /** A description of this tax */
        description?: boolean | `@${string}`;
        /** The taxRate as a percentage */
        taxRate?: boolean | `@${string}`;
        /** The total net price of OrderLines to which this taxRate applies */
        taxBase?: boolean | `@${string}`;
        /** The total tax being applied to the Order at this taxRate */
        taxTotal?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['OrderAddress']: AliasType<{
        fullName?: boolean | `@${string}`;
        company?: boolean | `@${string}`;
        streetLine1?: boolean | `@${string}`;
        streetLine2?: boolean | `@${string}`;
        city?: boolean | `@${string}`;
        province?: boolean | `@${string}`;
        postalCode?: boolean | `@${string}`;
        country?: boolean | `@${string}`;
        countryCode?: boolean | `@${string}`;
        phoneNumber?: boolean | `@${string}`;
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['OrderList']: AliasType<{
        items?: ValueTypes['Order'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ShippingLine']: AliasType<{
        id?: boolean | `@${string}`;
        shippingMethod?: ValueTypes['ShippingMethod'];
        price?: boolean | `@${string}`;
        priceWithTax?: boolean | `@${string}`;
        discountedPrice?: boolean | `@${string}`;
        discountedPriceWithTax?: boolean | `@${string}`;
        discounts?: ValueTypes['Discount'];
        __typename?: boolean | `@${string}`;
    }>;
    ['Discount']: AliasType<{
        adjustmentSource?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        amount?: boolean | `@${string}`;
        amountWithTax?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['OrderLine']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        productVariant?: ValueTypes['ProductVariant'];
        featuredAsset?: ValueTypes['Asset'];
        /** The price of a single unit, excluding tax and discounts */
        unitPrice?: boolean | `@${string}`;
        /** The price of a single unit, including tax but excluding discounts */
        unitPriceWithTax?: boolean | `@${string}`;
        /** Non-zero if the unitPrice has changed since it was initially added to Order */
        unitPriceChangeSinceAdded?: boolean | `@${string}`;
        /** Non-zero if the unitPriceWithTax has changed since it was initially added to Order */
        unitPriceWithTaxChangeSinceAdded?: boolean | `@${string}`;
        /** The price of a single unit including discounts, excluding tax.

If Order-level discounts have been applied, this will not be the
actual taxable unit price (see `proratedUnitPrice`), but is generally the
correct price to display to customers to avoid confusion
about the internal handling of distributed Order-level discounts. */
        discountedUnitPrice?: boolean | `@${string}`;
        /** The price of a single unit including discounts and tax */
        discountedUnitPriceWithTax?: boolean | `@${string}`;
        /** The actual unit price, taking into account both item discounts _and_ prorated (proportionally-distributed)
Order-level discounts. This value is the true economic value of the OrderItem, and is used in tax
and refund calculations. */
        proratedUnitPrice?: boolean | `@${string}`;
        /** The proratedUnitPrice including tax */
        proratedUnitPriceWithTax?: boolean | `@${string}`;
        /** The quantity of items purchased */
        quantity?: boolean | `@${string}`;
        /** The quantity at the time the Order was placed */
        orderPlacedQuantity?: boolean | `@${string}`;
        taxRate?: boolean | `@${string}`;
        /** The total price of the line excluding tax and discounts. */
        linePrice?: boolean | `@${string}`;
        /** The total price of the line including tax but excluding discounts. */
        linePriceWithTax?: boolean | `@${string}`;
        /** The price of the line including discounts, excluding tax */
        discountedLinePrice?: boolean | `@${string}`;
        /** The price of the line including discounts and tax */
        discountedLinePriceWithTax?: boolean | `@${string}`;
        /** The actual line price, taking into account both item discounts _and_ prorated (proportionally-distributed)
Order-level discounts. This value is the true economic value of the OrderLine, and is used in tax
and refund calculations. */
        proratedLinePrice?: boolean | `@${string}`;
        /** The proratedLinePrice including tax */
        proratedLinePriceWithTax?: boolean | `@${string}`;
        /** The total tax on this line */
        lineTax?: boolean | `@${string}`;
        discounts?: ValueTypes['Discount'];
        taxLines?: ValueTypes['TaxLine'];
        order?: ValueTypes['Order'];
        fulfillmentLines?: ValueTypes['FulfillmentLine'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Payment']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        method?: boolean | `@${string}`;
        amount?: boolean | `@${string}`;
        state?: boolean | `@${string}`;
        transactionId?: boolean | `@${string}`;
        errorMessage?: boolean | `@${string}`;
        refunds?: ValueTypes['Refund'];
        metadata?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['RefundLine']: AliasType<{
        orderLine?: ValueTypes['OrderLine'];
        orderLineId?: boolean | `@${string}`;
        quantity?: boolean | `@${string}`;
        refund?: ValueTypes['Refund'];
        refundId?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Refund']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        items?: boolean | `@${string}`;
        shipping?: boolean | `@${string}`;
        adjustment?: boolean | `@${string}`;
        total?: boolean | `@${string}`;
        method?: boolean | `@${string}`;
        state?: boolean | `@${string}`;
        transactionId?: boolean | `@${string}`;
        reason?: boolean | `@${string}`;
        lines?: ValueTypes['RefundLine'];
        paymentId?: boolean | `@${string}`;
        metadata?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['FulfillmentLine']: AliasType<{
        orderLine?: ValueTypes['OrderLine'];
        orderLineId?: boolean | `@${string}`;
        quantity?: boolean | `@${string}`;
        fulfillment?: ValueTypes['Fulfillment'];
        fulfillmentId?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Fulfillment']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        lines?: ValueTypes['FulfillmentLine'];
        summary?: ValueTypes['FulfillmentLine'];
        state?: boolean | `@${string}`;
        method?: boolean | `@${string}`;
        trackingCode?: boolean | `@${string}`;
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Surcharge']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        sku?: boolean | `@${string}`;
        taxLines?: ValueTypes['TaxLine'];
        price?: boolean | `@${string}`;
        priceWithTax?: boolean | `@${string}`;
        taxRate?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['PaymentMethod']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        enabled?: boolean | `@${string}`;
        checker?: ValueTypes['ConfigurableOperation'];
        handler?: ValueTypes['ConfigurableOperation'];
        translations?: ValueTypes['PaymentMethodTranslation'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['PaymentMethodTranslation']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ProductOptionGroup']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        options?: ValueTypes['ProductOption'];
        translations?: ValueTypes['ProductOptionGroupTranslation'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ProductOptionGroupTranslation']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ProductOption']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        groupId?: boolean | `@${string}`;
        group?: ValueTypes['ProductOptionGroup'];
        translations?: ValueTypes['ProductOptionTranslation'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ProductOptionTranslation']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['SearchReindexResponse']: AliasType<{
        success?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['SearchResponse']: AliasType<{
        items?: ValueTypes['SearchResult'];
        totalItems?: boolean | `@${string}`;
        facetValues?: ValueTypes['FacetValueResult'];
        collections?: ValueTypes['CollectionResult'];
        __typename?: boolean | `@${string}`;
    }>;
    /** Which FacetValues are present in the products returned
by the search, and in what quantity. */
    ['FacetValueResult']: AliasType<{
        facetValue?: ValueTypes['FacetValue'];
        count?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Which Collections are present in the products returned
by the search, and in what quantity. */
    ['CollectionResult']: AliasType<{
        collection?: ValueTypes['Collection'];
        count?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['SearchResultAsset']: AliasType<{
        id?: boolean | `@${string}`;
        preview?: boolean | `@${string}`;
        focalPoint?: ValueTypes['Coordinate'];
        __typename?: boolean | `@${string}`;
    }>;
    ['SearchResult']: AliasType<{
        sku?: boolean | `@${string}`;
        slug?: boolean | `@${string}`;
        productId?: boolean | `@${string}`;
        productName?: boolean | `@${string}`;
        productAsset?: ValueTypes['SearchResultAsset'];
        productVariantId?: boolean | `@${string}`;
        productVariantName?: boolean | `@${string}`;
        productVariantAsset?: ValueTypes['SearchResultAsset'];
        price?: ValueTypes['SearchResultPrice'];
        priceWithTax?: ValueTypes['SearchResultPrice'];
        currencyCode?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        facetIds?: boolean | `@${string}`;
        facetValueIds?: boolean | `@${string}`;
        /** An array of ids of the Collections in which this result appears */
        collectionIds?: boolean | `@${string}`;
        /** A relevance score for the result. Differs between database implementations */
        score?: boolean | `@${string}`;
        inStock?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** The price of a search result product, either as a range or as a single price */
    ['SearchResultPrice']: AliasType<{
        ['...on PriceRange']: ValueTypes['PriceRange'];
        ['...on SinglePrice']: ValueTypes['SinglePrice'];
        __typename?: boolean | `@${string}`;
    }>;
    /** The price value where the result has a single price */
    ['SinglePrice']: AliasType<{
        value?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** The price range where the result has more than one price */
    ['PriceRange']: AliasType<{
        min?: boolean | `@${string}`;
        max?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Product']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        slug?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        featuredAsset?: ValueTypes['Asset'];
        assets?: ValueTypes['Asset'];
        /** Returns all ProductVariants */
        variants?: ValueTypes['ProductVariant'];
        variantList?: [
            { options?: ValueTypes['ProductVariantListOptions'] | undefined | null | Variable<any, string> },
            ValueTypes['ProductVariantList'],
        ];
        optionGroups?: ValueTypes['ProductOptionGroup'];
        facetValues?: ValueTypes['FacetValue'];
        translations?: ValueTypes['ProductTranslation'];
        collections?: ValueTypes['Collection'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ProductTranslation']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        slug?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ProductList']: AliasType<{
        items?: ValueTypes['Product'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ProductVariantList']: AliasType<{
        items?: ValueTypes['ProductVariant'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ProductVariant']: AliasType<{
        id?: boolean | `@${string}`;
        product?: ValueTypes['Product'];
        productId?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        sku?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        featuredAsset?: ValueTypes['Asset'];
        assets?: ValueTypes['Asset'];
        price?: boolean | `@${string}`;
        currencyCode?: boolean | `@${string}`;
        priceWithTax?: boolean | `@${string}`;
        stockLevel?: boolean | `@${string}`;
        taxRateApplied?: ValueTypes['TaxRate'];
        taxCategory?: ValueTypes['TaxCategory'];
        options?: ValueTypes['ProductOption'];
        facetValues?: ValueTypes['FacetValue'];
        translations?: ValueTypes['ProductVariantTranslation'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ProductVariantTranslation']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Promotion']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        startsAt?: boolean | `@${string}`;
        endsAt?: boolean | `@${string}`;
        couponCode?: boolean | `@${string}`;
        perCustomerUsageLimit?: boolean | `@${string}`;
        usageLimit?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        enabled?: boolean | `@${string}`;
        conditions?: ValueTypes['ConfigurableOperation'];
        actions?: ValueTypes['ConfigurableOperation'];
        translations?: ValueTypes['PromotionTranslation'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['PromotionTranslation']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['PromotionList']: AliasType<{
        items?: ValueTypes['Promotion'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Region']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        enabled?: boolean | `@${string}`;
        parent?: ValueTypes['Region'];
        parentId?: boolean | `@${string}`;
        translations?: ValueTypes['RegionTranslation'];
        ['...on Country']?: Omit<ValueTypes['Country'], keyof ValueTypes['Region']>;
        ['...on Province']?: Omit<ValueTypes['Province'], keyof ValueTypes['Region']>;
        __typename?: boolean | `@${string}`;
    }>;
    ['RegionTranslation']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Country']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        enabled?: boolean | `@${string}`;
        parent?: ValueTypes['Region'];
        parentId?: boolean | `@${string}`;
        translations?: ValueTypes['RegionTranslation'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['CountryList']: AliasType<{
        items?: ValueTypes['Country'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Province']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        enabled?: boolean | `@${string}`;
        parent?: ValueTypes['Region'];
        parentId?: boolean | `@${string}`;
        translations?: ValueTypes['RegionTranslation'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ProvinceList']: AliasType<{
        items?: ValueTypes['Province'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Role']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        permissions?: boolean | `@${string}`;
        channels?: ValueTypes['Channel'];
        __typename?: boolean | `@${string}`;
    }>;
    ['RoleList']: AliasType<{
        items?: ValueTypes['Role'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Seller']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ShippingMethod']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        fulfillmentHandlerCode?: boolean | `@${string}`;
        checker?: ValueTypes['ConfigurableOperation'];
        calculator?: ValueTypes['ConfigurableOperation'];
        translations?: ValueTypes['ShippingMethodTranslation'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ShippingMethodTranslation']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ShippingMethodList']: AliasType<{
        items?: ValueTypes['ShippingMethod'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Tag']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        value?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['TagList']: AliasType<{
        items?: ValueTypes['Tag'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['TaxCategory']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        isDefault?: boolean | `@${string}`;
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['TaxRate']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        enabled?: boolean | `@${string}`;
        value?: boolean | `@${string}`;
        category?: ValueTypes['TaxCategory'];
        zone?: ValueTypes['Zone'];
        customerGroup?: ValueTypes['CustomerGroup'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['TaxRateList']: AliasType<{
        items?: ValueTypes['TaxRate'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['User']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        identifier?: boolean | `@${string}`;
        verified?: boolean | `@${string}`;
        roles?: ValueTypes['Role'];
        lastLogin?: boolean | `@${string}`;
        authenticationMethods?: ValueTypes['AuthenticationMethod'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['AuthenticationMethod']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        strategy?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Zone']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        members?: ValueTypes['Region'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to add a Payment to an Order that is not in the `ArrangingPayment` state. */
    ['OrderPaymentStateError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to add a Payment using a PaymentMethod for which the Order is not eligible. */
    ['IneligiblePaymentMethodError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        eligibilityCheckerMessage?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when a Payment fails due to an error. */
    ['PaymentFailedError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        paymentErrorMessage?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when a Payment is declined by the payment provider. */
    ['PaymentDeclinedError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        paymentErrorMessage?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to set the Customer for an Order when already logged in. */
    ['AlreadyLoggedInError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to register or verify a customer account without a password, when one is required. */
    ['MissingPasswordError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to register or verify a customer account where the given password fails password validation. */
    ['PasswordValidationError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        validationErrorMessage?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to verify a customer account with a password, when a password has already been set. */
    ['PasswordAlreadySetError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if the verification token (used to verify a Customer's email address) is either
invalid or does not match any expected tokens. */
    ['VerificationTokenInvalidError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if the verification token (used to verify a Customer's email address) is valid, but has
expired according to the `verificationTokenDuration` setting in the AuthOptions. */
    ['VerificationTokenExpiredError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if the token used to change a Customer's email address is either
invalid or does not match any expected tokens. */
    ['IdentifierChangeTokenInvalidError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if the token used to change a Customer's email address is valid, but has
expired according to the `verificationTokenDuration` setting in the AuthOptions. */
    ['IdentifierChangeTokenExpiredError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if the token used to reset a Customer's password is either
invalid or does not match any expected tokens. */
    ['PasswordResetTokenInvalidError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if the token used to reset a Customer's password is valid, but has
expired according to the `verificationTokenDuration` setting in the AuthOptions. */
    ['PasswordResetTokenExpiredError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if `authOptions.requireVerification` is set to `true` (which is the default)
and an unverified user attempts to authenticate. */
    ['NotVerifiedError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['AuthenticationInput']: {
        native?: ValueTypes['NativeAuthInput'] | undefined | null | Variable<any, string>;
    };
    ['RegisterCustomerInput']: {
        emailAddress: string | Variable<any, string>;
        title?: string | undefined | null | Variable<any, string>;
        firstName?: string | undefined | null | Variable<any, string>;
        lastName?: string | undefined | null | Variable<any, string>;
        phoneNumber?: string | undefined | null | Variable<any, string>;
        password?: string | undefined | null | Variable<any, string>;
    };
    ['UpdateCustomerInput']: {
        title?: string | undefined | null | Variable<any, string>;
        firstName?: string | undefined | null | Variable<any, string>;
        lastName?: string | undefined | null | Variable<any, string>;
        phoneNumber?: string | undefined | null | Variable<any, string>;
        customFields?: ValueTypes['JSON'] | undefined | null | Variable<any, string>;
    };
    ['UpdateOrderInput']: {
        customFields?: ValueTypes['JSON'] | undefined | null | Variable<any, string>;
    };
    /** Passed as input to the `addPaymentToOrder` mutation. */
    ['PaymentInput']: {
        /** This field should correspond to the `code` property of a PaymentMethod. */
        method: string | Variable<any, string>;
        /** This field should contain arbitrary data passed to the specified PaymentMethodHandler's `createPayment()` method
as the "metadata" argument. For example, it could contain an ID for the payment and other
data generated by the payment provider. */
        metadata: ValueTypes['JSON'] | Variable<any, string>;
    };
    ['CollectionListOptions']: {
        topLevelOnly?: boolean | undefined | null | Variable<any, string>;
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined | null | Variable<any, string>;
        /** Takes n results, for use in pagination */
        take?: number | undefined | null | Variable<any, string>;
        /** Specifies which properties to sort the results by */
        sort?: ValueTypes['CollectionSortParameter'] | undefined | null | Variable<any, string>;
        /** Allows the results to be filtered */
        filter?: ValueTypes['CollectionFilterParameter'] | undefined | null | Variable<any, string>;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ValueTypes['LogicalOperator'] | undefined | null | Variable<any, string>;
    };
    ['FacetListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined | null | Variable<any, string>;
        /** Takes n results, for use in pagination */
        take?: number | undefined | null | Variable<any, string>;
        /** Specifies which properties to sort the results by */
        sort?: ValueTypes['FacetSortParameter'] | undefined | null | Variable<any, string>;
        /** Allows the results to be filtered */
        filter?: ValueTypes['FacetFilterParameter'] | undefined | null | Variable<any, string>;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ValueTypes['LogicalOperator'] | undefined | null | Variable<any, string>;
    };
    ['OrderListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined | null | Variable<any, string>;
        /** Takes n results, for use in pagination */
        take?: number | undefined | null | Variable<any, string>;
        /** Specifies which properties to sort the results by */
        sort?: ValueTypes['OrderSortParameter'] | undefined | null | Variable<any, string>;
        /** Allows the results to be filtered */
        filter?: ValueTypes['OrderFilterParameter'] | undefined | null | Variable<any, string>;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ValueTypes['LogicalOperator'] | undefined | null | Variable<any, string>;
    };
    ['ProductListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined | null | Variable<any, string>;
        /** Takes n results, for use in pagination */
        take?: number | undefined | null | Variable<any, string>;
        /** Specifies which properties to sort the results by */
        sort?: ValueTypes['ProductSortParameter'] | undefined | null | Variable<any, string>;
        /** Allows the results to be filtered */
        filter?: ValueTypes['ProductFilterParameter'] | undefined | null | Variable<any, string>;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ValueTypes['LogicalOperator'] | undefined | null | Variable<any, string>;
    };
    ['ProductVariantListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined | null | Variable<any, string>;
        /** Takes n results, for use in pagination */
        take?: number | undefined | null | Variable<any, string>;
        /** Specifies which properties to sort the results by */
        sort?: ValueTypes['ProductVariantSortParameter'] | undefined | null | Variable<any, string>;
        /** Allows the results to be filtered */
        filter?: ValueTypes['ProductVariantFilterParameter'] | undefined | null | Variable<any, string>;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ValueTypes['LogicalOperator'] | undefined | null | Variable<any, string>;
    };
    ['AddPaymentToOrderResult']: AliasType<{
        ['...on Order']: ValueTypes['Order'];
        ['...on OrderPaymentStateError']: ValueTypes['OrderPaymentStateError'];
        ['...on IneligiblePaymentMethodError']: ValueTypes['IneligiblePaymentMethodError'];
        ['...on PaymentFailedError']: ValueTypes['PaymentFailedError'];
        ['...on PaymentDeclinedError']: ValueTypes['PaymentDeclinedError'];
        ['...on OrderStateTransitionError']: ValueTypes['OrderStateTransitionError'];
        ['...on NoActiveOrderError']: ValueTypes['NoActiveOrderError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['TransitionOrderToStateResult']: AliasType<{
        ['...on Order']: ValueTypes['Order'];
        ['...on OrderStateTransitionError']: ValueTypes['OrderStateTransitionError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['SetCustomerForOrderResult']: AliasType<{
        ['...on Order']: ValueTypes['Order'];
        ['...on AlreadyLoggedInError']: ValueTypes['AlreadyLoggedInError'];
        ['...on EmailAddressConflictError']: ValueTypes['EmailAddressConflictError'];
        ['...on NoActiveOrderError']: ValueTypes['NoActiveOrderError'];
        ['...on GuestCheckoutError']: ValueTypes['GuestCheckoutError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['RegisterCustomerAccountResult']: AliasType<{
        ['...on Success']: ValueTypes['Success'];
        ['...on MissingPasswordError']: ValueTypes['MissingPasswordError'];
        ['...on PasswordValidationError']: ValueTypes['PasswordValidationError'];
        ['...on NativeAuthStrategyError']: ValueTypes['NativeAuthStrategyError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['RefreshCustomerVerificationResult']: AliasType<{
        ['...on Success']: ValueTypes['Success'];
        ['...on NativeAuthStrategyError']: ValueTypes['NativeAuthStrategyError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['VerifyCustomerAccountResult']: AliasType<{
        ['...on CurrentUser']: ValueTypes['CurrentUser'];
        ['...on VerificationTokenInvalidError']: ValueTypes['VerificationTokenInvalidError'];
        ['...on VerificationTokenExpiredError']: ValueTypes['VerificationTokenExpiredError'];
        ['...on MissingPasswordError']: ValueTypes['MissingPasswordError'];
        ['...on PasswordValidationError']: ValueTypes['PasswordValidationError'];
        ['...on PasswordAlreadySetError']: ValueTypes['PasswordAlreadySetError'];
        ['...on NativeAuthStrategyError']: ValueTypes['NativeAuthStrategyError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['UpdateCustomerPasswordResult']: AliasType<{
        ['...on Success']: ValueTypes['Success'];
        ['...on InvalidCredentialsError']: ValueTypes['InvalidCredentialsError'];
        ['...on PasswordValidationError']: ValueTypes['PasswordValidationError'];
        ['...on NativeAuthStrategyError']: ValueTypes['NativeAuthStrategyError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['RequestUpdateCustomerEmailAddressResult']: AliasType<{
        ['...on Success']: ValueTypes['Success'];
        ['...on InvalidCredentialsError']: ValueTypes['InvalidCredentialsError'];
        ['...on EmailAddressConflictError']: ValueTypes['EmailAddressConflictError'];
        ['...on NativeAuthStrategyError']: ValueTypes['NativeAuthStrategyError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['UpdateCustomerEmailAddressResult']: AliasType<{
        ['...on Success']: ValueTypes['Success'];
        ['...on IdentifierChangeTokenInvalidError']: ValueTypes['IdentifierChangeTokenInvalidError'];
        ['...on IdentifierChangeTokenExpiredError']: ValueTypes['IdentifierChangeTokenExpiredError'];
        ['...on NativeAuthStrategyError']: ValueTypes['NativeAuthStrategyError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['RequestPasswordResetResult']: AliasType<{
        ['...on Success']: ValueTypes['Success'];
        ['...on NativeAuthStrategyError']: ValueTypes['NativeAuthStrategyError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['ResetPasswordResult']: AliasType<{
        ['...on CurrentUser']: ValueTypes['CurrentUser'];
        ['...on PasswordResetTokenInvalidError']: ValueTypes['PasswordResetTokenInvalidError'];
        ['...on PasswordResetTokenExpiredError']: ValueTypes['PasswordResetTokenExpiredError'];
        ['...on PasswordValidationError']: ValueTypes['PasswordValidationError'];
        ['...on NativeAuthStrategyError']: ValueTypes['NativeAuthStrategyError'];
        ['...on NotVerifiedError']: ValueTypes['NotVerifiedError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['NativeAuthenticationResult']: AliasType<{
        ['...on CurrentUser']: ValueTypes['CurrentUser'];
        ['...on InvalidCredentialsError']: ValueTypes['InvalidCredentialsError'];
        ['...on NotVerifiedError']: ValueTypes['NotVerifiedError'];
        ['...on NativeAuthStrategyError']: ValueTypes['NativeAuthStrategyError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['AuthenticationResult']: AliasType<{
        ['...on CurrentUser']: ValueTypes['CurrentUser'];
        ['...on InvalidCredentialsError']: ValueTypes['InvalidCredentialsError'];
        ['...on NotVerifiedError']: ValueTypes['NotVerifiedError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['ActiveOrderResult']: AliasType<{
        ['...on Order']: ValueTypes['Order'];
        ['...on NoActiveOrderError']: ValueTypes['NoActiveOrderError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['ProductVariantFilterParameter']: {
        id?: ValueTypes['IDOperators'] | undefined | null | Variable<any, string>;
        productId?: ValueTypes['IDOperators'] | undefined | null | Variable<any, string>;
        createdAt?: ValueTypes['DateOperators'] | undefined | null | Variable<any, string>;
        updatedAt?: ValueTypes['DateOperators'] | undefined | null | Variable<any, string>;
        languageCode?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        sku?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        name?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        price?: ValueTypes['NumberOperators'] | undefined | null | Variable<any, string>;
        currencyCode?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        priceWithTax?: ValueTypes['NumberOperators'] | undefined | null | Variable<any, string>;
        stockLevel?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
    };
    ['ProductVariantSortParameter']: {
        id?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        productId?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        createdAt?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        updatedAt?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        sku?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        name?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        price?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        priceWithTax?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        stockLevel?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
    };
    ['CustomerFilterParameter']: {
        id?: ValueTypes['IDOperators'] | undefined | null | Variable<any, string>;
        createdAt?: ValueTypes['DateOperators'] | undefined | null | Variable<any, string>;
        updatedAt?: ValueTypes['DateOperators'] | undefined | null | Variable<any, string>;
        title?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        firstName?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        lastName?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        phoneNumber?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        emailAddress?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
    };
    ['CustomerSortParameter']: {
        id?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        createdAt?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        updatedAt?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        title?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        firstName?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        lastName?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        phoneNumber?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        emailAddress?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
    };
    ['OrderFilterParameter']: {
        id?: ValueTypes['IDOperators'] | undefined | null | Variable<any, string>;
        createdAt?: ValueTypes['DateOperators'] | undefined | null | Variable<any, string>;
        updatedAt?: ValueTypes['DateOperators'] | undefined | null | Variable<any, string>;
        type?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        orderPlacedAt?: ValueTypes['DateOperators'] | undefined | null | Variable<any, string>;
        code?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        state?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        active?: ValueTypes['BooleanOperators'] | undefined | null | Variable<any, string>;
        totalQuantity?: ValueTypes['NumberOperators'] | undefined | null | Variable<any, string>;
        subTotal?: ValueTypes['NumberOperators'] | undefined | null | Variable<any, string>;
        subTotalWithTax?: ValueTypes['NumberOperators'] | undefined | null | Variable<any, string>;
        currencyCode?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        shipping?: ValueTypes['NumberOperators'] | undefined | null | Variable<any, string>;
        shippingWithTax?: ValueTypes['NumberOperators'] | undefined | null | Variable<any, string>;
        total?: ValueTypes['NumberOperators'] | undefined | null | Variable<any, string>;
        totalWithTax?: ValueTypes['NumberOperators'] | undefined | null | Variable<any, string>;
    };
    ['OrderSortParameter']: {
        id?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        createdAt?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        updatedAt?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        orderPlacedAt?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        code?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        state?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        totalQuantity?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        subTotal?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        subTotalWithTax?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        shipping?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        shippingWithTax?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        total?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        totalWithTax?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
    };
    ['FacetValueFilterParameter']: {
        id?: ValueTypes['IDOperators'] | undefined | null | Variable<any, string>;
        createdAt?: ValueTypes['DateOperators'] | undefined | null | Variable<any, string>;
        updatedAt?: ValueTypes['DateOperators'] | undefined | null | Variable<any, string>;
        languageCode?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        facetId?: ValueTypes['IDOperators'] | undefined | null | Variable<any, string>;
        name?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        code?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
    };
    ['FacetValueSortParameter']: {
        id?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        createdAt?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        updatedAt?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        facetId?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        name?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        code?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
    };
    ['HistoryEntryFilterParameter']: {
        id?: ValueTypes['IDOperators'] | undefined | null | Variable<any, string>;
        createdAt?: ValueTypes['DateOperators'] | undefined | null | Variable<any, string>;
        updatedAt?: ValueTypes['DateOperators'] | undefined | null | Variable<any, string>;
        type?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
    };
    ['HistoryEntrySortParameter']: {
        id?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        createdAt?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        updatedAt?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
    };
    ['CollectionFilterParameter']: {
        id?: ValueTypes['IDOperators'] | undefined | null | Variable<any, string>;
        createdAt?: ValueTypes['DateOperators'] | undefined | null | Variable<any, string>;
        updatedAt?: ValueTypes['DateOperators'] | undefined | null | Variable<any, string>;
        languageCode?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        name?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        slug?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        position?: ValueTypes['NumberOperators'] | undefined | null | Variable<any, string>;
        description?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        parentId?: ValueTypes['IDOperators'] | undefined | null | Variable<any, string>;
    };
    ['CollectionSortParameter']: {
        id?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        createdAt?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        updatedAt?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        name?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        slug?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        position?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        description?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        parentId?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
    };
    ['FacetFilterParameter']: {
        id?: ValueTypes['IDOperators'] | undefined | null | Variable<any, string>;
        createdAt?: ValueTypes['DateOperators'] | undefined | null | Variable<any, string>;
        updatedAt?: ValueTypes['DateOperators'] | undefined | null | Variable<any, string>;
        languageCode?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        name?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        code?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
    };
    ['FacetSortParameter']: {
        id?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        createdAt?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        updatedAt?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        name?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        code?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
    };
    ['ProductFilterParameter']: {
        id?: ValueTypes['IDOperators'] | undefined | null | Variable<any, string>;
        createdAt?: ValueTypes['DateOperators'] | undefined | null | Variable<any, string>;
        updatedAt?: ValueTypes['DateOperators'] | undefined | null | Variable<any, string>;
        languageCode?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        name?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        slug?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
        description?: ValueTypes['StringOperators'] | undefined | null | Variable<any, string>;
    };
    ['ProductSortParameter']: {
        id?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        createdAt?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        updatedAt?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        name?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        slug?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
        description?: ValueTypes['SortOrder'] | undefined | null | Variable<any, string>;
    };
    ['NativeAuthInput']: {
        username: string | Variable<any, string>;
        password: string | Variable<any, string>;
    };
};

export type ResolverInputTypes = {
    ['Query']: AliasType<{
        /** The active Channel */
        activeChannel?: ResolverInputTypes['Channel'];
        /** The active Customer */
        activeCustomer?: ResolverInputTypes['Customer'];
        /** The active Order. Will be `null` until an Order is created via `addItemToOrder`. Once an Order reaches the
state of `PaymentAuthorized` or `PaymentSettled`, then that Order is no longer considered "active" and this
query will once again return `null`. */
        activeOrder?: ResolverInputTypes['Order'];
        /** An array of supported Countries */
        availableCountries?: ResolverInputTypes['Country'];
        collections?: [
            { options?: ResolverInputTypes['CollectionListOptions'] | undefined | null },
            ResolverInputTypes['CollectionList'],
        ];
        collection?: [
            { id?: string | undefined | null; slug?: string | undefined | null },
            ResolverInputTypes['Collection'],
        ];
        /** Returns a list of eligible shipping methods based on the current active Order */
        eligibleShippingMethods?: ResolverInputTypes['ShippingMethodQuote'];
        /** Returns a list of payment methods and their eligibility based on the current active Order */
        eligiblePaymentMethods?: ResolverInputTypes['PaymentMethodQuote'];
        facets?: [
            { options?: ResolverInputTypes['FacetListOptions'] | undefined | null },
            ResolverInputTypes['FacetList'],
        ];
        facet?: [{ id: string }, ResolverInputTypes['Facet']];
        /** Returns information about the current authenticated User */
        me?: ResolverInputTypes['CurrentUser'];
        /** Returns the possible next states that the activeOrder can transition to */
        nextOrderStates?: boolean | `@${string}`;
        order?: [{ id: string }, ResolverInputTypes['Order']];
        orderByCode?: [{ code: string }, ResolverInputTypes['Order']];
        product?: [{ id?: string | undefined | null; slug?: string | undefined | null }, ResolverInputTypes['Product']];
        products?: [
            { options?: ResolverInputTypes['ProductListOptions'] | undefined | null },
            ResolverInputTypes['ProductList'],
        ];
        search?: [{ input: ResolverInputTypes['SearchInput'] }, ResolverInputTypes['SearchResponse']];
        __typename?: boolean | `@${string}`;
    }>;
    ['Mutation']: AliasType<{
        addItemToOrder?: [{ productVariantId: string; quantity: number }, ResolverInputTypes['UpdateOrderItemsResult']];
        removeOrderLine?: [{ orderLineId: string }, ResolverInputTypes['RemoveOrderItemsResult']];
        /** Remove all OrderLine from the Order */
        removeAllOrderLines?: ResolverInputTypes['RemoveOrderItemsResult'];
        adjustOrderLine?: [{ orderLineId: string; quantity: number }, ResolverInputTypes['UpdateOrderItemsResult']];
        applyCouponCode?: [{ couponCode: string }, ResolverInputTypes['ApplyCouponCodeResult']];
        removeCouponCode?: [{ couponCode: string }, ResolverInputTypes['Order']];
        transitionOrderToState?: [{ state: string }, ResolverInputTypes['TransitionOrderToStateResult']];
        setOrderShippingAddress?: [
            { input: ResolverInputTypes['CreateAddressInput'] },
            ResolverInputTypes['ActiveOrderResult'],
        ];
        setOrderBillingAddress?: [
            { input: ResolverInputTypes['CreateAddressInput'] },
            ResolverInputTypes['ActiveOrderResult'],
        ];
        setOrderCustomFields?: [
            { input: ResolverInputTypes['UpdateOrderInput'] },
            ResolverInputTypes['ActiveOrderResult'],
        ];
        setOrderShippingMethod?: [
            { shippingMethodId: Array<string> },
            ResolverInputTypes['SetOrderShippingMethodResult'],
        ];
        addPaymentToOrder?: [
            { input: ResolverInputTypes['PaymentInput'] },
            ResolverInputTypes['AddPaymentToOrderResult'],
        ];
        setCustomerForOrder?: [
            { input: ResolverInputTypes['CreateCustomerInput'] },
            ResolverInputTypes['SetCustomerForOrderResult'],
        ];
        login?: [
            { username: string; password: string; rememberMe?: boolean | undefined | null },
            ResolverInputTypes['NativeAuthenticationResult'],
        ];
        authenticate?: [
            { input: ResolverInputTypes['AuthenticationInput']; rememberMe?: boolean | undefined | null },
            ResolverInputTypes['AuthenticationResult'],
        ];
        /** End the current authenticated session */
        logout?: ResolverInputTypes['Success'];
        registerCustomerAccount?: [
            { input: ResolverInputTypes['RegisterCustomerInput'] },
            ResolverInputTypes['RegisterCustomerAccountResult'],
        ];
        refreshCustomerVerification?: [
            { emailAddress: string },
            ResolverInputTypes['RefreshCustomerVerificationResult'],
        ];
        updateCustomer?: [{ input: ResolverInputTypes['UpdateCustomerInput'] }, ResolverInputTypes['Customer']];
        createCustomerAddress?: [{ input: ResolverInputTypes['CreateAddressInput'] }, ResolverInputTypes['Address']];
        updateCustomerAddress?: [{ input: ResolverInputTypes['UpdateAddressInput'] }, ResolverInputTypes['Address']];
        deleteCustomerAddress?: [{ id: string }, ResolverInputTypes['Success']];
        verifyCustomerAccount?: [
            { token: string; password?: string | undefined | null },
            ResolverInputTypes['VerifyCustomerAccountResult'],
        ];
        updateCustomerPassword?: [
            { currentPassword: string; newPassword: string },
            ResolverInputTypes['UpdateCustomerPasswordResult'],
        ];
        requestUpdateCustomerEmailAddress?: [
            { password: string; newEmailAddress: string },
            ResolverInputTypes['RequestUpdateCustomerEmailAddressResult'],
        ];
        updateCustomerEmailAddress?: [{ token: string }, ResolverInputTypes['UpdateCustomerEmailAddressResult']];
        requestPasswordReset?: [{ emailAddress: string }, ResolverInputTypes['RequestPasswordResetResult']];
        resetPassword?: [{ token: string; password: string }, ResolverInputTypes['ResetPasswordResult']];
        __typename?: boolean | `@${string}`;
    }>;
    ['Address']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        fullName?: boolean | `@${string}`;
        company?: boolean | `@${string}`;
        streetLine1?: boolean | `@${string}`;
        streetLine2?: boolean | `@${string}`;
        city?: boolean | `@${string}`;
        province?: boolean | `@${string}`;
        postalCode?: boolean | `@${string}`;
        country?: ResolverInputTypes['Country'];
        phoneNumber?: boolean | `@${string}`;
        defaultShippingAddress?: boolean | `@${string}`;
        defaultBillingAddress?: boolean | `@${string}`;
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Asset']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        fileSize?: boolean | `@${string}`;
        mimeType?: boolean | `@${string}`;
        width?: boolean | `@${string}`;
        height?: boolean | `@${string}`;
        source?: boolean | `@${string}`;
        preview?: boolean | `@${string}`;
        focalPoint?: ResolverInputTypes['Coordinate'];
        tags?: ResolverInputTypes['Tag'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Coordinate']: AliasType<{
        x?: boolean | `@${string}`;
        y?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['AssetList']: AliasType<{
        items?: ResolverInputTypes['Asset'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['AssetType']: AssetType;
    ['CurrentUser']: AliasType<{
        id?: boolean | `@${string}`;
        identifier?: boolean | `@${string}`;
        channels?: ResolverInputTypes['CurrentUserChannel'];
        __typename?: boolean | `@${string}`;
    }>;
    ['CurrentUserChannel']: AliasType<{
        id?: boolean | `@${string}`;
        token?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        permissions?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Channel']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        token?: boolean | `@${string}`;
        defaultTaxZone?: ResolverInputTypes['Zone'];
        defaultShippingZone?: ResolverInputTypes['Zone'];
        defaultLanguageCode?: boolean | `@${string}`;
        availableLanguageCodes?: boolean | `@${string}`;
        currencyCode?: boolean | `@${string}`;
        defaultCurrencyCode?: boolean | `@${string}`;
        availableCurrencyCodes?: boolean | `@${string}`;
        /** Not yet used - will be implemented in a future release. */
        trackInventory?: boolean | `@${string}`;
        /** Not yet used - will be implemented in a future release. */
        outOfStockThreshold?: boolean | `@${string}`;
        pricesIncludeTax?: boolean | `@${string}`;
        seller?: ResolverInputTypes['Seller'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Collection']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        slug?: boolean | `@${string}`;
        breadcrumbs?: ResolverInputTypes['CollectionBreadcrumb'];
        position?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        featuredAsset?: ResolverInputTypes['Asset'];
        assets?: ResolverInputTypes['Asset'];
        parent?: ResolverInputTypes['Collection'];
        parentId?: boolean | `@${string}`;
        children?: ResolverInputTypes['Collection'];
        filters?: ResolverInputTypes['ConfigurableOperation'];
        translations?: ResolverInputTypes['CollectionTranslation'];
        productVariants?: [
            { options?: ResolverInputTypes['ProductVariantListOptions'] | undefined | null },
            ResolverInputTypes['ProductVariantList'],
        ];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['CollectionBreadcrumb']: AliasType<{
        id?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        slug?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['CollectionTranslation']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        slug?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['CollectionList']: AliasType<{
        items?: ResolverInputTypes['Collection'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['GlobalFlag']: GlobalFlag;
    ['AdjustmentType']: AdjustmentType;
    ['DeletionResult']: DeletionResult;
    /** @description
Permissions for administrators and customers. Used to control access to
GraphQL resolvers via the {@link Allow} decorator.

## Understanding Permission.Owner

`Permission.Owner` is a special permission which is used in some Vendure resolvers to indicate that that resolver should only
be accessible to the "owner" of that resource.

For example, the Shop API `activeCustomer` query resolver should only return the Customer object for the "owner" of that Customer, i.e.
based on the activeUserId of the current session. As a result, the resolver code looks like this:

@example
```TypeScript
\@Query()
\@Allow(Permission.Owner)
async activeCustomer(\@Ctx() ctx: RequestContext): Promise<Customer | undefined> {
  const userId = ctx.activeUserId;
  if (userId) {
    return this.customerService.findOneByUserId(ctx, userId);
  }
}
```

Here we can see that the "ownership" must be enforced by custom logic inside the resolver. Since "ownership" cannot be defined generally
nor statically encoded at build-time, any resolvers using `Permission.Owner` **must** include logic to enforce that only the owner
of the resource has access. If not, then it is the equivalent of using `Permission.Public`.


@docsCategory common */
    ['Permission']: Permission;
    ['SortOrder']: SortOrder;
    ['ErrorCode']: ErrorCode;
    ['LogicalOperator']: LogicalOperator;
    /** Returned when attempting an operation that relies on the NativeAuthStrategy, if that strategy is not configured. */
    ['NativeAuthStrategyError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if the user authentication credentials are not valid */
    ['InvalidCredentialsError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        authenticationError?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if there is an error in transitioning the Order state */
    ['OrderStateTransitionError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        transitionError?: boolean | `@${string}`;
        fromState?: boolean | `@${string}`;
        toState?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to create a Customer with an email address already registered to an existing User. */
    ['EmailAddressConflictError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to set the Customer on a guest checkout when the configured GuestCheckoutStrategy does not allow it. */
    ['GuestCheckoutError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        errorDetail?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when the maximum order size limit has been reached. */
    ['OrderLimitError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        maxItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to set a negative OrderLine quantity. */
    ['NegativeQuantityError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to add more items to the Order than are available */
    ['InsufficientStockError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        quantityAvailable?: boolean | `@${string}`;
        order?: ResolverInputTypes['Order'];
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if the provided coupon code is invalid */
    ['CouponCodeInvalidError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        couponCode?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if the provided coupon code is invalid */
    ['CouponCodeExpiredError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        couponCode?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if the provided coupon code is invalid */
    ['CouponCodeLimitError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        couponCode?: boolean | `@${string}`;
        limit?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to modify the contents of an Order that is not in the `AddingItems` state. */
    ['OrderModificationError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to set a ShippingMethod for which the Order is not eligible */
    ['IneligibleShippingMethodError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when invoking a mutation which depends on there being an active Order on the
current session. */
    ['NoActiveOrderError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
    ['JSON']: unknown;
    /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
    ['DateTime']: unknown;
    /** The `Upload` scalar type represents a file upload. */
    ['Upload']: unknown;
    /** The `Money` scalar type represents monetary values and supports signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point). */
    ['Money']: unknown;
    ['PaginatedList']: AliasType<{
        items?: ResolverInputTypes['Node'];
        totalItems?: boolean | `@${string}`;
        ['...on AssetList']?: Omit<ResolverInputTypes['AssetList'], keyof ResolverInputTypes['PaginatedList']>;
        ['...on CollectionList']?: Omit<
            ResolverInputTypes['CollectionList'],
            keyof ResolverInputTypes['PaginatedList']
        >;
        ['...on CustomerList']?: Omit<ResolverInputTypes['CustomerList'], keyof ResolverInputTypes['PaginatedList']>;
        ['...on FacetList']?: Omit<ResolverInputTypes['FacetList'], keyof ResolverInputTypes['PaginatedList']>;
        ['...on FacetValueList']?: Omit<
            ResolverInputTypes['FacetValueList'],
            keyof ResolverInputTypes['PaginatedList']
        >;
        ['...on HistoryEntryList']?: Omit<
            ResolverInputTypes['HistoryEntryList'],
            keyof ResolverInputTypes['PaginatedList']
        >;
        ['...on OrderList']?: Omit<ResolverInputTypes['OrderList'], keyof ResolverInputTypes['PaginatedList']>;
        ['...on ProductList']?: Omit<ResolverInputTypes['ProductList'], keyof ResolverInputTypes['PaginatedList']>;
        ['...on ProductVariantList']?: Omit<
            ResolverInputTypes['ProductVariantList'],
            keyof ResolverInputTypes['PaginatedList']
        >;
        ['...on PromotionList']?: Omit<ResolverInputTypes['PromotionList'], keyof ResolverInputTypes['PaginatedList']>;
        ['...on CountryList']?: Omit<ResolverInputTypes['CountryList'], keyof ResolverInputTypes['PaginatedList']>;
        ['...on ProvinceList']?: Omit<ResolverInputTypes['ProvinceList'], keyof ResolverInputTypes['PaginatedList']>;
        ['...on RoleList']?: Omit<ResolverInputTypes['RoleList'], keyof ResolverInputTypes['PaginatedList']>;
        ['...on ShippingMethodList']?: Omit<
            ResolverInputTypes['ShippingMethodList'],
            keyof ResolverInputTypes['PaginatedList']
        >;
        ['...on TagList']?: Omit<ResolverInputTypes['TagList'], keyof ResolverInputTypes['PaginatedList']>;
        ['...on TaxRateList']?: Omit<ResolverInputTypes['TaxRateList'], keyof ResolverInputTypes['PaginatedList']>;
        __typename?: boolean | `@${string}`;
    }>;
    ['Node']: AliasType<{
        id?: boolean | `@${string}`;
        ['...on Address']?: Omit<ResolverInputTypes['Address'], keyof ResolverInputTypes['Node']>;
        ['...on Asset']?: Omit<ResolverInputTypes['Asset'], keyof ResolverInputTypes['Node']>;
        ['...on Channel']?: Omit<ResolverInputTypes['Channel'], keyof ResolverInputTypes['Node']>;
        ['...on Collection']?: Omit<ResolverInputTypes['Collection'], keyof ResolverInputTypes['Node']>;
        ['...on CustomerGroup']?: Omit<ResolverInputTypes['CustomerGroup'], keyof ResolverInputTypes['Node']>;
        ['...on Customer']?: Omit<ResolverInputTypes['Customer'], keyof ResolverInputTypes['Node']>;
        ['...on FacetValue']?: Omit<ResolverInputTypes['FacetValue'], keyof ResolverInputTypes['Node']>;
        ['...on Facet']?: Omit<ResolverInputTypes['Facet'], keyof ResolverInputTypes['Node']>;
        ['...on HistoryEntry']?: Omit<ResolverInputTypes['HistoryEntry'], keyof ResolverInputTypes['Node']>;
        ['...on Order']?: Omit<ResolverInputTypes['Order'], keyof ResolverInputTypes['Node']>;
        ['...on OrderLine']?: Omit<ResolverInputTypes['OrderLine'], keyof ResolverInputTypes['Node']>;
        ['...on Payment']?: Omit<ResolverInputTypes['Payment'], keyof ResolverInputTypes['Node']>;
        ['...on Refund']?: Omit<ResolverInputTypes['Refund'], keyof ResolverInputTypes['Node']>;
        ['...on Fulfillment']?: Omit<ResolverInputTypes['Fulfillment'], keyof ResolverInputTypes['Node']>;
        ['...on Surcharge']?: Omit<ResolverInputTypes['Surcharge'], keyof ResolverInputTypes['Node']>;
        ['...on PaymentMethod']?: Omit<ResolverInputTypes['PaymentMethod'], keyof ResolverInputTypes['Node']>;
        ['...on ProductOptionGroup']?: Omit<ResolverInputTypes['ProductOptionGroup'], keyof ResolverInputTypes['Node']>;
        ['...on ProductOption']?: Omit<ResolverInputTypes['ProductOption'], keyof ResolverInputTypes['Node']>;
        ['...on Product']?: Omit<ResolverInputTypes['Product'], keyof ResolverInputTypes['Node']>;
        ['...on ProductVariant']?: Omit<ResolverInputTypes['ProductVariant'], keyof ResolverInputTypes['Node']>;
        ['...on Promotion']?: Omit<ResolverInputTypes['Promotion'], keyof ResolverInputTypes['Node']>;
        ['...on Region']?: Omit<ResolverInputTypes['Region'], keyof ResolverInputTypes['Node']>;
        ['...on Country']?: Omit<ResolverInputTypes['Country'], keyof ResolverInputTypes['Node']>;
        ['...on Province']?: Omit<ResolverInputTypes['Province'], keyof ResolverInputTypes['Node']>;
        ['...on Role']?: Omit<ResolverInputTypes['Role'], keyof ResolverInputTypes['Node']>;
        ['...on Seller']?: Omit<ResolverInputTypes['Seller'], keyof ResolverInputTypes['Node']>;
        ['...on ShippingMethod']?: Omit<ResolverInputTypes['ShippingMethod'], keyof ResolverInputTypes['Node']>;
        ['...on Tag']?: Omit<ResolverInputTypes['Tag'], keyof ResolverInputTypes['Node']>;
        ['...on TaxCategory']?: Omit<ResolverInputTypes['TaxCategory'], keyof ResolverInputTypes['Node']>;
        ['...on TaxRate']?: Omit<ResolverInputTypes['TaxRate'], keyof ResolverInputTypes['Node']>;
        ['...on User']?: Omit<ResolverInputTypes['User'], keyof ResolverInputTypes['Node']>;
        ['...on AuthenticationMethod']?: Omit<
            ResolverInputTypes['AuthenticationMethod'],
            keyof ResolverInputTypes['Node']
        >;
        ['...on Zone']?: Omit<ResolverInputTypes['Zone'], keyof ResolverInputTypes['Node']>;
        __typename?: boolean | `@${string}`;
    }>;
    ['ErrorResult']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        ['...on NativeAuthStrategyError']?: Omit<
            ResolverInputTypes['NativeAuthStrategyError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on InvalidCredentialsError']?: Omit<
            ResolverInputTypes['InvalidCredentialsError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on OrderStateTransitionError']?: Omit<
            ResolverInputTypes['OrderStateTransitionError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on EmailAddressConflictError']?: Omit<
            ResolverInputTypes['EmailAddressConflictError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on GuestCheckoutError']?: Omit<
            ResolverInputTypes['GuestCheckoutError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on OrderLimitError']?: Omit<
            ResolverInputTypes['OrderLimitError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on NegativeQuantityError']?: Omit<
            ResolverInputTypes['NegativeQuantityError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on InsufficientStockError']?: Omit<
            ResolverInputTypes['InsufficientStockError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on CouponCodeInvalidError']?: Omit<
            ResolverInputTypes['CouponCodeInvalidError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on CouponCodeExpiredError']?: Omit<
            ResolverInputTypes['CouponCodeExpiredError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on CouponCodeLimitError']?: Omit<
            ResolverInputTypes['CouponCodeLimitError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on OrderModificationError']?: Omit<
            ResolverInputTypes['OrderModificationError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on IneligibleShippingMethodError']?: Omit<
            ResolverInputTypes['IneligibleShippingMethodError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on NoActiveOrderError']?: Omit<
            ResolverInputTypes['NoActiveOrderError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on OrderPaymentStateError']?: Omit<
            ResolverInputTypes['OrderPaymentStateError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on IneligiblePaymentMethodError']?: Omit<
            ResolverInputTypes['IneligiblePaymentMethodError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on PaymentFailedError']?: Omit<
            ResolverInputTypes['PaymentFailedError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on PaymentDeclinedError']?: Omit<
            ResolverInputTypes['PaymentDeclinedError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on AlreadyLoggedInError']?: Omit<
            ResolverInputTypes['AlreadyLoggedInError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on MissingPasswordError']?: Omit<
            ResolverInputTypes['MissingPasswordError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on PasswordValidationError']?: Omit<
            ResolverInputTypes['PasswordValidationError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on PasswordAlreadySetError']?: Omit<
            ResolverInputTypes['PasswordAlreadySetError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on VerificationTokenInvalidError']?: Omit<
            ResolverInputTypes['VerificationTokenInvalidError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on VerificationTokenExpiredError']?: Omit<
            ResolverInputTypes['VerificationTokenExpiredError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on IdentifierChangeTokenInvalidError']?: Omit<
            ResolverInputTypes['IdentifierChangeTokenInvalidError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on IdentifierChangeTokenExpiredError']?: Omit<
            ResolverInputTypes['IdentifierChangeTokenExpiredError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on PasswordResetTokenInvalidError']?: Omit<
            ResolverInputTypes['PasswordResetTokenInvalidError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on PasswordResetTokenExpiredError']?: Omit<
            ResolverInputTypes['PasswordResetTokenExpiredError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        ['...on NotVerifiedError']?: Omit<
            ResolverInputTypes['NotVerifiedError'],
            keyof ResolverInputTypes['ErrorResult']
        >;
        __typename?: boolean | `@${string}`;
    }>;
    ['Adjustment']: AliasType<{
        adjustmentSource?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        amount?: boolean | `@${string}`;
        data?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['TaxLine']: AliasType<{
        description?: boolean | `@${string}`;
        taxRate?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ConfigArg']: AliasType<{
        name?: boolean | `@${string}`;
        value?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ConfigArgDefinition']: AliasType<{
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        list?: boolean | `@${string}`;
        required?: boolean | `@${string}`;
        defaultValue?: boolean | `@${string}`;
        label?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        ui?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ConfigurableOperation']: AliasType<{
        code?: boolean | `@${string}`;
        args?: ResolverInputTypes['ConfigArg'];
        __typename?: boolean | `@${string}`;
    }>;
    ['ConfigurableOperationDefinition']: AliasType<{
        code?: boolean | `@${string}`;
        args?: ResolverInputTypes['ConfigArgDefinition'];
        description?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['DeletionResponse']: AliasType<{
        result?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ConfigArgInput']: {
        name: string;
        /** A JSON stringified representation of the actual value */
        value: string;
    };
    ['ConfigurableOperationInput']: {
        code: string;
        arguments: Array<ResolverInputTypes['ConfigArgInput']>;
    };
    /** Operators for filtering on a String field */
    ['StringOperators']: {
        eq?: string | undefined | null;
        notEq?: string | undefined | null;
        contains?: string | undefined | null;
        notContains?: string | undefined | null;
        in?: Array<string> | undefined | null;
        notIn?: Array<string> | undefined | null;
        regex?: string | undefined | null;
        isNull?: boolean | undefined | null;
    };
    /** Operators for filtering on an ID field */
    ['IDOperators']: {
        eq?: string | undefined | null;
        notEq?: string | undefined | null;
        in?: Array<string> | undefined | null;
        notIn?: Array<string> | undefined | null;
        isNull?: boolean | undefined | null;
    };
    /** Operators for filtering on a Boolean field */
    ['BooleanOperators']: {
        eq?: boolean | undefined | null;
        isNull?: boolean | undefined | null;
    };
    ['NumberRange']: {
        start: number;
        end: number;
    };
    /** Operators for filtering on a Int or Float field */
    ['NumberOperators']: {
        eq?: number | undefined | null;
        lt?: number | undefined | null;
        lte?: number | undefined | null;
        gt?: number | undefined | null;
        gte?: number | undefined | null;
        between?: ResolverInputTypes['NumberRange'] | undefined | null;
        isNull?: boolean | undefined | null;
    };
    ['DateRange']: {
        start: ResolverInputTypes['DateTime'];
        end: ResolverInputTypes['DateTime'];
    };
    /** Operators for filtering on a DateTime field */
    ['DateOperators']: {
        eq?: ResolverInputTypes['DateTime'] | undefined | null;
        before?: ResolverInputTypes['DateTime'] | undefined | null;
        after?: ResolverInputTypes['DateTime'] | undefined | null;
        between?: ResolverInputTypes['DateRange'] | undefined | null;
        isNull?: boolean | undefined | null;
    };
    /** Operators for filtering on a list of String fields */
    ['StringListOperators']: {
        inList: string;
    };
    /** Operators for filtering on a list of Number fields */
    ['NumberListOperators']: {
        inList: number;
    };
    /** Operators for filtering on a list of Boolean fields */
    ['BooleanListOperators']: {
        inList: boolean;
    };
    /** Operators for filtering on a list of ID fields */
    ['IDListOperators']: {
        inList: string;
    };
    /** Operators for filtering on a list of Date fields */
    ['DateListOperators']: {
        inList: ResolverInputTypes['DateTime'];
    };
    /** Used to construct boolean expressions for filtering search results
by FacetValue ID. Examples:

* ID=1 OR ID=2: `{ facetValueFilters: [{ or: [1,2] }] }`
* ID=1 AND ID=2: `{ facetValueFilters: [{ and: 1 }, { and: 2 }] }`
* ID=1 AND (ID=2 OR ID=3): `{ facetValueFilters: [{ and: 1 }, { or: [2,3] }] }` */
    ['FacetValueFilterInput']: {
        and?: string | undefined | null;
        or?: Array<string> | undefined | null;
    };
    ['SearchInput']: {
        term?: string | undefined | null;
        facetValueFilters?: Array<ResolverInputTypes['FacetValueFilterInput']> | undefined | null;
        collectionId?: string | undefined | null;
        collectionSlug?: string | undefined | null;
        groupByProduct?: boolean | undefined | null;
        take?: number | undefined | null;
        skip?: number | undefined | null;
        sort?: ResolverInputTypes['SearchResultSortParameter'] | undefined | null;
        inStock?: boolean | undefined | null;
    };
    ['SearchResultSortParameter']: {
        name?: ResolverInputTypes['SortOrder'] | undefined | null;
        price?: ResolverInputTypes['SortOrder'] | undefined | null;
    };
    ['CreateCustomerInput']: {
        title?: string | undefined | null;
        firstName: string;
        lastName: string;
        phoneNumber?: string | undefined | null;
        emailAddress: string;
        customFields?: ResolverInputTypes['JSON'] | undefined | null;
    };
    ['CreateAddressInput']: {
        fullName?: string | undefined | null;
        company?: string | undefined | null;
        streetLine1: string;
        streetLine2?: string | undefined | null;
        city?: string | undefined | null;
        province?: string | undefined | null;
        postalCode?: string | undefined | null;
        countryCode: string;
        phoneNumber?: string | undefined | null;
        defaultShippingAddress?: boolean | undefined | null;
        defaultBillingAddress?: boolean | undefined | null;
        customFields?: ResolverInputTypes['JSON'] | undefined | null;
    };
    ['UpdateAddressInput']: {
        id: string;
        fullName?: string | undefined | null;
        company?: string | undefined | null;
        streetLine1?: string | undefined | null;
        streetLine2?: string | undefined | null;
        city?: string | undefined | null;
        province?: string | undefined | null;
        postalCode?: string | undefined | null;
        countryCode?: string | undefined | null;
        phoneNumber?: string | undefined | null;
        defaultShippingAddress?: boolean | undefined | null;
        defaultBillingAddress?: boolean | undefined | null;
        customFields?: ResolverInputTypes['JSON'] | undefined | null;
    };
    /** Indicates that an operation succeeded, where we do not want to return any more specific information. */
    ['Success']: AliasType<{
        success?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ShippingMethodQuote']: AliasType<{
        id?: boolean | `@${string}`;
        price?: boolean | `@${string}`;
        priceWithTax?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        /** Any optional metadata returned by the ShippingCalculator in the ShippingCalculationResult */
        metadata?: boolean | `@${string}`;
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['PaymentMethodQuote']: AliasType<{
        id?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        isEligible?: boolean | `@${string}`;
        eligibilityMessage?: boolean | `@${string}`;
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['UpdateOrderItemsResult']: AliasType<{
        Order?: ResolverInputTypes['Order'];
        OrderModificationError?: ResolverInputTypes['OrderModificationError'];
        OrderLimitError?: ResolverInputTypes['OrderLimitError'];
        NegativeQuantityError?: ResolverInputTypes['NegativeQuantityError'];
        InsufficientStockError?: ResolverInputTypes['InsufficientStockError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['RemoveOrderItemsResult']: AliasType<{
        Order?: ResolverInputTypes['Order'];
        OrderModificationError?: ResolverInputTypes['OrderModificationError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['SetOrderShippingMethodResult']: AliasType<{
        Order?: ResolverInputTypes['Order'];
        OrderModificationError?: ResolverInputTypes['OrderModificationError'];
        IneligibleShippingMethodError?: ResolverInputTypes['IneligibleShippingMethodError'];
        NoActiveOrderError?: ResolverInputTypes['NoActiveOrderError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['ApplyCouponCodeResult']: AliasType<{
        Order?: ResolverInputTypes['Order'];
        CouponCodeExpiredError?: ResolverInputTypes['CouponCodeExpiredError'];
        CouponCodeInvalidError?: ResolverInputTypes['CouponCodeInvalidError'];
        CouponCodeLimitError?: ResolverInputTypes['CouponCodeLimitError'];
        __typename?: boolean | `@${string}`;
    }>;
    /** @description
ISO 4217 currency code

@docsCategory common */
    ['CurrencyCode']: CurrencyCode;
    ['CustomField']: AliasType<{
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        list?: boolean | `@${string}`;
        label?: ResolverInputTypes['LocalizedString'];
        description?: ResolverInputTypes['LocalizedString'];
        readonly?: boolean | `@${string}`;
        internal?: boolean | `@${string}`;
        nullable?: boolean | `@${string}`;
        ui?: boolean | `@${string}`;
        ['...on StringCustomFieldConfig']?: Omit<
            ResolverInputTypes['StringCustomFieldConfig'],
            keyof ResolverInputTypes['CustomField']
        >;
        ['...on LocaleStringCustomFieldConfig']?: Omit<
            ResolverInputTypes['LocaleStringCustomFieldConfig'],
            keyof ResolverInputTypes['CustomField']
        >;
        ['...on IntCustomFieldConfig']?: Omit<
            ResolverInputTypes['IntCustomFieldConfig'],
            keyof ResolverInputTypes['CustomField']
        >;
        ['...on FloatCustomFieldConfig']?: Omit<
            ResolverInputTypes['FloatCustomFieldConfig'],
            keyof ResolverInputTypes['CustomField']
        >;
        ['...on BooleanCustomFieldConfig']?: Omit<
            ResolverInputTypes['BooleanCustomFieldConfig'],
            keyof ResolverInputTypes['CustomField']
        >;
        ['...on DateTimeCustomFieldConfig']?: Omit<
            ResolverInputTypes['DateTimeCustomFieldConfig'],
            keyof ResolverInputTypes['CustomField']
        >;
        ['...on RelationCustomFieldConfig']?: Omit<
            ResolverInputTypes['RelationCustomFieldConfig'],
            keyof ResolverInputTypes['CustomField']
        >;
        ['...on TextCustomFieldConfig']?: Omit<
            ResolverInputTypes['TextCustomFieldConfig'],
            keyof ResolverInputTypes['CustomField']
        >;
        ['...on LocaleTextCustomFieldConfig']?: Omit<
            ResolverInputTypes['LocaleTextCustomFieldConfig'],
            keyof ResolverInputTypes['CustomField']
        >;
        __typename?: boolean | `@${string}`;
    }>;
    ['StringCustomFieldConfig']: AliasType<{
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        list?: boolean | `@${string}`;
        length?: boolean | `@${string}`;
        label?: ResolverInputTypes['LocalizedString'];
        description?: ResolverInputTypes['LocalizedString'];
        readonly?: boolean | `@${string}`;
        internal?: boolean | `@${string}`;
        nullable?: boolean | `@${string}`;
        pattern?: boolean | `@${string}`;
        options?: ResolverInputTypes['StringFieldOption'];
        ui?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['StringFieldOption']: AliasType<{
        value?: boolean | `@${string}`;
        label?: ResolverInputTypes['LocalizedString'];
        __typename?: boolean | `@${string}`;
    }>;
    ['LocaleStringCustomFieldConfig']: AliasType<{
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        list?: boolean | `@${string}`;
        length?: boolean | `@${string}`;
        label?: ResolverInputTypes['LocalizedString'];
        description?: ResolverInputTypes['LocalizedString'];
        readonly?: boolean | `@${string}`;
        internal?: boolean | `@${string}`;
        nullable?: boolean | `@${string}`;
        pattern?: boolean | `@${string}`;
        ui?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['IntCustomFieldConfig']: AliasType<{
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        list?: boolean | `@${string}`;
        label?: ResolverInputTypes['LocalizedString'];
        description?: ResolverInputTypes['LocalizedString'];
        readonly?: boolean | `@${string}`;
        internal?: boolean | `@${string}`;
        nullable?: boolean | `@${string}`;
        min?: boolean | `@${string}`;
        max?: boolean | `@${string}`;
        step?: boolean | `@${string}`;
        ui?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['FloatCustomFieldConfig']: AliasType<{
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        list?: boolean | `@${string}`;
        label?: ResolverInputTypes['LocalizedString'];
        description?: ResolverInputTypes['LocalizedString'];
        readonly?: boolean | `@${string}`;
        internal?: boolean | `@${string}`;
        nullable?: boolean | `@${string}`;
        min?: boolean | `@${string}`;
        max?: boolean | `@${string}`;
        step?: boolean | `@${string}`;
        ui?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['BooleanCustomFieldConfig']: AliasType<{
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        list?: boolean | `@${string}`;
        label?: ResolverInputTypes['LocalizedString'];
        description?: ResolverInputTypes['LocalizedString'];
        readonly?: boolean | `@${string}`;
        internal?: boolean | `@${string}`;
        nullable?: boolean | `@${string}`;
        ui?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Expects the same validation formats as the `<input type="datetime-local">` HTML element.
See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local#Additional_attributes */
    ['DateTimeCustomFieldConfig']: AliasType<{
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        list?: boolean | `@${string}`;
        label?: ResolverInputTypes['LocalizedString'];
        description?: ResolverInputTypes['LocalizedString'];
        readonly?: boolean | `@${string}`;
        internal?: boolean | `@${string}`;
        nullable?: boolean | `@${string}`;
        min?: boolean | `@${string}`;
        max?: boolean | `@${string}`;
        step?: boolean | `@${string}`;
        ui?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['RelationCustomFieldConfig']: AliasType<{
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        list?: boolean | `@${string}`;
        label?: ResolverInputTypes['LocalizedString'];
        description?: ResolverInputTypes['LocalizedString'];
        readonly?: boolean | `@${string}`;
        internal?: boolean | `@${string}`;
        nullable?: boolean | `@${string}`;
        entity?: boolean | `@${string}`;
        scalarFields?: boolean | `@${string}`;
        ui?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['TextCustomFieldConfig']: AliasType<{
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        list?: boolean | `@${string}`;
        label?: ResolverInputTypes['LocalizedString'];
        description?: ResolverInputTypes['LocalizedString'];
        readonly?: boolean | `@${string}`;
        internal?: boolean | `@${string}`;
        nullable?: boolean | `@${string}`;
        ui?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['LocaleTextCustomFieldConfig']: AliasType<{
        name?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        list?: boolean | `@${string}`;
        label?: ResolverInputTypes['LocalizedString'];
        description?: ResolverInputTypes['LocalizedString'];
        readonly?: boolean | `@${string}`;
        internal?: boolean | `@${string}`;
        nullable?: boolean | `@${string}`;
        ui?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['LocalizedString']: AliasType<{
        languageCode?: boolean | `@${string}`;
        value?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['CustomFieldConfig']: AliasType<{
        StringCustomFieldConfig?: ResolverInputTypes['StringCustomFieldConfig'];
        LocaleStringCustomFieldConfig?: ResolverInputTypes['LocaleStringCustomFieldConfig'];
        IntCustomFieldConfig?: ResolverInputTypes['IntCustomFieldConfig'];
        FloatCustomFieldConfig?: ResolverInputTypes['FloatCustomFieldConfig'];
        BooleanCustomFieldConfig?: ResolverInputTypes['BooleanCustomFieldConfig'];
        DateTimeCustomFieldConfig?: ResolverInputTypes['DateTimeCustomFieldConfig'];
        RelationCustomFieldConfig?: ResolverInputTypes['RelationCustomFieldConfig'];
        TextCustomFieldConfig?: ResolverInputTypes['TextCustomFieldConfig'];
        LocaleTextCustomFieldConfig?: ResolverInputTypes['LocaleTextCustomFieldConfig'];
        __typename?: boolean | `@${string}`;
    }>;
    ['CustomerGroup']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        customers?: [
            { options?: ResolverInputTypes['CustomerListOptions'] | undefined | null },
            ResolverInputTypes['CustomerList'],
        ];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['CustomerListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined | null;
        /** Takes n results, for use in pagination */
        take?: number | undefined | null;
        /** Specifies which properties to sort the results by */
        sort?: ResolverInputTypes['CustomerSortParameter'] | undefined | null;
        /** Allows the results to be filtered */
        filter?: ResolverInputTypes['CustomerFilterParameter'] | undefined | null;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ResolverInputTypes['LogicalOperator'] | undefined | null;
    };
    ['Customer']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        title?: boolean | `@${string}`;
        firstName?: boolean | `@${string}`;
        lastName?: boolean | `@${string}`;
        phoneNumber?: boolean | `@${string}`;
        emailAddress?: boolean | `@${string}`;
        addresses?: ResolverInputTypes['Address'];
        orders?: [
            { options?: ResolverInputTypes['OrderListOptions'] | undefined | null },
            ResolverInputTypes['OrderList'],
        ];
        user?: ResolverInputTypes['User'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['CustomerList']: AliasType<{
        items?: ResolverInputTypes['Customer'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['FacetValue']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        facet?: ResolverInputTypes['Facet'];
        facetId?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        translations?: ResolverInputTypes['FacetValueTranslation'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['FacetValueTranslation']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Facet']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        values?: ResolverInputTypes['FacetValue'];
        valueList?: [
            { options?: ResolverInputTypes['FacetValueListOptions'] | undefined | null },
            ResolverInputTypes['FacetValueList'],
        ];
        translations?: ResolverInputTypes['FacetTranslation'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['FacetTranslation']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['FacetList']: AliasType<{
        items?: ResolverInputTypes['Facet'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['FacetValueListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined | null;
        /** Takes n results, for use in pagination */
        take?: number | undefined | null;
        /** Specifies which properties to sort the results by */
        sort?: ResolverInputTypes['FacetValueSortParameter'] | undefined | null;
        /** Allows the results to be filtered */
        filter?: ResolverInputTypes['FacetValueFilterParameter'] | undefined | null;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ResolverInputTypes['LogicalOperator'] | undefined | null;
    };
    ['FacetValueList']: AliasType<{
        items?: ResolverInputTypes['FacetValue'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['HistoryEntry']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        data?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['HistoryEntryType']: HistoryEntryType;
    ['HistoryEntryList']: AliasType<{
        items?: ResolverInputTypes['HistoryEntry'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['HistoryEntryListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined | null;
        /** Takes n results, for use in pagination */
        take?: number | undefined | null;
        /** Specifies which properties to sort the results by */
        sort?: ResolverInputTypes['HistoryEntrySortParameter'] | undefined | null;
        /** Allows the results to be filtered */
        filter?: ResolverInputTypes['HistoryEntryFilterParameter'] | undefined | null;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ResolverInputTypes['LogicalOperator'] | undefined | null;
    };
    /** @description
Languages in the form of a ISO 639-1 language code with optional
region or script modifier (e.g. de_AT). The selection available is based
on the [Unicode CLDR summary list](https://unicode-org.github.io/cldr-staging/charts/37/summary/root.html)
and includes the major spoken languages of the world and any widely-used variants.

@docsCategory common */
    ['LanguageCode']: LanguageCode;
    ['OrderType']: OrderType;
    ['Order']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        /** The date & time that the Order was placed, i.e. the Customer
completed the checkout and the Order is no longer "active" */
        orderPlacedAt?: boolean | `@${string}`;
        /** A unique code for the Order */
        code?: boolean | `@${string}`;
        state?: boolean | `@${string}`;
        /** An order is active as long as the payment process has not been completed */
        active?: boolean | `@${string}`;
        customer?: ResolverInputTypes['Customer'];
        shippingAddress?: ResolverInputTypes['OrderAddress'];
        billingAddress?: ResolverInputTypes['OrderAddress'];
        lines?: ResolverInputTypes['OrderLine'];
        /** Surcharges are arbitrary modifications to the Order total which are neither
ProductVariants nor discounts resulting from applied Promotions. For example,
one-off discounts based on customer interaction, or surcharges based on payment
methods. */
        surcharges?: ResolverInputTypes['Surcharge'];
        discounts?: ResolverInputTypes['Discount'];
        /** An array of all coupon codes applied to the Order */
        couponCodes?: boolean | `@${string}`;
        /** Promotions applied to the order. Only gets populated after the payment process has completed. */
        promotions?: ResolverInputTypes['Promotion'];
        payments?: ResolverInputTypes['Payment'];
        fulfillments?: ResolverInputTypes['Fulfillment'];
        totalQuantity?: boolean | `@${string}`;
        /** The subTotal is the total of all OrderLines in the Order. This figure also includes any Order-level
discounts which have been prorated (proportionally distributed) amongst the items of each OrderLine.
To get a total of all OrderLines which does not account for prorated discounts, use the
sum of `OrderLine.discountedLinePrice` values. */
        subTotal?: boolean | `@${string}`;
        /** Same as subTotal, but inclusive of tax */
        subTotalWithTax?: boolean | `@${string}`;
        currencyCode?: boolean | `@${string}`;
        shippingLines?: ResolverInputTypes['ShippingLine'];
        shipping?: boolean | `@${string}`;
        shippingWithTax?: boolean | `@${string}`;
        /** Equal to subTotal plus shipping */
        total?: boolean | `@${string}`;
        /** The final payable amount. Equal to subTotalWithTax plus shippingWithTax */
        totalWithTax?: boolean | `@${string}`;
        /** A summary of the taxes being applied to this Order */
        taxSummary?: ResolverInputTypes['OrderTaxSummary'];
        history?: [
            { options?: ResolverInputTypes['HistoryEntryListOptions'] | undefined | null },
            ResolverInputTypes['HistoryEntryList'],
        ];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** A summary of the taxes being applied to this order, grouped
by taxRate. */
    ['OrderTaxSummary']: AliasType<{
        /** A description of this tax */
        description?: boolean | `@${string}`;
        /** The taxRate as a percentage */
        taxRate?: boolean | `@${string}`;
        /** The total net price of OrderLines to which this taxRate applies */
        taxBase?: boolean | `@${string}`;
        /** The total tax being applied to the Order at this taxRate */
        taxTotal?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['OrderAddress']: AliasType<{
        fullName?: boolean | `@${string}`;
        company?: boolean | `@${string}`;
        streetLine1?: boolean | `@${string}`;
        streetLine2?: boolean | `@${string}`;
        city?: boolean | `@${string}`;
        province?: boolean | `@${string}`;
        postalCode?: boolean | `@${string}`;
        country?: boolean | `@${string}`;
        countryCode?: boolean | `@${string}`;
        phoneNumber?: boolean | `@${string}`;
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['OrderList']: AliasType<{
        items?: ResolverInputTypes['Order'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ShippingLine']: AliasType<{
        id?: boolean | `@${string}`;
        shippingMethod?: ResolverInputTypes['ShippingMethod'];
        price?: boolean | `@${string}`;
        priceWithTax?: boolean | `@${string}`;
        discountedPrice?: boolean | `@${string}`;
        discountedPriceWithTax?: boolean | `@${string}`;
        discounts?: ResolverInputTypes['Discount'];
        __typename?: boolean | `@${string}`;
    }>;
    ['Discount']: AliasType<{
        adjustmentSource?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        amount?: boolean | `@${string}`;
        amountWithTax?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['OrderLine']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        productVariant?: ResolverInputTypes['ProductVariant'];
        featuredAsset?: ResolverInputTypes['Asset'];
        /** The price of a single unit, excluding tax and discounts */
        unitPrice?: boolean | `@${string}`;
        /** The price of a single unit, including tax but excluding discounts */
        unitPriceWithTax?: boolean | `@${string}`;
        /** Non-zero if the unitPrice has changed since it was initially added to Order */
        unitPriceChangeSinceAdded?: boolean | `@${string}`;
        /** Non-zero if the unitPriceWithTax has changed since it was initially added to Order */
        unitPriceWithTaxChangeSinceAdded?: boolean | `@${string}`;
        /** The price of a single unit including discounts, excluding tax.

If Order-level discounts have been applied, this will not be the
actual taxable unit price (see `proratedUnitPrice`), but is generally the
correct price to display to customers to avoid confusion
about the internal handling of distributed Order-level discounts. */
        discountedUnitPrice?: boolean | `@${string}`;
        /** The price of a single unit including discounts and tax */
        discountedUnitPriceWithTax?: boolean | `@${string}`;
        /** The actual unit price, taking into account both item discounts _and_ prorated (proportionally-distributed)
Order-level discounts. This value is the true economic value of the OrderItem, and is used in tax
and refund calculations. */
        proratedUnitPrice?: boolean | `@${string}`;
        /** The proratedUnitPrice including tax */
        proratedUnitPriceWithTax?: boolean | `@${string}`;
        /** The quantity of items purchased */
        quantity?: boolean | `@${string}`;
        /** The quantity at the time the Order was placed */
        orderPlacedQuantity?: boolean | `@${string}`;
        taxRate?: boolean | `@${string}`;
        /** The total price of the line excluding tax and discounts. */
        linePrice?: boolean | `@${string}`;
        /** The total price of the line including tax but excluding discounts. */
        linePriceWithTax?: boolean | `@${string}`;
        /** The price of the line including discounts, excluding tax */
        discountedLinePrice?: boolean | `@${string}`;
        /** The price of the line including discounts and tax */
        discountedLinePriceWithTax?: boolean | `@${string}`;
        /** The actual line price, taking into account both item discounts _and_ prorated (proportionally-distributed)
Order-level discounts. This value is the true economic value of the OrderLine, and is used in tax
and refund calculations. */
        proratedLinePrice?: boolean | `@${string}`;
        /** The proratedLinePrice including tax */
        proratedLinePriceWithTax?: boolean | `@${string}`;
        /** The total tax on this line */
        lineTax?: boolean | `@${string}`;
        discounts?: ResolverInputTypes['Discount'];
        taxLines?: ResolverInputTypes['TaxLine'];
        order?: ResolverInputTypes['Order'];
        fulfillmentLines?: ResolverInputTypes['FulfillmentLine'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Payment']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        method?: boolean | `@${string}`;
        amount?: boolean | `@${string}`;
        state?: boolean | `@${string}`;
        transactionId?: boolean | `@${string}`;
        errorMessage?: boolean | `@${string}`;
        refunds?: ResolverInputTypes['Refund'];
        metadata?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['RefundLine']: AliasType<{
        orderLine?: ResolverInputTypes['OrderLine'];
        orderLineId?: boolean | `@${string}`;
        quantity?: boolean | `@${string}`;
        refund?: ResolverInputTypes['Refund'];
        refundId?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Refund']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        items?: boolean | `@${string}`;
        shipping?: boolean | `@${string}`;
        adjustment?: boolean | `@${string}`;
        total?: boolean | `@${string}`;
        method?: boolean | `@${string}`;
        state?: boolean | `@${string}`;
        transactionId?: boolean | `@${string}`;
        reason?: boolean | `@${string}`;
        lines?: ResolverInputTypes['RefundLine'];
        paymentId?: boolean | `@${string}`;
        metadata?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['FulfillmentLine']: AliasType<{
        orderLine?: ResolverInputTypes['OrderLine'];
        orderLineId?: boolean | `@${string}`;
        quantity?: boolean | `@${string}`;
        fulfillment?: ResolverInputTypes['Fulfillment'];
        fulfillmentId?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Fulfillment']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        lines?: ResolverInputTypes['FulfillmentLine'];
        summary?: ResolverInputTypes['FulfillmentLine'];
        state?: boolean | `@${string}`;
        method?: boolean | `@${string}`;
        trackingCode?: boolean | `@${string}`;
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Surcharge']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        sku?: boolean | `@${string}`;
        taxLines?: ResolverInputTypes['TaxLine'];
        price?: boolean | `@${string}`;
        priceWithTax?: boolean | `@${string}`;
        taxRate?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['PaymentMethod']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        enabled?: boolean | `@${string}`;
        checker?: ResolverInputTypes['ConfigurableOperation'];
        handler?: ResolverInputTypes['ConfigurableOperation'];
        translations?: ResolverInputTypes['PaymentMethodTranslation'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['PaymentMethodTranslation']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ProductOptionGroup']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        options?: ResolverInputTypes['ProductOption'];
        translations?: ResolverInputTypes['ProductOptionGroupTranslation'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ProductOptionGroupTranslation']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ProductOption']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        groupId?: boolean | `@${string}`;
        group?: ResolverInputTypes['ProductOptionGroup'];
        translations?: ResolverInputTypes['ProductOptionTranslation'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ProductOptionTranslation']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['SearchReindexResponse']: AliasType<{
        success?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['SearchResponse']: AliasType<{
        items?: ResolverInputTypes['SearchResult'];
        totalItems?: boolean | `@${string}`;
        facetValues?: ResolverInputTypes['FacetValueResult'];
        collections?: ResolverInputTypes['CollectionResult'];
        __typename?: boolean | `@${string}`;
    }>;
    /** Which FacetValues are present in the products returned
by the search, and in what quantity. */
    ['FacetValueResult']: AliasType<{
        facetValue?: ResolverInputTypes['FacetValue'];
        count?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Which Collections are present in the products returned
by the search, and in what quantity. */
    ['CollectionResult']: AliasType<{
        collection?: ResolverInputTypes['Collection'];
        count?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['SearchResultAsset']: AliasType<{
        id?: boolean | `@${string}`;
        preview?: boolean | `@${string}`;
        focalPoint?: ResolverInputTypes['Coordinate'];
        __typename?: boolean | `@${string}`;
    }>;
    ['SearchResult']: AliasType<{
        sku?: boolean | `@${string}`;
        slug?: boolean | `@${string}`;
        productId?: boolean | `@${string}`;
        productName?: boolean | `@${string}`;
        productAsset?: ResolverInputTypes['SearchResultAsset'];
        productVariantId?: boolean | `@${string}`;
        productVariantName?: boolean | `@${string}`;
        productVariantAsset?: ResolverInputTypes['SearchResultAsset'];
        price?: ResolverInputTypes['SearchResultPrice'];
        priceWithTax?: ResolverInputTypes['SearchResultPrice'];
        currencyCode?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        facetIds?: boolean | `@${string}`;
        facetValueIds?: boolean | `@${string}`;
        /** An array of ids of the Collections in which this result appears */
        collectionIds?: boolean | `@${string}`;
        /** A relevance score for the result. Differs between database implementations */
        score?: boolean | `@${string}`;
        inStock?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** The price of a search result product, either as a range or as a single price */
    ['SearchResultPrice']: AliasType<{
        PriceRange?: ResolverInputTypes['PriceRange'];
        SinglePrice?: ResolverInputTypes['SinglePrice'];
        __typename?: boolean | `@${string}`;
    }>;
    /** The price value where the result has a single price */
    ['SinglePrice']: AliasType<{
        value?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** The price range where the result has more than one price */
    ['PriceRange']: AliasType<{
        min?: boolean | `@${string}`;
        max?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Product']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        slug?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        featuredAsset?: ResolverInputTypes['Asset'];
        assets?: ResolverInputTypes['Asset'];
        /** Returns all ProductVariants */
        variants?: ResolverInputTypes['ProductVariant'];
        variantList?: [
            { options?: ResolverInputTypes['ProductVariantListOptions'] | undefined | null },
            ResolverInputTypes['ProductVariantList'],
        ];
        optionGroups?: ResolverInputTypes['ProductOptionGroup'];
        facetValues?: ResolverInputTypes['FacetValue'];
        translations?: ResolverInputTypes['ProductTranslation'];
        collections?: ResolverInputTypes['Collection'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ProductTranslation']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        slug?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ProductList']: AliasType<{
        items?: ResolverInputTypes['Product'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ProductVariantList']: AliasType<{
        items?: ResolverInputTypes['ProductVariant'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ProductVariant']: AliasType<{
        id?: boolean | `@${string}`;
        product?: ResolverInputTypes['Product'];
        productId?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        sku?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        featuredAsset?: ResolverInputTypes['Asset'];
        assets?: ResolverInputTypes['Asset'];
        price?: boolean | `@${string}`;
        currencyCode?: boolean | `@${string}`;
        priceWithTax?: boolean | `@${string}`;
        stockLevel?: boolean | `@${string}`;
        taxRateApplied?: ResolverInputTypes['TaxRate'];
        taxCategory?: ResolverInputTypes['TaxCategory'];
        options?: ResolverInputTypes['ProductOption'];
        facetValues?: ResolverInputTypes['FacetValue'];
        translations?: ResolverInputTypes['ProductVariantTranslation'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ProductVariantTranslation']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Promotion']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        startsAt?: boolean | `@${string}`;
        endsAt?: boolean | `@${string}`;
        couponCode?: boolean | `@${string}`;
        perCustomerUsageLimit?: boolean | `@${string}`;
        usageLimit?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        enabled?: boolean | `@${string}`;
        conditions?: ResolverInputTypes['ConfigurableOperation'];
        actions?: ResolverInputTypes['ConfigurableOperation'];
        translations?: ResolverInputTypes['PromotionTranslation'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['PromotionTranslation']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['PromotionList']: AliasType<{
        items?: ResolverInputTypes['Promotion'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Region']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        enabled?: boolean | `@${string}`;
        parent?: ResolverInputTypes['Region'];
        parentId?: boolean | `@${string}`;
        translations?: ResolverInputTypes['RegionTranslation'];
        ['...on Country']?: Omit<ResolverInputTypes['Country'], keyof ResolverInputTypes['Region']>;
        ['...on Province']?: Omit<ResolverInputTypes['Province'], keyof ResolverInputTypes['Region']>;
        __typename?: boolean | `@${string}`;
    }>;
    ['RegionTranslation']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Country']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        enabled?: boolean | `@${string}`;
        parent?: ResolverInputTypes['Region'];
        parentId?: boolean | `@${string}`;
        translations?: ResolverInputTypes['RegionTranslation'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['CountryList']: AliasType<{
        items?: ResolverInputTypes['Country'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Province']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        type?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        enabled?: boolean | `@${string}`;
        parent?: ResolverInputTypes['Region'];
        parentId?: boolean | `@${string}`;
        translations?: ResolverInputTypes['RegionTranslation'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ProvinceList']: AliasType<{
        items?: ResolverInputTypes['Province'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Role']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        permissions?: boolean | `@${string}`;
        channels?: ResolverInputTypes['Channel'];
        __typename?: boolean | `@${string}`;
    }>;
    ['RoleList']: AliasType<{
        items?: ResolverInputTypes['Role'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Seller']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ShippingMethod']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        code?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        fulfillmentHandlerCode?: boolean | `@${string}`;
        checker?: ResolverInputTypes['ConfigurableOperation'];
        calculator?: ResolverInputTypes['ConfigurableOperation'];
        translations?: ResolverInputTypes['ShippingMethodTranslation'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ShippingMethodTranslation']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        languageCode?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        description?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['ShippingMethodList']: AliasType<{
        items?: ResolverInputTypes['ShippingMethod'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Tag']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        value?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['TagList']: AliasType<{
        items?: ResolverInputTypes['Tag'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['TaxCategory']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        isDefault?: boolean | `@${string}`;
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['TaxRate']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        enabled?: boolean | `@${string}`;
        value?: boolean | `@${string}`;
        category?: ResolverInputTypes['TaxCategory'];
        zone?: ResolverInputTypes['Zone'];
        customerGroup?: ResolverInputTypes['CustomerGroup'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['TaxRateList']: AliasType<{
        items?: ResolverInputTypes['TaxRate'];
        totalItems?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['User']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        identifier?: boolean | `@${string}`;
        verified?: boolean | `@${string}`;
        roles?: ResolverInputTypes['Role'];
        lastLogin?: boolean | `@${string}`;
        authenticationMethods?: ResolverInputTypes['AuthenticationMethod'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['AuthenticationMethod']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        strategy?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['Zone']: AliasType<{
        id?: boolean | `@${string}`;
        createdAt?: boolean | `@${string}`;
        updatedAt?: boolean | `@${string}`;
        name?: boolean | `@${string}`;
        members?: ResolverInputTypes['Region'];
        customFields?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to add a Payment to an Order that is not in the `ArrangingPayment` state. */
    ['OrderPaymentStateError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to add a Payment using a PaymentMethod for which the Order is not eligible. */
    ['IneligiblePaymentMethodError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        eligibilityCheckerMessage?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when a Payment fails due to an error. */
    ['PaymentFailedError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        paymentErrorMessage?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when a Payment is declined by the payment provider. */
    ['PaymentDeclinedError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        paymentErrorMessage?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to set the Customer for an Order when already logged in. */
    ['AlreadyLoggedInError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to register or verify a customer account without a password, when one is required. */
    ['MissingPasswordError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to register or verify a customer account where the given password fails password validation. */
    ['PasswordValidationError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        validationErrorMessage?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned when attempting to verify a customer account with a password, when a password has already been set. */
    ['PasswordAlreadySetError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if the verification token (used to verify a Customer's email address) is either
invalid or does not match any expected tokens. */
    ['VerificationTokenInvalidError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if the verification token (used to verify a Customer's email address) is valid, but has
expired according to the `verificationTokenDuration` setting in the AuthOptions. */
    ['VerificationTokenExpiredError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if the token used to change a Customer's email address is either
invalid or does not match any expected tokens. */
    ['IdentifierChangeTokenInvalidError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if the token used to change a Customer's email address is valid, but has
expired according to the `verificationTokenDuration` setting in the AuthOptions. */
    ['IdentifierChangeTokenExpiredError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if the token used to reset a Customer's password is either
invalid or does not match any expected tokens. */
    ['PasswordResetTokenInvalidError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if the token used to reset a Customer's password is valid, but has
expired according to the `verificationTokenDuration` setting in the AuthOptions. */
    ['PasswordResetTokenExpiredError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    /** Returned if `authOptions.requireVerification` is set to `true` (which is the default)
and an unverified user attempts to authenticate. */
    ['NotVerifiedError']: AliasType<{
        errorCode?: boolean | `@${string}`;
        message?: boolean | `@${string}`;
        __typename?: boolean | `@${string}`;
    }>;
    ['AuthenticationInput']: {
        native?: ResolverInputTypes['NativeAuthInput'] | undefined | null;
    };
    ['RegisterCustomerInput']: {
        emailAddress: string;
        title?: string | undefined | null;
        firstName?: string | undefined | null;
        lastName?: string | undefined | null;
        phoneNumber?: string | undefined | null;
        password?: string | undefined | null;
    };
    ['UpdateCustomerInput']: {
        title?: string | undefined | null;
        firstName?: string | undefined | null;
        lastName?: string | undefined | null;
        phoneNumber?: string | undefined | null;
        customFields?: ResolverInputTypes['JSON'] | undefined | null;
    };
    ['UpdateOrderInput']: {
        customFields?: ResolverInputTypes['JSON'] | undefined | null;
    };
    /** Passed as input to the `addPaymentToOrder` mutation. */
    ['PaymentInput']: {
        /** This field should correspond to the `code` property of a PaymentMethod. */
        method: string;
        /** This field should contain arbitrary data passed to the specified PaymentMethodHandler's `createPayment()` method
as the "metadata" argument. For example, it could contain an ID for the payment and other
data generated by the payment provider. */
        metadata: ResolverInputTypes['JSON'];
    };
    ['CollectionListOptions']: {
        topLevelOnly?: boolean | undefined | null;
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined | null;
        /** Takes n results, for use in pagination */
        take?: number | undefined | null;
        /** Specifies which properties to sort the results by */
        sort?: ResolverInputTypes['CollectionSortParameter'] | undefined | null;
        /** Allows the results to be filtered */
        filter?: ResolverInputTypes['CollectionFilterParameter'] | undefined | null;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ResolverInputTypes['LogicalOperator'] | undefined | null;
    };
    ['FacetListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined | null;
        /** Takes n results, for use in pagination */
        take?: number | undefined | null;
        /** Specifies which properties to sort the results by */
        sort?: ResolverInputTypes['FacetSortParameter'] | undefined | null;
        /** Allows the results to be filtered */
        filter?: ResolverInputTypes['FacetFilterParameter'] | undefined | null;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ResolverInputTypes['LogicalOperator'] | undefined | null;
    };
    ['OrderListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined | null;
        /** Takes n results, for use in pagination */
        take?: number | undefined | null;
        /** Specifies which properties to sort the results by */
        sort?: ResolverInputTypes['OrderSortParameter'] | undefined | null;
        /** Allows the results to be filtered */
        filter?: ResolverInputTypes['OrderFilterParameter'] | undefined | null;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ResolverInputTypes['LogicalOperator'] | undefined | null;
    };
    ['ProductListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined | null;
        /** Takes n results, for use in pagination */
        take?: number | undefined | null;
        /** Specifies which properties to sort the results by */
        sort?: ResolverInputTypes['ProductSortParameter'] | undefined | null;
        /** Allows the results to be filtered */
        filter?: ResolverInputTypes['ProductFilterParameter'] | undefined | null;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ResolverInputTypes['LogicalOperator'] | undefined | null;
    };
    ['ProductVariantListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined | null;
        /** Takes n results, for use in pagination */
        take?: number | undefined | null;
        /** Specifies which properties to sort the results by */
        sort?: ResolverInputTypes['ProductVariantSortParameter'] | undefined | null;
        /** Allows the results to be filtered */
        filter?: ResolverInputTypes['ProductVariantFilterParameter'] | undefined | null;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ResolverInputTypes['LogicalOperator'] | undefined | null;
    };
    ['AddPaymentToOrderResult']: AliasType<{
        Order?: ResolverInputTypes['Order'];
        OrderPaymentStateError?: ResolverInputTypes['OrderPaymentStateError'];
        IneligiblePaymentMethodError?: ResolverInputTypes['IneligiblePaymentMethodError'];
        PaymentFailedError?: ResolverInputTypes['PaymentFailedError'];
        PaymentDeclinedError?: ResolverInputTypes['PaymentDeclinedError'];
        OrderStateTransitionError?: ResolverInputTypes['OrderStateTransitionError'];
        NoActiveOrderError?: ResolverInputTypes['NoActiveOrderError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['TransitionOrderToStateResult']: AliasType<{
        Order?: ResolverInputTypes['Order'];
        OrderStateTransitionError?: ResolverInputTypes['OrderStateTransitionError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['SetCustomerForOrderResult']: AliasType<{
        Order?: ResolverInputTypes['Order'];
        AlreadyLoggedInError?: ResolverInputTypes['AlreadyLoggedInError'];
        EmailAddressConflictError?: ResolverInputTypes['EmailAddressConflictError'];
        NoActiveOrderError?: ResolverInputTypes['NoActiveOrderError'];
        GuestCheckoutError?: ResolverInputTypes['GuestCheckoutError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['RegisterCustomerAccountResult']: AliasType<{
        Success?: ResolverInputTypes['Success'];
        MissingPasswordError?: ResolverInputTypes['MissingPasswordError'];
        PasswordValidationError?: ResolverInputTypes['PasswordValidationError'];
        NativeAuthStrategyError?: ResolverInputTypes['NativeAuthStrategyError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['RefreshCustomerVerificationResult']: AliasType<{
        Success?: ResolverInputTypes['Success'];
        NativeAuthStrategyError?: ResolverInputTypes['NativeAuthStrategyError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['VerifyCustomerAccountResult']: AliasType<{
        CurrentUser?: ResolverInputTypes['CurrentUser'];
        VerificationTokenInvalidError?: ResolverInputTypes['VerificationTokenInvalidError'];
        VerificationTokenExpiredError?: ResolverInputTypes['VerificationTokenExpiredError'];
        MissingPasswordError?: ResolverInputTypes['MissingPasswordError'];
        PasswordValidationError?: ResolverInputTypes['PasswordValidationError'];
        PasswordAlreadySetError?: ResolverInputTypes['PasswordAlreadySetError'];
        NativeAuthStrategyError?: ResolverInputTypes['NativeAuthStrategyError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['UpdateCustomerPasswordResult']: AliasType<{
        Success?: ResolverInputTypes['Success'];
        InvalidCredentialsError?: ResolverInputTypes['InvalidCredentialsError'];
        PasswordValidationError?: ResolverInputTypes['PasswordValidationError'];
        NativeAuthStrategyError?: ResolverInputTypes['NativeAuthStrategyError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['RequestUpdateCustomerEmailAddressResult']: AliasType<{
        Success?: ResolverInputTypes['Success'];
        InvalidCredentialsError?: ResolverInputTypes['InvalidCredentialsError'];
        EmailAddressConflictError?: ResolverInputTypes['EmailAddressConflictError'];
        NativeAuthStrategyError?: ResolverInputTypes['NativeAuthStrategyError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['UpdateCustomerEmailAddressResult']: AliasType<{
        Success?: ResolverInputTypes['Success'];
        IdentifierChangeTokenInvalidError?: ResolverInputTypes['IdentifierChangeTokenInvalidError'];
        IdentifierChangeTokenExpiredError?: ResolverInputTypes['IdentifierChangeTokenExpiredError'];
        NativeAuthStrategyError?: ResolverInputTypes['NativeAuthStrategyError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['RequestPasswordResetResult']: AliasType<{
        Success?: ResolverInputTypes['Success'];
        NativeAuthStrategyError?: ResolverInputTypes['NativeAuthStrategyError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['ResetPasswordResult']: AliasType<{
        CurrentUser?: ResolverInputTypes['CurrentUser'];
        PasswordResetTokenInvalidError?: ResolverInputTypes['PasswordResetTokenInvalidError'];
        PasswordResetTokenExpiredError?: ResolverInputTypes['PasswordResetTokenExpiredError'];
        PasswordValidationError?: ResolverInputTypes['PasswordValidationError'];
        NativeAuthStrategyError?: ResolverInputTypes['NativeAuthStrategyError'];
        NotVerifiedError?: ResolverInputTypes['NotVerifiedError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['NativeAuthenticationResult']: AliasType<{
        CurrentUser?: ResolverInputTypes['CurrentUser'];
        InvalidCredentialsError?: ResolverInputTypes['InvalidCredentialsError'];
        NotVerifiedError?: ResolverInputTypes['NotVerifiedError'];
        NativeAuthStrategyError?: ResolverInputTypes['NativeAuthStrategyError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['AuthenticationResult']: AliasType<{
        CurrentUser?: ResolverInputTypes['CurrentUser'];
        InvalidCredentialsError?: ResolverInputTypes['InvalidCredentialsError'];
        NotVerifiedError?: ResolverInputTypes['NotVerifiedError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['ActiveOrderResult']: AliasType<{
        Order?: ResolverInputTypes['Order'];
        NoActiveOrderError?: ResolverInputTypes['NoActiveOrderError'];
        __typename?: boolean | `@${string}`;
    }>;
    ['ProductVariantFilterParameter']: {
        id?: ResolverInputTypes['IDOperators'] | undefined | null;
        productId?: ResolverInputTypes['IDOperators'] | undefined | null;
        createdAt?: ResolverInputTypes['DateOperators'] | undefined | null;
        updatedAt?: ResolverInputTypes['DateOperators'] | undefined | null;
        languageCode?: ResolverInputTypes['StringOperators'] | undefined | null;
        sku?: ResolverInputTypes['StringOperators'] | undefined | null;
        name?: ResolverInputTypes['StringOperators'] | undefined | null;
        price?: ResolverInputTypes['NumberOperators'] | undefined | null;
        currencyCode?: ResolverInputTypes['StringOperators'] | undefined | null;
        priceWithTax?: ResolverInputTypes['NumberOperators'] | undefined | null;
        stockLevel?: ResolverInputTypes['StringOperators'] | undefined | null;
    };
    ['ProductVariantSortParameter']: {
        id?: ResolverInputTypes['SortOrder'] | undefined | null;
        productId?: ResolverInputTypes['SortOrder'] | undefined | null;
        createdAt?: ResolverInputTypes['SortOrder'] | undefined | null;
        updatedAt?: ResolverInputTypes['SortOrder'] | undefined | null;
        sku?: ResolverInputTypes['SortOrder'] | undefined | null;
        name?: ResolverInputTypes['SortOrder'] | undefined | null;
        price?: ResolverInputTypes['SortOrder'] | undefined | null;
        priceWithTax?: ResolverInputTypes['SortOrder'] | undefined | null;
        stockLevel?: ResolverInputTypes['SortOrder'] | undefined | null;
    };
    ['CustomerFilterParameter']: {
        id?: ResolverInputTypes['IDOperators'] | undefined | null;
        createdAt?: ResolverInputTypes['DateOperators'] | undefined | null;
        updatedAt?: ResolverInputTypes['DateOperators'] | undefined | null;
        title?: ResolverInputTypes['StringOperators'] | undefined | null;
        firstName?: ResolverInputTypes['StringOperators'] | undefined | null;
        lastName?: ResolverInputTypes['StringOperators'] | undefined | null;
        phoneNumber?: ResolverInputTypes['StringOperators'] | undefined | null;
        emailAddress?: ResolverInputTypes['StringOperators'] | undefined | null;
    };
    ['CustomerSortParameter']: {
        id?: ResolverInputTypes['SortOrder'] | undefined | null;
        createdAt?: ResolverInputTypes['SortOrder'] | undefined | null;
        updatedAt?: ResolverInputTypes['SortOrder'] | undefined | null;
        title?: ResolverInputTypes['SortOrder'] | undefined | null;
        firstName?: ResolverInputTypes['SortOrder'] | undefined | null;
        lastName?: ResolverInputTypes['SortOrder'] | undefined | null;
        phoneNumber?: ResolverInputTypes['SortOrder'] | undefined | null;
        emailAddress?: ResolverInputTypes['SortOrder'] | undefined | null;
    };
    ['OrderFilterParameter']: {
        id?: ResolverInputTypes['IDOperators'] | undefined | null;
        createdAt?: ResolverInputTypes['DateOperators'] | undefined | null;
        updatedAt?: ResolverInputTypes['DateOperators'] | undefined | null;
        type?: ResolverInputTypes['StringOperators'] | undefined | null;
        orderPlacedAt?: ResolverInputTypes['DateOperators'] | undefined | null;
        code?: ResolverInputTypes['StringOperators'] | undefined | null;
        state?: ResolverInputTypes['StringOperators'] | undefined | null;
        active?: ResolverInputTypes['BooleanOperators'] | undefined | null;
        totalQuantity?: ResolverInputTypes['NumberOperators'] | undefined | null;
        subTotal?: ResolverInputTypes['NumberOperators'] | undefined | null;
        subTotalWithTax?: ResolverInputTypes['NumberOperators'] | undefined | null;
        currencyCode?: ResolverInputTypes['StringOperators'] | undefined | null;
        shipping?: ResolverInputTypes['NumberOperators'] | undefined | null;
        shippingWithTax?: ResolverInputTypes['NumberOperators'] | undefined | null;
        total?: ResolverInputTypes['NumberOperators'] | undefined | null;
        totalWithTax?: ResolverInputTypes['NumberOperators'] | undefined | null;
    };
    ['OrderSortParameter']: {
        id?: ResolverInputTypes['SortOrder'] | undefined | null;
        createdAt?: ResolverInputTypes['SortOrder'] | undefined | null;
        updatedAt?: ResolverInputTypes['SortOrder'] | undefined | null;
        orderPlacedAt?: ResolverInputTypes['SortOrder'] | undefined | null;
        code?: ResolverInputTypes['SortOrder'] | undefined | null;
        state?: ResolverInputTypes['SortOrder'] | undefined | null;
        totalQuantity?: ResolverInputTypes['SortOrder'] | undefined | null;
        subTotal?: ResolverInputTypes['SortOrder'] | undefined | null;
        subTotalWithTax?: ResolverInputTypes['SortOrder'] | undefined | null;
        shipping?: ResolverInputTypes['SortOrder'] | undefined | null;
        shippingWithTax?: ResolverInputTypes['SortOrder'] | undefined | null;
        total?: ResolverInputTypes['SortOrder'] | undefined | null;
        totalWithTax?: ResolverInputTypes['SortOrder'] | undefined | null;
    };
    ['FacetValueFilterParameter']: {
        id?: ResolverInputTypes['IDOperators'] | undefined | null;
        createdAt?: ResolverInputTypes['DateOperators'] | undefined | null;
        updatedAt?: ResolverInputTypes['DateOperators'] | undefined | null;
        languageCode?: ResolverInputTypes['StringOperators'] | undefined | null;
        facetId?: ResolverInputTypes['IDOperators'] | undefined | null;
        name?: ResolverInputTypes['StringOperators'] | undefined | null;
        code?: ResolverInputTypes['StringOperators'] | undefined | null;
    };
    ['FacetValueSortParameter']: {
        id?: ResolverInputTypes['SortOrder'] | undefined | null;
        createdAt?: ResolverInputTypes['SortOrder'] | undefined | null;
        updatedAt?: ResolverInputTypes['SortOrder'] | undefined | null;
        facetId?: ResolverInputTypes['SortOrder'] | undefined | null;
        name?: ResolverInputTypes['SortOrder'] | undefined | null;
        code?: ResolverInputTypes['SortOrder'] | undefined | null;
    };
    ['HistoryEntryFilterParameter']: {
        id?: ResolverInputTypes['IDOperators'] | undefined | null;
        createdAt?: ResolverInputTypes['DateOperators'] | undefined | null;
        updatedAt?: ResolverInputTypes['DateOperators'] | undefined | null;
        type?: ResolverInputTypes['StringOperators'] | undefined | null;
    };
    ['HistoryEntrySortParameter']: {
        id?: ResolverInputTypes['SortOrder'] | undefined | null;
        createdAt?: ResolverInputTypes['SortOrder'] | undefined | null;
        updatedAt?: ResolverInputTypes['SortOrder'] | undefined | null;
    };
    ['CollectionFilterParameter']: {
        id?: ResolverInputTypes['IDOperators'] | undefined | null;
        createdAt?: ResolverInputTypes['DateOperators'] | undefined | null;
        updatedAt?: ResolverInputTypes['DateOperators'] | undefined | null;
        languageCode?: ResolverInputTypes['StringOperators'] | undefined | null;
        name?: ResolverInputTypes['StringOperators'] | undefined | null;
        slug?: ResolverInputTypes['StringOperators'] | undefined | null;
        position?: ResolverInputTypes['NumberOperators'] | undefined | null;
        description?: ResolverInputTypes['StringOperators'] | undefined | null;
        parentId?: ResolverInputTypes['IDOperators'] | undefined | null;
    };
    ['CollectionSortParameter']: {
        id?: ResolverInputTypes['SortOrder'] | undefined | null;
        createdAt?: ResolverInputTypes['SortOrder'] | undefined | null;
        updatedAt?: ResolverInputTypes['SortOrder'] | undefined | null;
        name?: ResolverInputTypes['SortOrder'] | undefined | null;
        slug?: ResolverInputTypes['SortOrder'] | undefined | null;
        position?: ResolverInputTypes['SortOrder'] | undefined | null;
        description?: ResolverInputTypes['SortOrder'] | undefined | null;
        parentId?: ResolverInputTypes['SortOrder'] | undefined | null;
    };
    ['FacetFilterParameter']: {
        id?: ResolverInputTypes['IDOperators'] | undefined | null;
        createdAt?: ResolverInputTypes['DateOperators'] | undefined | null;
        updatedAt?: ResolverInputTypes['DateOperators'] | undefined | null;
        languageCode?: ResolverInputTypes['StringOperators'] | undefined | null;
        name?: ResolverInputTypes['StringOperators'] | undefined | null;
        code?: ResolverInputTypes['StringOperators'] | undefined | null;
    };
    ['FacetSortParameter']: {
        id?: ResolverInputTypes['SortOrder'] | undefined | null;
        createdAt?: ResolverInputTypes['SortOrder'] | undefined | null;
        updatedAt?: ResolverInputTypes['SortOrder'] | undefined | null;
        name?: ResolverInputTypes['SortOrder'] | undefined | null;
        code?: ResolverInputTypes['SortOrder'] | undefined | null;
    };
    ['ProductFilterParameter']: {
        id?: ResolverInputTypes['IDOperators'] | undefined | null;
        createdAt?: ResolverInputTypes['DateOperators'] | undefined | null;
        updatedAt?: ResolverInputTypes['DateOperators'] | undefined | null;
        languageCode?: ResolverInputTypes['StringOperators'] | undefined | null;
        name?: ResolverInputTypes['StringOperators'] | undefined | null;
        slug?: ResolverInputTypes['StringOperators'] | undefined | null;
        description?: ResolverInputTypes['StringOperators'] | undefined | null;
    };
    ['ProductSortParameter']: {
        id?: ResolverInputTypes['SortOrder'] | undefined | null;
        createdAt?: ResolverInputTypes['SortOrder'] | undefined | null;
        updatedAt?: ResolverInputTypes['SortOrder'] | undefined | null;
        name?: ResolverInputTypes['SortOrder'] | undefined | null;
        slug?: ResolverInputTypes['SortOrder'] | undefined | null;
        description?: ResolverInputTypes['SortOrder'] | undefined | null;
    };
    ['NativeAuthInput']: {
        username: string;
        password: string;
    };
    ['schema']: AliasType<{
        query?: ResolverInputTypes['Query'];
        mutation?: ResolverInputTypes['Mutation'];
        __typename?: boolean | `@${string}`;
    }>;
};

export type ModelTypes = {
    ['Query']: {
        /** The active Channel */
        activeChannel: ModelTypes['Channel'];
        /** The active Customer */
        activeCustomer?: ModelTypes['Customer'] | undefined;
        /** The active Order. Will be `null` until an Order is created via `addItemToOrder`. Once an Order reaches the
state of `PaymentAuthorized` or `PaymentSettled`, then that Order is no longer considered "active" and this
query will once again return `null`. */
        activeOrder?: ModelTypes['Order'] | undefined;
        /** An array of supported Countries */
        availableCountries: Array<ModelTypes['Country']>;
        /** A list of Collections available to the shop */
        collections: ModelTypes['CollectionList'];
        /** Returns a Collection either by its id or slug. If neither 'id' nor 'slug' is specified, an error will result. */
        collection?: ModelTypes['Collection'] | undefined;
        /** Returns a list of eligible shipping methods based on the current active Order */
        eligibleShippingMethods: Array<ModelTypes['ShippingMethodQuote']>;
        /** Returns a list of payment methods and their eligibility based on the current active Order */
        eligiblePaymentMethods: Array<ModelTypes['PaymentMethodQuote']>;
        /** A list of Facets available to the shop */
        facets: ModelTypes['FacetList'];
        /** Returns a Facet by its id */
        facet?: ModelTypes['Facet'] | undefined;
        /** Returns information about the current authenticated User */
        me?: ModelTypes['CurrentUser'] | undefined;
        /** Returns the possible next states that the activeOrder can transition to */
        nextOrderStates: Array<string>;
        /** Returns an Order based on the id. Note that in the Shop API, only orders belonging to the
currently-authenticated User may be queried. */
        order?: ModelTypes['Order'] | undefined;
        /** Returns an Order based on the order `code`. For guest Orders (i.e. Orders placed by non-authenticated Customers)
this query will only return the Order within 2 hours of the Order being placed. This allows an Order confirmation
screen to be shown immediately after completion of a guest checkout, yet prevents security risks of allowing
general anonymous access to Order data. */
        orderByCode?: ModelTypes['Order'] | undefined;
        /** Get a Product either by id or slug. If neither 'id' nor 'slug' is specified, an error will result. */
        product?: ModelTypes['Product'] | undefined;
        /** Get a list of Products */
        products: ModelTypes['ProductList'];
        /** Search Products based on the criteria set by the `SearchInput` */
        search: ModelTypes['SearchResponse'];
    };
    ['Mutation']: {
        /** Adds an item to the order. If custom fields are defined on the OrderLine entity, a third argument 'customFields' will be available. */
        addItemToOrder: ModelTypes['UpdateOrderItemsResult'];
        /** Remove an OrderLine from the Order */
        removeOrderLine: ModelTypes['RemoveOrderItemsResult'];
        /** Remove all OrderLine from the Order */
        removeAllOrderLines: ModelTypes['RemoveOrderItemsResult'];
        /** Adjusts an OrderLine. If custom fields are defined on the OrderLine entity, a third argument 'customFields' of type `OrderLineCustomFieldsInput` will be available. */
        adjustOrderLine: ModelTypes['UpdateOrderItemsResult'];
        /** Applies the given coupon code to the active Order */
        applyCouponCode: ModelTypes['ApplyCouponCodeResult'];
        /** Removes the given coupon code from the active Order */
        removeCouponCode?: ModelTypes['Order'] | undefined;
        /** Transitions an Order to a new state. Valid next states can be found by querying `nextOrderStates` */
        transitionOrderToState?: ModelTypes['TransitionOrderToStateResult'] | undefined;
        /** Sets the shipping address for this order */
        setOrderShippingAddress: ModelTypes['ActiveOrderResult'];
        /** Sets the billing address for this order */
        setOrderBillingAddress: ModelTypes['ActiveOrderResult'];
        /** Allows any custom fields to be set for the active order */
        setOrderCustomFields: ModelTypes['ActiveOrderResult'];
        /** Sets the shipping method by id, which can be obtained with the `eligibleShippingMethods` query.
An Order can have multiple shipping methods, in which case you can pass an array of ids. In this case,
you should configure a custom ShippingLineAssignmentStrategy in order to know which OrderLines each
shipping method will apply to. */
        setOrderShippingMethod: ModelTypes['SetOrderShippingMethodResult'];
        /** Add a Payment to the Order */
        addPaymentToOrder: ModelTypes['AddPaymentToOrderResult'];
        /** Set the Customer for the Order. Required only if the Customer is not currently logged in */
        setCustomerForOrder: ModelTypes['SetCustomerForOrderResult'];
        /** Authenticates the user using the native authentication strategy. This mutation is an alias for `authenticate({ native: { ... }})` */
        login: ModelTypes['NativeAuthenticationResult'];
        /** Authenticates the user using a named authentication strategy */
        authenticate: ModelTypes['AuthenticationResult'];
        /** End the current authenticated session */
        logout: ModelTypes['Success'];
        /** Register a Customer account with the given credentials. There are three possible registration flows:

_If `authOptions.requireVerification` is set to `true`:_

1. **The Customer is registered _with_ a password**. A verificationToken will be created (and typically emailed to the Customer). That
   verificationToken would then be passed to the `verifyCustomerAccount` mutation _without_ a password. The Customer is then
   verified and authenticated in one step.
2. **The Customer is registered _without_ a password**. A verificationToken will be created (and typically emailed to the Customer). That
   verificationToken would then be passed to the `verifyCustomerAccount` mutation _with_ the chosen password of the Customer. The Customer is then
   verified and authenticated in one step.

_If `authOptions.requireVerification` is set to `false`:_

3. The Customer _must_ be registered _with_ a password. No further action is needed - the Customer is able to authenticate immediately. */
        registerCustomerAccount: ModelTypes['RegisterCustomerAccountResult'];
        /** Regenerate and send a verification token for a new Customer registration. Only applicable if `authOptions.requireVerification` is set to true. */
        refreshCustomerVerification: ModelTypes['RefreshCustomerVerificationResult'];
        /** Update an existing Customer */
        updateCustomer: ModelTypes['Customer'];
        /** Create a new Customer Address */
        createCustomerAddress: ModelTypes['Address'];
        /** Update an existing Address */
        updateCustomerAddress: ModelTypes['Address'];
        /** Delete an existing Address */
        deleteCustomerAddress: ModelTypes['Success'];
        /** Verify a Customer email address with the token sent to that address. Only applicable if `authOptions.requireVerification` is set to true.

If the Customer was not registered with a password in the `registerCustomerAccount` mutation, the password _must_ be
provided here. */
        verifyCustomerAccount: ModelTypes['VerifyCustomerAccountResult'];
        /** Update the password of the active Customer */
        updateCustomerPassword: ModelTypes['UpdateCustomerPasswordResult'];
        /** Request to update the emailAddress of the active Customer. If `authOptions.requireVerification` is enabled
(as is the default), then the `identifierChangeToken` will be assigned to the current User and
a IdentifierChangeRequestEvent will be raised. This can then be used e.g. by the EmailPlugin to email
that verification token to the Customer, which is then used to verify the change of email address. */
        requestUpdateCustomerEmailAddress: ModelTypes['RequestUpdateCustomerEmailAddressResult'];
        /** Confirm the update of the emailAddress with the provided token, which has been generated by the
`requestUpdateCustomerEmailAddress` mutation. */
        updateCustomerEmailAddress: ModelTypes['UpdateCustomerEmailAddressResult'];
        /** Requests a password reset email to be sent */
        requestPasswordReset?: ModelTypes['RequestPasswordResetResult'] | undefined;
        /** Resets a Customer's password based on the provided token */
        resetPassword: ModelTypes['ResetPasswordResult'];
    };
    ['Address']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        fullName?: string | undefined;
        company?: string | undefined;
        streetLine1: string;
        streetLine2?: string | undefined;
        city?: string | undefined;
        province?: string | undefined;
        postalCode?: string | undefined;
        country: ModelTypes['Country'];
        phoneNumber?: string | undefined;
        defaultShippingAddress?: boolean | undefined;
        defaultBillingAddress?: boolean | undefined;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['Asset']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        name: string;
        type: ModelTypes['AssetType'];
        fileSize: number;
        mimeType: string;
        width: number;
        height: number;
        source: string;
        preview: string;
        focalPoint?: ModelTypes['Coordinate'] | undefined;
        tags: Array<ModelTypes['Tag']>;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['Coordinate']: {
        x: number;
        y: number;
    };
    ['AssetList']: {
        items: Array<ModelTypes['Asset']>;
        totalItems: number;
    };
    ['AssetType']: AssetType;
    ['CurrentUser']: {
        id: string;
        identifier: string;
        channels: Array<ModelTypes['CurrentUserChannel']>;
    };
    ['CurrentUserChannel']: {
        id: string;
        token: string;
        code: string;
        permissions: Array<ModelTypes['Permission']>;
    };
    ['Channel']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        code: string;
        token: string;
        defaultTaxZone?: ModelTypes['Zone'] | undefined;
        defaultShippingZone?: ModelTypes['Zone'] | undefined;
        defaultLanguageCode: ModelTypes['LanguageCode'];
        availableLanguageCodes?: Array<ModelTypes['LanguageCode']> | undefined;
        currencyCode: ModelTypes['CurrencyCode'];
        defaultCurrencyCode: ModelTypes['CurrencyCode'];
        availableCurrencyCodes: Array<ModelTypes['CurrencyCode']>;
        /** Not yet used - will be implemented in a future release. */
        trackInventory?: boolean | undefined;
        /** Not yet used - will be implemented in a future release. */
        outOfStockThreshold?: number | undefined;
        pricesIncludeTax: boolean;
        seller?: ModelTypes['Seller'] | undefined;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['Collection']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        languageCode?: ModelTypes['LanguageCode'] | undefined;
        name: string;
        slug: string;
        breadcrumbs: Array<ModelTypes['CollectionBreadcrumb']>;
        position: number;
        description: string;
        featuredAsset?: ModelTypes['Asset'] | undefined;
        assets: Array<ModelTypes['Asset']>;
        parent?: ModelTypes['Collection'] | undefined;
        parentId: string;
        children?: Array<ModelTypes['Collection']> | undefined;
        filters: Array<ModelTypes['ConfigurableOperation']>;
        translations: Array<ModelTypes['CollectionTranslation']>;
        productVariants: ModelTypes['ProductVariantList'];
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['CollectionBreadcrumb']: {
        id: string;
        name: string;
        slug: string;
    };
    ['CollectionTranslation']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        languageCode: ModelTypes['LanguageCode'];
        name: string;
        slug: string;
        description: string;
    };
    ['CollectionList']: {
        items: Array<ModelTypes['Collection']>;
        totalItems: number;
    };
    ['GlobalFlag']: GlobalFlag;
    ['AdjustmentType']: AdjustmentType;
    ['DeletionResult']: DeletionResult;
    ['Permission']: Permission;
    ['SortOrder']: SortOrder;
    ['ErrorCode']: ErrorCode;
    ['LogicalOperator']: LogicalOperator;
    /** Returned when attempting an operation that relies on the NativeAuthStrategy, if that strategy is not configured. */
    ['NativeAuthStrategyError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
    };
    /** Returned if the user authentication credentials are not valid */
    ['InvalidCredentialsError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
        authenticationError: string;
    };
    /** Returned if there is an error in transitioning the Order state */
    ['OrderStateTransitionError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
        transitionError: string;
        fromState: string;
        toState: string;
    };
    /** Returned when attempting to create a Customer with an email address already registered to an existing User. */
    ['EmailAddressConflictError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
    };
    /** Returned when attempting to set the Customer on a guest checkout when the configured GuestCheckoutStrategy does not allow it. */
    ['GuestCheckoutError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
        errorDetail: string;
    };
    /** Returned when the maximum order size limit has been reached. */
    ['OrderLimitError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
        maxItems: number;
    };
    /** Returned when attempting to set a negative OrderLine quantity. */
    ['NegativeQuantityError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
    };
    /** Returned when attempting to add more items to the Order than are available */
    ['InsufficientStockError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
        quantityAvailable: number;
        order: ModelTypes['Order'];
    };
    /** Returned if the provided coupon code is invalid */
    ['CouponCodeInvalidError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
        couponCode: string;
    };
    /** Returned if the provided coupon code is invalid */
    ['CouponCodeExpiredError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
        couponCode: string;
    };
    /** Returned if the provided coupon code is invalid */
    ['CouponCodeLimitError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
        couponCode: string;
        limit: number;
    };
    /** Returned when attempting to modify the contents of an Order that is not in the `AddingItems` state. */
    ['OrderModificationError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
    };
    /** Returned when attempting to set a ShippingMethod for which the Order is not eligible */
    ['IneligibleShippingMethodError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
    };
    /** Returned when invoking a mutation which depends on there being an active Order on the
current session. */
    ['NoActiveOrderError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
    };
    /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
    ['JSON']: any;
    /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
    ['DateTime']: any;
    /** The `Upload` scalar type represents a file upload. */
    ['Upload']: any;
    /** The `Money` scalar type represents monetary values and supports signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point). */
    ['Money']: any;
    ['PaginatedList']:
        | ModelTypes['AssetList']
        | ModelTypes['CollectionList']
        | ModelTypes['CustomerList']
        | ModelTypes['FacetList']
        | ModelTypes['FacetValueList']
        | ModelTypes['HistoryEntryList']
        | ModelTypes['OrderList']
        | ModelTypes['ProductList']
        | ModelTypes['ProductVariantList']
        | ModelTypes['PromotionList']
        | ModelTypes['CountryList']
        | ModelTypes['ProvinceList']
        | ModelTypes['RoleList']
        | ModelTypes['ShippingMethodList']
        | ModelTypes['TagList']
        | ModelTypes['TaxRateList'];
    ['Node']:
        | ModelTypes['Address']
        | ModelTypes['Asset']
        | ModelTypes['Channel']
        | ModelTypes['Collection']
        | ModelTypes['CustomerGroup']
        | ModelTypes['Customer']
        | ModelTypes['FacetValue']
        | ModelTypes['Facet']
        | ModelTypes['HistoryEntry']
        | ModelTypes['Order']
        | ModelTypes['OrderLine']
        | ModelTypes['Payment']
        | ModelTypes['Refund']
        | ModelTypes['Fulfillment']
        | ModelTypes['Surcharge']
        | ModelTypes['PaymentMethod']
        | ModelTypes['ProductOptionGroup']
        | ModelTypes['ProductOption']
        | ModelTypes['Product']
        | ModelTypes['ProductVariant']
        | ModelTypes['Promotion']
        | ModelTypes['Region']
        | ModelTypes['Country']
        | ModelTypes['Province']
        | ModelTypes['Role']
        | ModelTypes['Seller']
        | ModelTypes['ShippingMethod']
        | ModelTypes['Tag']
        | ModelTypes['TaxCategory']
        | ModelTypes['TaxRate']
        | ModelTypes['User']
        | ModelTypes['AuthenticationMethod']
        | ModelTypes['Zone'];
    ['ErrorResult']:
        | ModelTypes['NativeAuthStrategyError']
        | ModelTypes['InvalidCredentialsError']
        | ModelTypes['OrderStateTransitionError']
        | ModelTypes['EmailAddressConflictError']
        | ModelTypes['GuestCheckoutError']
        | ModelTypes['OrderLimitError']
        | ModelTypes['NegativeQuantityError']
        | ModelTypes['InsufficientStockError']
        | ModelTypes['CouponCodeInvalidError']
        | ModelTypes['CouponCodeExpiredError']
        | ModelTypes['CouponCodeLimitError']
        | ModelTypes['OrderModificationError']
        | ModelTypes['IneligibleShippingMethodError']
        | ModelTypes['NoActiveOrderError']
        | ModelTypes['OrderPaymentStateError']
        | ModelTypes['IneligiblePaymentMethodError']
        | ModelTypes['PaymentFailedError']
        | ModelTypes['PaymentDeclinedError']
        | ModelTypes['AlreadyLoggedInError']
        | ModelTypes['MissingPasswordError']
        | ModelTypes['PasswordValidationError']
        | ModelTypes['PasswordAlreadySetError']
        | ModelTypes['VerificationTokenInvalidError']
        | ModelTypes['VerificationTokenExpiredError']
        | ModelTypes['IdentifierChangeTokenInvalidError']
        | ModelTypes['IdentifierChangeTokenExpiredError']
        | ModelTypes['PasswordResetTokenInvalidError']
        | ModelTypes['PasswordResetTokenExpiredError']
        | ModelTypes['NotVerifiedError'];
    ['Adjustment']: {
        adjustmentSource: string;
        type: ModelTypes['AdjustmentType'];
        description: string;
        amount: ModelTypes['Money'];
        data?: ModelTypes['JSON'] | undefined;
    };
    ['TaxLine']: {
        description: string;
        taxRate: number;
    };
    ['ConfigArg']: {
        name: string;
        value: string;
    };
    ['ConfigArgDefinition']: {
        name: string;
        type: string;
        list: boolean;
        required: boolean;
        defaultValue?: ModelTypes['JSON'] | undefined;
        label?: string | undefined;
        description?: string | undefined;
        ui?: ModelTypes['JSON'] | undefined;
    };
    ['ConfigurableOperation']: {
        code: string;
        args: Array<ModelTypes['ConfigArg']>;
    };
    ['ConfigurableOperationDefinition']: {
        code: string;
        args: Array<ModelTypes['ConfigArgDefinition']>;
        description: string;
    };
    ['DeletionResponse']: {
        result: ModelTypes['DeletionResult'];
        message?: string | undefined;
    };
    ['ConfigArgInput']: {
        name: string;
        /** A JSON stringified representation of the actual value */
        value: string;
    };
    ['ConfigurableOperationInput']: {
        code: string;
        arguments: Array<ModelTypes['ConfigArgInput']>;
    };
    /** Operators for filtering on a String field */
    ['StringOperators']: {
        eq?: string | undefined;
        notEq?: string | undefined;
        contains?: string | undefined;
        notContains?: string | undefined;
        in?: Array<string> | undefined;
        notIn?: Array<string> | undefined;
        regex?: string | undefined;
        isNull?: boolean | undefined;
    };
    /** Operators for filtering on an ID field */
    ['IDOperators']: {
        eq?: string | undefined;
        notEq?: string | undefined;
        in?: Array<string> | undefined;
        notIn?: Array<string> | undefined;
        isNull?: boolean | undefined;
    };
    /** Operators for filtering on a Boolean field */
    ['BooleanOperators']: {
        eq?: boolean | undefined;
        isNull?: boolean | undefined;
    };
    ['NumberRange']: {
        start: number;
        end: number;
    };
    /** Operators for filtering on a Int or Float field */
    ['NumberOperators']: {
        eq?: number | undefined;
        lt?: number | undefined;
        lte?: number | undefined;
        gt?: number | undefined;
        gte?: number | undefined;
        between?: ModelTypes['NumberRange'] | undefined;
        isNull?: boolean | undefined;
    };
    ['DateRange']: {
        start: ModelTypes['DateTime'];
        end: ModelTypes['DateTime'];
    };
    /** Operators for filtering on a DateTime field */
    ['DateOperators']: {
        eq?: ModelTypes['DateTime'] | undefined;
        before?: ModelTypes['DateTime'] | undefined;
        after?: ModelTypes['DateTime'] | undefined;
        between?: ModelTypes['DateRange'] | undefined;
        isNull?: boolean | undefined;
    };
    /** Operators for filtering on a list of String fields */
    ['StringListOperators']: {
        inList: string;
    };
    /** Operators for filtering on a list of Number fields */
    ['NumberListOperators']: {
        inList: number;
    };
    /** Operators for filtering on a list of Boolean fields */
    ['BooleanListOperators']: {
        inList: boolean;
    };
    /** Operators for filtering on a list of ID fields */
    ['IDListOperators']: {
        inList: string;
    };
    /** Operators for filtering on a list of Date fields */
    ['DateListOperators']: {
        inList: ModelTypes['DateTime'];
    };
    /** Used to construct boolean expressions for filtering search results
by FacetValue ID. Examples:

* ID=1 OR ID=2: `{ facetValueFilters: [{ or: [1,2] }] }`
* ID=1 AND ID=2: `{ facetValueFilters: [{ and: 1 }, { and: 2 }] }`
* ID=1 AND (ID=2 OR ID=3): `{ facetValueFilters: [{ and: 1 }, { or: [2,3] }] }` */
    ['FacetValueFilterInput']: {
        and?: string | undefined;
        or?: Array<string> | undefined;
    };
    ['SearchInput']: {
        term?: string | undefined;
        facetValueFilters?: Array<ModelTypes['FacetValueFilterInput']> | undefined;
        collectionId?: string | undefined;
        collectionSlug?: string | undefined;
        groupByProduct?: boolean | undefined;
        take?: number | undefined;
        skip?: number | undefined;
        sort?: ModelTypes['SearchResultSortParameter'] | undefined;
        inStock?: boolean | undefined;
    };
    ['SearchResultSortParameter']: {
        name?: ModelTypes['SortOrder'] | undefined;
        price?: ModelTypes['SortOrder'] | undefined;
    };
    ['CreateCustomerInput']: {
        title?: string | undefined;
        firstName: string;
        lastName: string;
        phoneNumber?: string | undefined;
        emailAddress: string;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['CreateAddressInput']: {
        fullName?: string | undefined;
        company?: string | undefined;
        streetLine1: string;
        streetLine2?: string | undefined;
        city?: string | undefined;
        province?: string | undefined;
        postalCode?: string | undefined;
        countryCode: string;
        phoneNumber?: string | undefined;
        defaultShippingAddress?: boolean | undefined;
        defaultBillingAddress?: boolean | undefined;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['UpdateAddressInput']: {
        id: string;
        fullName?: string | undefined;
        company?: string | undefined;
        streetLine1?: string | undefined;
        streetLine2?: string | undefined;
        city?: string | undefined;
        province?: string | undefined;
        postalCode?: string | undefined;
        countryCode?: string | undefined;
        phoneNumber?: string | undefined;
        defaultShippingAddress?: boolean | undefined;
        defaultBillingAddress?: boolean | undefined;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    /** Indicates that an operation succeeded, where we do not want to return any more specific information. */
    ['Success']: {
        success: boolean;
    };
    ['ShippingMethodQuote']: {
        id: string;
        price: ModelTypes['Money'];
        priceWithTax: ModelTypes['Money'];
        code: string;
        name: string;
        description: string;
        /** Any optional metadata returned by the ShippingCalculator in the ShippingCalculationResult */
        metadata?: ModelTypes['JSON'] | undefined;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['PaymentMethodQuote']: {
        id: string;
        code: string;
        name: string;
        description: string;
        isEligible: boolean;
        eligibilityMessage?: string | undefined;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['UpdateOrderItemsResult']:
        | ModelTypes['Order']
        | ModelTypes['OrderModificationError']
        | ModelTypes['OrderLimitError']
        | ModelTypes['NegativeQuantityError']
        | ModelTypes['InsufficientStockError'];
    ['RemoveOrderItemsResult']: ModelTypes['Order'] | ModelTypes['OrderModificationError'];
    ['SetOrderShippingMethodResult']:
        | ModelTypes['Order']
        | ModelTypes['OrderModificationError']
        | ModelTypes['IneligibleShippingMethodError']
        | ModelTypes['NoActiveOrderError'];
    ['ApplyCouponCodeResult']:
        | ModelTypes['Order']
        | ModelTypes['CouponCodeExpiredError']
        | ModelTypes['CouponCodeInvalidError']
        | ModelTypes['CouponCodeLimitError'];
    ['CurrencyCode']: CurrencyCode;
    ['CustomField']:
        | ModelTypes['StringCustomFieldConfig']
        | ModelTypes['LocaleStringCustomFieldConfig']
        | ModelTypes['IntCustomFieldConfig']
        | ModelTypes['FloatCustomFieldConfig']
        | ModelTypes['BooleanCustomFieldConfig']
        | ModelTypes['DateTimeCustomFieldConfig']
        | ModelTypes['RelationCustomFieldConfig']
        | ModelTypes['TextCustomFieldConfig']
        | ModelTypes['LocaleTextCustomFieldConfig'];
    ['StringCustomFieldConfig']: {
        name: string;
        type: string;
        list: boolean;
        length?: number | undefined;
        label?: Array<ModelTypes['LocalizedString']> | undefined;
        description?: Array<ModelTypes['LocalizedString']> | undefined;
        readonly?: boolean | undefined;
        internal?: boolean | undefined;
        nullable?: boolean | undefined;
        pattern?: string | undefined;
        options?: Array<ModelTypes['StringFieldOption']> | undefined;
        ui?: ModelTypes['JSON'] | undefined;
    };
    ['StringFieldOption']: {
        value: string;
        label?: Array<ModelTypes['LocalizedString']> | undefined;
    };
    ['LocaleStringCustomFieldConfig']: {
        name: string;
        type: string;
        list: boolean;
        length?: number | undefined;
        label?: Array<ModelTypes['LocalizedString']> | undefined;
        description?: Array<ModelTypes['LocalizedString']> | undefined;
        readonly?: boolean | undefined;
        internal?: boolean | undefined;
        nullable?: boolean | undefined;
        pattern?: string | undefined;
        ui?: ModelTypes['JSON'] | undefined;
    };
    ['IntCustomFieldConfig']: {
        name: string;
        type: string;
        list: boolean;
        label?: Array<ModelTypes['LocalizedString']> | undefined;
        description?: Array<ModelTypes['LocalizedString']> | undefined;
        readonly?: boolean | undefined;
        internal?: boolean | undefined;
        nullable?: boolean | undefined;
        min?: number | undefined;
        max?: number | undefined;
        step?: number | undefined;
        ui?: ModelTypes['JSON'] | undefined;
    };
    ['FloatCustomFieldConfig']: {
        name: string;
        type: string;
        list: boolean;
        label?: Array<ModelTypes['LocalizedString']> | undefined;
        description?: Array<ModelTypes['LocalizedString']> | undefined;
        readonly?: boolean | undefined;
        internal?: boolean | undefined;
        nullable?: boolean | undefined;
        min?: number | undefined;
        max?: number | undefined;
        step?: number | undefined;
        ui?: ModelTypes['JSON'] | undefined;
    };
    ['BooleanCustomFieldConfig']: {
        name: string;
        type: string;
        list: boolean;
        label?: Array<ModelTypes['LocalizedString']> | undefined;
        description?: Array<ModelTypes['LocalizedString']> | undefined;
        readonly?: boolean | undefined;
        internal?: boolean | undefined;
        nullable?: boolean | undefined;
        ui?: ModelTypes['JSON'] | undefined;
    };
    /** Expects the same validation formats as the `<input type="datetime-local">` HTML element.
See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local#Additional_attributes */
    ['DateTimeCustomFieldConfig']: {
        name: string;
        type: string;
        list: boolean;
        label?: Array<ModelTypes['LocalizedString']> | undefined;
        description?: Array<ModelTypes['LocalizedString']> | undefined;
        readonly?: boolean | undefined;
        internal?: boolean | undefined;
        nullable?: boolean | undefined;
        min?: string | undefined;
        max?: string | undefined;
        step?: number | undefined;
        ui?: ModelTypes['JSON'] | undefined;
    };
    ['RelationCustomFieldConfig']: {
        name: string;
        type: string;
        list: boolean;
        label?: Array<ModelTypes['LocalizedString']> | undefined;
        description?: Array<ModelTypes['LocalizedString']> | undefined;
        readonly?: boolean | undefined;
        internal?: boolean | undefined;
        nullable?: boolean | undefined;
        entity: string;
        scalarFields: Array<string>;
        ui?: ModelTypes['JSON'] | undefined;
    };
    ['TextCustomFieldConfig']: {
        name: string;
        type: string;
        list: boolean;
        label?: Array<ModelTypes['LocalizedString']> | undefined;
        description?: Array<ModelTypes['LocalizedString']> | undefined;
        readonly?: boolean | undefined;
        internal?: boolean | undefined;
        nullable?: boolean | undefined;
        ui?: ModelTypes['JSON'] | undefined;
    };
    ['LocaleTextCustomFieldConfig']: {
        name: string;
        type: string;
        list: boolean;
        label?: Array<ModelTypes['LocalizedString']> | undefined;
        description?: Array<ModelTypes['LocalizedString']> | undefined;
        readonly?: boolean | undefined;
        internal?: boolean | undefined;
        nullable?: boolean | undefined;
        ui?: ModelTypes['JSON'] | undefined;
    };
    ['LocalizedString']: {
        languageCode: ModelTypes['LanguageCode'];
        value: string;
    };
    ['CustomFieldConfig']:
        | ModelTypes['StringCustomFieldConfig']
        | ModelTypes['LocaleStringCustomFieldConfig']
        | ModelTypes['IntCustomFieldConfig']
        | ModelTypes['FloatCustomFieldConfig']
        | ModelTypes['BooleanCustomFieldConfig']
        | ModelTypes['DateTimeCustomFieldConfig']
        | ModelTypes['RelationCustomFieldConfig']
        | ModelTypes['TextCustomFieldConfig']
        | ModelTypes['LocaleTextCustomFieldConfig'];
    ['CustomerGroup']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        name: string;
        customers: ModelTypes['CustomerList'];
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['CustomerListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined;
        /** Takes n results, for use in pagination */
        take?: number | undefined;
        /** Specifies which properties to sort the results by */
        sort?: ModelTypes['CustomerSortParameter'] | undefined;
        /** Allows the results to be filtered */
        filter?: ModelTypes['CustomerFilterParameter'] | undefined;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ModelTypes['LogicalOperator'] | undefined;
    };
    ['Customer']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        title?: string | undefined;
        firstName: string;
        lastName: string;
        phoneNumber?: string | undefined;
        emailAddress: string;
        addresses?: Array<ModelTypes['Address']> | undefined;
        orders: ModelTypes['OrderList'];
        user?: ModelTypes['User'] | undefined;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['CustomerList']: {
        items: Array<ModelTypes['Customer']>;
        totalItems: number;
    };
    ['FacetValue']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        languageCode: ModelTypes['LanguageCode'];
        facet: ModelTypes['Facet'];
        facetId: string;
        name: string;
        code: string;
        translations: Array<ModelTypes['FacetValueTranslation']>;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['FacetValueTranslation']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        languageCode: ModelTypes['LanguageCode'];
        name: string;
    };
    ['Facet']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        languageCode: ModelTypes['LanguageCode'];
        name: string;
        code: string;
        values: Array<ModelTypes['FacetValue']>;
        /** Returns a paginated, sortable, filterable list of the Facet's values. Added in v2.1.0. */
        valueList: ModelTypes['FacetValueList'];
        translations: Array<ModelTypes['FacetTranslation']>;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['FacetTranslation']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        languageCode: ModelTypes['LanguageCode'];
        name: string;
    };
    ['FacetList']: {
        items: Array<ModelTypes['Facet']>;
        totalItems: number;
    };
    ['FacetValueListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined;
        /** Takes n results, for use in pagination */
        take?: number | undefined;
        /** Specifies which properties to sort the results by */
        sort?: ModelTypes['FacetValueSortParameter'] | undefined;
        /** Allows the results to be filtered */
        filter?: ModelTypes['FacetValueFilterParameter'] | undefined;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ModelTypes['LogicalOperator'] | undefined;
    };
    ['FacetValueList']: {
        items: Array<ModelTypes['FacetValue']>;
        totalItems: number;
    };
    ['HistoryEntry']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        type: ModelTypes['HistoryEntryType'];
        data: ModelTypes['JSON'];
    };
    ['HistoryEntryType']: HistoryEntryType;
    ['HistoryEntryList']: {
        items: Array<ModelTypes['HistoryEntry']>;
        totalItems: number;
    };
    ['HistoryEntryListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined;
        /** Takes n results, for use in pagination */
        take?: number | undefined;
        /** Specifies which properties to sort the results by */
        sort?: ModelTypes['HistoryEntrySortParameter'] | undefined;
        /** Allows the results to be filtered */
        filter?: ModelTypes['HistoryEntryFilterParameter'] | undefined;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ModelTypes['LogicalOperator'] | undefined;
    };
    ['LanguageCode']: LanguageCode;
    ['OrderType']: OrderType;
    ['Order']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        type: ModelTypes['OrderType'];
        /** The date & time that the Order was placed, i.e. the Customer
completed the checkout and the Order is no longer "active" */
        orderPlacedAt?: ModelTypes['DateTime'] | undefined;
        /** A unique code for the Order */
        code: string;
        state: string;
        /** An order is active as long as the payment process has not been completed */
        active: boolean;
        customer?: ModelTypes['Customer'] | undefined;
        shippingAddress?: ModelTypes['OrderAddress'] | undefined;
        billingAddress?: ModelTypes['OrderAddress'] | undefined;
        lines: Array<ModelTypes['OrderLine']>;
        /** Surcharges are arbitrary modifications to the Order total which are neither
ProductVariants nor discounts resulting from applied Promotions. For example,
one-off discounts based on customer interaction, or surcharges based on payment
methods. */
        surcharges: Array<ModelTypes['Surcharge']>;
        discounts: Array<ModelTypes['Discount']>;
        /** An array of all coupon codes applied to the Order */
        couponCodes: Array<string>;
        /** Promotions applied to the order. Only gets populated after the payment process has completed. */
        promotions: Array<ModelTypes['Promotion']>;
        payments?: Array<ModelTypes['Payment']> | undefined;
        fulfillments?: Array<ModelTypes['Fulfillment']> | undefined;
        totalQuantity: number;
        /** The subTotal is the total of all OrderLines in the Order. This figure also includes any Order-level
discounts which have been prorated (proportionally distributed) amongst the items of each OrderLine.
To get a total of all OrderLines which does not account for prorated discounts, use the
sum of `OrderLine.discountedLinePrice` values. */
        subTotal: ModelTypes['Money'];
        /** Same as subTotal, but inclusive of tax */
        subTotalWithTax: ModelTypes['Money'];
        currencyCode: ModelTypes['CurrencyCode'];
        shippingLines: Array<ModelTypes['ShippingLine']>;
        shipping: ModelTypes['Money'];
        shippingWithTax: ModelTypes['Money'];
        /** Equal to subTotal plus shipping */
        total: ModelTypes['Money'];
        /** The final payable amount. Equal to subTotalWithTax plus shippingWithTax */
        totalWithTax: ModelTypes['Money'];
        /** A summary of the taxes being applied to this Order */
        taxSummary: Array<ModelTypes['OrderTaxSummary']>;
        history: ModelTypes['HistoryEntryList'];
        customFields?: ModelTypes['JSON'] | undefined;
    };
    /** A summary of the taxes being applied to this order, grouped
by taxRate. */
    ['OrderTaxSummary']: {
        /** A description of this tax */
        description: string;
        /** The taxRate as a percentage */
        taxRate: number;
        /** The total net price of OrderLines to which this taxRate applies */
        taxBase: ModelTypes['Money'];
        /** The total tax being applied to the Order at this taxRate */
        taxTotal: ModelTypes['Money'];
    };
    ['OrderAddress']: {
        fullName?: string | undefined;
        company?: string | undefined;
        streetLine1?: string | undefined;
        streetLine2?: string | undefined;
        city?: string | undefined;
        province?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
        countryCode?: string | undefined;
        phoneNumber?: string | undefined;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['OrderList']: {
        items: Array<ModelTypes['Order']>;
        totalItems: number;
    };
    ['ShippingLine']: {
        id: string;
        shippingMethod: ModelTypes['ShippingMethod'];
        price: ModelTypes['Money'];
        priceWithTax: ModelTypes['Money'];
        discountedPrice: ModelTypes['Money'];
        discountedPriceWithTax: ModelTypes['Money'];
        discounts: Array<ModelTypes['Discount']>;
    };
    ['Discount']: {
        adjustmentSource: string;
        type: ModelTypes['AdjustmentType'];
        description: string;
        amount: ModelTypes['Money'];
        amountWithTax: ModelTypes['Money'];
    };
    ['OrderLine']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        productVariant: ModelTypes['ProductVariant'];
        featuredAsset?: ModelTypes['Asset'] | undefined;
        /** The price of a single unit, excluding tax and discounts */
        unitPrice: ModelTypes['Money'];
        /** The price of a single unit, including tax but excluding discounts */
        unitPriceWithTax: ModelTypes['Money'];
        /** Non-zero if the unitPrice has changed since it was initially added to Order */
        unitPriceChangeSinceAdded: ModelTypes['Money'];
        /** Non-zero if the unitPriceWithTax has changed since it was initially added to Order */
        unitPriceWithTaxChangeSinceAdded: ModelTypes['Money'];
        /** The price of a single unit including discounts, excluding tax.

If Order-level discounts have been applied, this will not be the
actual taxable unit price (see `proratedUnitPrice`), but is generally the
correct price to display to customers to avoid confusion
about the internal handling of distributed Order-level discounts. */
        discountedUnitPrice: ModelTypes['Money'];
        /** The price of a single unit including discounts and tax */
        discountedUnitPriceWithTax: ModelTypes['Money'];
        /** The actual unit price, taking into account both item discounts _and_ prorated (proportionally-distributed)
Order-level discounts. This value is the true economic value of the OrderItem, and is used in tax
and refund calculations. */
        proratedUnitPrice: ModelTypes['Money'];
        /** The proratedUnitPrice including tax */
        proratedUnitPriceWithTax: ModelTypes['Money'];
        /** The quantity of items purchased */
        quantity: number;
        /** The quantity at the time the Order was placed */
        orderPlacedQuantity: number;
        taxRate: number;
        /** The total price of the line excluding tax and discounts. */
        linePrice: ModelTypes['Money'];
        /** The total price of the line including tax but excluding discounts. */
        linePriceWithTax: ModelTypes['Money'];
        /** The price of the line including discounts, excluding tax */
        discountedLinePrice: ModelTypes['Money'];
        /** The price of the line including discounts and tax */
        discountedLinePriceWithTax: ModelTypes['Money'];
        /** The actual line price, taking into account both item discounts _and_ prorated (proportionally-distributed)
Order-level discounts. This value is the true economic value of the OrderLine, and is used in tax
and refund calculations. */
        proratedLinePrice: ModelTypes['Money'];
        /** The proratedLinePrice including tax */
        proratedLinePriceWithTax: ModelTypes['Money'];
        /** The total tax on this line */
        lineTax: ModelTypes['Money'];
        discounts: Array<ModelTypes['Discount']>;
        taxLines: Array<ModelTypes['TaxLine']>;
        order: ModelTypes['Order'];
        fulfillmentLines?: Array<ModelTypes['FulfillmentLine']> | undefined;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['Payment']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        method: string;
        amount: ModelTypes['Money'];
        state: string;
        transactionId?: string | undefined;
        errorMessage?: string | undefined;
        refunds: Array<ModelTypes['Refund']>;
        metadata?: ModelTypes['JSON'] | undefined;
    };
    ['RefundLine']: {
        orderLine: ModelTypes['OrderLine'];
        orderLineId: string;
        quantity: number;
        refund: ModelTypes['Refund'];
        refundId: string;
    };
    ['Refund']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        items: ModelTypes['Money'];
        shipping: ModelTypes['Money'];
        adjustment: ModelTypes['Money'];
        total: ModelTypes['Money'];
        method?: string | undefined;
        state: string;
        transactionId?: string | undefined;
        reason?: string | undefined;
        lines: Array<ModelTypes['RefundLine']>;
        paymentId: string;
        metadata?: ModelTypes['JSON'] | undefined;
    };
    ['FulfillmentLine']: {
        orderLine: ModelTypes['OrderLine'];
        orderLineId: string;
        quantity: number;
        fulfillment: ModelTypes['Fulfillment'];
        fulfillmentId: string;
    };
    ['Fulfillment']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        lines: Array<ModelTypes['FulfillmentLine']>;
        summary: Array<ModelTypes['FulfillmentLine']>;
        state: string;
        method: string;
        trackingCode?: string | undefined;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['Surcharge']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        description: string;
        sku?: string | undefined;
        taxLines: Array<ModelTypes['TaxLine']>;
        price: ModelTypes['Money'];
        priceWithTax: ModelTypes['Money'];
        taxRate: number;
    };
    ['PaymentMethod']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        name: string;
        code: string;
        description: string;
        enabled: boolean;
        checker?: ModelTypes['ConfigurableOperation'] | undefined;
        handler: ModelTypes['ConfigurableOperation'];
        translations: Array<ModelTypes['PaymentMethodTranslation']>;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['PaymentMethodTranslation']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        languageCode: ModelTypes['LanguageCode'];
        name: string;
        description: string;
    };
    ['ProductOptionGroup']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        languageCode: ModelTypes['LanguageCode'];
        code: string;
        name: string;
        options: Array<ModelTypes['ProductOption']>;
        translations: Array<ModelTypes['ProductOptionGroupTranslation']>;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['ProductOptionGroupTranslation']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        languageCode: ModelTypes['LanguageCode'];
        name: string;
    };
    ['ProductOption']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        languageCode: ModelTypes['LanguageCode'];
        code: string;
        name: string;
        groupId: string;
        group: ModelTypes['ProductOptionGroup'];
        translations: Array<ModelTypes['ProductOptionTranslation']>;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['ProductOptionTranslation']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        languageCode: ModelTypes['LanguageCode'];
        name: string;
    };
    ['SearchReindexResponse']: {
        success: boolean;
    };
    ['SearchResponse']: {
        items: Array<ModelTypes['SearchResult']>;
        totalItems: number;
        facetValues: Array<ModelTypes['FacetValueResult']>;
        collections: Array<ModelTypes['CollectionResult']>;
    };
    /** Which FacetValues are present in the products returned
by the search, and in what quantity. */
    ['FacetValueResult']: {
        facetValue: ModelTypes['FacetValue'];
        count: number;
    };
    /** Which Collections are present in the products returned
by the search, and in what quantity. */
    ['CollectionResult']: {
        collection: ModelTypes['Collection'];
        count: number;
    };
    ['SearchResultAsset']: {
        id: string;
        preview: string;
        focalPoint?: ModelTypes['Coordinate'] | undefined;
    };
    ['SearchResult']: {
        sku: string;
        slug: string;
        productId: string;
        productName: string;
        productAsset?: ModelTypes['SearchResultAsset'] | undefined;
        productVariantId: string;
        productVariantName: string;
        productVariantAsset?: ModelTypes['SearchResultAsset'] | undefined;
        price: ModelTypes['SearchResultPrice'];
        priceWithTax: ModelTypes['SearchResultPrice'];
        currencyCode: ModelTypes['CurrencyCode'];
        description: string;
        facetIds: Array<string>;
        facetValueIds: Array<string>;
        /** An array of ids of the Collections in which this result appears */
        collectionIds: Array<string>;
        /** A relevance score for the result. Differs between database implementations */
        score: number;
        inStock: boolean;
    };
    /** The price of a search result product, either as a range or as a single price */
    ['SearchResultPrice']: ModelTypes['PriceRange'] | ModelTypes['SinglePrice'];
    /** The price value where the result has a single price */
    ['SinglePrice']: {
        value: ModelTypes['Money'];
    };
    /** The price range where the result has more than one price */
    ['PriceRange']: {
        min: ModelTypes['Money'];
        max: ModelTypes['Money'];
    };
    ['Product']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        languageCode: ModelTypes['LanguageCode'];
        name: string;
        slug: string;
        description: string;
        featuredAsset?: ModelTypes['Asset'] | undefined;
        assets: Array<ModelTypes['Asset']>;
        /** Returns all ProductVariants */
        variants: Array<ModelTypes['ProductVariant']>;
        /** Returns a paginated, sortable, filterable list of ProductVariants */
        variantList: ModelTypes['ProductVariantList'];
        optionGroups: Array<ModelTypes['ProductOptionGroup']>;
        facetValues: Array<ModelTypes['FacetValue']>;
        translations: Array<ModelTypes['ProductTranslation']>;
        collections: Array<ModelTypes['Collection']>;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['ProductTranslation']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        languageCode: ModelTypes['LanguageCode'];
        name: string;
        slug: string;
        description: string;
    };
    ['ProductList']: {
        items: Array<ModelTypes['Product']>;
        totalItems: number;
    };
    ['ProductVariantList']: {
        items: Array<ModelTypes['ProductVariant']>;
        totalItems: number;
    };
    ['ProductVariant']: {
        id: string;
        product: ModelTypes['Product'];
        productId: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        languageCode: ModelTypes['LanguageCode'];
        sku: string;
        name: string;
        featuredAsset?: ModelTypes['Asset'] | undefined;
        assets: Array<ModelTypes['Asset']>;
        price: ModelTypes['Money'];
        currencyCode: ModelTypes['CurrencyCode'];
        priceWithTax: ModelTypes['Money'];
        stockLevel: string;
        taxRateApplied: ModelTypes['TaxRate'];
        taxCategory: ModelTypes['TaxCategory'];
        options: Array<ModelTypes['ProductOption']>;
        facetValues: Array<ModelTypes['FacetValue']>;
        translations: Array<ModelTypes['ProductVariantTranslation']>;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['ProductVariantTranslation']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        languageCode: ModelTypes['LanguageCode'];
        name: string;
    };
    ['Promotion']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        startsAt?: ModelTypes['DateTime'] | undefined;
        endsAt?: ModelTypes['DateTime'] | undefined;
        couponCode?: string | undefined;
        perCustomerUsageLimit?: number | undefined;
        usageLimit?: number | undefined;
        name: string;
        description: string;
        enabled: boolean;
        conditions: Array<ModelTypes['ConfigurableOperation']>;
        actions: Array<ModelTypes['ConfigurableOperation']>;
        translations: Array<ModelTypes['PromotionTranslation']>;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['PromotionTranslation']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        languageCode: ModelTypes['LanguageCode'];
        name: string;
        description: string;
    };
    ['PromotionList']: {
        items: Array<ModelTypes['Promotion']>;
        totalItems: number;
    };
    ['Region']: ModelTypes['Country'] | ModelTypes['Province'];
    ['RegionTranslation']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        languageCode: ModelTypes['LanguageCode'];
        name: string;
    };
    ['Country']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        languageCode: ModelTypes['LanguageCode'];
        code: string;
        type: string;
        name: string;
        enabled: boolean;
        parent?: ModelTypes['Region'] | undefined;
        parentId?: string | undefined;
        translations: Array<ModelTypes['RegionTranslation']>;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['CountryList']: {
        items: Array<ModelTypes['Country']>;
        totalItems: number;
    };
    ['Province']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        languageCode: ModelTypes['LanguageCode'];
        code: string;
        type: string;
        name: string;
        enabled: boolean;
        parent?: ModelTypes['Region'] | undefined;
        parentId?: string | undefined;
        translations: Array<ModelTypes['RegionTranslation']>;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['ProvinceList']: {
        items: Array<ModelTypes['Province']>;
        totalItems: number;
    };
    ['Role']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        code: string;
        description: string;
        permissions: Array<ModelTypes['Permission']>;
        channels: Array<ModelTypes['Channel']>;
    };
    ['RoleList']: {
        items: Array<ModelTypes['Role']>;
        totalItems: number;
    };
    ['Seller']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        name: string;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['ShippingMethod']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        languageCode: ModelTypes['LanguageCode'];
        code: string;
        name: string;
        description: string;
        fulfillmentHandlerCode: string;
        checker: ModelTypes['ConfigurableOperation'];
        calculator: ModelTypes['ConfigurableOperation'];
        translations: Array<ModelTypes['ShippingMethodTranslation']>;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['ShippingMethodTranslation']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        languageCode: ModelTypes['LanguageCode'];
        name: string;
        description: string;
    };
    ['ShippingMethodList']: {
        items: Array<ModelTypes['ShippingMethod']>;
        totalItems: number;
    };
    ['Tag']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        value: string;
    };
    ['TagList']: {
        items: Array<ModelTypes['Tag']>;
        totalItems: number;
    };
    ['TaxCategory']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        name: string;
        isDefault: boolean;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['TaxRate']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        name: string;
        enabled: boolean;
        value: number;
        category: ModelTypes['TaxCategory'];
        zone: ModelTypes['Zone'];
        customerGroup?: ModelTypes['CustomerGroup'] | undefined;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['TaxRateList']: {
        items: Array<ModelTypes['TaxRate']>;
        totalItems: number;
    };
    ['User']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        identifier: string;
        verified: boolean;
        roles: Array<ModelTypes['Role']>;
        lastLogin?: ModelTypes['DateTime'] | undefined;
        authenticationMethods: Array<ModelTypes['AuthenticationMethod']>;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['AuthenticationMethod']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        strategy: string;
    };
    ['Zone']: {
        id: string;
        createdAt: ModelTypes['DateTime'];
        updatedAt: ModelTypes['DateTime'];
        name: string;
        members: Array<ModelTypes['Region']>;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    /** Returned when attempting to add a Payment to an Order that is not in the `ArrangingPayment` state. */
    ['OrderPaymentStateError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
    };
    /** Returned when attempting to add a Payment using a PaymentMethod for which the Order is not eligible. */
    ['IneligiblePaymentMethodError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
        eligibilityCheckerMessage?: string | undefined;
    };
    /** Returned when a Payment fails due to an error. */
    ['PaymentFailedError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
        paymentErrorMessage: string;
    };
    /** Returned when a Payment is declined by the payment provider. */
    ['PaymentDeclinedError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
        paymentErrorMessage: string;
    };
    /** Returned when attempting to set the Customer for an Order when already logged in. */
    ['AlreadyLoggedInError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
    };
    /** Returned when attempting to register or verify a customer account without a password, when one is required. */
    ['MissingPasswordError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
    };
    /** Returned when attempting to register or verify a customer account where the given password fails password validation. */
    ['PasswordValidationError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
        validationErrorMessage: string;
    };
    /** Returned when attempting to verify a customer account with a password, when a password has already been set. */
    ['PasswordAlreadySetError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
    };
    /** Returned if the verification token (used to verify a Customer's email address) is either
invalid or does not match any expected tokens. */
    ['VerificationTokenInvalidError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
    };
    /** Returned if the verification token (used to verify a Customer's email address) is valid, but has
expired according to the `verificationTokenDuration` setting in the AuthOptions. */
    ['VerificationTokenExpiredError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
    };
    /** Returned if the token used to change a Customer's email address is either
invalid or does not match any expected tokens. */
    ['IdentifierChangeTokenInvalidError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
    };
    /** Returned if the token used to change a Customer's email address is valid, but has
expired according to the `verificationTokenDuration` setting in the AuthOptions. */
    ['IdentifierChangeTokenExpiredError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
    };
    /** Returned if the token used to reset a Customer's password is either
invalid or does not match any expected tokens. */
    ['PasswordResetTokenInvalidError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
    };
    /** Returned if the token used to reset a Customer's password is valid, but has
expired according to the `verificationTokenDuration` setting in the AuthOptions. */
    ['PasswordResetTokenExpiredError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
    };
    /** Returned if `authOptions.requireVerification` is set to `true` (which is the default)
and an unverified user attempts to authenticate. */
    ['NotVerifiedError']: {
        errorCode: ModelTypes['ErrorCode'];
        message: string;
    };
    ['AuthenticationInput']: {
        native?: ModelTypes['NativeAuthInput'] | undefined;
    };
    ['RegisterCustomerInput']: {
        emailAddress: string;
        title?: string | undefined;
        firstName?: string | undefined;
        lastName?: string | undefined;
        phoneNumber?: string | undefined;
        password?: string | undefined;
    };
    ['UpdateCustomerInput']: {
        title?: string | undefined;
        firstName?: string | undefined;
        lastName?: string | undefined;
        phoneNumber?: string | undefined;
        customFields?: ModelTypes['JSON'] | undefined;
    };
    ['UpdateOrderInput']: {
        customFields?: ModelTypes['JSON'] | undefined;
    };
    /** Passed as input to the `addPaymentToOrder` mutation. */
    ['PaymentInput']: {
        /** This field should correspond to the `code` property of a PaymentMethod. */
        method: string;
        /** This field should contain arbitrary data passed to the specified PaymentMethodHandler's `createPayment()` method
as the "metadata" argument. For example, it could contain an ID for the payment and other
data generated by the payment provider. */
        metadata: ModelTypes['JSON'];
    };
    ['CollectionListOptions']: {
        topLevelOnly?: boolean | undefined;
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined;
        /** Takes n results, for use in pagination */
        take?: number | undefined;
        /** Specifies which properties to sort the results by */
        sort?: ModelTypes['CollectionSortParameter'] | undefined;
        /** Allows the results to be filtered */
        filter?: ModelTypes['CollectionFilterParameter'] | undefined;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ModelTypes['LogicalOperator'] | undefined;
    };
    ['FacetListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined;
        /** Takes n results, for use in pagination */
        take?: number | undefined;
        /** Specifies which properties to sort the results by */
        sort?: ModelTypes['FacetSortParameter'] | undefined;
        /** Allows the results to be filtered */
        filter?: ModelTypes['FacetFilterParameter'] | undefined;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ModelTypes['LogicalOperator'] | undefined;
    };
    ['OrderListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined;
        /** Takes n results, for use in pagination */
        take?: number | undefined;
        /** Specifies which properties to sort the results by */
        sort?: ModelTypes['OrderSortParameter'] | undefined;
        /** Allows the results to be filtered */
        filter?: ModelTypes['OrderFilterParameter'] | undefined;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ModelTypes['LogicalOperator'] | undefined;
    };
    ['ProductListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined;
        /** Takes n results, for use in pagination */
        take?: number | undefined;
        /** Specifies which properties to sort the results by */
        sort?: ModelTypes['ProductSortParameter'] | undefined;
        /** Allows the results to be filtered */
        filter?: ModelTypes['ProductFilterParameter'] | undefined;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ModelTypes['LogicalOperator'] | undefined;
    };
    ['ProductVariantListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined;
        /** Takes n results, for use in pagination */
        take?: number | undefined;
        /** Specifies which properties to sort the results by */
        sort?: ModelTypes['ProductVariantSortParameter'] | undefined;
        /** Allows the results to be filtered */
        filter?: ModelTypes['ProductVariantFilterParameter'] | undefined;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: ModelTypes['LogicalOperator'] | undefined;
    };
    ['AddPaymentToOrderResult']:
        | ModelTypes['Order']
        | ModelTypes['OrderPaymentStateError']
        | ModelTypes['IneligiblePaymentMethodError']
        | ModelTypes['PaymentFailedError']
        | ModelTypes['PaymentDeclinedError']
        | ModelTypes['OrderStateTransitionError']
        | ModelTypes['NoActiveOrderError'];
    ['TransitionOrderToStateResult']: ModelTypes['Order'] | ModelTypes['OrderStateTransitionError'];
    ['SetCustomerForOrderResult']:
        | ModelTypes['Order']
        | ModelTypes['AlreadyLoggedInError']
        | ModelTypes['EmailAddressConflictError']
        | ModelTypes['NoActiveOrderError']
        | ModelTypes['GuestCheckoutError'];
    ['RegisterCustomerAccountResult']:
        | ModelTypes['Success']
        | ModelTypes['MissingPasswordError']
        | ModelTypes['PasswordValidationError']
        | ModelTypes['NativeAuthStrategyError'];
    ['RefreshCustomerVerificationResult']: ModelTypes['Success'] | ModelTypes['NativeAuthStrategyError'];
    ['VerifyCustomerAccountResult']:
        | ModelTypes['CurrentUser']
        | ModelTypes['VerificationTokenInvalidError']
        | ModelTypes['VerificationTokenExpiredError']
        | ModelTypes['MissingPasswordError']
        | ModelTypes['PasswordValidationError']
        | ModelTypes['PasswordAlreadySetError']
        | ModelTypes['NativeAuthStrategyError'];
    ['UpdateCustomerPasswordResult']:
        | ModelTypes['Success']
        | ModelTypes['InvalidCredentialsError']
        | ModelTypes['PasswordValidationError']
        | ModelTypes['NativeAuthStrategyError'];
    ['RequestUpdateCustomerEmailAddressResult']:
        | ModelTypes['Success']
        | ModelTypes['InvalidCredentialsError']
        | ModelTypes['EmailAddressConflictError']
        | ModelTypes['NativeAuthStrategyError'];
    ['UpdateCustomerEmailAddressResult']:
        | ModelTypes['Success']
        | ModelTypes['IdentifierChangeTokenInvalidError']
        | ModelTypes['IdentifierChangeTokenExpiredError']
        | ModelTypes['NativeAuthStrategyError'];
    ['RequestPasswordResetResult']: ModelTypes['Success'] | ModelTypes['NativeAuthStrategyError'];
    ['ResetPasswordResult']:
        | ModelTypes['CurrentUser']
        | ModelTypes['PasswordResetTokenInvalidError']
        | ModelTypes['PasswordResetTokenExpiredError']
        | ModelTypes['PasswordValidationError']
        | ModelTypes['NativeAuthStrategyError']
        | ModelTypes['NotVerifiedError'];
    ['NativeAuthenticationResult']:
        | ModelTypes['CurrentUser']
        | ModelTypes['InvalidCredentialsError']
        | ModelTypes['NotVerifiedError']
        | ModelTypes['NativeAuthStrategyError'];
    ['AuthenticationResult']:
        | ModelTypes['CurrentUser']
        | ModelTypes['InvalidCredentialsError']
        | ModelTypes['NotVerifiedError'];
    ['ActiveOrderResult']: ModelTypes['Order'] | ModelTypes['NoActiveOrderError'];
    ['ProductVariantFilterParameter']: {
        id?: ModelTypes['IDOperators'] | undefined;
        productId?: ModelTypes['IDOperators'] | undefined;
        createdAt?: ModelTypes['DateOperators'] | undefined;
        updatedAt?: ModelTypes['DateOperators'] | undefined;
        languageCode?: ModelTypes['StringOperators'] | undefined;
        sku?: ModelTypes['StringOperators'] | undefined;
        name?: ModelTypes['StringOperators'] | undefined;
        price?: ModelTypes['NumberOperators'] | undefined;
        currencyCode?: ModelTypes['StringOperators'] | undefined;
        priceWithTax?: ModelTypes['NumberOperators'] | undefined;
        stockLevel?: ModelTypes['StringOperators'] | undefined;
    };
    ['ProductVariantSortParameter']: {
        id?: ModelTypes['SortOrder'] | undefined;
        productId?: ModelTypes['SortOrder'] | undefined;
        createdAt?: ModelTypes['SortOrder'] | undefined;
        updatedAt?: ModelTypes['SortOrder'] | undefined;
        sku?: ModelTypes['SortOrder'] | undefined;
        name?: ModelTypes['SortOrder'] | undefined;
        price?: ModelTypes['SortOrder'] | undefined;
        priceWithTax?: ModelTypes['SortOrder'] | undefined;
        stockLevel?: ModelTypes['SortOrder'] | undefined;
    };
    ['CustomerFilterParameter']: {
        id?: ModelTypes['IDOperators'] | undefined;
        createdAt?: ModelTypes['DateOperators'] | undefined;
        updatedAt?: ModelTypes['DateOperators'] | undefined;
        title?: ModelTypes['StringOperators'] | undefined;
        firstName?: ModelTypes['StringOperators'] | undefined;
        lastName?: ModelTypes['StringOperators'] | undefined;
        phoneNumber?: ModelTypes['StringOperators'] | undefined;
        emailAddress?: ModelTypes['StringOperators'] | undefined;
    };
    ['CustomerSortParameter']: {
        id?: ModelTypes['SortOrder'] | undefined;
        createdAt?: ModelTypes['SortOrder'] | undefined;
        updatedAt?: ModelTypes['SortOrder'] | undefined;
        title?: ModelTypes['SortOrder'] | undefined;
        firstName?: ModelTypes['SortOrder'] | undefined;
        lastName?: ModelTypes['SortOrder'] | undefined;
        phoneNumber?: ModelTypes['SortOrder'] | undefined;
        emailAddress?: ModelTypes['SortOrder'] | undefined;
    };
    ['OrderFilterParameter']: {
        id?: ModelTypes['IDOperators'] | undefined;
        createdAt?: ModelTypes['DateOperators'] | undefined;
        updatedAt?: ModelTypes['DateOperators'] | undefined;
        type?: ModelTypes['StringOperators'] | undefined;
        orderPlacedAt?: ModelTypes['DateOperators'] | undefined;
        code?: ModelTypes['StringOperators'] | undefined;
        state?: ModelTypes['StringOperators'] | undefined;
        active?: ModelTypes['BooleanOperators'] | undefined;
        totalQuantity?: ModelTypes['NumberOperators'] | undefined;
        subTotal?: ModelTypes['NumberOperators'] | undefined;
        subTotalWithTax?: ModelTypes['NumberOperators'] | undefined;
        currencyCode?: ModelTypes['StringOperators'] | undefined;
        shipping?: ModelTypes['NumberOperators'] | undefined;
        shippingWithTax?: ModelTypes['NumberOperators'] | undefined;
        total?: ModelTypes['NumberOperators'] | undefined;
        totalWithTax?: ModelTypes['NumberOperators'] | undefined;
    };
    ['OrderSortParameter']: {
        id?: ModelTypes['SortOrder'] | undefined;
        createdAt?: ModelTypes['SortOrder'] | undefined;
        updatedAt?: ModelTypes['SortOrder'] | undefined;
        orderPlacedAt?: ModelTypes['SortOrder'] | undefined;
        code?: ModelTypes['SortOrder'] | undefined;
        state?: ModelTypes['SortOrder'] | undefined;
        totalQuantity?: ModelTypes['SortOrder'] | undefined;
        subTotal?: ModelTypes['SortOrder'] | undefined;
        subTotalWithTax?: ModelTypes['SortOrder'] | undefined;
        shipping?: ModelTypes['SortOrder'] | undefined;
        shippingWithTax?: ModelTypes['SortOrder'] | undefined;
        total?: ModelTypes['SortOrder'] | undefined;
        totalWithTax?: ModelTypes['SortOrder'] | undefined;
    };
    ['FacetValueFilterParameter']: {
        id?: ModelTypes['IDOperators'] | undefined;
        createdAt?: ModelTypes['DateOperators'] | undefined;
        updatedAt?: ModelTypes['DateOperators'] | undefined;
        languageCode?: ModelTypes['StringOperators'] | undefined;
        facetId?: ModelTypes['IDOperators'] | undefined;
        name?: ModelTypes['StringOperators'] | undefined;
        code?: ModelTypes['StringOperators'] | undefined;
    };
    ['FacetValueSortParameter']: {
        id?: ModelTypes['SortOrder'] | undefined;
        createdAt?: ModelTypes['SortOrder'] | undefined;
        updatedAt?: ModelTypes['SortOrder'] | undefined;
        facetId?: ModelTypes['SortOrder'] | undefined;
        name?: ModelTypes['SortOrder'] | undefined;
        code?: ModelTypes['SortOrder'] | undefined;
    };
    ['HistoryEntryFilterParameter']: {
        id?: ModelTypes['IDOperators'] | undefined;
        createdAt?: ModelTypes['DateOperators'] | undefined;
        updatedAt?: ModelTypes['DateOperators'] | undefined;
        type?: ModelTypes['StringOperators'] | undefined;
    };
    ['HistoryEntrySortParameter']: {
        id?: ModelTypes['SortOrder'] | undefined;
        createdAt?: ModelTypes['SortOrder'] | undefined;
        updatedAt?: ModelTypes['SortOrder'] | undefined;
    };
    ['CollectionFilterParameter']: {
        id?: ModelTypes['IDOperators'] | undefined;
        createdAt?: ModelTypes['DateOperators'] | undefined;
        updatedAt?: ModelTypes['DateOperators'] | undefined;
        languageCode?: ModelTypes['StringOperators'] | undefined;
        name?: ModelTypes['StringOperators'] | undefined;
        slug?: ModelTypes['StringOperators'] | undefined;
        position?: ModelTypes['NumberOperators'] | undefined;
        description?: ModelTypes['StringOperators'] | undefined;
        parentId?: ModelTypes['IDOperators'] | undefined;
    };
    ['CollectionSortParameter']: {
        id?: ModelTypes['SortOrder'] | undefined;
        createdAt?: ModelTypes['SortOrder'] | undefined;
        updatedAt?: ModelTypes['SortOrder'] | undefined;
        name?: ModelTypes['SortOrder'] | undefined;
        slug?: ModelTypes['SortOrder'] | undefined;
        position?: ModelTypes['SortOrder'] | undefined;
        description?: ModelTypes['SortOrder'] | undefined;
        parentId?: ModelTypes['SortOrder'] | undefined;
    };
    ['FacetFilterParameter']: {
        id?: ModelTypes['IDOperators'] | undefined;
        createdAt?: ModelTypes['DateOperators'] | undefined;
        updatedAt?: ModelTypes['DateOperators'] | undefined;
        languageCode?: ModelTypes['StringOperators'] | undefined;
        name?: ModelTypes['StringOperators'] | undefined;
        code?: ModelTypes['StringOperators'] | undefined;
    };
    ['FacetSortParameter']: {
        id?: ModelTypes['SortOrder'] | undefined;
        createdAt?: ModelTypes['SortOrder'] | undefined;
        updatedAt?: ModelTypes['SortOrder'] | undefined;
        name?: ModelTypes['SortOrder'] | undefined;
        code?: ModelTypes['SortOrder'] | undefined;
    };
    ['ProductFilterParameter']: {
        id?: ModelTypes['IDOperators'] | undefined;
        createdAt?: ModelTypes['DateOperators'] | undefined;
        updatedAt?: ModelTypes['DateOperators'] | undefined;
        languageCode?: ModelTypes['StringOperators'] | undefined;
        name?: ModelTypes['StringOperators'] | undefined;
        slug?: ModelTypes['StringOperators'] | undefined;
        description?: ModelTypes['StringOperators'] | undefined;
    };
    ['ProductSortParameter']: {
        id?: ModelTypes['SortOrder'] | undefined;
        createdAt?: ModelTypes['SortOrder'] | undefined;
        updatedAt?: ModelTypes['SortOrder'] | undefined;
        name?: ModelTypes['SortOrder'] | undefined;
        slug?: ModelTypes['SortOrder'] | undefined;
        description?: ModelTypes['SortOrder'] | undefined;
    };
    ['NativeAuthInput']: {
        username: string;
        password: string;
    };
    ['schema']: {
        query?: ModelTypes['Query'] | undefined;
        mutation?: ModelTypes['Mutation'] | undefined;
    };
};

export type GraphQLTypes = {
    ['Query']: {
        __typename: 'Query';
        /** The active Channel */
        activeChannel: GraphQLTypes['Channel'];
        /** The active Customer */
        activeCustomer?: GraphQLTypes['Customer'] | undefined;
        /** The active Order. Will be `null` until an Order is created via `addItemToOrder`. Once an Order reaches the
state of `PaymentAuthorized` or `PaymentSettled`, then that Order is no longer considered "active" and this
query will once again return `null`. */
        activeOrder?: GraphQLTypes['Order'] | undefined;
        /** An array of supported Countries */
        availableCountries: Array<GraphQLTypes['Country']>;
        /** A list of Collections available to the shop */
        collections: GraphQLTypes['CollectionList'];
        /** Returns a Collection either by its id or slug. If neither 'id' nor 'slug' is specified, an error will result. */
        collection?: GraphQLTypes['Collection'] | undefined;
        /** Returns a list of eligible shipping methods based on the current active Order */
        eligibleShippingMethods: Array<GraphQLTypes['ShippingMethodQuote']>;
        /** Returns a list of payment methods and their eligibility based on the current active Order */
        eligiblePaymentMethods: Array<GraphQLTypes['PaymentMethodQuote']>;
        /** A list of Facets available to the shop */
        facets: GraphQLTypes['FacetList'];
        /** Returns a Facet by its id */
        facet?: GraphQLTypes['Facet'] | undefined;
        /** Returns information about the current authenticated User */
        me?: GraphQLTypes['CurrentUser'] | undefined;
        /** Returns the possible next states that the activeOrder can transition to */
        nextOrderStates: Array<string>;
        /** Returns an Order based on the id. Note that in the Shop API, only orders belonging to the
currently-authenticated User may be queried. */
        order?: GraphQLTypes['Order'] | undefined;
        /** Returns an Order based on the order `code`. For guest Orders (i.e. Orders placed by non-authenticated Customers)
this query will only return the Order within 2 hours of the Order being placed. This allows an Order confirmation
screen to be shown immediately after completion of a guest checkout, yet prevents security risks of allowing
general anonymous access to Order data. */
        orderByCode?: GraphQLTypes['Order'] | undefined;
        /** Get a Product either by id or slug. If neither 'id' nor 'slug' is specified, an error will result. */
        product?: GraphQLTypes['Product'] | undefined;
        /** Get a list of Products */
        products: GraphQLTypes['ProductList'];
        /** Search Products based on the criteria set by the `SearchInput` */
        search: GraphQLTypes['SearchResponse'];
    };
    ['Mutation']: {
        __typename: 'Mutation';
        /** Adds an item to the order. If custom fields are defined on the OrderLine entity, a third argument 'customFields' will be available. */
        addItemToOrder: GraphQLTypes['UpdateOrderItemsResult'];
        /** Remove an OrderLine from the Order */
        removeOrderLine: GraphQLTypes['RemoveOrderItemsResult'];
        /** Remove all OrderLine from the Order */
        removeAllOrderLines: GraphQLTypes['RemoveOrderItemsResult'];
        /** Adjusts an OrderLine. If custom fields are defined on the OrderLine entity, a third argument 'customFields' of type `OrderLineCustomFieldsInput` will be available. */
        adjustOrderLine: GraphQLTypes['UpdateOrderItemsResult'];
        /** Applies the given coupon code to the active Order */
        applyCouponCode: GraphQLTypes['ApplyCouponCodeResult'];
        /** Removes the given coupon code from the active Order */
        removeCouponCode?: GraphQLTypes['Order'] | undefined;
        /** Transitions an Order to a new state. Valid next states can be found by querying `nextOrderStates` */
        transitionOrderToState?: GraphQLTypes['TransitionOrderToStateResult'] | undefined;
        /** Sets the shipping address for this order */
        setOrderShippingAddress: GraphQLTypes['ActiveOrderResult'];
        /** Sets the billing address for this order */
        setOrderBillingAddress: GraphQLTypes['ActiveOrderResult'];
        /** Allows any custom fields to be set for the active order */
        setOrderCustomFields: GraphQLTypes['ActiveOrderResult'];
        /** Sets the shipping method by id, which can be obtained with the `eligibleShippingMethods` query.
An Order can have multiple shipping methods, in which case you can pass an array of ids. In this case,
you should configure a custom ShippingLineAssignmentStrategy in order to know which OrderLines each
shipping method will apply to. */
        setOrderShippingMethod: GraphQLTypes['SetOrderShippingMethodResult'];
        /** Add a Payment to the Order */
        addPaymentToOrder: GraphQLTypes['AddPaymentToOrderResult'];
        /** Set the Customer for the Order. Required only if the Customer is not currently logged in */
        setCustomerForOrder: GraphQLTypes['SetCustomerForOrderResult'];
        /** Authenticates the user using the native authentication strategy. This mutation is an alias for `authenticate({ native: { ... }})` */
        login: GraphQLTypes['NativeAuthenticationResult'];
        /** Authenticates the user using a named authentication strategy */
        authenticate: GraphQLTypes['AuthenticationResult'];
        /** End the current authenticated session */
        logout: GraphQLTypes['Success'];
        /** Register a Customer account with the given credentials. There are three possible registration flows:

_If `authOptions.requireVerification` is set to `true`:_

1. **The Customer is registered _with_ a password**. A verificationToken will be created (and typically emailed to the Customer). That
   verificationToken would then be passed to the `verifyCustomerAccount` mutation _without_ a password. The Customer is then
   verified and authenticated in one step.
2. **The Customer is registered _without_ a password**. A verificationToken will be created (and typically emailed to the Customer). That
   verificationToken would then be passed to the `verifyCustomerAccount` mutation _with_ the chosen password of the Customer. The Customer is then
   verified and authenticated in one step.

_If `authOptions.requireVerification` is set to `false`:_

3. The Customer _must_ be registered _with_ a password. No further action is needed - the Customer is able to authenticate immediately. */
        registerCustomerAccount: GraphQLTypes['RegisterCustomerAccountResult'];
        /** Regenerate and send a verification token for a new Customer registration. Only applicable if `authOptions.requireVerification` is set to true. */
        refreshCustomerVerification: GraphQLTypes['RefreshCustomerVerificationResult'];
        /** Update an existing Customer */
        updateCustomer: GraphQLTypes['Customer'];
        /** Create a new Customer Address */
        createCustomerAddress: GraphQLTypes['Address'];
        /** Update an existing Address */
        updateCustomerAddress: GraphQLTypes['Address'];
        /** Delete an existing Address */
        deleteCustomerAddress: GraphQLTypes['Success'];
        /** Verify a Customer email address with the token sent to that address. Only applicable if `authOptions.requireVerification` is set to true.

If the Customer was not registered with a password in the `registerCustomerAccount` mutation, the password _must_ be
provided here. */
        verifyCustomerAccount: GraphQLTypes['VerifyCustomerAccountResult'];
        /** Update the password of the active Customer */
        updateCustomerPassword: GraphQLTypes['UpdateCustomerPasswordResult'];
        /** Request to update the emailAddress of the active Customer. If `authOptions.requireVerification` is enabled
(as is the default), then the `identifierChangeToken` will be assigned to the current User and
a IdentifierChangeRequestEvent will be raised. This can then be used e.g. by the EmailPlugin to email
that verification token to the Customer, which is then used to verify the change of email address. */
        requestUpdateCustomerEmailAddress: GraphQLTypes['RequestUpdateCustomerEmailAddressResult'];
        /** Confirm the update of the emailAddress with the provided token, which has been generated by the
`requestUpdateCustomerEmailAddress` mutation. */
        updateCustomerEmailAddress: GraphQLTypes['UpdateCustomerEmailAddressResult'];
        /** Requests a password reset email to be sent */
        requestPasswordReset?: GraphQLTypes['RequestPasswordResetResult'] | undefined;
        /** Resets a Customer's password based on the provided token */
        resetPassword: GraphQLTypes['ResetPasswordResult'];
    };
    ['Address']: {
        __typename: 'Address';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        fullName?: string | undefined;
        company?: string | undefined;
        streetLine1: string;
        streetLine2?: string | undefined;
        city?: string | undefined;
        province?: string | undefined;
        postalCode?: string | undefined;
        country: GraphQLTypes['Country'];
        phoneNumber?: string | undefined;
        defaultShippingAddress?: boolean | undefined;
        defaultBillingAddress?: boolean | undefined;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['Asset']: {
        __typename: 'Asset';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        name: string;
        type: GraphQLTypes['AssetType'];
        fileSize: number;
        mimeType: string;
        width: number;
        height: number;
        source: string;
        preview: string;
        focalPoint?: GraphQLTypes['Coordinate'] | undefined;
        tags: Array<GraphQLTypes['Tag']>;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['Coordinate']: {
        __typename: 'Coordinate';
        x: number;
        y: number;
    };
    ['AssetList']: {
        __typename: 'AssetList';
        items: Array<GraphQLTypes['Asset']>;
        totalItems: number;
    };
    ['AssetType']: AssetType;
    ['CurrentUser']: {
        __typename: 'CurrentUser';
        id: string;
        identifier: string;
        channels: Array<GraphQLTypes['CurrentUserChannel']>;
    };
    ['CurrentUserChannel']: {
        __typename: 'CurrentUserChannel';
        id: string;
        token: string;
        code: string;
        permissions: Array<GraphQLTypes['Permission']>;
    };
    ['Channel']: {
        __typename: 'Channel';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        code: string;
        token: string;
        defaultTaxZone?: GraphQLTypes['Zone'] | undefined;
        defaultShippingZone?: GraphQLTypes['Zone'] | undefined;
        defaultLanguageCode: GraphQLTypes['LanguageCode'];
        availableLanguageCodes?: Array<GraphQLTypes['LanguageCode']> | undefined;
        currencyCode: GraphQLTypes['CurrencyCode'];
        defaultCurrencyCode: GraphQLTypes['CurrencyCode'];
        availableCurrencyCodes: Array<GraphQLTypes['CurrencyCode']>;
        /** Not yet used - will be implemented in a future release. */
        trackInventory?: boolean | undefined;
        /** Not yet used - will be implemented in a future release. */
        outOfStockThreshold?: number | undefined;
        pricesIncludeTax: boolean;
        seller?: GraphQLTypes['Seller'] | undefined;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['Collection']: {
        __typename: 'Collection';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        languageCode?: GraphQLTypes['LanguageCode'] | undefined;
        name: string;
        slug: string;
        breadcrumbs: Array<GraphQLTypes['CollectionBreadcrumb']>;
        position: number;
        description: string;
        featuredAsset?: GraphQLTypes['Asset'] | undefined;
        assets: Array<GraphQLTypes['Asset']>;
        parent?: GraphQLTypes['Collection'] | undefined;
        parentId: string;
        children?: Array<GraphQLTypes['Collection']> | undefined;
        filters: Array<GraphQLTypes['ConfigurableOperation']>;
        translations: Array<GraphQLTypes['CollectionTranslation']>;
        productVariants: GraphQLTypes['ProductVariantList'];
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['CollectionBreadcrumb']: {
        __typename: 'CollectionBreadcrumb';
        id: string;
        name: string;
        slug: string;
    };
    ['CollectionTranslation']: {
        __typename: 'CollectionTranslation';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        languageCode: GraphQLTypes['LanguageCode'];
        name: string;
        slug: string;
        description: string;
    };
    ['CollectionList']: {
        __typename: 'CollectionList';
        items: Array<GraphQLTypes['Collection']>;
        totalItems: number;
    };
    ['GlobalFlag']: GlobalFlag;
    ['AdjustmentType']: AdjustmentType;
    ['DeletionResult']: DeletionResult;
    /** @description
Permissions for administrators and customers. Used to control access to
GraphQL resolvers via the {@link Allow} decorator.

## Understanding Permission.Owner

`Permission.Owner` is a special permission which is used in some Vendure resolvers to indicate that that resolver should only
be accessible to the "owner" of that resource.

For example, the Shop API `activeCustomer` query resolver should only return the Customer object for the "owner" of that Customer, i.e.
based on the activeUserId of the current session. As a result, the resolver code looks like this:

@example
```TypeScript
\@Query()
\@Allow(Permission.Owner)
async activeCustomer(\@Ctx() ctx: RequestContext): Promise<Customer | undefined> {
  const userId = ctx.activeUserId;
  if (userId) {
    return this.customerService.findOneByUserId(ctx, userId);
  }
}
```

Here we can see that the "ownership" must be enforced by custom logic inside the resolver. Since "ownership" cannot be defined generally
nor statically encoded at build-time, any resolvers using `Permission.Owner` **must** include logic to enforce that only the owner
of the resource has access. If not, then it is the equivalent of using `Permission.Public`.


@docsCategory common */
    ['Permission']: Permission;
    ['SortOrder']: SortOrder;
    ['ErrorCode']: ErrorCode;
    ['LogicalOperator']: LogicalOperator;
    /** Returned when attempting an operation that relies on the NativeAuthStrategy, if that strategy is not configured. */
    ['NativeAuthStrategyError']: {
        __typename: 'NativeAuthStrategyError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
    };
    /** Returned if the user authentication credentials are not valid */
    ['InvalidCredentialsError']: {
        __typename: 'InvalidCredentialsError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
        authenticationError: string;
    };
    /** Returned if there is an error in transitioning the Order state */
    ['OrderStateTransitionError']: {
        __typename: 'OrderStateTransitionError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
        transitionError: string;
        fromState: string;
        toState: string;
    };
    /** Returned when attempting to create a Customer with an email address already registered to an existing User. */
    ['EmailAddressConflictError']: {
        __typename: 'EmailAddressConflictError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
    };
    /** Returned when attempting to set the Customer on a guest checkout when the configured GuestCheckoutStrategy does not allow it. */
    ['GuestCheckoutError']: {
        __typename: 'GuestCheckoutError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
        errorDetail: string;
    };
    /** Returned when the maximum order size limit has been reached. */
    ['OrderLimitError']: {
        __typename: 'OrderLimitError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
        maxItems: number;
    };
    /** Returned when attempting to set a negative OrderLine quantity. */
    ['NegativeQuantityError']: {
        __typename: 'NegativeQuantityError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
    };
    /** Returned when attempting to add more items to the Order than are available */
    ['InsufficientStockError']: {
        __typename: 'InsufficientStockError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
        quantityAvailable: number;
        order: GraphQLTypes['Order'];
    };
    /** Returned if the provided coupon code is invalid */
    ['CouponCodeInvalidError']: {
        __typename: 'CouponCodeInvalidError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
        couponCode: string;
    };
    /** Returned if the provided coupon code is invalid */
    ['CouponCodeExpiredError']: {
        __typename: 'CouponCodeExpiredError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
        couponCode: string;
    };
    /** Returned if the provided coupon code is invalid */
    ['CouponCodeLimitError']: {
        __typename: 'CouponCodeLimitError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
        couponCode: string;
        limit: number;
    };
    /** Returned when attempting to modify the contents of an Order that is not in the `AddingItems` state. */
    ['OrderModificationError']: {
        __typename: 'OrderModificationError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
    };
    /** Returned when attempting to set a ShippingMethod for which the Order is not eligible */
    ['IneligibleShippingMethodError']: {
        __typename: 'IneligibleShippingMethodError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
    };
    /** Returned when invoking a mutation which depends on there being an active Order on the
current session. */
    ['NoActiveOrderError']: {
        __typename: 'NoActiveOrderError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
    };
    /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
    ['JSON']: 'scalar' & { name: 'JSON' };
    /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
    ['DateTime']: 'scalar' & { name: 'DateTime' };
    /** The `Upload` scalar type represents a file upload. */
    ['Upload']: 'scalar' & { name: 'Upload' };
    /** The `Money` scalar type represents monetary values and supports signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point). */
    ['Money']: 'scalar' & { name: 'Money' };
    ['PaginatedList']: {
        __typename:
            | 'AssetList'
            | 'CollectionList'
            | 'CustomerList'
            | 'FacetList'
            | 'FacetValueList'
            | 'HistoryEntryList'
            | 'OrderList'
            | 'ProductList'
            | 'ProductVariantList'
            | 'PromotionList'
            | 'CountryList'
            | 'ProvinceList'
            | 'RoleList'
            | 'ShippingMethodList'
            | 'TagList'
            | 'TaxRateList';
        items: Array<GraphQLTypes['Node']>;
        totalItems: number;
        ['...on AssetList']: '__union' & GraphQLTypes['AssetList'];
        ['...on CollectionList']: '__union' & GraphQLTypes['CollectionList'];
        ['...on CustomerList']: '__union' & GraphQLTypes['CustomerList'];
        ['...on FacetList']: '__union' & GraphQLTypes['FacetList'];
        ['...on FacetValueList']: '__union' & GraphQLTypes['FacetValueList'];
        ['...on HistoryEntryList']: '__union' & GraphQLTypes['HistoryEntryList'];
        ['...on OrderList']: '__union' & GraphQLTypes['OrderList'];
        ['...on ProductList']: '__union' & GraphQLTypes['ProductList'];
        ['...on ProductVariantList']: '__union' & GraphQLTypes['ProductVariantList'];
        ['...on PromotionList']: '__union' & GraphQLTypes['PromotionList'];
        ['...on CountryList']: '__union' & GraphQLTypes['CountryList'];
        ['...on ProvinceList']: '__union' & GraphQLTypes['ProvinceList'];
        ['...on RoleList']: '__union' & GraphQLTypes['RoleList'];
        ['...on ShippingMethodList']: '__union' & GraphQLTypes['ShippingMethodList'];
        ['...on TagList']: '__union' & GraphQLTypes['TagList'];
        ['...on TaxRateList']: '__union' & GraphQLTypes['TaxRateList'];
    };
    ['Node']: {
        __typename:
            | 'Address'
            | 'Asset'
            | 'Channel'
            | 'Collection'
            | 'CustomerGroup'
            | 'Customer'
            | 'FacetValue'
            | 'Facet'
            | 'HistoryEntry'
            | 'Order'
            | 'OrderLine'
            | 'Payment'
            | 'Refund'
            | 'Fulfillment'
            | 'Surcharge'
            | 'PaymentMethod'
            | 'ProductOptionGroup'
            | 'ProductOption'
            | 'Product'
            | 'ProductVariant'
            | 'Promotion'
            | 'Region'
            | 'Country'
            | 'Province'
            | 'Role'
            | 'Seller'
            | 'ShippingMethod'
            | 'Tag'
            | 'TaxCategory'
            | 'TaxRate'
            | 'User'
            | 'AuthenticationMethod'
            | 'Zone';
        id: string;
        ['...on Address']: '__union' & GraphQLTypes['Address'];
        ['...on Asset']: '__union' & GraphQLTypes['Asset'];
        ['...on Channel']: '__union' & GraphQLTypes['Channel'];
        ['...on Collection']: '__union' & GraphQLTypes['Collection'];
        ['...on CustomerGroup']: '__union' & GraphQLTypes['CustomerGroup'];
        ['...on Customer']: '__union' & GraphQLTypes['Customer'];
        ['...on FacetValue']: '__union' & GraphQLTypes['FacetValue'];
        ['...on Facet']: '__union' & GraphQLTypes['Facet'];
        ['...on HistoryEntry']: '__union' & GraphQLTypes['HistoryEntry'];
        ['...on Order']: '__union' & GraphQLTypes['Order'];
        ['...on OrderLine']: '__union' & GraphQLTypes['OrderLine'];
        ['...on Payment']: '__union' & GraphQLTypes['Payment'];
        ['...on Refund']: '__union' & GraphQLTypes['Refund'];
        ['...on Fulfillment']: '__union' & GraphQLTypes['Fulfillment'];
        ['...on Surcharge']: '__union' & GraphQLTypes['Surcharge'];
        ['...on PaymentMethod']: '__union' & GraphQLTypes['PaymentMethod'];
        ['...on ProductOptionGroup']: '__union' & GraphQLTypes['ProductOptionGroup'];
        ['...on ProductOption']: '__union' & GraphQLTypes['ProductOption'];
        ['...on Product']: '__union' & GraphQLTypes['Product'];
        ['...on ProductVariant']: '__union' & GraphQLTypes['ProductVariant'];
        ['...on Promotion']: '__union' & GraphQLTypes['Promotion'];
        ['...on Region']: '__union' & GraphQLTypes['Region'];
        ['...on Country']: '__union' & GraphQLTypes['Country'];
        ['...on Province']: '__union' & GraphQLTypes['Province'];
        ['...on Role']: '__union' & GraphQLTypes['Role'];
        ['...on Seller']: '__union' & GraphQLTypes['Seller'];
        ['...on ShippingMethod']: '__union' & GraphQLTypes['ShippingMethod'];
        ['...on Tag']: '__union' & GraphQLTypes['Tag'];
        ['...on TaxCategory']: '__union' & GraphQLTypes['TaxCategory'];
        ['...on TaxRate']: '__union' & GraphQLTypes['TaxRate'];
        ['...on User']: '__union' & GraphQLTypes['User'];
        ['...on AuthenticationMethod']: '__union' & GraphQLTypes['AuthenticationMethod'];
        ['...on Zone']: '__union' & GraphQLTypes['Zone'];
    };
    ['ErrorResult']: {
        __typename:
            | 'NativeAuthStrategyError'
            | 'InvalidCredentialsError'
            | 'OrderStateTransitionError'
            | 'EmailAddressConflictError'
            | 'GuestCheckoutError'
            | 'OrderLimitError'
            | 'NegativeQuantityError'
            | 'InsufficientStockError'
            | 'CouponCodeInvalidError'
            | 'CouponCodeExpiredError'
            | 'CouponCodeLimitError'
            | 'OrderModificationError'
            | 'IneligibleShippingMethodError'
            | 'NoActiveOrderError'
            | 'OrderPaymentStateError'
            | 'IneligiblePaymentMethodError'
            | 'PaymentFailedError'
            | 'PaymentDeclinedError'
            | 'AlreadyLoggedInError'
            | 'MissingPasswordError'
            | 'PasswordValidationError'
            | 'PasswordAlreadySetError'
            | 'VerificationTokenInvalidError'
            | 'VerificationTokenExpiredError'
            | 'IdentifierChangeTokenInvalidError'
            | 'IdentifierChangeTokenExpiredError'
            | 'PasswordResetTokenInvalidError'
            | 'PasswordResetTokenExpiredError'
            | 'NotVerifiedError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
        ['...on NativeAuthStrategyError']: '__union' & GraphQLTypes['NativeAuthStrategyError'];
        ['...on InvalidCredentialsError']: '__union' & GraphQLTypes['InvalidCredentialsError'];
        ['...on OrderStateTransitionError']: '__union' & GraphQLTypes['OrderStateTransitionError'];
        ['...on EmailAddressConflictError']: '__union' & GraphQLTypes['EmailAddressConflictError'];
        ['...on GuestCheckoutError']: '__union' & GraphQLTypes['GuestCheckoutError'];
        ['...on OrderLimitError']: '__union' & GraphQLTypes['OrderLimitError'];
        ['...on NegativeQuantityError']: '__union' & GraphQLTypes['NegativeQuantityError'];
        ['...on InsufficientStockError']: '__union' & GraphQLTypes['InsufficientStockError'];
        ['...on CouponCodeInvalidError']: '__union' & GraphQLTypes['CouponCodeInvalidError'];
        ['...on CouponCodeExpiredError']: '__union' & GraphQLTypes['CouponCodeExpiredError'];
        ['...on CouponCodeLimitError']: '__union' & GraphQLTypes['CouponCodeLimitError'];
        ['...on OrderModificationError']: '__union' & GraphQLTypes['OrderModificationError'];
        ['...on IneligibleShippingMethodError']: '__union' & GraphQLTypes['IneligibleShippingMethodError'];
        ['...on NoActiveOrderError']: '__union' & GraphQLTypes['NoActiveOrderError'];
        ['...on OrderPaymentStateError']: '__union' & GraphQLTypes['OrderPaymentStateError'];
        ['...on IneligiblePaymentMethodError']: '__union' & GraphQLTypes['IneligiblePaymentMethodError'];
        ['...on PaymentFailedError']: '__union' & GraphQLTypes['PaymentFailedError'];
        ['...on PaymentDeclinedError']: '__union' & GraphQLTypes['PaymentDeclinedError'];
        ['...on AlreadyLoggedInError']: '__union' & GraphQLTypes['AlreadyLoggedInError'];
        ['...on MissingPasswordError']: '__union' & GraphQLTypes['MissingPasswordError'];
        ['...on PasswordValidationError']: '__union' & GraphQLTypes['PasswordValidationError'];
        ['...on PasswordAlreadySetError']: '__union' & GraphQLTypes['PasswordAlreadySetError'];
        ['...on VerificationTokenInvalidError']: '__union' & GraphQLTypes['VerificationTokenInvalidError'];
        ['...on VerificationTokenExpiredError']: '__union' & GraphQLTypes['VerificationTokenExpiredError'];
        ['...on IdentifierChangeTokenInvalidError']: '__union' & GraphQLTypes['IdentifierChangeTokenInvalidError'];
        ['...on IdentifierChangeTokenExpiredError']: '__union' & GraphQLTypes['IdentifierChangeTokenExpiredError'];
        ['...on PasswordResetTokenInvalidError']: '__union' & GraphQLTypes['PasswordResetTokenInvalidError'];
        ['...on PasswordResetTokenExpiredError']: '__union' & GraphQLTypes['PasswordResetTokenExpiredError'];
        ['...on NotVerifiedError']: '__union' & GraphQLTypes['NotVerifiedError'];
    };
    ['Adjustment']: {
        __typename: 'Adjustment';
        adjustmentSource: string;
        type: GraphQLTypes['AdjustmentType'];
        description: string;
        amount: GraphQLTypes['Money'];
        data?: GraphQLTypes['JSON'] | undefined;
    };
    ['TaxLine']: {
        __typename: 'TaxLine';
        description: string;
        taxRate: number;
    };
    ['ConfigArg']: {
        __typename: 'ConfigArg';
        name: string;
        value: string;
    };
    ['ConfigArgDefinition']: {
        __typename: 'ConfigArgDefinition';
        name: string;
        type: string;
        list: boolean;
        required: boolean;
        defaultValue?: GraphQLTypes['JSON'] | undefined;
        label?: string | undefined;
        description?: string | undefined;
        ui?: GraphQLTypes['JSON'] | undefined;
    };
    ['ConfigurableOperation']: {
        __typename: 'ConfigurableOperation';
        code: string;
        args: Array<GraphQLTypes['ConfigArg']>;
    };
    ['ConfigurableOperationDefinition']: {
        __typename: 'ConfigurableOperationDefinition';
        code: string;
        args: Array<GraphQLTypes['ConfigArgDefinition']>;
        description: string;
    };
    ['DeletionResponse']: {
        __typename: 'DeletionResponse';
        result: GraphQLTypes['DeletionResult'];
        message?: string | undefined;
    };
    ['ConfigArgInput']: {
        name: string;
        /** A JSON stringified representation of the actual value */
        value: string;
    };
    ['ConfigurableOperationInput']: {
        code: string;
        arguments: Array<GraphQLTypes['ConfigArgInput']>;
    };
    /** Operators for filtering on a String field */
    ['StringOperators']: {
        eq?: string | undefined;
        notEq?: string | undefined;
        contains?: string | undefined;
        notContains?: string | undefined;
        in?: Array<string> | undefined;
        notIn?: Array<string> | undefined;
        regex?: string | undefined;
        isNull?: boolean | undefined;
    };
    /** Operators for filtering on an ID field */
    ['IDOperators']: {
        eq?: string | undefined;
        notEq?: string | undefined;
        in?: Array<string> | undefined;
        notIn?: Array<string> | undefined;
        isNull?: boolean | undefined;
    };
    /** Operators for filtering on a Boolean field */
    ['BooleanOperators']: {
        eq?: boolean | undefined;
        isNull?: boolean | undefined;
    };
    ['NumberRange']: {
        start: number;
        end: number;
    };
    /** Operators for filtering on a Int or Float field */
    ['NumberOperators']: {
        eq?: number | undefined;
        lt?: number | undefined;
        lte?: number | undefined;
        gt?: number | undefined;
        gte?: number | undefined;
        between?: GraphQLTypes['NumberRange'] | undefined;
        isNull?: boolean | undefined;
    };
    ['DateRange']: {
        start: GraphQLTypes['DateTime'];
        end: GraphQLTypes['DateTime'];
    };
    /** Operators for filtering on a DateTime field */
    ['DateOperators']: {
        eq?: GraphQLTypes['DateTime'] | undefined;
        before?: GraphQLTypes['DateTime'] | undefined;
        after?: GraphQLTypes['DateTime'] | undefined;
        between?: GraphQLTypes['DateRange'] | undefined;
        isNull?: boolean | undefined;
    };
    /** Operators for filtering on a list of String fields */
    ['StringListOperators']: {
        inList: string;
    };
    /** Operators for filtering on a list of Number fields */
    ['NumberListOperators']: {
        inList: number;
    };
    /** Operators for filtering on a list of Boolean fields */
    ['BooleanListOperators']: {
        inList: boolean;
    };
    /** Operators for filtering on a list of ID fields */
    ['IDListOperators']: {
        inList: string;
    };
    /** Operators for filtering on a list of Date fields */
    ['DateListOperators']: {
        inList: GraphQLTypes['DateTime'];
    };
    /** Used to construct boolean expressions for filtering search results
by FacetValue ID. Examples:

* ID=1 OR ID=2: `{ facetValueFilters: [{ or: [1,2] }] }`
* ID=1 AND ID=2: `{ facetValueFilters: [{ and: 1 }, { and: 2 }] }`
* ID=1 AND (ID=2 OR ID=3): `{ facetValueFilters: [{ and: 1 }, { or: [2,3] }] }` */
    ['FacetValueFilterInput']: {
        and?: string | undefined;
        or?: Array<string> | undefined;
    };
    ['SearchInput']: {
        term?: string | undefined;
        facetValueFilters?: Array<GraphQLTypes['FacetValueFilterInput']> | undefined;
        collectionId?: string | undefined;
        collectionSlug?: string | undefined;
        groupByProduct?: boolean | undefined;
        take?: number | undefined;
        skip?: number | undefined;
        sort?: GraphQLTypes['SearchResultSortParameter'] | undefined;
        inStock?: boolean | undefined;
    };
    ['SearchResultSortParameter']: {
        name?: GraphQLTypes['SortOrder'] | undefined;
        price?: GraphQLTypes['SortOrder'] | undefined;
    };
    ['CreateCustomerInput']: {
        title?: string | undefined;
        firstName: string;
        lastName: string;
        phoneNumber?: string | undefined;
        emailAddress: string;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['CreateAddressInput']: {
        fullName?: string | undefined;
        company?: string | undefined;
        streetLine1: string;
        streetLine2?: string | undefined;
        city?: string | undefined;
        province?: string | undefined;
        postalCode?: string | undefined;
        countryCode: string;
        phoneNumber?: string | undefined;
        defaultShippingAddress?: boolean | undefined;
        defaultBillingAddress?: boolean | undefined;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['UpdateAddressInput']: {
        id: string;
        fullName?: string | undefined;
        company?: string | undefined;
        streetLine1?: string | undefined;
        streetLine2?: string | undefined;
        city?: string | undefined;
        province?: string | undefined;
        postalCode?: string | undefined;
        countryCode?: string | undefined;
        phoneNumber?: string | undefined;
        defaultShippingAddress?: boolean | undefined;
        defaultBillingAddress?: boolean | undefined;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    /** Indicates that an operation succeeded, where we do not want to return any more specific information. */
    ['Success']: {
        __typename: 'Success';
        success: boolean;
    };
    ['ShippingMethodQuote']: {
        __typename: 'ShippingMethodQuote';
        id: string;
        price: GraphQLTypes['Money'];
        priceWithTax: GraphQLTypes['Money'];
        code: string;
        name: string;
        description: string;
        /** Any optional metadata returned by the ShippingCalculator in the ShippingCalculationResult */
        metadata?: GraphQLTypes['JSON'] | undefined;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['PaymentMethodQuote']: {
        __typename: 'PaymentMethodQuote';
        id: string;
        code: string;
        name: string;
        description: string;
        isEligible: boolean;
        eligibilityMessage?: string | undefined;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['UpdateOrderItemsResult']: {
        __typename:
            | 'Order'
            | 'OrderModificationError'
            | 'OrderLimitError'
            | 'NegativeQuantityError'
            | 'InsufficientStockError';
        ['...on Order']: '__union' & GraphQLTypes['Order'];
        ['...on OrderModificationError']: '__union' & GraphQLTypes['OrderModificationError'];
        ['...on OrderLimitError']: '__union' & GraphQLTypes['OrderLimitError'];
        ['...on NegativeQuantityError']: '__union' & GraphQLTypes['NegativeQuantityError'];
        ['...on InsufficientStockError']: '__union' & GraphQLTypes['InsufficientStockError'];
    };
    ['RemoveOrderItemsResult']: {
        __typename: 'Order' | 'OrderModificationError';
        ['...on Order']: '__union' & GraphQLTypes['Order'];
        ['...on OrderModificationError']: '__union' & GraphQLTypes['OrderModificationError'];
    };
    ['SetOrderShippingMethodResult']: {
        __typename: 'Order' | 'OrderModificationError' | 'IneligibleShippingMethodError' | 'NoActiveOrderError';
        ['...on Order']: '__union' & GraphQLTypes['Order'];
        ['...on OrderModificationError']: '__union' & GraphQLTypes['OrderModificationError'];
        ['...on IneligibleShippingMethodError']: '__union' & GraphQLTypes['IneligibleShippingMethodError'];
        ['...on NoActiveOrderError']: '__union' & GraphQLTypes['NoActiveOrderError'];
    };
    ['ApplyCouponCodeResult']: {
        __typename: 'Order' | 'CouponCodeExpiredError' | 'CouponCodeInvalidError' | 'CouponCodeLimitError';
        ['...on Order']: '__union' & GraphQLTypes['Order'];
        ['...on CouponCodeExpiredError']: '__union' & GraphQLTypes['CouponCodeExpiredError'];
        ['...on CouponCodeInvalidError']: '__union' & GraphQLTypes['CouponCodeInvalidError'];
        ['...on CouponCodeLimitError']: '__union' & GraphQLTypes['CouponCodeLimitError'];
    };
    /** @description
ISO 4217 currency code

@docsCategory common */
    ['CurrencyCode']: CurrencyCode;
    ['CustomField']: {
        __typename:
            | 'StringCustomFieldConfig'
            | 'LocaleStringCustomFieldConfig'
            | 'IntCustomFieldConfig'
            | 'FloatCustomFieldConfig'
            | 'BooleanCustomFieldConfig'
            | 'DateTimeCustomFieldConfig'
            | 'RelationCustomFieldConfig'
            | 'TextCustomFieldConfig'
            | 'LocaleTextCustomFieldConfig';
        name: string;
        type: string;
        list: boolean;
        label?: Array<GraphQLTypes['LocalizedString']> | undefined;
        description?: Array<GraphQLTypes['LocalizedString']> | undefined;
        readonly?: boolean | undefined;
        internal?: boolean | undefined;
        nullable?: boolean | undefined;
        ui?: GraphQLTypes['JSON'] | undefined;
        ['...on StringCustomFieldConfig']: '__union' & GraphQLTypes['StringCustomFieldConfig'];
        ['...on LocaleStringCustomFieldConfig']: '__union' & GraphQLTypes['LocaleStringCustomFieldConfig'];
        ['...on IntCustomFieldConfig']: '__union' & GraphQLTypes['IntCustomFieldConfig'];
        ['...on FloatCustomFieldConfig']: '__union' & GraphQLTypes['FloatCustomFieldConfig'];
        ['...on BooleanCustomFieldConfig']: '__union' & GraphQLTypes['BooleanCustomFieldConfig'];
        ['...on DateTimeCustomFieldConfig']: '__union' & GraphQLTypes['DateTimeCustomFieldConfig'];
        ['...on RelationCustomFieldConfig']: '__union' & GraphQLTypes['RelationCustomFieldConfig'];
        ['...on TextCustomFieldConfig']: '__union' & GraphQLTypes['TextCustomFieldConfig'];
        ['...on LocaleTextCustomFieldConfig']: '__union' & GraphQLTypes['LocaleTextCustomFieldConfig'];
    };
    ['StringCustomFieldConfig']: {
        __typename: 'StringCustomFieldConfig';
        name: string;
        type: string;
        list: boolean;
        length?: number | undefined;
        label?: Array<GraphQLTypes['LocalizedString']> | undefined;
        description?: Array<GraphQLTypes['LocalizedString']> | undefined;
        readonly?: boolean | undefined;
        internal?: boolean | undefined;
        nullable?: boolean | undefined;
        pattern?: string | undefined;
        options?: Array<GraphQLTypes['StringFieldOption']> | undefined;
        ui?: GraphQLTypes['JSON'] | undefined;
    };
    ['StringFieldOption']: {
        __typename: 'StringFieldOption';
        value: string;
        label?: Array<GraphQLTypes['LocalizedString']> | undefined;
    };
    ['LocaleStringCustomFieldConfig']: {
        __typename: 'LocaleStringCustomFieldConfig';
        name: string;
        type: string;
        list: boolean;
        length?: number | undefined;
        label?: Array<GraphQLTypes['LocalizedString']> | undefined;
        description?: Array<GraphQLTypes['LocalizedString']> | undefined;
        readonly?: boolean | undefined;
        internal?: boolean | undefined;
        nullable?: boolean | undefined;
        pattern?: string | undefined;
        ui?: GraphQLTypes['JSON'] | undefined;
    };
    ['IntCustomFieldConfig']: {
        __typename: 'IntCustomFieldConfig';
        name: string;
        type: string;
        list: boolean;
        label?: Array<GraphQLTypes['LocalizedString']> | undefined;
        description?: Array<GraphQLTypes['LocalizedString']> | undefined;
        readonly?: boolean | undefined;
        internal?: boolean | undefined;
        nullable?: boolean | undefined;
        min?: number | undefined;
        max?: number | undefined;
        step?: number | undefined;
        ui?: GraphQLTypes['JSON'] | undefined;
    };
    ['FloatCustomFieldConfig']: {
        __typename: 'FloatCustomFieldConfig';
        name: string;
        type: string;
        list: boolean;
        label?: Array<GraphQLTypes['LocalizedString']> | undefined;
        description?: Array<GraphQLTypes['LocalizedString']> | undefined;
        readonly?: boolean | undefined;
        internal?: boolean | undefined;
        nullable?: boolean | undefined;
        min?: number | undefined;
        max?: number | undefined;
        step?: number | undefined;
        ui?: GraphQLTypes['JSON'] | undefined;
    };
    ['BooleanCustomFieldConfig']: {
        __typename: 'BooleanCustomFieldConfig';
        name: string;
        type: string;
        list: boolean;
        label?: Array<GraphQLTypes['LocalizedString']> | undefined;
        description?: Array<GraphQLTypes['LocalizedString']> | undefined;
        readonly?: boolean | undefined;
        internal?: boolean | undefined;
        nullable?: boolean | undefined;
        ui?: GraphQLTypes['JSON'] | undefined;
    };
    /** Expects the same validation formats as the `<input type="datetime-local">` HTML element.
See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local#Additional_attributes */
    ['DateTimeCustomFieldConfig']: {
        __typename: 'DateTimeCustomFieldConfig';
        name: string;
        type: string;
        list: boolean;
        label?: Array<GraphQLTypes['LocalizedString']> | undefined;
        description?: Array<GraphQLTypes['LocalizedString']> | undefined;
        readonly?: boolean | undefined;
        internal?: boolean | undefined;
        nullable?: boolean | undefined;
        min?: string | undefined;
        max?: string | undefined;
        step?: number | undefined;
        ui?: GraphQLTypes['JSON'] | undefined;
    };
    ['RelationCustomFieldConfig']: {
        __typename: 'RelationCustomFieldConfig';
        name: string;
        type: string;
        list: boolean;
        label?: Array<GraphQLTypes['LocalizedString']> | undefined;
        description?: Array<GraphQLTypes['LocalizedString']> | undefined;
        readonly?: boolean | undefined;
        internal?: boolean | undefined;
        nullable?: boolean | undefined;
        entity: string;
        scalarFields: Array<string>;
        ui?: GraphQLTypes['JSON'] | undefined;
    };
    ['TextCustomFieldConfig']: {
        __typename: 'TextCustomFieldConfig';
        name: string;
        type: string;
        list: boolean;
        label?: Array<GraphQLTypes['LocalizedString']> | undefined;
        description?: Array<GraphQLTypes['LocalizedString']> | undefined;
        readonly?: boolean | undefined;
        internal?: boolean | undefined;
        nullable?: boolean | undefined;
        ui?: GraphQLTypes['JSON'] | undefined;
    };
    ['LocaleTextCustomFieldConfig']: {
        __typename: 'LocaleTextCustomFieldConfig';
        name: string;
        type: string;
        list: boolean;
        label?: Array<GraphQLTypes['LocalizedString']> | undefined;
        description?: Array<GraphQLTypes['LocalizedString']> | undefined;
        readonly?: boolean | undefined;
        internal?: boolean | undefined;
        nullable?: boolean | undefined;
        ui?: GraphQLTypes['JSON'] | undefined;
    };
    ['LocalizedString']: {
        __typename: 'LocalizedString';
        languageCode: GraphQLTypes['LanguageCode'];
        value: string;
    };
    ['CustomFieldConfig']: {
        __typename:
            | 'StringCustomFieldConfig'
            | 'LocaleStringCustomFieldConfig'
            | 'IntCustomFieldConfig'
            | 'FloatCustomFieldConfig'
            | 'BooleanCustomFieldConfig'
            | 'DateTimeCustomFieldConfig'
            | 'RelationCustomFieldConfig'
            | 'TextCustomFieldConfig'
            | 'LocaleTextCustomFieldConfig';
        ['...on StringCustomFieldConfig']: '__union' & GraphQLTypes['StringCustomFieldConfig'];
        ['...on LocaleStringCustomFieldConfig']: '__union' & GraphQLTypes['LocaleStringCustomFieldConfig'];
        ['...on IntCustomFieldConfig']: '__union' & GraphQLTypes['IntCustomFieldConfig'];
        ['...on FloatCustomFieldConfig']: '__union' & GraphQLTypes['FloatCustomFieldConfig'];
        ['...on BooleanCustomFieldConfig']: '__union' & GraphQLTypes['BooleanCustomFieldConfig'];
        ['...on DateTimeCustomFieldConfig']: '__union' & GraphQLTypes['DateTimeCustomFieldConfig'];
        ['...on RelationCustomFieldConfig']: '__union' & GraphQLTypes['RelationCustomFieldConfig'];
        ['...on TextCustomFieldConfig']: '__union' & GraphQLTypes['TextCustomFieldConfig'];
        ['...on LocaleTextCustomFieldConfig']: '__union' & GraphQLTypes['LocaleTextCustomFieldConfig'];
    };
    ['CustomerGroup']: {
        __typename: 'CustomerGroup';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        name: string;
        customers: GraphQLTypes['CustomerList'];
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['CustomerListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined;
        /** Takes n results, for use in pagination */
        take?: number | undefined;
        /** Specifies which properties to sort the results by */
        sort?: GraphQLTypes['CustomerSortParameter'] | undefined;
        /** Allows the results to be filtered */
        filter?: GraphQLTypes['CustomerFilterParameter'] | undefined;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: GraphQLTypes['LogicalOperator'] | undefined;
    };
    ['Customer']: {
        __typename: 'Customer';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        title?: string | undefined;
        firstName: string;
        lastName: string;
        phoneNumber?: string | undefined;
        emailAddress: string;
        addresses?: Array<GraphQLTypes['Address']> | undefined;
        orders: GraphQLTypes['OrderList'];
        user?: GraphQLTypes['User'] | undefined;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['CustomerList']: {
        __typename: 'CustomerList';
        items: Array<GraphQLTypes['Customer']>;
        totalItems: number;
    };
    ['FacetValue']: {
        __typename: 'FacetValue';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        languageCode: GraphQLTypes['LanguageCode'];
        facet: GraphQLTypes['Facet'];
        facetId: string;
        name: string;
        code: string;
        translations: Array<GraphQLTypes['FacetValueTranslation']>;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['FacetValueTranslation']: {
        __typename: 'FacetValueTranslation';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        languageCode: GraphQLTypes['LanguageCode'];
        name: string;
    };
    ['Facet']: {
        __typename: 'Facet';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        languageCode: GraphQLTypes['LanguageCode'];
        name: string;
        code: string;
        values: Array<GraphQLTypes['FacetValue']>;
        /** Returns a paginated, sortable, filterable list of the Facet's values. Added in v2.1.0. */
        valueList: GraphQLTypes['FacetValueList'];
        translations: Array<GraphQLTypes['FacetTranslation']>;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['FacetTranslation']: {
        __typename: 'FacetTranslation';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        languageCode: GraphQLTypes['LanguageCode'];
        name: string;
    };
    ['FacetList']: {
        __typename: 'FacetList';
        items: Array<GraphQLTypes['Facet']>;
        totalItems: number;
    };
    ['FacetValueListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined;
        /** Takes n results, for use in pagination */
        take?: number | undefined;
        /** Specifies which properties to sort the results by */
        sort?: GraphQLTypes['FacetValueSortParameter'] | undefined;
        /** Allows the results to be filtered */
        filter?: GraphQLTypes['FacetValueFilterParameter'] | undefined;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: GraphQLTypes['LogicalOperator'] | undefined;
    };
    ['FacetValueList']: {
        __typename: 'FacetValueList';
        items: Array<GraphQLTypes['FacetValue']>;
        totalItems: number;
    };
    ['HistoryEntry']: {
        __typename: 'HistoryEntry';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        type: GraphQLTypes['HistoryEntryType'];
        data: GraphQLTypes['JSON'];
    };
    ['HistoryEntryType']: HistoryEntryType;
    ['HistoryEntryList']: {
        __typename: 'HistoryEntryList';
        items: Array<GraphQLTypes['HistoryEntry']>;
        totalItems: number;
    };
    ['HistoryEntryListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined;
        /** Takes n results, for use in pagination */
        take?: number | undefined;
        /** Specifies which properties to sort the results by */
        sort?: GraphQLTypes['HistoryEntrySortParameter'] | undefined;
        /** Allows the results to be filtered */
        filter?: GraphQLTypes['HistoryEntryFilterParameter'] | undefined;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: GraphQLTypes['LogicalOperator'] | undefined;
    };
    /** @description
Languages in the form of a ISO 639-1 language code with optional
region or script modifier (e.g. de_AT). The selection available is based
on the [Unicode CLDR summary list](https://unicode-org.github.io/cldr-staging/charts/37/summary/root.html)
and includes the major spoken languages of the world and any widely-used variants.

@docsCategory common */
    ['LanguageCode']: LanguageCode;
    ['OrderType']: OrderType;
    ['Order']: {
        __typename: 'Order';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        type: GraphQLTypes['OrderType'];
        /** The date & time that the Order was placed, i.e. the Customer
completed the checkout and the Order is no longer "active" */
        orderPlacedAt?: GraphQLTypes['DateTime'] | undefined;
        /** A unique code for the Order */
        code: string;
        state: string;
        /** An order is active as long as the payment process has not been completed */
        active: boolean;
        customer?: GraphQLTypes['Customer'] | undefined;
        shippingAddress?: GraphQLTypes['OrderAddress'] | undefined;
        billingAddress?: GraphQLTypes['OrderAddress'] | undefined;
        lines: Array<GraphQLTypes['OrderLine']>;
        /** Surcharges are arbitrary modifications to the Order total which are neither
ProductVariants nor discounts resulting from applied Promotions. For example,
one-off discounts based on customer interaction, or surcharges based on payment
methods. */
        surcharges: Array<GraphQLTypes['Surcharge']>;
        discounts: Array<GraphQLTypes['Discount']>;
        /** An array of all coupon codes applied to the Order */
        couponCodes: Array<string>;
        /** Promotions applied to the order. Only gets populated after the payment process has completed. */
        promotions: Array<GraphQLTypes['Promotion']>;
        payments?: Array<GraphQLTypes['Payment']> | undefined;
        fulfillments?: Array<GraphQLTypes['Fulfillment']> | undefined;
        totalQuantity: number;
        /** The subTotal is the total of all OrderLines in the Order. This figure also includes any Order-level
discounts which have been prorated (proportionally distributed) amongst the items of each OrderLine.
To get a total of all OrderLines which does not account for prorated discounts, use the
sum of `OrderLine.discountedLinePrice` values. */
        subTotal: GraphQLTypes['Money'];
        /** Same as subTotal, but inclusive of tax */
        subTotalWithTax: GraphQLTypes['Money'];
        currencyCode: GraphQLTypes['CurrencyCode'];
        shippingLines: Array<GraphQLTypes['ShippingLine']>;
        shipping: GraphQLTypes['Money'];
        shippingWithTax: GraphQLTypes['Money'];
        /** Equal to subTotal plus shipping */
        total: GraphQLTypes['Money'];
        /** The final payable amount. Equal to subTotalWithTax plus shippingWithTax */
        totalWithTax: GraphQLTypes['Money'];
        /** A summary of the taxes being applied to this Order */
        taxSummary: Array<GraphQLTypes['OrderTaxSummary']>;
        history: GraphQLTypes['HistoryEntryList'];
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    /** A summary of the taxes being applied to this order, grouped
by taxRate. */
    ['OrderTaxSummary']: {
        __typename: 'OrderTaxSummary';
        /** A description of this tax */
        description: string;
        /** The taxRate as a percentage */
        taxRate: number;
        /** The total net price of OrderLines to which this taxRate applies */
        taxBase: GraphQLTypes['Money'];
        /** The total tax being applied to the Order at this taxRate */
        taxTotal: GraphQLTypes['Money'];
    };
    ['OrderAddress']: {
        __typename: 'OrderAddress';
        fullName?: string | undefined;
        company?: string | undefined;
        streetLine1?: string | undefined;
        streetLine2?: string | undefined;
        city?: string | undefined;
        province?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
        countryCode?: string | undefined;
        phoneNumber?: string | undefined;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['OrderList']: {
        __typename: 'OrderList';
        items: Array<GraphQLTypes['Order']>;
        totalItems: number;
    };
    ['ShippingLine']: {
        __typename: 'ShippingLine';
        id: string;
        shippingMethod: GraphQLTypes['ShippingMethod'];
        price: GraphQLTypes['Money'];
        priceWithTax: GraphQLTypes['Money'];
        discountedPrice: GraphQLTypes['Money'];
        discountedPriceWithTax: GraphQLTypes['Money'];
        discounts: Array<GraphQLTypes['Discount']>;
    };
    ['Discount']: {
        __typename: 'Discount';
        adjustmentSource: string;
        type: GraphQLTypes['AdjustmentType'];
        description: string;
        amount: GraphQLTypes['Money'];
        amountWithTax: GraphQLTypes['Money'];
    };
    ['OrderLine']: {
        __typename: 'OrderLine';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        productVariant: GraphQLTypes['ProductVariant'];
        featuredAsset?: GraphQLTypes['Asset'] | undefined;
        /** The price of a single unit, excluding tax and discounts */
        unitPrice: GraphQLTypes['Money'];
        /** The price of a single unit, including tax but excluding discounts */
        unitPriceWithTax: GraphQLTypes['Money'];
        /** Non-zero if the unitPrice has changed since it was initially added to Order */
        unitPriceChangeSinceAdded: GraphQLTypes['Money'];
        /** Non-zero if the unitPriceWithTax has changed since it was initially added to Order */
        unitPriceWithTaxChangeSinceAdded: GraphQLTypes['Money'];
        /** The price of a single unit including discounts, excluding tax.

If Order-level discounts have been applied, this will not be the
actual taxable unit price (see `proratedUnitPrice`), but is generally the
correct price to display to customers to avoid confusion
about the internal handling of distributed Order-level discounts. */
        discountedUnitPrice: GraphQLTypes['Money'];
        /** The price of a single unit including discounts and tax */
        discountedUnitPriceWithTax: GraphQLTypes['Money'];
        /** The actual unit price, taking into account both item discounts _and_ prorated (proportionally-distributed)
Order-level discounts. This value is the true economic value of the OrderItem, and is used in tax
and refund calculations. */
        proratedUnitPrice: GraphQLTypes['Money'];
        /** The proratedUnitPrice including tax */
        proratedUnitPriceWithTax: GraphQLTypes['Money'];
        /** The quantity of items purchased */
        quantity: number;
        /** The quantity at the time the Order was placed */
        orderPlacedQuantity: number;
        taxRate: number;
        /** The total price of the line excluding tax and discounts. */
        linePrice: GraphQLTypes['Money'];
        /** The total price of the line including tax but excluding discounts. */
        linePriceWithTax: GraphQLTypes['Money'];
        /** The price of the line including discounts, excluding tax */
        discountedLinePrice: GraphQLTypes['Money'];
        /** The price of the line including discounts and tax */
        discountedLinePriceWithTax: GraphQLTypes['Money'];
        /** The actual line price, taking into account both item discounts _and_ prorated (proportionally-distributed)
Order-level discounts. This value is the true economic value of the OrderLine, and is used in tax
and refund calculations. */
        proratedLinePrice: GraphQLTypes['Money'];
        /** The proratedLinePrice including tax */
        proratedLinePriceWithTax: GraphQLTypes['Money'];
        /** The total tax on this line */
        lineTax: GraphQLTypes['Money'];
        discounts: Array<GraphQLTypes['Discount']>;
        taxLines: Array<GraphQLTypes['TaxLine']>;
        order: GraphQLTypes['Order'];
        fulfillmentLines?: Array<GraphQLTypes['FulfillmentLine']> | undefined;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['Payment']: {
        __typename: 'Payment';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        method: string;
        amount: GraphQLTypes['Money'];
        state: string;
        transactionId?: string | undefined;
        errorMessage?: string | undefined;
        refunds: Array<GraphQLTypes['Refund']>;
        metadata?: GraphQLTypes['JSON'] | undefined;
    };
    ['RefundLine']: {
        __typename: 'RefundLine';
        orderLine: GraphQLTypes['OrderLine'];
        orderLineId: string;
        quantity: number;
        refund: GraphQLTypes['Refund'];
        refundId: string;
    };
    ['Refund']: {
        __typename: 'Refund';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        items: GraphQLTypes['Money'];
        shipping: GraphQLTypes['Money'];
        adjustment: GraphQLTypes['Money'];
        total: GraphQLTypes['Money'];
        method?: string | undefined;
        state: string;
        transactionId?: string | undefined;
        reason?: string | undefined;
        lines: Array<GraphQLTypes['RefundLine']>;
        paymentId: string;
        metadata?: GraphQLTypes['JSON'] | undefined;
    };
    ['FulfillmentLine']: {
        __typename: 'FulfillmentLine';
        orderLine: GraphQLTypes['OrderLine'];
        orderLineId: string;
        quantity: number;
        fulfillment: GraphQLTypes['Fulfillment'];
        fulfillmentId: string;
    };
    ['Fulfillment']: {
        __typename: 'Fulfillment';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        lines: Array<GraphQLTypes['FulfillmentLine']>;
        summary: Array<GraphQLTypes['FulfillmentLine']>;
        state: string;
        method: string;
        trackingCode?: string | undefined;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['Surcharge']: {
        __typename: 'Surcharge';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        description: string;
        sku?: string | undefined;
        taxLines: Array<GraphQLTypes['TaxLine']>;
        price: GraphQLTypes['Money'];
        priceWithTax: GraphQLTypes['Money'];
        taxRate: number;
    };
    ['PaymentMethod']: {
        __typename: 'PaymentMethod';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        name: string;
        code: string;
        description: string;
        enabled: boolean;
        checker?: GraphQLTypes['ConfigurableOperation'] | undefined;
        handler: GraphQLTypes['ConfigurableOperation'];
        translations: Array<GraphQLTypes['PaymentMethodTranslation']>;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['PaymentMethodTranslation']: {
        __typename: 'PaymentMethodTranslation';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        languageCode: GraphQLTypes['LanguageCode'];
        name: string;
        description: string;
    };
    ['ProductOptionGroup']: {
        __typename: 'ProductOptionGroup';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        languageCode: GraphQLTypes['LanguageCode'];
        code: string;
        name: string;
        options: Array<GraphQLTypes['ProductOption']>;
        translations: Array<GraphQLTypes['ProductOptionGroupTranslation']>;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['ProductOptionGroupTranslation']: {
        __typename: 'ProductOptionGroupTranslation';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        languageCode: GraphQLTypes['LanguageCode'];
        name: string;
    };
    ['ProductOption']: {
        __typename: 'ProductOption';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        languageCode: GraphQLTypes['LanguageCode'];
        code: string;
        name: string;
        groupId: string;
        group: GraphQLTypes['ProductOptionGroup'];
        translations: Array<GraphQLTypes['ProductOptionTranslation']>;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['ProductOptionTranslation']: {
        __typename: 'ProductOptionTranslation';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        languageCode: GraphQLTypes['LanguageCode'];
        name: string;
    };
    ['SearchReindexResponse']: {
        __typename: 'SearchReindexResponse';
        success: boolean;
    };
    ['SearchResponse']: {
        __typename: 'SearchResponse';
        items: Array<GraphQLTypes['SearchResult']>;
        totalItems: number;
        facetValues: Array<GraphQLTypes['FacetValueResult']>;
        collections: Array<GraphQLTypes['CollectionResult']>;
    };
    /** Which FacetValues are present in the products returned
by the search, and in what quantity. */
    ['FacetValueResult']: {
        __typename: 'FacetValueResult';
        facetValue: GraphQLTypes['FacetValue'];
        count: number;
    };
    /** Which Collections are present in the products returned
by the search, and in what quantity. */
    ['CollectionResult']: {
        __typename: 'CollectionResult';
        collection: GraphQLTypes['Collection'];
        count: number;
    };
    ['SearchResultAsset']: {
        __typename: 'SearchResultAsset';
        id: string;
        preview: string;
        focalPoint?: GraphQLTypes['Coordinate'] | undefined;
    };
    ['SearchResult']: {
        __typename: 'SearchResult';
        sku: string;
        slug: string;
        productId: string;
        productName: string;
        productAsset?: GraphQLTypes['SearchResultAsset'] | undefined;
        productVariantId: string;
        productVariantName: string;
        productVariantAsset?: GraphQLTypes['SearchResultAsset'] | undefined;
        price: GraphQLTypes['SearchResultPrice'];
        priceWithTax: GraphQLTypes['SearchResultPrice'];
        currencyCode: GraphQLTypes['CurrencyCode'];
        description: string;
        facetIds: Array<string>;
        facetValueIds: Array<string>;
        /** An array of ids of the Collections in which this result appears */
        collectionIds: Array<string>;
        /** A relevance score for the result. Differs between database implementations */
        score: number;
        inStock: boolean;
    };
    /** The price of a search result product, either as a range or as a single price */
    ['SearchResultPrice']: {
        __typename: 'PriceRange' | 'SinglePrice';
        ['...on PriceRange']: '__union' & GraphQLTypes['PriceRange'];
        ['...on SinglePrice']: '__union' & GraphQLTypes['SinglePrice'];
    };
    /** The price value where the result has a single price */
    ['SinglePrice']: {
        __typename: 'SinglePrice';
        value: GraphQLTypes['Money'];
    };
    /** The price range where the result has more than one price */
    ['PriceRange']: {
        __typename: 'PriceRange';
        min: GraphQLTypes['Money'];
        max: GraphQLTypes['Money'];
    };
    ['Product']: {
        __typename: 'Product';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        languageCode: GraphQLTypes['LanguageCode'];
        name: string;
        slug: string;
        description: string;
        featuredAsset?: GraphQLTypes['Asset'] | undefined;
        assets: Array<GraphQLTypes['Asset']>;
        /** Returns all ProductVariants */
        variants: Array<GraphQLTypes['ProductVariant']>;
        /** Returns a paginated, sortable, filterable list of ProductVariants */
        variantList: GraphQLTypes['ProductVariantList'];
        optionGroups: Array<GraphQLTypes['ProductOptionGroup']>;
        facetValues: Array<GraphQLTypes['FacetValue']>;
        translations: Array<GraphQLTypes['ProductTranslation']>;
        collections: Array<GraphQLTypes['Collection']>;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['ProductTranslation']: {
        __typename: 'ProductTranslation';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        languageCode: GraphQLTypes['LanguageCode'];
        name: string;
        slug: string;
        description: string;
    };
    ['ProductList']: {
        __typename: 'ProductList';
        items: Array<GraphQLTypes['Product']>;
        totalItems: number;
    };
    ['ProductVariantList']: {
        __typename: 'ProductVariantList';
        items: Array<GraphQLTypes['ProductVariant']>;
        totalItems: number;
    };
    ['ProductVariant']: {
        __typename: 'ProductVariant';
        id: string;
        product: GraphQLTypes['Product'];
        productId: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        languageCode: GraphQLTypes['LanguageCode'];
        sku: string;
        name: string;
        featuredAsset?: GraphQLTypes['Asset'] | undefined;
        assets: Array<GraphQLTypes['Asset']>;
        price: GraphQLTypes['Money'];
        currencyCode: GraphQLTypes['CurrencyCode'];
        priceWithTax: GraphQLTypes['Money'];
        stockLevel: string;
        taxRateApplied: GraphQLTypes['TaxRate'];
        taxCategory: GraphQLTypes['TaxCategory'];
        options: Array<GraphQLTypes['ProductOption']>;
        facetValues: Array<GraphQLTypes['FacetValue']>;
        translations: Array<GraphQLTypes['ProductVariantTranslation']>;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['ProductVariantTranslation']: {
        __typename: 'ProductVariantTranslation';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        languageCode: GraphQLTypes['LanguageCode'];
        name: string;
    };
    ['Promotion']: {
        __typename: 'Promotion';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        startsAt?: GraphQLTypes['DateTime'] | undefined;
        endsAt?: GraphQLTypes['DateTime'] | undefined;
        couponCode?: string | undefined;
        perCustomerUsageLimit?: number | undefined;
        usageLimit?: number | undefined;
        name: string;
        description: string;
        enabled: boolean;
        conditions: Array<GraphQLTypes['ConfigurableOperation']>;
        actions: Array<GraphQLTypes['ConfigurableOperation']>;
        translations: Array<GraphQLTypes['PromotionTranslation']>;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['PromotionTranslation']: {
        __typename: 'PromotionTranslation';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        languageCode: GraphQLTypes['LanguageCode'];
        name: string;
        description: string;
    };
    ['PromotionList']: {
        __typename: 'PromotionList';
        items: Array<GraphQLTypes['Promotion']>;
        totalItems: number;
    };
    ['Region']: {
        __typename: 'Country' | 'Province';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        languageCode: GraphQLTypes['LanguageCode'];
        code: string;
        type: string;
        name: string;
        enabled: boolean;
        parent?: GraphQLTypes['Region'] | undefined;
        parentId?: string | undefined;
        translations: Array<GraphQLTypes['RegionTranslation']>;
        ['...on Country']: '__union' & GraphQLTypes['Country'];
        ['...on Province']: '__union' & GraphQLTypes['Province'];
    };
    ['RegionTranslation']: {
        __typename: 'RegionTranslation';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        languageCode: GraphQLTypes['LanguageCode'];
        name: string;
    };
    ['Country']: {
        __typename: 'Country';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        languageCode: GraphQLTypes['LanguageCode'];
        code: string;
        type: string;
        name: string;
        enabled: boolean;
        parent?: GraphQLTypes['Region'] | undefined;
        parentId?: string | undefined;
        translations: Array<GraphQLTypes['RegionTranslation']>;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['CountryList']: {
        __typename: 'CountryList';
        items: Array<GraphQLTypes['Country']>;
        totalItems: number;
    };
    ['Province']: {
        __typename: 'Province';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        languageCode: GraphQLTypes['LanguageCode'];
        code: string;
        type: string;
        name: string;
        enabled: boolean;
        parent?: GraphQLTypes['Region'] | undefined;
        parentId?: string | undefined;
        translations: Array<GraphQLTypes['RegionTranslation']>;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['ProvinceList']: {
        __typename: 'ProvinceList';
        items: Array<GraphQLTypes['Province']>;
        totalItems: number;
    };
    ['Role']: {
        __typename: 'Role';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        code: string;
        description: string;
        permissions: Array<GraphQLTypes['Permission']>;
        channels: Array<GraphQLTypes['Channel']>;
    };
    ['RoleList']: {
        __typename: 'RoleList';
        items: Array<GraphQLTypes['Role']>;
        totalItems: number;
    };
    ['Seller']: {
        __typename: 'Seller';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        name: string;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['ShippingMethod']: {
        __typename: 'ShippingMethod';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        languageCode: GraphQLTypes['LanguageCode'];
        code: string;
        name: string;
        description: string;
        fulfillmentHandlerCode: string;
        checker: GraphQLTypes['ConfigurableOperation'];
        calculator: GraphQLTypes['ConfigurableOperation'];
        translations: Array<GraphQLTypes['ShippingMethodTranslation']>;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['ShippingMethodTranslation']: {
        __typename: 'ShippingMethodTranslation';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        languageCode: GraphQLTypes['LanguageCode'];
        name: string;
        description: string;
    };
    ['ShippingMethodList']: {
        __typename: 'ShippingMethodList';
        items: Array<GraphQLTypes['ShippingMethod']>;
        totalItems: number;
    };
    ['Tag']: {
        __typename: 'Tag';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        value: string;
    };
    ['TagList']: {
        __typename: 'TagList';
        items: Array<GraphQLTypes['Tag']>;
        totalItems: number;
    };
    ['TaxCategory']: {
        __typename: 'TaxCategory';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        name: string;
        isDefault: boolean;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['TaxRate']: {
        __typename: 'TaxRate';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        name: string;
        enabled: boolean;
        value: number;
        category: GraphQLTypes['TaxCategory'];
        zone: GraphQLTypes['Zone'];
        customerGroup?: GraphQLTypes['CustomerGroup'] | undefined;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['TaxRateList']: {
        __typename: 'TaxRateList';
        items: Array<GraphQLTypes['TaxRate']>;
        totalItems: number;
    };
    ['User']: {
        __typename: 'User';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        identifier: string;
        verified: boolean;
        roles: Array<GraphQLTypes['Role']>;
        lastLogin?: GraphQLTypes['DateTime'] | undefined;
        authenticationMethods: Array<GraphQLTypes['AuthenticationMethod']>;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['AuthenticationMethod']: {
        __typename: 'AuthenticationMethod';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        strategy: string;
    };
    ['Zone']: {
        __typename: 'Zone';
        id: string;
        createdAt: GraphQLTypes['DateTime'];
        updatedAt: GraphQLTypes['DateTime'];
        name: string;
        members: Array<GraphQLTypes['Region']>;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    /** Returned when attempting to add a Payment to an Order that is not in the `ArrangingPayment` state. */
    ['OrderPaymentStateError']: {
        __typename: 'OrderPaymentStateError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
    };
    /** Returned when attempting to add a Payment using a PaymentMethod for which the Order is not eligible. */
    ['IneligiblePaymentMethodError']: {
        __typename: 'IneligiblePaymentMethodError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
        eligibilityCheckerMessage?: string | undefined;
    };
    /** Returned when a Payment fails due to an error. */
    ['PaymentFailedError']: {
        __typename: 'PaymentFailedError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
        paymentErrorMessage: string;
    };
    /** Returned when a Payment is declined by the payment provider. */
    ['PaymentDeclinedError']: {
        __typename: 'PaymentDeclinedError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
        paymentErrorMessage: string;
    };
    /** Returned when attempting to set the Customer for an Order when already logged in. */
    ['AlreadyLoggedInError']: {
        __typename: 'AlreadyLoggedInError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
    };
    /** Returned when attempting to register or verify a customer account without a password, when one is required. */
    ['MissingPasswordError']: {
        __typename: 'MissingPasswordError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
    };
    /** Returned when attempting to register or verify a customer account where the given password fails password validation. */
    ['PasswordValidationError']: {
        __typename: 'PasswordValidationError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
        validationErrorMessage: string;
    };
    /** Returned when attempting to verify a customer account with a password, when a password has already been set. */
    ['PasswordAlreadySetError']: {
        __typename: 'PasswordAlreadySetError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
    };
    /** Returned if the verification token (used to verify a Customer's email address) is either
invalid or does not match any expected tokens. */
    ['VerificationTokenInvalidError']: {
        __typename: 'VerificationTokenInvalidError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
    };
    /** Returned if the verification token (used to verify a Customer's email address) is valid, but has
expired according to the `verificationTokenDuration` setting in the AuthOptions. */
    ['VerificationTokenExpiredError']: {
        __typename: 'VerificationTokenExpiredError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
    };
    /** Returned if the token used to change a Customer's email address is either
invalid or does not match any expected tokens. */
    ['IdentifierChangeTokenInvalidError']: {
        __typename: 'IdentifierChangeTokenInvalidError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
    };
    /** Returned if the token used to change a Customer's email address is valid, but has
expired according to the `verificationTokenDuration` setting in the AuthOptions. */
    ['IdentifierChangeTokenExpiredError']: {
        __typename: 'IdentifierChangeTokenExpiredError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
    };
    /** Returned if the token used to reset a Customer's password is either
invalid or does not match any expected tokens. */
    ['PasswordResetTokenInvalidError']: {
        __typename: 'PasswordResetTokenInvalidError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
    };
    /** Returned if the token used to reset a Customer's password is valid, but has
expired according to the `verificationTokenDuration` setting in the AuthOptions. */
    ['PasswordResetTokenExpiredError']: {
        __typename: 'PasswordResetTokenExpiredError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
    };
    /** Returned if `authOptions.requireVerification` is set to `true` (which is the default)
and an unverified user attempts to authenticate. */
    ['NotVerifiedError']: {
        __typename: 'NotVerifiedError';
        errorCode: GraphQLTypes['ErrorCode'];
        message: string;
    };
    ['AuthenticationInput']: {
        native?: GraphQLTypes['NativeAuthInput'] | undefined;
    };
    ['RegisterCustomerInput']: {
        emailAddress: string;
        title?: string | undefined;
        firstName?: string | undefined;
        lastName?: string | undefined;
        phoneNumber?: string | undefined;
        password?: string | undefined;
    };
    ['UpdateCustomerInput']: {
        title?: string | undefined;
        firstName?: string | undefined;
        lastName?: string | undefined;
        phoneNumber?: string | undefined;
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    ['UpdateOrderInput']: {
        customFields?: GraphQLTypes['JSON'] | undefined;
    };
    /** Passed as input to the `addPaymentToOrder` mutation. */
    ['PaymentInput']: {
        /** This field should correspond to the `code` property of a PaymentMethod. */
        method: string;
        /** This field should contain arbitrary data passed to the specified PaymentMethodHandler's `createPayment()` method
as the "metadata" argument. For example, it could contain an ID for the payment and other
data generated by the payment provider. */
        metadata: GraphQLTypes['JSON'];
    };
    ['CollectionListOptions']: {
        topLevelOnly?: boolean | undefined;
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined;
        /** Takes n results, for use in pagination */
        take?: number | undefined;
        /** Specifies which properties to sort the results by */
        sort?: GraphQLTypes['CollectionSortParameter'] | undefined;
        /** Allows the results to be filtered */
        filter?: GraphQLTypes['CollectionFilterParameter'] | undefined;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: GraphQLTypes['LogicalOperator'] | undefined;
    };
    ['FacetListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined;
        /** Takes n results, for use in pagination */
        take?: number | undefined;
        /** Specifies which properties to sort the results by */
        sort?: GraphQLTypes['FacetSortParameter'] | undefined;
        /** Allows the results to be filtered */
        filter?: GraphQLTypes['FacetFilterParameter'] | undefined;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: GraphQLTypes['LogicalOperator'] | undefined;
    };
    ['OrderListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined;
        /** Takes n results, for use in pagination */
        take?: number | undefined;
        /** Specifies which properties to sort the results by */
        sort?: GraphQLTypes['OrderSortParameter'] | undefined;
        /** Allows the results to be filtered */
        filter?: GraphQLTypes['OrderFilterParameter'] | undefined;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: GraphQLTypes['LogicalOperator'] | undefined;
    };
    ['ProductListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined;
        /** Takes n results, for use in pagination */
        take?: number | undefined;
        /** Specifies which properties to sort the results by */
        sort?: GraphQLTypes['ProductSortParameter'] | undefined;
        /** Allows the results to be filtered */
        filter?: GraphQLTypes['ProductFilterParameter'] | undefined;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: GraphQLTypes['LogicalOperator'] | undefined;
    };
    ['ProductVariantListOptions']: {
        /** Skips the first n results, for use in pagination */
        skip?: number | undefined;
        /** Takes n results, for use in pagination */
        take?: number | undefined;
        /** Specifies which properties to sort the results by */
        sort?: GraphQLTypes['ProductVariantSortParameter'] | undefined;
        /** Allows the results to be filtered */
        filter?: GraphQLTypes['ProductVariantFilterParameter'] | undefined;
        /** Specifies whether multiple "filter" arguments should be combines with a logical AND or OR operation. Defaults to AND. */
        filterOperator?: GraphQLTypes['LogicalOperator'] | undefined;
    };
    ['AddPaymentToOrderResult']: {
        __typename:
            | 'Order'
            | 'OrderPaymentStateError'
            | 'IneligiblePaymentMethodError'
            | 'PaymentFailedError'
            | 'PaymentDeclinedError'
            | 'OrderStateTransitionError'
            | 'NoActiveOrderError';
        ['...on Order']: '__union' & GraphQLTypes['Order'];
        ['...on OrderPaymentStateError']: '__union' & GraphQLTypes['OrderPaymentStateError'];
        ['...on IneligiblePaymentMethodError']: '__union' & GraphQLTypes['IneligiblePaymentMethodError'];
        ['...on PaymentFailedError']: '__union' & GraphQLTypes['PaymentFailedError'];
        ['...on PaymentDeclinedError']: '__union' & GraphQLTypes['PaymentDeclinedError'];
        ['...on OrderStateTransitionError']: '__union' & GraphQLTypes['OrderStateTransitionError'];
        ['...on NoActiveOrderError']: '__union' & GraphQLTypes['NoActiveOrderError'];
    };
    ['TransitionOrderToStateResult']: {
        __typename: 'Order' | 'OrderStateTransitionError';
        ['...on Order']: '__union' & GraphQLTypes['Order'];
        ['...on OrderStateTransitionError']: '__union' & GraphQLTypes['OrderStateTransitionError'];
    };
    ['SetCustomerForOrderResult']: {
        __typename:
            | 'Order'
            | 'AlreadyLoggedInError'
            | 'EmailAddressConflictError'
            | 'NoActiveOrderError'
            | 'GuestCheckoutError';
        ['...on Order']: '__union' & GraphQLTypes['Order'];
        ['...on AlreadyLoggedInError']: '__union' & GraphQLTypes['AlreadyLoggedInError'];
        ['...on EmailAddressConflictError']: '__union' & GraphQLTypes['EmailAddressConflictError'];
        ['...on NoActiveOrderError']: '__union' & GraphQLTypes['NoActiveOrderError'];
        ['...on GuestCheckoutError']: '__union' & GraphQLTypes['GuestCheckoutError'];
    };
    ['RegisterCustomerAccountResult']: {
        __typename: 'Success' | 'MissingPasswordError' | 'PasswordValidationError' | 'NativeAuthStrategyError';
        ['...on Success']: '__union' & GraphQLTypes['Success'];
        ['...on MissingPasswordError']: '__union' & GraphQLTypes['MissingPasswordError'];
        ['...on PasswordValidationError']: '__union' & GraphQLTypes['PasswordValidationError'];
        ['...on NativeAuthStrategyError']: '__union' & GraphQLTypes['NativeAuthStrategyError'];
    };
    ['RefreshCustomerVerificationResult']: {
        __typename: 'Success' | 'NativeAuthStrategyError';
        ['...on Success']: '__union' & GraphQLTypes['Success'];
        ['...on NativeAuthStrategyError']: '__union' & GraphQLTypes['NativeAuthStrategyError'];
    };
    ['VerifyCustomerAccountResult']: {
        __typename:
            | 'CurrentUser'
            | 'VerificationTokenInvalidError'
            | 'VerificationTokenExpiredError'
            | 'MissingPasswordError'
            | 'PasswordValidationError'
            | 'PasswordAlreadySetError'
            | 'NativeAuthStrategyError';
        ['...on CurrentUser']: '__union' & GraphQLTypes['CurrentUser'];
        ['...on VerificationTokenInvalidError']: '__union' & GraphQLTypes['VerificationTokenInvalidError'];
        ['...on VerificationTokenExpiredError']: '__union' & GraphQLTypes['VerificationTokenExpiredError'];
        ['...on MissingPasswordError']: '__union' & GraphQLTypes['MissingPasswordError'];
        ['...on PasswordValidationError']: '__union' & GraphQLTypes['PasswordValidationError'];
        ['...on PasswordAlreadySetError']: '__union' & GraphQLTypes['PasswordAlreadySetError'];
        ['...on NativeAuthStrategyError']: '__union' & GraphQLTypes['NativeAuthStrategyError'];
    };
    ['UpdateCustomerPasswordResult']: {
        __typename: 'Success' | 'InvalidCredentialsError' | 'PasswordValidationError' | 'NativeAuthStrategyError';
        ['...on Success']: '__union' & GraphQLTypes['Success'];
        ['...on InvalidCredentialsError']: '__union' & GraphQLTypes['InvalidCredentialsError'];
        ['...on PasswordValidationError']: '__union' & GraphQLTypes['PasswordValidationError'];
        ['...on NativeAuthStrategyError']: '__union' & GraphQLTypes['NativeAuthStrategyError'];
    };
    ['RequestUpdateCustomerEmailAddressResult']: {
        __typename: 'Success' | 'InvalidCredentialsError' | 'EmailAddressConflictError' | 'NativeAuthStrategyError';
        ['...on Success']: '__union' & GraphQLTypes['Success'];
        ['...on InvalidCredentialsError']: '__union' & GraphQLTypes['InvalidCredentialsError'];
        ['...on EmailAddressConflictError']: '__union' & GraphQLTypes['EmailAddressConflictError'];
        ['...on NativeAuthStrategyError']: '__union' & GraphQLTypes['NativeAuthStrategyError'];
    };
    ['UpdateCustomerEmailAddressResult']: {
        __typename:
            | 'Success'
            | 'IdentifierChangeTokenInvalidError'
            | 'IdentifierChangeTokenExpiredError'
            | 'NativeAuthStrategyError';
        ['...on Success']: '__union' & GraphQLTypes['Success'];
        ['...on IdentifierChangeTokenInvalidError']: '__union' & GraphQLTypes['IdentifierChangeTokenInvalidError'];
        ['...on IdentifierChangeTokenExpiredError']: '__union' & GraphQLTypes['IdentifierChangeTokenExpiredError'];
        ['...on NativeAuthStrategyError']: '__union' & GraphQLTypes['NativeAuthStrategyError'];
    };
    ['RequestPasswordResetResult']: {
        __typename: 'Success' | 'NativeAuthStrategyError';
        ['...on Success']: '__union' & GraphQLTypes['Success'];
        ['...on NativeAuthStrategyError']: '__union' & GraphQLTypes['NativeAuthStrategyError'];
    };
    ['ResetPasswordResult']: {
        __typename:
            | 'CurrentUser'
            | 'PasswordResetTokenInvalidError'
            | 'PasswordResetTokenExpiredError'
            | 'PasswordValidationError'
            | 'NativeAuthStrategyError'
            | 'NotVerifiedError';
        ['...on CurrentUser']: '__union' & GraphQLTypes['CurrentUser'];
        ['...on PasswordResetTokenInvalidError']: '__union' & GraphQLTypes['PasswordResetTokenInvalidError'];
        ['...on PasswordResetTokenExpiredError']: '__union' & GraphQLTypes['PasswordResetTokenExpiredError'];
        ['...on PasswordValidationError']: '__union' & GraphQLTypes['PasswordValidationError'];
        ['...on NativeAuthStrategyError']: '__union' & GraphQLTypes['NativeAuthStrategyError'];
        ['...on NotVerifiedError']: '__union' & GraphQLTypes['NotVerifiedError'];
    };
    ['NativeAuthenticationResult']: {
        __typename: 'CurrentUser' | 'InvalidCredentialsError' | 'NotVerifiedError' | 'NativeAuthStrategyError';
        ['...on CurrentUser']: '__union' & GraphQLTypes['CurrentUser'];
        ['...on InvalidCredentialsError']: '__union' & GraphQLTypes['InvalidCredentialsError'];
        ['...on NotVerifiedError']: '__union' & GraphQLTypes['NotVerifiedError'];
        ['...on NativeAuthStrategyError']: '__union' & GraphQLTypes['NativeAuthStrategyError'];
    };
    ['AuthenticationResult']: {
        __typename: 'CurrentUser' | 'InvalidCredentialsError' | 'NotVerifiedError';
        ['...on CurrentUser']: '__union' & GraphQLTypes['CurrentUser'];
        ['...on InvalidCredentialsError']: '__union' & GraphQLTypes['InvalidCredentialsError'];
        ['...on NotVerifiedError']: '__union' & GraphQLTypes['NotVerifiedError'];
    };
    ['ActiveOrderResult']: {
        __typename: 'Order' | 'NoActiveOrderError';
        ['...on Order']: '__union' & GraphQLTypes['Order'];
        ['...on NoActiveOrderError']: '__union' & GraphQLTypes['NoActiveOrderError'];
    };
    ['ProductVariantFilterParameter']: {
        id?: GraphQLTypes['IDOperators'] | undefined;
        productId?: GraphQLTypes['IDOperators'] | undefined;
        createdAt?: GraphQLTypes['DateOperators'] | undefined;
        updatedAt?: GraphQLTypes['DateOperators'] | undefined;
        languageCode?: GraphQLTypes['StringOperators'] | undefined;
        sku?: GraphQLTypes['StringOperators'] | undefined;
        name?: GraphQLTypes['StringOperators'] | undefined;
        price?: GraphQLTypes['NumberOperators'] | undefined;
        currencyCode?: GraphQLTypes['StringOperators'] | undefined;
        priceWithTax?: GraphQLTypes['NumberOperators'] | undefined;
        stockLevel?: GraphQLTypes['StringOperators'] | undefined;
    };
    ['ProductVariantSortParameter']: {
        id?: GraphQLTypes['SortOrder'] | undefined;
        productId?: GraphQLTypes['SortOrder'] | undefined;
        createdAt?: GraphQLTypes['SortOrder'] | undefined;
        updatedAt?: GraphQLTypes['SortOrder'] | undefined;
        sku?: GraphQLTypes['SortOrder'] | undefined;
        name?: GraphQLTypes['SortOrder'] | undefined;
        price?: GraphQLTypes['SortOrder'] | undefined;
        priceWithTax?: GraphQLTypes['SortOrder'] | undefined;
        stockLevel?: GraphQLTypes['SortOrder'] | undefined;
    };
    ['CustomerFilterParameter']: {
        id?: GraphQLTypes['IDOperators'] | undefined;
        createdAt?: GraphQLTypes['DateOperators'] | undefined;
        updatedAt?: GraphQLTypes['DateOperators'] | undefined;
        title?: GraphQLTypes['StringOperators'] | undefined;
        firstName?: GraphQLTypes['StringOperators'] | undefined;
        lastName?: GraphQLTypes['StringOperators'] | undefined;
        phoneNumber?: GraphQLTypes['StringOperators'] | undefined;
        emailAddress?: GraphQLTypes['StringOperators'] | undefined;
    };
    ['CustomerSortParameter']: {
        id?: GraphQLTypes['SortOrder'] | undefined;
        createdAt?: GraphQLTypes['SortOrder'] | undefined;
        updatedAt?: GraphQLTypes['SortOrder'] | undefined;
        title?: GraphQLTypes['SortOrder'] | undefined;
        firstName?: GraphQLTypes['SortOrder'] | undefined;
        lastName?: GraphQLTypes['SortOrder'] | undefined;
        phoneNumber?: GraphQLTypes['SortOrder'] | undefined;
        emailAddress?: GraphQLTypes['SortOrder'] | undefined;
    };
    ['OrderFilterParameter']: {
        id?: GraphQLTypes['IDOperators'] | undefined;
        createdAt?: GraphQLTypes['DateOperators'] | undefined;
        updatedAt?: GraphQLTypes['DateOperators'] | undefined;
        type?: GraphQLTypes['StringOperators'] | undefined;
        orderPlacedAt?: GraphQLTypes['DateOperators'] | undefined;
        code?: GraphQLTypes['StringOperators'] | undefined;
        state?: GraphQLTypes['StringOperators'] | undefined;
        active?: GraphQLTypes['BooleanOperators'] | undefined;
        totalQuantity?: GraphQLTypes['NumberOperators'] | undefined;
        subTotal?: GraphQLTypes['NumberOperators'] | undefined;
        subTotalWithTax?: GraphQLTypes['NumberOperators'] | undefined;
        currencyCode?: GraphQLTypes['StringOperators'] | undefined;
        shipping?: GraphQLTypes['NumberOperators'] | undefined;
        shippingWithTax?: GraphQLTypes['NumberOperators'] | undefined;
        total?: GraphQLTypes['NumberOperators'] | undefined;
        totalWithTax?: GraphQLTypes['NumberOperators'] | undefined;
    };
    ['OrderSortParameter']: {
        id?: GraphQLTypes['SortOrder'] | undefined;
        createdAt?: GraphQLTypes['SortOrder'] | undefined;
        updatedAt?: GraphQLTypes['SortOrder'] | undefined;
        orderPlacedAt?: GraphQLTypes['SortOrder'] | undefined;
        code?: GraphQLTypes['SortOrder'] | undefined;
        state?: GraphQLTypes['SortOrder'] | undefined;
        totalQuantity?: GraphQLTypes['SortOrder'] | undefined;
        subTotal?: GraphQLTypes['SortOrder'] | undefined;
        subTotalWithTax?: GraphQLTypes['SortOrder'] | undefined;
        shipping?: GraphQLTypes['SortOrder'] | undefined;
        shippingWithTax?: GraphQLTypes['SortOrder'] | undefined;
        total?: GraphQLTypes['SortOrder'] | undefined;
        totalWithTax?: GraphQLTypes['SortOrder'] | undefined;
    };
    ['FacetValueFilterParameter']: {
        id?: GraphQLTypes['IDOperators'] | undefined;
        createdAt?: GraphQLTypes['DateOperators'] | undefined;
        updatedAt?: GraphQLTypes['DateOperators'] | undefined;
        languageCode?: GraphQLTypes['StringOperators'] | undefined;
        facetId?: GraphQLTypes['IDOperators'] | undefined;
        name?: GraphQLTypes['StringOperators'] | undefined;
        code?: GraphQLTypes['StringOperators'] | undefined;
    };
    ['FacetValueSortParameter']: {
        id?: GraphQLTypes['SortOrder'] | undefined;
        createdAt?: GraphQLTypes['SortOrder'] | undefined;
        updatedAt?: GraphQLTypes['SortOrder'] | undefined;
        facetId?: GraphQLTypes['SortOrder'] | undefined;
        name?: GraphQLTypes['SortOrder'] | undefined;
        code?: GraphQLTypes['SortOrder'] | undefined;
    };
    ['HistoryEntryFilterParameter']: {
        id?: GraphQLTypes['IDOperators'] | undefined;
        createdAt?: GraphQLTypes['DateOperators'] | undefined;
        updatedAt?: GraphQLTypes['DateOperators'] | undefined;
        type?: GraphQLTypes['StringOperators'] | undefined;
    };
    ['HistoryEntrySortParameter']: {
        id?: GraphQLTypes['SortOrder'] | undefined;
        createdAt?: GraphQLTypes['SortOrder'] | undefined;
        updatedAt?: GraphQLTypes['SortOrder'] | undefined;
    };
    ['CollectionFilterParameter']: {
        id?: GraphQLTypes['IDOperators'] | undefined;
        createdAt?: GraphQLTypes['DateOperators'] | undefined;
        updatedAt?: GraphQLTypes['DateOperators'] | undefined;
        languageCode?: GraphQLTypes['StringOperators'] | undefined;
        name?: GraphQLTypes['StringOperators'] | undefined;
        slug?: GraphQLTypes['StringOperators'] | undefined;
        position?: GraphQLTypes['NumberOperators'] | undefined;
        description?: GraphQLTypes['StringOperators'] | undefined;
        parentId?: GraphQLTypes['IDOperators'] | undefined;
    };
    ['CollectionSortParameter']: {
        id?: GraphQLTypes['SortOrder'] | undefined;
        createdAt?: GraphQLTypes['SortOrder'] | undefined;
        updatedAt?: GraphQLTypes['SortOrder'] | undefined;
        name?: GraphQLTypes['SortOrder'] | undefined;
        slug?: GraphQLTypes['SortOrder'] | undefined;
        position?: GraphQLTypes['SortOrder'] | undefined;
        description?: GraphQLTypes['SortOrder'] | undefined;
        parentId?: GraphQLTypes['SortOrder'] | undefined;
    };
    ['FacetFilterParameter']: {
        id?: GraphQLTypes['IDOperators'] | undefined;
        createdAt?: GraphQLTypes['DateOperators'] | undefined;
        updatedAt?: GraphQLTypes['DateOperators'] | undefined;
        languageCode?: GraphQLTypes['StringOperators'] | undefined;
        name?: GraphQLTypes['StringOperators'] | undefined;
        code?: GraphQLTypes['StringOperators'] | undefined;
    };
    ['FacetSortParameter']: {
        id?: GraphQLTypes['SortOrder'] | undefined;
        createdAt?: GraphQLTypes['SortOrder'] | undefined;
        updatedAt?: GraphQLTypes['SortOrder'] | undefined;
        name?: GraphQLTypes['SortOrder'] | undefined;
        code?: GraphQLTypes['SortOrder'] | undefined;
    };
    ['ProductFilterParameter']: {
        id?: GraphQLTypes['IDOperators'] | undefined;
        createdAt?: GraphQLTypes['DateOperators'] | undefined;
        updatedAt?: GraphQLTypes['DateOperators'] | undefined;
        languageCode?: GraphQLTypes['StringOperators'] | undefined;
        name?: GraphQLTypes['StringOperators'] | undefined;
        slug?: GraphQLTypes['StringOperators'] | undefined;
        description?: GraphQLTypes['StringOperators'] | undefined;
    };
    ['ProductSortParameter']: {
        id?: GraphQLTypes['SortOrder'] | undefined;
        createdAt?: GraphQLTypes['SortOrder'] | undefined;
        updatedAt?: GraphQLTypes['SortOrder'] | undefined;
        name?: GraphQLTypes['SortOrder'] | undefined;
        slug?: GraphQLTypes['SortOrder'] | undefined;
        description?: GraphQLTypes['SortOrder'] | undefined;
    };
    ['NativeAuthInput']: {
        username: string;
        password: string;
    };
};
export const enum AssetType {
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
    BINARY = 'BINARY',
}
export const enum GlobalFlag {
    TRUE = 'TRUE',
    FALSE = 'FALSE',
    INHERIT = 'INHERIT',
}
export const enum AdjustmentType {
    PROMOTION = 'PROMOTION',
    DISTRIBUTED_ORDER_PROMOTION = 'DISTRIBUTED_ORDER_PROMOTION',
    OTHER = 'OTHER',
}
export const enum DeletionResult {
    DELETED = 'DELETED',
    NOT_DELETED = 'NOT_DELETED',
}
/** @description
Permissions for administrators and customers. Used to control access to
GraphQL resolvers via the {@link Allow} decorator.

## Understanding Permission.Owner

`Permission.Owner` is a special permission which is used in some Vendure resolvers to indicate that that resolver should only
be accessible to the "owner" of that resource.

For example, the Shop API `activeCustomer` query resolver should only return the Customer object for the "owner" of that Customer, i.e.
based on the activeUserId of the current session. As a result, the resolver code looks like this:

@example
```TypeScript
\@Query()
\@Allow(Permission.Owner)
async activeCustomer(\@Ctx() ctx: RequestContext): Promise<Customer | undefined> {
  const userId = ctx.activeUserId;
  if (userId) {
    return this.customerService.findOneByUserId(ctx, userId);
  }
}
```

Here we can see that the "ownership" must be enforced by custom logic inside the resolver. Since "ownership" cannot be defined generally
nor statically encoded at build-time, any resolvers using `Permission.Owner` **must** include logic to enforce that only the owner
of the resource has access. If not, then it is the equivalent of using `Permission.Public`.


@docsCategory common */
export const enum Permission {
    Authenticated = 'Authenticated',
    SuperAdmin = 'SuperAdmin',
    Owner = 'Owner',
    Public = 'Public',
    UpdateGlobalSettings = 'UpdateGlobalSettings',
    CreateCatalog = 'CreateCatalog',
    ReadCatalog = 'ReadCatalog',
    UpdateCatalog = 'UpdateCatalog',
    DeleteCatalog = 'DeleteCatalog',
    CreateSettings = 'CreateSettings',
    ReadSettings = 'ReadSettings',
    UpdateSettings = 'UpdateSettings',
    DeleteSettings = 'DeleteSettings',
    CreateAdministrator = 'CreateAdministrator',
    ReadAdministrator = 'ReadAdministrator',
    UpdateAdministrator = 'UpdateAdministrator',
    DeleteAdministrator = 'DeleteAdministrator',
    CreateAsset = 'CreateAsset',
    ReadAsset = 'ReadAsset',
    UpdateAsset = 'UpdateAsset',
    DeleteAsset = 'DeleteAsset',
    CreateChannel = 'CreateChannel',
    ReadChannel = 'ReadChannel',
    UpdateChannel = 'UpdateChannel',
    DeleteChannel = 'DeleteChannel',
    CreateCollection = 'CreateCollection',
    ReadCollection = 'ReadCollection',
    UpdateCollection = 'UpdateCollection',
    DeleteCollection = 'DeleteCollection',
    CreateCountry = 'CreateCountry',
    ReadCountry = 'ReadCountry',
    UpdateCountry = 'UpdateCountry',
    DeleteCountry = 'DeleteCountry',
    CreateCustomer = 'CreateCustomer',
    ReadCustomer = 'ReadCustomer',
    UpdateCustomer = 'UpdateCustomer',
    DeleteCustomer = 'DeleteCustomer',
    CreateCustomerGroup = 'CreateCustomerGroup',
    ReadCustomerGroup = 'ReadCustomerGroup',
    UpdateCustomerGroup = 'UpdateCustomerGroup',
    DeleteCustomerGroup = 'DeleteCustomerGroup',
    CreateFacet = 'CreateFacet',
    ReadFacet = 'ReadFacet',
    UpdateFacet = 'UpdateFacet',
    DeleteFacet = 'DeleteFacet',
    CreateOrder = 'CreateOrder',
    ReadOrder = 'ReadOrder',
    UpdateOrder = 'UpdateOrder',
    DeleteOrder = 'DeleteOrder',
    CreatePaymentMethod = 'CreatePaymentMethod',
    ReadPaymentMethod = 'ReadPaymentMethod',
    UpdatePaymentMethod = 'UpdatePaymentMethod',
    DeletePaymentMethod = 'DeletePaymentMethod',
    CreateProduct = 'CreateProduct',
    ReadProduct = 'ReadProduct',
    UpdateProduct = 'UpdateProduct',
    DeleteProduct = 'DeleteProduct',
    CreatePromotion = 'CreatePromotion',
    ReadPromotion = 'ReadPromotion',
    UpdatePromotion = 'UpdatePromotion',
    DeletePromotion = 'DeletePromotion',
    CreateShippingMethod = 'CreateShippingMethod',
    ReadShippingMethod = 'ReadShippingMethod',
    UpdateShippingMethod = 'UpdateShippingMethod',
    DeleteShippingMethod = 'DeleteShippingMethod',
    CreateTag = 'CreateTag',
    ReadTag = 'ReadTag',
    UpdateTag = 'UpdateTag',
    DeleteTag = 'DeleteTag',
    CreateTaxCategory = 'CreateTaxCategory',
    ReadTaxCategory = 'ReadTaxCategory',
    UpdateTaxCategory = 'UpdateTaxCategory',
    DeleteTaxCategory = 'DeleteTaxCategory',
    CreateTaxRate = 'CreateTaxRate',
    ReadTaxRate = 'ReadTaxRate',
    UpdateTaxRate = 'UpdateTaxRate',
    DeleteTaxRate = 'DeleteTaxRate',
    CreateSeller = 'CreateSeller',
    ReadSeller = 'ReadSeller',
    UpdateSeller = 'UpdateSeller',
    DeleteSeller = 'DeleteSeller',
    CreateStockLocation = 'CreateStockLocation',
    ReadStockLocation = 'ReadStockLocation',
    UpdateStockLocation = 'UpdateStockLocation',
    DeleteStockLocation = 'DeleteStockLocation',
    CreateSystem = 'CreateSystem',
    ReadSystem = 'ReadSystem',
    UpdateSystem = 'UpdateSystem',
    DeleteSystem = 'DeleteSystem',
    CreateZone = 'CreateZone',
    ReadZone = 'ReadZone',
    UpdateZone = 'UpdateZone',
    DeleteZone = 'DeleteZone',
}
export const enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}
export const enum ErrorCode {
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    NATIVE_AUTH_STRATEGY_ERROR = 'NATIVE_AUTH_STRATEGY_ERROR',
    INVALID_CREDENTIALS_ERROR = 'INVALID_CREDENTIALS_ERROR',
    ORDER_STATE_TRANSITION_ERROR = 'ORDER_STATE_TRANSITION_ERROR',
    EMAIL_ADDRESS_CONFLICT_ERROR = 'EMAIL_ADDRESS_CONFLICT_ERROR',
    GUEST_CHECKOUT_ERROR = 'GUEST_CHECKOUT_ERROR',
    ORDER_LIMIT_ERROR = 'ORDER_LIMIT_ERROR',
    NEGATIVE_QUANTITY_ERROR = 'NEGATIVE_QUANTITY_ERROR',
    INSUFFICIENT_STOCK_ERROR = 'INSUFFICIENT_STOCK_ERROR',
    COUPON_CODE_INVALID_ERROR = 'COUPON_CODE_INVALID_ERROR',
    COUPON_CODE_EXPIRED_ERROR = 'COUPON_CODE_EXPIRED_ERROR',
    COUPON_CODE_LIMIT_ERROR = 'COUPON_CODE_LIMIT_ERROR',
    ORDER_MODIFICATION_ERROR = 'ORDER_MODIFICATION_ERROR',
    INELIGIBLE_SHIPPING_METHOD_ERROR = 'INELIGIBLE_SHIPPING_METHOD_ERROR',
    NO_ACTIVE_ORDER_ERROR = 'NO_ACTIVE_ORDER_ERROR',
    ORDER_PAYMENT_STATE_ERROR = 'ORDER_PAYMENT_STATE_ERROR',
    INELIGIBLE_PAYMENT_METHOD_ERROR = 'INELIGIBLE_PAYMENT_METHOD_ERROR',
    PAYMENT_FAILED_ERROR = 'PAYMENT_FAILED_ERROR',
    PAYMENT_DECLINED_ERROR = 'PAYMENT_DECLINED_ERROR',
    ALREADY_LOGGED_IN_ERROR = 'ALREADY_LOGGED_IN_ERROR',
    MISSING_PASSWORD_ERROR = 'MISSING_PASSWORD_ERROR',
    PASSWORD_VALIDATION_ERROR = 'PASSWORD_VALIDATION_ERROR',
    PASSWORD_ALREADY_SET_ERROR = 'PASSWORD_ALREADY_SET_ERROR',
    VERIFICATION_TOKEN_INVALID_ERROR = 'VERIFICATION_TOKEN_INVALID_ERROR',
    VERIFICATION_TOKEN_EXPIRED_ERROR = 'VERIFICATION_TOKEN_EXPIRED_ERROR',
    IDENTIFIER_CHANGE_TOKEN_INVALID_ERROR = 'IDENTIFIER_CHANGE_TOKEN_INVALID_ERROR',
    IDENTIFIER_CHANGE_TOKEN_EXPIRED_ERROR = 'IDENTIFIER_CHANGE_TOKEN_EXPIRED_ERROR',
    PASSWORD_RESET_TOKEN_INVALID_ERROR = 'PASSWORD_RESET_TOKEN_INVALID_ERROR',
    PASSWORD_RESET_TOKEN_EXPIRED_ERROR = 'PASSWORD_RESET_TOKEN_EXPIRED_ERROR',
    NOT_VERIFIED_ERROR = 'NOT_VERIFIED_ERROR',
}
export const enum LogicalOperator {
    AND = 'AND',
    OR = 'OR',
}
/** @description
ISO 4217 currency code

@docsCategory common */
export const enum CurrencyCode {
    AED = 'AED',
    AFN = 'AFN',
    ALL = 'ALL',
    AMD = 'AMD',
    ANG = 'ANG',
    AOA = 'AOA',
    ARS = 'ARS',
    AUD = 'AUD',
    AWG = 'AWG',
    AZN = 'AZN',
    BAM = 'BAM',
    BBD = 'BBD',
    BDT = 'BDT',
    BGN = 'BGN',
    BHD = 'BHD',
    BIF = 'BIF',
    BMD = 'BMD',
    BND = 'BND',
    BOB = 'BOB',
    BRL = 'BRL',
    BSD = 'BSD',
    BTN = 'BTN',
    BWP = 'BWP',
    BYN = 'BYN',
    BZD = 'BZD',
    CAD = 'CAD',
    CDF = 'CDF',
    CHF = 'CHF',
    CLP = 'CLP',
    CNY = 'CNY',
    COP = 'COP',
    CRC = 'CRC',
    CUC = 'CUC',
    CUP = 'CUP',
    CVE = 'CVE',
    CZK = 'CZK',
    DJF = 'DJF',
    DKK = 'DKK',
    DOP = 'DOP',
    DZD = 'DZD',
    EGP = 'EGP',
    ERN = 'ERN',
    ETB = 'ETB',
    EUR = 'EUR',
    FJD = 'FJD',
    FKP = 'FKP',
    GBP = 'GBP',
    GEL = 'GEL',
    GHS = 'GHS',
    GIP = 'GIP',
    GMD = 'GMD',
    GNF = 'GNF',
    GTQ = 'GTQ',
    GYD = 'GYD',
    HKD = 'HKD',
    HNL = 'HNL',
    HRK = 'HRK',
    HTG = 'HTG',
    HUF = 'HUF',
    IDR = 'IDR',
    ILS = 'ILS',
    INR = 'INR',
    IQD = 'IQD',
    IRR = 'IRR',
    ISK = 'ISK',
    JMD = 'JMD',
    JOD = 'JOD',
    JPY = 'JPY',
    KES = 'KES',
    KGS = 'KGS',
    KHR = 'KHR',
    KMF = 'KMF',
    KPW = 'KPW',
    KRW = 'KRW',
    KWD = 'KWD',
    KYD = 'KYD',
    KZT = 'KZT',
    LAK = 'LAK',
    LBP = 'LBP',
    LKR = 'LKR',
    LRD = 'LRD',
    LSL = 'LSL',
    LYD = 'LYD',
    MAD = 'MAD',
    MDL = 'MDL',
    MGA = 'MGA',
    MKD = 'MKD',
    MMK = 'MMK',
    MNT = 'MNT',
    MOP = 'MOP',
    MRU = 'MRU',
    MUR = 'MUR',
    MVR = 'MVR',
    MWK = 'MWK',
    MXN = 'MXN',
    MYR = 'MYR',
    MZN = 'MZN',
    NAD = 'NAD',
    NGN = 'NGN',
    NIO = 'NIO',
    NOK = 'NOK',
    NPR = 'NPR',
    NZD = 'NZD',
    OMR = 'OMR',
    PAB = 'PAB',
    PEN = 'PEN',
    PGK = 'PGK',
    PHP = 'PHP',
    PKR = 'PKR',
    PLN = 'PLN',
    PYG = 'PYG',
    QAR = 'QAR',
    RON = 'RON',
    RSD = 'RSD',
    RUB = 'RUB',
    RWF = 'RWF',
    SAR = 'SAR',
    SBD = 'SBD',
    SCR = 'SCR',
    SDG = 'SDG',
    SEK = 'SEK',
    SGD = 'SGD',
    SHP = 'SHP',
    SLL = 'SLL',
    SOS = 'SOS',
    SRD = 'SRD',
    SSP = 'SSP',
    STN = 'STN',
    SVC = 'SVC',
    SYP = 'SYP',
    SZL = 'SZL',
    THB = 'THB',
    TJS = 'TJS',
    TMT = 'TMT',
    TND = 'TND',
    TOP = 'TOP',
    TRY = 'TRY',
    TTD = 'TTD',
    TWD = 'TWD',
    TZS = 'TZS',
    UAH = 'UAH',
    UGX = 'UGX',
    USD = 'USD',
    UYU = 'UYU',
    UZS = 'UZS',
    VES = 'VES',
    VND = 'VND',
    VUV = 'VUV',
    WST = 'WST',
    XAF = 'XAF',
    XCD = 'XCD',
    XOF = 'XOF',
    XPF = 'XPF',
    YER = 'YER',
    ZAR = 'ZAR',
    ZMW = 'ZMW',
    ZWL = 'ZWL',
}
export const enum HistoryEntryType {
    CUSTOMER_REGISTERED = 'CUSTOMER_REGISTERED',
    CUSTOMER_VERIFIED = 'CUSTOMER_VERIFIED',
    CUSTOMER_DETAIL_UPDATED = 'CUSTOMER_DETAIL_UPDATED',
    CUSTOMER_ADDED_TO_GROUP = 'CUSTOMER_ADDED_TO_GROUP',
    CUSTOMER_REMOVED_FROM_GROUP = 'CUSTOMER_REMOVED_FROM_GROUP',
    CUSTOMER_ADDRESS_CREATED = 'CUSTOMER_ADDRESS_CREATED',
    CUSTOMER_ADDRESS_UPDATED = 'CUSTOMER_ADDRESS_UPDATED',
    CUSTOMER_ADDRESS_DELETED = 'CUSTOMER_ADDRESS_DELETED',
    CUSTOMER_PASSWORD_UPDATED = 'CUSTOMER_PASSWORD_UPDATED',
    CUSTOMER_PASSWORD_RESET_REQUESTED = 'CUSTOMER_PASSWORD_RESET_REQUESTED',
    CUSTOMER_PASSWORD_RESET_VERIFIED = 'CUSTOMER_PASSWORD_RESET_VERIFIED',
    CUSTOMER_EMAIL_UPDATE_REQUESTED = 'CUSTOMER_EMAIL_UPDATE_REQUESTED',
    CUSTOMER_EMAIL_UPDATE_VERIFIED = 'CUSTOMER_EMAIL_UPDATE_VERIFIED',
    CUSTOMER_NOTE = 'CUSTOMER_NOTE',
    ORDER_STATE_TRANSITION = 'ORDER_STATE_TRANSITION',
    ORDER_PAYMENT_TRANSITION = 'ORDER_PAYMENT_TRANSITION',
    ORDER_FULFILLMENT = 'ORDER_FULFILLMENT',
    ORDER_CANCELLATION = 'ORDER_CANCELLATION',
    ORDER_REFUND_TRANSITION = 'ORDER_REFUND_TRANSITION',
    ORDER_FULFILLMENT_TRANSITION = 'ORDER_FULFILLMENT_TRANSITION',
    ORDER_NOTE = 'ORDER_NOTE',
    ORDER_COUPON_APPLIED = 'ORDER_COUPON_APPLIED',
    ORDER_COUPON_REMOVED = 'ORDER_COUPON_REMOVED',
    ORDER_MODIFIED = 'ORDER_MODIFIED',
}
/** @description
Languages in the form of a ISO 639-1 language code with optional
region or script modifier (e.g. de_AT). The selection available is based
on the [Unicode CLDR summary list](https://unicode-org.github.io/cldr-staging/charts/37/summary/root.html)
and includes the major spoken languages of the world and any widely-used variants.

@docsCategory common */
export const enum LanguageCode {
    af = 'af',
    ak = 'ak',
    sq = 'sq',
    am = 'am',
    ar = 'ar',
    hy = 'hy',
    as = 'as',
    az = 'az',
    bm = 'bm',
    bn = 'bn',
    eu = 'eu',
    be = 'be',
    bs = 'bs',
    br = 'br',
    bg = 'bg',
    my = 'my',
    ca = 'ca',
    ce = 'ce',
    zh = 'zh',
    zh_Hans = 'zh_Hans',
    zh_Hant = 'zh_Hant',
    cu = 'cu',
    kw = 'kw',
    co = 'co',
    hr = 'hr',
    cs = 'cs',
    da = 'da',
    nl = 'nl',
    nl_BE = 'nl_BE',
    dz = 'dz',
    en = 'en',
    en_AU = 'en_AU',
    en_CA = 'en_CA',
    en_GB = 'en_GB',
    en_US = 'en_US',
    eo = 'eo',
    et = 'et',
    ee = 'ee',
    fo = 'fo',
    fi = 'fi',
    fr = 'fr',
    fr_CA = 'fr_CA',
    fr_CH = 'fr_CH',
    ff = 'ff',
    gl = 'gl',
    lg = 'lg',
    ka = 'ka',
    de = 'de',
    de_AT = 'de_AT',
    de_CH = 'de_CH',
    el = 'el',
    gu = 'gu',
    ht = 'ht',
    ha = 'ha',
    he = 'he',
    hi = 'hi',
    hu = 'hu',
    is = 'is',
    ig = 'ig',
    id = 'id',
    ia = 'ia',
    ga = 'ga',
    it = 'it',
    ja = 'ja',
    jv = 'jv',
    kl = 'kl',
    kn = 'kn',
    ks = 'ks',
    kk = 'kk',
    km = 'km',
    ki = 'ki',
    rw = 'rw',
    ko = 'ko',
    ku = 'ku',
    ky = 'ky',
    lo = 'lo',
    la = 'la',
    lv = 'lv',
    ln = 'ln',
    lt = 'lt',
    lu = 'lu',
    lb = 'lb',
    mk = 'mk',
    mg = 'mg',
    ms = 'ms',
    ml = 'ml',
    mt = 'mt',
    gv = 'gv',
    mi = 'mi',
    mr = 'mr',
    mn = 'mn',
    ne = 'ne',
    nd = 'nd',
    se = 'se',
    nb = 'nb',
    nn = 'nn',
    ny = 'ny',
    or = 'or',
    om = 'om',
    os = 'os',
    ps = 'ps',
    fa = 'fa',
    fa_AF = 'fa_AF',
    pl = 'pl',
    pt = 'pt',
    pt_BR = 'pt_BR',
    pt_PT = 'pt_PT',
    pa = 'pa',
    qu = 'qu',
    ro = 'ro',
    ro_MD = 'ro_MD',
    rm = 'rm',
    rn = 'rn',
    ru = 'ru',
    sm = 'sm',
    sg = 'sg',
    sa = 'sa',
    gd = 'gd',
    sr = 'sr',
    sn = 'sn',
    ii = 'ii',
    sd = 'sd',
    si = 'si',
    sk = 'sk',
    sl = 'sl',
    so = 'so',
    st = 'st',
    es = 'es',
    es_ES = 'es_ES',
    es_MX = 'es_MX',
    su = 'su',
    sw = 'sw',
    sw_CD = 'sw_CD',
    sv = 'sv',
    tg = 'tg',
    ta = 'ta',
    tt = 'tt',
    te = 'te',
    th = 'th',
    bo = 'bo',
    ti = 'ti',
    to = 'to',
    tr = 'tr',
    tk = 'tk',
    uk = 'uk',
    ur = 'ur',
    ug = 'ug',
    uz = 'uz',
    vi = 'vi',
    vo = 'vo',
    cy = 'cy',
    fy = 'fy',
    wo = 'wo',
    xh = 'xh',
    yi = 'yi',
    yo = 'yo',
    zu = 'zu',
}
export const enum OrderType {
    Regular = 'Regular',
    Seller = 'Seller',
    Aggregate = 'Aggregate',
}

type ZEUS_VARIABLES = {
    ['AssetType']: ValueTypes['AssetType'];
    ['GlobalFlag']: ValueTypes['GlobalFlag'];
    ['AdjustmentType']: ValueTypes['AdjustmentType'];
    ['DeletionResult']: ValueTypes['DeletionResult'];
    ['Permission']: ValueTypes['Permission'];
    ['SortOrder']: ValueTypes['SortOrder'];
    ['ErrorCode']: ValueTypes['ErrorCode'];
    ['LogicalOperator']: ValueTypes['LogicalOperator'];
    ['JSON']: ValueTypes['JSON'];
    ['DateTime']: ValueTypes['DateTime'];
    ['Upload']: ValueTypes['Upload'];
    ['Money']: ValueTypes['Money'];
    ['ConfigArgInput']: ValueTypes['ConfigArgInput'];
    ['ConfigurableOperationInput']: ValueTypes['ConfigurableOperationInput'];
    ['StringOperators']: ValueTypes['StringOperators'];
    ['IDOperators']: ValueTypes['IDOperators'];
    ['BooleanOperators']: ValueTypes['BooleanOperators'];
    ['NumberRange']: ValueTypes['NumberRange'];
    ['NumberOperators']: ValueTypes['NumberOperators'];
    ['DateRange']: ValueTypes['DateRange'];
    ['DateOperators']: ValueTypes['DateOperators'];
    ['StringListOperators']: ValueTypes['StringListOperators'];
    ['NumberListOperators']: ValueTypes['NumberListOperators'];
    ['BooleanListOperators']: ValueTypes['BooleanListOperators'];
    ['IDListOperators']: ValueTypes['IDListOperators'];
    ['DateListOperators']: ValueTypes['DateListOperators'];
    ['FacetValueFilterInput']: ValueTypes['FacetValueFilterInput'];
    ['SearchInput']: ValueTypes['SearchInput'];
    ['SearchResultSortParameter']: ValueTypes['SearchResultSortParameter'];
    ['CreateCustomerInput']: ValueTypes['CreateCustomerInput'];
    ['CreateAddressInput']: ValueTypes['CreateAddressInput'];
    ['UpdateAddressInput']: ValueTypes['UpdateAddressInput'];
    ['CurrencyCode']: ValueTypes['CurrencyCode'];
    ['CustomerListOptions']: ValueTypes['CustomerListOptions'];
    ['FacetValueListOptions']: ValueTypes['FacetValueListOptions'];
    ['HistoryEntryType']: ValueTypes['HistoryEntryType'];
    ['HistoryEntryListOptions']: ValueTypes['HistoryEntryListOptions'];
    ['LanguageCode']: ValueTypes['LanguageCode'];
    ['OrderType']: ValueTypes['OrderType'];
    ['AuthenticationInput']: ValueTypes['AuthenticationInput'];
    ['RegisterCustomerInput']: ValueTypes['RegisterCustomerInput'];
    ['UpdateCustomerInput']: ValueTypes['UpdateCustomerInput'];
    ['UpdateOrderInput']: ValueTypes['UpdateOrderInput'];
    ['PaymentInput']: ValueTypes['PaymentInput'];
    ['CollectionListOptions']: ValueTypes['CollectionListOptions'];
    ['FacetListOptions']: ValueTypes['FacetListOptions'];
    ['OrderListOptions']: ValueTypes['OrderListOptions'];
    ['ProductListOptions']: ValueTypes['ProductListOptions'];
    ['ProductVariantListOptions']: ValueTypes['ProductVariantListOptions'];
    ['ProductVariantFilterParameter']: ValueTypes['ProductVariantFilterParameter'];
    ['ProductVariantSortParameter']: ValueTypes['ProductVariantSortParameter'];
    ['CustomerFilterParameter']: ValueTypes['CustomerFilterParameter'];
    ['CustomerSortParameter']: ValueTypes['CustomerSortParameter'];
    ['OrderFilterParameter']: ValueTypes['OrderFilterParameter'];
    ['OrderSortParameter']: ValueTypes['OrderSortParameter'];
    ['FacetValueFilterParameter']: ValueTypes['FacetValueFilterParameter'];
    ['FacetValueSortParameter']: ValueTypes['FacetValueSortParameter'];
    ['HistoryEntryFilterParameter']: ValueTypes['HistoryEntryFilterParameter'];
    ['HistoryEntrySortParameter']: ValueTypes['HistoryEntrySortParameter'];
    ['CollectionFilterParameter']: ValueTypes['CollectionFilterParameter'];
    ['CollectionSortParameter']: ValueTypes['CollectionSortParameter'];
    ['FacetFilterParameter']: ValueTypes['FacetFilterParameter'];
    ['FacetSortParameter']: ValueTypes['FacetSortParameter'];
    ['ProductFilterParameter']: ValueTypes['ProductFilterParameter'];
    ['ProductSortParameter']: ValueTypes['ProductSortParameter'];
    ['NativeAuthInput']: ValueTypes['NativeAuthInput'];
};
