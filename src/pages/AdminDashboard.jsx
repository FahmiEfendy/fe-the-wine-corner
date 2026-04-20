import axios from 'axios';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

import LoadingSpinner from '../components/LoadingSpinner';

import '../styles/AdminDashboard.css';


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
            }

            const prodUrl = `/api/products?limit=10&page=${page}&sortBy=${sortBy}&order=${order}&search=${debouncedSearchTerm}${selectedCategoryId ? `&categoryId=${selectedCategoryId}` : ''}`;
            const [prodRes, catRes] = await Promise.all([
                axios.get(prodUrl),
                axios.get('/api/categories')
            ]);
            setProducts(prodRes.data.data);
            setPagination(prodRes.data.pagination);
            setCategories(catRes.data);
        } catch (err) {
            console.error('Error fetching data', err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleOpenModal = (product = null) => {
        setSelectedFile(null);
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
        
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`/api/products/${productToDelete.productId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
            fetchData();
        } catch (err) {
            alert('Delete failed: ' + err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');

            const data = new FormData();
            data.append('productName', formData.productName);
            data.append('productPrice', formData.productPrice);
            data.append('productCategoryId', formData.productCategoryId);

            if (selectedFile) {
                data.append('productImage', selectedFile);
            } else {
                data.append('productImage', formData.productImage);
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (editingProduct) {
                await axios.put(`/api/products/${editingProduct.productId}`, data, config);
            } else {
                await axios.post('/api/products', data, config);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            alert('Operation failed: ' + err.message);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="container section">
            <div className="admin-header">
                <h1 className="admin-title">Product Management</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
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

                    <div className="sort-wrapper">
                        <select
                            className="sort-select"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                        >
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="last-added">Last Added</option>
                            <option value="price-asc">Price (Low to High)</option>
                            <option value="price-desc">Price (High to Low)</option>
                        </select>
                    </div>
                </div>

                <div className="category-chips">
                    <button
                        className={`chip ${selectedCategoryId === null ? 'active' : ''}`}
                        onClick={() => setSelectedCategoryId(null)}
                    >
                        All Categories
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.productCategoryId}
                            className={`chip ${selectedCategoryId === cat.productCategoryId ? 'active' : ''}`}
                            onClick={() => setSelectedCategoryId(cat.productCategoryId)}
                        >
                            {cat.productType}
                        </button>
                    ))}
                </div>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '45%' }}>Product</th>
                            <th style={{ width: '20%' }}>Category</th>
                            <th style={{ width: '20%' }}>Price</th>
                            <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map(product => (
                                <tr key={product.productId}>
                                    <td>
                                        <div className="admin-product-item">
                                            <div className="admin-product-thumb">
                                                <img
                                                    src={product.productImage
                                                        ? (product.productImage.startsWith('http') ? product.productImage : `${import.meta.env.VITE_API_BASE_URL}/${product.productImage}`)
                                                        : 'https://static.thenounproject.com/png/26593-200.png'}
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                    onError={(e) => { e.target.src = 'https://static.thenounproject.com/png/26593-200.png'; }}
                                                />
                                            </div>
                                            <span className="admin-product-name">{product.productName}</span>
                                        </div>
                                    </td>
                                    <td>{categories.find(c => c.productCategoryId === product.productCategoryId)?.productType || 'N/A'}</td>
                                    <td>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.productPrice)}</td>
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
                                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                                    No products found.
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
                                    type="text" required className="form-input"
                                    value={formData.productName}
                                    onChange={e => setFormData({ ...formData, productName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Price (IDR)</label>
                                <input
                                    type="number" required className="form-input"
                                    value={formData.productPrice}
                                    onChange={e => setFormData({ ...formData, productPrice: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    required className="form-input"
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
                            </div>
                            <div className="form-group">
                                <label className="form-label">Product Image</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <input
                                        type="file"
                                        className="form-input"
                                        accept="image/*"
                                        onChange={e => setSelectedFile(e.target.files[0])}
                                    />
                                    <div style={{ textAlign: 'center', fontSize: '12px', color: '#999' }}>— OR —</div>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Image URL (e.g. uploads/... or http://...)"
                                        value={formData.productImage}
                                        onChange={e => setFormData({ ...formData, productImage: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn-admin" style={{ width: '100%', marginTop: '10px', justifyContent: 'center' }}>
                                {editingProduct ? 'Save Changes' : 'Create Product'}
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
                            <img 
                                src={productToDelete.productImage
                                    ? (productToDelete.productImage.startsWith('http') ? productToDelete.productImage : `${import.meta.env.VITE_API_BASE_URL}/${productToDelete.productImage}`)
                                    : 'https://static.thenounproject.com/png/26593-200.png'} 
                                alt={productToDelete.productName}
                                onError={(e) => { e.target.src = 'https://static.thenounproject.com/png/26593-200.png'; }}
                            />
                        </div>

                        <div className="delete-actions">
                            <button 
                                className="btn-cancel" 
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setProductToDelete(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn-delete-confirm" 
                                onClick={confirmDelete}
                            >
                                Delete Product
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
