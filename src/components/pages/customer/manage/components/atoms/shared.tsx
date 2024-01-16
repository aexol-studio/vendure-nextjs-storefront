import { motion } from 'framer-motion';
import { Button } from '@/src/components/molecules/Button';
import styled from '@emotion/styled';

export const MotionCustomerWrap = styled(motion.div)`
    align-items: flex-start;
    display: flex;
    width: 100%;
    gap: 3.5rem;
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
        flex-direction: column;
    }
`;

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 2rem;
`;

export const StyledButton = styled(Button)<{ active?: boolean }>`
    background: ${p => p.active && p.theme.gray(700)};
    font-size: 1.2rem;
`;
