import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container, Avatar, IconButton, Menu, MenuItem, Divider, Tooltip, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName') || 'User';

  // Profile menu state
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  // Helper for active link
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar position="static" color="default" elevation={2} sx={{ borderBottom: 1, borderColor: 'divider' }}>
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
          {isAuthenticated && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                component={Link}
                to="/dashboard"
                color={isActive('/dashboard') ? 'primary' : 'inherit'}
                variant={isActive('/dashboard') ? 'contained' : 'text'}
              >
                Dashboard
              </Button>
              <Button
                component={Link}
                to="/tasks"
                color={isActive('/tasks') ? 'primary' : 'inherit'}
                variant={isActive('/tasks') ? 'contained' : 'text'}
              >
                Tasks
              </Button>
              {userRole === 'admin' && (
                <>
                  <Button
                    component={Link}
                    to="/employees"
                    color={isActive('/employees') ? 'primary' : 'inherit'}
                    variant={isActive('/employees') ? 'contained' : 'text'}
                  >
                    Employees
                  </Button>
                  <Button
                    component={Link}
                    to="/reports"
                    color={isActive('/reports') ? 'primary' : 'inherit'}
                    variant={isActive('/reports') ? 'contained' : 'text'}
                  >
                    Reports
                  </Button>
                </>
              )}
              <Tooltip title="Notifications">
                <IconButton color="inherit" sx={{ ml: 1 }}>
                  <Badge badgeContent={0} color="secondary">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Account settings">
                <IconButton onClick={handleMenu} color="inherit" sx={{ ml: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {userName[0]?.toUpperCase() || <AccountCircle />}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                  elevation: 2,
                  sx: { mt: 1.5, minWidth: 180 },
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem disabled>{userName}</MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          )}
          {!isAuthenticated && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                component={Link}
                to="/login"
                color={isActive('/login') ? 'primary' : 'inherit'}
                variant={isActive('/login') ? 'contained' : 'text'}
              >
                Login
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </div>
  );
} 