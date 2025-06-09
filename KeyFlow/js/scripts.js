// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');
const soundToggle = document.getElementById('soundToggle');
const soundIcon = soundToggle.querySelector('i');
const typingPrompt = document.getElementById('typingPrompt');
const typingInput = document.getElementById('typingInput');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const newTestBtn = document.getElementById('newTestBtn');
const startSection = document.getElementById('startSection');
const statsSection = document.getElementById('statsSection');
const resultsSection = document.getElementById('resultsSection');
const wpmValue = document.getElementById('wpmValue');
const accuracyValue = document.getElementById('accuracyValue');
const timeValue = document.getElementById('timeValue');
const finalWpm = document.getElementById('finalWpm');
const finalAccuracy = document.getElementById('finalAccuracy');
const finalTime = document.getElementById('finalTime');

// Audio elements
const keySound = document.getElementById('keySound');
const errorSound = document.getElementById('errorSound');
const completeSound = document.getElementById('completeSound');

// Typing test prompts
const prompts = [
    "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is commonly used for typing practice.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. Persistence and determination are omnipotent.",
    "Programming is not about what you know; it's about what you can figure out. The most important skill is learning how to learn.",
    "The best way to predict the future is to invent it. Computer science is no more about computers than astronomy is about telescopes.",
    "Life is like riding a bicycle. To keep your balance, you must keep moving. The difference between ordinary and extraordinary is practice."
];

// State variables
let currentTheme = localStorage.getItem('keyflow-theme') || 'light';
let soundEnabled = localStorage.getItem('keyflow-sound') !== 'false';
let testActive = false;
let testComplete = false;
let startTime;
let timerInterval;
let currentPrompt = '';
let currentIndex = 0;
let correctChars = 0;
let incorrectChars = 0;
let totalTyped = 0;

// Initialize theme and sound settings
updateTheme();
updateSound();

// Event listeners
themeToggle.addEventListener('click', toggleTheme);
soundToggle.addEventListener('click', toggleSound);
startBtn.addEventListener('click', startTest);
resetBtn.addEventListener('click', resetTest);
newTestBtn.addEventListener('click', resetTest);
typingInput.addEventListener('input', handleTyping);
document.addEventListener('keydown', handleKeydown);

// Functions
function updateTheme() {
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeIcon.className = 'fas fa-moon';
    }
}

function updateSound() {
    if (soundEnabled) {
        soundIcon.className = 'fas fa-volume-up';
    } else {
        soundIcon.className = 'fas fa-volume-mute';
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('keyflow-theme', currentTheme);
    updateTheme();
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('keyflow-sound', soundEnabled);
    updateSound();
}

function getRandomPrompt() {
    const randomIndex = Math.floor(Math.random() * prompts.length);
    return prompts[randomIndex];
}

function formatPrompt(text) {
    let formattedText = '';
    for (let i = 0; i < text.length; i++) {
        let charClass = '';
        if (i === currentIndex) {
            charClass = 'current';
        } else if (i < currentIndex) {
            if (text[i] === typingInput.value[i]) {
                charClass = 'correct';
            } else {
                charClass = 'incorrect';
            }
        }
        formattedText += `<span class="char ${charClass}">${text[i]}</span>`;
    }
    return formattedText;
}

function startTest() {
    testActive = true;
    testComplete = false;
    startSection.classList.add('hidden');
    statsSection.classList.add('visible');
    resultsSection.classList.remove('visible');
    typingInput.classList.remove('hidden');
    typingInput.value = '';
    typingInput.focus();
    
    // Reset stats
    currentIndex = 0;
    correctChars = 0;
    incorrectChars = 0;
    totalTyped = 0;
    
    // Set random prompt
    currentPrompt = getRandomPrompt();
    typingPrompt.innerHTML = formatPrompt(currentPrompt);
    
    // Start timer
    startTime = new Date().getTime();
    timerInterval = setInterval(updateTimer, 1000);
    
    // Update stats initially
    updateStats();
}

function resetTest() {
    testActive = false;
    testComplete = false;
    clearInterval(timerInterval);
    
    startSection.classList.remove('hidden');
    statsSection.classList.remove('visible');
    resultsSection.classList.remove('visible');
    typingInput.classList.add('hidden');
    
    // Reset stats display
    wpmValue.textContent = '0';
    accuracyValue.textContent = '100%';
    timeValue.textContent = '0s';
    
    // Clear prompt
    typingPrompt.innerHTML = '';
}

function completeTest() {
    testActive = false;
    testComplete = true;
    clearInterval(timerInterval);
    
    // Play completion sound
    if (soundEnabled) {
        completeSound.currentTime = 0;
        completeSound.play();
    }
    
    // Update final stats
    finalWpm.textContent = wpmValue.textContent;
    finalAccuracy.textContent = accuracyValue.textContent;
    finalTime.textContent = timeValue.textContent;
    
    // Show results
    statsSection.classList.remove('visible');
    resultsSection.classList.add('visible');
    typingInput.classList.add('hidden');
}

function handleTyping(e) {
    if (!testActive) return;
    
    const inputValue = e.target.value;
    totalTyped = inputValue.length;
    
    // Check correctness
    correctChars = 0;
    incorrectChars = 0;
    
    for (let i = 0; i < inputValue.length; i++) {
        if (i >= currentPrompt.length) break;
        
        if (inputValue[i] === currentPrompt[i]) {
            correctChars++;
        } else {
            incorrectChars++;
        }
    }
    
    // Update current index
    currentIndex = inputValue.length;
    
    // Update prompt display
    typingPrompt.innerHTML = formatPrompt(currentPrompt);
    
    // Play sound
    if (soundEnabled) {
        if (inputValue.length > 0 && inputValue[inputValue.length - 1] === currentPrompt[inputValue.length - 1]) {
            keySound.currentTime = 0;
            keySound.play();
        } else if (inputValue.length > 0) {
            errorSound.currentTime = 0;
            errorSound.play();
        }
    }
    
    // Update stats
    updateStats();
    
    // Check if test is complete
    if (currentIndex === currentPrompt.length) {
        completeTest();
    }
}

function updateStats() {
    // Calculate WPM
    const timeElapsed = (new Date().getTime() - startTime) / 1000 / 60; // in minutes
    const wordsTyped = correctChars / 5; // standard: 5 characters = 1 word
    const wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
    
    // Calculate accuracy
    const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
    
    // Update display
    wpmValue.textContent = wpm;
    accuracyValue.textContent = `${accuracy}%`;
}

function updateTimer() {
    if (!testActive) return;
    
    const timeElapsed = Math.round((new Date().getTime() - startTime) / 1000);
    timeValue.textContent = `${timeElapsed}s`;
}

function handleKeydown(e) {
    // Start test on any key if not active
    if (!testActive && !testComplete && e.key !== 'Tab' && e.key !== 'Escape' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (startSection.classList.contains('hidden')) return;
        startTest();
    }
    
    // Reset test on Escape
    if (e.key === 'Escape' && (testActive || testComplete)) {
        resetTest();
    }
}

// Initialize with empty prompt
typingPrompt.innerHTML = '';