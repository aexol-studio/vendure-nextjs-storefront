import { GraphQLError, GraphQLResponse, Thunder, ZeusScalars, chainOptions, fetchOptions } from '@/src/zeus';
import { GetServerSidePropsContext } from 'next';
import { getContext } from '@/src/lib/utils';

let token: string | null = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;

export const scalars = ZeusScalars({
    Money: {
        decode: e => e as number,
    },
    JSON: {
        encode: (e: unknown) => JSON.stringify(JSON.stringify(e)),
        decode: (e: unknown) => JSON.parse(e as string),
    },
    DateTime: {
        decode: (e: unknown) => new Date(e as string).toISOString(),
        encode: (e: unknown) => (e as Date).toISOString(),
    },
});

//use 'http://localhost:3000/shop-api/' in local .env file for localhost development and provide env to use on prod/dev envs

export const VENDURE_HOST = `${process.env.NEXT_PUBLIC_HOST || 'https://vendure-dev.aexol.com'}/shop-api`;

const apiFetchVendure =
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
        const additionalHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        return fetch(`${options[0]}`, {
            body: JSON.stringify({ query, variables }),
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...additionalHeaders,
            },
            ...fetchOptions,
        })
            .then(r => {
                const authToken = r.headers.get('vendure-auth-token');
                if (authToken != null) {
                    token = authToken;
                }
                return handleFetchResponse(r);
            })
            .then((response: GraphQLResponse) => {
                if (response.errors) {
                    throw new GraphQLError(response);
                }
                return response.data;
            });
    };

export const VendureChain = (...options: chainOptions) => Thunder(apiFetchVendure(options));

export const storefrontApiQuery = (ctx: { locale: string; channel: string }) => {
    const HOST = `${VENDURE_HOST}?languageCode=${ctx.locale}`;

    return VendureChain(HOST, {
        headers: {
            'Content-Type': 'application/json',
            'vendure-token': ctx.channel,
        },
    })('query', { scalars });
};

export const storefrontApiMutation = (ctx: { locale: string; channel: string }) => {
    const HOST = `${VENDURE_HOST}?languageCode=${ctx.locale}`;

    return VendureChain(HOST, {
        headers: {
            'Content-Type': 'application/json',
            'vendure-token': ctx.channel,
        },
    })('mutation', { scalars });
};

export const SSGQuery = (params: { locale: string; channel: string }) => {
    const reqParams = {
        locale: params?.locale as string,
        channel: params?.channel as string,
    };

    const HOST = `${VENDURE_HOST}?languageCode=${reqParams.locale}`;
    return VendureChain(HOST, {
        headers: {
            'Content-Type': 'application/json',
            'vendure-token': reqParams.channel,
        },
    })('query', { scalars });
};

export const SSRQuery = (context: GetServerSidePropsContext) => {
    const authCookies = {
        session: context.req.cookies['session'],
        'session.sig': context.req.cookies['session.sig'],
    };

    const ctx = getContext(context);
    const properChannel = ctx?.params?.channel as string;
    const locale = ctx?.params?.locale as string;

    const HOST = `${VENDURE_HOST}?languageCode=${locale}`;
    return VendureChain(HOST, {
        headers: {
            Cookie: `session=${authCookies['session']}; session.sig=${authCookies['session.sig']}`,
            'Content-Type': 'application/json',
            'vendure-token': properChannel,
        },
    })('query', { scalars });
};

export const SSRMutation = (context: GetServerSidePropsContext) => {
    const authCookies = {
        session: context.req.cookies['session'],
        'session.sig': context.req.cookies['session.sig'],
    };

    const ctx = getContext(context);
    const properChannel = ctx?.params?.channel as string;
    const locale = ctx?.params?.locale as string;

    const HOST = `${VENDURE_HOST}?languageCode=${locale}`;
    return VendureChain(HOST, {
        headers: {
            Cookie: `session=${authCookies['session']}; session.sig=${authCookies['session.sig']}`,
            'Content-Type': 'application/json',
            'vendure-token': properChannel,
        },
    })('mutation', { scalars });
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
