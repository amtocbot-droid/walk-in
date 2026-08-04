export async function onRequestGet() {
  return Response.json({ error: "Authentication is not available in demo mode" }, { status: 501 });
}

export async function onRequestPost() {
  return Response.json({ error: "Authentication is not available in demo mode" }, { status: 501 });
}
