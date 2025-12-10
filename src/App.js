import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import React from 'react';
import ContactList from './components/ContactList';
import ContactForm from './components/ContactForm';
import ImportExport from './components/ImportExport';

function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Contacts</h1>
      <ImportExport />
      <ContactForm />
      <hr />
      <ContactList />
    </div>
  );
}

export default App;
// 从环境变量中读取后端 API 地址
const BASE_URL = process.env.REACT_APP_API_URL;

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  other: "",
};

function App() {
  const [form, setForm] = useState(emptyForm);
  const [contacts, setContacts] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  // 获取联系人列表
  const fetchContacts = async (name = "", phone = "") => {
    let url = `${BASE_URL}/api/contacts?`;
    if (name) url += `name=${encodeURIComponent(name)}&`;
    if (phone) url += `phone=${encodeURIComponent(phone)}`;
    try {
      const res = await axios.get(url);
      setContacts(res.data);
    } catch (e) {
      console.error("Fetch error:", e);
      setError("Failed to fetch contacts.");
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // 表单输入变化
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 提交表单（新增或更新）
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    try {
      if (editing) {
        await axios.put(`${BASE_URL}/api/contacts/${editing}`, form);
        setEditing(null);
      } else {
        await axios.post(`${BASE_URL}/api/contacts`, form);
      }
      setForm(emptyForm);
      fetchContacts(searchName, searchPhone);
    } catch (e) {
      console.error("Save error:", e);
      setError(e.response?.data?.error || "Error saving!");
    }
  };

  // 删除联系人
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await axios.delete(`${BASE_URL}/api/contacts/${id}`);
        fetchContacts(searchName, searchPhone);
      } catch (e) {
        console.error("Delete error:", e);
        setError("Failed to delete contact.");
      }
    }
  };

  // 编辑联系人
  const handleEdit = (contact) => {
    setForm(contact);
    setEditing(contact._id);
  };

  // 清空所有联系人
  const handleClearAll = async () => {
    if (window.confirm("Clear all contacts? This cannot be undone!")) {
      try {
        await axios.delete(`${BASE_URL}/api/contacts`);
        fetchContacts();
      } catch (e) {
        console.error("Clear all error:", e);
        setError("Failed to clear contacts.");
      }
    }
  };

  // 搜索与重置
  const handleSearch = () => {
    fetchContacts(searchName, searchPhone);
  };

  const handleReset = () => {
    setSearchName("");
    setSearchPhone("");
    fetchContacts();
  };

  // 字母标签
  const getFirstLetter = (name) => {
    return name && name[0] ? name[0].toUpperCase() : "#";
  };

  return (
    <div className="container">
      <h1>Contact Management</h1>

      <div className="search-bar">
        <input
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          placeholder="Search by phone"
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
        />
        <button className="btn" onClick={handleSearch}>
          Search
        </button>
        <button className="btn btn-grey" onClick={handleReset}>
          Reset
        </button>
        <button className="btn btn-danger" onClick={handleClearAll}>
          Clear All
        </button>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <div className="row">
          <input
            placeholder="Name (required)"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          <input
            placeholder="Phone (required)"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
          <input
            placeholder="Email (optional)"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            placeholder="Other (optional)"
            name="other"
            value={form.other}
            onChange={handleChange}
          />
        </div>
        <button className="btn btn-primary" type="submit">
          {editing ? "Update Contact" : "Add Contact"}
        </button>
        {editing && (
          <button
            className="btn btn-grey"
            type="button"
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {error && <div className="error">{error}</div>}

      <table className="contacts-table">
        <thead>
          <tr>
            <th>Letter</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Other</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>
                No contacts found.
              </td>
            </tr>
          )}
          {contacts.map((c) => (
            <tr key={c._id}>
              <td>{getFirstLetter(c.name)}</td>
              <td>{c.name}</td>
              <td>{c.phone}</td>
              <td>{c.email}</td>
              <td>{c.other}</td>
              <td>
                <button className="btn btn-small" onClick={() => handleEdit(c)}>
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => handleDelete(c._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer>
        <p style={{ color: "#777", marginTop: 32 }}>
          &copy; {new Date().getFullYear()} Contacts created by Yunxiuuu ఇ ◝‿◜ ఇ
        </p>
      </footer>
    </div>
  );
}

export default App;
