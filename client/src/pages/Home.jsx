import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { ASSET_BASE_URL } from '../api';
import ProductSlider, { ProductSliderSkeleton } from '../components/ProductSlider';
import { Aurora, Reveal, CountUp, spotlightHandler } from '../components/motion';
import {
  ArrowRight, Star, Sparkles, Code2, ShieldCheck, Zap, TrendingUp, MousePointer2, Layers, Rocket, Package,
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'Premium Aesthetics',
    desc: 'Dynamic transitions, custom color schemes, and seamless layouts built to wow visitors at first glance.',
    gradient: 'from-violet-500 to-fuchsia-500',
  },
  {
    icon: Code2,
    title: 'Clean Architecture',
    desc: 'Powered by Vite, React, Express, and Mongoose — solid code patterns, secure APIs, and blazing performance.',
    gradient: 'from-indigo-500 to-cyan-400',
  },
  {
    icon: ShieldCheck,
    title: 'Protected Access',
    desc: 'Strict role controls, HTTP-only session cookies, rate-limit protection, and image validation built in.',
    gradient: 'from-emerald-500 to-teal-400',
  },
];

const stats = [
  { icon: Zap, value: '99.9%', label: 'Uptime' },
  { icon: TrendingUp, value: '240+', label: 'Projects' },
  { icon: Star, value: '4.9', label: 'Rating' },
];


const Home = () => {
  const [heroContent, setHeroContent] = useState({
    heading: 'Elevate Your Digital Experience',
    subheading: 'Discover a premium collection of projects, products, and services.',
    bodyText:
      'We build high-quality web applications, designs, and portfolios. Explore our featured work below and feel free to reach out for collaborations.',
    image: '',
  });
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [contentRes, itemsRes] = await Promise.all([
          api.get('/content/home'),
          api.get('/items?featured=true&limit=8'),
        ]);
        if (contentRes.data.success && contentRes.data.data) setHeroContent(contentRes.data.data);
        let slides = itemsRes.data.success ? itemsRes.data.data : [];
        // Too few featured items for a slider? Top up with the newest products.
        if (slides.length < 3) {
          const latestRes = await api.get('/items?limit=8&sort=-createdAt');
          if (latestRes.data.success) {
            const ids = new Set(slides.map((s) => s._id));
            slides = [...slides, ...latestRes.data.data.filter((s) => !ids.has(s._id))].slice(0, 8);
          }
        }
        setFeaturedItems(slides);
      } catch (err) {
        console.error('Error loading home details:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Split heading so the last two words get the animated gradient
  const words = (heroContent.heading || '').split(' ');
  const plain = words.slice(0, Math.max(words.length - 2, 0)).join(' ');
  const highlight = words.slice(Math.max(words.length - 2, 0)).join(' ');

  return (
    <div className="-mt-20 min-h-screen text-slate-100 flex flex-col overflow-hidden">
      {/* ─── Hero ─── */}
      <section className="relative pt-36 pb-20 sm:pt-44 sm:pb-28 md:pb-36 noise">
        <Aurora />
        <div className="absolute inset-0 bg-grid pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full glass text-xs font-medium text-slate-300 animate-slide-up">
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  New
                </span>
                Fresh collection just landed
                <ArrowRight className="w-3.5 h-3.5 text-primary-300" />
              </div>

              <h1
                className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.02] text-white animate-slide-up"
                style={{ animationDelay: '100ms' }}
              >
                {plain} {plain && <br className="hidden sm:block" />}
                <span className="text-gradient">{highlight}</span>
              </h1>

              <p
                className="text-lg sm:text-xl text-slate-300 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 animate-slide-up"
                style={{ animationDelay: '200ms' }}
              >
                {heroContent.subheading}
              </p>
              <p
                className="text-slate-400 leading-relaxed text-sm sm:text-base max-w-xl mx-auto lg:mx-0 animate-slide-up"
                style={{ animationDelay: '280ms' }}
              >
                {heroContent.bodyText}
              </p>

              <div
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start animate-slide-up"
                style={{ animationDelay: '360ms' }}
              >
                <Link to="/items" className="btn-primary px-7 py-4 text-base group">
                  Explore Products
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link to="/contact" className="btn-ghost px-7 py-4 text-base">
                  Contact Us
                </Link>
              </div>

              <div
                className="flex items-center justify-center lg:justify-start gap-8 sm:gap-10 pt-4 animate-slide-up"
                style={{ animationDelay: '440ms' }}
              >
                {stats.map((stat, idx) => (
                  <div key={idx} className="text-left">
                    <div className="font-display text-2xl sm:text-3xl font-bold text-white">
                      <CountUp value={stat.value} />
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                      <stat.icon className="w-3 h-3 text-primary-400" /> {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="lg:col-span-5 relative w-full max-w-md mx-auto lg:max-w-none animate-scale-in" style={{ animationDelay: '250ms' }}>
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-primary-600/40 via-indigo-500/20 to-cyan-400/30 blur-3xl animate-pulse-subtle" />
              <div className="relative rounded-[2rem] border-animated animate-float-slow">
                <div className="relative glass rounded-[2rem] p-3 aspect-[4/5] overflow-hidden">
                  {heroContent.image ? (
                    <img
                      src={`${ASSET_BASE_URL}${heroContent.image}`}
                      alt="Featured showcase"
                      className="object-cover w-full h-full rounded-[1.5rem]"
                    />
                  ) : (
                    <div className="w-full h-full rounded-[1.5rem] bg-gradient-to-br from-primary-900/60 via-[#0b0d1a] to-cyan-900/40 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute w-64 h-64 rounded-full border border-white/10 animate-spin-slow" />
                      <div className="absolute w-44 h-44 rounded-full border border-dashed border-primary-400/30 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
                      <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary-600 to-cyan-400 flex items-center justify-center text-white shadow-2xl shadow-primary-600/50">
                        <Sparkles className="w-9 h-9" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Floating chips */}
              <div className="absolute -left-4 sm:-left-10 top-[18%] glass rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl animate-float" style={{ animationDelay: '-2s' }}>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Fast delivery</div>
                  <div className="text-[10px] text-slate-400">Ships worldwide</div>
                </div>
              </div>
              <div className="absolute -right-3 sm:-right-8 bottom-[14%] glass rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl animate-float" style={{ animationDelay: '-4s' }}>
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <div className="text-xs font-semibold text-white">Loved by clients</div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex justify-center mt-20">
            <a href="#featured" className="flex flex-col items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500 hover:text-slate-300 transition-colors">
              <span className="w-6 h-10 rounded-full border border-white/15 flex justify-center pt-2">
                <span className="w-1 h-2 rounded-full bg-primary-400 animate-bounce" />
              </span>
              Scroll
            </a>
          </div>
        </div>
      </section>

      {/* ─── Featured ─── */}
      <section id="featured" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-24">
        <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">
              <Star className="w-3.5 h-3.5 fill-primary-300" /> Featured Selections
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Hand-picked <span className="text-gradient">favourites</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl">
              Our highest rated products, projects, and spotlight services — curated for you.
            </p>
          </div>
          <Link to="/items" className="btn-ghost px-5 py-3 text-sm self-center sm:self-end group">
            Browse all
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        {loading ? (
          <ProductSliderSkeleton />
        ) : featuredItems.length > 0 ? (
          <Reveal>
            <ProductSlider items={featuredItems} />
          </Reveal>
        ) : (
          <Reveal className="text-center py-16 rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-4 animate-float" />
            <p className="text-slate-300 font-medium">No featured items available right now.</p>
            <p className="text-sm text-slate-500 mt-1">Check back later or browse our full catalogue.</p>
          </Reveal>
        )}
      </section>

      {/* ─── Features ─── */}
      <section className="relative py-20 sm:py-28 w-full">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-3xl mx-auto text-center space-y-4 mb-14 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              <Layers className="w-3.5 h-3.5" /> Why us
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white">Built different, by design</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Modern technology, robust architecture and elegant layouts — delivering exceptional projects every time.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <Reveal key={idx} delay={idx * 120}>
                <div
                  onMouseMove={spotlightHandler}
                  className="spotlight group h-full rounded-3xl glass p-7 sm:p-8 transition-all duration-500 hover:-translate-y-1.5 hover:border-white/15"
                >
                  <div className="relative z-10 space-y-5">
                    <div className="relative w-14 h-14">
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-tr ${feature.gradient} blur-lg opacity-50 group-hover:opacity-90 transition-opacity duration-500`} />
                      <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-tr ${feature.gradient} flex items-center justify-center text-white transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6`}>
                        <feature.icon className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-white">{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                    <div className="text-[11px] font-mono text-slate-600">0{idx + 1}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="pb-24 sm:pb-32 pt-4 w-full">
        <Reveal className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[2rem] border-animated">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#0b0d1a] p-10 sm:p-14 md:p-20 text-center noise">
              <Aurora className="opacity-80" />
              <div className="relative z-10 space-y-6">
                <MousePointer2 className="w-8 h-8 mx-auto text-primary-300 animate-float" />
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                  Ready to get <span className="text-gradient">started?</span>
                </h2>
                <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base">
                  Reach out to discuss your project or explore our complete product catalogue.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Link to="/items" className="btn-primary px-7 py-3.5 text-sm sm:text-base group">
                    View Products <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link to="/contact" className="btn-ghost px-7 py-3.5 text-sm sm:text-base">
                    Get In Touch
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default Home;
