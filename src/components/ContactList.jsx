import React, { useEffect, useState } from 'react';
import api from '../api';

function ContactList() {
  const [contacts, setContacts] = useState([]);
  const [filterBookmarks, setFilterBookmarks] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [filterBookmarks]);

  async function fetchContacts() {
    const res = await api.get('/contacts', { params: filterBookmarks ? { bookmarked: 'true' } : {} });
    setContacts(res.data);
  }

  async function toggleBookmark(id, current) {
    try {
      const res = await api.patch(`/contacts/${id}/bookmark`, { bookmarked: !current });
      setContacts(prev => prev.map(c => c.id === id ? res.data : c));
    } catch (e) {
      console.error(e);
      alert('Failed to update bookmark');
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <label>
          <input type="checkbox" checked={filterBookmarks} onChange={e => setFilterBookmarks(e.target.checked)} />
          Show only bookmarked
        </label>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {contacts.map(c => (
          <li key={c.id} style={{ border: '1px solid #ddd', padding: 10, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{c.name}</strong>
              <button onClick={() => toggleBookmark(c.id, c.bookmarked)}>
                {c.bookmarked ? '★' : '☆'}
              </button>
            </div>
            <div>
              {c.methods && c.methods.length > 0 && (
                <ul>
                  {c.methods.map((m, i) => (
                    <li key={i}>{m.type}: {m.value} {m.label ? `(${m.label})` : ''}</li>
                  ))}
                </ul>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>{c.note}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ContactList;
