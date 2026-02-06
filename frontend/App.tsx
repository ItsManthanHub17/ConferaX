
import React, { useState, useEffect } from 'react';
import { User, Room, Booking, BookingStatus, Role, Priority } from './types';
import { MOCK_ROOMS } from './constants';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import BookingForm from './components/BookingForm';
import BookingDetailsView from './components/BookingDetailsView';
import AdminRecords from './components/AdminRecords';
import AdminUsers from './components/AdminUsers';
import { api } from './api';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [view, setView] = useState<string>('login'); 
  const [userSubView, setUserSubView] = useState<string>('dashboard');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [systemLogs, setSystemLogs] = useState<{timestamp: string, message: string}[]>([]);

  const addLog = (message: string) => {
    setSystemLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), message }, ...prev].slice(0, 50));
  };

  const fetchData = async () => {
    try {
      const [roomsData, bookingsData] = await Promise.all([
        api.getRooms(),
        api.getBookings()
      ]);
      setRooms(roomsData.length > 0 ? roomsData : MOCK_ROOMS);
      setBookings(bookingsData);
    } catch (err) {
      console.error("Failed to sync data", err);
    }
  };

  useEffect(() => {
    const rawToken = localStorage.getItem('cygnet_auth_token_raw');
    const userJson = localStorage.getItem('cygnet_user');
    
    if (rawToken && userJson) {
      setUser(JSON.parse(userJson));
      setView('dashboard');
      fetchData();
      addLog("System integrity verified. Session restored.");
    }
    addLog("ConferaX initialized. Ready for command.");
  }, []);

  const handleLoginSuccess = (loginResponse: any) => {
    localStorage.setItem('cygnet_auth_token_raw', loginResponse.access_token);
    localStorage.setItem('cygnet_user', JSON.stringify(loginResponse.user));
    
    setUser(loginResponse.user);
    setView('dashboard');
    setUserSubView('dashboard');
    fetchData();
    addLog(`${loginResponse.user.role} session established: ${loginResponse.user.name}.`);
  };

  const handleLogout = () => {
    addLog(`${user?.name} disconnected. Terminating node link.`);
    localStorage.removeItem('cygnet_auth_token_raw');
    localStorage.removeItem('cygnet_user');
    setUser(null);
    setView('login');
  };

  const createBooking = async (bookingData: any) => {
    if (!user) return;
    try {
      const newBooking = await api.createBooking(bookingData, user.id, user.name);
      setBookings(prev => [newBooking, ...prev]);
      
      // Directly show the details of the newly created booking
      setSelectedBooking(newBooking);
      setView('booking-details');
      
      addLog(`Asset request: ${newBooking.id} transmitted to priority queue.`);
    } catch (err) {
      addLog("Transmission Failure: Internal Node Error");
    }
  };

  const updateBookingState = async (bookingId: string, updates: any) => {
    try {
      const updated = await api.updateBooking(bookingId, updates);
      setBookings(prev => prev.map(b => b.id === bookingId ? updated : b));
      fetchData(); // Sync overlaps if any
      if (view === 'booking-details' && selectedBooking?.id === bookingId) {
        setSelectedBooking(updated);
      }
      addLog(`Auth update: Booking ${bookingId} synchronized.`);
    } catch (err) {
      addLog("Sync error: Operation denied.");
    }
  };

  const handleCancelBooking = (id: string) => {
    updateBookingState(id, { status: BookingStatus.CANCELLED });
    if (view === 'booking-details') setView('dashboard');
  };

  const handleApproveBooking = (id: string) => {
    updateBookingState(id, { status: BookingStatus.APPROVED });
  };

  const handleRejectBooking = (id: string, reason: string) => {
    updateBookingState(id, { status: BookingStatus.REJECTED, notes: reason });
  };

  const navigateToBookingForm = (room: Room | null, booking: Booking | null = null, date: string | null = null, time: string | null = null) => {
    const resolvedRoom = room ? rooms.find(r => r.id === room.id) || room : null;
    setSelectedRoom(resolvedRoom);
    setSelectedBooking(booking);
    setSelectedDate(date);
    setSelectedTime(time);
    setView('booking-form');
  };

  const handleOverrideRequest = (room: Room, originalBooking: Booking) => {
    setSelectedRoom(room);
    setSelectedBooking(null); 
    setView('booking-form');
    addLog(`Priority override sequence initiated for ${room.name}.`);
  };

  const renderView = () => {
    if (view === 'login' || !user) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    if (user.role === 'ADMIN') {
      switch (view) {
        case 'dashboard':
          return (
            <AdminDashboard 
              bookings={bookings} 
              onApprove={handleApproveBooking} 
              onReject={handleRejectBooking} 
              onCancel={handleCancelBooking}
              onLogout={handleLogout}
              logs={systemLogs}
              onNavigate={(v) => setView(v)}
            />
          );
        case 'admin-records':
          return (
            <AdminRecords 
              bookings={bookings} 
              onLogout={handleLogout}
              onNavigate={(v) => setView(v)}
            />
          );
        case 'admin-users':
          return (
            <AdminUsers 
              onLogout={handleLogout}
              onNavigate={(v) => setView(v)}
            />
          );
        default:
          return null;
      }
    } else {
      switch (view) {
        case 'dashboard':
          return (
            <UserDashboard 
              user={user}
              rooms={rooms} 
              bookings={bookings}
              activeSubView={userSubView}
              onSetSubView={setUserSubView}
              onBookRoom={(room, date, time) => navigateToBookingForm(room, null, date, time)}
              onViewBooking={(booking) => {
                setSelectedBooking(booking);
                setView('booking-details');
              }}
              onLogout={handleLogout}
            />
          );
        case 'booking-form':
          return (
            <BookingForm 
              room={selectedRoom || rooms[0]} 
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              existingBooking={selectedBooking}
              onSubmit={createBooking}
              onUpdate={(id, data) => {
                updateBookingState(id, data);
                setView('booking-details'); // Stay in details after update to confirm
              }}
              onCancel={() => setView('dashboard')}
            />
          );
        case 'booking-details':
          return selectedBooking ? (
            <BookingDetailsView 
              currentUser={user}
              booking={selectedBooking}
              room={rooms.find(r => r.id === selectedBooking.roomId) || rooms[0]}
              onCancel={() => handleCancelBooking(selectedBooking.id)}
              onModify={() => navigateToBookingForm(rooms.find(r => r.id === selectedBooking.roomId) || null, selectedBooking)}
              onRequestOverride={handleOverrideRequest}
              onBack={() => {
                setView('dashboard');
                setUserSubView('my-bookings');
              }}
            />
          ) : null;
        default:
          return null;
      }
    }
  };

  return <div className="min-h-screen bg-transparent">{renderView()}</div>;
};

export default App;
