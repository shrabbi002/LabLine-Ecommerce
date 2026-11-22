import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { ASSET_BASE_URL } from '../api';
import { Aurora, Reveal, CountUp, PageLoader, spotlightHandler } from '../components/motion';
import { Target, Calendar, Award, CheckCircle, ArrowRight, Heart, Lightbulb, Gem } from 'lucide-react';

const values = [
  { icon: Lightbulb, title: 'Innovate', desc: 'We question defaults and ship ideas that move the needle.', gradient: 'from-amber-500 to-orange-500' },
  { icon: Gem, title: 'Craft', desc: 'Every pixel and every line of code is considered and polished.', gradient: 'from-primary-500 to-indigo-500' },
  { icon: Heart, title: 'Care', desc: 'Long-term partnerships built on trust, honesty and results.', gradient: 'from-rose-500 to-fuchsia-500' },
];

const About = () => {
  const [aboutContent, setAboutContent] = useState({
    heading: 'About Our Mission',
    subheading: 'Driving innovation, creativity, and robust software design.',
    bodyText:
      'Our company has been delivering exceptional digital solutions for over 5 years. We focus on providing modern user interfaces, premium functionalities, and fully secure systems. Our dedicated team is committed to visual excellence, technical optimization, and high user satisfaction.',
    image: '',
    additionalData: { teamTitle: 'Meet the Team', foundedYear: '2021' },
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

  if (loading) return <PageLoader label="Loading company story..." />;

  const stats = [
    { label: 'Founded', val: aboutContent.additionalData?.foundedYear || '2021', icon: Calendar },
    { label: 'Projects completed', val: '240+', icon: CheckCircle },
    { label: 'Awards won', val: '12', icon: Award },
  ];

  const imageUrl = aboutContent.image
    ? `${ASSET_BASE_URL}${aboutContent.image}`
    : 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="-mt-20 text-slate-100 overflow-hidden">
      <section className="relative pt-36 pb-20 sm:pt-44 sm:pb-28 noise">
        <Aurora />
        <div className="absolute inset-0 bg-grid pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-slate-300 animate-slide-up">
              <Target className="w-3.5 h-3.5 text-primary-300" /> Our journey
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.05] animate-slide-up" style={{ animationDelay: '80ms' }}>
              {aboutContent.heading}
            </h1>
            <p className="text-lg sm:text-xl text-gradient font-semibold max-w-xl mx-auto lg:mx-0 animate-slide-up" style={{ animationDelay: '160ms' }}>
              {aboutContent.subheading}
            </p>
            <div className="text-slate-400 leading-relaxed whitespace-pre-line max-w-2xl mx-auto lg:mx-0 animate-slide-up" style={{ animationDelay: '240ms' }}>
              {aboutContent.bodyText}
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '320ms' }}>
              <Link to="/contact" className="btn-primary px-7 py-3.5 text-sm group">
                Get In Touch <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative w-full max-w-md mx-auto lg:max-w-none animate-scale-in" style={{ animationDelay: '200ms' }}>
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-primary-600/40 to-cyan-400/25 blur-3xl" />
            <div className="relative rounded-[2rem] border-animated">
              <div className="glass rounded-[2rem] p-3 aspect-square overflow-hidden">
                <img src={imageUrl} alt="Our team" className="object-cover w-full h-full rounded-[1.5rem] hover:scale-105 transition-transform duration-[1.5s]" />
              </div>
            </div>
            <div className="absolute -bottom-5 -left-4 sm:-left-8 glass bg-[#0b0d1a]/80 rounded-2xl px-5 py-4 shadow-2xl animate-float">
              <div className="font-display text-3xl font-bold text-white">
                <CountUp value={`${Math.max(new Date().getFullYear() - Number(aboutContent.additionalData?.foundedYear || 2021), 1)}+`} />
              </div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400">Years of craft</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {stats.map((stat, index) => (
            <Reveal key={index} delay={index * 120}>
              <div
                onMouseMove={spotlightHandler}
                className="spotlight group glass rounded-3xl p-8 text-center hover:-translate-y-1 transition-transform duration-500"
              >
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-primary-600/40 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="font-display text-4xl sm:text-5xl font-bold text-white">
                    {stat.label === 'Founded' ? stat.val : <CountUp value={stat.val} />}
                  </div>
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-[0.16em]">{stat.label}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32">
        <Reveal className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            What we <span className="text-gradient">stand for</span>
          </h2>
          <p className="text-slate-400">The principles behind every product we ship.</p>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 120}>
              <div onMouseMove={spotlightHandler} className="spotlight group h-full glass rounded-3xl p-8 hover:-translate-y-1.5 transition-transform duration-500">
                <div className="relative z-10 space-y-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${v.gradient} flex items-center justify-center text-white group-hover:-rotate-6 group-hover:scale-110 transition-transform duration-500`}>
                    <v.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white">{v.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
