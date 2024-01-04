import { useRef, useCallback, useEffect } from 'react';
import {
    getBaseUrl,
    getHashValue,
    getHashWithoutGidAndPid,
    getInitialActiveSlideIndex,
    hashIncludesNavigationQueryParams,
    hashToObject,
    objectToHash,
} from './helpers';

import PhotoSwipe, { SlideData } from 'photoswipe';
import { InternalAPI, InternalItem, ItemRef, PhotoSwipeImage } from './types';

export const useDesktopPhotoSwipe = (galleryID: string, hookImages: PhotoSwipeImage[]) => {
    let pswp: PhotoSwipe | null = null;
    if (typeof window === 'undefined') return { set: () => {}, remove: () => {}, open: () => {} };

    const items = useRef(new Map<ItemRef, InternalItem>());
    const openWhenReadyPid = useRef<string | null>(null);

    const open = useCallback<InternalAPI['open']>(
        (targetRef, targetId, itemIndex) => {
            if (pswp) return;

            let index = itemIndex || null;

            const normalized: SlideData[] = [];

            const entries = Array.from(items.current);

            const prepare = (entry: [ItemRef, InternalItem], i: number) => {
                const [ref, { id: pid, width, height, src, alt }] = entry;
                if (targetRef === ref || (pid !== undefined && String(pid) === targetId)) {
                    index = i;
                }

                normalized.push({
                    width: Number(width),
                    height: Number(height),
                    src,
                    srcset: src,
                    msrc: src,
                    element: ref?.current,
                    alt,
                    ...(pid !== undefined ? { pid } : {}),
                });
            };

            entries.forEach(prepare);

            const instance = new PhotoSwipe({
                dataSource: normalized,
                index: getInitialActiveSlideIndex(index, targetId),
                bgOpacity: 1,
                loop: true,
                zoom: true,
                initialZoomLevel: 0.9,
                secondaryZoomLevel: 2,
                maxZoomLevel: 2,
                // arrowNextSVG: rightArrowSVG,
                // arrowPrevSVG: leftArrowSVG,
                zoomSVG: '',
                closeSVG: '',
            });

            pswp = instance;

            instance.on('uiRegister', () => {
                instance.ui?.registerElement({
                    name: 'fullscreen-button',
                    title: 'Toggle fullscreen',
                    order: 12,
                    isButton: true,
                    appendTo: 'bar',
                    onClick: () => {
                        const ref = document.querySelector(`.pswp`);
                        if (!ref) return;
                        if (!document.fullscreenElement) {
                            ref.requestFullscreen();
                        } else if (document.exitFullscreen) {
                            document.exitFullscreen();
                        }
                    },
                });
            });

            const getHistoryState = () => {
                return {
                    gallery: {
                        galleryID,
                    },
                };
            };

            const closeGalleryOnHistoryPopState = () => {
                if (galleryID === undefined) return;
                if (pswp !== null) pswp.close();
            };

            instance.on('beforeOpen', () => {
                if (galleryID === undefined) return;

                const hashIncludesGidAndPid = hashIncludesNavigationQueryParams(getHashValue());

                instance.events.add(document, 'wheel', () => {
                    if (galleryID === undefined) return;
                    const onWheel = (e: WheelEvent) => {
                        e.preventDefault();
                    };
                    if (pswp !== null) {
                        document.addEventListener('wheel', onWheel, {
                            passive: false,
                        });
                        pswp.close();
                        setTimeout(() => {
                            document.removeEventListener('wheel', onWheel);
                        }, 400);
                    }
                    return () => {
                        document.removeEventListener('wheel', onWheel);
                    };
                });

                instance.events.add(document, 'mouseenter', () => {
                    const ref = document.querySelector(`.pswp__top-bar`);
                    ref?.classList.remove('pswp__top-bar--idle');
                });

                instance.events.add(document, 'mouseleave', () => {
                    const ref = document.querySelector(`.pswp__top-bar`);
                    ref?.classList.add('pswp__top-bar--idle');
                });

                if (!hashIncludesGidAndPid) {
                    window.history.pushState(getHistoryState(), document.title);
                    return;
                }

                const hasGalleryStateInHistory = Boolean(window.history.state?.gallery);

                if (hasGalleryStateInHistory) return;

                const baseUrl = getBaseUrl();
                const currentHash = getHashValue();
                const hashWithoutGidAndPid = getHashWithoutGidAndPid(currentHash);
                const urlWithoutOpenedSlide = `${baseUrl}${hashWithoutGidAndPid ? `#${hashWithoutGidAndPid}` : ''}`;
                const urlWithOpenedSlide = `${baseUrl}#${currentHash}`;

                window.history.replaceState(window.history.state, document.title, urlWithoutOpenedSlide);
                window.history.pushState(getHistoryState(), document.title, urlWithOpenedSlide);
            });

            instance.on('change', () => {
                if (galleryID === undefined) return;

                const pid = instance.currSlide?.data.pid || instance.currIndex + 1;
                const baseUrl = getBaseUrl();
                const baseHash = getHashWithoutGidAndPid(getHashValue());
                const gidAndPidHash = objectToHash({ gid: galleryID, pid });
                const urlWithOpenedSlide = `${baseUrl}#${baseHash}&${gidAndPidHash}`;
                window.history.replaceState(getHistoryState(), document.title, urlWithOpenedSlide);
            });

            instance.on('close', () => {
                const ref = document.querySelector(`.pswp__button--fullscreen-button`);
                if (ref) ref.classList.add('pswp__button--fullscreen--active');
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
            });

            instance.on('resize', () => {
                const ref = document.querySelector(`.pswp__button--fullscreen-button`);
                if (!ref) return;
                if (document.fullscreenElement) {
                    ref.classList.remove('pswp__button--fullscreen--active');
                } else {
                    ref.classList.add('pswp__button--fullscreen--active');
                }
            });

            window.addEventListener('popstate', closeGalleryOnHistoryPopState);

            instance.on('destroy', () => {
                if (galleryID !== undefined) {
                    window.removeEventListener('popstate', closeGalleryOnHistoryPopState);
                    if (hashIncludesNavigationQueryParams(getHashValue())) window.history.back();
                }
                pswp = null;
            });

            instance.init();
        },
        [galleryID, hookImages],
    );

    const openGalleryBasedOnUrlHash = useCallback(() => {
        if (galleryID === undefined) return;
        if (pswp !== null) return;

        const hash = getHashValue();
        if (hash.length < 5) return;

        const params = hashToObject(hash);
        const { pid, gid } = params;
        if (!pid || !gid) return;

        if (items.current.size === 0) {
            openWhenReadyPid.current = pid;
            return;
        }

        if (pid && gid === String(galleryID)) open(null, pid);
    }, [open, galleryID]);

    useEffect(() => {
        openGalleryBasedOnUrlHash();
        window.addEventListener('popstate', openGalleryBasedOnUrlHash);
        return () => window.removeEventListener('popstate', openGalleryBasedOnUrlHash);
    }, [openGalleryBasedOnUrlHash]);

    const remove = useCallback((ref: ItemRef) => {
        items.current.delete(ref);
    }, []);

    const set = useCallback(
        (ref: ItemRef, data: InternalItem) => {
            const { id } = data;
            items.current.set(ref, data);
            if (openWhenReadyPid.current === null) return;

            if (id === openWhenReadyPid.current) {
                open(ref);
                openWhenReadyPid.current = null;
                return;
            }

            if (!id) {
                const index = parseInt(openWhenReadyPid.current, 10) - 1;
                const refToOpen = Array.from(items.current.keys())[index];
                if (refToOpen) {
                    open(refToOpen);
                    openWhenReadyPid.current = null;
                }
            }
        },
        [open],
    );

    useEffect(() => {
        if (pswp) pswp.close();
    }, []);

    return {
        set,
        remove,
        open,
    };
};
