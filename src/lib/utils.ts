import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(amount);
}

export const RATE_PER_KM = 20;

export function calculateShipmentPrice(distanceKm: number, weightKg: number, type: 'legal' | 'commodity', urgency: 'standard' | 'priority' | 'express') {
  const basePrice = type === 'legal' ? 150 : 100; // Base handling fee
  const distancePrice = distanceKm * RATE_PER_KM;
  const weightPrice = weightKg * 5; // R5 per kg
  
  let urgencyMultiplier = 1;
  if (urgency === 'priority') urgencyMultiplier = 1.5;
  if (urgency === 'express') urgencyMultiplier = 2.5;

  return (basePrice + distancePrice + weightPrice) * urgencyMultiplier;
}

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
