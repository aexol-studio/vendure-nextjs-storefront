import { KeenSliderInstance, KeenSliderOptions, useKeenSlider } from 'keen-slider/react';
import { useEffect, useState } from 'react';

export const useSlider = ({ loop = true, spacing }: { loop?: boolean; spacing: number }) => {
    const [jsEnabled, setJsEnabled] = useState(false);
    useEffect(() => {
        setJsEnabled(true);
    }, []);

    const [currentSlide, setCurrentSlide] = useState(0);
    const keenSliderOptions: KeenSliderOptions = {
        slides: { perView: 'auto', spacing },
        initial: 0,
        loop,
        mode: 'free-snap',
        detailsChanged: s => {
            setCurrentSlide(s.track.details.rel);
        },
    };

    const [ref, slider] = useKeenSlider(keenSliderOptions, []);
    useEffect(refreshSlider(slider, keenSliderOptions), [slider.current]);

    const nextSlide = () => (jsEnabled ? slider.current?.next() : console.log('JavaScript is not enabled'));
    const prevSlide = () => (jsEnabled ? slider.current?.prev() : console.log('JavaScript is not enabled'));
    const goToSlide = (slide: number) =>
        jsEnabled ? slider.current?.moveToIdx(slide) : console.log('JavaScript is not enabled');

    return { jsEnabled, ref, slider, nextSlide, prevSlide, goToSlide, currentSlide };
};

function refreshSlider(
    sliderInstanceRef: React.MutableRefObject<KeenSliderInstance | null>,
    sliderOptionsValue: KeenSliderOptions,
) {
    return () => {
        if (sliderInstanceRef.current) {
            sliderInstanceRef.current.update({ ...sliderOptionsValue });
        }

        return () => {
            if (sliderInstanceRef.current) {
                sliderInstanceRef.current.destroy();
            }
        };
    };
}
