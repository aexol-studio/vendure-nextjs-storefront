import Page, { getServerSideProps } from '@/src/pages/[channel]/customer/manage/addresses/index.page';
import { Redirect } from '@/src/lib/redirect';
import React from 'react';
import type { InferGetServerSidePropsType } from 'next';

export default (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    return Redirect({ children: <Page {...props} /> })();
};

export { getServerSideProps };
