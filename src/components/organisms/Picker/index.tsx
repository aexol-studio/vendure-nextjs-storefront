import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Stack, TP } from '@/src/components';
import { LogoAexol } from '@/src/assets';
import { XIcon } from 'lucide-react';
import { Dropdown } from './Dropdown';
import { Trans, useTranslation } from 'next-i18next';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useChannels } from '@/src/state/channels';
import languageDetector from '@/src/lib/lngDetector';
import { useRouter } from 'next/router';
import { DEFAULT_CHANNEL, DEFAULT_CHANNEL_SLUG, DEFAULT_LOCALE, channels } from '@/src/lib/consts';
import { getFlagByCode } from '@/src/util/i18Helpers';
import { useOutsideClick } from '@/src/util/hooks/useOutsideClick';
import { Button } from '../../molecules/Button';

type FormValues = {
    channel: string;
    locale: string;
};

export const Picker: React.FC<{
    changeModal?: {
        modal: boolean;
        channel: string;
        locale: string;
        country_name: string;
    };
}> = ({ changeModal }) => {
    const { channel, locale } = useChannels();
    const { t } = useTranslation('common');
    const { query, push, pathname, asPath } = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (changeModal?.modal) setIsOpen(true);
    }, [changeModal?.modal]);

    const defaultChannel = channels.find(c => c.channel === channel)?.slug as string;
    const ref = useRef<HTMLDivElement>(null);
    useOutsideClick(ref, () => setIsOpen(false));

    const { control, handleSubmit, watch, setValue } = useForm<FormValues>({
        defaultValues: {
            channel: defaultChannel,
            locale,
        },
        values: changeModal?.modal ? { channel: changeModal.channel, locale: changeModal.locale } : undefined,
    });

    const onSubmit: SubmitHandler<FormValues> = data => {
        const newLang = data.locale;
        const channelAsLocale = channels.find(c => c.slug === data.channel);
        const sameAsChannel = newLang === channelAsLocale?.slug;

        languageDetector.cache && languageDetector.cache(newLang);
        const haveChannel = pathname.includes('[channel]');
        const haveLocale = pathname.includes('[locale]');
        if (haveChannel) document.cookie = `channel=${channelAsLocale?.channel}; path=/`;

        const correctSlug = (typeof query.slug === 'string' ? query.slug : query.slug?.join('/')) as string;
        const preparedPathname = pathname
            .replace('[slug]', correctSlug)
            .replace('[...slug]', correctSlug)
            .replace('[code]', query.code as string);

        if (sameAsChannel) {
            if (haveChannel && haveLocale) {
                const split = preparedPathname.split('[locale]');
                const correctPathname = (
                    split[0] +
                    (newLang === channelAsLocale.slug ? '' : newLang) +
                    split[1]
                ).replace(
                    '[channel]',
                    channelAsLocale.channel === DEFAULT_CHANNEL ? '' : channelAsLocale.nationalLocale,
                );

                console.log(correctPathname);
                push(correctPathname);
            }
            if (haveChannel && !haveLocale) {
                const split = preparedPathname.split('[channel]');
                const correctPathname =
                    split[0] +
                    (channelAsLocale.slug === DEFAULT_CHANNEL_SLUG ? '' : channelAsLocale.nationalLocale) +
                    split[1];

                console.log(correctPathname);
                push(correctPathname);
            }
            if (!haveChannel && !haveLocale) {
                const _channel =
                    channelAsLocale?.channel === DEFAULT_CHANNEL
                        ? ''
                        : channelAsLocale?.nationalLocale === channelAsLocale.slug
                          ? ''
                          : channelAsLocale?.nationalLocale;
                const _newLang = newLang === DEFAULT_LOCALE ? '' : newLang;
                const correctPathname = '/' + (_channel + '/' + _newLang) + asPath;

                console.log(correctPathname);
                push(correctPathname);
            }
        } else {
            if (haveChannel && haveLocale) {
                const split = preparedPathname.split('[locale]');
                const correctPathname = (split[0] + newLang + split[1]).replace(
                    '[channel]',
                    channelAsLocale?.slug ?? '',
                );

                console.log(correctPathname);
                push(correctPathname);
            }
            if (haveChannel && !haveLocale) {
                const split = preparedPathname.split('[channel]');
                const correctPathname = split[0] + (channelAsLocale?.nationalLocale + '/' + newLang) + split[1];

                console.log(correctPathname);
                push(correctPathname);
            }

            if (!haveChannel && !haveLocale) {
                console.log(channelAsLocale);
                const _channel =
                    channelAsLocale?.channel === DEFAULT_CHANNEL && newLang === DEFAULT_CHANNEL_SLUG
                        ? ''
                        : channelAsLocale?.nationalLocale;

                const correctPathname = '/' + (_channel + '/' + newLang) + asPath;

                console.log('tutaj', correctPathname);
                push(correctPathname);
            }
        }
        setIsOpen(false);
    };

    return (
        <>
            <CurrentLocale onClick={() => setIsOpen(true)}>{getFlagByCode(locale, true)}</CurrentLocale>
            {isOpen && (
                <Overlay>
                    <PickerWrapper ref={ref} column gap={'3rem'} justifyCenter>
                        <IconWrapper onClick={() => setIsOpen(false)}>
                            <XIcon />
                        </IconWrapper>
                        <Header gap="2rem" column itemsCenter>
                            <LogoAexol />
                            {changeModal?.modal ? (
                                <TP>
                                    <Trans
                                        values={{ country: changeModal.country_name }}
                                        components={{ 1: <strong></strong> }}
                                        i18nKey="picker.detected"
                                        t={t}
                                    />
                                </TP>
                            ) : null}
                        </Header>
                        <StyledForm onSubmit={handleSubmit(onSubmit)}>
                            <Controller
                                name="channel"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <Dropdown
                                        items={channels.map(c => {
                                            return {
                                                key: c.slug,
                                                children: (
                                                    <LocaleInList itemsCenter gap="1rem">
                                                        {getFlagByCode(c.nationalLocale)}
                                                    </LocaleInList>
                                                ),
                                            };
                                        })}
                                        placeholder={t('picker.ship-to-country')}
                                        setSelected={channel => {
                                            onChange(channel);
                                            if (channel === value) return;
                                            setValue(
                                                'locale',
                                                channels.find(c => c.nationalLocale === channel)
                                                    ?.nationalLocale as string,
                                            );
                                        }}
                                        selected={value}
                                        renderSelected={value => (
                                            <LocaleInList w100 gap="1rem" style={{ marginTop: '0.25rem' }}>
                                                {getFlagByCode(value)}
                                            </LocaleInList>
                                        )}
                                    />
                                )}
                            />
                            <Controller
                                name="locale"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <Dropdown
                                        items={
                                            channels
                                                .find(c => c.nationalLocale === watch('channel'))
                                                ?.locales.map(l => {
                                                    return {
                                                        key: l,
                                                        children: (
                                                            <LocaleInList itemsCenter gap="1rem">
                                                                {getFlagByCode(l)}
                                                            </LocaleInList>
                                                        ),
                                                    };
                                                }) ?? []
                                        }
                                        placeholder={t('picker.change-language')}
                                        setSelected={onChange}
                                        selected={value}
                                        renderSelected={value => (
                                            <LocaleInList w100 gap="1rem" style={{ marginTop: '0.25rem' }}>
                                                {getFlagByCode(value)}
                                            </LocaleInList>
                                        )}
                                    />
                                )}
                            />
                            <WhiteStyledButton type="submit">{t('picker.save')} </WhiteStyledButton>
                            <WhiteStyledButton type="button" onClick={() => setIsOpen(false)}>
                                {t('picker.cancel')}
                            </WhiteStyledButton>
                        </StyledForm>
                    </PickerWrapper>
                </Overlay>
            )}
        </>
    );
};

const Header = styled(Stack)`
    max-width: 32rem;
    width: 100%;
`;

const StyledForm = styled.form`
    width: 24rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
`;

const LocaleInList = styled(Stack)`
    cursor: pointer;

    svg {
        width: 2rem;
        height: 2rem;
    }
`;

const CurrentLocale = styled.button`
    border: none;
    background-color: transparent;
    cursor: pointer;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    &:focus {
        outline: none;
    }
    svg {
        width: 2.5rem;
        height: 2.5rem;
    }
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: ${({ theme }) => theme.grayAlpha(800, 0.7)};
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    backdrop-filter: blur(0.2rem);
    z-index: 100;
    padding: 0 2rem;
    z-index: 3000;
`;

const PickerWrapper = styled(Stack)`
    position: relative;
    padding: 4rem 8rem;
    align-items: center;
    background-color: ${({ theme }) => theme.background.main};
`;

const IconWrapper = styled.div`
    position: absolute;
    top: 1rem;
    right: 1rem;
    cursor: pointer;
`;

const WhiteStyledButton = styled(Button)`
    display: flex;
    justify-content: center;
    width: 100%;
    background-color: ${({ theme }) => theme.background.main};
    color: ${({ theme }) => theme.gray(1000)};
    transition: all 0.2s ease-in-out;

    @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
        padding-block: 1.5rem;
    }
`;
