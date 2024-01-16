import React from 'react';
import { InferGetServerSidePropsType } from 'next';

import { HistoryPage } from '@/src/components/pages/customer/manage/orders';
import { getServerSideProps } from '@/src/components/pages/customer/manage/orders/props';

const Page: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => <HistoryPage {...props} />;
export { getServerSideProps };
export default Page;
