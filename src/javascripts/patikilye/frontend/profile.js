import { auth, db } from "../firebase/firebaseConfig.js";
import { onAuthStateChanged, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, updateDoc, getDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

const storage = getStorage();

export function setupUserProfile() {
    const navCtasList = document.getElementById('nav-ctas-list');
    const userProfileContainer = document.getElementById('user-exists-profile-container');
    const displayNameEl = document.getElementById('user-display-name');
    const displayRoleEl = document.getElementById('user-display-role');
    const profileImg = document.querySelector('#user-profile-img-container');

    onAuthStateChanged(auth, async (user) => {
        if (!user) return;

        navCtasList.classList.add('hidden');
        userProfileContainer.classList.remove('hidden');

        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        let data = userDoc.exists() ? userDoc.data() : {};

        displayNameEl.textContent = `${data.firstname || ''}, ${data.lastname || ''}`;
        displayRoleEl.textContent = data.role || "P/A";

        let photoURL = data.photoURL;
        const defaultAvatarsRef = ref(storage, 'users/default-avatars');
        const defaultAvatarsList = await listAll(defaultAvatarsRef);
        const defaultAvatars = await Promise.all(defaultAvatarsList.items.map(item => getDownloadURL(item)));

        // By default, use the male avatar (assuming index 2)
        if (!photoURL) {
            photoURL = defaultAvatars[2];
            await updateDoc(userRef, { photoURL });
            await updateProfile(user, { photoURL });
        }

        profileImg.style.backgroundImage = `url('${photoURL}')`;

        const profileAvatarsContainer = document.getElementById('profile-avatars-container');
        const uploadButton = document.getElementById('upload-avatar-btn');

        // Clear existing avatars (except upload button)
        profileAvatarsContainer.querySelectorAll('.profile-avatar-container').forEach(el => {
            if (el !== uploadButton) el.remove();
        });

        const setAvatar = async (url) => {
            await updateDoc(userRef, { photoURL: url });
            await updateProfile(user, { photoURL: url });
            profileImg.style.backgroundImage = `url('${url}')`;
        };

        // Add default avatars to the list
        defaultAvatars.forEach(url => {
            const avatar = document.createElement('div');
            avatar.className = 'profile-avatar-container h-12 w-12 rounded-full cursor-pointer';
            avatar.style.backgroundImage = `url('${url}')`;
            avatar.style.backgroundSize = 'cover';

            avatar.addEventListener('click', () => setAvatar(url));
            profileAvatarsContainer.insertBefore(avatar, uploadButton);
        });

        // Add uploaded avatars (if any)
        if (data.avatars && Array.isArray(data.avatars)) {
            data.avatars.forEach(url => {
                const avatar = document.createElement('div');
                avatar.className = 'profile-avatar-container h-12 w-12 rounded-full cursor-pointer';
                avatar.style.backgroundImage = `url('${url}')`;
                avatar.style.backgroundSize = 'cover';

                avatar.addEventListener('click', () => setAvatar(url));
                profileAvatarsContainer.insertBefore(avatar, uploadButton);
            });
        }

        // After adding avatars, control upload button visibility
        const uploadedCount = (data.avatars || []).length;

        if (uploadedCount >= 2) {
            uploadButton.classList.add('hidden');
        } else {
            uploadButton.classList.remove('hidden');
        }

        // Logout
        document.getElementById('logout-btn').addEventListener('click', async () => {
            // Hide user profile UI immediately
            document.getElementById('user-exists-profile-container').classList.add('hidden');
            document.getElementById('user-exists-profile-container').classList.remove('flex');
            document.getElementById('nav-ctas-list').classList.remove('hidden');
            document.getElementById('nav-ctas-list').classList.add('flex');

            await signOut(auth);

            // Optional: Remove this if you prefer SPA behavior
            window.location.reload();
        });

        document.getElementById('user-exists-profile-btn').addEventListener('click', () => {
            document.getElementById('user-exists-options-container').classList.toggle('hidden');
        });
    });
}

export function setupProfilePictureUpload(user) {
    const uploadInput = document.getElementById('upload-profile-input');
    const uploadButton = document.getElementById('upload-avatar-btn');
    const profileImg = document.querySelector('#user-profile-img-container');
    const placeholder = document.getElementById('avatar-upload-placeholder');

    if (!uploadButton || !profileImg || !placeholder) return;

    uploadButton.addEventListener('click', () => uploadInput.click());

    uploadInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        placeholder.classList.remove('hidden');

        const storageRef = ref(storage, `users/${user.uid}/profile_picture_${Date.now()}`);
        try {
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                avatars: arrayUnion(downloadURL),
                photoURL: downloadURL
            });

            await updateProfile(user, { photoURL: downloadURL });
            profileImg.style.backgroundImage = `url('${downloadURL}')`;

            // Add the new avatar to the list
            const profileAvatarsContainer = document.getElementById('profile-avatars-container');
            const newAvatar = document.createElement('div');
            newAvatar.className = 'profile-avatar-container h-12 w-12 rounded-full cursor-pointer';
            newAvatar.style.backgroundImage = `url('${downloadURL}')`;
            newAvatar.style.backgroundSize = 'cover';

            newAvatar.addEventListener('click', async () => {
                await updateDoc(userRef, { photoURL: downloadURL });
                await updateProfile(user, { photoURL: downloadURL });
                profileImg.style.backgroundImage = `url('${downloadURL}')`;
            });

            profileAvatarsContainer.insertBefore(newAvatar, uploadButton);

            const userDoc = await getDoc(userRef);
            const uploadedAvatars = userDoc.exists() && userDoc.data().avatars ? userDoc.data().avatars : [];

            if (uploadedAvatars.length >= 2) {
                uploadButton.classList.add('hidden');
            }

        } catch (error) {
            console.error("Erreur pandan oupload imaj:", error);
        } finally {
            placeholder.classList.add('hidden');
        }
    });
}