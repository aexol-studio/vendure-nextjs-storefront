import { InferGetServerSidePropsType } from 'next';
import React from 'react';
import { getServerSideProps } from '@/src/components/pages/checkout/props';
import CheckoutPage from '@/src/pages/[channel]/checkout/index.page';

export const Page: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => (
    <CheckoutPage {...props} />
);

export { getServerSideProps };
export default Page;
