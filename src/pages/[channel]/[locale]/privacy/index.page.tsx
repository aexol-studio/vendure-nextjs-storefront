import React from 'react';
import type { InferGetStaticPropsType } from 'next';
import { Privacy } from '@/src/components/pages/privacy';
import { getStaticProps } from '@/src/components/pages/home/props';
import { getStaticPaths } from '@/src/lib/getStatic';

const Page: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => <Privacy {...props} />;

export { getStaticPaths, getStaticProps };
export default Page;
