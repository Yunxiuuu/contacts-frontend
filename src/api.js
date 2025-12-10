const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

export async function fetchContacts() {
  const res = await fetch(`${API_BASE}/api/contacts`);
  return res.json();
}

export async function createContact(data) {
  const res = await fetch(`${API_BASE}/api/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteContact(id) {
  await fetch(`${API_BASE}/api/contacts/${id}`, {
    method: "DELETE"
  });
}

export async function toggleFavorite(id) {
  const res = await fetch(`${API_BASE}/api/contacts/${id}/favorite`, {
    method: "PATCH"
  });
  return res.json();
}
