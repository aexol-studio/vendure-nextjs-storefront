import React from 'react';
import { InferGetServerSidePropsType } from 'next';

import { SignInPage } from '@/src/components/pages/customer/sign-in';
import { getServerSideProps } from '@/src/components/pages/customer/sign-in/props';

const Page: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => <SignInPage {...props} />;

export { getServerSideProps };
export default Page;
