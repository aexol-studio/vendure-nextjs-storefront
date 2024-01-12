import { InferGetServerSidePropsType } from 'next';
import React from 'react';

import { SearchPage } from '@/src/components/pages/search';
import { getServerSideProps } from '@/src/components/pages/search/props';

const Page: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => <SearchPage {...props} />;

export { getServerSideProps };
export default Page;
