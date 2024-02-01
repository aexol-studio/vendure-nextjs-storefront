import React from 'react';
import type { InferGetStaticPropsType } from 'next';
import { About } from '@/src/components/pages/about';
import { getStaticProps } from '@/src/components/pages/home/props';
import { getStaticPaths } from '@/src/lib/getStatic';

const Page: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => <About {...props} />;

export { getStaticPaths, getStaticProps };
export default Page;
