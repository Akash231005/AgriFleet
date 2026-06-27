import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await API.post('/auth/login', credentials);
      const { token, user, profile } = response.data.data;
      localStorage.setItem('agrifleet_token', token);
      return { user, profile };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed.');
    }
  }
);

export const registerFarmer = createAsyncThunk(
  'auth/registerFarmer',
  async (farmerDetails, { rejectWithValue }) => {
    try {
      const response = await API.post('/auth/register', farmerDetails);
      const { token, user, farmer } = response.data.data;
      localStorage.setItem('agrifleet_token', token);
      return { user, profile: farmer };
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Validation details:', err.response?.data);
      }
      return rejectWithValue({
        message: err.response?.data?.message || 'Registration failed.',
        errors: err.response?.data?.errors || null
      });
    }
  }
);

export const registerDriver = createAsyncThunk(
  'auth/registerDriver',
  async (driverDetails, { rejectWithValue }) => {
    try {
      const response = await API.post('/auth/register-driver', driverDetails);
      const { token, user, profile } = response.data.data;
      localStorage.setItem('agrifleet_token', token);
      return { user, profile };
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Validation details:', err.response?.data);
      }
      return rejectWithValue({
        message: err.response?.data?.message || 'Driver registration failed.',
        errors: err.response?.data?.errors || null
      });
    }
  }
);

export const loadCurrentUser = createAsyncThunk(
  'auth/loadMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/auth/me');
      const { user, profile } = response.data.data;
      return { user, profile };
    } catch (err) {
      localStorage.removeItem('agrifleet_token');
      return rejectWithValue(err.response?.data?.message || 'Session expired.');
    }
  }
);

const initialState = {
  user: null,
  profile: null,
  token: localStorage.getItem('agrifleet_token') || null,
  loading: false,
  error: null,
  initialized: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('agrifleet_token');
      localStorage.removeItem('driverToken');
      localStorage.removeItem('driverInfo');
      state.user = null;
      state.profile = null;
      state.token = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setAuthData: (state, action) => {
      state.user = action.payload.user;
      state.profile = action.payload.profile;
      state.token = action.payload.token;
      localStorage.setItem('agrifleet_token', action.payload.token);
    }
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.token = localStorage.getItem('agrifleet_token');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // REGISTER
      .addCase(registerFarmer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerFarmer.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.token = localStorage.getItem('agrifleet_token');
      })
      .addCase(registerFarmer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // REGISTER DRIVER
      .addCase(registerDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.token = localStorage.getItem('agrifleet_token');
      })
      .addCase(registerDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // LOAD ME
      .addCase(loadCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
      })
      .addCase(loadCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = null;
        state.profile = null;
        state.token = null;
      });
  }
});

export const { logout, clearError, setAuthData } = authSlice.actions;
export default authSlice.reducer;
