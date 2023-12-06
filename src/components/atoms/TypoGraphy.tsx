import { BaseRemUnit } from '@/src/components/sharedStyles';
import styled from '@emotion/styled';

type BaseProps = {
    size: BaseRemUnit;
    weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
};

export const TypoGraphy = styled.div<BaseProps>`
    font-size: ${p => p.size};
    font-weight: ${p => p.weight};
`;

type TypoGraphyProps = Partial<Parameters<typeof TypoGraphy>[0]>;

export const TH1 = (props: TypoGraphyProps) => <TypoGraphy size="4rem" weight={900} as="h1" {...props} />;
export const TH2 = (props: TypoGraphyProps) => <TypoGraphy size="3rem" weight={800} as="h2" {...props} />;
export const TP = (props: TypoGraphyProps) => <TypoGraphy size="1.5rem" weight={500} as="p" {...props} />;
export const TPriceBig = (props: TypoGraphyProps) => <TypoGraphy size="2.5rem" weight={700} as="p" {...props} />;
export const TFacetHeading = (props: TypoGraphyProps) => <TypoGraphy size="1.5rem" weight={800} as="div" {...props} />;
