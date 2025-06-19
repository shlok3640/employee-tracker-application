import React, { useEffect, useState } from 'react';
import api from '../api';
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const statusColors = {
  'To Do': 'default',
  'In Progress': 'primary',
  'Done': 'success',
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', assignee: '', dueDate: '', status: 'To Do' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const userRole = localStorage.getItem('userRole');
  const userEmail = localStorage.getItem('userEmail');

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await api.get('/auth/tasks');
        setTasks(res.data);
      } catch (err) {
        setError('Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Open modal for new or edit
  const handleOpen = (task = null) => {
    if (task) {
      setEditTask(task);
      setForm({
        title: task.title,
        description: task.description,
        assignee: task.assignee,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
        status: task.status,
      });
    } else {
      setEditTask(null);
      setForm({ title: '', description: '', assignee: '', dueDate: '', status: 'To Do' });
    }
    setOpen(true);
  };

  // Handle create/edit task
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      if (editTask) {
        await api.put(`/auth/tasks/${editTask._id}`, form);
      } else {
        await api.post('/auth/tasks', form);
      }
      setOpen(false);
      setForm({ title: '', description: '', assignee: '', dueDate: '', status: 'To Do' });
      // Refresh tasks
      const res = await api.get('/auth/tasks');
      setTasks(res.data);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/auth/tasks/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  // Handle status update (employee)
  const handleStatusChange = async (task, status) => {
    try {
      await api.put(`/auth/tasks/${task._id}`, { status });
      setTasks(tasks.map((t) => (t._id === task._id ? { ...t, status } : t)));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Only show tasks assigned to employee
  const visibleTasks = userRole === 'admin' ? tasks : tasks.filter((t) => t.assignee === userEmail);

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Tasks</Typography>
        {userRole === 'admin' && (
          <Button variant="contained" color="primary" onClick={() => handleOpen()}>
            Add Task
          </Button>
        )}
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Assignee</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                {userRole === 'admin' && <TableCell>Actions</TableCell>}
                {userRole === 'employee' && <TableCell>Update Status</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleTasks.map((task) => (
                <TableRow key={task._id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{task.assignee}</TableCell>
                  <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}</TableCell>
                  <TableCell>
                    <Chip label={task.status} color={statusColors[task.status]} />
                  </TableCell>
                  {userRole === 'admin' && (
                    <TableCell>
                      <IconButton onClick={() => handleOpen(task)}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(task._id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  )}
                  {userRole === 'employee' && (
                    <TableCell>
                      <Select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value)}
                        size="small"
                      >
                        <MenuItem value="To Do">To Do</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Done">Done</MenuItem>
                      </Select>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" mb={2}>{editTask ? 'Edit Task' : 'Add Task'}</Typography>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <TextField
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Assignee (email)"
            name="assignee"
            value={form.assignee}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
            disabled={userRole !== 'admin'}
          />
          <TextField
            label="Due Date"
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={form.status}
              label="Status"
              onChange={handleChange}
            >
              <MenuItem value="To Do">To Do</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Done">Done</MenuItem>
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={formLoading}>
            {formLoading ? (editTask ? 'Saving...' : 'Creating...') : (editTask ? 'Save Changes' : 'Create Task')}
          </Button>
        </Box>
      </Modal>
    </React.Fragment>
  );
} 