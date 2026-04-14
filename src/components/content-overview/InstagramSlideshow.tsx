import React, { useState, useEffect } from 'react';
import classnames from 'classnames';

interface Slide {
    thumb: string;
    video: string;
}

interface InstagramSlideshowProps {
    permalink: string;
    caption: string;
    date: string;
    badgeLabel: string;
    slides: Slide[];
    isCarousel: boolean;
}

const InstaIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
);

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
);

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
);

const InternalSlider = ({ slides, activeIndex, setActiveIndex, isCarousel, caption, playingVideos, setPlayingVideos, onCenterClick }) => {
    const [showArrows, setShowArrows] = useState(false);
    const arrowTimeout = React.useRef<NodeJS.Timeout | null>(null);

    const touchStartX = React.useRef<number>(0);
    const touchEndX = React.useRef<number>(0);

    const handleNext = (e?: React.MouseEvent) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        setPlayingVideos({});
        setActiveIndex((prev: number) => (prev + 1) % slides.length);
    };

    const handlePrev = (e?: React.MouseEvent) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        setPlayingVideos({});
        setActiveIndex((prev: number) => (prev - 1 + slides.length) % slides.length);
    };

    const handleMouseMove = () => {
        setShowArrows(true);
        if (arrowTimeout.current) clearTimeout(arrowTimeout.current);
        arrowTimeout.current = setTimeout(() => setShowArrows(false), 1500);
    };

    const handleMouseLeave = () => {
        if (arrowTimeout.current) clearTimeout(arrowTimeout.current);
        setShowArrows(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
        touchEndX.current = e.targetTouches[0].clientX;
    };
    const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.targetTouches[0].clientX; };
    const handleTouchEnd = () => {
        const distance = touchStartX.current - touchEndX.current;
        if (Math.abs(distance) > 40) {
            distance > 0 ? handleNext() : handlePrev();
        }
    };

    return (
        <div
            className="vvp-co__insta-slider-wrap"
            style={{ position: 'relative' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className={classnames('vvp-co-slider vvp-co-slider-fullwidth-off', {
                'vvp-co-slider-no-arrows': !isCarousel,
                'vvp-co-slider-no-pagination': !isCarousel
            })} style={{ paddingBottom: 0 }}>
                <div className="vvp-co-slides" style={{ position: 'relative', overflow: 'hidden' }}>
                    {slides.map((slide: Slide, index: number) => {
                        const isVideo = !!slide.video;
                        const isActive = index === activeIndex;
                        const isPlaying = !!playingVideos[index];
                        const len = slides.length;
                        const isNearActive = index === activeIndex
                            || index === (activeIndex + 1) % len
                            || index === (activeIndex - 1 + len) % len;

                        return (
                            <div
                                className={classnames('vvp-co-slide vvp-co-slide-with-image', { 'vvp-co-active-slide': isActive })}
                                key={index}
                                style={{ display: isActive ? 'block' : 'none', transition: 'all 0.4s ease-in-out' }}
                            >
                                <div className="vvp-co-container clearfix">
                                    <div className="vvp-co-slider-container-inner">
                                        {isVideo ? (
                                            <div className="vvp-co-slide-image" style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
                                                {!isPlaying ? (
                                                    <div
                                                        style={{ position: 'relative', cursor: 'pointer', width: '100%', height: '100%' }}
                                                        onClick={() => setPlayingVideos({ [index]: true })}
                                                        onMouseEnter={() => setPlayingVideos({ [index]: true })}
                                                    >
                                                        {isNearActive && <img src={slide.thumb || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='} alt={caption} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading={index === 0 ? 'eager' : 'lazy'} />}
                                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <video loop playsInline preload="metadata" controls autoPlay muted
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                        onPlay={(e) => {
                                                            const t = e.currentTarget;
                                                            document.querySelectorAll('video').forEach(v => { if (v !== t) v.pause(); });
                                                        }}
                                                    >
                                                        <source type="video/mp4" src={slide.video} />
                                                    </video>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="vvp-co-slide-image" style={{ aspectRatio: '3/4', overflow: 'hidden' }}>
                                                {isNearActive && <img src={slide.thumb} alt={caption} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Always-present navigation zones — invisible but fully clickable */}
                    {isCarousel && (
                        <>
                            {/* Left zone: prev */}
                            <button
                                type="button"
                                onClick={handlePrev}
                                aria-label="Vorheriges Bild"
                                style={{
                                    position: 'absolute', top: 0, left: 0,
                                    width: '30%', height: '100%',
                                    background: 'transparent', border: 'none',
                                    cursor: 'pointer', zIndex: 9,
                                    display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 10,
                                }}
                            >
                                <span style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'rgba(255,255,255,0.8)', color: '#000',
                                    borderRadius: '50%', width: 36, height: 36,
                                    opacity: showArrows ? 1 : 0,
                                    transition: 'opacity 0.2s',
                                    pointerEvents: 'none',
                                }}>
                                    <ArrowLeftIcon />
                                </span>
                            </button>

                            {/* Center zone: open fullscreen overlay */}
                            {onCenterClick && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onCenterClick(); }}
                                    aria-label="Vollbild öffnen"
                                    style={{
                                        position: 'absolute', top: 0, left: '30%',
                                        width: '40%', height: '100%',
                                        background: 'transparent', border: 'none',
                                        cursor: 'zoom-in', zIndex: 9,
                                    }}
                                />
                            )}

                            {/* Right zone: next */}
                            <button
                                type="button"
                                onClick={handleNext}
                                aria-label="Nächstes Bild"
                                style={{
                                    position: 'absolute', top: 0, right: 0,
                                    width: '30%', height: '100%',
                                    background: 'transparent', border: 'none',
                                    cursor: 'pointer', zIndex: 9,
                                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 10,
                                }}
                            >
                                <span style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'rgba(255,255,255,0.8)', color: '#000',
                                    borderRadius: '50%', width: 36, height: 36,
                                    opacity: showArrows ? 1 : 0,
                                    transition: 'opacity 0.2s',
                                    pointerEvents: 'none',
                                }}>
                                    <ArrowRightIcon />
                                </span>
                            </button>
                        </>
                    )}
                </div>

                {isCarousel && (
                    <div className="vvp-co-controllers" style={{ position: 'relative', marginTop: 10, paddingBottom: 0, display: 'flex', justifyContent: 'center', gap: 6, zIndex: 10 }}>
                        {slides.map((_: Slide, index: number) => (
                            <button
                                key={index}
                                type="button"
                                aria-label={`Bild ${index + 1}`}
                                style={{ width: 8, height: 8, borderRadius: '50%', background: index === activeIndex ? '#808080' : 'rgba(128, 128, 128, 0.5)', border: 'none', padding: 0, cursor: 'pointer' }}
                                onClick={(e) => { e.stopPropagation(); setActiveIndex(index); }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export const InstagramSlideshow: React.FC<InstagramSlideshowProps> = ({ permalink, caption, date, badgeLabel, slides, isCarousel }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [playingVideos, setPlayingVideos] = useState<Record<number, boolean>>({});
    const [isFullscreen, setFullscreen] = useState(false);

    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isFullscreen]);

    return (
        <>
            <div className="vvp-co__feed-card vvp-co__feed-card--insta">
                <InternalSlider 
                    slides={slides} activeIndex={activeIndex} setActiveIndex={setActiveIndex} 
                    isCarousel={isCarousel} caption={caption} 
                    playingVideos={playingVideos} setPlayingVideos={setPlayingVideos}
                    onCenterClick={() => setFullscreen(true)}
                />
                
                <div 
                    className="vvp-co__feed-body vvp-co__feed-body--link" 
                    onClick={() => setFullscreen(true)}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="vvp-co__feed-meta">
                        <span className="vvp-co__badge vvp-co__badge--insta">
                            <InstaIcon />
                            {badgeLabel}
                        </span>
                    </div>
                    {caption && <p className="vvp-co__feed-excerpt vvp-co__feed-excerpt--insta" style={{ pointerEvents: 'none' }}>{caption}</p>}
                    <span className="vvp-co__feed-date" style={{ pointerEvents: 'none' }}>{date}</span>
                </div>
            </div>

            {isFullscreen && (
                <div 
                    onClick={() => setFullscreen(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
                        background: 'rgba(0,0,0,0.95)', zIndex: 99999, overflowY: 'auto', display: 'block'
                    }}
                >
                    <button 
                        onClick={() => setFullscreen(false)} 
                        style={{ position: 'fixed', top: 20, right: 30, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: 32, cursor: 'pointer', zIndex: 100000, width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        &times;
                    </button>

                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{ margin: '0 auto 60px auto', width: '100%', maxWidth: 700, padding: '80px 20px 0', display: 'flex', flexDirection: 'column', gap: 20 }}
                    >
                        <InternalSlider 
                            slides={slides} activeIndex={activeIndex} setActiveIndex={setActiveIndex} 
                            isCarousel={isCarousel} caption={caption} 
                            playingVideos={playingVideos} setPlayingVideos={setPlayingVideos}
                            onCenterClick={null}
                        />
                        
                        <div style={{ background: '#111', padding: 20, borderRadius: 12, color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                                <span className="vvp-co__badge vvp-co__badge--insta">
                                    <InstaIcon />
                                    {badgeLabel}
                                </span>
                                
                                <a href={permalink} target="_blank" rel="noopener noreferrer" style={{ color: '#3893C0', textDecoration: 'none', fontSize: 13, fontWeight: 'bold' }}>
                                    Auf Instagram ansehen ↗
                                </a>
                            </div>
                            <p className="vvp-co__insta-fullscreen-caption" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: 15, margin: 0 }}>{caption}</p>
                            <div style={{ marginTop: 20, color: '#666', fontSize: 13 }}>{date}</div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
