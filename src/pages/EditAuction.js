import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auctionAPI, categoryAPI } from '../services/api';

const formatDateTimeLocal = (date) => {
  const d = new Date(date);
  return d.getFullYear() + '-' + 
         String(d.getMonth() + 1).padStart(2, '0') + '-' + 
         String(d.getDate()).padStart(2, '0') + 'T' + 
         String(d.getHours()).padStart(2, '0') + ':' + 
         String(d.getMinutes()).padStart(2, '0');
};

function EditAuction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    auctionType: 'traditional',
    category: '',
    startTime: '',
    endTime: '',
    status: 'upcoming',
  });
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [auctionRes, categoriesRes] = await Promise.all([
          auctionAPI.getById(id),
          categoryAPI.getAll(),
        ]);

        const auctionData = auctionRes.data;
        setAuction(auctionData);
        setFormData({
          auctionType: auctionData.auctionType,
          category: auctionData.category?._id || auctionData.category,
          startTime: formatDateTimeLocal(new Date(auctionData.startTime)),
          endTime: formatDateTimeLocal(new Date(auctionData.endTime)),
          status: auctionData.status,
        });
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error('Error fetching auction:', err);
        setError('Error loading auction details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRemoveImage = (imagePath) => {
    setImagesToRemove([...imagesToRemove, imagePath]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    const validFiles = files.filter((file) => file.type && file.type.startsWith('image/'));
    setNewImages(validFiles);
    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const body = new FormData();
      body.append('auctionType', formData.auctionType);
      body.append('category', formData.category);
      body.append('startTime', new Date(formData.startTime).toISOString());
      body.append('endTime', new Date(formData.endTime).toISOString());
      body.append('status', formData.status);
      
      // Add images to remove
      imagesToRemove.forEach((imagePath) => {
        body.append('imagesToRemove', imagePath);
      });
      
      newImages.forEach((file) => {
        if (file.type && file.type.startsWith('image/')) {
          body.append('images', file);
        }
      });

      await auctionAPI.update(id, body);
      navigate('/seller-dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Error updating auction');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!auction) {
    return <div className="text-center py-12">Auction not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Edit Auction</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Auction Type</label>
              <select
                name="auctionType"
                value={formData.auctionType}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                required
              >
                <option value="traditional">Traditional</option>
                <option value="reverse">Reverse</option>
                <option value="sealed">Sealed</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                required
              >
                <option value="" style={{ fontWeight: 'bold' }}>Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Start Time</label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">End Time</label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                required
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="ended">Ended</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Add Images</label>
              <input
                type="file"
                multiple
                accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/avif"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
              />
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {imagePreviews.map((preview, idx) => (
                    <img
                      key={idx}
                      src={preview}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-24 object-cover rounded border border-gray-300"
                    />
                  ))}
                </div>
              )}
            </div>

            {auction.images && auction.images.length > 0 && (
              <div>
                <p className="font-bold mb-2">Existing Images</p>
                <div className="grid grid-cols-4 gap-2">
                  {auction.images
                    .filter(img => !imagesToRemove.includes(img))
                    .map((img, idx) => {
                    const imageBaseUrl = process.env.REACT_APP_API_URL || window.location.origin;
                    const imgUrl = img.startsWith('http') ? img : `${imageBaseUrl}${img}`;
                    return (
                      <div key={idx} className="relative">
                        <img
                          src={imgUrl}
                          alt={`Existing ${idx + 1}`}
                          className="w-full h-24 object-cover rounded border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
                {imagesToRemove.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {imagesToRemove.length} image(s) marked for removal
                  </p>
                )}
              </div>
            )}

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

export default EditAuction;
