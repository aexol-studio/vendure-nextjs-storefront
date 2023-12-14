import { BaseFlexParams } from '@/src/components/sharedStyles';
import styled from '@emotion/styled';

export const Stack = styled.div<BaseFlexParams>`
    gap: ${p => p.gap || 0};
    display: flex;
    flex-direction: ${p => (p.column ? (p.reverse ? 'column-reverse' : 'column') : p.reverse ? 'row-reverse' : 'row')};
    flex-wrap: ${p => (p.flexWrap ? 'wrap' : 'nowrap')};
    justify-content: ${p =>
        p.justifyBetween ? 'space-between' : p.justifyCenter ? 'center' : p.justifyEnd ? 'end' : 'start'};
    align-items: ${p => (p.itemsCenter ? 'center' : p.itemsStart ? 'flex-start' : p.itemsEnd ? 'flex-end' : 'initial')};
    width: ${p => (p.w100 ? '100%' : 'auto')};
`;
