export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const data = await context.env.KV.get(`user:${userId}`, "json");
    return Response.json({ data: data ?? null });
  } catch {
    return Response.json({ data: null });
  }
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { userId, data } = body;

    if (!userId || !data) {
      return Response.json({ error: "userId and data are required" }, { status: 400 });
    }

    try {
      await context.env.KV.put(`user:${userId}`, JSON.stringify(data));
      return Response.json({ saved: true });
    } catch {
      // KV limit exceeded - return success but data won't persist.
      return Response.json({ saved: false, warning: "Storage limit exceeded" });
    }
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Invalid request" },
      { status: 400 }
    );
  }
}
