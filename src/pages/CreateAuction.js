import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { productAPI, auctionAPI, categoryAPI } from '../services/api';

function CreateAuction() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [creatingAuction, setCreatingAuction] = useState(false);

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    startingPrice: '',
    category: '',
    inventory: 1,
  });

  const [auctionData, setAuctionData] = useState({
    productId: '',
    auctionType: 'traditional',
    startTime: '',
    endTime: '',
    category: '',
  });

  const selectedProduct = products.find(product => product._id === auctionData.productId);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productAPI.getByUser(),
          categoryAPI.getAll(),
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);

        // If productId is in URL, auto-fill category
        const params = new URLSearchParams(location.search);
        const productIdFromQuery = params.get('productId');
        if (productIdFromQuery) {
          const product = productsRes.data.find(p => p._id === productIdFromQuery);
          if (product) {
            setAuctionData((prev) => ({
              ...prev,
              category: product.category._id || product.category,
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    const params = new URLSearchParams(location.search);
    const productIdFromQuery = params.get('productId');
    if (productIdFromQuery) {
      setAuctionData((prev) => ({ ...prev, productId: productIdFromQuery }));
      setStep(2);
    }
    fetchData();
  }, [location.search]);

  const handleProductChange = (e) => {
    setProductData({
      ...productData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAuctionChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'productId' && value) {
      // Find the selected product and auto-fill category
      const selectedProduct = products.find(product => product._id === value);
      if (selectedProduct) {
        setAuctionData({
          ...auctionData,
          productId: value,
          category: selectedProduct.category._id || selectedProduct.category,
        });
        return;
      }
    }

    if (name === 'category' && value) {
      // Find the selected category and auto-fill auction type
      const selectedCategory = categories.find(cat => cat._id === value);
      if (selectedCategory && selectedCategory.auctionTypes && selectedCategory.auctionTypes.length > 0) {
        setAuctionData({
          ...auctionData,
          category: value,
          auctionType: selectedCategory.auctionTypes[0], // Auto-select first auction type
        });
        return;
      }
    }
    
    setAuctionData({
      ...auctionData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5); // max 5

    // filter only valid image types
    const validFiles = files.filter(file =>
      file.type && file.type.startsWith('image/')
    );

    setImages(validFiles);

    // create previews
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setError('');
    setCreatingProduct(true);

    try {
      const response = await productAPI.create(productData);
      setProducts([...products, response.data]);
      setAuctionData((prev) => ({ ...prev, productId: response.data._id }));
      setProductData({
        name: '',
        description: '',
        startingPrice: '',
        category: '',
        inventory: 1,
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error creating product');
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleCreateAuction = async (e) => {
    e.preventDefault();
    setError('');
    setCreatingAuction(true);

    if (!auctionData.productId) {
      setError('Please select a product');
      setCreatingAuction(false);
      return;
    }

    try {
      const formData = new FormData();

      formData.append('productId', auctionData.productId);
      formData.append('auctionType', auctionData.auctionType);
      if (auctionData.category) {
        formData.append('category', auctionData.category);
      }
      // Convert to UTC ISO string
      formData.append('startTime', new Date(auctionData.startTime).toISOString());
      formData.append('endTime', new Date(auctionData.endTime).toISOString());

      //Only append valid image files
      images.forEach((image) => {
        if (image && image.type && image.type.startsWith('image/')) {
          formData.append('images', image);
        }
      });
      await auctionAPI.create(formData);
      navigate('/seller-dashboard');

    } catch (err) {
      setError(err.response?.data?.msg || 'Error creating auction');
    } finally {
      setCreatingAuction(false);
    }
  };
  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Create Auction</h1>

        {/* Progress */}
        <div className="mb-8 flex justify-between">
          <div className={`flex-1 py-2 text-center ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'} rounded-l`}>
            Step 1: Product
          </div>
          <div className={`flex-1 py-2 text-center ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'} rounded-r`}>
            Step 2: Auction
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-8">
          {/* Step 1: Create or Select Product */}
          {step === 1 && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Select or Create a Product</h2>
                <button
                  type="button"
                  onClick={() => navigate('/seller-dashboard')}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Manage Products
                </button>
              </div>

              {products.length > 0 && !auctionData.productId && (
                <div className="mb-6">
                  <label className="block text-gray-700 font-bold mb-2">Select Existing Product</label>
                  <select
                    name="productId"
                    value={auctionData.productId}
                    onChange={(e) => {
                      setAuctionData({ ...auctionData, productId: e.target.value });
                      setStep(2);
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 relative z-10"
                  >
                    <option value="" style={{ fontWeight: 'bold' }}>-- Select a product --</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} - ${product.startingPrice}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Only show create new product form if no existing product is selected */}
              {!auctionData.productId && (
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Create New Product</h3>
                    <span className="text-sm text-gray-500">Required for auction</span>
                  </div>
                  <form onSubmit={handleCreateProduct} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={productData.name}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Description</label>
                    <textarea
                      name="description"
                      value={productData.description}
                      onChange={handleProductChange}
                      rows="4"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Starting Price</label>
                    <input
                      type="number"
                      name="startingPrice"
                      value={productData.startingPrice}
                      onChange={handleProductChange}
                      step="0.01"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-gray-700 font-bold mb-2">
                      Category
                    </label>

                    <select
                      name="category"
                      value={productData.category}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 relative z-50"
                      required
                    >
                      <option value="" style={{ fontWeight: 'bold' }}>Select category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={creatingProduct}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 relative z-10 mt-4 disabled:bg-gray-400"
                  >
                    {creatingProduct ? 'Creating Product...' : 'Create Product & Continue'}
                  </button>
                </form>
              </div>
              )}
            </div>
          )}

          {/* Step 2: Create Auction */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Auction Details</h2>
              <form onSubmit={handleCreateAuction} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Product</label>
                  <div className="flex gap-2 items-center">
                    <select
                      name="productId"
                      value={auctionData.productId}
                      onChange={handleAuctionChange}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 relative z-10"
                      required
                    >
                      <option value="" style={{ fontWeight: 'bold' }}>Select a product</option>
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Category</label>
                  <select
                    name="category"
                    value={auctionData.category}
                    onChange={handleAuctionChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 relative z-10"
                    required
                  >
                    <option value="" style={{ fontWeight: 'bold' }}>Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name} - {cat.auctionTypes?.join(', ') || 'traditional'}
                      </option>
                    ))}
                  </select>
                </div>

                {auctionData.category && (
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Auction Type (Auto-selected from Category)</label>
                    <div className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-700">
                      <span className="font-semibold capitalize">{auctionData.auctionType}</span>
                    </div>
                  </div>
                )}

                {auctionData.auctionType === 'reverse' && selectedProduct && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
                    <p className="font-semibold">Reverse Auction Max Budget</p>
                    <p>Maximum budget: ${selectedProduct.startingPrice}. Bids must be lower than this amount.</p>
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Auction Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/avif"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                  />
                  <p className="text-gray-600 text-sm mt-2">Upload upto 5 images simultaneously(JPEG, PNG, GIF, WebP)</p>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {imagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-24 object-cover rounded border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImages(images.filter((_, i) => i !== idx));
                              setImagePreviews(imagePreviews.filter((_, i) => i !== idx));
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2 ">Start Date</label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={auctionData.startTime}
                    onChange={handleAuctionChange}
                    onBlur={handleAuctionChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2 ">End Date</label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={auctionData.endTime}
                    onChange={handleAuctionChange}
                    onBlur={handleAuctionChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-400 text-white py-2 rounded-lg font-bold hover:bg-gray-500"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={creatingAuction}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {creatingAuction ? 'Creating Auction...' : 'Create Auction'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateAuction;
