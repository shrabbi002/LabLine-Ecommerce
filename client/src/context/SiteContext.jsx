import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const SiteContext = createContext();

export const useSite = () => useContext(SiteContext);

export const SiteProvider = ({ children }) => {
  const [websiteName, setWebsiteName] = useState('ProductHub');
  const [loading, setLoading] = useState(true);

  const fetchSiteSettings = async () => {
    try {
      const res = await api.get('/content/general');
      if (res.data.success && res.data.data) {
        const data = res.data.data;
        const name = data.additionalData?.websiteName || data.heading || 'ProductHub';
        setWebsiteName(name);
        document.title = name;
      }
    } catch (error) {
      console.error('Failed to load site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const value = {
    websiteName,
    setWebsiteName,
    refreshSiteSettings: fetchSiteSettings,
    loading
  };

  return (
    <SiteContext.Provider value={value}>
      {children}
    </SiteContext.Provider>
  );
};
