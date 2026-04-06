import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Package, FileText, Scale, Ruler, Zap, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ShipmentType, UrgencyLevel, ShipmentStatus } from '../types';
import { formatCurrency, generateOTP, calculateShipmentPrice, RATE_PER_KM } from '../lib/utils';

const bookingSchema = z.object({
  type: z.enum(['legal', 'commodity']),
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
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    const calculatedPrice = calculateShipmentPrice(
      watchedValues.distance || 0,
      watchedValues.weight || 0,
      watchedValues.type || 'commodity',
      watchedValues.urgency || 'standard'
    );
    setPrice(calculatedPrice);
  }, [watchedValues.type, watchedValues.weight, watchedValues.urgency, watchedValues.distance]);

  const onSubmit = async (data: BookingFormValues) => {
    setLoading(true);
    try {
      const shipmentData = {
        customerId: user?.uid || 'guest',
        type: data.type,
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
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">Book a Courier</h1>
        <p className="text-gray-500">Fast, secure, and reliable logistics at your fingertips.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Shipment Type */}
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Package className="text-accent" /> 1. Shipment Type
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex flex-col items-center p-6 border-2 rounded-xl cursor-pointer transition-all ${watchedValues.type === 'legal' ? 'border-accent bg-accent/5' : 'border-gray-100'}`}>
                  <input {...register('type')} type="radio" value="legal" className="hidden" />
                  <FileText className={`w-8 h-8 mb-3 ${watchedValues.type === 'legal' ? 'text-accent' : 'text-gray-400'}`} />
                  <span className="font-bold">Legal Document</span>
                  <span className="text-xs text-gray-500 text-center mt-1">Secure, OTP verified, chain-of-custody</span>
                </label>
                <label className={`flex flex-col items-center p-6 border-2 rounded-xl cursor-pointer transition-all ${watchedValues.type === 'commodity' ? 'border-accent bg-accent/5' : 'border-gray-100'}`}>
                  <input {...register('type')} type="radio" value="commodity" className="hidden" />
                  <Package className={`w-8 h-8 mb-3 ${watchedValues.type === 'commodity' ? 'text-accent' : 'text-gray-400'}`} />
                  <span className="font-bold">Commodity</span>
                  <span className="text-xs text-gray-500 text-center mt-1">Bulk goods, parcels, business logistics</span>
                </label>
              </div>
            </div>

            {/* Step 2: Addresses */}
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="text-accent" /> 2. Route Details
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address</label>
                  <input
                    {...register('pickupAddress')}
                    className="w-full px-4 py-3 bg-neutral-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                    placeholder="Enter pickup location"
                  />
                  {errors.pickupAddress && <p className="text-red-500 text-xs mt-1">{errors.pickupAddress.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                  <input
                    {...register('deliveryAddress')}
                    className="w-full px-4 py-3 bg-neutral-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                    placeholder="Enter delivery destination"
                  />
                  {errors.deliveryAddress && <p className="text-red-500 text-xs mt-1">{errors.deliveryAddress.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Distance (km) - <span className="text-accent font-bold">R{RATE_PER_KM}/km</span></label>
                  <div className="relative">
                    <input
                      {...register('distance', { valueAsNumber: true })}
                      type="number"
                      className="w-full px-4 py-3 bg-neutral-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                      placeholder="5"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">km</span>
                  </div>
                  {errors.distance && <p className="text-red-500 text-xs mt-1">{errors.distance.message}</p>}
                </div>
              </div>
            </div>

            {/* Step 3: Package Details */}
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Scale className="text-accent" /> 3. Package Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                  <input
                    {...register('weight', { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-3 bg-neutral-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                    placeholder="0.5"
                  />
                  {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions (LxWxH cm)</label>
                  <input
                    {...register('dimensions')}
                    className="w-full px-4 py-3 bg-neutral-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                    placeholder="20x20x10"
                  />
                  {errors.dimensions && <p className="text-red-500 text-xs mt-1">{errors.dimensions.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-4 py-3 bg-neutral-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                    placeholder="What are we delivering?"
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>
              </div>
            </div>

            {/* Step 4: Urgency */}
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Zap className="text-accent" /> 4. Urgency Level
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className={`flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${watchedValues.urgency === 'standard' ? 'border-accent bg-accent/5' : 'border-gray-100'}`}>
                  <input {...register('urgency')} type="radio" value="standard" className="hidden" />
                  <span className="font-bold">Standard</span>
                  <span className="text-xs text-gray-500">2-3 Business Days</span>
                </label>
                <label className={`flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${watchedValues.urgency === 'priority' ? 'border-accent bg-accent/5' : 'border-gray-100'}`}>
                  <input {...register('urgency')} type="radio" value="priority" className="hidden" />
                  <span className="font-bold">Priority</span>
                  <span className="text-xs text-gray-500">Next Day Delivery</span>
                </label>
                <label className={`flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${watchedValues.urgency === 'express' ? 'border-accent bg-accent/5' : 'border-gray-100'}`}>
                  <input {...register('urgency')} type="radio" value="express" className="hidden" />
                  <span className="font-bold">Express</span>
                  <span className="text-xs text-gray-500">Same Day Delivery</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-5 text-xl flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all"
            >
              {loading ? 'Processing...' : `Confirm & Pay ${formatCurrency(price)}`}
            </button>
          </form>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="glass-card p-6 rounded-2xl">
              <h4 className="font-bold text-lg mb-4 border-b pb-2">Order Summary</h4>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Service Type</span>
                  <span className="font-bold capitalize">{watchedValues.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Urgency</span>
                  <span className="font-bold capitalize">{watchedValues.urgency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Distance</span>
                  <span className="font-bold">{watchedValues.distance || 0} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Weight</span>
                  <span className="font-bold">{watchedValues.weight || 0} kg</span>
                </div>
                <div className="pt-4 border-t flex justify-between items-center">
                  <span className="text-lg font-bold">Total Price</span>
                  <span className="text-2xl font-bold text-accent">{formatCurrency(price)}</span>
                </div>
              </div>
            </div>

            {watchedValues.type === 'legal' && (
              <div className="bg-primary text-white p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-4 text-accent">
                  <Shield className="w-6 h-6" />
                  <h4 className="font-bold">Secure Delivery Enabled</h4>
                </div>
                <ul className="space-y-3 text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-accent mt-0.5" />
                    Chain-of-custody tracking
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-accent mt-0.5" />
                    OTP verification on delivery
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-accent mt-0.5" />
                    Tamper-proof audit logs
                  </li>
                </ul>
              </div>
            )}

            <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
              <div className="flex items-center gap-2 mb-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <h4 className="font-bold">Important</h4>
              </div>
              <p className="text-xs text-red-800 leading-relaxed">
                Please ensure all addresses are accurate. Incorrect addresses may lead to delays or additional charges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
