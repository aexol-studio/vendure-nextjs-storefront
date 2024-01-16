import React from 'react';
import { InferGetServerSidePropsType } from 'next';

import { ConfirmationPage } from '@/src/components/pages/checkout/confirmation';
import { getServerSideProps } from '@/src/components/pages/checkout/confirmation/props';

const Page: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => <ConfirmationPage {...props} />;

export default Page;
export { getServerSideProps };
