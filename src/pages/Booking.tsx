import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Package, FileText, Scale, Ruler, Zap, Shield, AlertCircle, CheckCircle, Globe, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ShipmentType, UrgencyLevel, ShipmentStatus } from '../types';
import { formatCurrency, generateOTP, calculateShipmentPrice, RATE_PER_KM, MINERAL_RATES } from '../lib/utils';

const bookingSchema = z.object({
  type: z.enum(['legal', 'commodity']),
  commodityType: z.string().optional(),
  pickupAddress: z.string().min(5, 'Pickup address is required'),
  deliveryAddress: z.string().min(5, 'Delivery address is required'),
  distance: z.number().min(1, 'Distance must be at least 1km'),
  weight: z.number().min(0.1, 'Weight must be at least 0.1kg'),
  dimensions: z.string().min(3, 'Dimensions are required (e.g., 10x10x10)'),
  description: z.string().min(5, 'Description is required'),
  urgency: z.enum(['standard', 'priority', 'express']),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const Booking: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(0);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      type: (searchParams.get('type') as ShipmentType) || 'commodity',
      urgency: 'standard',
      distance: 5,
      commodityType: 'other'
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    const calculatedPrice = calculateShipmentPrice(
      watchedValues.distance || 0,
      watchedValues.weight || 0,
      watchedValues.type || 'commodity',
      watchedValues.urgency || 'standard',
      watchedValues.commodityType
    );
    setPrice(calculatedPrice);
  }, [watchedValues.type, watchedValues.weight, watchedValues.urgency, watchedValues.distance, watchedValues.commodityType]);

  const onSubmit = async (data: BookingFormValues) => {
    setLoading(true);
    try {
      const shipmentData = {
        customerId: user?.uid || 'guest',
        type: data.type,
        commodityType: data.type === 'commodity' ? data.commodityType : undefined,
        status: 'pending' as ShipmentStatus,
        pickup: { address: data.pickupAddress, lat: 0, lng: 0 },
        delivery: { address: data.deliveryAddress, lat: 0, lng: 0 },
        distance: data.distance,
        packageDetails: {
          weight: data.weight,
          dimensions: data.dimensions,
          description: data.description,
        },
        urgency: data.urgency,
        price: price,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(data.type === 'legal' && {
          legalModule: {
            otp: generateOTP(),
            idVerified: false,
            chainOfCustody: [{
              status: 'pending',
              timestamp: new Date().toISOString(),
              note: 'Shipment booked'
            }]
          }
        })
      };

      const docRef = await addDoc(collection(db, 'shipments'), shipmentData);
      
      // Create initial audit log for legal shipments
      if (data.type === 'legal') {
        await addDoc(collection(db, `shipments/${docRef.id}/auditLogs`), {
          shipmentId: docRef.id,
          action: 'BOOKED',
          timestamp: new Date().toISOString(),
          userId: user?.uid || 'guest',
          details: 'Legal shipment created with secure tracking enabled.'
        });
      }

      navigate(`/track/${docRef.id}`);
    } catch (err) {
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <span className="micro-label mb-4 block text-accent">Logistics Request</span>
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6 tracking-tighter">Book a Courier</h1>
        <p className="text-white/40 font-light tracking-widest uppercase text-[10px]">Bespoke transportation solutions for elite assets.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
            {/* Step 1: Shipment Type */}
            <div className="glass-card p-10 rounded-3xl border-white/5">
              <h3 className="micro-label mb-8 flex items-center gap-3 text-white">
                <Package className="text-accent w-4 h-4" /> 01. Service Selection
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <label className={`flex flex-col items-center p-8 border rounded-2xl cursor-pointer transition-all duration-500 group ${watchedValues.type === 'legal' ? 'border-accent bg-accent/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                  <input {...register('type')} type="radio" value="legal" className="hidden" />
                  <FileText className={`w-10 h-10 mb-4 transition-colors duration-500 ${watchedValues.type === 'legal' ? 'text-accent' : 'text-white/20 group-hover:text-white/40'}`} />
                  <span className="font-serif font-bold tracking-widest text-sm mb-2">LEGAL</span>
                  <span className="text-[10px] text-white/30 text-center uppercase tracking-wider leading-relaxed">Secure, OTP verified, chain-of-custody</span>
                </label>
                <label className={`flex flex-col items-center p-8 border rounded-2xl cursor-pointer transition-all duration-500 group ${watchedValues.type === 'commodity' ? 'border-accent bg-accent/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                  <input {...register('type')} type="radio" value="commodity" className="hidden" />
                  <Globe className={`w-10 h-10 mb-4 transition-colors duration-500 ${watchedValues.type === 'commodity' ? 'text-accent' : 'text-white/20 group-hover:text-white/40'}`} />
                  <span className="font-serif font-bold tracking-widest text-sm mb-2">COMMODITY</span>
                  <span className="text-[10px] text-white/30 text-center uppercase tracking-wider leading-relaxed">Bulk goods, minerals, business logistics</span>
                </label>
              </div>

              <AnimatePresence>
                {watchedValues.type === 'commodity' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-10 pt-10 border-t border-white/5"
                  >
                    <label className="micro-label mb-3 block">Mineral / Asset Type</label>
                    <select
                      {...register('commodityType')}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-accent outline-none text-white font-light transition-all appearance-none"
                    >
                      {Object.keys(MINERAL_RATES).map((key) => (
                        <option key={key} value={key} className="bg-secondary">
                          {key.replace('_', ' ')} (Base: {formatCurrency(MINERAL_RATES[key])})
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Step 2: Route */}
            <div className="glass-card p-10 rounded-3xl border-white/5">
              <h3 className="micro-label mb-8 flex items-center gap-3 text-white">
                <MapPin className="text-accent w-4 h-4" /> 02. Route Logistics
              </h3>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="micro-label mb-3 block">Pickup Address</label>
                    <input
                      {...register('pickupAddress')}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-accent outline-none text-white font-light transition-all"
                      placeholder="Origin Point"
                    />
                    {errors.pickupAddress && <p className="text-red-400 text-[10px] mt-2 uppercase tracking-widest">{errors.pickupAddress.message}</p>}
                  </div>
                  <div>
                    <label className="micro-label mb-3 block">Delivery Address</label>
                    <input
                      {...register('deliveryAddress')}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-accent outline-none text-white font-light transition-all"
                      placeholder="Destination Point"
                    />
                    {errors.deliveryAddress && <p className="text-red-400 text-[10px] mt-2 uppercase tracking-widest">{errors.deliveryAddress.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="micro-label mb-3 block">Distance (km) — <span className="text-accent">R{RATE_PER_KM}/km</span></label>
                  <div className="relative">
                    <input
                      {...register('distance', { valueAsNumber: true })}
                      type="number"
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-accent outline-none text-white font-light transition-all"
                      placeholder="5"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 font-serif italic">km</span>
                  </div>
                  {errors.distance && <p className="text-red-400 text-[10px] mt-2 uppercase tracking-widest">{errors.distance.message}</p>}
                </div>
              </div>
            </div>

            {/* Step 3: Package */}
            <div className="glass-card p-10 rounded-3xl border-white/5">
              <h3 className="micro-label mb-8 flex items-center gap-3 text-white">
                <Scale className="text-accent w-4 h-4" /> 03. Asset Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="micro-label mb-3 block">Weight (kg)</label>
                  <input
                    {...register('weight', { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-accent outline-none text-white font-light transition-all"
                    placeholder="0.5"
                  />
                  {errors.weight && <p className="text-red-400 text-[10px] mt-2 uppercase tracking-widest">{errors.weight.message}</p>}
                </div>
                <div>
                  <label className="micro-label mb-3 block">Dimensions (LxWxH cm)</label>
                  <input
                    {...register('dimensions')}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-accent outline-none text-white font-light transition-all"
                    placeholder="20x20x10"
                  />
                  {errors.dimensions && <p className="text-red-400 text-[10px] mt-2 uppercase tracking-widest">{errors.dimensions.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="micro-label mb-3 block">Description</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-accent outline-none text-white font-light transition-all resize-none"
                    placeholder="Provide a brief overview of the assets..."
                  />
                  {errors.description && <p className="text-red-400 text-[10px] mt-2 uppercase tracking-widest">{errors.description.message}</p>}
                </div>
              </div>
            </div>

            {/* Step 4: Urgency */}
            <div className="glass-card p-10 rounded-3xl border-white/5">
              <h3 className="micro-label mb-8 flex items-center gap-3 text-white">
                <Zap className="text-accent w-4 h-4" /> 04. Priority Level
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'standard', label: 'Standard', sub: '2-3 Business Days' },
                  { id: 'priority', label: 'Priority', sub: 'Next Day Delivery' },
                  { id: 'express', label: 'Express', sub: 'Same Day Delivery' }
                ].map((level) => (
                  <label key={level.id} className={`flex flex-col p-6 border rounded-2xl cursor-pointer transition-all duration-500 ${watchedValues.urgency === level.id ? 'border-accent bg-accent/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                    <input {...register('urgency')} type="radio" value={level.id} className="hidden" />
                    <span className="font-serif font-bold text-sm mb-1">{level.label}</span>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest">{level.sub}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-accent py-6 text-sm flex items-center justify-center gap-4 shadow-2xl hover:shadow-accent/20 transition-all duration-500 disabled:opacity-50"
            >
              {loading ? 'Processing Transaction...' : (
                <>Confirm & Authorize {formatCurrency(price)} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 space-y-8">
            <div className="glass-card p-10 rounded-3xl border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <h4 className="micro-label mb-8 text-white border-b border-white/5 pb-4">Order Manifest</h4>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">Service</span>
                  <span className="font-serif font-bold text-sm capitalize text-white">
                    {watchedValues.type} 
                    {watchedValues.type === 'commodity' && watchedValues.commodityType && ` (${watchedValues.commodityType.replace('_', ' ')})`}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">Urgency</span>
                  <span className="font-serif font-bold text-sm capitalize text-white">{watchedValues.urgency}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">Distance</span>
                  <span className="font-serif font-bold text-sm text-white">{watchedValues.distance || 0} km</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">Weight</span>
                  <span className="font-serif font-bold text-sm text-white">{watchedValues.weight || 0} kg</span>
                </div>
                <div className="pt-8 border-t border-white/5">
                  <span className="micro-label block mb-2 text-accent">Total Investment</span>
                  <span className="text-4xl font-serif font-bold text-white">{formatCurrency(price)}</span>
                </div>
              </div>
            </div>

            {watchedValues.type === 'legal' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-accent/5 border border-accent/20 p-10 rounded-3xl"
              >
                <div className="flex items-center gap-3 mb-6 text-accent">
                  <Shield className="w-5 h-5" />
                  <h4 className="micro-label text-accent">Secure Protocol</h4>
                </div>
                <ul className="space-y-4">
                  {[
                    'Chain-of-custody tracking',
                    'OTP verification on delivery',
                    'Tamper-proof audit logs'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-[11px] text-white/50 uppercase tracking-widest leading-relaxed">
                      <div className="w-1 h-1 bg-accent rounded-full mt-1.5 flex-shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            <div className="p-8 rounded-3xl border border-white/5 bg-white/2">
              <div className="flex items-center gap-3 mb-4 text-white/40">
                <AlertCircle className="w-4 h-4" />
                <h4 className="micro-label">Notice</h4>
              </div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest leading-relaxed">
                Verification of origin and destination points is mandatory for all prestige shipments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
