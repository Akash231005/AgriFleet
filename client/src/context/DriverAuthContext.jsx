import React, { createContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser, logout, setAuthData } from '../features/auth/authSlice';

export const DriverAuthContext = createContext();

export const DriverAuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { token, user, profile, loading: reduxLoading, initialized } = useSelector((state) => state.auth);

  const driverToken = token;
  const driverInfo = user?.role === 'driver' ? profile : null;
  const loading = reduxLoading || (token && !initialized);

  const login = async (mobile, password) => {
    try {
      const resultAction = await dispatch(loginUser({ mobile, password }));
      if (loginUser.fulfilled.match(resultAction)) {
        return { success: true };
      } else {
        throw new Error(resultAction.payload || 'Login failed.');
      }
    } catch (err) {
      throw err;
    }
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const setDriverAuth = (tok, info) => {
    dispatch(setAuthData({
      token: tok,
      user: {
        name: info.name,
        role: 'driver',
        email: info.email || '',
        phone: info.mobile || info.phone
      },
      profile: info
    }));
  };

  return (
    <DriverAuthContext.Provider value={{ driverToken, driverInfo, loading, login, logout: logoutUser, setDriverAuth }}>
      {children}
    </DriverAuthContext.Provider>
  );
};
