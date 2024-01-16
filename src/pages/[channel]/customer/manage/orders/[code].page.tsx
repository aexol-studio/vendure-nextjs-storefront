import React from 'react';
import { InferGetServerSidePropsType } from 'next';

import { OrderPage } from '@/src/components/pages/customer/manage/orders/order';
import { getServerSideProps } from '@/src/components/pages/customer/manage/orders/order/props';

const Page: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => <OrderPage {...props} />;

export { getServerSideProps };
export default Page;
