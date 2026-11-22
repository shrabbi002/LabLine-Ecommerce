import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import { Aurora, Reveal, PageLoader, spotlightHandler } from '../components/motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Clock, MessageSquare } from 'lucide-react';

/** Input with a label that floats up when focused or filled. */
const Field = ({ label, name, value, onChange, error, type = 'text', textarea = false }) => {
  const Tag = textarea ? 'textarea' : 'input';
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Tag
          id={name}
          name={name}
          type={textarea ? undefined : type}
          rows={textarea ? 5 : undefined}
          value={value}
          onChange={onChange}
          placeholder=" "
          className={`peer input-modern px-4 pt-6 pb-2.5 ${textarea ? 'resize-none' : ''} ${
            error ? '!border-rose-500/70 focus:!shadow-[0_0_0_4px_rgba(244,63,94,0.15)]' : ''
          }`}
        />
        <label
          htmlFor={name}
          className="pointer-events-none absolute left-4 top-4 text-sm text-slate-500 transition-all duration-300 origin-left
            peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-primary-300 peer-focus:tracking-wide
            peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:tracking-wide"
        >
          {label}
        </label>
      </div>
      {error && <p className="text-xs text-rose-400 font-medium pl-1 animate-slide-down">{error}</p>}
    </div>
  );
};

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

  const [formData, setFormData] = useState({ name: '', email: '', subject: defaultSubject, message: '' });
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
    if (validationErrors[name]) setValidationErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Please provide a valid email address';
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

  if (loading) return <PageLoader label="Loading contact form..." />;

  const contactItems = [
    { icon: MapPin, label: 'Office', value: contactDetails.address, action: null, gradient: 'from-primary-600 to-indigo-500' },
    { icon: Mail, label: 'Email', value: contactDetails.email, action: `mailto:${contactDetails.email}`, gradient: 'from-cyan-500 to-sky-500' },
    { icon: Phone, label: 'Phone', value: contactDetails.phone, action: `tel:${contactDetails.phone}`, gradient: 'from-emerald-500 to-teal-500' },
    { icon: Clock, label: 'Hours', value: 'Mon – Fri: 9:00 AM – 6:00 PM', action: null, gradient: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="-mt-20 text-slate-100 overflow-hidden">
      <section className="relative pt-36 pb-14 sm:pt-44 noise">
        <Aurora />
        <div className="absolute inset-0 bg-grid pointer-events-none" />
        <div className="relative z-10 text-center space-y-5 max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-slate-300 animate-slide-up">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" />
            </span>
            Usually replies within 24h
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white animate-slide-up" style={{ animationDelay: '80ms' }}>
            {contactDetails.heading.split(' ').slice(0, -1).join(' ')}{' '}
            <span className="text-gradient">{contactDetails.heading.split(' ').slice(-1)}</span>
          </h1>
          <p className="text-slate-400 sm:text-lg max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '160ms' }}>
            {contactDetails.subheading}
          </p>
        </div>
      </section>

      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Info */}
        <div className="lg:col-span-5 space-y-4 order-2 lg:order-1">
          {contactDetails.bodyText && (
            <Reveal>
              <p className="text-slate-400 leading-relaxed px-1 mb-2">{contactDetails.bodyText}</p>
            </Reveal>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {contactItems.map((item, idx) => {
              const Wrapper = item.action ? 'a' : 'div';
              return (
                <Reveal key={idx} delay={idx * 90}>
                  <Wrapper
                    {...(item.action ? { href: item.action } : {})}
                    onMouseMove={spotlightHandler}
                    className="spotlight group flex items-center gap-4 glass rounded-2xl p-5 hover:border-white/15 hover:translate-x-1 transition-all duration-500"
                  >
                    <div className={`relative z-10 w-12 h-12 rounded-xl bg-gradient-to-tr ${item.gradient} flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="relative z-10 min-w-0">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.14em]">{item.label}</div>
                      <div className={`text-sm mt-0.5 break-words ${item.action ? 'text-white group-hover:text-primary-200' : 'text-slate-200'} transition-colors`}>
                        {item.value}
                      </div>
                    </div>
                  </Wrapper>
                </Reveal>
              );
            })}
          </div>

          {contactDetails.mapEmbedUrl && (
            <Reveal className="glass rounded-3xl p-2 aspect-video overflow-hidden">
              <iframe
                title="Office Location Map"
                src={contactDetails.mapEmbedUrl}
                className="w-full h-full rounded-2xl grayscale-[60%] invert-[90%] hue-rotate-180"
                allowFullScreen=""
                loading="lazy"
              />
            </Reveal>
          )}
        </div>

        {/* Form */}
        <div className="lg:col-span-7 order-1 lg:order-2 animate-slide-up" style={{ animationDelay: '220ms' }}>
          <div className="relative rounded-3xl border-animated">
            <div className="glass bg-[#0b0d1a]/80 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/15 border border-primary-500/25 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary-300" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-white">Send us a message</h2>
                  <p className="text-xs text-slate-500">All fields are required</p>
                </div>
              </div>

              {successMsg && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl flex items-start gap-3 animate-scale-in text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl flex items-start gap-3 animate-scale-in text-sm font-medium">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full name" name="name" value={formData.name} onChange={handleInputChange} error={validationErrors.name} />
                  <Field label="Email address" name="email" type="email" value={formData.email} onChange={handleInputChange} error={validationErrors.email} />
                </div>
                <Field label="Subject" name="subject" value={formData.subject} onChange={handleInputChange} error={validationErrors.subject} />
                <Field label="Tell us about your project..." name="message" textarea value={formData.message} onChange={handleInputChange} error={validationErrors.message} />

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto px-8 py-4 text-sm group">
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send message
                        <Send className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
