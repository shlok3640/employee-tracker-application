import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, Alert, Chip } from '@mui/material';

const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes

export default function EmployeesDashboard() {
  const [working, setWorking] = useState(false);
  const [active, setActive] = useState(true);
  const [workStart, setWorkStart] = useState(null);
  const [workEnd, setWorkEnd] = useState(null);
  const [inactiveSince, setInactiveSince] = useState(null);
  const [totalActiveTime, setTotalActiveTime] = useState(0);
  const inactivityTimer = useRef(null);
  const lastActivity = useRef(Date.now());
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Start work handler
  const handleStartWork = () => {
    if (window.electronAPI) {
      const token = localStorage.getItem('token');
      const user = { // We need to reconstruct the user object or store it whole
        id: localStorage.getItem('userId'), // Assuming userId is stored on login
        email: localStorage.getItem('userEmail'),
        role: localStorage.getItem('userRole')
      };
      window.electronAPI.startMonitoring(token, user);
      setIsMonitoring(true);
    }
    setWorking(true);
    setWorkStart(Date.now());
    setWorkEnd(null);
    setActive(true);
    setInactiveSince(null);
    setTotalActiveTime(0);
    lastActivity.current = Date.now();
  };

  // Stop work handler
  const handleStopWork = () => {
    if (window.electronAPI) {
      window.electronAPI.stopMonitoring();
      setIsMonitoring(false);
    }
    setWorking(false);
    setWorkEnd(Date.now());
    if (active) {
      setTotalActiveTime((prev) => prev + (Date.now() - lastActivity.current));
    }
    setActive(false);
    setInactiveSince(null);
    clearTimeout(inactivityTimer.current);
  };

  // Activity event handler
  const handleUserActivity = () => {
    if (!working) return;
    if (!active) {
      // Became active again
      setActive(true);
      setTotalActiveTime((prev) => prev + (Date.now() - inactiveSince));
      setInactiveSince(null);
    }
    lastActivity.current = Date.now();
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      setActive(false);
      setInactiveSince(Date.now());
    }, INACTIVITY_LIMIT);
  };

  // Set up event listeners for activity
  useEffect(() => {
    if (working) {
      window.addEventListener('mousemove', handleUserActivity);
      window.addEventListener('keydown', handleUserActivity);
      window.addEventListener('mousedown', handleUserActivity);
      inactivityTimer.current = setTimeout(() => {
        setActive(false);
        setInactiveSince(Date.now());
      }, INACTIVITY_LIMIT);
    } else {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('mousedown', handleUserActivity);
      clearTimeout(inactivityTimer.current);
    }
    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('mousedown', handleUserActivity);
      clearTimeout(inactivityTimer.current);
    };
    // eslint-disable-next-line
  }, [working]);

  // Show time worked in hh:mm:ss
  const formatTime = (ms) => {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600).toString().padStart(2, '0');
    const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const now = Date.now();
  let sessionActiveTime = 0;
  if (working && active) {
    sessionActiveTime = totalActiveTime + (now - lastActivity.current);
  } else if (working && !active && inactiveSince) {
    sessionActiveTime = totalActiveTime + (inactiveSince - lastActivity.current);
  } else {
    sessionActiveTime = totalActiveTime;
  }

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 6, p: 4, bgcolor: 'white', borderRadius: 2, boxShadow: 2 }}>
      <Typography variant="h4" fontWeight={700} mb={2}>Employee Dashboard</Typography>
      <div className="flex space-x-4">
        <button 
          onClick={handleStartWork}
          disabled={isMonitoring}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
        >
          Start Work
        </button>
        <button 
          onClick={handleStopWork}
          disabled={!isMonitoring}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
        >
          Stop Work
        </button>
      </div>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Work Status:</Typography>
        <Chip label={working ? (active ? 'Active' : 'Inactive') : 'Not Working'} color={working ? (active ? 'success' : 'warning') : 'default'} sx={{ fontWeight: 600, fontSize: 16, mt: 1 }} />
        <Typography sx={{ mt: 2 }}>Time Worked: <b>{formatTime(sessionActiveTime)}</b></Typography>
        {working && !active && (
          <Alert severity="warning" sx={{ mt: 2 }}>No activity detected. You are marked as inactive.</Alert>
        )}
        {workStart && (
          <Typography sx={{ mt: 2, fontSize: 14, color: 'gray' }}>Session started: {new Date(workStart).toLocaleTimeString()}</Typography>
        )}
        {workEnd && (
          <Typography sx={{ fontSize: 14, color: 'gray' }}>Session ended: {new Date(workEnd).toLocaleTimeString()}</Typography>
        )}
      </Box>
      {isMonitoring && (
        <p className="mt-4 text-green-700">Monitoring is active. Screenshots are being taken every 30 seconds.</p>
      )}
    </Box>
  );
} 