import React, { useState, useEffect } from "react";
import { Badge } from "@volksverpetzer/ui-web";
import classnames from "classnames";

interface Slide {
  thumb: string;
  video: string;
}

interface InstagramSlideshowProps {
  permalink: string;
  postId?: string;
  caption: string;
  date: string;
  badgeLabel: string;
  mediaCategory?: string;
  slides: Slide[];
  isCarousel: boolean;
}

const trackInstaView = (postId: string) => {
  if (!postId) return;
  try {
    if (typeof window.plausible === "function") {
      window.plausible("pageview", {
        u: window.location.origin + "/insta/" + postId,
      });
    }
  } catch (_) {}
};

const parseCaption = (text: string): React.ReactNode[] => {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#3893C0", wordBreak: "break-all" }}
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
};

const InstaIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const LoadingPlaceholder = () => (
  <div
    className="vvp-co__ig-loading-placeholder"
    style={{
      width: "100%",
      height: "100%",
      background:
        "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%)",
      backgroundSize: "600px 100%",
      borderRadius: "0.25rem",
    }}
  />
);

const ArrowLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const BrokenImageFallback = ({ permalink }: { permalink: string }) => (
  <a
    href={permalink}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      background: "var(--vvp-surface, #f0f0f0)",
      color: "var(--vvp-text-muted, #666)",
      textDecoration: "none",
      fontSize: 13,
      textAlign: "center",
      padding: "0 1rem",
    }}
    onClick={(e) => e.stopPropagation()}
  >
    <InstaIcon />
    <span>Bild nicht verfügbar — auf Instagram ansehen ↗</span>
  </a>
);

const InternalSlider = ({
  slides,
  activeIndex,
  setActiveIndex,
  isCarousel,
  caption,
  playingVideos,
  setPlayingVideos,
  onCenterClick,
  onVideoPlay,
  permalink,
  fullscreen = false,
}) => {
  const [showArrows, setShowArrows] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const arrowTimeout = React.useRef<NodeJS.Timeout | null>(null);
  // The always-present nav zones below cover the full slide area and sit
  // above the fallback link, so clicks never reach it — route the center
  // zone to the permalink instead of the fullscreen overlay while the
  // active slide is in its failed state, so there's still a way to reach it.
  const activeFailed = failedImages.has(activeIndex);

  useEffect(() => {
    const onFsChange = () => {
      setIsNativeFullscreen(
        !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement
        ),
      );
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, []);

  const touchStartX = React.useRef<number>(0);
  const touchEndX = React.useRef<number>(0);

  // Preload images for current slide and nearby slides
  useEffect(() => {
    const preloadImages = () => {
      const imagesToPreload = [activeIndex];
      // Preload previous and next slides
      if (activeIndex > 0) imagesToPreload.push(activeIndex - 1);
      if (activeIndex < slides.length - 1)
        imagesToPreload.push(activeIndex + 1);

      imagesToPreload.forEach((index) => {
        if (
          !loadedImages.has(index) &&
          !failedImages.has(index) &&
          slides[index]?.thumb
        ) {
          const img = new Image();
          img.src = slides[index].thumb;
          img.onload = () => {
            setLoadedImages((prev) => new Set(prev).add(index));
          };
          img.onerror = () => {
            setFailedImages((prev) => new Set(prev).add(index));
          };
        }
      });
    };

    preloadImages();
  }, [activeIndex, loadedImages, failedImages, slides]);

  // Preload first slide immediately on mount
  useEffect(() => {
    if (slides[0]?.thumb && !loadedImages.has(0) && !failedImages.has(0)) {
      const img = new Image();
      img.src = slides[0].thumb;
      img.onload = () => {
        setLoadedImages((prev) => new Set(prev).add(0));
      };
      img.onerror = () => {
        setFailedImages((prev) => new Set(prev).add(0));
      };
    }
  }, [slides, loadedImages, failedImages]);

  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setPlayingVideos({});
    setActiveIndex((prev: number) => (prev + 1) % slides.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setPlayingVideos({});
    setActiveIndex(
      (prev: number) => (prev - 1 + slides.length) % slides.length,
    );
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
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) > 40) {
      distance > 0 ? handleNext() : handlePrev();
    }
  };

  return (
    <div
      className="vvp-co__insta-slider-wrap"
      style={{ position: "relative" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={classnames("vvp-co-slider vvp-co-slider-fullwidth-off", {
          "vvp-co-slider-no-arrows": !isCarousel,
          "vvp-co-slider-no-pagination": !isCarousel,
        })}
        style={{ paddingBottom: 0 }}
      >
        <div
          className="vvp-co-slides"
          style={{ position: "relative", overflow: "visible", width: "100%" }}
        >
          {slides.map((slide: Slide, index: number) => {
            const isVideo = !!slide.video;
            const isActive = index === activeIndex;
            const isPlaying = !!playingVideos[index];
            return (
              <div
                className={classnames("vvp-co-slide vvp-co-slide-with-image", {
                  "vvp-co-active-slide": isActive,
                })}
                key={index}
                style={{ display: isActive ? "block" : "none" }}
              >
                {isVideo ? (
                  <div
                    className="vvp-co-slide-image"
                    style={
                      fullscreen
                        ? {
                            position: "relative",
                            height: "70vh",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }
                        : {
                            position: "relative",
                            width: "100%",
                            aspectRatio: "3 / 4",
                            overflow: "hidden",
                          }
                    }
                  >
                    {!isPlaying ? (
                      <div
                        style={{
                          position: "relative",
                          cursor: "pointer",
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onClick={() => {
                          setPlayingVideos({ [index]: true });
                          onVideoPlay?.();
                        }}
                        onMouseEnter={() => {
                          setPlayingVideos({ [index]: true });
                          onVideoPlay?.();
                        }}
                      >
                        {loadedImages.has(index) ? (
                          <img
                            src={
                              slide.thumb ||
                              "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                            }
                            alt={caption}
                            style={
                              fullscreen
                                ? {
                                    height: "100%",
                                    width: "auto",
                                    maxWidth: "100%",
                                    objectFit: "contain",
                                    display: "block",
                                    opacity: 0,
                                    transition: "opacity 0.3s ease",
                                  }
                                : {
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                    opacity: 0,
                                    transition: "opacity 0.3s ease",
                                  }
                            }
                            loading={index === 0 ? "eager" : "lazy"}
                            onLoad={(e) => {
                              // Mark image as loaded
                              setLoadedImages((prev) =>
                                new Set(prev).add(index),
                              );
                              e.currentTarget.style.opacity = "1";
                            }}
                          />
                        ) : failedImages.has(index) ? (
                          <BrokenImageFallback permalink={permalink} />
                        ) : (
                          <LoadingPlaceholder />
                        )}
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            background: "rgba(0,0,0,0.6)",
                            borderRadius: "50%",
                            width: 64,
                            height: 64,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="white"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <video
                        loop
                        playsInline
                        preload="metadata"
                        controls
                        autoPlay
                        muted
                        style={
                          fullscreen || isNativeFullscreen
                            ? {
                                height: "70vh",
                                width: "auto",
                                maxWidth: "100%",
                                objectFit: "contain",
                                display: "block",
                              }
                            : {
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }
                        }
                        onPlay={(e) => {
                          const t = e.currentTarget;
                          document.querySelectorAll("video").forEach((v) => {
                            if (v !== t) v.pause();
                          });
                        }}
                      >
                        <source type="video/mp4" src={slide.video} />
                      </video>
                    )}
                  </div>
                ) : (
                  <div
                    className="vvp-co-slide-image"
                    style={
                      fullscreen
                        ? {
                            height: "70vh",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }
                        : {
                            width: "100%",
                            aspectRatio: "3 / 4",
                            overflow: "hidden",
                          }
                    }
                  >
                    {loadedImages.has(index) ? (
                      <img
                        src={slide.thumb}
                        alt={caption}
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding="async"
                        style={
                          fullscreen
                            ? {
                                height: "100%",
                                width: "auto",
                                maxWidth: "100%",
                                objectFit: "contain",
                                display: "block",
                                opacity: 0,
                                transition: "opacity 0.3s ease",
                              }
                            : {
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                                opacity: 0,
                                transition: "opacity 0.3s ease",
                              }
                        }
                        onLoad={(e) => {
                          // Mark image as loaded
                          setLoadedImages((prev) => new Set(prev).add(index));
                          e.currentTarget.style.opacity = "1";
                        }}
                      />
                    ) : failedImages.has(index) ? (
                      <BrokenImageFallback permalink={permalink} />
                    ) : (
                      <LoadingPlaceholder />
                    )}
                  </div>
                )}
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
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "30%",
                  height: "100%",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  zIndex: 9,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  paddingLeft: 10,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.8)",
                    color: "#000",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    opacity: showArrows ? 1 : 0,
                    transition: "opacity 0.2s",
                    pointerEvents: "none",
                  }}
                >
                  <ArrowLeftIcon />
                </span>
              </button>

              {/* Center zone: open fullscreen overlay, or the Instagram
                  permalink when the active slide failed to load — it sits
                  above the fallback link and would otherwise swallow every
                  click meant for it. */}
              {(onCenterClick || activeFailed) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (activeFailed) {
                      window.open(permalink, "_blank", "noopener,noreferrer");
                    } else {
                      onCenterClick();
                    }
                  }}
                  aria-label={
                    activeFailed ? "Auf Instagram ansehen" : "Vollbild öffnen"
                  }
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "30%",
                    width: "40%",
                    height: "100%",
                    background: "transparent",
                    border: "none",
                    cursor: activeFailed ? "pointer" : "zoom-in",
                    zIndex: 9,
                  }}
                />
              )}

              {/* Right zone: next */}
              <button
                type="button"
                onClick={handleNext}
                aria-label="Nächstes Bild"
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "30%",
                  height: "100%",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  zIndex: 9,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: 10,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.8)",
                    color: "#000",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    opacity: showArrows ? 1 : 0,
                    transition: "opacity 0.2s",
                    pointerEvents: "none",
                  }}
                >
                  <ArrowRightIcon />
                </span>
              </button>
            </>
          )}
        </div>

        {isCarousel && (
          <div
            className="vvp-co-controllers"
            style={{
              position: "relative",
              marginTop: 10,
              paddingBottom: 0,
              display: "flex",
              justifyContent: "center",
              gap: 6,
              zIndex: 10,
            }}
          >
            {slides.map((_: Slide, index: number) => (
              <span
                key={index}
                aria-hidden="true"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background:
                    index === activeIndex
                      ? "#808080"
                      : "rgba(128, 128, 128, 0.5)",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        )}
        {caption && (
          <p
            className="vvp-co__feed-excerpt vvp-co__feed-excerpt--insta"
            onClick={() => onCenterClick && onCenterClick()}
            style={{
              marginTop: "10px",
              textAlign: "left",
              maxWidth: "100%",
              padding: "0 .875rem",
              pointerEvents: onCenterClick ? "auto" : "none",
              cursor: onCenterClick ? "zoom-in" : "default",
              WebkitLineClamp: isCarousel ? 3 : 4,
            }}
          >
            {caption}
          </p>
        )}
      </div>
    </div>
  );
};

export const InstagramSlideshow: React.FC<InstagramSlideshowProps> = ({
  permalink,
  postId = "",
  caption,
  date,
  badgeLabel,
  mediaCategory,
  slides,
  isCarousel,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playingVideos, setPlayingVideos] = useState<Record<number, boolean>>(
    {},
  );
  const [isFullscreen, setFullscreen] = useState(false);
  const trackedSwipe = React.useRef(false);
  const trackedPlay = React.useRef(false);

  const handleVideoPlay = () => {
    if (!trackedPlay.current) {
      trackedPlay.current = true;
      trackInstaView(postId);
    }
  };

  useEffect(() => {
    if (!trackedSwipe.current && activeIndex >= 1) {
      trackedSwipe.current = true;
      trackInstaView(postId);
    }
  }, [activeIndex, postId]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  return (
    <>
      <div className="vvp-co__feed-card vvp-co__feed-card--insta">
        <InternalSlider
          slides={slides}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          isCarousel={isCarousel}
          caption={caption}
          playingVideos={playingVideos}
          setPlayingVideos={setPlayingVideos}
          onCenterClick={() => {
            setFullscreen(true);
            trackInstaView(postId);
          }}
          onVideoPlay={handleVideoPlay}
          permalink={permalink}
        />

        <div
          className="vvp-co__feed-body vvp-co__feed-body--link"
          onClick={() => setFullscreen(true)}
          style={{ cursor: "pointer" }}
        >
          <div className="vvp-co__feed-footer">
            <Badge
              variant="accent"
              size="md"
              icon={<InstaIcon />}
              style={{ pointerEvents: "none" }}
            >
              {badgeLabel}
            </Badge>
            {mediaCategory && (
              <span
                className="vvp-co__category"
                style={{ pointerEvents: "none" }}
              >
                {mediaCategory}
              </span>
            )}
            <span
              className="vvp-co__feed-date"
              style={{ pointerEvents: "none" }}
            >
              {date}
            </span>
          </div>
        </div>
      </div>

      {isFullscreen && (
        <div
          onClick={() => setFullscreen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.95)",
            zIndex: 99999,
            overflowY: "auto",
            display: "block",
          }}
        >
          <button
            onClick={() => setFullscreen(false)}
            style={{
              position: "fixed",
              top: 20,
              right: 30,
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "white",
              fontSize: 32,
              cursor: "pointer",
              zIndex: 100000,
              width: 48,
              height: 48,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            &times;
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              margin: "0 auto",
              width: "100%",
              maxWidth: 700,
              padding: "100px 20px 40px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <InternalSlider
              slides={slides}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              isCarousel={isCarousel}
              caption=""
              playingVideos={playingVideos}
              setPlayingVideos={setPlayingVideos}
              onCenterClick={null}
              onVideoPlay={handleVideoPlay}
              permalink={permalink}
              fullscreen={true}
            />

            <div
              style={{
                background: "#111",
                padding: "25px 20px",
                borderRadius: 12,
                color: "white",
                marginTop: 25,
                marginBottom: 25,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 15,
                }}
              >
                <Badge variant="accent" size="md" icon={<InstaIcon />}>
                  {badgeLabel}
                </Badge>

                <a
                  href={permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#3893C0",
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: "bold",
                  }}
                >
                  Auf Instagram ansehen ↗
                </a>
              </div>
              <p
                className="vvp-co__insta-fullscreen-caption"
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                  fontSize: 15,
                  margin: 0,
                }}
              >
                {parseCaption(caption)}
              </p>
              <div style={{ marginTop: 20, color: "#666", fontSize: 13 }}>
                {date}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
