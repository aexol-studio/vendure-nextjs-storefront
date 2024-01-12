import React from 'react';
import { InferGetStaticPropsType } from 'next';

import { ForgotPasswordPage } from '@/src/components/pages/customer/forgot-password';
import { getStaticProps } from '@/src/components/pages/customer/forgot-password/props';
import { getStaticPaths } from '@/src/lib/getStatic';

const Page: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => <ForgotPasswordPage {...props} />;

export { getStaticPaths, getStaticProps };
export default Page;
