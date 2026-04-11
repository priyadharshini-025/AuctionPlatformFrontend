import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function EditProduct() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startingPrice: '',
    category: '',
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [productRes, categoriesRes] = await Promise.all([
        productAPI.getById(id),
        categoryAPI.getAll(),
      ]);
      setFormData(productRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      setError('Error fetching product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await productAPI.update(id, formData);
      navigate('/seller-dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Error updating product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Edit Product</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Starting Price</label>
              <input
                type="number"
                name="startingPrice"
                value={formData.startingPrice}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Inventory</label>
              <input
                type="number"
                name="inventory"
                value={formData.inventory}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 relative z-10"
                required
              >
                <option value="" style={{ fontWeight: 'bold' }}>Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/seller-dashboard')}
                className="flex-1 bg-gray-400 text-white py-2 rounded-lg font-bold hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProduct;
