import React from 'react';
import type { InferGetStaticPropsType } from 'next';
import { Terms } from '@/src/components/pages/terms';
import { getStaticProps } from '@/src/components/pages/home/props';
import { getStaticPaths } from '@/src/lib/getStatic';

const Page: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => <Terms {...props} />;

export { getStaticPaths, getStaticProps };
export default Page;
