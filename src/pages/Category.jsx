import axios from 'axios';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import LoadingSpinner from '../components/LoadingSpinner';

import '../styles/Category.css';

const Category = () => {
    const { categoryPath } = useParams();
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, lastPage: 1 });

    useEffect(() => {
        fetchCategoryData(1);
    }, [categoryPath]);

    const fetchCategoryData = async (page) => {
        setLoading(true);
        try {
            const catRes = await axios.get('/api/categories');
            const currentCat = catRes.data.find(c => c.productPath === `/${categoryPath}`);

            if (currentCat) {
                setCategory(currentCat);
                const prodRes = await axios.get(`/api/products?categoryId=${currentCat.productCategoryId}&page=${page}&limit=9`);
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
            fetchCategoryData(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!category) return <div className="container" style={{ padding: '100px', textAlign: 'center' }}>Category not found.</div>;

    return (
        <div className="container section">
            <div className="category-header">
                <h1 className="category-title">{category.productType}</h1>
                <div className="category-divider"></div>
            </div>

            {products.length === 0 ? (
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

export default Category;
