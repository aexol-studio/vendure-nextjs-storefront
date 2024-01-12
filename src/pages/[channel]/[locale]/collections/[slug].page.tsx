import CollectionPage from '@/src/components/pages/collections';
import { getStaticPaths } from '@/src/components/pages/collections/paths';
import { getStaticProps } from '@/src/components/pages/collections/props';

import { InferGetStaticPropsType } from 'next';
import React from 'react';

const Page: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => <CollectionPage {...props} />;

export { getStaticPaths, getStaticProps };
export default Page;
