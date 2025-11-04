import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
<!-- index.html -->
<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Contacts</title></head>
  <body>
    <h1>Contacts</h1>
    <ul id="list"></ul>
    <script src="index.js"></script>
  </body>
</html>
// index.js
async function fetchContacts() {
  try {
    // 相对路径 -> 会被 vercel rewrites 转发到你的后端
    const res = await fetch('/api/contacts');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderList(data);
  } catch (err) {
    console.error('请求失败：', err);
    document.getElementById('list').innerHTML = `<li style="color:red">请求失败：${err.message}</li>`;
  }
}

function renderList(items = []) {
  const ul = document.getElementById('list');
  ul.innerHTML = '';
  if (!items.length) {
    ul.innerHTML = '<li>暂无联系人</li>';
    return;
  }
  items.forEach(it => {
    const li = document.createElement('li');
    li.textContent = `${it.name} — ${it.phone || ''}`;
    ul.appendChild(li);
  });
}

fetchContacts();
