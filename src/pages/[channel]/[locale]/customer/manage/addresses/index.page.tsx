import React from 'react';
import { InferGetServerSidePropsType } from 'next';

import { AddressesPage } from '@/src/components/pages/customer/manage/addresses';
import { getServerSideProps } from '@/src/components/pages/customer/manage/addresses/props';

const Page: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => <AddressesPage {...props} />;

export { getServerSideProps };
export default Page;
