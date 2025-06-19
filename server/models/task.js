const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' },
  assignee: { type: String, required: true }, // employee email
  dueDate: Date,
  createdBy: { type: String, required: true }, // admin email
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema); 