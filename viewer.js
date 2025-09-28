// viewer.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD_FH-65A526z8g9iGhSYKulS4yiv5e6Ys",
  authDomain: "mturk-monitor.firebaseapp.com",
  projectId: "mturk-monitor",
  storageBucket: "mturk-monitor.appspot.com", // recommended bucket hostname
  messagingSenderId: "285174080989",
  appId: "1:285174080989:web:e1f607e6a5f80463278234"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// DOM refs
const tableBody = document.querySelector("#hits-body");
const soundUrl  = "https://www.allbyjohn.com/sounds/mturkscanner/lessthan15Short.mp3";
let knownIds = new Set();

function playSound() {
  const audio = new Audio(soundUrl);
  audio.volume = 0.7;
  audio.play().catch(() => {});
}

function renderTable(hits) {
  tableBody.innerHTML = "";
  hits.sort((a, b) => new Date(b.acceptedAt ?? 0) - new Date(a.acceptedAt ?? 0));
  for (const h of hits) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${h.user || "-"}</td>
      <td>${h.workerId || "-"}</td>
      <td>${h.requester || "-"}</td>
      <td>${h.title || "-"}</td>
      <td>${h.reward || 0}</td>
      <td>${h.acceptedAt ? new Date(h.acceptedAt).toLocaleString() : "-"}</td>
    `;
    tableBody.appendChild(tr);
  }
}

// realtime listener
onSnapshot(collection(db, "hits"), (snapshot) => {
  const hits = [];
  const newIds = new Set();

  snapshot.forEach(doc => {
    const data = doc.data();
    hits.push(data);
    if (data.assignmentId) newIds.add(data.assignmentId);
  });

  if (knownIds.size > 0) {
    const added = Array.from(newIds).filter(id => !knownIds.has(id));
    if (added.length > 0) playSound();
  }

  knownIds = newIds;
  renderTable(hits);
  // console.log("✅ Live update:", hits.length, "active HIT(s)");
});
