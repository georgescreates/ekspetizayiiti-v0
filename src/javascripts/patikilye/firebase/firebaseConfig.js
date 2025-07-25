// Import the functions you need from the SDKs you need
import {initializeApp} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {getAnalytics} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBZ3OfU5Yr6z_dBHQxbieAl0quEok3_k4M",
    authDomain: "ekspetizayiti-v0.firebaseapp.com",
    projectId: "ekspetizayiti-v0",
    storageBucket: "ekspetizayiti-v0.firebasestorage.app",
    messagingSenderId: "769899107567",
    appId: "1:769899107567:web:69608b92b34047e8e1771a",
    measurementId: "G-JNV5YJMHP4"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, auth };