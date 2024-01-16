import React from 'react';
import { InferGetServerSidePropsType } from 'next';

import { ForgotPasswordPage } from '@/src/components/pages/customer/forgot-password';
import { getServerSideProps } from '@/src/components/pages/customer/forgot-password/props';

const Page: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => (
    <ForgotPasswordPage {...props} />
);

export { getServerSideProps };
export default Page;
