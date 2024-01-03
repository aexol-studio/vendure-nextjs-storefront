import React from 'react';
import { useSlider } from './hooks';
import { Link, Stack, TP } from '../../atoms';
import styled from '@emotion/styled';

const fakeAnnouncementBar = [
    {
        message: 'This is a fake announcement bar',
        href: '/',
        bgColor: 'lch(50% 0 0)',
        textColor: 'lch(80% 0 0)',
        hoverTextColor: 'lch(100% 0 0)',
        hoverBgColor: 'lch(50% 0 0)',
    },
    {
        message: 'Best store ever',
        href: '/',
        bgColor: 'lch(50% 0 0)',
        textColor: 'lch(80% 0 0)',
        hoverTextColor: 'lch(100% 0 0)',
        hoverBgColor: 'lch(50% 0 0)',
    },
    {
        message: 'This is a fake announcement bar',
        href: '/',
        bgColor: 'lch(50% 0 0)',
        textColor: 'lch(80% 0 0)',
        hoverTextColor: 'lch(100% 0 0)',
        hoverBgColor: 'lch(50% 0 0)',
    },
];
type Omitted = Omit<Omit<(typeof fakeAnnouncementBar)[number], 'message'>, 'href'>;
export const AnnouncementBar: React.FC<{ secondsBetween: number }> = ({ secondsBetween }) => {
    const { ref } = useSlider({ secondsBetween });

    return (
        <Stack w100>
            <Stack w100 className="keen-slider" ref={ref}>
                {fakeAnnouncementBar.map((bar, idx) => {
                    const { message, href, ...styles } = bar;
                    return (
                        <Link key={idx} href={href}>
                            <Entry {...styles} justifyCenter itemsCenter w100 className="keen-slider__slide">
                                <TP size="1.25rem" weight={600}>
                                    {message}
                                </TP>
                            </Entry>
                        </Link>
                    );
                })}
            </Stack>
        </Stack>
    );
};
const Entry = styled(Stack)<Omitted>`
    padding: 1rem 0;
    background: ${p => p.bgColor};
    color: ${p => p.textColor};
    cursor: pointer;
    transition:
        background 0.4s ease-out,
        color 0.4s ease-out;
    &:hover {
        background: ${p => p.hoverBgColor};
        color: ${p => p.hoverTextColor};
    }
`;
