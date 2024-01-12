import { InferGetServerSidePropsType } from 'next';
import React from 'react';

import { VerifyPage } from '@/src/components/pages/customer/verify';
import { getServerSideProps } from '@/src/components/pages/customer/verify/props';

const Page: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => <VerifyPage {...props} />;

export { getServerSideProps };
export default Page;
