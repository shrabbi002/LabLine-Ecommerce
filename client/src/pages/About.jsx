import React, { useState, useEffect } from 'react';
import api, { ASSET_BASE_URL } from '../api';
import { Target, Calendar, Award, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  const [aboutContent, setAboutContent] = useState({
    heading: 'About Our Mission',
    subheading: 'Driving innovation, creativity, and robust software design.',
    bodyText: 'Our company has been delivering exceptional digital solutions for over 5 years. We focus on providing modern user interfaces, premium functionalities, and fully secure systems. Our dedicated team is committed to visual excellence, technical optimization, and high user satisfaction.',
    image: '',
    additionalData: {
      teamTitle: 'Meet the Team',
      foundedYear: '2021',
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const res = await api.get('/content/about');
        if (res.data.success && res.data.data) {
          const fetched = res.data.data;
          setAboutContent({
            heading: fetched.heading || 'About Our Mission',
            subheading: fetched.subheading || 'Driving innovation, creativity, and robust software design.',
            bodyText: fetched.bodyText || '',
            image: fetched.image || '',
            additionalData: {
              teamTitle: fetched.additionalData?.teamTitle || 'Meet the Team',
              foundedYear: fetched.additionalData?.foundedYear || '2021',
            },
          });
        }
      } catch (err) {
        console.error('Error loading about copy:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAboutData();
  }, []);

  const stats = [
    { label: 'Founded', val: aboutContent.additionalData?.foundedYear || '2021', icon: Calendar },
    { label: 'Completed', val: '240+', icon: CheckCircle },
    { label: 'Awards', val: '12', icon: Award },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium tracking-wide text-sm">Loading company story...</p>
        </div>
      </div>
    );
  }

  const imageUrl = aboutContent.image
    ? `${ASSET_BASE_URL}${aboutContent.image}`
    : 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-12 sm:py-16 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[40%] sm:w-[50%] aspect-square rounded-full bg-primary-600/5 blur-[100px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] sm:w-[50%] aspect-square rounded-full bg-indigo-500/5 blur-[100px] sm:blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 relative z-10">
        {/* Hero Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-center">
          {/* Image */}
          <div className="lg:col-span-5 relative w-full max-w-sm sm:max-w-md mx-auto lg:max-w-none animate-fade-in order-2 lg:order-1">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-600 to-indigo-500 rounded-3xl opacity-10 blur-2xl transform rotate-3" />
            <div className="relative border border-slate-800/60 bg-slate-900/60 p-2.5 sm:p-3 rounded-3xl overflow-hidden shadow-2xl aspect-square">
              <img
                src={imageUrl}
                alt="Our Team"
                className="object-cover w-full h-full rounded-2xl shadow-inner"
              />
            </div>
          </div>

          {/* Text */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left animate-slide-up order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-950/40 text-primary-400 border border-primary-900/30 text-xs font-semibold uppercase tracking-wide">
              <Target className="w-3.5 h-3.5" /> Our Journey
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {aboutContent.heading}
            </h1>
            <p className="text-base sm:text-lg text-primary-300 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              {aboutContent.subheading}
            </p>
            <div className="text-slate-400 leading-relaxed text-sm whitespace-pre-line max-w-2xl mx-auto lg:mx-0">
              {aboutContent.bodyText}
            </div>
            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-primary-600/20 transition-all duration-300 text-sm"
              >
                Get In Touch <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <section className="bg-slate-900/40 border border-slate-800/40 p-6 sm:p-8 rounded-2xl shadow-xl animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center gap-3 py-4 sm:py-0">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{stat.val}</div>
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
