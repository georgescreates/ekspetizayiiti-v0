import { auth } from "../patikilye/firebase/firebaseConfig.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    openOnlyThisPanel,
    toggleDepartmentDropdown,

    setupDomainPanelSwitching,
    setupCustomCheckboxes,
    setupSingleSelectionInPanels
} from '../patikilye/frontend/quest-form-dropdown-toggler.js';

import { updateRangeUI, initializeMap } from '../patikilye/frontend/map-ui.js';

import { initQuestForm, populateHeaderCards } from '../patikilye/frontend/quest-form.js';

import { setupUserProfile, setupProfilePictureUpload } from "../patikilye/frontend/profile.js"

function toggleUserUI(user) {
    const navCtasList = document.getElementById('nav-ctas-list');
    const userProfileContainer = document.getElementById('user-exists-profile-container');

    if (user) {
        navCtasList.classList.add('hidden');
        navCtasList.classList.remove('flex');
        userProfileContainer.classList.remove('hidden');
    } else {
        navCtasList.classList.remove('hidden');
        navCtasList.classList.add('flex');
        userProfileContainer.classList.add('hidden');
    }
}

export function checkUserSession() {
    onAuthStateChanged(auth, (user) => {
        toggleUserUI(user);
    });
}

const domainDropdownBtn = document.getElementById('domain-dropdown-btn');
const locationDropdownBtn = document.getElementById('location-dropdown-btn');

domainDropdownBtn.addEventListener('click', () => {
    openOnlyThisPanel('domain-dropdown-panel');
});
locationDropdownBtn.addEventListener('click', () => {
    openOnlyThisPanel('location-dropdown-panel');
});

document.addEventListener('DOMContentLoaded', () => {
    setupCustomCheckboxes();

    setupDomainPanelSwitching();
    // setupLocationPanelSwitching();

    setupSingleSelectionInPanels();

    updateRangeUI();
    initializeMap();

    initQuestForm();

    setTimeout(() => {
        populateHeaderCards();
    }, 1000);

    // from profile.js
    onAuthStateChanged(auth, (user) => {
        toggleUserUI(user);
        
        if (user) {
            setupUserProfile();
            setupProfilePictureUpload(user); // pass the user here
        }
    });
});