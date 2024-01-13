import { useKeenSlider } from 'keen-slider/react';
import { useEffect, useState } from 'react';

export const useSlider = ({ spacing }: { spacing: number }) => {
    const [jsEnabled, setJsEnabled] = useState(false);
    useEffect(() => {
        setJsEnabled(true);
    }, []);

    const [currentSlide, setCurrentSlide] = useState(0);

    const [ref, slider] = useKeenSlider(
        {
            slides: { perView: 'auto', spacing },
            initial: 0,
            loop: true,
            mode: 'free-snap',
            detailsChanged: s => {
                setCurrentSlide(s.track.details.rel);
            },
        },
        [],
    );

    const nextSlide = () => (jsEnabled ? slider.current?.next() : console.log('JavaScript is not enabled'));
    const prevSlide = () => (jsEnabled ? slider.current?.prev() : console.log('JavaScript is not enabled'));
    const goToSlide = (slide: number) =>
        jsEnabled ? slider.current?.moveToIdx(slide) : console.log('JavaScript is not enabled');

    return { jsEnabled, ref, slider, nextSlide, prevSlide, goToSlide, currentSlide };
};
