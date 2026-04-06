import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Truck, Clock, CheckCircle, ArrowRight, Package, FileText, Globe } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center bg-primary overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-primary z-10"></div>
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2000" 
            alt="Logistics background" 
            className="w-full h-full object-cover grayscale opacity-50"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <span className="micro-label mb-6 block text-accent">Est. 2026 — Global Logistics</span>
              <h1 className="text-6xl md:text-8xl font-serif font-bold text-white mb-8 leading-[0.9] tracking-tighter">
                The Standard of <br />
                <span className="text-accent italic">Prestige</span> Logistics.
              </h1>
              <p className="text-lg md:text-xl text-white/50 mb-12 leading-relaxed max-w-2xl font-light tracking-wide">
                Bespoke transportation solutions for legal documents and high-value commodities. 
                Where security meets unparalleled speed.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/book" className="btn-accent px-10 py-5 group">
                  <span className="flex items-center gap-3">
                    Book a Courier <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link to="/track" className="btn-outline px-10 py-5">
                  Track Shipment
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce opacity-30">
          <div className="w-px h-12 bg-white"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-secondary border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: 'Deliveries', value: '50k+' },
              { label: 'On-Time Rate', value: '99.9%' },
              { label: 'Fleet Vehicles', value: '200+' },
              { label: 'Support', value: '24/7' }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="text-4xl font-serif font-bold text-accent mb-2">{stat.value}</div>
                <div className="micro-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <span className="micro-label mb-4 block">Our Expertise</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Specialized Solutions</h2>
            <div className="w-20 h-1 bg-accent mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-12 rounded-3xl group hover:border-accent/30 transition-all duration-500"
            >
              <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center mb-8 group-hover:bg-accent group-hover:text-primary transition-all duration-500">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-serif font-bold mb-6">Legal Document Courier</h3>
              <p className="text-white/40 mb-8 leading-relaxed font-light">
                Secure, time-sensitive transportation for critical legal assets. 
                Full chain-of-custody tracking with biometric-grade verification.
              </p>
              <ul className="space-y-4 mb-10">
                {['Secure Delivery Mode', 'OTP Verification', 'Digital Audit Trail'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white/60">
                    <div className="w-1 h-1 bg-accent rounded-full"></div> {item}
                  </li>
                ))}
              </ul>
              <Link to="/book?type=legal" className="micro-label text-accent flex items-center gap-2 hover:gap-4 transition-all">
                Explore Service <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-12 rounded-3xl group hover:border-accent/30 transition-all duration-500"
            >
              <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center mb-8 group-hover:bg-accent group-hover:text-primary transition-all duration-500">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-serif font-bold mb-6">Commodity Transport</h3>
              <p className="text-white/40 mb-8 leading-relaxed font-light">
                Premium bulk shipment solutions for high-value minerals and business assets. 
                Real-time fleet monitoring and specialized handling.
              </p>
              <ul className="space-y-4 mb-10">
                {['Fleet Selection', 'Distance-based Pricing', 'Real-time Monitoring'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white/60">
                    <div className="w-1 h-1 bg-accent rounded-full"></div> {item}
                  </li>
                ))}
              </ul>
              <Link to="/book?type=commodity" className="micro-label text-accent flex items-center gap-2 hover:gap-4 transition-all">
                Explore Service <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-32 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <span className="micro-label mb-4 block">The Prestige Advantage</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-12">Why Choose Us?</h2>
              <div className="space-y-12">
                {[
                  { icon: Shield, title: 'Unmatched Security', desc: 'Military-grade encryption and strict verification protocols for every shipment.' },
                  { icon: Clock, title: 'Punctuality Guaranteed', desc: 'We understand that time is money. Our routing AI ensures the fastest possible delivery.' },
                  { icon: Truck, title: 'Modern Fleet', desc: 'Our vehicles are equipped with real-time GPS and specialized handling for sensitive goods.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6 group">
                    <div className="flex-shrink-0 w-14 h-14 border border-white/10 rounded-2xl flex items-center justify-center group-hover:border-accent transition-all duration-500">
                      <item.icon className="text-accent w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-xl mb-2 text-white">{item.title}</h4>
                      <p className="text-white/40 font-light leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-10 bg-accent/5 rounded-full blur-3xl"></div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="relative z-10"
              >
                <img 
                  src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=1000" 
                  alt="Truck on highway" 
                  className="rounded-3xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-6 -right-6 glass-card p-8 rounded-2xl hidden md:block">
                  <div className="text-3xl font-serif font-bold text-accent mb-1">99.9%</div>
                  <div className="micro-label">Success Rate</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent via-transparent to-transparent"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <span className="micro-label mb-6 block">Ready to Begin?</span>
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-8 text-white">Experience Prestige Service.</h2>
          <p className="text-lg text-white/40 mb-12 font-light tracking-wide">
            Join the elite circle of businesses that trust us with their most critical logistics needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/register" className="btn-accent px-12 py-5">Get Started Now</Link>
            <Link to="/track" className="btn-outline px-12 py-5">Track a Parcel</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
