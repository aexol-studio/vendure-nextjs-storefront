import { Stack } from '@/src/components/atoms/Stack';
import { TypoGraphy } from '@/src/components/atoms/TypoGraphy';
import React, { Fragment } from 'react';

const steps = [{ name: 'shipping' }, { name: 'payment' }, { name: 'confirmation' }];
export const CheckoutStatus: React.FC<{ step: 'shipping' | 'payment' | 'confirmation' }> = ({ step }) => {
    return (
        <Stack style={{ userSelect: 'none' }}>
            {steps.map(({ name }, index) => {
                return (
                    <Fragment key={name}>
                        <Stack>
                            <Stack column itemsCenter>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '100%',
                                        background: step === name ? '#0D6EF9' : '#000',
                                        color: '#fff',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                    }}>
                                    {index + 1}
                                </div>
                                <TypoGraphy style={{ textTransform: 'capitalize' }} size="2rem" weight={500}>
                                    {name}
                                </TypoGraphy>
                            </Stack>
                        </Stack>
                        {index !== steps.length - 1 && <TypoGraphy size="2rem" weight={500}>{`>`}</TypoGraphy>}
                    </Fragment>
                );
            })}
        </Stack>
    );
};
