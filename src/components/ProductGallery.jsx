import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import LazyImage from './LazyImage';
import '../styles/ProductGallery.css';

const ProductGallery = ({ productImage, productName }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [scale, setScale] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const imageContainerRef = useRef(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    // Build the gallery views based on the single product image — memoized to avoid re-renders
    const galleryItems = useMemo(() => [
        {
            id: 'front',
            label: 'Bottle View',
            type: 'standard',
            src: productImage
        },
        {
            id: 'label',
            label: 'Label Detail',
            type: 'zoom-crop',
            src: productImage
        },
        {
            id: 'presentation',
            label: 'Premium Display',
            type: 'presentation',
            src: productImage
        }
    ], [productImage]);

    // Reset zoom when active item or lightbox state changes
    useEffect(() => {
        setScale(1);
        setPanOffset({ x: 0, y: 0 });
    }, [activeIndex, isLightboxOpen]);

    // Handle desktop hover zoom — throttled via requestAnimationFrame to prevent excessive re-renders
    const rafRef = useRef(null);
    const handleMouseMove = (e) => {
        if (!imageContainerRef.current) return;
        if (rafRef.current) return;
        rafRef.current = requestAnimationFrame(() => {
            if (!imageContainerRef.current) return;
            const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
            const x = ((e.clientX - left) / width) * 100;
            const y = ((e.clientY - top) / height) * 100;
            setMousePos({ x, y });
            rafRef.current = null;
        });
    };

    // Zoom controls
    const zoomIn = () => setScale(prev => Math.min(prev + 0.5, 4));
    const zoomOut = () => {
        setScale(prev => {
            const next = prev - 0.5;
            if (next <= 1) {
                setPanOffset({ x: 0, y: 0 });
                return 1;
            }
            return next;
        });
    };
    const resetZoom = () => {
        setScale(1);
        setPanOffset({ x: 0, y: 0 });
    };

    // Toggle zoom on double click/tap
    const handleDoubleTap = () => {
        if (scale > 1) {
            resetZoom();
        } else {
            setScale(2.5);
        }
    };

    const handleNext = useCallback(() => {
        setActiveIndex(prev => (prev + 1) % galleryItems.length);
    }, [galleryItems.length]);

    const handlePrev = useCallback(() => {
        setActiveIndex(prev => (prev - 1 + galleryItems.length) % galleryItems.length);
    }, [galleryItems.length]);

    // Keyboard controls — depends on stable handleNext/handlePrev
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isLightboxOpen) return;
            if (e.key === 'Escape') setIsLightboxOpen(false);
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen, handleNext, handlePrev]);

    // Swiping gestures in Lightbox
    const handleDragEnd = (event, info) => {
        if (scale > 1) return; // Allow panning instead of swiping when zoomed

        const swipeThreshold = 50;
        const swipeYThreshold = 100;

        // Dismiss on swipe down/up
        if (Math.abs(info.offset.y) > swipeYThreshold && Math.abs(info.offset.x) < 40) {
            setIsLightboxOpen(false);
            return;
        }

        // Navigate on swipe left/right
        if (info.offset.x < -swipeThreshold) {
            handleNext();
        } else if (info.offset.x > swipeThreshold) {
            handlePrev();
        }
    };

    return (
        <div className="product-gallery">
            {/* Main Preview Container */}
            <div 
                ref={imageContainerRef}
                className="gallery-preview-container"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => setIsLightboxOpen(true)}
            >
                <div className={`gallery-preview-wrapper view-${galleryItems[activeIndex].type}`}>
                    <LazyImage 
                        src={galleryItems[activeIndex].src} 
                        alt={`${productName} - ${galleryItems[activeIndex].label}`}
                        className="gallery-preview-image"
                    />
                    
                    {/* Hover Zoom overlay for desktop */}
                    {isHovered && galleryItems[activeIndex].type === 'standard' && (
                        <div 
                            className="desktop-zoom-lens"
                            style={{
                                backgroundImage: `url(${
                                    productImage.startsWith('http') 
                                        ? productImage 
                                        : `${import.meta.env.VITE_API_BASE_URL}/${productImage}`
                                })`,
                                backgroundPosition: `${mousePos.x}% ${mousePos.y}%`
                            }}
                        />
                    )}

                    <div className="gallery-action-hint">
                        <Maximize2 size={16} /> Click to expand & zoom
                    </div>
                </div>
            </div>

            {/* Thumbnail Controls */}
            <div className="gallery-thumbnails">
                {galleryItems.map((item, index) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveIndex(index)}
                        className={`thumbnail-btn ${activeIndex === index ? 'active' : ''}`}
                    >
                        <div className={`thumbnail-preview-wrapper view-${item.type}`}>
                            <LazyImage 
                                src={item.src} 
                                alt={item.label}
                                className="thumbnail-image"
                            />
                        </div>
                        <span className="thumbnail-label">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Lightbox Modal (Fullscreen zoomable gallery) */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lightbox-overlay"
                    >
                        {/* Header Controls */}
                        <div className="lightbox-header">
                            <span className="lightbox-title">{productName} — {galleryItems[activeIndex].label}</span>
                            <div className="lightbox-controls">
                                <button className="control-btn" onClick={zoomIn} title="Zoom In"><ZoomIn size={20} /></button>
                                <button className="control-btn" onClick={zoomOut} title="Zoom Out"><ZoomOut size={20} /></button>
                                <button className="control-btn" onClick={resetZoom} title="Reset"><RotateCcw size={20} /></button>
                                <button className="control-btn close-btn" onClick={() => setIsLightboxOpen(false)} title="Close"><X size={22} /></button>
                            </div>
                        </div>

                        {/* Navigation Arrows (Desktop) */}
                        <button className="nav-arrow prev" onClick={handlePrev}><ChevronLeft size={36} /></button>
                        <button className="nav-arrow next" onClick={handleNext}><ChevronRight size={36} /></button>

                        {/* Drag/Zoom Slide Area */}
                        <div className="lightbox-slide-area" onClick={(e) => {
                            if (e.target === e.currentTarget) setIsLightboxOpen(false);
                        }}>
                            <motion.div
                                className="lightbox-image-wrapper"
                                style={{
                                    x: panOffset.x,
                                    y: panOffset.y,
                                }}
                                drag={scale > 1}
                                dragConstraints={{
                                    left: -200 * scale,
                                    right: 200 * scale,
                                    top: -200 * scale,
                                    bottom: 200 * scale
                                }}
                                dragElastic={0.15}
                                onDragEnd={(e, info) => {
                                    if (scale > 1) {
                                        // Use offset (relative drag delta), not point (absolute screen position)
                                        setPanOffset(prev => ({ x: prev.x + info.offset.x * 0.5, y: prev.y + info.offset.y * 0.5 }));
                                    } else {
                                        handleDragEnd(e, info);
                                    }
                                }}
                            >
                                <motion.div
                                    animate={{ scale }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                                    onDoubleClick={handleDoubleTap}
                                    className={`lightbox-img-container view-${galleryItems[activeIndex].type}`}
                                >
                                    <img
                                        src={
                                            galleryItems[activeIndex].src.startsWith('http')
                                                ? galleryItems[activeIndex].src
                                                : `${import.meta.env.VITE_API_BASE_URL}/${galleryItems[activeIndex].src}`
                                        }
                                        alt={productName}
                                        className="lightbox-image"
                                        draggable="false"
                                    />
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Mobile Gestures Indicator */}
                        <div className="lightbox-footer">
                            <p className="hint-text">Double-tap to zoom • Swipe to navigate/dismiss</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductGallery;
