import React from 'react';
import { InferGetServerSidePropsType } from 'next';

import { SignUpPage } from '@/src/components/pages/customer/sign-up';
import { getServerSideProps } from '@/src/components/pages/customer/sign-up/props';

const Page: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => <SignUpPage {...props} />;

export { getServerSideProps };
export default Page;
