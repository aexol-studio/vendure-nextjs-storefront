import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const FormError = styled(motion.span)`
    color: ${p => p.theme.error};
    font-size: 1.2rem;
    font-weight: 500;
    min-height: 1.5rem;
    margin: 0.4rem 0 0.8rem 0;
`;
