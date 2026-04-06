import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Truck, Clock, CheckCircle, ArrowRight, Package, FileText, Globe } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/40 via-transparent to-transparent"></div>
          <img 
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2000" 
            alt="Logistics background" 
            className="w-full h-full object-cover grayscale"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block">Premium Logistics Solutions</span>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Trust, Security, and <span className="text-accent">Speed</span> in Every Delivery.
              </h1>
              <p className="text-xl text-white/70 mb-10 leading-relaxed">
                Specializing in secure legal document transportation and bulk commodity logistics. 
                The preferred choice for businesses that demand excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/book" className="btn-accent text-lg px-8 py-4 flex items-center justify-center gap-2">
                  Book a Courier <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/track" className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                  Track Shipment <Package className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-accent text-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-1">50k+</div>
              <div className="text-sm font-medium uppercase tracking-wider opacity-70">Deliveries</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-1">99.9%</div>
              <div className="text-sm font-medium uppercase tracking-wider opacity-70">On-Time Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-1">200+</div>
              <div className="text-sm font-medium uppercase tracking-wider opacity-70">Fleet Vehicles</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-1">24/7</div>
              <div className="text-sm font-medium uppercase tracking-wider opacity-70">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">Our Specialized Services</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Tailored logistics solutions designed to meet the unique demands of your industry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div 
              whileHover={{ y: -10 }}
              className="glass-card p-10 rounded-2xl border-l-8 border-accent"
            >
              <div className="w-16 h-16 bg-primary/5 rounded-xl flex items-center justify-center mb-6">
                <FileText className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Legal Document Courier</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Secure, time-sensitive transportation for legal documents. 
                Includes chain-of-custody tracking, identity verification, and tamper-proof logs.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="text-accent w-4 h-4" /> Secure Delivery Mode
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="text-accent w-4 h-4" /> OTP Verification
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="text-accent w-4 h-4" /> Digital Audit Trail
                </li>
              </ul>
              <Link to="/book?type=legal" className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all">
                Learn More <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="glass-card p-10 rounded-2xl border-l-8 border-primary"
            >
              <div className="w-16 h-16 bg-primary/5 rounded-xl flex items-center justify-center mb-6">
                <Globe className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Commodity Transport</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Bulk shipment solutions for business logistics. From parcels to bulk goods, 
                our fleet covers bikes, vans, and heavy-duty trucks.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="text-accent w-4 h-4" /> Fleet Selection
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="text-accent w-4 h-4" /> Distance-based Pricing
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="text-accent w-4 h-4" /> Real-time Fleet Tracking
                </li>
              </ul>
              <Link to="/book?type=commodity" className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all">
                Learn More <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-primary mb-8">Why Prestige Couriers?</h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <Shield className="text-accent w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Unmatched Security</h4>
                    <p className="text-gray-500">Military-grade encryption and strict verification protocols for every shipment.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <Clock className="text-accent w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Punctuality Guaranteed</h4>
                    <p className="text-gray-500">We understand that time is money. Our routing AI ensures the fastest possible delivery.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <Truck className="text-accent w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Modern Fleet</h4>
                    <p className="text-gray-500">Our vehicles are equipped with real-time GPS and temperature control for sensitive goods.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-accent/20 rounded-3xl blur-2xl"></div>
              <img 
                src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=1000" 
                alt="Truck on highway" 
                className="relative rounded-3xl shadow-2xl z-10"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience Prestige Service?</h2>
          <p className="text-xl text-white/60 mb-10">
            Join thousands of businesses that trust us with their most critical logistics needs.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="btn-accent px-10 py-4 text-lg">Get Started Now</Link>
            <Link to="/track" className="bg-white/10 hover:bg-white/20 px-10 py-4 rounded-lg font-semibold transition-all">Track a Parcel</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
