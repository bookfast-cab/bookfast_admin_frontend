// NotificationPermission.js
import { toast } from 'react-toastify';
import React, { useEffect } from 'react';

let messaging = null;
let getTokenFn = null;
let onMessageFn = null;

if (typeof window !== 'undefined') {
  // Only import firebase messaging in the browser
  const firebaseConfig = require('./firebase-config');
  messaging = firebaseConfig.messaging;
  getTokenFn = require("firebase/messaging").getToken;
  onMessageFn = require("firebase/messaging").onMessage;
}

export const requestPermission = async () => {
  if (typeof window === 'undefined' || !messaging) return;

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getTokenFn(messaging, {
        vapidKey: "BJCAdKSnX4lCgBch_HhKhPirI0yQy0ozQMAZIdtMxgCqPfbHQfnEptiZXkjrRgnStPNCeQBCaB8mzq-rOH-Bwpc",
      });
      localStorage.setItem('fcm_token', token);
    } else {
      console.log("Notification permission not granted.");
    }
  } catch (err) {
    console.error("Error getting permission or token", err);
  }
};

let onTripNotificationCallback = null;

export const listenForMessages = (callback) => {
  if (typeof window === 'undefined' || !messaging || !onMessageFn) return;

  onTripNotificationCallback = callback;

  onMessageFn(messaging, (payload) => {
    const data = payload.data || {};

    if (data.type === 'trip') {
      const tripId = data.id;
      const pickup = data.pickup_address || '—';
      const drop = data.drop_address || '—';
      const total = data.total || '0';
      const customer = `${data.customer_first_name || ''} ${data.customer_last_name || ''}`.trim() || 'N/A';
      const phone = data.customer_phone || 'N/A';

      if (typeof onTripNotificationCallback === 'function') {
        onTripNotificationCallback(data);

        const audio = new Audio('/dispatchNotificationTone.mp3');
        audio.play().catch((err) => console.error("Sound play error:", err));
      } else {
        toast.info(
          <div style={{ fontSize: '14px' }}>
            <div><strong>🛺 New Trip:</strong> #{tripId}</div>
            <div><strong>Customer:</strong> {customer}</div>
            <div><strong>Phone:</strong> {phone}</div>
            <div><strong>Pickup:</strong> {pickup}</div>
            <div><strong>Drop:</strong> {drop}</div>
            <div><strong>Total:</strong> ₹{total}</div>
          </div>
        );

        const audio = new Audio('/tripTone.wav');
        audio.play().catch((err) => console.error("Sound play error:", err));
      }
    }
  });
};
