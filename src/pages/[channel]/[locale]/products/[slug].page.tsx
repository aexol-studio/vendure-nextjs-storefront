import React from 'react';
import { InferGetStaticPropsType } from 'next';

import { getStaticProps } from '@/src/components/pages/products/props';
import { ProductPage } from '@/src/components/pages/products';
import { getStaticPaths } from '@/src/components/pages/products/paths';

const Page: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => <ProductPage {...props} />;

export { getStaticPaths, getStaticProps };
export default Page;
