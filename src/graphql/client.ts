import { GraphQLError, GraphQLResponse, Thunder, ZeusScalars, chainOptions, fetchOptions } from '@/src/zeus';
import { GetServerSidePropsContext } from 'next';

let token: string | null = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;

export const scalars = ZeusScalars({
    Money: {
        decode: e => e as number,
    },
    JSON: {
        encode: (e: unknown) => JSON.stringify(e),
        decode: (e: unknown) => JSON.parse(e as string),
    },
    DateTime: {
        decode: (e: unknown) => new Date(e as string).toISOString(),
        encode: (e: unknown) => (e as Date).toISOString(),
    },
});

export const DEFAULT_LANGUAGE = 'en';
export const DEFAULT_CHANNEL = 'default-channel';
//use 'http://localhost:3000/shop-api/' in local .env file for localhost development and provide env to use on prod/dev envs

export const VENDURE_HOST = `${
    process.env.NEXT_PUBLIC_VENDURE_HOST || 'https://vendure-dev.aexol.com'
}/shop-api?languageCode=${DEFAULT_LANGUAGE}`;

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

export const storefrontApiQuery = VendureChain(VENDURE_HOST, {
    headers: {
        'Content-Type': 'application/json',
        'vendure-token': DEFAULT_CHANNEL,
    },
})('query', {
    scalars,
});
export const storefrontApiMutation = VendureChain(VENDURE_HOST, {
    headers: {
        'Content-Type': 'application/json',
        'vendure-token': DEFAULT_CHANNEL,
    },
})('mutation', {
    scalars,
});

export const SSRQuery = (context: GetServerSidePropsContext) => {
    const authCookies = {
        session: context.req.cookies['session'],
        'session.sig': context.req.cookies['session.sig'],
    };
    return VendureChain(VENDURE_HOST, {
        headers: {
            Cookie: `session=${authCookies['session']}; session.sig=${authCookies['session.sig']}`,
            'Content-Type': 'application/json',
            'vendure-token': DEFAULT_CHANNEL,
        },
    })('query', {
        scalars,
    });
};

export const SSRMutation = (context: GetServerSidePropsContext) => {
    const authCookies = {
        session: context.req.cookies['session'],
        'session.sig': context.req.cookies['session.sig'],
    };
    return VendureChain(VENDURE_HOST, {
        headers: {
            Cookie: `session=${authCookies['session']}; session.sig=${authCookies['session.sig']}`,
            'Content-Type': 'application/json',
            'vendure-token': DEFAULT_CHANNEL,
        },
    })('mutation', {
        scalars,
    });
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
