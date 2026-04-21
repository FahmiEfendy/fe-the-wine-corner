import api from '../utils/api';
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search as SearchIcon } from 'lucide-react';

import SkeletonList from '../components/SkeletonLoader';

import '../styles/Category.css'; // Reuse category styles for consistency

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [error, setError] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [pagination, setPagination] = useState({ page: 1, lastPage: 1 });

    useEffect(() => {
        if (query) {
            fetchSearchResults(1);
        }
    }, [query]);

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

    const fetchSearchResults = async (page, min = '', max = '') => {
        setLoading(true);
        try {
            const rawMin = min.replace(/\D/g, '');
            const rawMax = max.replace(/\D/g, '');

            let url = `/api/products?search=${encodeURIComponent(query)}&page=${page}&limit=12`;
            if (rawMin) url += `&minPrice=${rawMin}`;
            if (rawMax) url += `&maxPrice=${rawMax}`;

            const prodRes = await api.get(url);
            setProducts(prodRes.data.data);
            setPagination(prodRes.data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.lastPage) {
            fetchSearchResults(newPage, minPrice, maxPrice);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const applyPriceFilter = () => {
        if (error) return;
        fetchSearchResults(1, minPrice, maxPrice);
    };

    const clearFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        setError('');
        fetchSearchResults(1, '', '');
    };

    return (
        <div className="container section">
            <div className="category-header">
                <h1 className="category-title" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <SearchIcon size={32} color="var(--accent)" />
                    Search Results: "{query}"
                </h1>
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
                                    <button className="btn-clear" onClick={clearFilters}>
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
                </div>
            </div>

            {loading ? (
                <SkeletonList count={8} />
            ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 40px', color: 'var(--text-light)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.3 }}>🍷</div>
                    <h3>No wines matched your search.</h3>
                    <p>Try different keywords or explore our categories.</p>
                    <Link to="/category" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
                        Browse Categories
                    </Link>
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
                                {[...Array(pagination.lastPage)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={`page-button ${pagination.page === i + 1 ? 'active' : ''}`}
                                    >
                                        {i + 1}
                                    </button>
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

export default Search;
