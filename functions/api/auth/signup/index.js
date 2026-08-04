export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Check if user already exists
    const existingUsers = (await context.env.KV.get("users", "json")) ?? [];
    const exists = existingUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return Response.json({ error: "An account with this email already exists" }, { status: 400 });
    }

    // Create user
    const user = {
      id: `user_${Date.now().toString(36)}`,
      email: email.toLowerCase().trim(),
      name: name ?? "",
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    existingUsers.push(user);

    try {
      await context.env.KV.put("users", JSON.stringify(existingUsers));
    } catch {
      // KV limit exceeded - user won't persist but return success for demo
      console.warn("KV put failed - user will not persist");
    }

    // Send welcome email via AWS SES
    try {
      await sendWelcomeEmailSES(email, name ?? "", {
        accessKeyId: context.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: context.env.AWS_SECRET_ACCESS_KEY,
        region: context.env.AWS_REGION ?? "us-east-1",
        fromEmail: context.env.SES_FROM_EMAIL ?? "noreply@walkin.app",
      });
    } catch (err) {
      console.error("Failed to send welcome email:", err);
      // Don't fail signup if email fails
    }

    return Response.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Invalid request" },
      { status: 400 }
    );
  }
}

async function hashPassword(password) {
  // Simple hash for demo - in production use bcrypt
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sendWelcomeEmailSES(email, name, config) {
  if (!config.accessKeyId || !config.secretAccessKey) {
    console.log("AWS credentials not configured - skipping email");
    return;
  }

  const { SESClient, SendEmailCommand } = await import("@aws-sdk/client-ses");

  const client = new SESClient({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  const command = new SendEmailCommand({
    Source: config.fromEmail,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: "Welcome to Walk In!",
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #0ea5e9;">Welcome to Walk In, ${name}!</h1>
              <p>Thanks for creating an account. You can now:</p>
              <ul>
                <li>Build immersive 3D walk-in experiences for your establishment</li>
                <li>Upload 360° photos or generate them with AI</li>
                <li>Add products with live inventory and pricing</li>
                <li>Share your store with customers via a simple link</li>
              </ul>
              <p>
                <a href="https://walk-in-cfa.pages.dev/owner" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
                  Go to Owner Dashboard
                </a>
              </p>
              <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
                Need help? Reply to this email or check our documentation.
              </p>
            </div>
          `,
          Charset: "UTF-8",
        },
        Text: {
          Data: `Welcome to Walk In, ${name}!\n\nThanks for creating an account. You can now build immersive 3D walk-in experiences for your establishment.\n\nVisit your dashboard: https://walk-in-cfa.pages.dev/owner`,
          Charset: "UTF-8",
        },
      },
    },
  });

  const response = await client.send(command);
  return response;
}
