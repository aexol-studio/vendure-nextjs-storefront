import React from 'react';
import { Stack } from '@/src/components/atoms/Stack';
import { TP } from '@/src/components/atoms/TypoGraphy';
import { Link } from '@/src/components/atoms/Link';

interface FooterSectionI {
    header: string;
    linksTitles?: string[];
    contactInfo?: string[];
}

export const FooterSection: React.FC<FooterSectionI> = ({ header, contactInfo, linksTitles }) => {
    return (
        <Stack column gap="0.5rem">
            <TP weight={600}>{header}</TP>
            {linksTitles?.map(link => (
                <Link href="#" key={link} style={{ color: 'inherit' }}>
                    <TP style={{ width: 'max-content' }} size="1.25rem">
                        {link}
                    </TP>
                </Link>
            ))}
            {contactInfo?.map(link => (
                <TP style={{ width: 'max-content' }} size="1.25rem" key={link}>
                    {link}
                </TP>
            ))}
        </Stack>
    );
};
