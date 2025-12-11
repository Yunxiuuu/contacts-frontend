import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  other: "",
  bookmark: false,
  contactMethods: []
};

function App() {
  const [form, setForm] = useState(emptyForm);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [editing, setEditing] = useState(null);
  const [newContactMethod, setNewContactMethod] = useState({ type: "wechat", label: "", value: "" });
  const [showBookmarkOnly, setShowBookmarkOnly] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async (name = "", phone = "", bookmark = false) => {
    setLoading(true);
    setError("");
    try {
      let url = `http://localhost:5000/api/contacts?`;
      if (name) url += `name=${encodeURIComponent(name)}&`;
      if (phone) url += `phone=${encodeURIComponent(phone)}&`;
      if (bookmark) url += `bookmark=true`;
      
      const res = await axios.get(url);
      setContacts(res.data);
    } catch (e) {
      console.error('获取联系人失败:', e);
      setError(`无法连接到服务器: ${e.message}`);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    try {
      if (editing) {
        await axios.put(`http://localhost:5000/api/contacts/${editing}`, form);
        setSuccess("Contact updated successfully!");
        setEditing(null);
        setShowAddForm(false);
      } else {
        await axios.post("http://localhost:5000/api/contacts", form);
        setSuccess("Contact added successfully!");
        setShowAddForm(false);
      }
      setForm(emptyForm);
      fetchContacts(searchName, searchPhone, showBookmarkOnly);
    } catch (e) {
      setError(e.response?.data?.error || "Error saving contact.");
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await axios.delete(`http://localhost:5000/api/contacts/${id}`);
        setSuccess("Contact deleted successfully!");
        fetchContacts(searchName, searchPhone, showBookmarkOnly);
      } catch (e) {
        setError("Failed to delete contact.");
      }
    }
  };

  const handleEdit = (contact) => {
    setForm(contact);
    setEditing(contact._id);
    setShowAddForm(true);
  };

  const handleSearch = () => {
    fetchContacts(searchName, searchPhone, showBookmarkOnly);
  };

  const handleReset = () => {
    setSearchName("");
    setSearchPhone("");
    setShowBookmarkOnly(false);
    fetchContacts();
  };

  const addContactMethod = () => {
    if (!newContactMethod.value.trim()) {
      setError("Please enter a value for the contact method.");
      return;
    }
    setForm(prev => ({
      ...prev,
      contactMethods: [...prev.contactMethods, { ...newContactMethod }]
    }));
    setNewContactMethod({ type: "wechat", label: "", value: "" });
  };

  const removeContactMethod = (index) => {
    setForm(prev => ({
      ...prev,
      contactMethods: prev.contactMethods.filter((_, i) => i !== index)
    }));
  };

  const toggleBookmark = async (id, currentBookmark) => {
    try {
      await axios.patch(`http://localhost:5000/api/contacts/${id}/bookmark`, {
        bookmark: !currentBookmark
      });
      fetchContacts(searchName, searchPhone, showBookmarkOnly);
    } catch (e) {
      setError("Failed to update bookmark.");
    }
  };

  const handleBookmarkFilter = () => {
    const newFilter = !showBookmarkOnly;
    setShowBookmarkOnly(newFilter);
    fetchContacts(searchName, searchPhone, newFilter);
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await axios.get('http://localhost:5000/api/contacts/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contacts_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSuccess(`Exported ${contacts.length} contacts successfully!`);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Export failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setError("Please select an Excel file (.xlsx or .xls)");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const base64Data = e.target.result.split(',')[1];
        
        const response = await axios.post('http://localhost:5000/api/contacts/import', {
          fileData: base64Data
        });
        
        if (response.data.success) {
          setSuccess(`Successfully imported ${response.data.imported} contacts!`);
          fetchContacts(searchName, searchPhone, showBookmarkOnly);
        } else {
          setError('Import failed: ' + response.data.error);
        }
      } catch (error) {
        console.error('Import error:', error);
        setError('Import failed: ' + (error.response?.data?.error || error.message));
      } finally {
        setLoading(false);
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      setError("Failed to read file");
      setLoading(false);
      event.target.value = '';
    };

    reader.readAsDataURL(file);
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to delete ALL contacts? This cannot be undone!")) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete("http://localhost:5000/api/contacts");
      setSuccess("All contacts have been cleared.");
      fetchContacts();
    } catch (e) {
      setError("Failed to clear contacts.");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        '姓名': '张三',
        '主要电话': '13800138000',
        '邮箱': 'zhangsan@example.com',
        '其他信息': '同事',
        '书签': '是',
        '联系方式1-类型': 'email',
        '联系方式1-标签': '工作邮箱',
        '联系方式1-值': 'work@example.com'
      },
      {
        '姓名': '李四',
        '主要电话': '13900139000',
        '邮箱': 'lisi@example.com',
        '其他信息': '朋友',
        '书签': '否',
        '联系方式1-类型': 'phone',
        '联系方式1-标签': '家庭电话',
        '联系方式1-值': '021-12345678'
      }
    ];

    try {
      const XLSX = window.XLSX;
      if (!XLSX) {
        setError("Excel library not loaded. Please refresh the page.");
        return;
      }
      
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts Template");
      
      XLSX.writeFile(workbook, 'contacts_template.xlsx');
      setSuccess("Template downloaded successfully!");
    } catch (error) {
      console.error('Template download failed:', error);
      setError("Failed to download template. Please try again.");
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowAddForm(false);
    setError("");
  };

  const handleAddNew = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowAddForm(true);
  };

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setSelectedContact(null);
    setShowDetailModal(false);
  };

  const getMethodIcon = (type) => {
    switch(type) {
      case 'wechat': return '💬';
      case 'whatsapp': return '💚';
      case 'telegram': return '📡';
      case 'address': return '🏠';
      default: return '📋';
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Contact Management      ఇ ◝‿◜ ఇ</h1>
        <div className="stats">
          <span className="stat-item">Total: {contacts.length}</span>
          <span className="stat-item">Bookmarked: {contacts.filter(c => c.bookmark).length}</span>
        </div>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3>Search & Filter</h3>
            <div className="search-box">
              <input
                placeholder="Search by name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <input
                placeholder="Search by phone"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <div className="search-actions">
                <button className="btn btn-search" onClick={handleSearch}>
                  Search
                </button>
                <button className="btn btn-secondary" onClick={handleReset}>
                  Reset
                </button>
              </div>
            </div>

            <div className="filter-section">
              <button 
                className={`filter-btn ${showBookmarkOnly ? 'active' : ''}`}
                onClick={handleBookmarkFilter}
              >
                <span className="star-icon">★</span> Show Bookmarks Only
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Data Management</h3>
            <div className="data-actions">
              <button 
                className="btn btn-export"
                onClick={handleExport}
                disabled={loading || contacts.length === 0}
              >
                Export Excel
              </button>
              
              <label className="btn btn-import">
                Import Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImport}
                  disabled={loading}
                  style={{ display: 'none' }}
                />
              </label>
              
              <button 
                className="btn btn-clear"
                onClick={handleClearAll}
                disabled={contacts.length === 0}
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Add New Contact</h3>
            <button 
              className="btn btn-primary btn-add"
              onClick={handleAddNew}
              disabled={showAddForm}
            >
              + Add New Contact
            </button>
          </div>
        </aside>

        <main className="main-content">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {showAddForm && (
            <div className="form-overlay">
              <div className="form-modal">
                <div className="form-header">
                  <h3>{editing ? "Edit Contact" : "Add New Contact"}</h3>
                  <button className="close-btn" onClick={handleCancel}>×</button>
                </div>
                
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter full name"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Phone *</label>
                      <input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        placeholder="Enter phone number"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Other Info</label>
                      <input
                        type="text"
                        name="other"
                        value={form.other}
                        onChange={handleChange}
                        placeholder="Additional information"
                      />
                    </div>
                  </div>

                  <div className="additional-methods">
                    <h4>Additional Contact Methods</h4>
                    {form.contactMethods.map((method, index) => (
                      <div key={index} className="method-item">
                        <span className="method-icon">{getMethodIcon(method.type)}</span>
                        <div className="method-info">
                          <span className="method-type">{method.type}</span>
                          {method.label && <span className="method-label">({method.label})</span>}
                          <span className="method-value">{method.value}</span>
                        </div>
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => removeContactMethod(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    
                    <div className="add-method-form">
                      <select
                        value={newContactMethod.type}
                        onChange={(e) => setNewContactMethod(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="wechat">WeChat</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="telegram">Telegram</option>
                        <option value="address">Address</option>
                        <option value="other">Other</option>
                      </select>
                      <input
                        placeholder="Value (Optional)"
                        value={newContactMethod.value}
                        onChange={(e) => setNewContactMethod(prev => ({ ...prev, value: e.target.value }))}
                      />
                      <input
                        placeholder="Label (Optional)"
                        value={newContactMethod.label}
                        onChange={(e) => setNewContactMethod(prev => ({ ...prev, label: e.target.value }))}
                      />
                      <button
                        type="button"
                        className="btn btn-small"
                        onClick={addContactMethod}
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="form-footer">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={form.bookmark}
                        onChange={(e) => setForm(prev => ({ ...prev, bookmark: e.target.checked }))}
                      />
                      <span className="checkmark"></span>
                      Add to Bookmarks
                    </label>
                    
                    <div className="form-actions">
                      <button className="btn btn-primary" type="submit">
                        {editing ? "Update Contact" : "Save Contact"}
                      </button>
                      <button className="btn btn-secondary" type="button" onClick={handleCancel}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showDetailModal && selectedContact && (
            <div className="form-overlay">
              <div className="form-modal" onClick={(e) => e.stopPropagation()}>
                <div className="form-header">
                  <h3>Contact Details</h3>
                  <button className="close-btn" onClick={handleCloseDetail}>×</button>
                </div>
                
                <div className="contact-detail-content">
                  <div className="detail-section">
                    <div className="detail-item">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">{selectedContact.name}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{selectedContact.phone}</span>
                    </div>
                    
                    {selectedContact.email && (
                      <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{selectedContact.email}</span>
                      </div>
                    )}
                    
                    {selectedContact.other && (
                      <div className="detail-item">
                        <span className="detail-label">Other Info:</span>
                        <span className="detail-value">{selectedContact.other}</span>
                      </div>
                    )}
                    
                    <div className="detail-item">
                      <span className="detail-label">Bookmarked:</span>
                      <span className="detail-value">
                        {selectedContact.bookmark ? 'Yes ★' : 'No'}
                      </span>
                    </div>
                  </div>
                  
                  {selectedContact.contactMethods && selectedContact.contactMethods.length > 0 && (
                    <div className="detail-section">
                      <h4 className="detail-section-title">Additional Contact Methods</h4>
                      <div className="methods-detail-list">
                        {selectedContact.contactMethods.map((method, idx) => (
                          <div key={idx} className="method-detail-item">
                            <span className="method-detail-icon">{getMethodIcon(method.type)}</span>
                            <div className="method-detail-info">
                              <span className="method-detail-type">{method.type}:</span>
                              {method.label && (
                                <span className="method-detail-label">({method.label})</span>
                              )}
                              <span className="method-detail-value">{method.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="detail-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        handleEdit(selectedContact);
                        handleCloseDetail();
                      }}
                    >
                      Edit Contact
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={handleCloseDetail}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="contacts-section">
            <div className="section-header">
              <h2>Contacts</h2>
              {loading && <div className="loading-spinner"></div>}
            </div>
            
            {contacts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📇</div>
                <h3>No contacts found</h3>
                <p>Start by adding your first contact or import from Excel</p>
                <button className="btn btn-primary" onClick={handleAddNew}>
                  + Add First Contact
                </button>
              </div>
            ) : (
              <div className="contacts-grid">
                {contacts.map((contact) => (
                  <div 
                    key={contact._id} 
                    className={`contact-card ${contact.bookmark ? 'bookmarked' : ''}`}
                    onClick={(e) => {
                      // 检查点击的是否是按钮或按钮内的元素
                      const isButton = e.target.closest('button') || 
                                      e.target.tagName === 'BUTTON' || 
                                      e.target.closest('.card-actions') ||
                                      e.target.closest('.card-footer');
                      if (!isButton) {
                        handleViewContact(contact);
                      }
                    }}
                  >
                    <div className="card-header">
                      <div className="contact-info">
                        <h3 className="contact-name">{contact.name}</h3>
                        <div className="contact-phone">
                          <span className="phone-icon">📱</span>
                          {contact.phone}
                        </div>
                        {contact.email && (
                          <div className="contact-email">
                            <span className="email-icon">📧</span>
                            {contact.email}
                          </div>
                        )}
                        {contact.other && (
                          <div className="contact-info-item">
                            <span className="info-icon">📝</span>
                            {contact.other}
                          </div>
                        )}
                      </div>
                      <div className="card-actions">
                        <button 
                          className={`bookmark-btn ${contact.bookmark ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(contact._id, contact.bookmark);
                          }}
                          title={contact.bookmark ? "Remove bookmark" : "Add bookmark"}
                        >
                          ★
                        </button>
                      </div>
                    </div>
                    
                    {contact.contactMethods && contact.contactMethods.length > 0 && (
                      <div className="additional-methods-preview">
                        <div className="methods-label">Additional:</div>
                        <div className="methods-list">
                          {contact.contactMethods.map((method, idx) => (
                            <div key={idx} className="method-tag">
                              {getMethodIcon(method.type)} {method.type}
                              {method.label && ` (${method.label})`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="card-footer">
                      <button 
                        className="btn btn-edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(contact);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(contact._id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Contacts created by Yunxiuuu ఇ ◝‿◜ ఇ</p>
      </footer>
    </div>
  );
}

export default App;
