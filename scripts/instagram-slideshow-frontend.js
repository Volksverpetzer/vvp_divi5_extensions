/**
 * Instagram Slideshow Frontend Interactivity
 */
(function () {
    'use strict';

    /**
     * Initialize all Instagram Slideshows on the page.
     */
    function initSlideshows() {
        const slideshows = document.querySelectorAll('.instagram-slideshow__inner');

        slideshows.forEach(slideshow => {
            // Prevent multiple initializations
            if (slideshow.dataset.initialized) return;

            const container = slideshow.querySelector('.instagram-slideshow__container');
            if (!container) return;

            const slides = Array.from(container.querySelectorAll('.instagram-slideshow__slide'));
            const dots = Array.from(container.querySelectorAll('.instagram-slideshow__dot'));
            const prevBtn = container.querySelector('.instagram-slideshow__nav--prev');
            const nextBtn = container.querySelector('.instagram-slideshow__nav--next');

            const autoplay = slideshow.dataset.autoplay === 'on';
            const intervalTime = parseInt(slideshow.dataset.transitionSpeed || '3', 10) * 1000;

            let currentIndex = 0;
            let autoplayInterval = null;

            /**
             * Show a specific slide by index.
             */
            function showSlide(index) {
                // Remove active class from current slide and dot
                slides[currentIndex].classList.remove('active');
                if (dots.length > 0) {
                    dots[currentIndex].classList.remove('active');
                }

                // Set new index
                currentIndex = (index + slides.length) % slides.length;

                // Add active class to new slide and dot
                slides[currentIndex].classList.add('active');
                if (dots.length > 0) {
                    dots[currentIndex].classList.add('active');
                }
            }

            /**
             * Go to previous slide.
             */
            function prevSlide() {
                showSlide(currentIndex - 1);
            }

            /**
             * Go to next slide.
             */
            function nextSlide() {
                showSlide(currentIndex + 1);
            }

            /**
             * Start autoplay.
             */
            function startAutoplay() {
                if (!autoplay) return;
                stopAutoplay();
                autoplayInterval = setInterval(nextSlide, intervalTime);
            }

            /**
             * Stop autoplay.
             */
            function stopAutoplay() {
                if (autoplayInterval) {
                    clearInterval(autoplayInterval);
                    autoplayInterval = null;
                }
            }

            // Event Listeners
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    prevSlide();
                    stopAutoplay();
                    startAutoplay(); // Restart interval on manual click
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    nextSlide();
                    stopAutoplay();
                    startAutoplay(); // Restart interval on manual click
                });
            }

            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    showSlide(index);
                    stopAutoplay();
                    startAutoplay(); // Restart interval on manual click
                });
            });

            // Touch support
            let touchStartX = 0;
            let touchEndX = 0;

            container.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                stopAutoplay();
            }, { passive: true });

            container.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
                startAutoplay();
            }, { passive: true });

            function handleSwipe() {
                const swipeThreshold = 50;
                if (touchEndX < touchStartX - swipeThreshold) {
                    nextSlide();
                } else if (touchEndX > touchStartX + swipeThreshold) {
                    prevSlide();
                }
            }

            // Pause autoplay on hover
            container.addEventListener('mouseenter', stopAutoplay);
            container.addEventListener('mouseleave', startAutoplay);

            // Keyboard navigation
            window.addEventListener('keydown', (e) => {
                // Only if container is in viewport
                const rect = container.getBoundingClientRect();
                const inView = rect.top >= 0 && rect.bottom <= window.innerHeight;

                if (inView) {
                    if (e.key === 'ArrowLeft') {
                        prevSlide();
                    } else if (e.key === 'ArrowRight') {
                        nextSlide();
                    }
                }
            });

            // Start autoplay if enabled
            startAutoplay();

            // Mark as initialized
            slideshow.dataset.initialized = 'true';
        });
    }

    // Initialize on DOM load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSlideshows);
    } else {
        initSlideshows();
    }

    // Handle DIVI AJAX loads or visual builder updates
    if (window.jQuery) {
        window.jQuery(document).on('ajaxComplete et_pb_reinit_modules', function () {
            setTimeout(initSlideshows, 100);
        });
    }
})();
