import React from 'react';
import { InferGetServerSidePropsType } from 'next';

import { PaymentPage } from '@/src/components/pages/checkout/payment';
import { getServerSideProps } from '@/src/components/pages/checkout/payment/props';

const Page: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = props => <PaymentPage {...props} />;
export { getServerSideProps };

export default Page;
