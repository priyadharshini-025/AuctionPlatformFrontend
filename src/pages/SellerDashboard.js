import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, auctionAPI, categoryAPI, setupSessionExpirationTimer, getTokenExpirationType } from '../services/api';
// import { useAuth } from '../contexts/AuthContext';

function SellerDashboard() {
  // const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingAuctions, setLoadingAuctions] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    auctionTypes: ['traditional']
  });
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    startingPrice: '',
    inventory: 1,
    category: ''
  });
  const [sessionWarning, setSessionWarning] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    fetchData();
    
    // Set up session expiration warning
    setupSessionExpirationTimer((notification) => {
      if (notification.type === 'warning') {
        setSessionWarning(notification.message);
      }
    });
    
    // Update time remaining every minute
    const interval = setInterval(() => {
      const tokenInfo = getTokenExpirationType();
      if (tokenInfo) {
        const minutesLeft = Math.ceil(tokenInfo.timeUntilExpiration / 60000);
        setTimeRemaining(minutesLeft);
      }
    }, 60000); // Update every minute
    
    // Initial time update
    const tokenInfo = getTokenExpirationType();
    if (tokenInfo) {
      const minutesLeft = Math.ceil(tokenInfo.timeUntilExpiration / 60000);
      setTimeRemaining(minutesLeft);
    }
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const fetchData = async () => {
    try {
      setError('');
      const [productsRes, auctionsRes, categoriesRes] = await Promise.all([
        productAPI.getByUser(),
        auctionAPI.getByUser(),
        categoryAPI.getAll(),
      ]);
      setProducts(productsRes.data);
      setAuctions(auctionsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (err.message === 'Token expired') {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.response?.data?.msg || 'Error fetching data. Please try again.');
      }
      setProducts([]);
      setAuctions([]);
      setCategories([]);
    } finally {
      setLoadingProducts(false);
      setLoadingAuctions(false);
      setLoadingCategories(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(id);
        setProducts(products.filter((p) => p._id !== id));
      } catch (err) {
        console.error('Error deleting product:', err);
      }
    }
  };

  const handleDeleteAuction = async (id) => {
    if (window.confirm('Are you sure you want to delete this auction? This action cannot be undone.')) {
      try {
        await auctionAPI.delete(id);
        setAuctions(auctions.filter((a) => a._id !== id));
      } catch (err) {
        console.error('Error deleting auction:', err);
        alert('Error deleting auction');
      }
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await productAPI.create(productForm);
      setProductForm({
        name: '',
        description: '',
        startingPrice: '',
        inventory: 1,
        category: ''
      });
      setShowProductForm(false);
      fetchData(); // Refresh products list
    } catch (err) {
      console.error('Error creating product:', err);
      alert('Error creating product');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await categoryAPI.create(categoryForm);
      setCategoryForm({ name: '', description: '', auctionTypes: ['traditional'] });
      setShowCategoryForm(false);
      fetchData(); // Refresh categories
    } catch (err) {
      console.error('Error creating category:', err);
      alert('Error creating category');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      await categoryAPI.update(editingCategory._id, categoryForm);
      setCategoryForm({ name: '', description: '', auctionTypes: ['traditional'] });
      setEditingCategory(null);
      setShowCategoryForm(false);
      fetchData(); // Refresh categories
    } catch (err) {
      console.error('Error updating category:', err);
      alert('Error updating category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? This may affect existing products and auctions.')) {
      try {
        await categoryAPI.delete(id);
        fetchData(); // Refresh categories
      } catch (err) {
        console.error('Error deleting category:', err);
        alert('Error deleting category');
      }
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      auctionTypes: category.auctionTypes
    });
    setShowCategoryForm(true);
  };

  const handleCancelCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '', auctionTypes: ['traditional'] });
  };

  const totalInventoryCount = products.reduce((sum, product) => sum + Number(product.inventory || 0), 0);
  const availableProducts = products.filter((product) => product.inventory > 0);
  const unsoldProducts = products.filter((product) => product.status === 'unsold');
  const soldOutProducts = products.filter((product) => product.inventory === 0 && product.status !== 'unsold');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Seller Dashboard</h1>
          <div className="flex space-x-4">
            <Link
              to="/profile"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-700"
            >
              Profile
            </Link>
            <Link
              to="/create-auction"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700"
            >
              + Create Auction
            </Link>
          </div>
        </div>

        {sessionWarning && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8">
            <p className="font-bold">⚠️ Session Warning</p>
            <p className="mt-1">{sessionWarning}</p>
            {timeRemaining && (
              <p className="mt-2 text-sm">Time remaining: <strong>{timeRemaining}</strong> minutes</p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            <strong>Error:</strong> {error}
            <Link
              to="/login"
              className="block mt-2 text-red-600 font-bold hover:underline"
            >
              Click here to log in again
            </Link>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2 rounded-lg font-bold ${
              activeTab === 'products'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            My Products
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-2 rounded-lg font-bold ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('auctions')}
            className={`px-6 py-2 rounded-lg font-bold ${
              activeTab === 'auctions'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            My Auctions
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-2 rounded-lg font-bold ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Categories
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Products</h2>
              <button
                onClick={() => setShowProductForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700"
              >
                + Add Product
              </button>
            </div>

            {/* Product Form */}
            {showProductForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Add New Product</h3>
                <form onSubmit={handleCreateProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-bold mb-2">Product Name</label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-2">Starting Price</label>
                      <input
                        type="number"
                        value={productForm.startingPrice}
                        onChange={(e) => setProductForm({ ...productForm, startingPrice: e.target.value })}
                        step="0.01"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Description</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                      rows="3"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-bold mb-2">Inventory</label>
                      <input
                        type="number"
                        value={productForm.inventory}
                        onChange={(e) => setProductForm({ ...productForm, inventory: e.target.value })}
                        min="0"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-2">Category</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                        required
                      >
                        <option value="" disabled>Select category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700"
                    >
                      Create Product
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProductForm(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold">Product Name</th>
                    <th className="px-6 py-3 text-left font-bold">Starting Price</th>
                    <th className="px-6 py-3 text-left font-bold">Inventory</th>
                    <th className="px-6 py-3 text-left font-bold">Status</th>
                    <th className="px-6 py-3 text-left font-bold">Category</th>
                    <th className="px-6 py-3 text-left font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingProducts ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product._id} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-4">{product.name}</td>
                        <td className="px-6 py-4">${product.startingPrice}</td>
                        <td className="px-6 py-4">{product.sold} sold, {product.inventory} left</td>
                        <td className="px-6 py-4 capitalize">
                          {(() => {
                            const productAuctions = auctions.filter(
                              (auction) => auction.product?._id === product._id
                            );
                            const latestAuction = productAuctions.length > 0
                              ? productAuctions.reduce((latest, auction) =>
                                  new Date(auction.endTime) > new Date(latest.endTime) ? auction : latest
                                )
                              : null;

                            if (latestAuction && new Date(latestAuction.endTime) <= new Date()) {
                              const hasWinner = latestAuction.winner || (latestAuction.winners && latestAuction.winners.length > 0);
                              return hasWinner ? 'Sold' : 'Unsold';
                            }

                            return product.status === 'available'
                              ? 'Available'
                              : product.status === 'sold'
                                ? 'Sold Out'
                                : 'Unsold';
                          })()}
                        </td>
                        <td className="px-6 py-4">{product.category?.name || 'N/A'}</td>
                        <td className="px-6 py-4 space-x-2">
                          <Link
                            to={`/edit-product/${product._id}`}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 inline-block"
                          >
                            Edit
                          </Link>
                          {(() => {
                            const existingAuction = auctions.find(
                              (auction) =>
                                auction.product?._id === product._id &&
                                (auction.status === 'active' || auction.status === 'upcoming')
                            );
                            return existingAuction ? (
                              <Link
                                to={`/edit-auction/${existingAuction._id}`}
                                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 inline-block"
                              >
                                Update Auction
                              </Link>
                            ) : null;
                          })()}
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div>
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Inventory Management</h2>
                <p className="text-gray-600 mt-1">Track stock and unsold items from a dedicated view.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full md:w-auto">
                <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-3xl font-bold">{products.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                  <p className="text-sm text-gray-500">Total Inventory</p>
                  <p className="text-3xl font-bold">{totalInventoryCount}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                  <p className="text-sm text-gray-500">Available Products</p>
                  <p className="text-3xl font-bold">{availableProducts.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                  <p className="text-sm text-gray-500">Unsold</p>
                  <p className="text-3xl font-bold">{unsoldProducts.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                  <p className="text-sm text-gray-500">Sold Out</p>
                  <p className="text-3xl font-bold">{soldOutProducts.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold">Product</th>
                    <th className="px-6 py-3 text-left font-bold">Inventory</th>
                    <th className="px-6 py-3 text-left font-bold">Status</th>
                    <th className="px-6 py-3 text-left font-bold">Category</th>
                    <th className="px-6 py-3 text-left font-bold">Auction</th>
                    <th className="px-6 py-3 text-left font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingProducts ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : products.length > 0 ? (
                    products.map((product) => {
                      const currentAuction = auctions.find(
                        (auction) => auction.product?._id === product._id
                      );
                      const now = new Date();
                      const auctionStatus = currentAuction
                        ? new Date(currentAuction.endTime) <= now
                          ? 'ended'
                          : new Date(currentAuction.startTime) > now
                            ? 'upcoming'
                            : currentAuction.status
                        : 'No auction';
                      return (
                        <tr key={product._id} className="border-t hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium">{product.name}</td>
                          <td className="px-6 py-4">{product.inventory}</td>
                          <td className="px-6 py-4 capitalize">
                            {product.status === 'available' && 'Available'}
                            {product.status === 'sold' && 'Sold Out'}
                            {product.status === 'unsold' && 'Unsold'}
                          </td>
                          <td className="px-6 py-4">{product.category?.name || 'N/A'}</td>
                          <td className="px-6 py-4 capitalize">{auctionStatus}</td>
                          <td className="px-6 py-4 space-x-2">
                            <Link
                              to={`/edit-product/${product._id}`}
                              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 inline-block"
                            >
                              Edit
                            </Link>
                            {currentAuction ? (
                              <Link
                                to={`/edit-auction/${currentAuction._id}`}
                                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 inline-block"
                              >
                                Update Auction
                              </Link>
                            ) : (
                              <span className="text-sm text-gray-500">No action</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No inventory items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Auctions Tab */}
        {activeTab === 'auctions' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left font-bold">Auction</th>
                  <th className="px-6 py-3 text-left font-bold">Status</th>
                  <th className="px-6 py-3 text-left font-bold">Bids</th>
                  <th className="px-6 py-3 text-left font-bold">Ends</th>
                  <th className="px-6 py-3 text-left font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingAuctions ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : auctions.length > 0 ? (
                  auctions.map((auction) => {
                    const now = new Date();
                    const auctionStatus = new Date(auction.endTime) <= now
                      ? 'ended'
                      : new Date(auction.startTime) > now
                        ? 'upcoming'
                        : auction.status;
                    return (
                      <tr key={auction._id} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-4">{auction.product?.name || 'N/A'}</td>
                        <td className="px-6 py-4 capitalize">
                          {auctionStatus === 'ended' ? (
                            (auction.winner || (auction.winners && auction.winners.length > 0)) ? 'Sold' : 'Unsold'
                          ) : auctionStatus}
                        </td>
                        <td className="px-6 py-4">{auction.bids.length}</td>
                        <td className="px-6 py-4">
                          {new Date(auction.endTime).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 space-x-2">
                        <Link
                          to={`/auction/${auction._id}`}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          View
                        </Link>
                        <Link
                          to={`/edit-auction/${auction._id}`}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteAuction(auction._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )})
                ): (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No auctions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Create Category Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Categories</h2>
              <button
                onClick={() => setShowCategoryForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700"
              >
                + Add Category
              </button>
            </div>

            {/* Category Form */}
            {showCategoryForm && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Define the category and its default auction type. When sellers create auctions in this category, the auction type will be automatically set.
                </p>
                <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 font-bold mb-2">Category Name</label>
                      <input
                        type="text"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                        required
                      />
                    </div>
                    <div>
                    <label className="block text-gray-700 font-bold mb-2">
                        Default Auction Type for This Category
                    </label>

                    <select
                        value={categoryForm.auctionTypes?.[0] || 'traditional'}
                        onChange={(e) =>
                        setCategoryForm({ ...categoryForm, auctionTypes: [e.target.value] })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                        required
                    >
                        <option value="" disabled selected><strong>Select Auction Type</strong></option>
                        <option value="traditional">Traditional (Open bids visible)</option>
                        <option value="reverse">Reverse (Lowest bid wins)</option>
                        <option value="sealed">Sealed (Hidden bids until end)</option>
                    </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Description</label>
                    <textarea
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                      rows="3"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700"
                    >
                      {editingCategory ? 'Update Category' : 'Create Category'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelCategoryForm}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Categories List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold">Category Name</th>
                    <th className="px-6 py-3 text-left font-bold">Description</th>
                    <th className="px-6 py-3 text-left font-bold">Auction Types</th>
                    <th className="px-6 py-3 text-left font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingCategories ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : categories.length > 0 ? (
                    categories.map((category) => (
                      <tr key={category._id} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold">{category.name}</td>
                        <td className="px-6 py-4">{category.description}</td>
                        <td className="px-6 py-4">
                          {category.auctionTypes?.join(', ') || 'traditional'}
                        </td>
                        <td className="px-6 py-4 space-x-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        No categories found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerDashboard;
