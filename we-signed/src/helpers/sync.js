import { getAllData } from "../db.js";

export default async function immediateSync() {
  const pendingSessions = await getAllData("sessions");
  const pendingSignins = await getAllData("pending");

  const unsyncedSessions = pendingSessions.filter(s => !s.synced);
  const unsyncedSignins = pendingSignins.filter(s => !s.synced);

  if (unsyncedSessions.length === 0 && unsyncedSignins.length === 0) {
    console.log("Nothing to sync");
    return;
  }

  try {
    // Send to your backend
    const res = await axios.post("/api/sync", {
      sessions: unsyncedSessions,
      signins: unsyncedSignins,
    });

    if (res.status === 200) {
      // Mark as synced or clear
      for (let s of unsyncedSessions) {
        s.synced = true;
        await db.put("sessions", s);
      }
      for (let s of unsyncedSignins) {
        s.synced = true;
        await db.put("pending", s);
      }
      console.log("Sync successful");
    }
  } catch (err) {
    console.error("Sync failed", err);
  }
}