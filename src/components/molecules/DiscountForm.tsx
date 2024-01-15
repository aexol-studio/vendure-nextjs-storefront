import React, { useState } from 'react';
import { TagIcon } from 'lucide-react';
import styled from '@emotion/styled';
import { z } from 'zod';
import { useTranslation } from 'next-i18next';
import { FormError } from '@/src/components/forms';
import { Stack } from '@/src/components/atoms';

export const DiscountForm = ({ applyCouponCode }: { applyCouponCode: (code: string) => Promise<boolean> }) => {
    const { t } = useTranslation('common');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>();
    const schema = z.object({ code: z.string().min(1, t('discounts-errors.enter-code')) });
    const submitCode = async () => {
        if (!code || loading) return;
        setError(undefined);
        setLoading(true);
        try {
            const parsed = schema.safeParse({ code });
            if (!parsed.success) {
                setError(parsed.error.issues[0].message);
                setLoading(false);
                return;
            }
        } catch (e) {
            setCode('');
            setError(t('discounts-errors.something-went-wrong'));
            setLoading(false);
            return;
        }

        try {
            const success = await applyCouponCode(code);
            if (success) {
                setCode('');
                setError(undefined);
                setLoading(false);
            } else {
                setError(t('discounts-errors.coupon-code-invalid'));
                setLoading(false);
            }
        } catch (e) {
            setCode('');
            setError(t('discounts-errors.something-went-wrong'));
            setLoading(false);
        }
    };

    return (
        <Stack w100 column gap="0.25rem">
            <FakeForm>
                <Input
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            submitCode();
                        }
                    }}
                    placeholder={t('coupon-code')}
                />
                <Button type="button" disabled={loading} onClick={submitCode}>
                    <TagIcon size={24} />
                </Button>
            </FakeForm>
            <FormError
                style={{ margin: 0 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: error ? 1 : 0 }}
                transition={{ duration: 0.2 }}>
                {error}
            </FormError>
        </Stack>
    );
};

const Button = styled.button`
    appearance: none;
    border: none;
    background: transparent;

    display: flex;
    align-items: center;
    justify-content: center;
`;

const Input = styled.input`
    appearance: none;
    border: none;
    outline: none;
    background: transparent;

    width: calc(100% - 3.2rem);
    height: 100%;

    font-size: 1.6rem;
`;

const FakeForm = styled(Stack)`
    width: 100%;
    position: relative;

    padding: 1rem;

    display: flex;
    align-items: center;
    gap: 1.6rem;

    border-radius: 2px;
    border: 1px solid ${p => p.theme.gray(100)};
`;
