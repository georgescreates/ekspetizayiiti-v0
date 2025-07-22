import { db } from './firebaseConfig.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Load your JSON file
fetch('../src/json/notebook-business.json')
    .then(response => response.json())
    .then(async (businesses) => {
        for (const biz of businesses) {
            try {
                await addDoc(collection(db, "businesses"), biz);
                console.log(`Added: ${biz.name}`);
            } catch (e) {
                console.error("Error adding document: ", e);
            }
        }
    });
