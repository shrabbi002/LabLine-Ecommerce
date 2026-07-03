import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const Contact = () => {
  const [searchParams] = useSearchParams();
  const defaultSubject = searchParams.get('subject') || '';

  const [contactDetails, setContactDetails] = useState({
    heading: 'Get In Touch',
    subheading: 'Have a project in mind or want to say hello? Drop us a line.',
    bodyText: 'We respond to all inquiries within 24 hours. Fill out the contact form or reach out directly using the details below.',
    address: '123 Tech Avenue, Silicon Valley, CA',
    email: 'hello@producthub.com',
    phone: '+1 (555) 123-4567',
    mapEmbedUrl: '',
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: defaultSubject,
    message: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchContactDetails = async () => {
      try {
        const res = await api.get('/content/contact');
        if (res.data.success && res.data.data) {
          const content = res.data.data;
          const additional = content.additionalData || {};
          setContactDetails({
            heading: content.heading || 'Get In Touch',
            subheading: content.subheading || 'Have a project in mind or want to say hello? Drop us a line.',
            bodyText: content.bodyText || '',
            address: additional.address || '123 Tech Avenue, Silicon Valley, CA',
            email: additional.email || 'hello@producthub.com',
            phone: additional.phone || '+1 (555) 123-4567',
            mapEmbedUrl: additional.mapEmbedUrl || '',
          });
        }
      } catch (err) {
        console.error('Error fetching contact copy:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchContactDetails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please provide a valid email address';
    }
    if (!formData.subject.trim()) errors.subject = 'Subject is required';
    if (!formData.message.trim()) errors.message = 'Message is required';
    return errors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/contact', formData);
      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Your message has been sent successfully!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit form. Please check requirements and retry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium tracking-wide text-sm">Loading contact forms...</p>
        </div>
      </div>
    );
  }

  const contactItems = [
    {
      icon: MapPin,
      label: 'Office Location',
      value: contactDetails.address,
      action: null,
    },
    {
      icon: Mail,
      label: 'Email Inquiry',
      value: contactDetails.email,
      action: `mailto:${contactDetails.email}`,
    },
    {
      icon: Phone,
      label: 'Call Support',
      value: contactDetails.phone,
      action: `tel:${contactDetails.phone}`,
    },
    {
      icon: Clock,
      label: 'Business Hours',
      value: 'Mon - Fri: 9:00 AM - 6:00 PM',
      action: null,
    },
  ];

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-12 sm:py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">{contactDetails.heading}</h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">{contactDetails.subheading}</p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Contact Info Panel */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6 order-2 lg:order-1">
            <div className="bg-slate-900 border border-slate-800/60 p-5 sm:p-6 rounded-2xl shadow-xl space-y-5 sm:space-y-6">
              <h2 className="text-lg font-bold text-white border-b border-slate-800/40 pb-3">Contact Information</h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{contactDetails.bodyText}</p>

              <div className="space-y-3 sm:space-y-4">
                {contactItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-primary-600/20 to-indigo-600/20 border border-primary-900/30 flex items-center justify-center text-primary-400 flex-shrink-0">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.label}</h3>
                      {item.action ? (
                        <a href={item.action} className="text-primary-400 hover:text-primary-300 text-sm block mt-0.5 break-all transition-colors">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-slate-300 text-sm mt-0.5">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Embed */}
            {contactDetails.mapEmbedUrl && (
              <div className="bg-slate-900 border border-slate-800/60 p-2.5 sm:p-3 rounded-2xl shadow-xl aspect-video overflow-hidden">
                <iframe
                  title="Office Location Map"
                  src={contactDetails.mapEmbedUrl}
                  className="w-full h-full rounded-xl border border-slate-800/40"
                  allowFullScreen=""
                  loading="lazy"
                />
              </div>
            )}
          </div>

          {/* Form Panel */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="bg-slate-900 border border-slate-800/60 p-5 sm:p-6 rounded-2xl shadow-xl space-y-5 sm:space-y-6">
              <h2 className="text-lg font-bold text-white border-b border-slate-800/40 pb-3">Send Us A Message</h2>

              {/* Banners */}
              {successMsg && (
                <div className="p-3 sm:p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded-xl flex items-start gap-3 animate-fade-in text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 sm:p-4 bg-rose-950/60 border border-rose-800 text-rose-400 rounded-xl flex items-start gap-3 animate-fade-in text-sm font-medium">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className={`w-full px-4 py-2.5 sm:py-3 bg-slate-950 border ${
                        validationErrors.name ? 'border-rose-500' : 'border-slate-800/60'
                      } rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-300`}
                    />
                    {validationErrors.name && <p className="text-[10px] text-rose-500 font-semibold">{validationErrors.name}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className={`w-full px-4 py-2.5 sm:py-3 bg-slate-950 border ${
                        validationErrors.email ? 'border-rose-500' : 'border-slate-800/60'
                      } rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-300`}
                    />
                    {validationErrors.email && <p className="text-[10px] text-rose-500 font-semibold">{validationErrors.email}</p>}
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="How can we help?"
                    className={`w-full px-4 py-2.5 sm:py-3 bg-slate-950 border ${
                      validationErrors.subject ? 'border-rose-500' : 'border-slate-800/60'
                    } rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-300`}
                  />
                  {validationErrors.subject && <p className="text-[10px] text-rose-500 font-semibold">{validationErrors.subject}</p>}
                </div>

                {/* Message */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">Message</label>
                  <textarea
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your project..."
                    className={`w-full px-4 py-2.5 sm:py-3 bg-slate-950 border ${
                      validationErrors.message ? 'border-rose-500' : 'border-slate-800/60'
                    } rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-300 resize-none`}
                  />
                  {validationErrors.message && <p className="text-[10px] text-rose-500 font-semibold">{validationErrors.message}</p>}
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl shadow-lg shadow-primary-600/10 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 text-sm float-right"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Send Inquiry
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
