import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Shipment, UserProfile } from '../types';
import { Shield, Users, Truck, Package, Search, Filter, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '../lib/utils';

const AdminDashboard: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [drivers, setDrivers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningTo, setAssigningTo] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all shipments
    const unsubShipments = onSnapshot(collection(db, 'shipments'), (snapshot) => {
      setShipments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shipment)));
      setLoading(false);
    });

    // Fetch all drivers
    const qDrivers = query(collection(db, 'users'), where('role', '==', 'driver'));
    const unsubDrivers = onSnapshot(qDrivers, (snapshot) => {
      setDrivers(snapshot.docs.map(doc => doc.data() as UserProfile));
    });

    return () => {
      unsubShipments();
      unsubDrivers();
    };
  }, []);

  const assignDriver = async (shipmentId: string, driverId: string) => {
    await updateDoc(doc(db, 'shipments', shipmentId), {
      driverId,
      status: 'assigned',
      updatedAt: new Date().toISOString()
    });
    setAssigningTo(null);
  };

  if (loading) return <div className="p-8 text-center">Loading Admin Panel...</div>;

  const totalRevenue = shipments.reduce((acc, s) => acc + s.price, 0);
  const pendingShipments = shipments.filter(s => s.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-primary">Admin Control Center</h1>
        <p className="text-gray-500">Global overview of Prestige Couriers operations.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="glass-card p-6 rounded-2xl">
          <div className="text-xs text-gray-400 font-bold uppercase mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-accent">{formatCurrency(totalRevenue)}</div>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <div className="text-xs text-gray-400 font-bold uppercase mb-1">Active Shipments</div>
          <div className="text-2xl font-bold text-primary">{shipments.filter(s => s.status !== 'delivered').length}</div>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <div className="text-xs text-gray-400 font-bold uppercase mb-1">Total Drivers</div>
          <div className="text-2xl font-bold text-primary">{drivers.length}</div>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <div className="text-xs text-gray-400 font-bold uppercase mb-1">Pending Assignment</div>
          <div className="text-2xl font-bold text-red-500">{pendingShipments.length}</div>
        </div>
      </div>

      {/* Management Table */}
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold">Manage Shipments</h3>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search ID..." className="pl-10 pr-4 py-2 bg-neutral-light border border-gray-100 rounded-lg text-sm outline-none" />
            </div>
            <button className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-light text-gray-400 text-xs uppercase tracking-widest font-bold">
                <th className="px-8 py-4">ID</th>
                <th className="px-8 py-4">Type</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Distance</th>
                <th className="px-8 py-4">Driver</th>
                <th className="px-8 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-neutral-light/50 transition-colors">
                  <td className="px-8 py-6 font-mono text-sm">{shipment.id.slice(0, 8)}</td>
                  <td className="px-8 py-6">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${shipment.type === 'legal' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
                      {shipment.type}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                      shipment.status === 'delivered' ? 'bg-green-100 text-green-600' :
                      shipment.status === 'pending' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {shipment.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold">
                    {shipment.distance} km
                  </td>
                  <td className="px-8 py-6 text-sm">
                    {shipment.driverId ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-3 h-3 text-primary" />
                        </div>
                        <span className="font-medium">Assigned</span>
                      </div>
                    ) : (
                      <span className="text-red-400 font-bold">Unassigned</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    {shipment.status === 'pending' ? (
                      <div className="relative">
                        <button 
                          onClick={() => setAssigningTo(assigningTo === shipment.id ? null : shipment.id)}
                          className="text-accent font-bold text-sm hover:underline"
                        >
                          Assign Driver
                        </button>
                        {assigningTo === shipment.id && (
                          <div className="absolute right-0 mt-2 w-64 bg-white shadow-2xl rounded-xl border border-gray-100 z-50 p-2">
                            <div className="text-xs font-bold text-gray-400 p-2 uppercase">Select Driver</div>
                            {drivers.map(driver => (
                              <button 
                                key={driver.uid}
                                onClick={() => assignDriver(shipment.id, driver.uid)}
                                className="w-full text-left p-2 hover:bg-neutral-light rounded-lg text-sm flex items-center justify-between"
                              >
                                <span>{driver.displayName}</span>
                                {driver.isVerified && <Shield className="w-3 h-3 text-accent" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button className="text-gray-400 text-sm hover:text-primary">View Details</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
