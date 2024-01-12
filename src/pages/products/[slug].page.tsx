import Page from '@/src/pages/[channel]/products/[slug].page';
import { Redirect } from '@/src/lib/redirect';
import React from 'react';
import type { InferGetStaticPropsType } from 'next';
import { getStaticProps } from '@/src/components/pages/products/props';
import { getStaticPaths } from '@/src/components/pages/products/paths';

export default (props: InferGetStaticPropsType<typeof getStaticProps>) => {
    return Redirect({ children: <Page {...props} /> })();
};

export { getStaticProps, getStaticPaths };
