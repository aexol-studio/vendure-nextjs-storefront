import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Stack } from '@/src/components/atoms/Stack';

export const FormErrorWrapper = styled(Stack)`
    min-height: 3.2rem;
`;

export const FormRequired = styled.span`
    color: ${p => p.theme.error};
    font-size: 1.2rem;
    font-weight: 500;
    margin: 0.4rem 0 0.8rem 0;
`;

export const FormError = styled(motion.span)`
    color: ${p => p.theme.error};
    font-size: 1.2rem;
    font-weight: 500;
    margin: 0.4rem 0 0.8rem 0;
`;
