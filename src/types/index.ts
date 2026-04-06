export type UserRole = 'customer' | 'driver' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phoneNumber?: string;
  photoURL?: string;
  createdAt: string;
  isVerified?: boolean;
}

export type ShipmentType = 'legal' | 'commodity';
export type ShipmentStatus = 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
export type UrgencyLevel = 'standard' | 'priority' | 'express';

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Shipment {
  id: string;
  customerId: string;
  driverId?: string;
  type: ShipmentType;
  status: ShipmentStatus;
  pickup: Location;
  delivery: Location;
  distance: number;
  packageDetails: {
    weight: number;
    dimensions: string;
    description: string;
  };
  urgency: UrgencyLevel;
  price: number;
  createdAt: string;
  updatedAt: string;
  legalModule?: {
    otp: string;
    idVerified: boolean;
    signatureURL?: string;
    photoProofURL?: string;
    chainOfCustody: Array<{
      status: ShipmentStatus;
      timestamp: string;
      location?: Location;
      note?: string;
    }>;
  };
}

export interface AuditLog {
  id: string;
  shipmentId: string;
  action: string;
  timestamp: string;
  userId: string;
  details: string;
}
