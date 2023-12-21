import { HTMLAttributes, forwardRef } from 'react';
import { Stack } from '@/src/components/atoms/Stack';
import styled from '@emotion/styled';
import { GlobalError } from 'react-hook-form';
import { FormError } from './atoms';

type ErrorBannerType = HTMLAttributes<HTMLDivElement> & {
    error?: Record<string, GlobalError> & GlobalError;
    clearErrors: () => void;
};

export const ErrorBanner = forwardRef((props: ErrorBannerType, ref: React.ForwardedRef<HTMLDivElement>) => {
    const { error, ...rest } = props;

    return (
        <BannerWrapper {...rest} ref={ref}>
            {error?.message && <FormError>{error?.message}</FormError>}
        </BannerWrapper>
    );
});

ErrorBanner.displayName = 'ErrorBanner';

const BannerWrapper = styled(Stack)<{ status?: 'success' | 'error' }>``;
// const BannerHolder = styled(Stack)``;
// const ErrorBannerWrapper = styled(Stack)``;
