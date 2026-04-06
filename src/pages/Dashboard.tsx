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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            {user ? `Welcome, ${profile?.displayName}` : 'Guest Dashboard'}
          </h1>
          <p className="text-gray-500">
            {user ? 'Manage your logistics and track your deliveries.' : 'Please sign in to view your shipment history.'}
          </p>
        </div>
        <div className="flex gap-4">
          {!isDriver && (
            <Link to="/book" className="btn-accent flex items-center gap-2">
              <Plus className="w-5 h-5" /> New Booking
            </Link>
          )}
          {isDriver && (
            <Link to="/driver" className="btn-primary flex items-center gap-2">
              <Truck className="w-5 h-5" /> Driver Console
            </Link>
          )}
          {!user && (
            <Link to="/login" className="btn-primary flex items-center gap-2">
              <User className="w-5 h-5" /> Sign In
            </Link>
          )}
        </div>
      </div>

      {user ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.filter(s => !s.hide && (s.show === undefined || s.show)).map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-6 rounded-2xl flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <stat.icon className="text-accent w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">{stat.label}</div>
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Shipments */}
          <div className="glass-card rounded-3xl overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Recent Shipments</h3>
              <Link to="/track" className="text-accent text-sm font-bold hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-neutral-light text-gray-400 text-xs uppercase tracking-widest font-bold">
                    <th className="px-8 py-4">Shipment ID</th>
                    <th className="px-8 py-4">Type</th>
                    <th className="px-8 py-4">Distance</th>
                    <th className="px-8 py-4">Destination</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Date</th>
                    <th className="px-8 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {shipments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-8 py-12 text-center text-gray-400">
                        No shipments found. Start by booking your first delivery!
                      </td>
                    </tr>
                  ) : (
                    shipments.map((shipment) => (
                      <tr key={shipment.id} className="hover:bg-neutral-light/50 transition-colors group">
                        <td className="px-8 py-6 font-mono text-sm font-bold">{shipment.id.slice(0, 8)}...</td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            {shipment.type === 'legal' ? <Shield className="w-4 h-4 text-accent" /> : <Package className="w-4 h-4 text-primary" />}
                            <span className="capitalize text-sm font-medium">{shipment.type}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold">
                          {shipment.distance} km
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-300" />
                            <span className="truncate max-w-[200px]">{shipment.delivery.address}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                            shipment.status === 'delivered' ? 'bg-green-100 text-green-600' :
                            shipment.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {shipment.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-sm text-gray-500">
                          {format(new Date(shipment.createdAt), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-8 py-6">
                          <Link 
                            to={`/track/${shipment.id}`}
                            className="text-primary hover:text-accent flex items-center gap-1 font-bold text-sm group-hover:translate-x-1 transition-all"
                          >
                            Track <ArrowRight className="w-4 h-4" />
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
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-primary mb-2">Shipment History Unavailable</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            To view your previous shipments and manage your account, please sign in or create an account.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/login" className="btn-primary px-8">Sign In</Link>
            <Link to="/register" className="btn-accent px-8">Create Account</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
