// DOM Elements
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const toggleAuthButton = document.getElementById('toggle-auth');
const newTodoInput = document.getElementById('new-todo');
const addTodoButton = document.getElementById('add-todo');
const todoList = document.getElementById('todo-list');
const viewMoreButton = document.getElementById('view-more');
const themeSelect = document.getElementById('theme-select');
const premiumThemesBtn = document.getElementById('premium-themes-btn');
const startVoiceButton = document.getElementById('start-voice');
const languageSelect = document.getElementById('language-select');

// Global variables
let todos = [];
let currentUser = null;
const visibleTodoCount = 3;
let showingFullList = false;

// --- New: Define your premium themes ---
const premiumThemes = ['premium-gold', 'premium-silver', 'premium-diamond'];

// --- User Authentication ---
const users = JSON.parse(localStorage.getItem('users')) || {};

function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

function login(username, password) {
    if (users[username] && users[username].password === password) {
        currentUser = username;
        localStorage.setItem('currentUser', username);
        renderApp(); // This will handle loading todos and applying theme
        return true;
    }
    alert('Invalid username or password!');
    return false;
}

function register(username, password) {
    if (users[username]) {
        alert('Username already exists!');
        return false;
    }
    // Add isPremium flag to new users
    users[username] = { password: password, todos: [], theme: 'default', isPremium: false };
    saveUsers();
    alert('Registration successful! Please log in.');
    toggleAuthForm(); // Switch to login form
    return true;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    appSection.style.display = 'none';
    authSection.style.display = 'block';
    todos = []; // Clear todos on logout
    todoList.innerHTML = ''; // Clear UI
    document.body.className = ''; // Reset theme
    // Re-enable and reset premium theme options on logout
    Array.from(themeSelect.options).forEach(option => {
        if (premiumThemes.includes(option.value)) {
            option.textContent = option.value.replace('premium-', 'Premium ') + ' (Locked)';
            option.disabled = true;
        }
    });
}

function renderAuth() {
    currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        authSection.style.display = 'none';
        appSection.style.display = 'block';
        loadTodos();
        applyTheme(users[currentUser].theme || 'default');
        // Update theme selector to disable/enable premium options based on user's status
        updateThemeSelector();
    } else {
        authSection.style.display = 'block';
        appSection.style.display = 'none';
    }
}

function toggleAuthForm() {
    if (registerForm.style.display === 'none') {
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
        toggleAuthButton.textContent = 'Already have an account? Login';
    } else {
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        toggleAuthButton.textContent = 'Need an account? Register';
    }
}

// Event Listeners for Auth
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    register(username, password);
    registerForm.reset();
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('log-username').value;
    const password = document.getElementById('log-password').value;
    login(username, password);
    loginForm.reset();
});

toggleAuthButton.addEventListener('click', toggleAuthForm);


// --- To-Do List Functionality ---
function saveTodos() {
    if (currentUser && users[currentUser]) {
        users[currentUser].todos = todos;
        saveUsers();
    }
}

function loadTodos() {
    if (currentUser && users[currentUser]) {
        todos = users[currentUser].todos || [];
    }
    renderTodos();
}

function renderTodos() {
    todoList.innerHTML = '';
    const itemsToDisplay = showingFullList ? todos : todos.slice(0, visibleTodoCount);

    if (todos.length > visibleTodoCount && !showingFullList) {
        viewMoreButton.style.display = 'block';
    } else {
        viewMoreButton.style.display = 'none';
    }

    itemsToDisplay.forEach((todo, index) => {
        const listItem = document.createElement('li');
        listItem.className = todo.completed ? 'completed' : '';
        // Use the original index from the 'todos' array, not the sliced one
        const originalIndex = todos.findIndex(t => t === todo);
        listItem.dataset.index = originalIndex;

        listItem.innerHTML = `
            <span>${todo.text}</span>
            <div>
                <button class="complete-btn">${todo.completed ? 'Undo' : 'Complete'}</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        todoList.appendChild(listItem);
    });
}

function addTodo() {
    const todoText = newTodoInput.value.trim();
    if (todoText) {
        todos.push({ text: todoText, completed: false });
        newTodoInput.value = '';
        saveTodos();
        renderTodos();
    }
}

function toggleComplete(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
}

function deleteTodo(index) {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
}

// Event Listeners for To-Do
addTodoButton.addEventListener('click', addTodo);
newTodoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

todoList.addEventListener('click', (e) => {
    const listItem = e.target.closest('li');
    if (!listItem) return;

    const index = parseInt(listItem.dataset.index);

    if (e.target.classList.contains('complete-btn')) {
        toggleComplete(index);
    } else if (e.target.classList.contains('delete-btn')) {
        deleteTodo(index);
    }
});

viewMoreButton.addEventListener('click', () => {
    showingFullList = true;
    renderTodos();
});


// --- Theme Switching ---

// New function to update the theme selector options dynamically
function updateThemeSelector() {
    const isPremiumUser = currentUser && users[currentUser] && users[currentUser].isPremium;
    Array.from(themeSelect.options).forEach(option => {
        if (premiumThemes.includes(option.value)) {
            if (!isPremiumUser) {
                option.textContent = `${option.value.replace('premium-', 'Premium ')} (Locked)`;
                option.disabled = true; // Visually disable the option
            } else {
                option.textContent = option.value.replace('premium-', 'Premium '); // Unlock text
                option.disabled = false;
            }
        } else {
            // Ensure non-premium options are always enabled and correctly named
            option.disabled = false;
            if (option.value === 'default') option.textContent = 'Default';
            if (option.value === 'dark') option.textContent = 'Dark';
            if (option.value === 'colorful') option.textContent = 'Colorful';
            if (option.value === 'cartoon') option.textContent = 'Cartoon';
            if (option.value === 'anime') option.textContent = 'Anime';
            if (option.value === 'futuristic') option.textContent = 'Futuristic';
            if (option.value === 'vintage') option.textContent = 'Vintage';
        }
    });
}


function applyTheme(themeName) {
    // Remove all existing theme classes first
    document.body.className = '';
    // Apply the new theme class
    document.body.classList.add(themeName);

    if (currentUser && users[currentUser]) {
        users[currentUser].theme = themeName;
        saveUsers();
    }
    // Update the select box to reflect the current theme, but only if it's not disabled
    if (!themeSelect.querySelector(`option[value="${themeName}"]`).disabled) {
        themeSelect.value = themeName;
    } else {
        // If the theme being applied is locked (e.g., after initial load with a locked theme saved)
        // revert the select dropdown to the first available non-locked theme or default
        const currentSavedTheme = users[currentUser].theme;
        if (premiumThemes.includes(currentSavedTheme) && !users[currentUser].isPremium) {
            // If the saved theme is premium and user is NOT premium, switch to default
            themeSelect.value = 'default';
            document.body.className = 'default';
            users[currentUser].theme = 'default';
            saveUsers();
        } else {
             // Otherwise, just make sure the dropdown shows the current applied theme
            themeSelect.value = themeName;
        }
    }
}

themeSelect.addEventListener('change', (e) => {
    const selectedTheme = e.target.value;
    const isPremiumUser = currentUser && users[currentUser] && users[currentUser].isPremium;

    if (premiumThemes.includes(selectedTheme)) {
        if (!isPremiumUser) {
            // If user is not premium, attempt to "unlock"
            const unlockConfirmed = confirm(`This is a premium theme (${selectedTheme.replace('premium-', 'Premium ')}). Would you like to unlock all premium themes for $X? (This is a demo, no actual payment)`);
            if (unlockConfirmed) {
                if (currentUser && users[currentUser]) {
                    users[currentUser].isPremium = true; // Mark user as premium
                    saveUsers();
                    alert('Premium themes unlocked! Enjoy!');
                    updateThemeSelector(); // Refresh selector to show unlocked status
                    applyTheme(selectedTheme); // Apply the chosen premium theme
                }
            } else {
                alert('Premium theme not applied. Reverting to your previous theme.');
                applyTheme(users[currentUser].theme || 'default'); // Revert to previous theme
            }
        } else {
            // User is already premium, just apply the theme
            applyTheme(selectedTheme);
        }
    } else {
        // Not a premium theme, apply directly
        applyTheme(selectedTheme);
    }
});

premiumThemesBtn.addEventListener('click', () => {
    const isPremiumUser = currentUser && users[currentUser] && users[currentUser].isPremium;
    if (isPremiumUser) {
        alert('You already have premium themes unlocked! Enjoy!');
    } else {
        const unlockConfirmed = confirm('Unlock all premium themes for $X? (This is a demo, no actual payment)');
        if (unlockConfirmed) {
            if (currentUser && users[currentUser]) {
                users[currentUser].isPremium = true; // Mark user as premium
                saveUsers();
                alert('Premium themes unlocked! Enjoy!');
                updateThemeSelector(); // Refresh selector
                // Apply the last used theme, or default if it was a locked premium one
                applyTheme(users[currentUser].theme || 'default');
            }
        } else {
            alert('Premium themes remain locked.');
        }
    }
});


// --- Voice-to-Text Conversion ---
// Check for SpeechRecognition API support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false; // Listen for a single utterance
    recognition.interimResults = false; // Only return final results

    recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript;
        newTodoInput.value = command;
        // Optionally auto-add the todo after voice input
        // addTodo();
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        alert('Speech recognition error: ' + event.error);
        startVoiceButton.textContent = 'Voice Input'; // Reset button on error
        startVoiceButton.disabled = false;
    };

    startVoiceButton.addEventListener('click', () => {
        const selectedLang = languageSelect.value;
        recognition.lang = selectedLang; // Set language for recognition
        try {
            recognition.start();
            startVoiceButton.textContent = 'Listening...';
            startVoiceButton.disabled = true;
        } catch (e) {
            console.error("Speech recognition start error:", e);
            alert("Could not start voice input. Is your microphone available?");
            startVoiceButton.textContent = 'Voice Input';
            startVoiceButton.disabled = false;
        }
    });

    recognition.onend = () => {
        startVoiceButton.textContent = 'Voice Input';
        startVoiceButton.disabled = false;
    };
} else {
    // If SpeechRecognition is not supported
    startVoiceButton.disabled = true;
    startVoiceButton.textContent = 'Voice not supported';
    // Add an option to the select for unsupported languages if you want
    // For now, it will just display the selected language as-is
    console.warn('Speech Recognition API not supported in this browser.');
}


// --- Initialize Application ---
function renderApp() {
    renderAuth(); // Check authentication status
    // The updateThemeSelector is called within renderAuth for authenticated users
    // For initial load before login, all premium themes are locked by default
    if (!currentUser) {
        Array.from(themeSelect.options).forEach(option => {
            if (premiumThemes.includes(option.value)) {
                option.textContent = option.value.replace('premium-', 'Premium ') + ' (Locked)';
                option.disabled = true;
            }
        });
    }
}

// Initial render when the page loads
document.addEventListener('DOMContentLoaded', renderApp);