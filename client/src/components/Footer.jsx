import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useSite } from '../context/SiteContext';
import { Mail, Phone, MapPin, ArrowUpRight, Heart } from 'lucide-react';

// Custom inline SVGs for social icons
const Facebook = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const Twitter = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

const Instagram = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const Linkedin = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const Footer = () => {
  const { websiteName } = useSite();
  const [contactInfo, setContactInfo] = useState({
    address: '123 Tech Avenue, Silicon Valley, CA',
    email: 'hello@producthub.com',
    phone: '+1 (555) 123-4567',
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
  });

  useEffect(() => {
    const fetchContactDetails = async () => {
      try {
        const res = await api.get('/content/contact');
        if (res.data.success && res.data.data) {
          const content = res.data.data;
          const additional = content.additionalData || {};
          
          setContactInfo({
            address: additional.address || '123 Tech Avenue, Silicon Valley, CA',
            email: additional.email || 'hello@producthub.com',
            phone: additional.phone || '+1 (555) 123-4567',
            facebook: additional.facebook || 'https://facebook.com',
            twitter: additional.twitter || 'https://twitter.com',
            instagram: additional.instagram || 'https://instagram.com',
            linkedin: additional.linkedin || 'https://linkedin.com',
          });
        }
      } catch (err) {
        console.log('Unable to load footer contact details, utilizing defaults.');
      }
    };
    fetchContactDetails();
  }, []);

  const socialLinks = [
    { icon: Facebook, url: contactInfo.facebook, label: 'Facebook', color: 'hover:text-blue-400 hover:border-blue-400/30' },
    { icon: Twitter, url: contactInfo.twitter, label: 'Twitter', color: 'hover:text-sky-400 hover:border-sky-400/30' },
    { icon: Instagram, url: contactInfo.instagram, label: 'Instagram', color: 'hover:text-pink-400 hover:border-pink-400/30' },
    { icon: Linkedin, url: contactInfo.linkedin, label: 'LinkedIn', color: 'hover:text-blue-500 hover:border-blue-500/30' },
  ];

  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/items' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact Form', path: '/contact' },
  ];

  const portalLinks = [
    { label: 'Admin Login', path: '/admin/login' },
    { label: 'Dashboard Hub', path: '/admin/dashboard' },
  ];

  return (
    <footer className="bg-slate-950 border-t border-slate-800/50 text-slate-400 relative overflow-hidden">
      {/* Subtle gradient accent along top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {/* Logo & Description */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1 space-y-5">
            <Link to="/" className="flex items-center gap-2.5 group inline-flex">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/10 group-hover:shadow-primary-500/30 transition-all duration-300">
                {websiteName ? websiteName.charAt(0).toUpperCase() : 'S'}
              </div>
              <span className="text-lg font-bold text-white">
                {websiteName}
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              A premium space to catalog, explore, and showcase elite products, services, and developer portfolio pieces.
            </p>
            {/* Social Icons */}
            <div className="flex gap-2 pt-1">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`w-9 h-9 rounded-lg bg-slate-900/80 border border-slate-800/60 flex items-center justify-center text-slate-500 transition-all duration-300 hover:bg-slate-800 hover:scale-105 ${social.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-500 hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Portal Info */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Portal</h3>
            <ul className="space-y-2.5">
              {portalLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-500 hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
              <li className="pt-2 space-y-1">
                <span className="text-slate-600 text-xs block">Vite React + Tailwind CSS</span>
                <span className="text-slate-600 text-xs block">Node.js + Mongoose</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 sm:col-span-1 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <span className="text-slate-500 text-xs leading-relaxed">{contactInfo.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <a href={`mailto:${contactInfo.email}`} className="text-slate-500 hover:text-white transition-colors duration-200 text-xs break-all">
                  {contactInfo.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <a href={`tel:${contactInfo.phone}`} className="text-slate-500 hover:text-white transition-colors duration-200 text-xs">
                  {contactInfo.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/50 mt-10 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p className="flex items-center gap-1">
            © {new Date().getFullYear()} {websiteName}. Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors duration-200">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
