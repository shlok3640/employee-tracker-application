const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware: authenticate
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware: requireAdmin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can perform this action' });
  }
  next();
};

// GET /tasks - admin: all tasks, employee: their tasks
router.get('/', authenticate, async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      tasks = await Task.find();
    } else {
      // employee: only their tasks
      const user = await User.findById(req.user.id);
      tasks = await Task.find({ assignee: user.email });
    }
    res.json(tasks);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST /tasks - admin only
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, assignee, dueDate, status } = req.body;
    const task = new Task({
      title,
      description,
      assignee,
      dueDate,
      status: status || 'To Do',
      createdBy: req.user.id,
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// PUT /tasks/:id - admin: edit all, employee: update status only
router.put('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (req.user.role === 'admin') {
      // Admin can edit all fields
      const { title, description, assignee, dueDate, status } = req.body;
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignee !== undefined) task.assignee = assignee;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (status !== undefined) task.status = status;
    } else {
      // Employee can only update status of their own tasks
      const user = await User.findById(req.user.id);
      if (task.assignee !== user.email) {
        return res.status(403).json({ message: 'Not allowed' });
      }
      if (req.body.status) task.status = req.body.status;
    }
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// DELETE /tasks/:id - admin only
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router; 