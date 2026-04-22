import api from '../utils/api';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import SkeletonList from '../components/SkeletonLoader';

import '../styles/Category.css';

const Category = () => {
    const { categoryPath } = useParams();
    const [error, setError] = useState('');
    const [order, setOrder] = useState('DESC');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [category, setCategory] = useState(null);
    const [sortBy, setSortBy] = useState('createdAt');
    const [pagination, setPagination] = useState({ page: 1, lastPage: 1 });

    useEffect(() => {
        fetchCategoryData(1, minPrice, maxPrice, sortBy, order);
    }, [categoryPath, sortBy, order]);

    const formatNumber = (value) => {
        if (!value) return '';
        const number = value.replace(/\D/g, '');
        return new Intl.NumberFormat('id-ID').format(number);
    };

    const validatePrices = (min, max, activeField) => {
        const rawMin = parseInt(min.replace(/\D/g, '')) || 0;
        const rawMax = parseInt(max.replace(/\D/g, '')) || Infinity;

        if (max !== '' && rawMin > rawMax) {
            if (activeField === 'min') {
                setError('Min price cannot be greater than max price');
            } else {
                setError('Max price cannot be less than min price');
            }
        } else {
            setError('');
        }
    };

    const handlePriceChange = (e, setter) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        const formatted = formatNumber(rawValue);
        setter(formatted);

        const field = setter === setMinPrice ? 'min' : 'max';
        if (field === 'min') {
            validatePrices(formatted, maxPrice, 'min');
        } else {
            validatePrices(minPrice, formatted, 'max');
        }
    };

    const fetchCategoryData = async (page, min = '', max = '', currentSort = sortBy, currentOrder = order) => {
        setLoading(true);
        try {
            const catRes = await api.get('/api/categories');
            const currentCat = catRes.data.find(c => c.productPath === `/${categoryPath}`);

            if (currentCat) {
                setCategory(currentCat);
                const rawMin = min.replace(/\D/g, '');
                const rawMax = max.replace(/\D/g, '');

                let url = `/api/products?categoryId=${currentCat.productCategoryId}&page=${page}&limit=9`;
                if (rawMin) url += `&minPrice=${rawMin}`;
                if (rawMax) url += `&maxPrice=${rawMax}`;
                if (currentSort) url += `&sortBy=${currentSort}`;
                if (currentOrder) url += `&order=${currentOrder}`;

                const prodRes = await api.get(url);
                setProducts(prodRes.data.data);
                setPagination(prodRes.data.pagination);
            } else {
                setCategory(null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.lastPage) {
            fetchCategoryData(newPage, minPrice, maxPrice);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const applyPriceFilter = () => {
        if (error) return;
        fetchCategoryData(1, minPrice, maxPrice, sortBy, order);
    };

    const clearPriceFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        setError('');
        fetchCategoryData(1, '', '', sortBy, order);
    };

    const handleSortChange = (e) => {
        const [newSort, newOrder] = e.target.value.split(':');
        setSortBy(newSort);
        setOrder(newOrder);
    };

    const getPageNumbers = () => {
        const { page, lastPage } = pagination;
        const delta = 1;
        const range = [];
        const rangeWithDots = [];
        let l;

        range.push(1);
        if (lastPage <= 1) return range;

        for (let i = page - delta; i <= page + delta; i++) {
            if (i < lastPage && i > 1) {
                range.push(i);
            }
        }
        range.push(lastPage);

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    if (!loading && !category) return <div className="container" style={{ padding: '100px', textAlign: 'center' }}>Category not found.</div>;

    return (
        <div className="container section">
            <div className="category-header">
                <h1 className="category-title">{category ? category.productType : '...'}</h1>
                <div className="category-divider"></div>

                {/* Price Filter UI */}
                <div className="filter-controls">
                    <div className="price-inputs-container">
                        <div className="price-inputs">
                            <span className="filter-label">Filter Price:</span>
                            <div className="input-with-prefix">
                                <span className="prefix">Rp</span>
                                <input
                                    type="text"
                                    placeholder="Min Price"
                                    className={`filter-input ${error ? 'input-error' : ''}`}
                                    value={minPrice}
                                    onChange={(e) => handlePriceChange(e, setMinPrice)}
                                />
                            </div>
                            <div className="input-with-prefix">
                                <span className="prefix">Rp</span>
                                <input
                                    type="text"
                                    placeholder="Max Price"
                                    className={`filter-input ${error ? 'input-error' : ''}`}
                                    value={maxPrice}
                                    onChange={(e) => handlePriceChange(e, setMaxPrice)}
                                />
                            </div>
                            <div className="filter-actions">
                                {(minPrice || maxPrice) && (
                                    <button className="btn-clear" onClick={clearPriceFilters}>
                                        Clear
                                    </button>
                                )}
                                <button
                                    className="btn-filter"
                                    onClick={applyPriceFilter}
                                    disabled={!!error}
                                >
                                    Apply Filter
                                </button>
                            </div>
                        </div>
                        {error && <div className="filter-error-msg">{error}</div>}
                    </div>

                    <div className="sort-container">
                        <span className="filter-label">Sort By:</span>
                        <select
                            className="filter-input sort-select"
                            value={`${sortBy}:${order}`}
                            onChange={handleSortChange}
                        >
                            <option value="createdAt:DESC">Newest Arrivals</option>
                            <option value="productPrice:ASC">Price: Lowest to Highest</option>
                            <option value="productPrice:DESC">Price: Highest to Lowest</option>
                            <option value="view_count:DESC">Most Popular</option>
                            <option value="productName:ASC">Name: A-Z</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <SkeletonList count={6} />
            ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                    No wines available in this category yet.
                </div>
            ) : (
                <>
                    <div className="product-grid">
                        {products.map(product => (
                            <Link key={product.productId} to={`/product/${product.productId}`}>
                                <div className="product-card">
                                    <div className="product-image-container">
                                        <img
                                            src={product.productImage
                                                ? (product.productImage.startsWith('http') ? product.productImage : `${import.meta.env.VITE_API_BASE_URL}/${product.productImage}`)
                                                : 'https://static.thenounproject.com/png/26593-200.png'}
                                            alt={product.productName}
                                            className="product-image"
                                            onError={(e) => { e.target.src = 'https://static.thenounproject.com/png/26593-200.png'; }}
                                        />
                                    </div>
                                    <div className="product-info">
                                        <h3 className="product-name">{product.productName}</h3>
                                        <p className="product-price">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.productPrice)}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {pagination.lastPage > 1 && (
                        <div className="pagination-container">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="btn-pagination"
                            >
                                <ChevronLeft size={20} /> Previous
                            </button>

                            <div className="page-numbers">
                                {getPageNumbers().map((p, i) => (
                                    p === '...' ? (
                                        <span key={`dots-${i}`} className="page-dots">...</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => handlePageChange(p)}
                                            className={`page-button ${pagination.page === p ? 'active' : ''}`}
                                        >
                                            {p}
                                        </button>
                                    )
                                ))}
                            </div>

                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.lastPage}
                                className="btn-pagination"
                            >
                                Next <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Category;
