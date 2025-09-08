/* Minimal batched analytics with localStorage queue */

const ANALYTICS_ENDPOINT = "http://localhost:8080/";
const USER_KEY = "analytics_user_uuid";
const QUEUE_KEY = "analytics_event_queue_v1";
const BATCH_INTERVAL_MS = 2000;
const BATCH_SIZE = 25;

let flushInProgress = false;

function getUserUUID() {
  try {
    let id = localStorage.getItem(USER_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
              const r = (Math.random() * 16) | 0;
              const v = c === "x" ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            });
      localStorage.setItem(USER_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

const USER_UUID = getUserUUID();

function loadQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveQueue(q) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch {
    /* ignore */
  }
}

function trackEvent(eventType = "visit") {
  const payload = {
    event_type: eventType || "visit",
    user_uuid: USER_UUID,
    path: window.location.pathname || "/",
    referrer: document.referrer || "",
    user_agent: navigator.userAgent || "",
    ts: new Date().toISOString(),
  };

  const q = loadQueue();
  q.push(payload);
  saveQueue(q);
  console.log("[AnalyticsQueue] size", q.length);
}

async function flushQueue() {
  if (flushInProgress) return;
  const q = loadQueue();
  if (q.length === 0) return;
  flushInProgress = true;

  try {
    while (q.length) {
      const batch = q.splice(0, BATCH_SIZE);
      try {
        const res = await fetch(ANALYTICS_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({ events: batch }),
        });
        if (!res.ok) {
          q.unshift(...batch);
          break;
        }
      } catch {
        q.unshift(...batch);
        break;
      }
    }
  } finally {
    saveQueue(q);
    flushInProgress = false;
  }
}

setInterval(flushQueue, BATCH_INTERVAL_MS);
