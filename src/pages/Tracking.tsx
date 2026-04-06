import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Shipment } from '../types';
import { Package, MapPin, Clock, CheckCircle, Truck, Shield, AlertCircle, QrCode } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { formatCurrency } from '../lib/utils';
import { QRCodeSVG } from 'qrcode.react';

const Tracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState(id || '');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'shipments', id), (doc) => {
      if (doc.exists()) {
        setShipment({ id: doc.id, ...doc.data() } as Shipment);
        setError(null);
      } else {
        setError('Shipment not found');
      }
      setLoading(false);
    }, (err) => {
      setError('Failed to fetch shipment');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const getStatusIndex = (status: string) => {
    const statuses = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered'];
    return statuses.indexOf(status);
  };

  const steps = [
    { label: 'Booked', icon: Package },
    { label: 'Assigned', icon: CheckCircle },
    { label: 'Picked Up', icon: Truck },
    { label: 'In Transit', icon: MapPin },
    { label: 'Delivered', icon: Shield },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <span className="micro-label mb-4 block text-accent">Real-time Intelligence</span>
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-8 tracking-tighter">Track Shipment</h1>
        <div className="max-w-xl mx-auto relative group">
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Enter Tracking Manifest ID"
            className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-full focus:border-accent outline-none text-white font-light transition-all pr-32"
          />
          <Link 
            to={`/track/${trackingId}`}
            className="absolute right-2 top-2 bottom-2 btn-accent px-8 flex items-center justify-center"
          >
            Track
          </Link>
        </div>
      </motion.div>

      {!id && (
        <div className="text-center py-32 glass-card rounded-3xl border-white/5 border-dashed border-2">
          <Package className="w-20 h-20 text-white/10 mx-auto mb-6" />
          <p className="text-white/30 micro-label">Awaiting Manifest ID for Intelligence Retrieval</p>
        </div>
      )}

      {error && (
        <div className="bg-red-400/10 border border-red-400/20 text-red-400 p-8 rounded-3xl flex items-center gap-6 mb-12">
          <AlertCircle className="w-10 h-10" />
          <div>
            <h4 className="micro-label text-red-400 mb-1">Manifest Error</h4>
            <p className="font-light">{error}</p>
          </div>
        </div>
      )}

      {shipment && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Status Progress */}
            <div className="glass-card p-12 rounded-3xl border-white/5">
              <div className="flex justify-between items-start mb-16">
                <div>
                  <span className="micro-label mb-2 block">Manifest ID</span>
                  <h2 className="text-3xl font-serif font-bold text-white tracking-widest">{shipment.id}</h2>
                </div>
                <div className="text-right">
                  <span className="micro-label mb-2 block">Current Status</span>
                  <span className="px-6 py-2 bg-accent/10 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest border border-accent/20">
                    {shipment.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="relative flex justify-between px-4">
                <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 -translate-y-1/2 z-0"></div>
                <div 
                  className="absolute top-1/2 left-0 h-px bg-accent -translate-y-1/2 z-0 transition-all duration-1000"
                  style={{ width: `${(getStatusIndex(shipment.status) / (steps.length - 1)) * 100}%` }}
                ></div>
                
                {steps.map((step, idx) => {
                  const isActive = idx <= getStatusIndex(shipment.status);
                  return (
                    <div key={idx} className="relative z-10 flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700 border ${isActive ? 'bg-accent text-primary border-accent shadow-2xl shadow-accent/20' : 'bg-primary text-white/20 border-white/5'}`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-widest mt-4 transition-colors duration-500 ${isActive ? 'text-white' : 'text-white/20'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="h-[500px] rounded-3xl relative overflow-hidden flex items-center justify-center group border border-white/5">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-30 grayscale group-hover:grayscale-0 transition-all duration-1000"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/40"></div>
              <div className="relative z-10 glass-card p-10 rounded-3xl text-center max-w-sm border-white/10">
                <div className="w-20 h-20 border border-accent/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <MapPin className="w-10 h-10 text-accent" />
                </div>
                <h4 className="font-serif font-bold text-2xl mb-3 text-white">Intelligence Active</h4>
                <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">Asset is currently in secure transit to destination point.</p>
              </div>
            </div>

            {/* History / Audit Log */}
            <div className="glass-card p-12 rounded-3xl border-white/5">
              <h3 className="font-serif font-bold text-2xl mb-10 text-white">Manifest History</h3>
              <div className="space-y-10">
                {shipment.legalModule?.chainOfCustody.map((log, idx) => (
                  <div key={idx} className="flex gap-8 group">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-accent rounded-full group-hover:scale-150 transition-all duration-500"></div>
                      {idx !== shipment.legalModule!.chainOfCustody.length - 1 && (
                        <div className="w-px h-full bg-white/5 mt-2"></div>
                      )}
                    </div>
                    <div className="pb-4">
                      <div className="micro-label mb-2">{format(new Date(log.timestamp), 'MMM dd, yyyy — HH:mm')}</div>
                      <div className="font-serif font-bold text-lg text-white capitalize tracking-wide">{log.status.replace('_', ' ')}</div>
                      {log.note && <div className="text-sm text-white/40 mt-2 font-light leading-relaxed">{log.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <div className="glass-card p-10 rounded-3xl border-white/5">
              <h4 className="micro-label mb-8 text-white border-b border-white/5 pb-4">Asset Intelligence</h4>
              <div className="space-y-8">
                <div>
                  <span className="micro-label mb-2 block">Service Tier</span>
                  <span className="font-serif font-bold text-sm capitalize text-white flex items-center gap-3">
                    {shipment.type === 'legal' ? <Shield className="w-4 h-4 text-accent" /> : <Package className="w-4 h-4 text-accent" />}
                    {shipment.type} Shipment
                    {shipment.type === 'commodity' && shipment.commodityType && ` (${shipment.commodityType.replace('_', ' ')})`}
                  </span>
                </div>
                <div>
                  <span className="micro-label mb-2 block">Origin Point</span>
                  <span className="font-serif font-bold text-sm text-white leading-relaxed">{shipment.pickup.address}</span>
                </div>
                <div>
                  <span className="micro-label mb-2 block">Destination Point</span>
                  <span className="font-serif font-bold text-sm text-white leading-relaxed">{shipment.delivery.address}</span>
                </div>
                <div>
                  <span className="micro-label mb-2 block">Route Distance</span>
                  <span className="font-serif font-bold text-sm text-white">{shipment.distance} km</span>
                </div>
                <div>
                  <span className="micro-label mb-2 block">Asset Specifications</span>
                  <span className="font-serif font-bold text-sm text-white leading-relaxed">{shipment.packageDetails.description} ({shipment.packageDetails.weight}kg)</span>
                </div>
              </div>
            </div>

            {shipment.type === 'legal' && (
              <div className="bg-accent/5 border border-accent/20 p-10 rounded-3xl text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="flex items-center justify-center gap-3 mb-8 text-accent">
                  <Shield className="w-5 h-5" />
                  <h4 className="micro-label text-accent">Secure Verification</h4>
                </div>
                <div className="bg-white p-6 rounded-3xl mb-8 inline-block shadow-2xl shadow-accent/10">
                  <QRCodeSVG value={shipment.id} size={180} />
                </div>
                <p className="text-[10px] text-white/40 mb-8 uppercase tracking-widest leading-relaxed">
                  Present this unique identifier to the prestige operative upon delivery for secure asset transfer.
                </p>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <span className="micro-label block mb-3">Secure Protocol OTP</span>
                  <span className="text-3xl font-serif font-bold tracking-[0.5em] text-accent">{shipment.legalModule?.otp}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tracking;
