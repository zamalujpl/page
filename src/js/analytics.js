/* Minimal batched analytics with localStorage queue + exponential backoff */
document.addEventListener("DOMContentLoaded", function () {
  const ANALYTICS_ENDPOINT = "https://simple-analytics-m5ck.onrender.com";
  const USER_KEY = "analytics_user_uuid";
  const QUEUE_KEY = "analytics_event_queue_v1";
  const BASE_INTERVAL_MS = 2000;
  const MAX_INTERVAL_MS = 60000;
  const BATCH_SIZE = 25;

  let flushInProgress = false;
  let currentInterval = BASE_INTERVAL_MS;
  let flushTimer = null;

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
    scheduleFlushSoon();
  }

  function scheduleFlushSoon() {
    if (flushInProgress) return;
    if (flushTimer) return;
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flushQueue();
    }, 50); // near-immediate to batch bursts
  }

  function scheduleNextFlush() {
    if (flushTimer) {
      clearTimeout(flushTimer);
    }
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flushQueue();
    }, currentInterval);
    // console.debug("[Analytics] next flush in", currentInterval, "ms");
  }

  async function flushQueue() {
    if (flushInProgress) return;
    const q = loadQueue();
    if (q.length === 0) {
      currentInterval = BASE_INTERVAL_MS;
      scheduleNextFlush();
      return;
    }

    flushInProgress = true;
    let failed = false;
    let anySent = false;

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
            failed = true;
            break;
          } else {
            anySent = true;
          }
        } catch {
          q.unshift(...batch);
          failed = true;
          break;
        }
      }
    } finally {
      saveQueue(q);
      flushInProgress = false;
    }

    if (failed) {
      currentInterval = Math.min(currentInterval * 2, MAX_INTERVAL_MS);
    } else if (anySent) {
      currentInterval = BASE_INTERVAL_MS;
    }

    scheduleNextFlush();
  }

  // Initial scheduling
  scheduleNextFlush();

  // Expose API
  window.__analyticsForceFlush = () => flushQueue();
  window.dispatchEvent(
    new CustomEvent("analyticsLoaded", { detail: trackEvent }),
  );
});
