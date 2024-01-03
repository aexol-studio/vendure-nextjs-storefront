import { useKeenSlider } from 'keen-slider/react';
import type { KeenSliderInstance } from 'keen-slider/react';

const SlideChangeIntervalPlugin = (secondsBetween: number) => {
    return (slider: KeenSliderInstance) => {
        let timeout: ReturnType<typeof setTimeout>;
        const clearNextTimeout = () => {
            clearTimeout(timeout);
        };
        const nextTimeout = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                slider.next();
            }, secondsBetween * 1000);
        };
        slider.on('created', nextTimeout);
        slider.on('animationEnded', nextTimeout);
        slider.on('updated', nextTimeout);

        slider.on('dragStarted', clearNextTimeout);
        slider.on('dragEnded', clearNextTimeout);
    };
};

export const useSlider = ({ secondsBetween }: { secondsBetween: number }) => {
    const [ref, slider] = useKeenSlider({ slides: { perView: 1 }, initial: 0, loop: true, mode: 'snap' }, [
        SlideChangeIntervalPlugin(secondsBetween),
    ]);

    return { ref, slider };
};
