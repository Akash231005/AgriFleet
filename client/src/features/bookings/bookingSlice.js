import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

// Fetch all bookings (Admin/Fleet view)
export const fetchBookings = createAsyncThunk(
  'bookings/fetchAll',
  async (statusFilter, { rejectWithValue }) => {
    try {
      const url = statusFilter ? `/bookings?status=${statusFilter}` : '/bookings';
      const response = await API.get(url);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch bookings.');
    }
  }
);

// Fetch farmer's own bookings
export const fetchMyBookings = createAsyncThunk(
  'bookings/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/bookings/my');
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch your bookings.');
    }
  }
);

// Fetch details of a single booking
export const fetchBookingDetail = createAsyncThunk(
  'bookings/fetchDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.get(`/bookings/${id}`);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch booking details.');
    }
  }
);

// Create new service request
export const requestBooking = createAsyncThunk(
  'bookings/create',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await API.post('/bookings', bookingData);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to request service.');
    }
  }
);

// Approve booking request
export const approveBookingRequest = createAsyncThunk(
  'bookings/approve',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.patch(`/bookings/${id}/approve`);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Approval failed.');
    }
  }
);

// Run smart auto-allocation
export const autoAssignBooking = createAsyncThunk(
  'bookings/autoAssign',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.patch(`/bookings/${id}/auto-assign`);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Smart allocation failed.');
    }
  }
);

// Run manual assignment
export const manualAssignBooking = createAsyncThunk(
  'bookings/manualAssign',
  async ({ id, driverId, tractorId, attachmentId }, { rejectWithValue }) => {
    try {
      const response = await API.patch(`/bookings/${id}/assign`, { driverId, tractorId, attachmentId });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Manual allocation failed.');
    }
  }
);

// Cancel booking request
export const cancelBookingRequest = createAsyncThunk(
  'bookings/cancel',
  async ({ id, cancelReason }, { rejectWithValue }) => {
    try {
      const response = await API.patch(`/bookings/${id}/cancel`, { cancelReason });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Cancellation failed.');
    }
  }
);

// Fetch drivers who requested this job
export const fetchDriverRequests = createAsyncThunk(
  'bookings/fetchDriverRequests',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.get(`/bookings/${id}/driver-requests`);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch driver requests.');
    }
  }
);

// Farmer selects a driver for a job
export const selectDriverForJob = createAsyncThunk(
  'bookings/selectDriver',
  async ({ id, driverId }, { rejectWithValue }) => {
    try {
      const response = await API.post(`/bookings/${id}/select-driver`, { driverId });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to select driver.');
    }
  }
);

const initialState = {
  bookings: [],
  currentBooking: null,
  driverRequests: [], // For farmer viewing bids
  loading: false,
  submitting: false,
  error: null
};

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearBookingError: (state) => {
      state.error = null;
    },
    resetCurrentBooking: (state) => {
      state.currentBooking = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // FETCH ALL
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // FETCH MY
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // FETCH DETAIL
      .addCase(fetchBookingDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(fetchBookingDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // CREATE
      .addCase(requestBooking.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(requestBooking.fulfilled, (state, action) => {
        state.submitting = false;
        state.bookings.unshift(action.payload);
      })
      .addCase(requestBooking.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      // APPROVE, AUTO-ASSIGN, MANUAL ASSIGN, CANCEL, SELECT DRIVER
      .addMatcher(
        (action) => [
          approveBookingRequest.fulfilled.type,
          autoAssignBooking.fulfilled.type,
          manualAssignBooking.fulfilled.type,
          cancelBookingRequest.fulfilled.type,
          selectDriverForJob.fulfilled.type
        ].includes(action.type),
        (state, action) => {
          state.submitting = false;
          state.currentBooking = action.payload;
          const index = state.bookings.findIndex(b => b._id === action.payload._id);
          if (index !== -1) {
            state.bookings[index] = action.payload;
          }
        }
      )
      .addMatcher(
        (action) => [
          approveBookingRequest.pending.type,
          autoAssignBooking.pending.type,
          manualAssignBooking.pending.type,
          cancelBookingRequest.pending.type,
          selectDriverForJob.pending.type
        ].includes(action.type),
        (state) => {
          state.submitting = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => [
          approveBookingRequest.rejected.type,
          autoAssignBooking.rejected.type,
          manualAssignBooking.rejected.type,
          cancelBookingRequest.rejected.type,
          selectDriverForJob.rejected.type
        ].includes(action.type),
        (state, action) => {
          state.submitting = false;
          state.error = action.payload;
        }
      )
      // FETCH DRIVER REQUESTS
      .addMatcher(
        (action) => action.type === fetchDriverRequests.pending.type,
        (state) => {
          state.loading = true;
          state.driverRequests = [];
        }
      )
      .addMatcher(
        (action) => action.type === fetchDriverRequests.fulfilled.type,
        (state, action) => {
          state.loading = false;
          state.driverRequests = action.payload;
        }
      )
      .addMatcher(
        (action) => action.type === fetchDriverRequests.rejected.type,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  }
});

export const { clearBookingError, resetCurrentBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
