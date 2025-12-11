import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");

  const loadContacts = async () => {
    const res = await axios.get("/api/contacts");
    setContacts(res.data);
  };

  const addContact = async () => {
    await axios.post("/api/contacts_add", { name });
    setName("");
    loadContacts();
  };

  const deleteContact = async (id) => {
    await axios.delete(`/api/contacts_delete?id=${id}`);
    loadContacts();
  };

  useEffect(() => {
    loadContacts();
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <h2>📒 联系人系统</h2>

      <input
        value={name}
        placeholder="姓名"
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={addContact}>添加</button>

      <ul>
        {contacts.map((c) => (
          <li key={c.id}>
            {c.name}
            <button onClick={() => deleteContact(c.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
