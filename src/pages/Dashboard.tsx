import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Shipment, UserProfile } from '../types';
import { Package, Truck, Clock, CheckCircle, ArrowRight, Plus, Shield, User, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { formatCurrency } from '../lib/utils';

const Dashboard: React.FC = () => {
  const { user, profile, isAdmin, isDriver } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) {
      setLoading(false);
      return;
    }

    let q;
    if (isAdmin) {
      q = query(collection(db, 'shipments'), orderBy('createdAt', 'desc'), limit(20));
    } else if (isDriver) {
      q = query(collection(db, 'shipments'), where('driverId', '==', user.uid), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, 'shipments'), where('customerId', '==', user.uid), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shipment));
      setShipments(docs);
      setLoading(false);
    }, (err) => {
      console.error('Dashboard fetch error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, profile, isAdmin, isDriver]);

  const stats = [
    { label: 'Active Shipments', value: shipments.filter(s => s.status !== 'delivered' && s.status !== 'cancelled').length, icon: Truck },
    { label: 'Completed', value: shipments.filter(s => s.status === 'delivered').length, icon: CheckCircle },
    { label: 'Total Spent', value: formatCurrency(shipments.reduce((acc, s) => acc + s.price, 0)), icon: Package, hide: isDriver || !user },
    { label: 'Pending Assignment', value: shipments.filter(s => s.status === 'pending').length, icon: Clock, show: isAdmin },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-20 gap-8">
        <div>
          <span className="micro-label mb-4 block text-accent">Intelligence Hub</span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tighter">
            {user ? `Welcome, ${profile?.displayName}` : 'Guest Dashboard'}
          </h1>
          <p className="text-white/40 font-light tracking-wide mt-2">
            {user ? 'Overseeing your global logistics and asset intelligence.' : 'Please authenticate to access full manifest history.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          {!isDriver && (
            <Link to="/book" className="btn-accent flex items-center gap-3 px-8">
              <Plus className="w-4 h-4" /> New Booking
            </Link>
          )}
          {isDriver && (
            <Link to="/driver" className="btn-primary flex items-center gap-3 px-8">
              <Truck className="w-4 h-4" /> Driver Console
            </Link>
          )}
          {!user && (
            <Link to="/login" className="btn-outline flex items-center gap-3 px-8">
              <User className="w-4 h-4" /> Sign In
            </Link>
          )}
        </div>
      </div>

      {user ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {stats.filter(s => !s.hide && (s.show === undefined || s.show)).map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-8 rounded-3xl flex items-center gap-6 border-white/5 group hover:border-accent/30 transition-all duration-500"
              >
                <div className="w-14 h-14 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-accent group-hover:text-primary transition-all duration-500">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="micro-label mb-1">{stat.label}</div>
                  <div className="text-2xl font-serif font-bold text-white">{stat.value}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Shipments */}
          <div className="glass-card rounded-3xl overflow-hidden border-white/5">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/2">
              <h3 className="font-serif font-bold text-2xl text-white">Recent Manifests</h3>
              <Link to="/track" className="micro-label text-accent hover:text-white transition-colors">View All Intelligence</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/2 text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold">
                    <th className="px-10 py-6">Manifest ID</th>
                    <th className="px-10 py-6">Service</th>
                    <th className="px-10 py-6">Distance</th>
                    <th className="px-10 py-6">Destination</th>
                    <th className="px-10 py-6">Status</th>
                    <th className="px-10 py-6">Date</th>
                    <th className="px-10 py-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {shipments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-10 py-20 text-center text-white/20">
                        <div className="flex flex-col items-center gap-4">
                          <Package className="w-12 h-12 opacity-10" />
                          <span className="micro-label">No manifests found in intelligence database.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    shipments.map((shipment) => (
                      <tr key={shipment.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-10 py-8 font-serif font-bold text-sm text-white tracking-widest">{shipment.id.slice(0, 8).toUpperCase()}</td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-3">
                            {shipment.type === 'legal' ? <Shield className="w-4 h-4 text-accent" /> : <Package className="w-4 h-4 text-white/40" />}
                            <span className="capitalize text-xs font-bold tracking-wider text-white/70">{shipment.type}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8 text-xs font-bold text-white/60">
                          {shipment.distance} km
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-3 text-xs text-white/40 font-light">
                            <MapPin className="w-4 h-4 text-white/10" />
                            <span className="truncate max-w-[200px]">{shipment.delivery.address}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                            shipment.status === 'delivered' ? 'bg-green-400/10 text-green-400 border-green-400/20' :
                            shipment.status === 'pending' ? 'bg-accent/10 text-accent border-accent/20' :
                            'bg-blue-400/10 text-blue-400 border-blue-400/20'
                          }`}>
                            {shipment.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-10 py-8 text-xs text-white/30 font-light">
                          {format(new Date(shipment.createdAt), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-10 py-8">
                          <Link 
                            to={`/track/${shipment.id}`}
                            className="text-accent hover:text-white flex items-center gap-2 micro-label group-hover:translate-x-2 transition-all"
                          >
                            Track <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-32 glass-card rounded-3xl border-white/5 border-dashed border-2">
          <div className="w-20 h-20 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Package className="w-10 h-10 text-white/10" />
          </div>
          <h3 className="text-3xl font-serif font-bold text-white mb-4 tracking-tight">Intelligence Restricted</h3>
          <p className="text-white/40 max-w-md mx-auto mb-12 font-light leading-relaxed">
            To access your global manifest history and manage your prestige assets, please authenticate your profile.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/login" className="btn-accent px-12 py-5">Sign In</Link>
            <Link to="/register" className="btn-outline px-12 py-5">Create Profile</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
