export async function onRequestGet() {
  return Response.json({ csrfToken: "mock-csrf-token" });
}
