import webpush from "web-push";

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { subscription, title, body: messageBody, url, tag } = body;

    if (!subscription || !title) {
      return Response.json({ error: "subscription and title are required" }, { status: 400 });
    }

    const vapidPrivateKey = context.env.VAPID_PRIVATE_KEY;
    const vapidPublicKey = context.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!vapidPrivateKey || !vapidPublicKey) {
      return Response.json({ error: "VAPID keys not configured" }, { status: 500 });
    }

    webpush.setVapidDetails(
      "mailto:seolith.com@gmail.com",
      vapidPublicKey,
      vapidPrivateKey
    );

    const payload = JSON.stringify({
      title,
      body: messageBody ?? "New notification from Walk In",
      url: url ?? "/",
      tag: tag ?? "walk-in-notification",
    });

    const result = await webpush.sendNotification(subscription, payload);

    return Response.json({
      sent: true,
      statusCode: result.statusCode,
      headers: result.headers,
    });
  } catch (err) {
    console.error("Push send error:", err);
    return Response.json(
      {
        error: err instanceof Error ? err.message : "Failed to send notification",
        statusCode: err.statusCode,
      },
      { status: err.statusCode ?? 500 }
    );
  }
}
