import { useEffect, useState } from "react";
import {
  fetchContacts,
  createContact,
  deleteContact,
  toggleFavorite
} from "./api";

function App() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");

  async function load() {
    const data = await fetchContacts();
    setContacts(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function onAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;

    await createContact({
      name,
      phones: [],
      emails: []
    });

    setName("");
    load();
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Contacts App</h1>

      <form onSubmit={onAdd}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Contact name"
        />
        <button type="submit">Add</button>
      </form>

      <hr />

      {contacts.map(c => (
        <div key={c.id} style={{ marginBottom: 10 }}>
          <b>{c.name}</b>{" "}
          <span
            style={{ cursor: "pointer" }}
            onClick={() => toggleFavorite(c.id).then(load)}
          >
            {c.isFavorite ? "★" : "☆"}
          </span>

          <button
            style={{ marginLeft: 10 }}
            onClick={() => deleteContact(c.id).then(load)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;
