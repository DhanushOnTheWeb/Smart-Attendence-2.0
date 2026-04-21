const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const csv = require('csv-parser');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// --- 1. DATABASE CONNECTION ---
mongoose.connect('mongodb://localhost:27017/attendance_db')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ Connection Error:', err));

// --- 2. SCHEMAS & MODELS ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  uniqueId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher'], required: true },
  degree: { type: String, enum: ['BCA', 'BBA', 'BCOM'] },
  semester: String,
  section: { type: String, enum: ['A', 'B', 'C', 'D'] }
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  degree: { type: String, enum: ['BCA', 'BBA', 'BCOM'], required: true },
  semester: { type: String, required: true }
});

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectName: { type: String, required: true },
  status: { type: String, enum: ['present', 'absent'], required: true },
  date: { type: String, required: true }, 
  markedBy: { type: String }
});

// CRITICAL FIX: The index must include subjectName to allow multiple subjects per day
attendanceSchema.index({ studentId: 1, subjectName: 1, date: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);
const Subject = mongoose.model('Subject', subjectSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);

// --- 3. ROUTES ---

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'home.html')); });

app.post('/login', async (req, res) => {
  const { uniqueId, password } = req.body;
  try {
    const user = await User.findOne({ uniqueId });
    if (user && await bcrypt.compare(password, user.password)) {
      res.json({ role: user.role, name: user.name, uniqueId: user.uniqueId });
    } else { res.status(401).json({ error: 'Invalid Credentials' }); }
  } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

app.post('/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.json({ message: "Registration Successful" });
  } catch (err) {
    res.status(400).json({ error: err.message.includes('E11000') ? "ID exists" : "Reg Failed" });
  }
});

// SUBJECT MANAGEMENT
app.get('/api/subjects', async (req, res) => {
  const { degree, semester } = req.query;
  const subjects = await Subject.find({ degree, semester });
  res.json(subjects);
});

app.post('/api/subjects', async (req, res) => {
  try {
    const newSub = new Subject(req.body);
    await newSub.save();
    res.json({ message: "Subject Added" });
  } catch (err) { res.status(400).json({ error: "Subject already exists" }); }
});

app.delete('/api/subjects/:id', async (req, res) => {
  await Subject.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ATTENDANCE MANAGEMENT
app.get('/students', async (req, res) => {
  const students = await User.find({ role: 'student', ...req.query }).sort({ name: 1 });
  res.json(students);
});

app.post('/attendance', async (req, res) => {
  const { studentId, subjectName, status, date, teacherId } = req.body;
  try {
    await Attendance.findOneAndUpdate(
      { studentId, subjectName, date },
      { status, markedBy: teacherId },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: "Duplicate error. Check database indexes." }); }
});

app.delete('/attendance', async (req, res) => {
  const { studentId, subjectName, date } = req.query;
  await Attendance.findOneAndDelete({ studentId, subjectName, date });
  res.json({ success: true });
});

app.get('/attendance/:uId', async (req, res) => {
  try {
    const user = await User.findOne({ uniqueId: req.params.uId });
    if (!user) return res.status(404).json({ error: "Student not found" });
    const records = await Attendance.find({ studentId: user._id });
    res.json({ name: user.name, degree: user.degree, semester: user.semester, section: user.section, records });
  } catch (err) { res.status(500).json({ error: "Server Error" }); }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));