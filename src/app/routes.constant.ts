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
    BOOKING_DETAILS_ID: (id: string | number) => `booking/${id}`,
  },

  ADMIN: {
    BASE: 'admin',
    LOGIN: 'login',
    DASHBOARD: 'dashboard',
    BOOKING_LIST: 'booking-list',
    DRIVERS: 'drivers',
    BOOKING_DETAILS: 'booking/:id',

  }
};
