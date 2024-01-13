import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Stack } from '../../atoms';
import { LogoAexol } from '@/src/assets';
import { XIcon } from 'lucide-react';
import { Button } from '../../molecules/Button';
import { Dropdown } from './Dropdown';
import { useTranslation } from 'next-i18next';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useChannels } from '@/src/state/channels';
import languageDetector from '@/src/lib/lngDetector';
import { useRouter } from 'next/router';
import { channels } from '@/src/lib/consts';

type FormValues = {
    channel: string;
    locale: string;
};

export const Picker: React.FC = () => {
    const { channel, locale } = useChannels();
    const { t } = useTranslation('common');
    const { query, push, pathname } = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const defaultChannel = channels.find(c => c.channel === channel)?.slug as string;

    const { control, handleSubmit, watch, setValue } = useForm<FormValues>({
        defaultValues: { channel: defaultChannel, locale },
    });

    const onSubmit: SubmitHandler<FormValues> = data => {
        console.log(data);
        const newLang = data.locale;
        const channelAsLocale = channels.find(c => c.nationalLocale === data.channel)?.nationalLocale as string;
        console.log(channelAsLocale, newLang);
        const sameAsChannel = newLang === channelAsLocale;

        languageDetector.cache && languageDetector.cache(newLang);

        console.log(pathname);

        if (sameAsChannel) {
            if (pathname.includes('[channel]') && pathname.includes('[locale]')) {
                const splitted = pathname.split('[locale]');
                const correctPathname = (splitted[0] + (newLang === channelAsLocale ? '' : newLang) + splitted[1])
                    .replace('[channel]', channelAsLocale)
                    .replace('[slug]', query.slug as string)
                    .replace('[code]', query.code as string);
                console.log(correctPathname);
                push(correctPathname);
            }

            if (pathname.includes('[channel]') && !pathname.includes('[locale]')) {
                const splitted = pathname.split('[channel]');
                const correctPathname = (splitted[0] + channelAsLocale + splitted[1])
                    .replace('[slug]', query.slug as string)
                    .replace('[code]', query.code as string);
                console.log(correctPathname);
                push(correctPathname);
            }
            if (!pathname.includes('[channel]') && !pathname.includes('[locale]')) {
                const correctPathname = (pathname + '/' + channelAsLocale)
                    .replace('[slug]', query.slug as string)
                    .replace('[code]', query.code as string);
                console.log(correctPathname);
                push(correctPathname);
            }
        } else {
            if (pathname.includes('[channel]') && pathname.includes('[locale]')) {
                const splitted = pathname.split('[locale]');
                const correctPathname = (splitted[0] + newLang + splitted[1])
                    .replace('[channel]', channelAsLocale)
                    .replace('[slug]', query.slug as string)
                    .replace('[code]', query.code as string);

                console.log(correctPathname);
                push(correctPathname);
            }
            if (pathname.includes('[channel]') && !pathname.includes('[locale]')) {
                const splitted = pathname.split('[channel]');
                const correctPathname = (splitted[0] + channelAsLocale + '/' + newLang + splitted[1])
                    .replace('[slug]', query.slug as string)
                    .replace('[code]', query.code as string);

                console.log(correctPathname);
                push(correctPathname);
            }

            if (!pathname.includes('[channel]') && !pathname.includes('[locale]')) {
                const correctPathname = (pathname + '/' + channelAsLocale + '/' + newLang)
                    .replace('[slug]', query.slug as string)
                    .replace('[code]', query.code as string);

                console.log(correctPathname);
                push(correctPathname);
            }
        }

        setIsOpen(false);
    };

    return (
        <>
            <button onClick={() => setIsOpen(true)}>
                {locale} {channel}
            </button>
            {isOpen && (
                <Overlay>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <PickerWrapper column gap={'3rem'} justifyCenter>
                            <IconWrapper onClick={() => setIsOpen(false)}>
                                <XIcon />
                            </IconWrapper>
                            <LogoAexol />
                            <Controller
                                name="channel"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <Dropdown
                                        items={channels.map(c => c.slug)}
                                        placeholder={t('picker.ship-to-country')}
                                        setSelected={channel => {
                                            onChange(channel);
                                            setValue(
                                                'locale',
                                                channels.find(c => c.nationalLocale === channel)
                                                    ?.nationalLocale as string,
                                            );
                                        }}
                                        selected={value}
                                    />
                                )}
                            />
                            <Controller
                                name="locale"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <Dropdown
                                        items={
                                            channels.find(c => c.nationalLocale === watch('channel'))
                                                ?.locales as string[]
                                        }
                                        placeholder={t('picker.ship-to-country')}
                                        setSelected={onChange}
                                        selected={value}
                                    />
                                )}
                            />
                            <StyledButton type="submit"> {t('picker.save')} </StyledButton>
                        </PickerWrapper>
                    </form>
                </Overlay>
            )}
        </>
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
