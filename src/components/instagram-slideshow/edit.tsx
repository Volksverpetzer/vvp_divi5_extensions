// External Dependencies.
import React, { ReactElement, useEffect, useState } from 'react';

// Divi Dependencies.
import { ModuleContainer } from '@divi/module';

// Local Dependencies.
import { InstagramSlideshowEditProps, InstagramData, InstagramImage } from './types';
import { ModuleStyles } from './styles';
import { moduleClassnames } from './module-classnames';
import { ModuleScriptData } from './module-script-data';

/**
 * Instagram Slideshow edit component for Visual Builder.
 *
 * @since 1.0.0
 *
 * @param {InstagramSlideshowEditProps} props React component props.
 *
 * @returns {ReactElement}
 */
export const InstagramSlideshowEdit = (props: InstagramSlideshowEditProps): ReactElement => {
    const {
        attrs,
        elements,
        id,
        name,
    } = props;

    const [instagramData, setInstagramData] = useState<InstagramData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Get attribute values.
    const useLatest = attrs.useLatest?.desktop?.value ?? 'off';
    const latestIndexRaw = attrs.latestIndex?.desktop?.value ?? '1';
    const latestIndex = Math.max(1, parseInt(String(latestIndexRaw), 10) || 1);
    const postId = attrs.postId?.desktop?.value ?? '';
    const apiBaseUrl = attrs.apiBaseUrl?.desktop?.value ?? 'https://volksverpetzer-app.de/proxy/instaById/';
    const showCaption = attrs.showCaption?.desktop?.value ?? 'on';
    const showNavigation = attrs.showNavigation?.desktop?.value ?? 'on';
    const showPagination = attrs.showPagination?.desktop?.value ?? 'on';

    const feedApiUrl = apiBaseUrl.includes('instaById')
        ? apiBaseUrl.replace('instaById', 'instaFeed').replace(/\/$/, '')
        : 'https://volksverpetzer-app.de/proxy/instaFeed';

    // Fetch Instagram data when postId changes.
    useEffect(() => {
        let cancelled = false;

        const fetchById = (targetPostId: string) => {
            const apiUrl = `${apiBaseUrl.replace(/\/$/, '')}/${targetPostId}`;
            return fetch(apiUrl).then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            });
        };

        const fetchLatest = async () => {
            const response = await fetch(feedApiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const feedData = await response.json();
            const items = Array.isArray(feedData?.data) ? feedData.data : [];
            if (!items.length || !items[latestIndex - 1]?.id) {
                throw new Error('Latest index is out of range');
            }
            return fetchById(items[latestIndex - 1].id);
        };

        setLoading(true);
        setError(null);

        if (useLatest === 'on') {
            fetchLatest()
                .then((data: InstagramData) => {
                    if (cancelled) return;
                    setInstagramData(data);
                    setLoading(false);
                    setCurrentSlide(0);
                })
                .catch((err) => {
                    if (cancelled) return;
                    console.error('Instagram Slideshow Error:', err);
                    setError(err.message || 'Failed to fetch Instagram data');
                    setLoading(false);
                    setInstagramData(null);
                });
            return () => {
                cancelled = true;
            };
        }

        if (!postId) {
            setError('Please enter an Instagram Post ID');
            setLoading(false);
            setInstagramData(null);
            return () => {
                cancelled = true;
            };
        }

        fetchById(postId)
            .then((data: InstagramData) => {
                if (cancelled) return;
                setInstagramData(data);
                setLoading(false);
                setCurrentSlide(0);
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err.message || 'Failed to fetch Instagram data');
                setLoading(false);
                setInstagramData(null);
            });

        return () => {
            cancelled = true;
        };
    }, [postId, apiBaseUrl, useLatest, latestIndex]);

    // Extract images from Instagram data.
    const images: InstagramImage[] = instagramData?.children?.data ??
        (instagramData?.media_url ? [{ media_url: instagramData.media_url, id: instagramData.id ?? '' }] : []);

    // Navigation handlers.
    const goToPrevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNextSlide = () => {
        setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    return (
        <ModuleContainer
            attrs={attrs}
            elements={elements}
            id={id}
            name={name}
            stylesComponent={ModuleStyles}
            classnamesFunction={moduleClassnames}
            scriptDataComponent={ModuleScriptData}
        >
            {elements.styleComponents({
                attrName: 'module',
            })}
            <div className="instagram-slideshow__inner">
                {loading && (
                    <div className="instagram-slideshow__loading">
                        Loading Instagram post...
                    </div>
                )}

                {error && (
                    <div className="instagram-slideshow__error">
                        {error}
                    </div>
                )}

                {!loading && !error && images.length > 0 && (
                    <>
                        <div className="instagram-slideshow__container">
                            <div className="instagram-slideshow__slides">
                                {images.map((image, index) => {
                                    const isActive = index === currentSlide;
                                    const nextIndex = (currentSlide + 1) % images.length;
                                    const shouldLoad = images.length <= 1 || isActive || index === nextIndex;
                                    const src = shouldLoad
                                        ? image.media_url
                                        : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E";

                                    return (
                                        <div
                                            key={image.id || index}
                                            className={`instagram-slideshow__slide${index === currentSlide ? ' active' : ''}`}
                                            data-slide-index={index}
                                        >
                                            <img
                                                src={src}
                                                data-src={image.media_url}
                                                alt={`Instagram image ${index + 1}`}
                                                loading={index === 0 ? 'eager' : 'lazy'}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {showNavigation === 'on' && images.length > 1 && (
                                <>
                                    <button
                                        className="instagram-slideshow__nav instagram-slideshow__nav--prev"
                                        onClick={goToPrevSlide}
                                        aria-label="Previous slide"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        className="instagram-slideshow__nav instagram-slideshow__nav--next"
                                        onClick={goToNextSlide}
                                        aria-label="Next slide"
                                    >
                                        ›
                                    </button>
                                </>
                            )}

                            {showPagination === 'on' && images.length > 1 && (
                                <div className="instagram-slideshow__pagination">
                                    {images.map((_, index) => (
                                        <button
                                            key={index}
                                            className={`instagram-slideshow__dot${index === currentSlide ? ' active' : ''}`}
                                            onClick={() => goToSlide(index)}
                                            aria-label={`Go to slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {showCaption === 'on' && instagramData?.caption && (
                            <div className="instagram-slideshow__caption">
                                {instagramData.caption}
                            </div>
                        )}
                    </>
                )}

                {!loading && !error && images.length === 0 && postId && (
                    <div className="instagram-slideshow__error">
                        No images found in this Instagram post
                    </div>
                )}
            </div>
        </ModuleContainer>
    );
};
