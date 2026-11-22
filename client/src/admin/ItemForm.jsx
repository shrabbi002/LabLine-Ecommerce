import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api, { ASSET_BASE_URL } from '../api';
import { ArrowLeft, Save, Upload, X, HelpCircle, AlertCircle, FileImage, Image as ImageIcon } from 'lucide-react';

const ItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: '',
    price: '',
    status: 'draft',
    featured: false,
    tags: '',
  });

  // Image Upload states
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // Page feedback states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      const fetchItemDetails = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/items/${id}`);
          if (res.data.success) {
            const item = res.data.data;
            setFormData({
              title: item.title || '',
              shortDescription: item.shortDescription || '',
              description: item.description || '',
              category: item.category || '',
              price: item.price !== null && item.price !== undefined ? item.price : '',
              status: item.status || 'draft',
              featured: !!item.featured,
              tags: item.tags ? item.tags.join(', ') : '',
            });
            setExistingImages(item.images || []);
          }
        } catch (err) {
          setErrorMsg('Failed to load item details. Please check connection.');
          console.error('Error fetching item details:', err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchItemDetails();
    }
  }, [id, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Image file select handler
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // File validation: extension and size
    const validFiles = [];
    const previews = [];
    const errors = {};

    selectedFiles.forEach((file) => {
      if (!/image\/(jpeg|jpg|png|webp|gif)/.test(file.type)) {
        errors.files = 'Only images (JPEG, PNG, WEBP, GIF) are allowed!';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        errors.files = 'Image sizes must be less than 5MB!';
        return;
      }
      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors((prev) => ({ ...prev, ...errors }));
      return;
    }

    setNewFiles((prev) => [...prev, ...validFiles]);
    setNewPreviews((prev) => [...prev, ...previews]);
    setValidationErrors((prev) => ({ ...prev, files: '' }));
  };

  const handleRemoveNewFile = (idx) => {
    // Revoke object URL to avoid leaks
    URL.revokeObjectURL(newPreviews[idx]);

    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveExistingImage = (imgUrl) => {
    setExistingImages((prev) => prev.filter((img) => img !== imgUrl));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.shortDescription.trim()) errors.shortDescription = 'Short description is required';
    if (!formData.description.trim()) errors.description = 'Full description is required';
    if (!formData.category.trim()) errors.category = 'Category is required';
    
    // Price validation: check if number
    if (formData.price !== '' && isNaN(Number(formData.price))) {
      errors.price = 'Price must be a valid number';
    }

    // Image validation: check that at least one image is uploaded/retained
    if (existingImages.length === 0 && newFiles.length === 0) {
      errors.files = 'Please select at least one product image';
    }

    return errors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('shortDescription', formData.shortDescription.trim());
      data.append('description', formData.description.trim());
      data.append('category', formData.category.trim());
      data.append('status', formData.status);
      data.append('featured', formData.featured);
      data.append('tags', formData.tags);

      // Handle null prices
      if (formData.price !== '') {
        data.append('price', Number(formData.price));
      } else {
        data.append('price', '');
      }

      // Add existing images (which were not deleted)
      existingImages.forEach((img) => {
        data.append('existingImages', img);
      });

      // Add newly uploaded files
      newFiles.forEach((file) => {
        data.append('images', file);
      });

      let res;
      if (isEditMode) {
        res = await api.put(`/items/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/items', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.data.success) {
        navigate('/admin/items');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to preserve product item details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium tracking-wide">Retrieving item profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Links */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-5 gap-4">
          <div className="space-y-1">
            <Link to="/admin/items" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-350 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Item List
            </Link>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isEditMode ? 'Edit Product Item' : 'Create Product Item'}
            </h1>
          </div>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-400 rounded-xl flex items-start gap-3 text-sm font-medium animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main form structure */}
        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel inputs */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl space-y-4">
              
              {/* Item Title */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Item Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Premium Wireless Headset"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 bg-slate-950 border ${
                    validationErrors.title ? 'border-rose-500' : 'border-slate-800'
                  } rounded-xl text-slate-200 text-sm focus:outline-none focus:border-primary-500 transition-all duration-350`}
                />
                {validationErrors.title && <p className="text-[10px] text-rose-500 font-semibold">{validationErrors.title}</p>}
              </div>

              {/* Short Description */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Short Summary</label>
                <input
                  type="text"
                  name="shortDescription"
                  placeholder="A concise, 1-2 sentence overview for catalog cards..."
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  maxLength={250}
                  className={`w-full px-4 py-2.5 bg-slate-950 border ${
                    validationErrors.shortDescription ? 'border-rose-500' : 'border-slate-800'
                  } rounded-xl text-slate-200 text-sm focus:outline-none focus:border-primary-500 transition-all duration-350`}
                />
                {validationErrors.shortDescription && <p className="text-[10px] text-rose-500 font-semibold">{validationErrors.shortDescription}</p>}
              </div>

              {/* Full Description text body */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Detailed Specifications & Story</label>
                <textarea
                  name="description"
                  rows="10"
                  placeholder="Provide extensive technical details, project logs, services scope, or product guides..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 bg-slate-950 border ${
                    validationErrors.description ? 'border-rose-500' : 'border-slate-800'
                  } rounded-xl text-slate-200 text-sm focus:outline-none focus:border-primary-500 transition-all duration-350`}
                ></textarea>
                {validationErrors.description && <p className="text-[10px] text-rose-500 font-semibold">{validationErrors.description}</p>}
              </div>
            </div>

            {/* Images upload cards */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-white">
                  <ImageIcon className="w-4 h-4 text-purple-500" />
                  <h3 className="text-sm font-bold text-slate-200">Product Gallery</h3>
                </div>
                <span className="text-[10px] text-slate-500">jpeg, png, webp formats, &lt; 5MB</span>
              </div>

              {/* Upload Drop Zone card */}
              <div className="relative border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-8 text-center bg-slate-950 transition-colors duration-300">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <span className="text-sm font-semibold text-slate-450 block">Select image files</span>
                <span className="text-xs text-slate-500 mt-1 block">Click or drag files here</span>
              </div>
              {validationErrors.files && <p className="text-[10px] text-rose-500 font-semibold text-left">{validationErrors.files}</p>}

              {/* Preview Grids */}
              {/* Existing images (if editing) */}
              {existingImages.length > 0 && (
                <div className="space-y-2 pt-2 text-left">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Saved Gallery Images</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {existingImages.map((imgUrl, index) => (
                      <div key={index} className="relative aspect-video bg-slate-950 border border-slate-800 rounded-lg overflow-hidden group">
                        <img src={imgUrl.startsWith('http') ? imgUrl : `${ASSET_BASE_URL}${imgUrl}`} alt="Gallery thumbnail" className="object-cover w-full h-full" />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(imgUrl)}
                          className="absolute top-1.5 right-1.5 p-1 bg-slate-950/80 hover:bg-rose-600 text-slate-400 hover:text-white rounded-md transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Newly selected images previews */}
              {newPreviews.length > 0 && (
                <div className="space-y-2 pt-2 text-left">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">New Selected Images</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {newPreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-video bg-slate-950 border border-slate-800 rounded-lg overflow-hidden group animate-fade-in">
                        <img src={preview} alt="Upload preview" className="object-cover w-full h-full" />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewFile(index)}
                          className="absolute top-1.5 right-1.5 p-1 bg-slate-950/80 hover:bg-rose-600 text-slate-400 hover:text-white rounded-md transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right panel metadata configs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl space-y-5">
              
              {/* Category */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Category</label>
                <input
                  type="text"
                  name="category"
                  placeholder="e.g. Products, Web Apps, Interior Design"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 bg-slate-950 border ${
                    validationErrors.category ? 'border-rose-500' : 'border-slate-800'
                  } rounded-xl text-slate-200 text-sm focus:outline-none focus:border-primary-500 transition-all duration-305`}
                />
                {validationErrors.category && <p className="text-[10px] text-rose-500 font-semibold">{validationErrors.category}</p>}
              </div>

              {/* Price / Value */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Price / Value ($)</label>
                  <div className="group relative">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-400 cursor-help" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block w-48 p-2 rounded bg-slate-950 border border-slate-850 text-[10px] text-slate-400 leading-normal z-20 shadow-xl">
                      Optional. Leave blank if listing is an unpriced service or portfolio piece.
                    </div>
                  </div>
                </div>
                <input
                  type="text"
                  name="price"
                  placeholder="e.g. 599.99"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 bg-slate-950 border ${
                    validationErrors.price ? 'border-rose-500' : 'border-slate-800'
                  } rounded-xl text-slate-200 text-sm focus:outline-none focus:border-primary-500 transition-all duration-305`}
                />
                {validationErrors.price && <p className="text-[10px] text-rose-500 font-semibold">{validationErrors.price}</p>}
              </div>

              {/* Tags (comma separated) */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Search Tags</label>
                <input
                  type="text"
                  name="tags"
                  placeholder="e.g. react, hardware, luxury"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-primary-500 transition-all duration-305"
                />
                <span className="text-[9px] text-slate-550 leading-relaxed block mt-1">Separate tags with commas.</span>
              </div>

              {/* Status settings */}
              <div className="space-y-1.5 text-left border-t border-slate-850 pt-4">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block">Catalog Status</label>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  <label className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-300 ${
                    formData.status === 'draft'
                      ? 'bg-slate-950 border-amber-500/30 text-amber-400 font-bold'
                      : 'border-slate-850 hover:border-slate-700 text-slate-450'
                  }`}>
                    <input type="radio" name="status" value="draft" checked={formData.status === 'draft'} onChange={handleInputChange} className="hidden" />
                    Draft
                  </label>
                  <label className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-300 ${
                    formData.status === 'active'
                      ? 'bg-slate-950 border-emerald-500/30 text-emerald-400 font-bold'
                      : 'border-slate-850 hover:border-slate-700 text-slate-450'
                  }`}>
                    <input type="radio" name="status" value="active" checked={formData.status === 'active'} onChange={handleInputChange} className="hidden" />
                    Active
                  </label>
                </div>
              </div>

              {/* Featured toggle */}
              <div className="flex items-center justify-between border-t border-slate-850 pt-4 text-left">
                <div>
                  <span className="text-sm font-semibold text-slate-300 group-hover:text-amber-400 transition-colors">Featured Item</span>
                  <span className="text-[10px] text-slate-500">Showcase this item on landing headers</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-950 border border-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-slate-400 peer-checked:after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary-650 peer-checked:border-transparent"></div>
                </label>
              </div>

              {/* Submit & Save */}
              <div className="pt-4 border-t border-slate-850">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl text-sm transition-all duration-300 shadow-lg shadow-primary-600/10 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Preserving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4.5 h-4.5" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemForm;
