// FarmerCrops.jsx
import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useCrops } from '../../context/CropContext';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  Calendar,
  DollarSign,
  X,
  Loader2
} from 'lucide-react';

const FarmerCrops = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { crops, deleteCrop, loading } = useCrops();

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const filteredCrops = crops.filter(crop => {
    const matchesSearch =
      crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crop.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || crop.status.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  const totalCrops = crops.length;
  const availableCrops = crops.filter(c => c.status === 'Available').length;
  const totalValue = crops.reduce((sum, crop) => sum + (crop.quantity * crop.price), 0);

  const handleView = (crop) => {
    setSelectedCrop(crop);
    setShowViewModal(true);
  };

  const handleEdit = (crop) => {
    navigate('/farmer/add-crop', { state: { crop, isEditing: true } });
  };

  const handleDelete = async (cropId, cropName) => {
    if (!window.confirm(`Are you sure you want to delete ${cropName}?`)) return;

    setDeletingId(cropId);
    const result = await deleteCrop(cropId);
    setDeletingId(null);

    if (result.success) {
      alert(`${cropName} deleted successfully!`);
      if (showViewModal) setShowViewModal(false);
    } else {
      alert(result.message || 'Failed to delete crop');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-green-600" size={40} />
          <p className="text-gray-500 text-sm sm:text-base">Loading your crops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Responsive styles */}
      <style>{`
        .crops-stats-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }
        .crops-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .search-filter-row {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .crop-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 8px 6px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 12px;
          cursor: pointer;
          border: none;
          flex: 1;
          transition: background 0.2s;
        }
        .modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 20px;
        }
        .modal-action-row {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        @media (min-width: 480px) {
          .crops-stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 640px) {
          .crops-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .search-filter-row {
            flex-direction: row;
          }
          .modal-action-row {
            flex-direction: row;
          }
        }
        @media (min-width: 1024px) {
          .crops-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>

      <div className="mb-6 sm:mb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 sm:mb-6 gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">{t.myCrops}</h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">{t.manageyourcropinventoryandlistings}</p>
          </div>
          <button
            onClick={() => navigate('/farmer/add-crop')}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus size={18} />
            {t.addNewCrops}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="crops-stats-grid">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm mb-1">{t.totalCrop}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">{totalCrops}</p>
              </div>
              <div className="bg-green-100 p-2.5 sm:p-3 rounded-full flex-shrink-0">
                <Package className="text-green-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm mb-1">{t.available}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">{availableCrops}</p>
              </div>
              <div className="bg-blue-100 p-2.5 sm:p-3 rounded-full flex-shrink-0">
                <Calendar className="text-blue-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm mb-1">{t.totalValue}</p>
                <p className="text-xl sm:text-3xl font-bold text-gray-800">₹{totalValue.toLocaleString()}</p>
              </div>
              <div className="bg-purple-100 p-2.5 sm:p-3 rounded-full flex-shrink-0">
                <DollarSign className="text-purple-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg">
          <div className="search-filter-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={t.searchcropsbynameorcategory}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-400 flex-shrink-0" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1 sm:flex-none border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base bg-white"
              >
                <option value="all">{t.allStatus}</option>
                <option value="available">{t.available}</option>
                <option value="sold">{t.sold}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Crops Grid */}
      <div className="crops-grid">
        {filteredCrops.map((crop) => (
          <div
            key={crop.id}
            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="text-2xl sm:text-3xl flex-shrink-0">{crop.image}</div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{crop.name}</h3>
                    <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                      {crop.category}
                    </span>
                  </div>
                </div>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold flex-shrink-0 ${
                  crop.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {crop.status}
                </span>
              </div>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Quantity</span>
                  <span className="font-semibold text-sm">{crop.quantity} {crop.unit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Price</span>
                  <span className="font-bold text-green-600 text-sm">₹{crop.price}/{crop.unit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Location</span>
                  <span className="font-medium text-sm truncate ml-2 max-w-[60%] text-right">{crop.location || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Total Value</span>
                  <span className="font-bold text-gray-800 text-sm">
                    ₹{(crop.quantity * crop.price).toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm line-clamp-2">{crop.description}</p>

              {/* Action Buttons */}
              <div className="flex gap-1.5 sm:gap-2">
                <button
                  onClick={() => handleView(crop)}
                  className="crop-action-btn bg-green-50 text-green-600 hover:bg-green-100"
                >
                  <Eye size={14} /> <span className="hidden xs:inline sm:inline">View</span>
                </button>
                <button
                  onClick={() => handleEdit(crop)}
                  className="crop-action-btn bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  <Edit size={14} /> <span className="hidden xs:inline sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(crop.id, crop.name)}
                  disabled={deletingId === crop.id}
                  className="crop-action-btn bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  {deletingId === crop.id
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Trash2 size={14} />
                  }
                  <span className="hidden xs:inline sm:inline">Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* VIEW CROP MODAL */}
      {showViewModal && selectedCrop && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-5 sm:p-8">
              <div className="flex items-center justify-between mb-5 sm:mb-6 gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="text-4xl sm:text-5xl flex-shrink-0">{selectedCrop.image}</div>
                  <div className="min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">{selectedCrop.name}</h2>
                    <span className="text-gray-600 text-sm sm:text-base">{selectedCrop.category}</span>
                  </div>
                </div>
                <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <X size={22} />
                </button>
              </div>

              <div className="mb-5 sm:mb-6">
                <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${
                  selectedCrop.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {selectedCrop.status}
                </span>
              </div>

              <div className="modal-grid">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <p className="text-gray-500 text-xs sm:text-sm mb-1">Quantity</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-800">{selectedCrop.quantity} {selectedCrop.unit}</p>
                </div>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <p className="text-gray-500 text-xs sm:text-sm mb-1">Price</p>
                  <p className="text-lg sm:text-xl font-bold text-green-600">₹{selectedCrop.price}/{selectedCrop.unit}</p>
                </div>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <p className="text-gray-500 text-xs sm:text-sm mb-1">Location</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-800">{selectedCrop.location || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl col-span-2">
                  <p className="text-gray-500 text-xs sm:text-sm mb-1">Total Value</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">
                    ₹{(selectedCrop.quantity * selectedCrop.price).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedCrop.description && (
                <div className="mb-5 sm:mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Description</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{selectedCrop.description}</p>
                </div>
              )}

              <div className="modal-action-row">
                <button
                  onClick={() => { setShowViewModal(false); handleEdit(selectedCrop); }}
                  className="flex-1 bg-blue-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Edit size={16} /> Edit Crop
                </button>
                <button
                  onClick={() => handleDelete(selectedCrop.id, selectedCrop.name)}
                  disabled={deletingId === selectedCrop.id}
                  className="flex-1 bg-red-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                >
                  <Trash2 size={16} /> Delete
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-gray-200 text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredCrops.length === 0 && !loading && (
        <div className="text-center py-10 sm:py-12">
          <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🌾</div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">{t.nocropsfound}</h3>
          <p className="text-gray-500 mb-5 sm:mb-6 text-sm sm:text-base px-4">{t.tryadjustingyoursearchoraddanewcrop}</p>
          <button
            onClick={() => navigate('/farmer/add-crop')}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg text-sm sm:text-base"
          >
            {t.addyourfirstcrop}
          </button>
        </div>
      )}
    </div>
  );
};

export default FarmerCrops;