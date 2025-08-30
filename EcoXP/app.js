// ================= Firebase Config =================
const firebaseConfig = {
    apiKey: "AIzaSyAcvQ5_CCykYCxvy3Ah-Cog86ib5FyyT_0",
    authDomain: "ecoxp-91831.firebaseapp.com",
    projectId: "ecoxp-91831",
    storageBucket: "ecoxp-91831.appspot.com",
    messagingSenderId: "978531893168",
    appId: "1:978531893168:web:7ecec933161717be2c6075"
};

let auth, db, currentUser = null, progressChart = null;

function initializeFirebase() {
    if (!firebase) return false;
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    db.enablePersistence().catch(() => {});
    return true;
}

document.addEventListener("DOMContentLoaded", () => {
    if (initializeFirebase()) initApp();
});

// ================= DOM Elements =================
const googleSignInBtn = document.getElementById("googleSignIn");
const emailForm = document.getElementById("emailForm");
const signupForm = document.getElementById("signupForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const toggleFormBtn = document.getElementById("toggleForm");
const signOutBtn = document.getElementById("signOut");
const pickupForm = document.getElementById("pickupForm");
const pickupHistory = document.getElementById("pickupHistoryList");
const isDashboard = window.location.pathname.includes("dashboard");

function initApp() {
    isDashboard ? initDashboard() : initLandingPage();
}

/* ================= Landing Page ================= */
function initLandingPage() {
    if (!googleSignInBtn || !emailForm) return;

    googleSignInBtn.addEventListener("click", signInWithGoogle);
    emailForm.addEventListener("submit", handleEmailLogin);
    signupForm.addEventListener("submit", handleSignup);
    toggleFormBtn.addEventListener("click", toggleAuthMode);

    auth.onAuthStateChanged((user) => {
        if (user) window.location.href = "dashboard.html";
    });
}

function signInWithGoogle(e) {
    e.preventDefault();
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(() => window.location.href = "dashboard.html")
        .catch(() => auth.signInWithRedirect(provider));
}

function handleEmailLogin(e) {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    auth.signInWithEmailAndPassword(email, password)
        .then(() => window.location.href = "dashboard.html")
        .catch(err => showNotification(err.message, "error"));
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    auth.createUserWithEmailAndPassword(email, password)
        .then(cred => {
            return db.collection("users").doc(cred.user.uid).set({
                email,
                displayName: name,
                totalPoints: 0,
                totalPickups: 0,
                totalWeight: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => window.location.href = "dashboard.html")
        .catch(err => showNotification(err.message, "error"));
}

function toggleAuthMode(e) {
    e.preventDefault();
    emailForm.classList.toggle("hidden");
    signupForm.classList.toggle("hidden");
    toggleFormBtn.textContent =
        signupForm.classList.contains("hidden")
            ? "Sign up"
            : "Back to login";
}

/* ================= Dashboard ================= */
function initDashboard() {
    if (!signOutBtn || !pickupForm) return;

    signOutBtn.addEventListener("click", () =>
        auth.signOut().then(() => (window.location.href = "index.html"))
    );

    pickupForm.addEventListener("submit", handlePickupSubmission);

    const dateInput = document.getElementById("pickupDate");
    if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            loadDashboardData();
        } else {
            window.location.href = "index.html";
        }
    });
}

async function loadDashboardData() {
    const stats = await loadUserStats();
    await loadPickupHistory();
    await loadLeaderboard();
    initProgressChart();
    checkAchievements(stats);
}

/* ================= User Stats ================= */
async function loadUserStats() {
    const userRef = db.collection("users").doc(currentUser.uid);
    const snap = await userRef.get();

    let data;
    if (!snap.exists) {
        data = {
            email: currentUser.email,
            displayName:
                currentUser.displayName || currentUser.email.split("@")[0],
            totalPoints: 0,
            totalPickups: 0,
            totalWeight: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await userRef.set(data);
    } else {
        data = snap.data();
    }

    updateStatsDisplay(data);
    return data;
}

function updateStatsDisplay(userData) {
    document.getElementById("userName").textContent =
        userData.displayName || "User";
    document.getElementById("userEmail").textContent = userData.email;
    document.getElementById("totalPoints").textContent =
        userData.totalPoints || 0;
    document.getElementById("totalPickups").textContent =
        userData.totalPickups || 0;
    document.getElementById("totalWeight").textContent =
        (userData.totalWeight || 0) + " kg";
}

/* ================= Pickup History ================= */
async function loadPickupHistory() {
    const qs = await db
        .collection("users")
        .doc(currentUser.uid)
        .collection("pickups")
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();

    if (!pickupHistory) return;
    if (qs.empty) {
        pickupHistory.innerHTML = "<div>No pickups yet</div>";
        return;
    }

    pickupHistory.innerHTML = qs.docs.map(doc => renderPickupItem(doc)).join("");
}

function renderPickupItem(doc) {
    const data = doc.data();
    const date = data.pickupDate
        ? new Date(data.pickupDate).toLocaleDateString()
        : "N/A";
    const status = data.completed ? "completed" : "scheduled";
    const qr = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${doc.id}" alt="QR Code"/>`;
    return `
      <div class="pickup-item">
        <div>
          <h4>${data.materialType}</h4>
          <p>${data.quantity} kg • ${date}</p>
        </div>
        <div>
          ${qr}
          <span class="pickup-status ${status}">${status}</span>
        </div>
      </div>`;
}

async function handlePickupSubmission(e) {
    e.preventDefault();
    const formData = new FormData(pickupForm);
    const pickupData = {
        materialType: formData.get("materialType"),
        quantity: parseFloat(formData.get("quantity")),
        pickupDate: formData.get("pickupDate"),
        notes: formData.get("notes"),
        completed: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db
        .collection("users")
        .doc(currentUser.uid)
        .collection("pickups")
        .add(pickupData);

    await updateUserStats(pickupData.quantity);

    pickupForm.reset();
    loadDashboardData();
    showNotification("Pickup scheduled! QR generated.", "success");
}

async function updateUserStats(weight) {
    const userRef = db.collection("users").doc(currentUser.uid);
    await userRef.update({
        totalPickups: firebase.firestore.FieldValue.increment(1),
        totalWeight: firebase.firestore.FieldValue.increment(weight),
        totalPoints: firebase.firestore.FieldValue.increment(Math.floor(weight)) // 1 point = 1kg
    });
}

/* ================= Leaderboard ================= */
async function loadLeaderboard() {
    const qs = await db
        .collection("users")
        .orderBy("totalPoints", "desc")
        .limit(5)
        .get();
    const board = document.getElementById("leaderboard");
    if (!board) return;

    board.innerHTML = qs.docs
        .map((doc, i) => {
            const u = doc.data();
            return `<div class="leaderboard-item">
                <span>${i + 1}. ${u.displayName || u.email}</span>
                <span>${u.totalPoints} pts</span>
            </div>`;
        })
        .join("");
}

/* ================= Achievements ================= */
function checkAchievements(stats) {
    const badges = document.getElementById("badges");
    if (!badges) return;
    badges.innerHTML = "";

    if (stats.totalPickups >= 1)
        badges.innerHTML += `<div class="badge unlocked">First Pickup</div>`;
    if (stats.totalWeight >= 50)
        badges.innerHTML += `<div class="badge unlocked">50kg Recycler</div>`;
    if (stats.totalPoints >= 100)
        badges.innerHTML += `<div class="badge unlocked">Century Points</div>`;
}

/* ================= Chart ================= */
async function initProgressChart() {
    const ctx = document.getElementById("progressChart");
    if (!ctx) return;

    const months = [];
    const weights = Array(6).fill(0);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const qs = await db
        .collection("users")
        .doc(currentUser.uid)
        .collection("pickups")
        .where("createdAt", ">=", sixMonthsAgo)
        .get();

    qs.forEach(doc => {
        const d = doc.data();
        if (d.createdAt) {
            const date = d.createdAt.toDate();
            const monthDiff =
                (new Date().getMonth() - date.getMonth() + 12) % 12;
            if (monthDiff < 6) {
                weights[5 - monthDiff] += d.quantity;
            }
        }
    });

    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push(date.toLocaleDateString("en-US", { month: "short" }));
    }

    if (progressChart) progressChart.destroy();
    progressChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: months,
            datasets: [
                {
                    label: "Recycled (kg)",
                    data: weights,
                    borderColor: "#4caf50",
                    backgroundColor: "rgba(76,175,80,0.2)",
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

/* ================= Notifications ================= */
function showNotification(msg, type = "info") {
    const n = document.createElement("div");
    n.className = `notification ${type}`;
    n.textContent = msg;
    n.style.cssText =
        "position:fixed;top:20px;right:20px;padding:1rem;border-radius:8px;color:#fff;z-index:9999;";
    n.style.backgroundColor =
        type === "success"
            ? "#4caf50"
            : type === "error"
            ? "#f44336"
            : "#2196f3";
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 3000);
}
