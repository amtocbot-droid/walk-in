import webpush from "web-push";

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { subscription } = body;

    if (!subscription) {
      return Response.json({ error: "subscription is required" }, { status: 400 });
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
      title: "Test Notification",
      body: "Push notifications are working! 🎉",
      url: "/demo",
      tag: "test-notification",
    });

    const result = await webpush.sendNotification(subscription, payload);

    return Response.json({
      sent: true,
      statusCode: result.statusCode,
    });
  } catch (err) {
    console.error("Push test error:", err);
    return Response.json(
      {
        error: err instanceof Error ? err.message : "Failed to send test notification",
        statusCode: err.statusCode,
      },
      { status: err.statusCode ?? 500 }
    );
  }
}
