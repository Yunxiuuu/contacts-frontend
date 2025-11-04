import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

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

  // 从环境变量读取后端基础 URL（在 Vercel 中设置 REACT_APP_API_BASE）
  // 如果为空字符串，axios 会使用相对路径（不建议生产）
  const API_BASE = process.env.REACT_APP_API_BASE || "";

  // 可选：在控制台打印，确认构建时已注入变量（部署后可以移除）
  // console.log("API_BASE =", API_BASE);

  // 如果有 API_BASE，则把 axios 的 baseURL 设置为它，后续请求就写相对路径更简单
  if (API_BASE) {
    axios.defaults.baseURL = API_BASE;
  }

  // 辅助：根据传入 name/phone 构建查询参数并调用 /api/contacts
  const fetchContacts = async (name = "", phone = "") => {
    try {
      const params = {};
      if (name) params.name = name;
      if (phone) params.phone = phone;

      // 使用 axios.get('/api/contacts', { params })，当 axios.defaults.baseURL 已设置，会自动加上 base
      const res = await axios.get("/api/contacts", { params });
      setContacts(res.data);
    } catch (e) {
      console.error("fetchContacts error:", e);
      setError("Failed to fetch contacts.");
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    try {
      if (editing) {
        await axios.put(`/api/contacts/${editing}`, form);
        setEditing(null);
      } else {
        await axios.post("/api/contacts", form);
      }
      setForm(emptyForm);
      fetchContacts(searchName, searchPhone);
    } catch (err) {
      console.error("save error:", err);
      setError(err.response?.data?.error || "Error saving!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await axios.delete(`/api/contacts/${id}`);
        fetchContacts(searchName, searchPhone);
      } catch (err) {
        console.error("delete error:", err);
        setError("Failed to delete.");
      }
    }
  };

  const handleEdit = (contact) => {
    setForm(contact);
    setEditing(contact._id);
  };

  const handleClearAll = async () => {
    if (window.confirm("Clear all contacts? This cannot be undone!")) {
      try {
        await axios.delete("/api/contacts");
        fetchContacts();
      } catch (err) {
        console.error("clear all error:", err);
        setError("Failed to clear contacts.");
      }
    }
  };

  const handleSearch = () => {
    fetchContacts(searchName, searchPhone);
  };

  const handleReset = () => {
    setSearchName("");
    setSearchPhone("");
    fetchContacts();
  };

  const getFirstLetter = (name) => {
    return (name && name[0] ? name[0].toUpperCase() : "#");
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
        <button className="btn" onClick={handleSearch}>Search</button>
        <button className="btn btn-grey" onClick={handleReset}>Reset</button>
        <button className="btn btn-danger" onClick={handleClearAll}>Clear All</button>
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
        {editing ? (
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
        ) : null}
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
          &copy; {new Date().getFullYear()}  Contacts created by Yunxiuuu ఇ ◝‿◜ ఇ
        </p>
      </footer>
    </div>
  );
}

export default App;
