export const mockStats = {
  totalBookings: 245,
  todaysBookings: 18,
  confirmedReservations: 180,
  pendingPayments: 12,
  cancellationRequests: 5,
  refundRequests: 3,
  totalRevenue: 185400,
  reservedHours: 620,
  availableCourts: 5,
  blockedTimeSlots: 8
};

export const mockReservations = [
  { id: '#1050', customer: 'Ahmed Hassan', court: 'Football Pitch A', category: 'Football', date: '2023-11-01', time: '18:00 - 19:30', status: 'Confirmed', payment: 'Paid', amount: 800 },
  { id: '#1049', customer: 'Sara Mohamed', court: 'Basketball Court 1', category: 'Basketball', date: '2023-11-01', time: '19:00 - 20:00', status: 'Pending', payment: 'Unpaid', amount: 400 },
  { id: '#1048', customer: 'John Doe', court: 'Tennis Main', category: 'Tennis', date: '2023-11-01', time: '16:00 - 18:00', status: 'Confirmed', payment: 'Paid', amount: 1200 },
  { id: '#1047', customer: 'Fatima Ali', court: 'Volleyball Court', category: 'Volleyball', date: '2023-11-02', time: '20:00 - 21:00', status: 'Cancelled', payment: 'Refunded', amount: 350 },
  { id: '#1046', customer: 'Omar Khalid', court: 'Football Pitch B', category: 'Football', date: '2023-11-02', time: '21:00 - 22:30', status: 'Confirmed', payment: 'Paid', amount: 800 },
  { id: '#1045', customer: 'Michael Smith', court: 'Ping Pong Area', category: 'Ping Pong', date: '2023-11-02', time: '17:00 - 18:00', status: 'Confirmed', payment: 'Paid', amount: 150 },
  { id: '#1044', customer: 'Mohamed Youssef', court: 'Handball Arena', category: 'Handball', date: '2023-11-03', time: '18:00 - 20:00', status: 'Pending', payment: 'Unpaid', amount: 600 },
  { id: '#1043', customer: 'Nour Tariq', court: 'Football Pitch A', category: 'Football', date: '2023-11-03', time: '20:00 - 21:30', status: 'Confirmed', payment: 'Paid', amount: 800 },
  { id: '#1042', customer: 'Yousef Nabil', court: 'Basketball Court 2', category: 'Basketball', date: '2023-11-04', time: '15:00 - 16:30', status: 'Cancelled', payment: 'Refunded', amount: 500 },
  { id: '#1041', customer: 'Emily Clark', court: 'Tennis Main', category: 'Tennis', date: '2023-11-04', time: '19:00 - 21:00', status: 'Confirmed', payment: 'Paid', amount: 1200 },
  { id: '#1040', customer: 'Karim Zaki', court: 'Football Pitch B', category: 'Football', date: '2023-11-04', time: '16:00 - 17:30', status: 'Confirmed', payment: 'Paid', amount: 800 },
  { id: '#1039', customer: 'Salma Magdy', court: 'Ping Pong Area', category: 'Ping Pong', date: '2023-11-05', time: '18:00 - 20:00', status: 'Pending', payment: 'Unpaid', amount: 300 },
];

export const mockPendingApprovals = [
  { id: '#1038', customer: 'Mahmoud Sayed', court: 'Football Pitch A', datetime: 'Nov 5, 2023 - 18:00' },
  { id: '#1037', customer: 'Laila Mostafa', court: 'Basketball Court 1', datetime: 'Nov 6, 2023 - 19:30' },
  { id: '#1036', customer: 'David Jones', court: 'Tennis Main', datetime: 'Nov 6, 2023 - 16:00' }
];

export const mockCancellationRequests = [
  { id: '#1035', customer: 'Hassan Ali', court: 'Football Pitch B', date: 'Nov 7, 2023', amount: 800 },
  { id: '#1034', customer: 'Zeinab Kamal', court: 'Volleyball Court', date: 'Nov 8, 2023', amount: 350 },
  { id: '#1033', customer: 'Tarek Shawky', court: 'Ping Pong Area', date: 'Nov 8, 2023', amount: 150 }
];

export const mockMostBookedCourts = [
  { name: 'Football Pitch A', bookings: 120, progress: 100 },
  { name: 'Basketball Court 1', bookings: 45, progress: 37.5 },
  { name: 'Volleyball Court', bookings: 30, progress: 25 },
  { name: 'Handball Arena', bookings: 28, progress: 23.3 },
  { name: 'Ping Pong Area', bookings: 22, progress: 18.3 }
];

export const mockActivityLog = [
  { text: 'Ahmed approved reservation #1042', time: '2 min ago' },
  { text: 'Sara cancelled reservation #1039', time: '15 min ago' },
  { text: 'Board updated football court price', time: '1 hr ago' },
  { text: 'Staff blocked Court B for maintenance', time: '3 hrs ago' },
  { text: 'New student Mohamed Ali registered', time: '5 hrs ago' }
];

export const chartDataBookingsPerCourt = [
  { name: 'Football', value: 120 },
  { name: 'Basketball', value: 45 },
  { name: 'Volleyball', value: 30 },
  { name: 'Handball', value: 28 },
  { name: 'Ping Pong', value: 22 }
];

export const chartDataReservationDist = [
  { name: 'Confirmed', value: 73, fill: '#10b981' },
  { name: 'Pending', value: 15, fill: '#f59e0b' },
  { name: 'Cancelled', value: 7, fill: '#ef4444' },
  { name: 'Refunded', value: 5, fill: '#6b7280' }
];

export const chartDataRevenue = [
  { name: 'Jan', revenue: 65000 },
  { name: 'Feb', revenue: 72000 },
  { name: 'Mar', revenue: 85000 },
  { name: 'Apr', revenue: 105000 },
  { name: 'May', revenue: 120000 },
  { name: 'Jun', revenue: 140000 },
  { name: 'Jul', revenue: 165000 },
  { name: 'Aug', revenue: 185400 }
];

export const chartDataHours = [
  { name: 'Jan', hours: 250 },
  { name: 'Feb', hours: 280 },
  { name: 'Mar', hours: 320 },
  { name: 'Apr', hours: 410 },
  { name: 'May', hours: 480 },
  { name: 'Jun', hours: 520 },
  { name: 'Jul', hours: 580 },
  { name: 'Aug', hours: 620 }
];
