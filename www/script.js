// Define the Urdu alphabet
const urduAlphabet = "← آ ا ب پ ت ٹ ث ج چ ح خ د ڈ ذ ر ڑ ز ژ س ش ص ض ط ظ ع غ ف ق ک گ ل م ن ں و ہ ھ ء ی ئ ے";
const urduLetters = urduAlphabet.split(" ");

let targetWord;
let attemptsLeft = 7;

const colors = {
    correct: "green",
    wrongPosition: "orange",
    incorrect: "grey"
};
function showHint() {
    // Add code to show the hint here
    alert("Here is your hint!");
}


document.getElementById('image1-link').addEventListener('click', function() {
    if (window.Android) {
        window.Android.showRewardedAd();
    } else {
        alert("AdMob not available.");
    }
});
document.getElementById('image2-link').addEventListener('click', function() {
    if (window.Android) {
        window.Android.showRewardedAd();
    } else {
        alert("AdMob not available.");
    }
});

// Function to provide a hint (Modify according to your hint logic)
function provideHint() {
    // Example hint logic: Show a message or modify the UI to give a hint
    alert("Here is a hint!");
}

const validWords = new Set(); // To store the valid 4-letter Urdu words

// Function to load valid words from a text file (replace with your actual method)
function loadValidWords() {
    return fetch('4letter.txt')
        .then(response => response.text())
        .then(data => {

            // Split words by newline and trim spaces
            const words = data.split('\n').map(word => word.trim()).filter(word => word.length === 4);
            
            // Debugging: Check the number of words loaded
            console.log('Number of words found:', words.length);

            // Add words to the Set
            words.forEach(word => validWords.add(word));
            
        })
        .catch(err => console.error('Error loading valid words:', err));
}

// Function to get a random 4-letter word
function getRandomWord(callback) {
    fetch('4letter.txt')
        .then(response => response.text())
        .then(data => {
            const words = data.split('\n').map(word => word.trim()).filter(word => word.length === 4);
            const randomWord = words[Math.floor(Math.random() * words.length)];
            callback(randomWord);
        })
        .catch(err => console.error('Error reading the file:', err));
}

function generateFeedback(target, guess) {
    const feedback = Array.from({ length: 4 }, (_, index) => {
        const guessLetter = guess[index];
        const targetLetter = target[index];
        if (guessLetter === targetLetter) {
            return { letter: guessLetter, color: colors.correct, symbol: "🟢" }; // Correct letter in the correct position
        } else if (target.includes(guessLetter)) {
            return { letter: guessLetter, color: colors.wrongPosition, symbol: "🟠" }; // Correct letter, but in the wrong position
        } else {
            return { letter: guessLetter, color: colors.incorrect, symbol: "⚫" }; // Incorrect letter
        }
    });
    return feedback;
}

function updateKeyboard(feedback) {
    const keyboardButtons = document.querySelectorAll('#keyboard button');

    feedback.forEach(({ letter, color }) => {
        const button = Array.from(keyboardButtons).find(btn => btn.textContent === letter);
        if (button) {
            button.style.backgroundColor = color;
        }
    });
}

function addLetterToGuess(letter) {
    if (letter === "←") {
        // Remove the last character from the input field
        for (let i = 4; i >= 1; i--) {
            const input = document.getElementById("letter" + i);
            if (input.value !== "") {
                input.value = "";
                break;
            }
        }
    } else {
        // Append the selected letter to the input field
        for (let i = 1; i <= 4; i++) {
            const input = document.getElementById("letter" + i);
            if (input.value === "") {
                input.value = letter;
                break;
            }
        }
    }
}

function clearGuess() {
    for (let i = 1; i <= 4; i++) {
        const input = document.getElementById("letter" + i);
        input.value = "";
    }
}

function disableInput() {
    for (let i = 1; i <= 4; i++) {
        const input = document.getElementById("letter" + i);
        input.setAttribute("disabled", "disabled");
    }
    const submitButton = document.getElementById("submit-button");
    submitButton.setAttribute("disabled", "disabled");
}

function saveGameState() {
    const keyboardState = Array.from(document.querySelectorAll('#keyboard button')).map(button => ({
        letter: button.textContent,
        color: button.style.backgroundColor
    }));
    
    const gameState = {
        targetWord,
        previousGuesses,
        attemptsLeft,
        keyboardState
    };
    
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

function restoreGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        const { targetWord: savedWord, previousGuesses: savedGuesses, attemptsLeft: savedAttempts, keyboardState: savedKeyboardState } = JSON.parse(savedState);
        if (savedAttempts > 0) { // Check if the game is still in progress
            targetWord = savedWord;
            previousGuesses = savedGuesses;
            attemptsLeft = savedAttempts-1;

            // Restore the keyboard colors
            savedKeyboardState.forEach(({ letter, color }) => {
                const button = Array.from(document.querySelectorAll('#keyboard button')).find(btn => btn.textContent === letter);
                if (button) {
                    button.style.backgroundColor = color;
                }
            });

            // Restore the UI
            document.getElementById("attempts").textContent = `❤️: ${attemptsLeft}`;
            document.getElementById("previous-guesses").innerHTML = previousGuesses.map(item => `<div>${item.guess} - ${item.feedback.map(f => f.symbol).reverse().join(" ")}</div>`).join("");
            // Populate input fields with the previous guesses
            for (let i = 1; i <= 4; i++) {
                const input = document.getElementById("letter" + i);
                input.value = previousGuesses[previousGuesses.length - 1].guess[i - 1] || "";
            }
            return true; // Indicate that the game state was restored
        } else {
            localStorage.removeItem('gameState'); // Clear state if game is finished
        }
    }
    return false; // No game state to restore
}

function resetKeyboard() {
    const keyboardButtons = document.querySelectorAll('#keyboard button');
    keyboardButtons.forEach(button => {
        button.style.backgroundColor = ''; // Reset color
    });
}

function initializeGame() {
    const gameRestored = restoreGameState();
    if (!gameRestored) {
        getRandomWord((word) => {
            targetWord = word;

            const keyboard = document.getElementById("keyboard");
            keyboard.innerHTML = "";

            resetKeyboard(); // Reset keyboard colors for a new game

            previousGuesses = [];

            for (let i = 1; i <= 4; i++) {
                const guessInput = document.getElementById(`letter${i}`);
                guessInput.removeAttribute("disabled");
            }

            document.getElementById("feedback").textContent = "";

            attemptsLeft = 7; // Set to 7 for a new game
            document.getElementById("attempts").textContent = `❤️: ${attemptsLeft}`;

            document.getElementById("previous-guesses").innerHTML = "";

            document.getElementById("letter1").focus();
        });
    }
}

function submitGuess() {
    let guess = "";
    for (let i = 1; i <= 4; i++) {
        const input = document.getElementById("letter" + i);
        guess += input.value.trim();
    }
    const urduRegex = /^[\u0600-\u06FF]+$/;

    if (guess.length !== 4 || !urduRegex.test(guess)) {
        alert("براہ کرم ایک صحیح 4 حرفی لفظ داخل کریں۔");
        clearGuess();
        return;
    }

    if (!validWords.has(guess)) {
        alert("یہ لفظ درست نہیں ہے۔ براہ کرم ایک صحیح لفظ داخل کریں۔");
        console.log(`Guess "${targetWord}" is not valid.`); // Debugging line

        clearGuess();
        return;
    }

    const feedback = generateFeedback(targetWord, guess);
    updateKeyboard(feedback); // Update keyboard colors based on feedback

    const feedbackDisplay = document.getElementById("feedback");
    const attemptsDisplay = document.getElementById("attempts");
    const previousGuessesDisplay = document.getElementById("previous-guesses");

    feedbackDisplay.textContent = feedback.map(f => f.symbol).reverse().join(" "); // Display feedback symbols reversed

    previousGuesses.push({ guess, feedback });

    const previousGuessesHTML = previousGuesses.map(item => `<div>${item.guess} - ${item.feedback.map(f => f.symbol).reverse().join(" ")}</div>`).join("");
    previousGuessesDisplay.innerHTML = previousGuessesHTML;

    saveGameState(); // Save game state after each guess

    if (feedback.every(f => f.color === colors.correct)) {
        endGame(true);
        return;
    }

    attemptsLeft--;
    attemptsDisplay.textContent = `❤️: ${attemptsLeft}`;

    if (attemptsLeft === 0) {
        endGame(false);
        return;
    }

    clearGuess();
}

function endGame(isWin) {
    document.getElementById("submit-button").style.display = "none";
    const feedbackDisplay = document.getElementById("feedback");

    if (isWin) {
        feedbackDisplay.textContent = "شاندار! آپ نے درست جواب دیا ہے۔";
        feedbackDisplay.classList.add("congratulation-message"); // Add the CSS class to make the message bigger

        const currentTime = new Date();
        const currentDate = currentTime.toLocaleDateString("ur-PK");
        const currentFormattedTime = currentTime.toLocaleTimeString("ur-PK");

        const timeLeft = getTimeLeftUntilNextDay();
        const congratulationMessage = "بہت مبارک ہو! آپ نے گیم جیت لیا ہے۔";
        const popUpMessage = `تاریخ: ${currentDate}\nوقت: ${currentFormattedTime}\nباقی وقت: ${timeLeft}\n\n${congratulationMessage}`;
        setTimeout(() => alert(popUpMessage), 500);
    } else {
        feedbackDisplay.textContent = `آپ کی کوششیں ختم ہوگئیں۔ درست جواب ${targetWord} تھا۔`;
        feedbackDisplay.classList.add("congratulation-message"); // Add the CSS class to make the message bigger
    }

    disableInput();
    localStorage.removeItem('gameState'); // Clear the game state
}

function getTimeLeftUntilNextDay() {
    const currentTime = new Date();
    const tomorrow = new Date(currentTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeLeft = tomorrow - currentTime;
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const secondsLeft = Math.floor((timeLeft % (1000 * 60)) / 1000);
    return `گھنٹے: ${hoursLeft} ,منٹ: ${minutesLeft} ,  سیکنڈ: ${secondsLeft}`;
}

function updateClock() {
    const timeLeftElement = document.getElementById("time-left");
    setInterval(() => {
        const timeLeft = getTimeLeftUntilNextDay();
        timeLeftElement.textContent = timeLeft;
    }, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
    loadValidWords().then(() => {
        initializeGame();
    });
});


document.getElementById("clear-guess").addEventListener("click", clearGuess);
document.getElementById("submit-button").addEventListener("click", submitGuess);
