const Task = require('../models/Task');

// 1. Get Tasks with Search & Filter
exports.getTasks = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) query.title = { $regex: search, $options: 'i' };
    if (category && category !== 'all') query.category = category;

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Create Task
exports.createTask = async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 3. Get Stats (The "Industry" Improvement)
exports.getStats = async (req, res) => {
  try {
    const stats = await Task.aggregate([
      {
        $group: {
          _id: "$category",
          total: { $sum: 1 },
          completed: { 
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } 
          }
        }
      }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// 4. Update Task (Mark as completed, change priority, etc.)
exports.updateTask = async (req, res) => {
  try {
    // findByIdAndUpdate takes the ID from the URL and the data from the body
    // { new: true } tells Mongoose to return the updated version of the document
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!updatedTask) return res.status(404).json({ message: "Task not found" });
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 5. Delete Task
exports.deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};