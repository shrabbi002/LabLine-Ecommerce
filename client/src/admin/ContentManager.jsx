import React, { useState, useEffect } from 'react';
import api, { ASSET_BASE_URL } from '../api';
import { Edit, Save, Upload, CheckCircle2, AlertCircle, Home, Info, Mail, Eye, Image } from 'lucide-react';

const ContentManager = () => {
  const [activeTab, setActiveTab] = useState('home');

  // Home details state
  const [homeForm, setHomeForm] = useState({
    heading: '',
    subheading: '',
    bodyText: '',
  });
  const [homeFile, setHomeFile] = useState(null);
  const [homePreview, setHomePreview] = useState('');
  const [homeSavedImage, setHomeSavedImage] = useState('');

  // About details state
  const [aboutForm, setAboutForm] = useState({
    heading: '',
    subheading: '',
    bodyText: '',
    teamTitle: '',
    foundedYear: '',
  });
  const [aboutFile, setAboutFile] = useState(null);
  const [aboutPreview, setAboutPreview] = useState('');
  const [aboutSavedImage, setAboutSavedImage] = useState('');

  // Contact details state
  const [contactForm, setContactForm] = useState({
    heading: '',
    subheading: '',
    bodyText: '',
    address: '',
    email: '',
    phone: '',
    mapEmbedUrl: '',
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
  });

  // Action status indicators
  const [loading, setLoading] = useState(true);
  const [preserving, setPreserving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadSectionContents = async () => {
    setLoading(true);
    try {
      // 1. Fetch Home
      const homeRes = await api.get('/content/home');
      if (homeRes.data.success && homeRes.data.data) {
        const item = homeRes.data.data;
        setHomeForm({
          heading: item.heading || '',
          subheading: item.subheading || '',
          bodyText: item.bodyText || '',
        });
        setHomeSavedImage(item.image || '');
      }

      // 2. Fetch About
      const aboutRes = await api.get('/content/about');
      if (aboutRes.data.success && aboutRes.data.data) {
        const item = aboutRes.data.data;
        const add = item.additionalData || {};
        setAboutForm({
          heading: item.heading || '',
          subheading: item.subheading || '',
          bodyText: item.bodyText || '',
          teamTitle: add.teamTitle || '',
          foundedYear: add.foundedYear || '',
        });
        setAboutSavedImage(item.image || '');
      }

      // 3. Fetch Contact
      const contactRes = await api.get('/content/contact');
      if (contactRes.data.success && contactRes.data.data) {
        const item = contactRes.data.data;
        const add = item.additionalData || {};
        setContactForm({
          heading: item.heading || '',
          subheading: item.subheading || '',
          bodyText: item.bodyText || '',
          address: add.address || '',
          email: add.email || '',
          phone: add.phone || '',
          mapEmbedUrl: add.mapEmbedUrl || '',
          facebook: add.facebook || '',
          twitter: add.twitter || '',
          instagram: add.instagram || '',
          linkedin: add.linkedin || '',
        });
      }
    } catch (err) {
      console.error('Error fetching section values:', err.message);
      setErrorMsg('Failed to fetch details content. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSectionContents();
  }, []);

  const handleTextChange = (section, e) => {
    const { name, value } = e.target;
    if (section === 'home') {
      setHomeForm((prev) => ({ ...prev, [name]: value }));
    } else if (section === 'about') {
      setAboutForm((prev) => ({ ...prev, [name]: value }));
    } else if (section === 'contact') {
      setContactForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (section, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!/image\/(jpeg|jpg|png|webp|gif)/.test(file.type)) {
      setErrorMsg('Only image files (JPEG, PNG, WEBP, GIF) are allowed!');
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    if (section === 'home') {
      setHomeFile(file);
      setHomePreview(previewUrl);
    } else if (section === 'about') {
      setAboutFile(file);
      setAboutPreview(previewUrl);
    }
  };

  const handleRemoveSelectedFile = (section) => {
    if (section === 'home') {
      if (homePreview) URL.revokeObjectURL(homePreview);
      setHomeFile(null);
      setHomePreview('');
    } else if (section === 'about') {
      if (aboutPreview) URL.revokeObjectURL(aboutPreview);
      setAboutFile(null);
      setAboutPreview('');
    }
  };

  const handleContentSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setPreserving(true);

    try {
      const data = new FormData();

      if (activeTab === 'home') {
        data.append('heading', homeForm.heading.trim());
        data.append('subheading', homeForm.subheading.trim());
        data.append('bodyText', homeForm.bodyText.trim());
        if (homeFile) {
          data.append('image', homeFile);
        }

        const res = await api.put('/content/home', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.success) {
          setSuccessMsg("Home page layouts updated successfully!");
          setHomeSavedImage(res.data.data.image);
          handleRemoveSelectedFile('home');
        }
      } else if (activeTab === 'about') {
        data.append('heading', aboutForm.heading.trim());
        data.append('subheading', aboutForm.subheading.trim());
        data.append('bodyText', aboutForm.bodyText.trim());
        
        // Structure map properties
        const additional = {
          teamTitle: aboutForm.teamTitle.trim(),
          foundedYear: aboutForm.foundedYear.trim(),
        };
        data.append('additionalData', JSON.stringify(additional));
        
        if (aboutFile) {
          data.append('image', aboutFile);
        }

        const res = await api.put('/content/about', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.success) {
          setSuccessMsg("About section layouts updated successfully!");
          setAboutSavedImage(res.data.data.image);
          handleRemoveSelectedFile('about');
        }
      } else if (activeTab === 'contact') {
        data.append('heading', contactForm.heading.trim());
        data.append('subheading', contactForm.subheading.trim());
        data.append('bodyText', contactForm.bodyText.trim());

        const additional = {
          address: contactForm.address.trim(),
          email: contactForm.email.trim(),
          phone: contactForm.phone.trim(),
          mapEmbedUrl: contactForm.mapEmbedUrl.trim(),
          facebook: contactForm.facebook.trim(),
          twitter: contactForm.twitter.trim(),
          instagram: contactForm.instagram.trim(),
          linkedin: contactForm.linkedin.trim(),
        };
        data.append('additionalData', JSON.stringify(additional));

        const res = await api.put('/content/contact', data);
        if (res.data.success) {
          setSuccessMsg("Contact information layouts updated successfully!");
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save layout content changes.');
      console.error('Save content error:', err.message);
    } finally {
      setPreserving(false);
    }
  };

  const tabs = [
    { id: 'home', label: 'Home Page', icon: Home },
    { id: 'about', label: 'About Page', icon: Info },
    { id: 'contact', label: 'Contact Page', icon: Mail },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium tracking-wide">Loading editor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title */}
        <div className="border-b border-slate-900 pb-5">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Edit className="w-6 h-6 text-primary-500" /> Page Content Manager
          </h1>
          <p className="text-slate-400 text-xs mt-1">Modify banner headers, details story descriptions, and maps coordinates dynamically.</p>
        </div>

        {/* Tab Headers selector */}
        <div className="flex border-b border-slate-850 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSuccessMsg('');
                  setErrorMsg('');
                }}
                className={`flex items-center gap-2 px-5 py-3.5 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-400 font-black'
                    : 'border-transparent text-slate-450 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Status Messages */}
        {successMsg && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-450 rounded-xl flex items-start gap-3 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-450 rounded-xl flex items-start gap-3 text-xs font-semibold animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Active tab content form */}
        <form onSubmit={handleContentSubmit} className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl space-y-6">
          
          {activeTab === 'home' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
              
              {/* Text Fields */}
              <div className="lg:col-span-7 space-y-4">
                {/* Heading */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Hero Heading</label>
                  <input
                    type="text"
                    name="heading"
                    value={homeForm.heading}
                    onChange={(e) => handleTextChange('home', e)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all duration-300"
                  />
                </div>

                {/* Subheading */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Hero Subheading</label>
                  <input
                    type="text"
                    name="subheading"
                    value={homeForm.subheading}
                    onChange={(e) => handleTextChange('home', e)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all duration-300"
                  />
                </div>

                {/* Body Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Introductory Summary</label>
                  <textarea
                    name="bodyText"
                    rows="6"
                    value={homeForm.bodyText}
                    onChange={(e) => handleTextChange('home', e)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all duration-300"
                  ></textarea>
                </div>
              </div>

              {/* Graphics Banner image upload */}
              <div className="lg:col-span-5 space-y-4">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block">Hero Graphic Image</label>
                
                {/* Image Previews card */}
                <div className="border border-slate-800 bg-slate-950 p-4 rounded-xl flex items-center justify-center aspect-video relative overflow-hidden">
                  {homePreview ? (
                    <img src={homePreview} alt="Selected preview" className="object-cover w-full h-full rounded" />
                  ) : homeSavedImage ? (
                    <img src={homeSavedImage.startsWith('http') ? homeSavedImage : `${ASSET_BASE_URL}${homeSavedImage}`} alt="Preserved header graphic" className="object-cover w-full h-full rounded" />
                  ) : (
                    <div className="text-center text-slate-600 text-xs space-y-1">
                      <Image className="w-8 h-8 mx-auto" />
                      <span>No custom image uploaded</span>
                    </div>
                  )}
                </div>

                {/* File picker triggers */}
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('home', e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button type="button" className="w-full py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1">
                      <Upload className="w-3.5 h-3.5" /> Upload File
                    </button>
                  </div>
                  {homePreview && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedFile('home')}
                      className="px-3 bg-slate-950 border border-slate-800 hover:border-rose-900 hover:text-rose-455 rounded-lg text-xs transition-colors"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
              
              {/* Left panel about information */}
              <div className="lg:col-span-7 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Main Title</label>
                  <input
                    type="text"
                    name="heading"
                    value={aboutForm.heading}
                    onChange={(e) => handleTextChange('about', e)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all duration-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Subheading Tagline</label>
                  <input
                    type="text"
                    name="subheading"
                    value={aboutForm.subheading}
                    onChange={(e) => handleTextChange('about', e)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all duration-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Detailed Company Story</label>
                  <textarea
                    name="bodyText"
                    rows="6"
                    value={aboutForm.bodyText}
                    onChange={(e) => handleTextChange('about', e)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all duration-300"
                  ></textarea>
                </div>

                {/* Additional details */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Team Grid Heading</label>
                    <input
                      type="text"
                      name="teamTitle"
                      value={aboutForm.teamTitle}
                      onChange={(e) => handleTextChange('about', e)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Founded Year</label>
                    <input
                      type="text"
                      name="foundedYear"
                      value={aboutForm.foundedYear}
                      onChange={(e) => handleTextChange('about', e)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Right panel graphic uploads */}
              <div className="lg:col-span-5 space-y-4">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block">Highlight Photo</label>
                
                <div className="border border-slate-800 bg-slate-950 p-4 rounded-xl flex items-center justify-center aspect-video relative overflow-hidden">
                  {aboutPreview ? (
                    <img src={aboutPreview} alt="Selected preview" className="object-cover w-full h-full rounded" />
                  ) : aboutSavedImage ? (
                    <img src={aboutSavedImage.startsWith('http') ? aboutSavedImage : `${ASSET_BASE_URL}${aboutSavedImage}`} alt="Preserved team highlight" className="object-cover w-full h-full rounded" />
                  ) : (
                    <div className="text-center text-slate-600 text-xs space-y-1">
                      <Image className="w-8 h-8 mx-auto" />
                      <span>No custom photo uploaded</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('about', e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button type="button" className="w-full py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1">
                      <Upload className="w-3.5 h-3.5" /> Upload File
                    </button>
                  </div>
                  {aboutPreview && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedFile('about')}
                      className="px-3 bg-slate-950 border border-slate-800 hover:border-rose-900 hover:text-rose-455 rounded-lg text-xs transition-colors"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
              
              {/* Left panel contact texts */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Main Header</label>
                  <input
                    type="text"
                    name="heading"
                    value={contactForm.heading}
                    onChange={(e) => handleTextChange('contact', e)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all duration-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Subheading tagline</label>
                  <input
                    type="text"
                    name="subheading"
                    value={contactForm.subheading}
                    onChange={(e) => handleTextChange('contact', e)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all duration-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Contact Introductory Statement</label>
                  <textarea
                    name="bodyText"
                    rows="4"
                    value={contactForm.bodyText}
                    onChange={(e) => handleTextChange('contact', e)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all duration-300"
                  ></textarea>
                </div>

                {/* Map Coordinates iframe source link */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Google Maps Embed URL</label>
                  <input
                    type="text"
                    name="mapEmbedUrl"
                    placeholder="e.g. https://www.google.com/maps/embed?pb=..."
                    value={contactForm.mapEmbedUrl}
                    onChange={(e) => handleTextChange('contact', e)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all duration-300"
                  />
                  <span className="text-[9px] text-slate-550 leading-relaxed block mt-1">Copy the src URL from the Google Maps iframe embed code.</span>
                </div>
              </div>

              {/* Right panel metadata fields & socials */}
              <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-slate-850 pt-4 lg:pt-0 lg:pl-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Office Address</label>
                    <input
                      type="text"
                      name="address"
                      value={contactForm.address}
                      onChange={(e) => handleTextChange('contact', e)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Direct Email</label>
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={(e) => handleTextChange('contact', e)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Direct Phone Line</label>
                  <input
                    type="text"
                    name="phone"
                    value={contactForm.phone}
                    onChange={(e) => handleTextChange('contact', e)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all duration-300"
                  />
                </div>

                {/* Social links fields */}
                <div className="border-t border-slate-850 pt-4 space-y-4">
                  <h4 className="text-xs font-semibold text-slate-350 uppercase tracking-wide">Social URL Handles</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Facebook</label>
                      <input type="text" name="facebook" value={contactForm.facebook} onChange={(e) => handleTextChange('contact', e)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Twitter</label>
                      <input type="text" name="twitter" value={contactForm.twitter} onChange={(e) => handleTextChange('contact', e)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Instagram</label>
                      <input type="text" name="instagram" value={contactForm.instagram} onChange={(e) => handleTextChange('contact', e)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">LinkedIn</label>
                      <input type="text" name="linkedin" value={contactForm.linkedin} onChange={(e) => handleTextChange('contact', e)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-primary-500 transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Save Button */}
          <div className="border-t border-slate-805 pt-5 text-right">
            <button
              type="submit"
              disabled={preserving}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold px-6 py-3 rounded-xl text-xs transition-all duration-300 shadow-md shadow-primary-500/10 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {preserving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving layout edits...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Page Content
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentManager;
