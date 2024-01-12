import { InferGetServerSidePropsType } from 'next';
import React from 'react';
import { getServerSideProps } from '@/src/components/pages/checkout/props';
import { CheckoutPage } from '@/src/components/pages/checkout';

export const Page: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => (
    <CheckoutPage {...props} />
);

export { getServerSideProps };
export default Page;
