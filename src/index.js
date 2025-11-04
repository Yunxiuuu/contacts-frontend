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

