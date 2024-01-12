import React from 'react';
import { InferGetStaticPropsType } from 'next';

import { SignUpPage } from '@/src/components/pages/customer/sign-up';
import { getStaticProps } from '@/src/components/pages/customer/sign-up/props';
import { getStaticPaths } from '@/src/lib/getStatic';

const Page: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => <SignUpPage {...props} />;
export { getStaticPaths, getStaticProps };
export default Page;
