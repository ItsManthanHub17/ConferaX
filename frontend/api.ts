/// <reference types="vite/client" />
import axios from 'axios';
import { Booking, BookingStatus, Priority, User, Room } from './types';

// Docker: Use /api (proxied through nginx), Local dev: Use full backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:8000/api/v1' 
    : '/api/v1');

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('cygnet_auth_token_raw');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cygnet_auth_token_raw');
      localStorage.removeItem('cygnet_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const api = {
  login: async (data: { email: string; password: string }) => {
    const response = await axiosInstance.post('/auth/login', data);
    
    // Get user details
    const userResponse = await axiosInstance.get('/auth/me', {
      headers: { Authorization: `Bearer ${response.data.access_token}` }
    });
    
    return {
      access_token: response.data.access_token,
      token_type: response.data.token_type,
      user: {
        id: userResponse.data.id,
        email: userResponse.data.email,
        name: userResponse.data.name,
        role: userResponse.data.role,
        avatar: userResponse.data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userResponse.data.name)}&background=${userResponse.data.role === 'ADMIN' ? 'f59e0b' : '6366f1'}&color=fff`
      }
    };
  },

  register: async (data: { email: string; name: string; password: string }) => {
    await axiosInstance.post('/users/register', {
      email: data.email,
      name: data.name,
      password: data.password,
      role: 'USER'
    });

    return api.login({ email: data.email, password: data.password });
  },

  getRooms: async (): Promise<Room[]> => {
    const response = await axiosInstance.get('/rooms');
    return response.data.map((room: any) => ({
      id: room.id,
      name: room.name,
      floor: room.floor,
      roomNumber: room.room_number,
      capacity: Number(room.capacity ?? 0),
      imageUrl: room.image_url || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1000',
      features: room.features || []
    }));
  },

  getBookings: async (): Promise<Booking[]> => {
    const response = await axiosInstance.get('/bookings');
    return response.data.map((booking: any) => ({
      id: booking.id,
      userId: booking.user_id,
      userName: booking.user_name || 'Unknown',
      roomId: booking.room_id,
      roomName: booking.room_name || 'Unknown Room',
      date: booking.date,
      startTime: booking.start_time,
      endTime: booking.end_time,
      title: booking.title,
      attendees: booking.attendees,
      description: booking.description || '',
      priority: booking.priority as Priority,
      status: booking.status as BookingStatus,
      equipment: booking.equipment || [],
      createdAt: booking.created_at,
      notes: booking.notes
    }));
  },

  getUsers: async (): Promise<User[]> => {
    // Note: Backend doesn't have a list users endpoint for non-admins
    // This would need to be added or we fetch from bookings
    return [];
  },

  createUser: async (userData: Partial<User> & { password?: string }): Promise<User> => {
    const response = await axiosInstance.post('/users/register', {
      email: userData.email,
      name: userData.name,
      password: userData.password || 'TempPass2026!',
      role: userData.role || 'USER'
    });
    
    return {
      id: response.data.id,
      email: response.data.email,
      name: response.data.name,
      role: response.data.role,
      avatar: response.data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(response.data.name)}&background=${response.data.role === 'ADMIN' ? 'f59e0b' : '4f46e5'}&color=fff`
    };
  },

  deleteUser: async (id: string) => {
    throw new Error('Delete user not implemented in backend');
  },

  createBooking: async (data: any, userId: string, userName: string): Promise<Booking> => {
    const response = await axiosInstance.post('/bookings', {
      room_id: data.roomId,
      date: data.date,
      start_time: data.startTime,
      end_time: data.endTime,
      title: data.title,
      attendees: data.attendees,
      description: data.description || '',
      priority: data.priority,
      equipment: data.equipment || []
    });

    return {
      id: response.data.id,
      userId: response.data.user_id,
      userName: userName,
      roomId: response.data.room_id,
      roomName: data.roomName,
      date: response.data.date,
      startTime: response.data.start_time,
      endTime: response.data.end_time,
      title: response.data.title,
      attendees: response.data.attendees,
      description: response.data.description || '',
      priority: response.data.priority as Priority,
      status: response.data.status as BookingStatus,
      equipment: response.data.equipment || [],
      createdAt: response.data.created_at,
      notes: response.data.notes
    };
  },

  updateBooking: async (id: string, updates: any): Promise<Booking> => {
    let response;
    
    if (updates.status === BookingStatus.APPROVED) {
      response = await axiosInstance.post(`/bookings/${id}/approve`);
    } else if (updates.status === BookingStatus.REJECTED) {
      response = await axiosInstance.post(`/bookings/${id}/reject`, {
        notes: updates.notes
      });
    } else if (updates.status === BookingStatus.CANCELLED) {
      response = await axiosInstance.patch(`/bookings/${id}/cancel`, {
        notes: updates.notes
      });
    } else {
      const updateData: any = {};
      if (updates.roomId) updateData.room_id = updates.roomId;
      if (updates.date) updateData.date = updates.date;
      if (updates.startTime) updateData.start_time = updates.startTime;
      if (updates.endTime) updateData.end_time = updates.endTime;
      if (updates.title) updateData.title = updates.title;
      if (updates.attendees !== undefined) updateData.attendees = updates.attendees;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.priority) updateData.priority = updates.priority;
      if (updates.equipment) updateData.equipment = updates.equipment;
      
      response = await axiosInstance.put(`/bookings/${id}`, updateData);
    }

    const booking = response.data;
    return {
      id: booking.id,
      userId: booking.user_id,
      userName: booking.user_name || 'Unknown',
      roomId: booking.room_id,
      roomName: booking.room_name || 'Unknown Room',
      date: booking.date,
      startTime: booking.start_time,
      endTime: booking.end_time,
      title: booking.title,
      attendees: booking.attendees,
      description: booking.description || '',
      priority: booking.priority as Priority,
      status: booking.status as BookingStatus,
      equipment: booking.equipment || [],
      createdAt: booking.created_at,
      notes: booking.notes
    };
  },

  deleteBooking: async (id: string) => {
    await axiosInstance.delete(`/bookings/${id}`);
    return { status: "deleted", id };
  },
};
