import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const FormError = styled(motion.span)`
    height: 1.4rem;
    color: ${p => p.theme.accent(500)};
    font-size: 1.2rem;
    font-weight: 500;
`;
