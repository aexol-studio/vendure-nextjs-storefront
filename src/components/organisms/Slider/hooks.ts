import { useKeenSlider } from 'keen-slider/react';
import { useState } from 'react';

export const useSlider = ({ spacing }: { spacing: number }) => {
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

    const nextSlide = () => slider.current?.next();
    const prevSlide = () => slider.current?.prev();
    const goToSlide = (slide: number) => slider.current?.moveToIdx(slide);

    return { ref, slider, nextSlide, prevSlide, goToSlide, currentSlide };
};
