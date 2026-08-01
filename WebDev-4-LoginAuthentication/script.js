const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const message = document.getElementById("message");
const showPassword = document.getElementById("showPassword");
const loginBtn = document.getElementById("loginBtn");

const demoUser = {
    email: "admin@gmail.com",
    password: "123456"
};

// Password visibility toggle
showPassword.addEventListener("click", function () {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    showPassword.classList.toggle("showing", isPassword);
});

// Login form submit
loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Reset message
    message.textContent = "";
    message.className = "";

    // Basic validation
    if (!email || !password) {
        showMessage("Please fill in all fields", "error");
        return;
    }

    // Show loading state
    loginBtn.classList.add("loading");
    loginBtn.disabled = true;

    // Simulate network delay for better UX
    setTimeout(() => {
        if (email === demoUser.email && password === demoUser.password) {
            showMessage("Login successful! Redirecting...", "success");

            localStorage.setItem("loggedInUser", email);

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1200);
        } else {
            showMessage("Invalid email or password", "error");
            loginBtn.classList.remove("loading");
            loginBtn.disabled = false;

            // Gentle shake on error
            loginForm.classList.add("shake");
            setTimeout(() => loginForm.classList.remove("shake"), 500);
        }
    }, 900);
});

function showMessage(text, type) {
    message.textContent = text;
    message.className = type;
}