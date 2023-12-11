import styled from '@emotion/styled';
import { useTranslation } from 'next-i18next';

export function Select<T extends string | number>({
    options,
    value,
    setValue,
}: {
    options?: Array<{
        label: string;
        value: T;
    }>;
    value?: T;
    setValue: (v: T) => void;
}) {
    const { t } = useTranslation('common');
    return (
        <Main>
            <select
                value={value || ''}
                placeholder={t('select-category')}
                onChange={e => {
                    setValue(e.target.value as T);
                }}>
                <option value="" disabled>
                    Select your option
                </option>
                {options?.map(o => (
                    <option value={o.value} key={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </Main>
    );
}

const Main = styled.div`
    min-width: 20rem;
    select {
        appearance: none;
        /* safari */
        -webkit-appearance: none;
        /* other styles for aesthetics */
        width: 100%;
        font-size: 1.15rem;
        padding: 0.675rem 6rem 0.675rem 1rem;
        background-color: #fff;
        border: 1px solid #caced1;
        border-radius: 0.25rem;
        color: #000;
        cursor: pointer;
    }
`;
