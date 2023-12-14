import { thv } from '@/src/theme';
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
        background-color: ${thv.background.main};
        border: 1px solid ${thv.text.main};
        border-radius: ${p => p.theme.borderRadius};
        color: ${thv.text.main};
        cursor: pointer;
        font-size: 1.25rem;
        max-width: 100%;
        min-width: 30rem;
        display: flex;
        height: 4.8rem;
        padding: 1.2rem 1.6rem;
    }
`;
