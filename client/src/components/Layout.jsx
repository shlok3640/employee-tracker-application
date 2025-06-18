import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'primary.main',
              fontWeight: 'bold',
            }}
          >
            Employee Tracker
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {isAuthenticated ? (
              <>
                <Button
                  component={Link}
                  to="/dashboard"
                  color="inherit"
                >
                  Dashboard
                </Button>
                <Button
                  component={Link}
                  to="/tasks"
                  color="inherit"
                >
                  Tasks
                </Button>
                {userRole === 'admin' && (
                  <>
                    <Button
                      component={Link}
                      to="/employees"
                      color="inherit"
                    >
                      Employees
                    </Button>
                    <Button
                      component={Link}
                      to="/reports"
                      color="inherit"
                    >
                      Reports
                    </Button>
                  </>
                )}
                <Button
                  onClick={handleLogout}
                  variant="contained"
                  color="primary"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/login"
                  color="inherit"
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/signup"
                  variant="contained"
                  color="primary"
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </div>
  );
} 