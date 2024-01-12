import React from 'react';
import { InferGetServerSidePropsType } from 'next';

import { ResetPasswordPage } from '@/src/components/pages/customer/reset-password';
import { getServerSideProps } from '@/src/components/pages/customer/reset-password/props';

const Page: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => (
    <ResetPasswordPage {...props} />
);
export { getServerSideProps };
export default Page;
