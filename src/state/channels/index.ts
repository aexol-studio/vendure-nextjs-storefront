import { createContainer } from 'unstated-next';
import { ChannelsContainerType } from './types';
import { channelsEmptyState } from './utils';

const useChannelsContainer = createContainer<ChannelsContainerType, { locale: string; channel: string }>(
    initialState => {
        if (!initialState) return channelsEmptyState;

        return { channel: initialState.channel, locale: initialState.locale };
    },
);

export const useChannels = useChannelsContainer.useContainer;
export const ChannelsProvider = useChannelsContainer.Provider;
