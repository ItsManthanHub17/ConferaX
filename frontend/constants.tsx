
import { Room, Priority, BookingStatus } from './types';

export const COLORS = {
  NAVY: '#0f172a',
  AMBER: '#f59e0b',
  INDIGO: '#6366f1',
  SLATE_LIGHT: '#f8fafc',
};

export const MOCK_ROOMS: Room[] = [
  {
    id: 'room-1',
    name: 'Neural HUB',
    floor: 'Penthouse',
    roomNumber: 'PH-01',
    capacity: 24,
    imageUrl: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=1000',
    features: ['8K Logic Wall', 'Spatial Sound', 'Executive Bar']
  },
  {
    id: 'room-2',
    name: 'Algorithm Room',
    floor: 'Level 4',
    roomNumber: '402',
    capacity: 12,
    imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1000',
    features: ['Collaborative Glass', 'Smart Seating']
  },
  {
    id: 'room-3',
    name: 'Matrix',
    floor: 'Level 4',
    roomNumber: '405',
    capacity: 8,
    imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1000',
    features: ['Encrypted Link', 'Adaptive Lighting']
  },
  {
    id: 'room-4',
    name: 'Vertex',
    floor: 'Level 2',
    roomNumber: '201',
    capacity: 40,
    imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=1000',
    features: ['360 View', 'Full Tech Suite']
  }
];

export const PRIORITY_COLORS = {
  [Priority.HIGH]: 'bg-red-50 text-red-600 border-red-100',
  [Priority.MEDIUM]: 'bg-amber-50 text-amber-600 border-amber-100',
  [Priority.LOW]: 'bg-indigo-50 text-indigo-600 border-indigo-100',
};

export const STATUS_COLORS = {
  [BookingStatus.PENDING]: 'bg-slate-100 text-slate-500 border-slate-200',
  [BookingStatus.APPROVED]: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  [BookingStatus.REJECTED]: 'bg-red-50 text-red-600 border-red-100',
  [BookingStatus.CANCELLED]: 'bg-slate-50 text-slate-400 border-slate-100',
};
