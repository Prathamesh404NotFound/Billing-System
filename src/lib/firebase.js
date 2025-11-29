import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// Use the exact config you provided so there is no mismatch with .env
const firebaseConfig = {
    apiKey: "AIzaSyCCXC_fkpNcDirF7wWQK7ADXdCv1fkEov4",
    authDomain: "arihant-billing.firebaseapp.com",
    databaseURL: "https://arihant-billing-default-rtdb.firebaseio.com",
    projectId: "arihant-billing",
    storageBucket: "arihant-billing.firebasestorage.app",
    messagingSenderId: "96763233692",
    appId: "1:96763233692:web:a8f311848e59ab6ca3f459",
    measurementId: "G-RKRKX7P53R",
};
let app;
try {
    console.log("[Firebase] Initializing app with databaseURL:", firebaseConfig.databaseURL);
    app = initializeApp(firebaseConfig);
    console.log("[Firebase] App initialized successfully");
}
catch (error) {
    console.error("[Firebase] Failed to initialize Firebase app", error);
    throw error;
}
if (typeof window !== "undefined") {
    isAnalyticsSupported()
        .then(supported => {
        if (supported) {
            console.log("[Firebase] Analytics supported, initializing");
            getAnalytics(app);
        }
        else {
            console.log("[Firebase] Analytics not supported in this environment");
        }
    })
        .catch(error => {
        console.warn("[Firebase] Analytics initialization failed (non-fatal)", error);
    });
}
// Explicitly bind to this databaseURL to avoid any ambiguity
export const db = getDatabase(app, firebaseConfig.databaseURL);
console.log("[Firebase] Realtime Database instance created and bound to URL:", firebaseConfig.databaseURL);
