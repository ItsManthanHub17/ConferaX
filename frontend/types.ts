
export type Role = 'USER' | 'ADMIN';

export enum BookingStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  CANCELLED = 'Cancelled'
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface Room {
  id: string;
  name: string;
  floor: string;
  roomNumber: string;
  capacity: number;
  imageUrl: string;
  features: string[];
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  roomId: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  attendees: number;
  description: string;
  priority: Priority;
  status: BookingStatus;
  equipment: string[];
  createdAt: string;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
}
