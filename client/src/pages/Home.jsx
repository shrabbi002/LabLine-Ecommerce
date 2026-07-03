import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { ASSET_BASE_URL } from '../api';
import ItemCard from '../components/ItemCard';
import { ArrowRight, Star, Sparkles, Code2, ShieldCheck, Flame, Zap, TrendingUp } from 'lucide-react';

const Home = () => {
  const [heroContent, setHeroContent] = useState({
    heading: 'Elevate Your Digital Experience',
    subheading: 'Discover a premium collection of projects, products, and services.',
    bodyText: 'We build high-quality web applications, designs, and portfolios. Explore our featured work below and feel free to reach out for collaborations.',
    image: '',
  });
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch Home copy content
        const contentRes = await api.get('/content/home');
        if (contentRes.data.success && contentRes.data.data) {
          setHeroContent(contentRes.data.data);
        }

        // Fetch featured items
        const itemsRes = await api.get('/items?featured=true&limit=3');
        if (itemsRes.data.success) {
          setFeaturedItems(itemsRes.data.data);
        }
      } catch (err) {
        console.error('Error loading home details:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const features = [
    {
      icon: Sparkles,
      title: 'Premium Aesthetics',
      desc: 'Dynamic transitions, custom color schemes, and seamless layout designs built to wow visitors at first glance.',
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      icon: Code2,
      title: 'Clean Architecture',
      desc: 'Powered by Vite, React, Express, and Mongoose — solid code patterns, secure APIs, and blazing performance.',
      gradient: 'from-primary-500 to-cyan-500',
    },
    {
      icon: ShieldCheck,
      title: 'Protected Access',
      desc: 'Strict role controls, secure HTTP-only session cookies, rate-limit protections, and image validations built-in.',
      gradient: 'from-emerald-500 to-teal-500',
    },
  ];

  const stats = [
    { icon: Zap, value: '99.9%', label: 'Uptime' },
    { icon: TrendingUp, value: '240+', label: 'Projects' },
    { icon: Star, value: '4.9', label: 'Rating' },
  ];

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-20 sm:pb-24 md:pt-28 md:pb-36 border-b border-slate-900/50">
        {/* Ambient glow effects */}
        <div className="absolute top-[-15%] left-[-10%] w-[50%] sm:w-[40%] aspect-square rounded-full bg-primary-600/8 blur-[100px] sm:blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[55%] sm:w-[45%] aspect-square rounded-full bg-indigo-500/8 blur-[100px] sm:blur-[130px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] aspect-square rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-950/40 text-primary-400 border border-primary-800/30 text-xs font-semibold uppercase tracking-wide">
                <Flame className="w-3.5 h-3.5" /> Live Administration
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
                {heroContent.heading}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-primary-200/90 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                {heroContent.subheading}
              </p>
              <p className="text-slate-400 leading-relaxed text-sm sm:text-base max-w-2xl mx-auto lg:mx-0">
                {heroContent.bodyText}
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 justify-center lg:justify-start">
                <Link
                  to="/items"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-semibold px-6 sm:px-7 py-3.5 rounded-xl shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 transition-all duration-300 transform hover:-translate-y-0.5 text-sm sm:text-base"
                >
                  Explore Products <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center justify-center gap-2 border border-slate-800/60 hover:border-slate-700 text-slate-300 hover:text-white font-semibold px-6 sm:px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 text-sm sm:text-base"
                >
                  Contact Us
                </Link>
              </div>

              {/* Mini Stats Row */}
              <div className="flex items-center justify-center lg:justify-start gap-6 sm:gap-8 pt-4 sm:pt-6">
                {stats.map((stat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-950/50 border border-primary-900/30 flex items-center justify-center text-primary-400">
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm sm:text-base font-bold text-white leading-none">{stat.value}</div>
                      <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium uppercase tracking-wide">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="lg:col-span-5 relative w-full max-w-sm sm:max-w-md lg:max-w-none mx-auto animate-slide-up">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-600 to-indigo-500 rounded-3xl opacity-10 blur-2xl transform rotate-6 scale-95" />
              <div className="relative border border-slate-800/60 bg-slate-900/50 backdrop-blur-sm p-3 sm:p-4 rounded-3xl overflow-hidden shadow-2xl aspect-square flex items-center justify-center">
                {heroContent.image ? (
                  <img
                    src={`${ASSET_BASE_URL}${heroContent.image}`}
                    alt="Hub Product Graphic"
                    className="object-cover w-full h-full rounded-2xl shadow-inner"
                  />
                ) : (
                  <div className="text-center p-6 sm:p-8 space-y-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-lg animate-float">
                      <Sparkles className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Welcome Banner</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Upload a custom graphic from the admin dashboard to replace this placeholder</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Items Section ─── */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-12 gap-4">
          <div className="space-y-2 sm:space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary-400">
              <Star className="w-3.5 h-3.5 fill-primary-400" /> Featured Selections
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Featured Products</h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Take a look at some of our highest rated, hand-selected products, projects, and spotlight service listings.
            </p>
          </div>
          <Link
            to="/items"
            className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-sm font-semibold text-primary-400 hover:text-primary-300 group border-b border-transparent hover:border-primary-400/30 pb-1 self-center sm:self-end transition-all duration-300"
          >
            Browse All Items <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-4 space-y-4 animate-pulse">
                <div className="aspect-[16/10] bg-slate-800/60 rounded-xl" />
                <div className="h-6 bg-slate-800/60 rounded w-2/3" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-800/60 rounded w-full" />
                  <div className="h-4 bg-slate-800/60 rounded w-5/6" />
                </div>
                <div className="h-10 bg-slate-800/60 rounded-xl" />
              </div>
            ))}
          </div>
        ) : featuredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 stagger-children">
            {featuredItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 border border-dashed border-slate-800/60 rounded-2xl bg-slate-900/10">
            <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3 animate-float" />
            <p className="text-slate-400 font-medium">No featured items available right now.</p>
            <p className="text-xs text-slate-500 mt-1">Check back later or browse our full products page.</p>
          </div>
        )}
      </section>

      {/* ─── Features Grid Section ─── */}
      <section className="py-16 sm:py-20 bg-slate-900/20 border-t border-slate-800/30 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Why Work With Us</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              We leverage modern technology, robust architectural patterns, and elegant layouts to deliver exceptional projects.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 stagger-children">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group bg-slate-900/40 border border-slate-800/40 p-6 sm:p-8 rounded-2xl hover:border-slate-700/50 hover:bg-slate-900/70 transition-all duration-500 text-left space-y-4 animate-slide-up hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feature.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-16 sm:py-20 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative bg-gradient-to-r from-primary-600/10 to-indigo-600/10 border border-primary-500/20 rounded-3xl p-8 sm:p-12 md:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Ready to Get Started?</h2>
              <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
                Reach out to discuss your project or explore our complete product catalog.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link
                  to="/items"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-primary-600/20 transition-all duration-300 text-sm sm:text-base"
                >
                  View Products <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 border border-slate-700 text-slate-300 hover:text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/5 transition-all duration-300 text-sm sm:text-base"
                >
                  Get In Touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
