import React from 'react';
import { InferGetStaticPropsType } from 'next';

import { SignInPage } from '@/src/components/pages/customer/sign-in';
import { getStaticProps } from '@/src/components/pages/customer/sign-in/props';
import { getStaticPaths } from '@/src/lib/getStatic';

const Page: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => <SignInPage {...props} />;

export { getStaticPaths, getStaticProps };
export default Page;
