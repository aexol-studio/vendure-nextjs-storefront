import { CSSProperties } from 'react';

const animatedTextProperties: CSSProperties = {
    color: 'white',
    fontSize: '1rem',
    textAlign: 'center',
    position: 'absolute',
    zIndex: '1',
    top: '35%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
};
const baseAnimatedProperties: CSSProperties = {
    position: 'fixed',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    userSelect: 'none',
    pointerEvents: 'none',
    zIndex: '2138',
};

type Position = { top: number; left: number };

const animate = (
    animated: HTMLDivElement,
    buttonPosition: Position,
    quantityPosition: Position,
    time: number,
    resolve: () => void,
) => {
    const startTime = performance.now();

    const animate = () => {
        const currentTime = performance.now();

        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / time, 1);

        const startX = buttonPosition.left + (quantityPosition.left - buttonPosition.left) * progress;
        const startY = buttonPosition.top + (quantityPosition.top - buttonPosition.top) * progress;

        animated.style.left = `${startX}px`;
        animated.style.top = `${startY}px`;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            animated.style.left = `${quantityPosition.left}px`;
            animated.style.top = `${quantityPosition.top}px`;
            animated.removeEventListener('animationend', animate);

            setTimeout(() => {
                animated.style.opacity = '1';
                animated.style.transform = 'scale(1)';
                setTimeout(() => {
                    animated.style.opacity = '0.5';
                    animated.style.transform = 'scale(0.5)';
                }, 500);

                setTimeout(() => {
                    animated.style.opacity = '0';
                    animated.style.transform = 'scale(0)';
                    document.body.removeChild(animated);

                    resolve();
                }, 1000);
            }, time);
        }
    };

    requestAnimationFrame(animate);
};

const iconBuilder = (variant: 'default' | 'black') => {
    switch (variant) {
        case 'default':
            return {
                fill: '#001a2d',
                time: 1000,
                transition: 'all 1000ms cubic-bezier(.32,.32,.42,.84)',
                webkitTransition: 'all 1000ms cubic-bezier(.32,.32,.42,.84)',
            };
        case 'black':
            return {
                fill: '#00000090',
                time: 1000,
                transition: 'all 1000ms cubic-bezier(.32,.32,.42,.84)',
                webkitTransition: 'all 1000ms cubic-bezier(.32,.32,.42,.84)',
            };
        default:
            return {
                fill: '#001a2d',
                time: 1000,
                transition: 'all 1000ms cubic-bezier(.32,.32,.42,.84)',
                webkitTransition: 'all 1000ms cubic-bezier(.32,.32,.42,.84)',
            };
    }
};

export const addAnimatedPayload = async (
    trigger: React.MouseEvent<HTMLElement, MouseEvent>,
    variant?: 'default' | 'black',
    quantity?: number,
    debug?: boolean,
) => {
    const realVariant = variant || 'default';
    const circleProperties = iconBuilder(realVariant);
    console.log(variant);
    return new Promise<void>(resolve => {
        const { time, ...settableProperties } = circleProperties;
        const quantityElement = document.getElementById('header-cart-quantity');
        if (!quantityElement) {
            resolve();
            if (debug) console.log('Animation: there is no header cart quantity element');
            return;
        }

        const quantityPosition = quantityElement.getBoundingClientRect();
        const buttonPosition = {
            top: trigger.clientY,
            left: trigger.clientX,
        };

        const cartWidth = quantityPosition.width;
        const cartHeight = quantityPosition.height;
        const icon = document.createElement('div');
        const iconSVG = document.createElement('svg');

        iconSVG.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="${circleProperties.fill}" /></svg>`;

        const iconText = document.createElement('span');
        iconText.innerText = quantity ? `+${quantity}` : '+1';
        Object.assign(iconText.style, animatedTextProperties);

        const dynamicProperties = {
            top: `${(buttonPosition?.top || 0) - cartHeight / 2}px`,
            left: `${(buttonPosition?.left || 0) - cartWidth / 2}px`,
            width: `${cartWidth}px`,
            height: `${cartHeight}px`,
        };

        Object.assign(icon.style, {
            ...dynamicProperties,
            ...settableProperties,
            ...baseAnimatedProperties,
        });

        icon.appendChild(iconSVG);
        icon.appendChild(iconText);
        document.body.appendChild(icon);

        if (!buttonPosition) {
            resolve();
            return;
        }

        animate(icon, buttonPosition, quantityPosition, time, resolve);

        if (debug) console.log('Animation: animated');
    });
};
