import React, { ReactNode } from 'react';
import { useSlider } from './hooks';
import styled from '@emotion/styled';
import { Stack } from '@/src/components/atoms';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from '@/src/assets/svg';

interface SliderProps {
    withDots?: boolean;
    withArrows?: number;
    spacing?: number;
    slides: ReactNode[];
}

export const Slider: React.FC<SliderProps> = ({ slides, withArrows, withDots, spacing = 0 }) => {
    if (!slides?.length) return null;
    const { jsEnabled, ref, nextSlide, prevSlide, goToSlide, currentSlide } = useSlider({
        spacing,
        loop: withArrows ? slides?.length > withArrows : true,
    });

    return (
        <Wrapper column>
            <Content>
                {jsEnabled && withArrows && slides?.length > withArrows && (
                    <Button whileTap={{ scale: 0.95 }} left={1} onClick={prevSlide}>
                        <ArrowLeft />
                    </Button>
                )}
                {jsEnabled ? (
                    <StyledSlider className="keen-slider" ref={ref}>
                        {slides.map((slide, idx) => (
                            <StyledSlide column key={idx} className="keen-slider__slide">
                                {slide}
                            </StyledSlide>
                        ))}
                    </StyledSlider>
                ) : (
                    <StyledNoJSSlider gap={`${spacing / 10}rem`}>{slides}</StyledNoJSSlider>
                )}
                {jsEnabled && withArrows && slides?.length > withArrows && (
                    <Button whileTap={{ scale: 0.95 }} onClick={nextSlide}>
                        <ArrowRight />
                    </Button>
                )}
            </Content>
            {jsEnabled && slides?.length > 1 && withDots && (
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
`;

const Button = styled(motion.button)<{ left?: number }>`
    appearance: none;
    border: none;
    background: ${({ theme }) => theme.background.third};
    border-radius: ${p => p.theme.borderRadius};

    display: flex;
    align-items: center;
    justify-content: center;
    width: 6rem;
    height: 6rem;

    position: absolute;
    top: calc(50% - 1.75rem);
    ${({ left }) => (left === 1 ? 'left: -3rem;' : 'right: -3rem;')}
    z-index: 1;

    transition: opacity 0.3s ease;
`;

const StyledNoJSSlider = styled.div<{ gap: string }>`
    display: flex;
    align-items: center;
    gap: ${({ gap }) => gap};
    overflow: hidden;
`;

const StyledSlider = styled(Stack)``;

const StyledSlide = styled(Stack)`
    min-width: fit-content;
    max-width: fit-content;
`;
