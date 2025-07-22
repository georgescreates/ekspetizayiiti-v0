import { setupSignupForm } from "../firebase/signup.js";
import { setupLoginForm } from "../firebase/login.js";
import { setupUserProfile } from "../frontend/profile.js";

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('signup-form')) {
        setupSignupForm();
    }

    if (document.getElementById('login-form')) {
        setupLoginForm();
    }

    if (document.getElementById('user-exists-profile-conatiner')) {
        setupUserProfile();
    }
});
