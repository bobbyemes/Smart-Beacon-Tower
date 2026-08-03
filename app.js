import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// MASUKKAN KREDENSIAL FIREBASE ANDA DI SINI
const firebaseConfig = {
  apiKey: "AIzaSyAKMyJWYI3VOjO2BeizafU7WGjkAECNjpM",
  authDomain: "trial-iot-37b7e.firebaseapp.com",
  databaseURL: "https://trial-iot-37b7e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "trial-iot-37b7e",
  storageBucket: "trial-iot-37b7e.firebasestorage.app",
  messagingSenderId: "735745772122",
  appId: "1:735745772122:web:6f8f58e686045f7019a663",
  measurementId: "G-MD03B76S1J"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase(app);

// Elemen UI
const authBox = document.getElementById("authBox");
const controlBox = document.getElementById("controlBox");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authMsg = document.getElementById("authMsg");
const badge = document.getElementById("statusBadge");

// Elemen Dashboard
const modeStatusText = document.getElementById("modeStatusText");
const modeIndicator = document.getElementById("modeIndicator");
const modeButtons = document.querySelectorAll(".btn-cmd");

// Tombol Login & Logout
loginBtn.onclick = async () => {
  authMsg.textContent = "Memproses...";
  try {
    await signInWithEmailAndPassword(
      auth,
      document.getElementById("emailField").value,
      document.getElementById("passwordField").value
    );
  } catch (e) {
    authMsg.textContent = "Gagal Login: Periksa Email/Password!";
  }
};

logoutBtn.onclick = () => signOut(auth);

// Pantau Status Autentikasi
onAuthStateChanged(auth, (user) => {
  if (user) {
    authBox.style.display = "none";
    controlBox.style.display = "block";
    badge.className = "status-badge online";
    badge.textContent = "Sistem Online";
    startListeners();
  } else {
    authBox.style.display = "block";
    controlBox.style.display = "none";
    badge.className = "status-badge offline";
    badge.textContent = "Sistem Offline";
  }
});

// Mendengarkan Database & Mengirim Perintah
function startListeners() {
  
  // 1. Membaca Status "/mode" dari Firebase secara Realtime
  onValue(ref(db, "/mode"), (snapshot) => {
    let currentMode = snapshot.val();
    if (currentMode === null) currentMode = 0; // Jika database kosong, anggap 0 (Mati)
    updateUI(currentMode);
  });

  // 2. Memberi aksi pada ke-6 tombol Kontrol
  modeButtons.forEach((btn) => {
    btn.onclick = () => {
      // Mengambil angka mode (0-5) dari atribut data-mode di HTML
      let modeDipilih = parseInt(btn.getAttribute("data-mode"));
      // Mengirim angka tersebut ke Firebase
      set(ref(db, "/mode"), modeDipilih);
    };
  });
}

// Fungsi Memperbarui Teks dan Warna Indikator sesuai Mode
function updateUI(mode) {
  let modeName = "TIDAK DIKETAHUI";
  let color = "#ef4444"; // Merah Default

  switch (mode) {
    case 0: modeName = "MATI (OFF)"; color = "#ef4444"; break;
    case 1: modeName = "TES ON (MENYALA TERUS)"; color = "#22c55e"; break; // Hijau
    case 2: modeName = "FL 0.5T - 3.5G"; color = "#38bdf8"; break; // Biru Muda
    case 3: modeName = "FL 0.5T - 4.5G"; color = "#38bdf8"; break;
    case 4: modeName = "FL 0.5T - 2.5G"; color = "#38bdf8"; break;
    case 5: modeName = "FL 1.0T - 3.0G"; color = "#38bdf8"; break;
  }

  // Terapkan ke HTML
  modeStatusText.textContent = modeName;
  modeIndicator.style.backgroundColor = color;
  modeIndicator.style.boxShadow = `0 0 12px ${color}`;
}
