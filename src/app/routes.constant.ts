export const APP_ROUTES = {
  DRIVER: {
    BASE: 'driver',

    LOGIN: 'login',
    SIGNUP: 'signup',

    PROFILE: 'profile',
    DASHBOARD: 'dashboard',

    SET_LOCATION: 'set-location',

    BOOKINGS: 'bookings',

    BOOKING_DETAILS: 'booking/:id',
   BOOKING_DETAILS_ID: (id: string | number) => `/driver/booking/${id}`,
  },

  ADMIN: {
    BASE: 'admin',

    LOGIN: 'login',
    DASHBOARD: 'dashboard',
    DRIVERS: 'drivers',
  }
};
