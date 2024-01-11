import { thv } from '@/src/theme';
import styled from '@emotion/styled';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type ButtonType = ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
};

export const _Button = forwardRef((props: ButtonType, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const { loading, ...rest } = props;
    return (
        <FakeButton disabled={loading || props.disabled} ref={ref} {...rest}>
            <AnimatePresence>
                {loading ? (
                    <LoaderWrapper
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}>
                        <Loader size={'1.5rem'} />
                    </LoaderWrapper>
                ) : null}
            </AnimatePresence>
            <HideChildren loading={loading ? true : undefined}>{props.children}</HideChildren>
        </FakeButton>
    );
});

const FakeButton = styled.button`
    position: relative;
    width: inherit;
`;

const LoaderWrapper = styled(motion.div)`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`;

const HideChildren = styled.div<{ loading?: boolean }>`
    width: inherit;
    display: inherit;
    flex-direction: inherit;
    gap: inherit;
    justify-content: center;
    align-items: center;
    position: relative;
    visibility: ${p => (p.loading ? 'hidden' : 'visible')};
    opacity: ${p => (p.loading ? 0 : 1)};
    transition: opacity 0.2s ease-in-out;
`;

const Loader = styled(Loader2)`
    width: 1.5rem;
    height: 1.5rem;

    @keyframes spin {
        from {
            transform: rotate(0);
        }
        to {
            transform: rotate(360deg);
        }
    }

    animation: spin 1s linear infinite;
`;

export const Button = styled(_Button)`
    background-color: ${thv.button.back};
    color: ${thv.button.front};
    border: 0;
    border-radius: ${p => p.theme.borderRadius};
    padding: 1rem 3rem;
    font-weight: 600;
    outline: 0;
    min-width: 12rem;
    border: 1px solid ${thv.button.back};
    :hover {
        color: ${p => p.theme.button.hover?.front || p.theme.button.front};
        background: ${p => p.theme.button.hover?.back || p.theme.button.back};
    }

    :disabled {
        background: ${p => p.theme.gray(800)};
        color: ${p => p.theme.gray(200)};
    }
`;

export const FullWidthButton = styled(Button)`
    width: 100%;
`;

export const SecondaryButton = styled(_Button)`
    background-color: ${thv.button.front};
    color: ${thv.button.back};
    border: 0;
    border-radius: ${p => p.theme.borderRadius};
    padding: 1rem 3rem;
    font-weight: 600;
    outline: 0;
    min-width: 12rem;
    border: 1px solid ${thv.button.back};
    :hover {
        background: ${p => p.theme.gray(100)};
    }
`;

export const FullWidthSecondaryButton = styled(SecondaryButton)`
    width: 100%;
`;

export const IconButton = styled.button<{ isActive?: boolean }>`
    position: relative;
    color: ${thv.button.icon.front};
    border: 0;
    border-radius: 100%;
    font-weight: 600;
    outline: 0;
    width: 2.4rem;
    height: 2.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${p => p.theme.button.icon.back || 'transparent'};
    svg {
        width: 2rem;
        height: 2rem;
    }
    :hover {
        box-shadow: none;
    }
`;
