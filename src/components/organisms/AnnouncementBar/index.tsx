import React, { useEffect, useState } from 'react';
import { useSlider } from './hooks';
import { Link, Stack, TP } from '../../atoms';
import styled from '@emotion/styled';

type AnnouncementBarType = {
    text: string;
    href: string;
};

// type Omitted = Omit<Omit<AnnouncementBarType, 'text'>, 'href'>;
export const AnnouncementBar: React.FC<{ entries: AnnouncementBarType[]; secondsBetween: number }> = ({
    entries,
    secondsBetween,
}) => {
    const [jsEnabled, setJsEnabled] = useState(false);
    const { ref } = useSlider({ secondsBetween });

    useEffect(() => {
        setJsEnabled(true);
    }, []);

    return (
        <Stack w100>
            {jsEnabled ? (
                <Stack w100 className="keen-slider" ref={ref}>
                    {entries.map((bar, idx) => {
                        const { text, href, ...styles } = bar;
                        return (
                            <Link key={idx} href={href}>
                                <Entry {...styles} justifyCenter itemsCenter className="keen-slider__slide">
                                    <TP size="1.25rem" weight={500}>
                                        {text}
                                    </TP>
                                </Entry>
                            </Link>
                        );
                    })}
                </Stack>
            ) : (
                <Stack w100>
                    <Link href={entries[0].href} style={{ width: '100%' }}>
                        <Entry {...entries[0]} justifyCenter itemsCenter w100>
                            <TP size="1.25rem" weight={600}>
                                {entries[0].text}
                            </TP>
                        </Entry>
                    </Link>
                </Stack>
            )}
        </Stack>
    );
};
const Entry = styled(Stack)`
    padding: 1rem 0;
    background: ${p => p.theme.background.ice};
    cursor: pointer;
`;
