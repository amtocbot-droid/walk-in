"use client";

import { useEffect, useState } from "react";
import {
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  isPushSubscribed,
  PushSubscription,
} from "@/lib/push-notifications";
import { trackEvent } from "@/lib/telemetry";

export default function PushNotificationToggle() {
  const [subscribed, setSubscribed] = useState(false);
  const [supported, setSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window
    );

    if (supported) {
      isPushSubscribed().then(setSubscribed);
    }
  }, [supported]);

  const handleToggle = async () => {
    if (!supported) return;

    setLoading(true);
    try {
      if (subscribed) {
        await unsubscribeFromPush();
        setSubscribed(false);
        setSubscription(null);
        trackEvent("push.unsubscribed");
      } else {
        const permission = await requestNotificationPermission();
        if (permission === "granted") {
          const sub = await subscribeToPush();
          if (sub) {
            setSubscribed(true);
            setSubscription(sub);
            trackEvent("push.subscribed", { endpoint: sub.endpoint.slice(0, 50) });
          }
        }
      }
    } catch (err) {
      console.error("Push toggle failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!subscription) return;

    setLoading(true);
    try {
      const res = await fetch("/api/v1/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });

      if (res.ok) {
        trackEvent("push.test_sent");
      } else {
        console.error("Test notification failed:", res.status);
      }
    } catch (err) {
      console.error("Test notification error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!supported) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm transition-colors ${
          subscribed
            ? "bg-sky-500 text-white hover:bg-sky-600"
            : "bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        {subscribed ? "🔔 Notifications On" : "🔕 Enable Notifications"}
      </button>
      {subscribed && (
        <button
          onClick={handleTest}
          disabled={loading}
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Test
        </button>
      )}
    </div>
  );
}
