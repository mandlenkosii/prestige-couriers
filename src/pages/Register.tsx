import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Package, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole } from '../types';

const registerSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'driver']),
  phoneNumber: z.string().min(10, 'Invalid phone number'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'customer',
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: data.displayName });

      const userProfile = {
        uid: user.uid,
        email: data.email,
        displayName: data.displayName,
        role: data.role as UserRole,
        phoneNumber: data.phoneNumber,
        createdAt: new Date().toISOString(),
        isVerified: data.role === 'driver' ? false : true,
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-card p-8 rounded-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="text-accent w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-primary">Create Account</h2>
          <p className="text-gray-500">Join Prestige Couriers today</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <label className={`flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${register('role').name === 'role' ? 'border-accent bg-accent/5' : 'border-gray-100'}`}>
              <input {...register('role')} type="radio" value="customer" className="hidden" />
              <User className="w-6 h-6 mb-2" />
              <span className="text-sm font-bold">Customer</span>
            </label>
            <label className={`flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${register('role').name === 'role' ? 'border-accent bg-accent/5' : 'border-gray-100'}`}>
              <input {...register('role')} type="radio" value="driver" className="hidden" />
              <Package className="w-6 h-6 mb-2" />
              <span className="text-sm font-bold">Driver</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('displayName')}
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-neutral-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
            {errors.displayName && <p className="text-red-500 text-xs mt-1">{errors.displayName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('email')}
                type="email"
                className="w-full pl-10 pr-4 py-3 bg-neutral-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                placeholder="name@company.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('phoneNumber')}
                type="tel"
                className="w-full pl-10 pr-4 py-3 bg-neutral-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('password')}
                type="password"
                className="w-full pl-10 pr-4 py-3 bg-neutral-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-bold hover:underline">Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
