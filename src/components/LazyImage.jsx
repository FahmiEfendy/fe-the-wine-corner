import React, { useState, useEffect, useRef } from 'react';
import '../styles/LazyImage.css';

const LazyImage = ({ src, alt, className, containerStyle, ...props }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef();

    useEffect(() => {
        if (typeof IntersectionObserver === 'undefined') {
            setIsInView(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '100px' }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const isExternal = src && src.startsWith('http');
    const defaultFallback = 'https://static.thenounproject.com/png/26593-200.png';

    let imageUrls = {
        src: defaultFallback,
        srcSet: undefined,
        sizes: undefined
    };

    if (src) {
        if (isExternal) {
            imageUrls = { src };
        } else {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
            const fullUrl = src.startsWith('/') ? `${baseUrl}${src}` : `${baseUrl}/${src}`;
            imageUrls = {
                src: `${fullUrl}?w=600`,
                srcSet: `${fullUrl}?w=300 300w, ${fullUrl}?w=600 600w, ${fullUrl}?w=1200 1200w`,
                sizes: `(max-width: 600px) 300px, (max-width: 1200px) 600px, 1200px`
            };
        }
    }

    return (
        <div 
            ref={imgRef} 
            className={`lazy-image-container ${isLoaded ? 'loaded' : ''}`}
            style={containerStyle}
        >
            {!isLoaded && !isError && <div className="lazy-image-skeleton" />}
            {isInView && (
                <img
                    src={isError ? defaultFallback : imageUrls.src}
                    srcSet={isError ? undefined : imageUrls.srcSet}
                    sizes={isError ? undefined : imageUrls.sizes}
                    alt={alt}
                    className={`lazy-image-el ${className || ''} ${isLoaded ? 'fade-in-image' : 'hidden-image'}`}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => {
                        setIsError(true);
                        setIsLoaded(true);
                    }}
                    loading="lazy"
                    {...props}
                />
            )}
        </div>
    );
};

export default LazyImage;
