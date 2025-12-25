const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['dsa', 'exam', 'placement', 'project'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed', 'live'], 
    default: 'pending' 
  },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }, // For DSA
  deadline: { type: Date },
  note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);