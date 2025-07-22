import { auth } from "../firebase/firebaseConfig.js";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

export function setupLoginForm() {
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const alertContainer = document.getElementById('alert-container');
    const submitBtn = document.getElementById('submit-login-form-btn');

    function checkFormValidity() {
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
        const passwordValid = passwordInput.value.trim().length >= 8;

        let errorMessage = '';

        if (!emailValid) {
            errorMessage = 'Tanpri antre yon adrès imèl ki valab.';
        } else if (!passwordValid) {
            errorMessage = 'Modpas ou dwe gen omwen 8 karaktè.';
        }

        if (errorMessage) {
            alertContainer.textContent = errorMessage;
            alertContainer.classList.remove('hidden');
        } else {
            alertContainer.textContent = '';
            alertContainer.classList.add('hidden');
        }

        const isValid = emailValid && passwordValid;

        submitBtn.disabled = !isValid;
        submitBtn.classList.toggle('opacity-50', !isValid);
        submitBtn.classList.toggle('cursor-not-allowed', !isValid);
    }

    [emailInput, passwordInput].forEach(field => {
        field.addEventListener('input', checkFormValidity);
        field.addEventListener('blur', checkFormValidity);
    });

    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', () => {
        const icons = togglePasswordBtn.querySelectorAll('svg');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icons[0].classList.add('hidden');
            icons[1].classList.remove('hidden');
        } else {
            passwordInput.type = 'password';
            icons[0].classList.remove('hidden');
            icons[1].classList.add('hidden');
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = '../../index.html';
        } catch (error) {
            alertContainer.textContent = 'Done ou rantre yo pa koresponn a sa nou genyen ki anrejistre yo. Tanpri, verifye enfòmasyon ou soumèt yo.';
            alertContainer.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });

    // Google login
    document.getElementById('google-login').addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            window.location.href = '../../index.html';
        } catch (error) {
            alertContainer.textContent = 'Koneksyon ak Google echwe: ' + error.message;
            alertContainer.classList.remove('hidden');
        }
    });
}
