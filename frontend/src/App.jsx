import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// 🚨 APNA REAL RENDER URL YAHAN PASTE KARO (Bina aakhiri slash '/' ke)
const API_BASE_URL = "https://utkrishtverma-ese-practice-student.onrender.com";

function App() {
  // Authentication States
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isLoginView, setIsLoginView] = useState(true);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  // Student CRUD States
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ name: '', rollNumber: '', email: '', course: '', grade: '' });
  const [editingId, setEditingId] = useState(null); // Kis student ko edit kar rahe hain uski ID

  // Chatbot States
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hello! I am synced with your MongoDB Cloud. Ask me anything about the students.' }]);
  const [inputChat, setInputChat] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  useEffect(() => {
    if (token) fetchStudents();
  }, [token]);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  // --- AUTH FUNCTIONS ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLoginView) {
        const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          email: authForm.email,
          password: authForm.password
        });
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
      } else {
        await axios.post(`${API_BASE_URL}/api/auth/register`, authForm);
        alert('Account successfully created on Cloud! Switching to Login.');
        setIsLoginView(true);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Authentication Failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setStudents([]);
    setEditingId(null);
  };

  // --- CRUD FUNCTIONS ---
  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/students`, getAuthHeader());
      setStudents(res.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // --- UPDATE (PUT) EXECUTION ---
        await axios.put(`${API_BASE_URL}/api/students/${editingId}`, formData, getAuthHeader());
        setEditingId(null);
        alert("Student data updated successfully!");
      } else {
        // --- CREATE (POST) EXECUTION ---
        await axios.post(`${API_BASE_URL}/api/students`, formData, getAuthHeader());
        alert("Student added successfully!");
      }
      setFormData({ name: '', rollNumber: '', email: '', course: '', grade: '' });
      fetchStudents(); // Refresh Table
    } catch (err) {
      alert(err.response?.data?.error || "Operation failed.");
    }
  };

  const startEdit = (student) => {
    setEditingId(student._id);
    setFormData({
      name: student.name,
      rollNumber: student.rollNumber,
      email: student.email,
      course: student.course,
      grade: student.grade
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      // --- DELETE EXECUTION ---
      await axios.delete(`${API_BASE_URL}/api/students/${id}`, getAuthHeader());
      alert("Student profile deleted.");
      fetchStudents(); // Refresh Table
    } catch (err) {
      alert("Failed to delete record.");
    }
  };

  // --- CHATBOT FUNCTION ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputChat.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: inputChat }]);
    setInputChat('');
    setLoadingChat(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/chat`, { message: inputChat }, getAuthHeader());
      setMessages((prev) => [...prev, { sender: 'bot', text: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Error fetching response from OpenRouter AI.' }]);
    } finally {
      setLoadingChat(false);
    }
  };

  // --- VIEW 1: AUTHENTICATION (LOGIN / REGISTER) ---
  if (!token) {
    return (
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleAuthSubmit}>
          <h2>{isLoginView ? 'Cloud Portal Sign In' : 'Create Admin Account'}</h2>
          {!isLoginView && (
            <input type="text" placeholder="Full Name" value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} required />
          )}
          <input type="email" placeholder="Email Address" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} required />
          <input type="password" placeholder="Password" value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} required />
          <button type="submit">{isLoginView ? 'Log In' : 'Sign Up'}</button>
          <p onClick={() => setIsLoginView(!isLoginView)}>
            {isLoginView ? "Don't have an account? Register" : "Have an account? Login"}
          </p>
        </form>
      </div>
    );
  }

  // --- VIEW 2: MAIN DASHBOARD (STUDENT SYSTEM + CHATBOT) ---
  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2>Student Administration Hub (Live Cloud)</h2>
        <button onClick={handleLogout} style={{ backgroundColor: '#000000', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
      </header>

      <div className="main-layout">
        {/* Left Section: Form & Table */}
        <div className="left-panel">
          <form className="student-form" onSubmit={handleFormSubmit}>
            <h3>{editingId ? '✏️ Edit Student Details' : '📝 Register New Student'}</h3>
            <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            <input type="text" placeholder="Roll Number" value={formData.rollNumber} onChange={(e) => setFormData({...formData, rollNumber: e.target.value})} required disabled={editingId ? true : false} />
            <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            <input type="text" placeholder="Course" value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})} required />
            <input type="text" placeholder="Grade" value={formData.grade} onChange={(e) => setFormData({...formData, grade: e.target.value})} required />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ flexGrow: 1 }}>{editingId ? 'Update Record' : 'Push to Cloud MongoDB'}</button>
              {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', rollNumber: '', email: '', course: '', grade: '' }); }} style={{ backgroundColor: '#64748b' }}>Cancel</button>}
            </div>
          </form>

          <div className="student-list">
            <h3>Active Student Roster</h3>
            <table>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td>{s.rollNumber}</td>
                    <td>{s.name}</td>
                    <td>{s.course}</td>
                    <td><strong>{s.grade}</strong></td>
                    <td>
                      <button onClick={() => startEdit(s)} style={{ backgroundColor: '#f59e0b', padding: '5px 10px', marginRight: '5px', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(s._id)} style={{ backgroundColor: '#ef4444', padding: '5px 10px', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No student records found on cloud database.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Section: Chatbot Panel */}
        <div className="right-panel">
          <div className="chatbot-box">
            <h3>AI System Chatbot</h3>
            <div className="chat-window">
              {messages.map((m, idx) => (
                <div key={idx} className={`chat-bubble ${m.sender}`}>
                  <span>{m.text}</span>
                </div>
              ))}
              {loadingChat && <div className="chat-bubble bot Processing">Thinking...</div>}
            </div>
            <form onSubmit={handleSendMessage} className="chat-input-area">
              <input type="text" placeholder="Ask details about current roster..." value={inputChat} onChange={(e) => setInputChat(e.target.value)} />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;