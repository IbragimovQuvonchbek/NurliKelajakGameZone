// DOM Elements
const elements = {
    flag: document.getElementById('flag'),
    question: document.getElementById('question'),
    options: document.getElementById('options'),
    score: document.getElementById('score'),
    timeIndicator: document.getElementById('timeIndicator'),
    mistakesIndicator: document.getElementById('mistakesIndicator'),
    gameOver: document.getElementById('gameOver'),
    finalScore: document.getElementById('finalScore'),
    restartBtn: document.getElementById('restartBtn'),
    progressBar: document.getElementById('progressBar'),
    hiddenScore: document.getElementById('hiddenScore'),
    feedbackBubble: document.getElementById('feedbackBubble'),
    streak: document.getElementById('streak'),
    gameOverMessage: document.getElementById('gameOverMessage'),
    loading: document.getElementById('loading')
};

// Game Configuration
const config = {
    questionTime: 5,      // 5 seconds per question
    timeBonus: 1,         // 1 second bonus for correct answers
    maxMistakes: 3,       // 3 lives
    basePoints: 10,       // Base points per correct answer
    streakBonus: 2,       // Bonus points for streaks
    questionDelay: 1000   // 1 second delay between questions
};

// Game State
const state = {
    score: 0,
    timeLeft: config.questionTime,
    mistakes: 0,
    isGameOver: false,
    currentStreak: 0,
    timer: null,
    progressInterval: null,
    currentQuestion: null,
    shuffledCountries: [],
    answeredCorrectly: false,
    isTransitioning: false  // Prevents timer conflicts during transitions
};

// Countries Data
const countries = [
      { name: "O‘zbekiston", capital: "Toshkent", code: "uz" },
      { name: "Rossiya", capital: "Moskva", code: "ru" },
      { name: "AQSH", capital: "Vashington", code: "us" },
      { name: "Buyuk Britaniya", capital: "London", code: "gb" },
      { name: "Fransiya", capital: "Parij", code: "fr" },
      { name: "Germaniya", capital: "Berlin", code: "de" },
      { name: "Italiya", capital: "Rim", code: "it" },
      { name: "Ispaniya", capital: "Madrid", code: "es" },
      { name: "Xitoy", capital: "Pekin", code: "cn" },
      { name: "Yaponiya", capital: "Tokio", code: "jp" },
      { name: "Janubiy Koreya", capital: "Seul", code: "kr" },
      { name: "Hindiston", capital: "Yangi Dehli", code: "in" },
      { name: "Avstraliya", capital: "Kanberra", code: "au" },
      { name: "Kanada", capital: "Ottava", code: "ca" },
      { name: "Braziliya", capital: "Braziliya", code: "br" },
      { name: "Meksika", capital: "Mexiko", code: "mx" },
      { name: "Argentina", capital: "Buenos-Ayres", code: "ar" },
      { name: "Eron", capital: "Tehron", code: "ir" },
      { name: "Turkiya", capital: "Anqara", code: "tr" },
      { name: "Qozog‘iston", capital: "Astana", code: "kz" },
      { name: "Qirg‘iziston", capital: "Bishkek", code: "kg" },
      { name: "Tojikiston", capital: "Dushanbe", code: "tj" },
      { name: "Afg‘oniston", capital: "Kobul", code: "af" },
      { name: "Pokiston", capital: "Islomobod", code: "pk" },
      { name: "Ukraina", capital: "Kiyev", code: "ua" },
      { name: "Polsha", capital: "Varshava", code: "pl" },
      { name: "Chexiya", capital: "Praga", code: "cz" },
      { name: "Slovakiya", capital: "Bratislava", code: "sk" },
      { name: "Gollandiya", capital: "Amsterdam", code: "nl" },
      { name: "Belgiya", capital: "Bryussel", code: "be" },
      { name: "Shvetsiya", capital: "Stokgolm", code: "se" },
      { name: "Norvegiya", capital: "Oslo", code: "no" },
      { name: "Daniya", capital: "Kopengagen", code: "dk" },
      { name: "Finlyandiya", capital: "Helsinki", code: "fi" },
      { name: "Shveysariya", capital: "Bern", code: "ch" },
      { name: "Avstriya", capital: "Vena", code: "at" },
      { name: "Gretsiya", capital: "Afina", code: "gr" },
      { name: "Vengriya", capital: "Budapesht", code: "hu" },
      { name: "Serbiya", capital: "Belgrad", code: "rs" },
      { name: "Xorvatiya", capital: "Zagreb", code: "hr" },
      { name: "Sloveniya", capital: "Lyublyana", code: "si" },
      { name: "Bolgariya", capital: "Sofiya", code: "bg" },
      { name: "Ruminiya", capital: "Buxarest", code: "ro" },
      { name: "Litva", capital: "Vilnyus", code: "lt" },
      { name: "Latviya", capital: "Riga", code: "lv" },
      { name: "Estoniya", capital: "Tallinn", code: "ee" },
      { name: "Belarus", capital: "Minsk", code: "by" },
      { name: "Armaniston", capital: "Yerevan", code: "am" },
      { name: "Ozarbayjon", capital: "Boku", code: "az" },
      { name: "Gruzya", capital: "Tbilisi", code: "ge" },
      { name: "Iroq", capital: "Bag‘dod", code: "iq" },
      { name: "Saudiya Arabistoni", capital: "Er-Riyod", code: "sa" },
      { name: "BAA", capital: "Abu-Dabi", code: "ae" },
      { name: "Qatar", capital: "Doha", code: "qa" },
      { name: "Kuvayt", capital: "Kuvayt", code: "kw" },
      { name: "Yaman", capital: "Sana", code: "ye" },
      { name: "Iordaniya", capital: "Amman", code: "jo" },
      { name: "Isroil", capital: "Tel-Aviv", code: "il" },
      { name: "Falastin", capital: "Ramallah", code: "ps" },
      { name: "Misr", capital: "Qohira", code: "eg" },
      { name: "Liviya", capital: "Tripoli", code: "ly" },
      { name: "Tunis", capital: "Tunis", code: "tn" },
      { name: "Marokash", capital: "Rabat", code: "ma" },
      { name: "Aljir", capital: "Aljir", code: "dz" },
      { name: "Janubiy Afrika", capital: "Pretoriya", code: "za" },
      { name: "Efiopiya", capital: "Addis-Abeba", code: "et" },
      { name: "Keniya", capital: "Nairobi", code: "ke" },
      { name: "Nigeriya", capital: "Abuja", code: "ng" },
      { name: "Gana", capital: "Akra", code: "gh" },
      { name: "Senegal", capital: "Dakar", code: "sn" },
      { name: "Uganda", capital: "Kampala", code: "ug" },
      { name: "Tanzaniya", capital: "Dodoma", code: "tz" },
      { name: "Mozambik", capital: "Maputu", code: "mz" },
      { name: "Zambiya", capital: "Lusaka", code: "zm" },
      { name: "Angola", capital: "Luanda", code: "ao" },
      { name: "Kuba", capital: "Havana", code: "cu" },
      { name: "Dominikana", capital: "Santo-Domingo", code: "do" },
      { name: "Kolumbiya", capital: "Bogota", code: "co" },
      { name: "Venesuela", capital: "Karakas", code: "ve" },
      { name: "Chili", capital: "Santyago", code: "cl" },
      { name: "Peru", capital: "Lima", code: "pe" },
      { name: "Boliviya", capital: "Sucre", code: "bo" },
      { name: "Ekvador", capital: "Kito", code: "ec" },
      { name: "Paragvay", capital: "Asunsion", code: "py" },
      { name: "Urugvay", capital: "Montevideo", code: "uy" },
      { name: "Yangi Zelandiya", capital: "Wellington", code: "nz" },
      { name: "Malayziya", capital: "Kuala-Lumpur", code: "my" },
      { name: "Indoneziya", capital: "Jakarta", code: "id" },
      { name: "Filippin", capital: "Manila", code: "ph" },
      { name: "Tailand", capital: "Bangkok", code: "th" },
      { name: "Vyetnam", capital: "Hanoi", code: "vn" },
      { name: "Kambodja", capital: "Phnompen", code: "kh" },
      { name: "Singapur", capital: "Singapur", code: "sg" },
      { name: "Myanma", capital: "Naypyidaw", code: "mm" },
      { name: "Nepal", capital: "Katmandu", code: "np" },
      { name: "Bangladesh", capital: "Dakka", code: "bd" },
      { name: "Sri-Lanka", capital: "Kolombo", code: "lk" },
      { name: "Islandiya", capital: "Reykjavik", code: "is" },
      { name: "Surinam", capital: "Paramaribo", code: "sr" },
      { name: "Panama", capital: "Panama", code: "pa" }
    ];

// Initialize the game
function initGame() {
    try {
        resetGameState();
        updateUI();
        startTimer();
        generateQuestion();

        // Hide loading screen with smooth transition
        setTimeout(() => {
            if (elements.loading) {
                elements.loading.style.opacity = '0';
                setTimeout(() => {
                    elements.loading.style.display = 'none';
                }, 500);
            }
        }, 800);
    } catch (error) {
        showErrorToUser("Game initialization failed. Please refresh.");
    }
}

function resetGameState() {
    state.score = 0;
    state.timeLeft = config.questionTime;
    state.mistakes = 0;
    state.isGameOver = false;
    state.currentStreak = 0;
    state.currentQuestion = null;
    state.answeredCorrectly = false;
    state.isTransitioning = false;
    state.shuffledCountries = shuffleArray([...countries]);

    clearIntervals();

    if (elements.gameOver) {
        elements.gameOver.classList.remove('active');
    }
}

function clearIntervals() {
    if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
    }
    if (state.progressInterval) {
        clearInterval(state.progressInterval);
        state.progressInterval = null;
    }
}

function startTimer() {
    clearIntervals();

    // Update progress bar continuously for smooth animation
    updateProgressBar();
    state.progressInterval = setInterval(updateProgressBar, 1000 / 60);

    // Main game timer
    state.timer = setInterval(() => {
        if (!state.isTransitioning) {
            state.timeLeft--;
            updateUI();

            if (state.timeLeft <= 0) {
                handleTimeout();
            }
        }
    }, 1000);
}

function updateProgressBar() {
    if (!elements.progressBar) return;

    const percentage = (state.timeLeft / config.questionTime) * 100;
    elements.progressBar.style.width = `${percentage}%`;

    // Visual feedback based on remaining time
    if (percentage < 20) {
        elements.progressBar.style.background = 'linear-gradient(90deg, #ff4757, #e84118)';
    } else if (percentage < 50) {
        elements.progressBar.style.background = 'linear-gradient(90deg, #fbc531, #e84118)';
    } else {
        elements.progressBar.style.background = 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))';
    }
}

function updateUI() {
    if (elements.score) elements.score.textContent = state.score;
    if (elements.timeIndicator) elements.timeIndicator.textContent = `${state.timeLeft}s`;
    if (elements.mistakesIndicator) {
        elements.mistakesIndicator.textContent = `❤️ ${config.maxMistakes - state.mistakes}/${config.maxMistakes}`;
    }
    if (elements.streak) elements.streak.textContent = `🔥 ${state.currentStreak}`;
}

function generateQuestion() {
    if (state.isGameOver) return;

    state.isTransitioning = false;
    state.timeLeft = config.questionTime;
    state.answeredCorrectly = false;
    updateUI();

    // Get next question
    state.currentQuestion = state.shuffledCountries.pop();

    if (!state.currentQuestion) {
        endGame("🎉 All questions completed!");
        return;
    }

    // Update question display
    if (elements.flag) {
        elements.flag.src = `https://flagcdn.com/256x192/${state.currentQuestion.code}.png`;
        elements.flag.onerror = () => {
            if (elements.flag) elements.flag.style.display = 'none';
        };
        elements.flag.style.display = 'block';
    }

    if (elements.question) {
        elements.question.textContent = `What is the capital of ${state.currentQuestion.name}?`;
    }

    createOptions();
    startTimer(); // Restart timer for new question
}

function createOptions() {
    if (!elements.options) return;

    elements.options.innerHTML = '';
    let options = [state.currentQuestion.capital];

    // Generate 3 wrong answers
    while (options.length < 4) {
        let randCapital = countries[Math.floor(Math.random() * countries.length)].capital;
        if (!options.includes(randCapital)) options.push(randCapital);
    }

    // Create buttons for each option
    shuffleArray(options).forEach(option => {
        const button = document.createElement('button');
        button.className = 'option';
        button.textContent = option;
        button.addEventListener('click', () => checkAnswer(option, button));
        elements.options.appendChild(button);
    });
}

function checkAnswer(selected, button) {
    if (state.isGameOver || state.answeredCorrectly) return;

    state.isTransitioning = true;
    clearIntervals();
    state.answeredCorrectly = true;

    const correct = state.currentQuestion.capital;
    const buttons = document.querySelectorAll('.option');

    // Visual feedback
    buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correct) btn.classList.add('option-correct');
        else if (btn === button) btn.classList.add('option-wrong');
    });

    if (selected === correct) {
        handleCorrectAnswer();
    } else {
        handleWrongAnswer();
    }

    // Move to next question after delay
    setTimeout(() => {
        if (!state.isGameOver) generateQuestion();
    }, config.questionDelay);
}

function handleCorrectAnswer() {
    const pointsEarned = config.basePoints + (state.currentStreak * config.streakBonus);
    state.score += pointsEarned;
    state.currentStreak++;

    showFeedback(`+${pointsEarned}`, true);
    addTime(config.timeBonus);
    updateUI();
}

function handleWrongAnswer() {
    state.mistakes++;
    state.currentStreak = 0;

    showFeedback('Wrong!', false);
    updateUI();

    if (state.mistakes >= config.maxMistakes) {
        endGame("❌ No lives remaining!");
    }
}

function handleTimeout() {
    state.isTransitioning = true;
    clearIntervals();

    state.mistakes++;
    state.currentStreak = 0;
    state.answeredCorrectly = true;

    const correct = state.currentQuestion.capital;
    const buttons = document.querySelectorAll('.option');

    buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correct) btn.classList.add('option-correct');
    });

    showFeedback('Time up!', false);
    updateUI();

    if (state.mistakes >= config.maxMistakes) {
        endGame("⏱ Time's up and lives exhausted!");
    } else {
        setTimeout(() => generateQuestion(), config.questionDelay);
    }
}

function addTime(seconds) {
    state.timeLeft = Math.min(state.timeLeft + seconds, config.questionTime);
    updateUI();
}

function showFeedback(text, isCorrect) {
    if (!elements.feedbackBubble) return;

    elements.feedbackBubble.textContent = text;
    elements.feedbackBubble.className = 'feedback-bubble';
    elements.feedbackBubble.classList.add(isCorrect ? 'correct' : 'wrong', 'show');

    setTimeout(() => {
        elements.feedbackBubble.classList.remove('show', 'correct', 'wrong');
    }, 1000);
}

function endGame(message) {
    state.isGameOver = true;
    clearIntervals();

    if (elements.finalScore) elements.finalScore.textContent = state.score;
    if (elements.hiddenScore) elements.hiddenScore.value = state.score;
    if (elements.gameOverMessage) elements.gameOverMessage.textContent = message;
    if (elements.gameOver) elements.gameOver.classList.add('active');
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function showErrorToUser(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ff4444;
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 10000;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Event Listeners
if (elements.restartBtn) {
    elements.restartBtn.addEventListener('click', initGame);
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initGame, 100);
});