import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Stack } from '../../atoms';
import { LogoAexol } from '@/src/assets';
import { XIcon } from 'lucide-react';
import { Button } from '../../molecules/Button';
import { Dropdown } from './Dropdown';
import { useTranslation } from 'next-i18next';

const localesWithChannels = {
    'pl-channel': {
        defaultLocale: 'pl',
        locales: ['pl', 'en'],
    },
    'cz-channel': {
        defaultLocale: 'cz',
        locales: ['cz', 'en'],
    },
    'de-channel': {
        defaultLocale: 'de',
        locales: ['de', 'en'],
    },
};

interface PickerProps {
    onClosePicker: () => void;
}

export const Picker: React.FC<PickerProps> = ({ onClosePicker }) => {
    const { t } = useTranslation('common');
    const channels = Object.keys(localesWithChannels);
    const [selectedData, setSelectedData] = useState({
        channel: channels[0], // narazie biorę pierwszy channel z danych
        locale: localesWithChannels[channels[0]].defaultLocale,
        defaultLocale: '',
    });

    const locales = localesWithChannels[selectedData.channel].locales;

    return (
        <Overlay>
            <form onSubmit={() => console.log(selectedData)}>
                <PickerWrapper column gap={'3rem'} justifyCenter>
                    <IconWrapper onClick={onClosePicker}>
                        <XIcon />
                    </IconWrapper>
                    <LogoAexol />
                    <Dropdown
                        items={channels}
                        placeholder={t('picker.ship-to-country')}
                        setSelected={channel =>
                            setSelectedData({
                                ...selectedData,
                                channel: channel,
                                defaultLocale: localesWithChannels[channel].defaultLocale,
                                locale: localesWithChannels[channel].defaultLocale,
                            })
                        }
                        selected={selectedData.channel}
                    />
                    <Dropdown
                        items={locales}
                        placeholder={t('picker.change-language')}
                        setSelected={locale =>
                            setSelectedData({
                                ...selectedData,
                                locale: locale,
                            })
                        }
                        selected={selectedData.locale}
                    />
                    <StyledButton type="submit"> {t('picker.save')} </StyledButton>
                </PickerWrapper>
            </form>
        </Overlay>
    );
};

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(
        55,
        55,
        55,
        0.8
    ); // nie dodwałam tego jeszcze do themu aexolowego bo nie wiem czy taki będzie użyty
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    backdrop-filter: blur(1rem);
    z-index: 100;
    padding: 0 2rem;
    z-index: 900000;
`;

const PickerWrapper = styled(Stack)`
    position: relative;
    width: 100%;
    padding: 4rem 1.5rem 3rem 1.5rem;
    align-items: center;
    background-color: ${({ theme }) => theme.background.main};
    @media (min-width: ${p => p.theme.breakpoints.sm}) {
        width: 30rem;
    }
`;

const IconWrapper = styled.div`
    position: absolute;
    top: 1rem;
    right: 1rem;
    cursor: pointer;
`;

const StyledButton = styled(Button)`
    padding-block: 1.5rem;
    display: flex;
    justify-content: center;
    width: 100%;
`;
