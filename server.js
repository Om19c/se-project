const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey123';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend static files

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to local MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Database Schemas & Models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  age: { type: Number, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  doctor: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending' }
});

const User = mongoose.model('User', userSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);

// Auth Middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Routes

// 1. Signup Route
app.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const role = email === 'admin@medicare.com' ? 'admin' : 'user';
    const newUser = new User({ email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 2. Login Route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role, message: 'Logged in successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 3. Book Appointment Route (Protected)
app.post('/appointments', authMiddleware, async (req, res) => {
  try {
    const { patientName, age, date, time, doctor } = req.body;

    const newAppointment = new Appointment({
      userId: req.user.userId,
      patientName,
      age,
      date,
      time,
      doctor
    });

    await newAppointment.save();
    res.status(201).json({ message: 'Appointment booked successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 4. View Appointments Route (Protected)
app.get('/appointments', authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.userId }).sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 5. Admin View All Appointments
app.get('/admin/appointments', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const appointments = await Appointment.find().sort({ date: 1, time: 1 }).populate('userId', 'email');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 6. Admin Update Appointment Status
app.put('/admin/appointments/:id/status', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const apt = await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(apt);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Catch-all route to serve index.html for unknown GET requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
