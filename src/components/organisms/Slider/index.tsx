import React, { ReactNode } from 'react';
import { useSlider } from './hooks';
import styled from '@emotion/styled';
import { ArrowBigLeft, ArrowBigRight } from 'lucide-react';
import { Stack } from '@/src/components/atoms';
import { motion } from 'framer-motion';

interface SliderProps {
    withDots?: boolean;
    withArrows?: boolean;
    spacing?: number;
    slides: ReactNode[];
}

export const Slider: React.FC<SliderProps> = ({ slides, withArrows, withDots, spacing = 0 }) => {
    const { ref, nextSlide, prevSlide, goToSlide, currentSlide } = useSlider({ spacing });
    return (
        <Wrapper column>
            <Content>
                {withArrows && (
                    <Button whileTap={{ scale: 0.95 }} left={1} onClick={prevSlide}>
                        <ArrowBigLeft size="2rem" />
                    </Button>
                )}
                <StyledSlider className="keen-slider" ref={ref}>
                    {slides.map((slide, idx) => (
                        <StyledSlide column itemsCenter key={idx} className="keen-slider__slide">
                            {slide}
                        </StyledSlide>
                    ))}
                </StyledSlider>
                {withArrows && (
                    <Button whileTap={{ scale: 0.95 }} onClick={nextSlide}>
                        <ArrowBigRight size="2rem" />
                    </Button>
                )}
            </Content>
            {withDots && (
                <DotsWrapper justifyCenter itemsCenter gap="1rem">
                    {slides.map((_, i) => (
                        <Dot key={i} active={i === currentSlide} onClick={() => goToSlide(i)} />
                    ))}
                </DotsWrapper>
            )}
        </Wrapper>
    );
};

const DotsWrapper = styled(Stack)`
    margin-top: 3rem;
`;

const Dot = styled.div<{ active: boolean }>`
    width: 0.8rem;
    height: 0.8rem;
    border-radius: ${({ theme }) => theme.borderRadius};
    background: ${({ theme, active }) => (active ? theme.text.main : theme.text.inactive)};
    transition: background 0.3s ease;
    cursor: pointer;
`;

const Wrapper = styled(Stack)``;

const Content = styled(Stack)`
    position: relative;
    width: 100%;

    :hover {
        & > button {
            opacity: 1;
        }
    }
`;

const Button = styled(motion.button)<{ left?: number }>`
    appearance: none;
    border: none;
    background: ${p => p.theme.background.secondary};
    border-radius: ${p => p.theme.borderRadius};
    box-shadow: 0 0.1rem 0.1rem 0 ${({ theme }) => theme.shadow};

    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;

    position: absolute;
    top: calc(50% - 1.75rem);
    ${({ left }) => (left === 1 ? 'left: 1rem;' : 'right: 1rem;')}
    z-index: 1;

    opacity: 0.5;
    transition: opacity 0.3s ease;
`;

const StyledSlider = styled(Stack)``;

const StyledSlide = styled(Stack)`
    min-width: fit-content;
`;
