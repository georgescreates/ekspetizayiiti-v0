import { auth, db } from "../firebase/firebaseConfig.js";
import { createUserWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export function setupSignupForm() {
    const form = document.getElementById('signup-form');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    const alertContainer = document.getElementById('alert-container');
    const submitBtn = document.getElementById('submit-signup-form-btn');
    // submitBtn.disabled = true;
    // submitBtn.classList.add('opacity-50', 'cursor-not-allowed');

    const fields = {
        lastname: document.getElementById('lastname'),
        firstname: document.getElementById('firstname'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        password: passwordInput,
        terms: document.getElementById('terms')
    };

    const passwordCriteria = document.getElementById('password-criteria');

    function updatePasswordCriteria(password) {
        const lowercase = (password.match(/[a-z]/g) || []).length;
        const uppercase = (password.match(/[A-Z]/g) || []).length;
        const digits = (password.match(/[0-9]/g) || []).length;
        const special = (password.match(/[^a-zA-Z0-9]/g) || []).length;

        passwordCriteria.innerHTML = `
            <span class="${lowercase >= 2 ? 'text-woodsmoke-900 font-medium' : 'text-mercury-500'}">2 lèt miniskil</span>,
            <span class="${uppercase >= 2 ? 'text-woodsmoke-900 font-medium' : 'text-mercury-500'}">2 lèt majiskil</span>,
            <span class="${digits >= 2 ? 'text-woodsmoke-900 font-medium' : 'text-mercury-500'}">2 chif</span>,
            <span class="${special >= 2 ? 'text-woodsmoke-900 font-medium' : 'text-mercury-500'}">2 karaktè espesyal</span>
        `;
    }

    function checkFormValidity() {
        const lastnameValid = /^[a-zA-ZÀ-ÿ\s]+$/.test(fields.lastname.value.trim());
        const firstnameValid = /^[a-zA-ZÀ-ÿ\s]+$/.test(fields.firstname.value.trim());
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value.trim());
        const phoneValid = /^[234]\d{7}$/.test(fields.phone.value.trim());
        const passwordValid = validatePassword(fields.password.value);
        const termsChecked = fields.terms.checked;

        let errorMessage = '';

        if (!lastnameValid) errorMessage = 'Non ou pa ka vid e dwe gen sèlman lèt ladann.';
        else if (!firstnameValid) errorMessage = 'Prenon ou pa ka vid e dwe gen sèlman lèt ladann.';
        else if (!emailValid) errorMessage = 'Tanpri, antre yon bòn adrès imèl.';
        else if (!phoneValid) errorMessage = 'Nimewo telefòn ou dwe kòmanse pa 2, 3, oswa 4 e gen 8 chif.';
        else if (!passwordValid) errorMessage = 'Modpas ou dwe gen 2 miniskil, 2 majiskil, 2 chif, ak 2 karaktè espesyal.';
        else if (!termsChecked) errorMessage = 'Ou dwe aksepte kondisyon yo pou w kreye kont ou an.';

        if (errorMessage) {
            alertContainer.textContent = errorMessage;
            alertContainer.classList.remove('hidden');
        } else {
            alertContainer.textContent = '';
            alertContainer.classList.add('hidden');
        }

        const isValid = lastnameValid && firstnameValid && emailValid && phoneValid && passwordValid && termsChecked;

        submitBtn.disabled = !isValid;
        submitBtn.classList.toggle('opacity-50', !isValid);
        submitBtn.classList.toggle('cursor-not-allowed', !isValid);
    }

    Object.values(fields).forEach(field => {
        if (field.type === 'checkbox') {
            field.addEventListener('change', checkFormValidity);
        } else {
            field.addEventListener('blur', checkFormValidity);
            field.addEventListener('input', checkFormValidity);
        }
    });

    passwordInput.addEventListener('input', () => {
        updatePasswordCriteria(passwordInput.value);
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

        const lastname = fields.lastname.value.trim();
        const firstname = fields.firstname.value.trim();
        const email = fields.email.value.trim();
        const phone = fields.phone.value.trim();
        const password = fields.password.value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                lastname,
                firstname,
                email,
                phone,
                uid: user.uid,
                createdAt: new Date()
            });

            showSuccessPopup();
        } catch (error) {
            showAlert(error.message, alertContainer);
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });

    // Social signups
    document.getElementById('google-signup').addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            window.location.href = '../../index.html';
        } catch (error) {
            showAlert(error.message, alertContainer);
        }
    });

    // document.getElementById('facebook-signup').addEventListener('click', async () => {
    //     const provider = new FacebookAuthProvider();
    //     try {
    //         await signInWithPopup(auth, provider);
    //         window.location.href = '../../index.html';
    //     } catch (error) {
    //         showAlert(error.message, alertContainer);
    //     }
    // });
}

function validatePassword(password) {
    const lowercase = (password.match(/[a-z]/g) || []).length;
    const uppercase = (password.match(/[A-Z]/g) || []).length;
    const digits = (password.match(/[0-9]/g) || []).length;
    const special = (password.match(/[^a-zA-Z0-9]/g) || []).length;
    return lowercase >= 2 && uppercase >= 2 && digits >= 2 && special >= 2;
}

function showAlert(message, container) {
    container.textContent = message;
    container.classList.remove('hidden');
}

function showSuccessPopup() {
    const popup = document.createElement('div');
    popup.className = 'fixed bottom-0 left-0 w-full flex flex-row items-center justify-center z-50 transition-transform transform translate-y-full';

    popup.innerHTML = `
        <div id="success-popup-content" class="text-body font-body bg-fountain-blue-50 border border-fountain-blue-500 px-5 py-3 flex flex-row gap-x-4 rounded-md shadow-lg w-auto animate-slide-up">
            <div class="w-[3rem] h-[3rem] flex flex-row items-center justify-center">
                <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.675 20.971a.508.508 0 0 1-.65-.637L5.615 9.21c.12-.374.6-.475.862-.183l7.756 7.544a.51.51 0 0 1-.212.82zm7.219-11.695L13.3 6.66q1.925-2.091.48-3.66M8 5.25v-.5m12-.25V4m0 9.5V13m-2 5.5V18m-4.219-5.586l2.406-2.615q2.407-2.616 4.813 0" />
                    </svg>
                </span>
            </div>
            <div class="flex flex-col gap-y-1 text-sm">
                <p class="font-semibold">Kont ou an kreye avèk siksè.</p>
                <p>Klike Kontinye pou w ale sou paj pwofil ou an.</p>
            </div>
            <button id="continue-btn" class="w-auto h-12 px-5 bg-fountain-blue-500 text-white rounded-md">Kontinye</button>
        </div>
    `;

    document.body.appendChild(popup);

    // Trigger slide-up animation
    setTimeout(() => {
        popup.classList.remove('translate-y-full');
        popup.classList.add('translate-y-0');
    }, 50);

    document.getElementById('continue-btn').addEventListener('click', () => {
        window.location.href = '../../index.html';
    });
}

// CSS for the animation (inject into the page)
const style = document.createElement('style');
style.textContent = `
    .animate-slide-up {
        transition: transform 0.4s ease-in-out;
    }
    .translate-y-full {
        transform: translateY(100%);
    }
    .translate-y-0 {
        transform: translateY(-20%);
    }
`;
document.head.appendChild(style);