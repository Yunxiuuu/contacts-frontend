import React, { useRef } from 'react';
import api from '../api';

function ImportExport() {
  const fileRef = useRef();

  async function handleExport() {
    try {
      const res = await api.get('/contacts/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'contacts.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error(e);
      alert('Export failed');
    }
  }

  async function handleImport() {
    const file = fileRef.current.files[0];
    if (!file) return alert('Choose a file first');
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await api.post('/contacts/import', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Import result: ' + JSON.stringify(res.data));
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('Import failed');
    }
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <button onClick={handleExport}>Export to Excel</button>
      <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ marginLeft: 8 }} />
      <button onClick={handleImport} style={{ marginLeft: 6 }}>Import from Excel</button>
    </div>
  );
}

export default ImportExport;
