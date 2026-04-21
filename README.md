# SmartAttend 2.0: Multi-Subject Academic Attendance & Analytics

SmartAttend 2.0 is a comprehensive, full-stack MERN application designed to digitize and automate the traditional attendance process. Built with a modern Glassmorphism UI, the system provides high-integrity tracking for educators and real-time visual analytics for students.

# 🚀 Key Features

1. Subject-Wise Tracking: Supports multiple attendance records per student per day by utilizing a triple-key unique indexing strategy (Student + Subject + Date).
2. Real-Time Analytics: Integrated Chart.js dashboard for students to visualize their attendance trends and individual subject percentages.
3. Bulk Student Management: Teachers can import thousands of student records instantly via CSV file processing.
4. Horizontal Subject Management: A streamlined interface for teachers to create or remove subjects across various degrees (BCA, BBA, BCOM) and semesters.
5. Glassmorphism UI/UX: A vibrant, modern design featuring frosted-glass elements, interactive animations, and responsive layouts.
6. Secure Authentication: Secure login system with Bcrypt.js password hashing and role-based access control.

# 🛠️ Tech Stack

1. Frontend: HTML5, CSS3 (Glassmorphism), JavaScript (ES6+), Chart.js.
2. Backend: Node.js, Express.js.
3. Database: MongoDB (Local/Atlas).
4. Libraries: Mongoose (ODM), Multer (File Upload), Bcrypt.js (Security), CSV-Parser.

# 📦 Installation & Setup

1. Node.js installed
2. MongoDB installed and running (or a MongoDB Atlas URI)
   
# How to Execute

1. Clone the Repository
```Bash
git clone https://github.com/your-username/smart-attendance-2.0.git](https://github.com/DhanushOnTheWeb/Smart-Attendence-2.0.git)
cd smart-attendance-2.0
```
2. Install Dependencies
```Bash
npm install
```
3. Database Indexing (Critical Step)
To ensure the system supports multiple subjects per day, the database requires a specific index. Ensure your local MongoDB attendances collection does not have a unique index on just date. The server will automatically create the correct index:
{ studentId: 1, subjectName: 1, date: 1 }.

5. Run the Application
```Bash
node server.js
```
The server will start on http://localhost:5000.

# 📄 API Documentation

POST /login: Authenticates teachers and students.

POST /register: Registers new teacher accounts.

POST /attendance: Marks or updates attendance records using an upsert logic.

GET /attendance/:uId: Retrieves a student's full profile and multi-subject attendance history.

POST /import-students: Handles bulk CSV uploads of student data.

# 👨‍💻 Author
Dhanush Rao
Final Year BCA Student | Bengaluru North University
