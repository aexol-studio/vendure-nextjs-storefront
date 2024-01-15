import { Stack } from '@/src/components/atoms';
import styled from '@emotion/styled';

export const Ratings: React.FC<{ rating: number }> = ({ rating }) => {
    const stars = Array.from({ length: 5 }, (_, i) => i + 1);

    const fillValues: Record<number, number> = stars.reduce((acc, star) => {
        if (star <= rating) {
            return { ...acc, [star]: 100 };
        }
        if (star - 1 < rating) {
            return { ...acc, [star]: (rating - (star - 1)) * 100 };
        }
        return { ...acc, [star]: 0 };
    }, {});

    return (
        <Stack w100>
            {stars.map(star => (
                <RatingsWrapper
                    key={star}
                    style={{ position: 'relative', height: '1.5rem', width: '1.5rem', color: 'black' }}>
                    {/* FILLABLE STARS */}
                    <svg
                        style={{ clipPath: `polygon(0 0, ${fillValues[star]}% 0, ${fillValues[star]}% 100%, 0 100%)` }}
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M6.64374 0.231209C6.71857 0.000937581 7.04432 0.000877559 7.11924 0.231122L8.46054 4.35362C8.48426 4.42627 8.55236 4.47539 8.62925 4.47515L12.9856 4.46663C13.2287 4.46615 13.3294 4.77782 13.1319 4.91967L9.60348 7.45444C9.54119 7.49914 9.51513 7.57891 9.53906 7.65144L10.895 11.766C10.9709 11.9963 10.7073 12.1889 10.5109 12.0467L6.98553 9.49369C6.92345 9.44872 6.83915 9.44872 6.77707 9.49369L3.25402 12.0463C3.05761 12.1886 2.79398 11.9959 2.86989 11.7656L4.2256 7.6516C4.24954 7.57907 4.2235 7.49935 4.16118 7.4546L0.632761 4.91985C0.435314 4.77801 0.535996 4.46634 0.77911 4.46681L5.13545 4.47533C5.21233 4.47558 5.28045 4.42621 5.30414 4.35356L6.64374 0.231209Z"
                            fill="currentColor"
                            stroke="currentColor"
                        />
                    </svg>
                    {/* JUST A EMPTY STARS */}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M6.64374 0.231209C6.71857 0.000937581 7.04432 0.000877559 7.11924 0.231122L8.46054 4.35362C8.48426 4.42627 8.55236 4.47539 8.62925 4.47515L12.9856 4.46663C13.2287 4.46615 13.3294 4.77782 13.1319 4.91967L9.60348 7.45444C9.54119 7.49914 9.51513 7.57891 9.53906 7.65144L10.895 11.766C10.9709 11.9963 10.7073 12.1889 10.5109 12.0467L6.98553 9.49369C6.92345 9.44872 6.83915 9.44872 6.77707 9.49369L3.25402 12.0463C3.05761 12.1886 2.79398 11.9959 2.86989 11.7656L4.2256 7.6516C4.24954 7.57907 4.2235 7.49935 4.16118 7.4546L0.632761 4.91985C0.435314 4.77801 0.535996 4.46634 0.77911 4.46681L5.13545 4.47533C5.21233 4.47558 5.28045 4.42621 5.30414 4.35356L6.64374 0.231209Z"
                            fill="none"
                            stroke="currentColor"
                        />
                    </svg>
                </RatingsWrapper>
            ))}
        </Stack>
    );
};

const RatingsWrapper = styled(Stack)`
    position: relative;
    width: 1.5rem;
    height: 1.5rem;
    color: black;

    svg {
        position: absolute;
        top: 0;
        left: 0;
    }
`;
