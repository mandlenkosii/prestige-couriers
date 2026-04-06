import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Shipment, ShipmentStatus } from '../types';
import { Truck, MapPin, Package, Shield, CheckCircle, AlertCircle, Camera, Signature, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

const DriverApp: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeJobs, setActiveJobs] = useState<Shipment[]>([]);
  const [availableJobs, setAvailableJobs] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingOTP, setVerifyingOTP] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');

  useEffect(() => {
    if (!user) return;

    // Active jobs (assigned to this driver)
    const qActive = query(
      collection(db, 'shipments'),
      where('driverId', '==', user.uid),
      where('status', 'in', ['assigned', 'picked_up', 'in_transit'])
    );

    // Available jobs (pending assignment)
    const qAvailable = query(
      collection(db, 'shipments'),
      where('status', '==', 'pending')
    );

    const unsubActive = onSnapshot(qActive, (snapshot) => {
      setActiveJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shipment)));
      setLoading(false);
    });

    const unsubAvailable = onSnapshot(qAvailable, (snapshot) => {
      setAvailableJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shipment)));
    });

    return () => {
      unsubActive();
      unsubAvailable();
    };
  }, [user]);

  const updateStatus = async (shipmentId: string, newStatus: ShipmentStatus, note?: string) => {
    const shipmentRef = doc(db, 'shipments', shipmentId);
    const timestamp = new Date().toISOString();
    
    await updateDoc(shipmentRef, {
      status: newStatus,
      updatedAt: timestamp,
      'legalModule.chainOfCustody': arrayUnion({
        status: newStatus,
        timestamp,
        note: note || `Status updated to ${newStatus}`
      })
    });

    // Add audit log
    await addDoc(collection(db, `shipments/${shipmentId}/auditLogs`), {
      shipmentId,
      action: newStatus.toUpperCase(),
      timestamp,
      userId: user?.uid,
      details: note || `Driver updated status to ${newStatus}`
    });
  };

  const acceptJob = async (shipmentId: string) => {
    const shipmentRef = doc(db, 'shipments', shipmentId);
    await updateDoc(shipmentRef, {
      driverId: user?.uid,
      status: 'assigned',
      updatedAt: new Date().toISOString()
    });
    updateStatus(shipmentId, 'assigned', 'Driver accepted the job');
  };

  const verifyOTP = async (shipment: Shipment) => {
    if (otpInput === shipment.legalModule?.otp) {
      await updateDoc(doc(db, 'shipments', shipment.id), {
        'legalModule.idVerified': true
      });
      updateStatus(shipment.id, 'delivered', 'OTP verified and delivered successfully');
      setVerifyingOTP(null);
      setOtpInput('');
    } else {
      alert('Invalid OTP. Please try again.');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Driver Console...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Driver Console</h1>
        <p className="text-gray-500">Manage your active deliveries and find new jobs.</p>
      </div>

      {/* Active Jobs */}
      <section className="mb-12">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Truck className="text-accent" /> Active Deliveries ({activeJobs.length})
        </h2>
        <div className="space-y-4">
          {activeJobs.map(job => (
            <div key={job.id} className="glass-card p-6 rounded-2xl border-l-4 border-accent">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xs font-bold text-accent uppercase tracking-widest mb-1">ID: {job.id.slice(0, 8)}</div>
                  <h3 className="font-bold text-lg">{job.packageDetails.description}</h3>
                </div>
                <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase">
                  {job.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                  <div>
                    <span className="text-xs text-gray-400 block">Pickup</span>
                    <span className="text-sm font-medium">{job.pickup.address}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-accent shrink-0" />
                  <div>
                    <span className="text-xs text-gray-400 block">Delivery</span>
                    <span className="text-sm font-medium">{job.delivery.address}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Truck className="w-5 h-5 text-accent shrink-0" />
                  <div>
                    <span className="text-xs text-gray-400 block">Distance</span>
                    <span className="text-sm font-medium">{job.distance} km</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {job.status === 'assigned' && (
                  <button onClick={() => updateStatus(job.id, 'picked_up')} className="btn-primary py-2 px-4 text-sm">Mark Picked Up</button>
                )}
                {job.status === 'picked_up' && (
                  <button onClick={() => updateStatus(job.id, 'in_transit')} className="btn-primary py-2 px-4 text-sm">Start Transit</button>
                )}
                {job.status === 'in_transit' && (
                  <>
                    {job.type === 'legal' ? (
                      <button onClick={() => setVerifyingOTP(job.id)} className="btn-accent py-2 px-4 text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Verify OTP & Deliver
                      </button>
                    ) : (
                      <button onClick={() => updateStatus(job.id, 'delivered')} className="btn-accent py-2 px-4 text-sm">Mark Delivered</button>
                    )}
                  </>
                )}
              </div>

              <AnimatePresence>
                {verifyingOTP === job.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 p-6 bg-neutral-light rounded-xl border border-accent/20"
                  >
                    <h4 className="font-bold mb-4 flex items-center gap-2 text-primary">
                      <QrCode className="w-5 h-5 text-accent" /> Secure OTP Verification
                    </h4>
                    <p className="text-xs text-gray-500 mb-4">Ask the customer for the 6-digit secure OTP to complete the delivery.</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        maxLength={6}
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        className="flex-grow px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none text-center tracking-[0.5em] font-bold text-xl"
                        placeholder="000000"
                      />
                      <button onClick={() => verifyOTP(job)} className="btn-accent px-6">Verify</button>
                      <button onClick={() => setVerifyingOTP(null)} className="text-gray-400 px-4">Cancel</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          {activeJobs.length === 0 && <div className="text-center py-8 text-gray-400">No active deliveries.</div>}
        </div>
      </section>

      {/* Available Jobs */}
      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Package className="text-primary" /> Available Jobs ({availableJobs.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableJobs.map(job => (
            <div key={job.id} className="glass-card p-6 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${job.type === 'legal' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
                  {job.type}
                </span>
                <span className="font-bold text-accent">Price: ${job.price.toFixed(2)}</span>
              </div>
              <h3 className="font-bold mb-2 truncate">{job.packageDetails.description}</h3>
              <div className="text-xs text-gray-500 mb-4 space-y-1">
                <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> From: {job.pickup.address}</div>
                <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> To: {job.delivery.address}</div>
                <div className="flex items-center gap-1 font-bold text-primary"><Truck className="w-3 h-3" /> Distance: {job.distance} km</div>
              </div>
              <button onClick={() => acceptJob(job.id)} className="w-full btn-primary py-2 text-sm">Accept Job</button>
            </div>
          ))}
          {availableJobs.length === 0 && <div className="col-span-full text-center py-8 text-gray-400">No new jobs available at the moment.</div>}
        </div>
      </section>
    </div>
  );
};

export default DriverApp;
