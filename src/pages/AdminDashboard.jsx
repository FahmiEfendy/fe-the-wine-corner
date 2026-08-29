import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

import api from '../utils/api';
import Seo from '../components/Seo';
import LoadingSpinner from '../components/LoadingSpinner';
import LazyImage from '../components/LazyImage';

import '../styles/AdminDashboard.css';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // matches backend multer limit
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const validateProductForm = ({ formData, selectedFile, editingProduct }) => {
    const errors = {};

    if (!formData.productName.trim()) {
        errors.productName = 'Product name is required.';
    }

    const price = Number(formData.productPrice);
    if (formData.productPrice === '' || Number.isNaN(price)) {
        errors.productPrice = 'Price is required.';
    } else if (price <= 0) {
        errors.productPrice = 'Price must be greater than 0.';
    }

    if (!formData.productCategoryId) {
        errors.productCategoryId = 'Please select a category.';
    }

    if (selectedFile) {
        if (!ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
            errors.productImage = 'Only JPEG, PNG, GIF, or WebP images are allowed.';
        } else if (selectedFile.size > MAX_IMAGE_SIZE_BYTES) {
            errors.productImage = 'Image must be smaller than 5MB.';
        }
    } else if (!editingProduct && !formData.productImage.trim()) {
        errors.productImage = 'Please upload an image or provide an image URL.';
    }

    return errors;
};


const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ page: 1, lastPage: 1 });
    const [selectedFile, setSelectedFile] = useState(null);
    const [sortOption, setSortOption] = useState('last-added');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Form state
    const [formData, setFormData] = useState({
        productName: '',
        productPrice: '',
        productImage: '',
        productCategoryId: ''
    });

    // Handle debouncing search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchData();
    }, [debouncedSearchTerm, selectedCategoryId, page, sortOption]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearchTerm, selectedCategoryId, sortOption]);

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            let sortBy = 'productName';
            let order = 'ASC';

            if (sortOption === 'last-added') {
                sortBy = 'createdAt';
                order = 'DESC';
            } else if (sortOption === 'price-asc') {
                sortBy = 'productPrice';
                order = 'ASC';
            } else if (sortOption === 'price-desc') {
                sortBy = 'productPrice';
                order = 'DESC';
            } else if (sortOption === 'most-viewed') {
                sortBy = 'view_count';
                order = 'DESC';
            }

            const prodUrl = `/products?limit=10&page=${page}&sortBy=${sortBy}&order=${order}&search=${debouncedSearchTerm}${selectedCategoryId ? `&categoryId=${selectedCategoryId}` : ''}`;
            const [prodRes, catRes] = await Promise.all([
                api.get(prodUrl),
                api.get('/categories')
            ]);
            setProducts(prodRes.data.data);
            setPagination(prodRes.data.pagination);
            setCategories(catRes.data);
        } catch (err) {
            console.error('Error fetching data', err);
            toast.error('Failed to load products. Please try again.');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleOpenModal = (product = null) => {
        setSelectedFile(null);
        setFormErrors({});
        if (product) {
            setEditingProduct(product);
            setFormData({
                productName: product.productName,
                productPrice: product.productPrice,
                productImage: product.productImage || '',
                productCategoryId: product.productCategoryId
            });
        } else {
            setEditingProduct(null);
            setFormData({ productName: '', productPrice: '', productCategoryId: '', productImage: '' });
        }
        setIsModalOpen(true);
    };

    const handleDelete = (product) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        setIsDeleting(true);
        try {
            await api.delete(`/products/${productToDelete.productId}`);
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
            toast.success('Product deleted successfully.');
            fetchData();
        } catch (err) {
            toast.error('Delete failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateProductForm({ formData, selectedFile, editingProduct });
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('productName', formData.productName);
            data.append('productPrice', formData.productPrice);
            data.append('productCategoryId', formData.productCategoryId);

            if (selectedFile) {
                data.append('productImage', selectedFile);
            } else {
                data.append('productImage', formData.productImage);
            }

            if (editingProduct) {
                await api.put(`/products/${editingProduct.productId}`, data);
                toast.success('Product updated successfully.');
            } else {
                await api.post('/products', data);
                toast.success('Product created successfully.');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error('Operation failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="container section admin-page-section">
            <Seo title="Admin Dashboard" noIndex />
            <div className="admin-header">
                <h1 className="admin-title">Product Management</h1>
            </div>

            <div className="admin-filters">
                <div className="search-sort-row">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button className="btn-clear-search" onClick={() => setSearchTerm('')}>
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="admin-header-actions">
                        <button
                            onClick={() => fetchData()}
                            className={`btn-admin btn-refresh-full ${isRefreshing ? 'fetching-pulse' : ''}`}
                            disabled={isRefreshing}
                        >
                            <RefreshCw size={18} className={isRefreshing ? 'spinning' : ''} />
                            <span>{isRefreshing ? 'Fetching...' : 'Refresh Product'}</span>
                        </button>
                        <button onClick={() => handleOpenModal()} className="btn-admin">
                            <Plus size={20} /> Add Product
                        </button>
                    </div>

                    <div className="category-sort-row">
                        <div className="category-select-wrapper">
                            <select
                                className="sort-select"
                                value={selectedCategoryId || ''}
                                onChange={(e) => setSelectedCategoryId(e.target.value || null)}
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.productCategoryId} value={cat.productCategoryId}>
                                        {cat.productType}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="sort-wrapper">
                        <select
                            className="sort-select"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                        >
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="last-added">Last Added</option>
                            <option value="most-viewed">Most Viewed</option>
                            <option value="whatsapp-clicks">WhatsApp Clicks</option>
                            <option value="blibli-clicks">Blibli Clicks</option>
                            <option value="tokopedia-clicks">Tokopedia Clicks</option>
                            <option value="price-asc">Price (Low to High)</option>
                            <option value="price-desc">Price (High to Low)</option>
                        </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40%' }}>Product</th>
                            <th style={{ width: '15%' }}>Category</th>
                            <th style={{ width: '10%' }}>Price</th>
                            <th className="col-hide-mobile" style={{ width: '5%' }}>Views</th>
                            <th className="col-hide-mobile" style={{ width: '15%' }}>Clicks</th>
                            <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isRefreshing ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={`skeleton-${i}`}>
                                    <td colSpan="6">
                                        <div className="admin-row-skeleton" />
                                    </td>
                                </tr>
                            ))
                        ) : products.length > 0 ? (
                            products.map(product => (
                                <tr key={product.productId}>
                                    <td>
                                        <div className="admin-product-item">
                                            <div className="admin-product-thumb">
                                                <LazyImage
                                                    src={product.productImage}
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            </div>
                                            <span className="admin-product-name">{product.productName}</span>
                                        </div>
                                    </td>
                                    <td>{categories.find(c => c.productCategoryId === product.productCategoryId)?.productType || 'N/A'}</td>
                                    <td>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.productPrice)}</td>
                                    <td className="col-hide-mobile">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-light)', fontSize: '13px' }}>
                                            <span>{product.view_count || 0}</span>
                                        </div>
                                    </td>
                                    <td className="col-hide-mobile">
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px', color: 'var(--text-light)' }}>
                                            <span>WA: {product.whatsapp_clicks || 0}</span>
                                            <span>BB: {product.blibli_clicks || 0}</span>
                                            <span>TP: {product.tokopedia_clicks || 0}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                            <button onClick={() => handleOpenModal(product)} className="btn-icon btn-edit"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(product)} className="btn-icon btn-delete"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>
                                    <div style={{ fontSize: '40px', marginBottom: '15px' }}>📦</div>
                                    <p>Your store is currently empty.</p>
                                    <p style={{ fontSize: '14px', marginTop: '5px' }}>Click "Add Product" to start building your collection.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Dashboard Pagination */}
                {pagination.lastPage > 1 && (
                    <div className="admin-pagination">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="btn-pagination-admin"
                        >
                            <ChevronLeft size={18} /> Prev
                        </button>
                        <span className="page-info">
                            Page {page} of {pagination.lastPage}
                        </span>
                        <button
                            disabled={page === pagination.lastPage}
                            onClick={() => setPage(page + 1)}
                            className="btn-pagination-admin"
                        >
                            Next <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Product Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button onClick={() => setIsModalOpen(false)} className="btn-close-modal">
                            <X size={24} />
                        </button>
                        <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                            <div className="form-group">
                                <label className="form-label">Product Name</label>
                                <input
                                    type="text" className={`form-input ${formErrors.productName ? 'input-error' : ''}`}
                                    value={formData.productName}
                                    onChange={e => setFormData({ ...formData, productName: e.target.value })}
                                />
                                {formErrors.productName && <div className="field-error">{formErrors.productName}</div>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Price (IDR)</label>
                                <input
                                    type="number" className={`form-input ${formErrors.productPrice ? 'input-error' : ''}`}
                                    value={formData.productPrice}
                                    onChange={e => setFormData({ ...formData, productPrice: e.target.value })}
                                />
                                {formErrors.productPrice && <div className="field-error">{formErrors.productPrice}</div>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    className={`form-input ${formErrors.productCategoryId ? 'input-error' : ''}`}
                                    value={formData.productCategoryId}
                                    onChange={e => setFormData({ ...formData, productCategoryId: e.target.value })}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.productCategoryId} value={cat.productCategoryId}>
                                            {cat.productType}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.productCategoryId && <div className="field-error">{formErrors.productCategoryId}</div>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Product Image</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <input
                                        type="file"
                                        className={`form-input ${formErrors.productImage ? 'input-error' : ''}`}
                                        accept="image/*"
                                        onChange={e => setSelectedFile(e.target.files[0] || null)}
                                    />
                                    <div style={{ textAlign: 'center', fontSize: '12px', color: '#999' }}>— OR —</div>
                                    <input
                                        type="text"
                                        className={`form-input ${formErrors.productImage ? 'input-error' : ''}`}
                                        placeholder="Image URL (e.g. uploads/... or http://...)"
                                        value={formData.productImage}
                                        onChange={e => setFormData({ ...formData, productImage: e.target.value })}
                                    />
                                </div>
                                {formErrors.productImage && <div className="field-error">{formErrors.productImage}</div>}
                            </div>
                            <button type="submit" className="btn-admin" disabled={isSubmitting} style={{ width: '100%', marginTop: '10px', justifyContent: 'center' }}>
                                {isSubmitting ? 'Saving...' : (editingProduct ? 'Save Changes' : 'Create Product')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && productToDelete && (
                <div className="modal-overlay" onClick={() => { setIsDeleteModalOpen(false); setProductToDelete(null); }}>
                    <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
                        <button
                            className="btn-close-modal"
                            onClick={() => {
                                setIsDeleteModalOpen(false);
                                setProductToDelete(null);
                            }}
                        >
                            <X size={24} />
                        </button>

                        <h2>Delete Product?</h2>
                        <p className="delete-warning">
                            Are you sure you want to delete <strong>{productToDelete.productName}</strong>? This action cannot be undone.
                        </p>

                        <div className="delete-preview">
                            <LazyImage
                                src={productToDelete.productImage}
                                alt={productToDelete.productName}
                            />
                        </div>

                        <div className="delete-actions">
                            <button
                                className="btn-cancel"
                                disabled={isDeleting}
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setProductToDelete(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-delete-confirm"
                                disabled={isDeleting}
                                onClick={confirmDelete}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
