import React, { useState } from 'react';
import api from '../api';

const emptyMethod = () => ({ type: 'phone', value: '', label: '' });

function ContactForm() {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [methods, setMethods] = useState([emptyMethod()]);

  function addMethod() {
    setMethods(prev => [...prev, emptyMethod()]);
  }
  function removeMethod(index) {
    setMethods(prev => prev.filter((_, i) => i !== index));
  }
  function updateMethod(index, key, value) {
    setMethods(prev => prev.map((m, i) => i === index ? { ...m, [key]: value } : m));
  }

  async function submit(e) {
    e.preventDefault();
    try {
      const payload = { name, note, methods };
      const res = await api.post('/contacts', payload);
      alert('Created: ' + res.data.name);
      setName(''); setNote(''); setMethods([emptyMethod()]);
      // Optionally you could emit an event to refresh list; simple approach: reload window
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to create contact');
    }
  }

  return (
    <form onSubmit={submit} style={{ marginBottom: 20 }}>
      <div>
        <label>Name: <input value={name} onChange={e => setName(e.target.value)} required /></label>
      </div>
      <div>
        <label>Note: <input value={note} onChange={e => setNote(e.target.value)} /></label>
      </div>
      <div>
        <strong>Contact Methods</strong>
        {methods.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
            <select value={m.type} onChange={e => updateMethod(i, 'type', e.target.value)}>
              <option value="phone">phone</option>
              <option value="email">email</option>
              <option value="wechat">wechat</option>
              <option value="address">address</option>
              <option value="other">other</option>
            </select>
            <input placeholder="value" value={m.value} onChange={e => updateMethod(i, 'value', e.target.value)} required />
            <input placeholder="label (home/work)" value={m.label} onChange={e => updateMethod(i, 'label', e.target.value)} />
            <button type="button" onClick={() => removeMethod(i)} disabled={methods.length === 1}>Remove</button>
          </div>
        ))}
        <div style={{ marginTop: 8 }}>
          <button type="button" onClick={addMethod}>Add method</button>
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <button type="submit">Create Contact</button>
      </div>
    </form>
  );
}

export default ContactForm;
