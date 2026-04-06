// AddCropForm.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCrops } from '../../context/CropContext';
import { X, MapPin, Calendar, Package } from 'lucide-react';

const AddCropForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addCrop, updateCrop } = useCrops();

  const editingCrop = location.state?.crop;
  const isEditing = location.state?.isEditing || false;

  const [formData, setFormData] = useState({
    name: editingCrop?.name || '',
    category: editingCrop?.category || 'Grains',
    quantity: editingCrop?.quantity || '',
    unit: editingCrop?.unit || 'kg',
    price: editingCrop?.price || '',
    harvestDate: editingCrop?.harvestDate || '',
    location: editingCrop?.location || '',
    description: editingCrop?.description || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isEditing) {
        result = await updateCrop(editingCrop.id, formData);
      } else {
        result = await addCrop(formData);
      }

      if (result.success) {
        alert(isEditing ? 'Crop updated successfully!' : 'Crop added successfully!');
        navigate('/farmer/crops');
      } else {
        setError(result.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 md:mb-8 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
              {isEditing ? 'Edit Crop' : 'Add New Crop'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {isEditing ? 'Update your crop details' : 'List your crop for buyers'}
            </p>
          </div>
          <button
            onClick={() => navigate('/farmer/crops')}
            className="text-gray-400 hover:text-gray-600 mt-1 flex-shrink-0"
          >
            <X size={22} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm sm:text-base">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">

            {/* Crop Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Crop Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                placeholder="e.g., Organic Wheat"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base bg-white"
              >
                <option value="Grains">Grains</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Oilseeds">Oilseeds</option>
                <option value="Cash Crops">Cash Crops</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity *</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="1"
                  className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                  placeholder="100"
                />
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-24 sm:w-28 px-2 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base bg-white flex-shrink-0"
                >
                  <option value="kg">kg</option>
                  <option value="quintal">quintal</option>
                  <option value="ton">ton</option>
                  <option value="pieces">pieces</option>
                </select>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price per Unit (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium text-base sm:text-lg">₹</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                  placeholder="45"
                />
              </div>
            </div>

            {/* Harvest Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Harvest Date *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  name="harvestDate"
                  value={formData.harvestDate}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Location *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                  placeholder="e.g., Pune, Maharashtra"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base resize-none"
              placeholder="Describe your crop quality, farming method, etc."
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
            >
              <Package size={18} />
              {loading ? 'Saving...' : isEditing ? 'Update Crop' : 'Add Crop'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/farmer/crops')}
              className="flex-1 bg-gray-100 text-gray-700 px-4 sm:px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCropForm;