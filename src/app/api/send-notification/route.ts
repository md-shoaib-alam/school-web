import admin from "firebase-admin";
import { Message } from "firebase-admin/messaging";
import { NextRequest, NextResponse } from "next/server";

// Initialize Firebase Admin SDK using service account key
if (!admin.apps.length) {
  try {
    const serviceAccount = require("@/service_key.json");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (err: any) {
    console.error("Firebase Admin initialization error:", err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, title, message, link } = await request.json();

    if (!token || !title || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (token, title, message)" },
        { status: 400 }
      );
    }

    const payload: Message = {
      token,
      notification: {
        title: title,
        body: message,
      },
      webpush: link
        ? {
            fcmOptions: {
              link,
            },
          }
        : undefined,
    };

    const response = await admin.messaging().send(payload);
    return NextResponse.json({ success: true, message: "Notification sent!", messageId: response });
  } catch (error: any) {
    console.error("FCM Send Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send notification" },
      { status: 500 }
    );
  }
}
