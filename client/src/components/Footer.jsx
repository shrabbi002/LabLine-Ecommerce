import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useSite } from '../context/SiteContext';
import { Mail, Phone, MapPin, ArrowUpRight, Heart, ArrowUp } from 'lucide-react';
import { Reveal } from './motion';

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
    { icon: Facebook, url: contactInfo.facebook, label: 'Facebook' },
    { icon: Twitter, url: contactInfo.twitter, label: 'Twitter' },
    { icon: Instagram, url: contactInfo.instagram, label: 'Instagram' },
    { icon: Linkedin, url: contactInfo.linkedin, label: 'LinkedIn' },
  ];

  const columns = [
    {
      title: 'Navigate',
      links: [
        { label: 'Home', path: '/' },
        { label: 'Products', path: '/items' },
        { label: 'About Us', path: '/about' },
        { label: 'Contact', path: '/contact' },
      ],
    },
    {
      title: 'Discover',
      links: [
        { label: 'Featured Products', path: '/items' },
        { label: 'Company Story', path: '/about' },
        { label: 'Customer Support', path: '/contact' },
      ],
    },
  ];

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-white/[0.06] bg-[#04050c] text-slate-400">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-500/60 to-transparent" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-8">
        <Reveal className="grid grid-cols-2 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-5 space-y-6">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white font-display font-bold shadow-lg shadow-primary-600/30 group-hover:rotate-[8deg] transition-transform duration-500">
                {websiteName ? websiteName.charAt(0).toUpperCase() : 'S'}
              </span>
              <span className="font-display text-xl font-bold text-white">{websiteName}</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              A premium space to catalog, explore, and showcase elite products, services, and portfolio pieces.
            </p>
            <div className="flex gap-2.5">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="group relative w-11 h-11 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-tr from-primary-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Icon className="relative w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-[0.16em] mb-5">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="group inline-flex items-center gap-1 text-sm text-slate-500 hover:text-white transition-colors duration-300">
                      <span className="relative">
                        {link.label}
                        <span className="absolute left-0 -bottom-0.5 h-px w-full bg-gradient-to-r from-primary-400 to-cyan-400 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
                      </span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div className="col-span-2 md:col-span-3">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-[0.16em] mb-5">Contact</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-500 leading-relaxed">{contactInfo.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <a href={`mailto:${contactInfo.email}`} className="text-slate-500 hover:text-white transition-colors break-all">
                  {contactInfo.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <a href={`tel:${contactInfo.phone}`} className="text-slate-500 hover:text-white transition-colors">
                  {contactInfo.phone}
                </a>
              </li>
            </ul>
          </div>
        </Reveal>

        {/* Oversized wordmark */}
        <div className="mt-16 select-none pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="font-display font-bold text-center leading-none text-[18vw] md:text-[12rem] bg-gradient-to-b from-white/[0.07] to-transparent bg-clip-text text-transparent tracking-tighter truncate">
            {websiteName}
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p className="flex items-center gap-1">
            © {new Date().getFullYear()} {websiteName}. Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" /> All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group w-9 h-9 rounded-full glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              aria-label="Back to top"
            >
              <ArrowUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
