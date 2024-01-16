import React from 'react';
import { InferGetServerSidePropsType } from 'next';

import { ManageAccountPage } from '@/src/components/pages/customer/manage';
import { getServerSideProps } from '@/src/components/pages/customer/manage/props';

const Page: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => (
    <ManageAccountPage {...props} />
);

export { getServerSideProps };
export default Page;
