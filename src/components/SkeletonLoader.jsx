import React from 'react';
import '../styles/SkeletonLoader.css';

export const SkeletonCard = () => {
    return (
        <div className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-info">
                <div className="skeleton-line title"></div>
                <div className="skeleton-line price"></div>
            </div>
        </div>
    );
};

export const SkeletonCategory = () => {
    return (
        <div className="skeleton-category">
            <div className="skeleton-overlay"></div>
        </div>
    );
};

export const SkeletonList = ({ count = 6, type = 'product' }) => {
    return (
        <div className={type === 'product' ? 'product-grid' : 'explore-grid'}>
            {[...Array(count)].map((_, i) => (
                type === 'product' ? <SkeletonCard key={i} /> : <SkeletonCategory key={i} />
            ))}
        </div>
    );
};

export default SkeletonList;
