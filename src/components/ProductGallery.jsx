import React, { useState, useRef, useMemo } from 'react';
import LazyImage from './LazyImage';
import '../styles/ProductGallery.css';

const ProductGallery = ({ productImage, productName }) => {
    const [activeIndex, setActiveIndex] = useState(0);
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
        }
    ], [productImage]);

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

    return (
        <div className="product-gallery">
            {/* Main Preview Container */}
            <div 
                ref={imageContainerRef}
                className="gallery-preview-container"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
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
        </div>
    );
};

export default ProductGallery;
