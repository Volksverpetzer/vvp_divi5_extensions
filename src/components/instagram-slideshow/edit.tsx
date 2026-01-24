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
    const postId = attrs.postId?.desktop?.value ?? '';
    const apiBaseUrl = attrs.apiBaseUrl?.desktop?.value ?? 'https://volksverpetzer-app.de/proxy/instaById/';
    const showCaption = attrs.showCaption?.desktop?.value ?? 'on';
    const showNavigation = attrs.showNavigation?.desktop?.value ?? 'on';
    const showPagination = attrs.showPagination?.desktop?.value ?? 'on';

    // Fetch Instagram data when postId changes.
    useEffect(() => {
        if (!postId) {
            setError('Please enter an Instagram Post ID');
            setInstagramData(null);
            return;
        }

        setLoading(true);
        setError(null);

        const apiUrl = `${apiBaseUrl.replace(/\/$/, '')}/${postId}`;

        fetch(apiUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data: InstagramData) => {
                setInstagramData(data);
                setLoading(false);
                setCurrentSlide(0);
            })
            .catch((err) => {
                setError(err.message || 'Failed to fetch Instagram data');
                setLoading(false);
                setInstagramData(null);
            });
    }, [postId, apiBaseUrl]);

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
                                {images.map((image, index) => (
                                    <div
                                        key={image.id || index}
                                        className={`instagram-slideshow__slide${index === currentSlide ? ' active' : ''}`}
                                        data-slide-index={index}
                                        style={{ display: index === currentSlide ? 'block' : 'none' }}
                                    >
                                        <img
                                            src={image.media_url}
                                            alt={`Instagram image ${index + 1}`}
                                            loading={index === 0 ? 'eager' : 'lazy'}
                                        />
                                    </div>
                                ))}
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
