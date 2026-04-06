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
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">Track Your Shipment</h1>
        <div className="max-w-md mx-auto flex gap-2">
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Enter Tracking ID"
            className="flex-grow px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none"
          />
          <Link 
            to={`/track/${trackingId}`}
            className="btn-primary px-6 py-3"
          >
            Track
          </Link>
        </div>
      </div>

      {!id && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Enter a tracking ID above to see the status of your delivery.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center gap-4 mb-8">
          <AlertCircle className="w-8 h-8" />
          <div>
            <h4 className="font-bold">Error</h4>
            <p>{error}</p>
          </div>
        </div>
      )}

      {shipment && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Status Progress */}
            <div className="glass-card p-8 rounded-3xl">
              <div className="flex justify-between items-center mb-12">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-accent mb-1 block">Tracking ID</span>
                  <h2 className="text-2xl font-bold font-mono">{shipment.id}</h2>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 block">Status</span>
                  <span className="px-4 py-1 bg-accent/10 text-accent rounded-full font-bold capitalize">
                    {shipment.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="relative flex justify-between">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-accent -translate-y-1/2 z-0 transition-all duration-1000"
                  style={{ width: `${(getStatusIndex(shipment.status) / (steps.length - 1)) * 100}%` }}
                ></div>
                
                {steps.map((step, idx) => {
                  const isActive = idx <= getStatusIndex(shipment.status);
                  return (
                    <div key={idx} className="relative z-10 flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-accent text-primary shadow-lg shadow-accent/20' : 'bg-white text-gray-300 border-2 border-gray-100'}`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase mt-2 ${isActive ? 'text-primary' : 'text-gray-300'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-gray-200 h-[400px] rounded-3xl relative overflow-hidden flex items-center justify-center group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700"></div>
              <div className="relative z-10 glass-card p-6 rounded-2xl text-center max-w-xs">
                <MapPin className="w-12 h-12 text-accent mx-auto mb-4 animate-bounce" />
                <h4 className="font-bold mb-2">Live Tracking Active</h4>
                <p className="text-xs text-gray-500">Our driver is currently in transit to the delivery destination.</p>
              </div>
            </div>

            {/* History / Audit Log */}
            <div className="glass-card p-8 rounded-3xl">
              <h3 className="text-xl font-bold mb-6">Shipment History</h3>
              <div className="space-y-6">
                {shipment.legalModule?.chainOfCustody.map((log, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-accent rounded-full"></div>
                      {idx !== shipment.legalModule!.chainOfCustody.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-100"></div>
                      )}
                    </div>
                    <div className="pb-6">
                      <div className="text-xs text-gray-400 mb-1">{format(new Date(log.timestamp), 'MMM dd, yyyy - HH:mm')}</div>
                      <div className="font-bold capitalize">{log.status.replace('_', ' ')}</div>
                      {log.note && <div className="text-sm text-gray-500 mt-1">{log.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6 rounded-3xl">
              <h4 className="font-bold mb-4 border-b pb-2">Shipment Details</h4>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-gray-400 block mb-1">Type</span>
                  <span className="font-bold capitalize flex items-center gap-2">
                    {shipment.type === 'legal' ? <Shield className="w-4 h-4 text-accent" /> : <Package className="w-4 h-4 text-accent" />}
                    {shipment.type} Shipment
                    {shipment.type === 'commodity' && shipment.commodityType && ` (${shipment.commodityType.replace('_', ' ')})`}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Pickup</span>
                  <span className="font-bold">{shipment.pickup.address}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Delivery</span>
                  <span className="font-bold">{shipment.delivery.address}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Distance</span>
                  <span className="font-bold">{shipment.distance} km</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Package</span>
                  <span className="font-bold">{shipment.packageDetails.description} ({shipment.packageDetails.weight}kg)</span>
                </div>
              </div>
            </div>

            {shipment.type === 'legal' && (
              <div className="bg-primary text-white p-6 rounded-3xl text-center">
                <div className="flex items-center justify-center gap-2 mb-4 text-accent">
                  <Shield className="w-6 h-6" />
                  <h4 className="font-bold uppercase tracking-widest text-sm">Secure Verification</h4>
                </div>
                <div className="bg-white p-4 rounded-2xl mb-4 inline-block">
                  <QRCodeSVG value={shipment.id} size={150} />
                </div>
                <p className="text-xs text-white/60 mb-4">
                  Present this QR code to the driver upon delivery for secure identity verification.
                </p>
                <div className="bg-white/10 p-3 rounded-xl">
                  <span className="text-xs text-white/40 block mb-1 uppercase">Secure OTP</span>
                  <span className="text-2xl font-bold tracking-[0.5em] text-accent">{shipment.legalModule?.otp}</span>
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
