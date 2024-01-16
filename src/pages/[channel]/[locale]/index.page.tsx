import React from 'react';
import type { InferGetStaticPropsType } from 'next';

import { Home } from '@/src/components/pages/home';
import { getStaticProps } from '@/src/components/pages/home/props';
import { getStaticPaths } from '@/src/lib/getStatic';

const Page: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => <Home {...props} />;

export { getStaticPaths, getStaticProps };
export default Page;
