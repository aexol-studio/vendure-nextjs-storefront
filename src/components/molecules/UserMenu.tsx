import { Dropdown } from '@/src/styles/reusableStyles';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { Link } from '@/src/components/atoms';
import { User2, UserCheck2 } from 'lucide-react';

export const UserMenu: React.FC<{ isLogged: boolean }> = ({ isLogged }) => {
    return (
        <Dropdown>
            <IconLink aria-label="User menu" href={isLogged ? '/customer/manage' : '/customer/sign-in'}>
                <AnimatePresence>
                    {isLogged ? (
                        <IconWrapper initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <UserCheck2 size="2.4rem" />
                        </IconWrapper>
                    ) : (
                        <IconWrapper initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <User2 size="2.4rem" />
                        </IconWrapper>
                    )}
                </AnimatePresence>
            </IconLink>
        </Dropdown>
    );
};

const IconWrapper = styled(motion.div)`
    width: 2.4rem;
    height: 2.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;

const IconLink = styled(Link)`
    display: flex;
    align-items: center;
    justify-content: center;

    color: ${p => p.theme.text.main};
`;
