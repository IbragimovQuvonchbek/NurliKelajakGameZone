document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        sequence: document.getElementById('sequence'),
        input: document.getElementById('input'),
        submit: document.getElementById('submit'),
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
        loading: document.getElementById('loading'),
        gameOverMessage: document.getElementById('gameOverMessage')
    };

    // Game Configuration
    const config = {
        initialTime: 15,
        maxTime: 15,
        maxMistakes: 3,
        basePoints: { arithmetic: 10, geometric: 15, fibonacci: 20 },
        speedBonus: 5,
        glowChance: 0.3
    };

    // Game State
    let state = {
        score: 0,
        timeLeft: config.initialTime,
        mistakes: 0,
        isGameOver: false,
        isGlowing: false,
        currentStreak: 0,
        timer: null,
        progressInterval: null,
        correctAnswer: null,
        currentPoints: 0,
        startTime: 0
    };

    // Initialize Game
    function initGame() {
        resetGameState();
        updateUI();
        startTimer();
        generateSequence();

        // Hide loading screen
        setTimeout(() => {
            elements.loading.style.opacity = '0';
            setTimeout(() => {
                elements.loading.style.display = 'none';
                elements.input.focus(); // Focus input field when game starts
            }, 500);
        }, 1000);
    }

    function resetGameState() {
        clearIntervals();

        state = {
            score: 0,
            timeLeft: config.initialTime,
            mistakes: 0,
            isGameOver: false,
            isGlowing: false,
            currentStreak: 0,
            timer: null,
            progressInterval: null,
            correctAnswer: null,
            currentPoints: 0,
            startTime: 0
        };

        elements.gameOver.classList.remove('active');
        elements.sequence.classList.remove('glow');
        elements.input.value = '';
        elements.input.disabled = false;
        elements.submit.disabled = false;
    }

    function clearIntervals() {
        if (state.timer) clearInterval(state.timer);
        if (state.progressInterval) clearInterval(state.progressInterval);
    }

    function startTimer() {
        updateProgressBar();
        state.progressInterval = setInterval(updateProgressBar, 1000 / 60);

        state.timer = setInterval(() => {
            state.timeLeft--;
            updateUI();

            if (state.timeLeft <= 0) {
                endGame('Vaqt tugadi!');
            }
        }, 1000);
    }

    function updateProgressBar() {
        const percentage = (state.timeLeft / config.maxTime) * 100;
        elements.progressBar.style.width = `${percentage}%`;

        if (percentage < 20) {
            elements.progressBar.style.background = 'linear-gradient(90deg, #ff4757, #e84118)';
            elements.timeIndicator.style.color = '#ff4757';
        } else if (percentage < 50) {
            elements.progressBar.style.background = 'linear-gradient(90deg, #fbc531, #e84118)';
            elements.timeIndicator.style.color = '#fbc531';
        } else {
            elements.progressBar.style.background = 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))';
            elements.timeIndicator.style.color = 'var(--primary-color)';
        }
    }

    function updateUI() {
        elements.score.textContent = state.score;
        elements.timeIndicator.textContent = `${state.timeLeft}s`;
        elements.mistakesIndicator.textContent = `Jon: ${config.maxMistakes - state.mistakes}/${config.maxMistakes}`;
        elements.streak.textContent = state.currentStreak;
    }

    function generateSequence() {
        if (state.isGameOver) return;

        // Clear input field and focus it
        elements.input.value = '';
        elements.input.focus();

        state.isGlowing = Math.random() < config.glowChance;
        elements.sequence.classList.toggle('glow', state.isGlowing);
        state.startTime = Date.now();

        const patterns = [
            // Arithmetic: +2
            () => {
                const start = Math.floor(Math.random() * 10) + 1;
                const sequence = [start, start + 2, start + 4, start + 6, start + 8];
                return { sequence: sequence.slice(0, 4), answer: sequence[4], points: config.basePoints.arithmetic };
            },
            // Arithmetic: +3
            () => {
                const start = Math.floor(Math.random() * 10) + 1;
                const sequence = [start, start + 3, start + 6, start + 9, start + 12];
                return { sequence: sequence.slice(0, 4), answer: sequence[4], points: config.basePoints.arithmetic };
            },
            // Arithmetic: +5
            () => {
                const start = Math.floor(Math.random() * 10) + 1;
                const sequence = [start, start + 5, start + 10, start + 15, start + 20];
                return { sequence: sequence.slice(0, 4), answer: sequence[4], points: config.basePoints.arithmetic };
            },
            // Geometric: *2
            () => {
                const start = Math.floor(Math.random() * 5) + 1;
                const sequence = [start, start * 2, start * 4, start * 8, start * 16];
                return { sequence: sequence.slice(0, 4), answer: sequence[4], points: config.basePoints.geometric };
            },
            // Geometric: *3
            () => {
                const start = Math.floor(Math.random() * 5) + 1;
                const sequence = [start, start * 3, start * 9, start * 27, start * 81];
                return { sequence: sequence.slice(0, 4), answer: sequence[4], points: config.basePoints.geometric };
            },
            // Fibonacci-like
            () => {
                const start1 = Math.floor(Math.random() * 5) + 1;
                const start2 = Math.floor(Math.random() * 5) + 1;
                const sequence = [start1, start2];
                for (let i = 2; i < 5; i++) {
                    sequence.push(sequence[i - 1] + sequence[i - 2]);
                }
                return { sequence: sequence.slice(0, 4), answer: sequence[4], points: config.basePoints.fibonacci };
            }
        ];

        const pattern = patterns[Math.floor(Math.random() * patterns.length)]();
        state.correctAnswer = pattern.answer;
        state.currentPoints = pattern.points;
        elements.sequence.textContent = `${pattern.sequence.join(', ')}, ?`;
    }

    function checkAnswer() {
        if (state.isGameOver) return;

        const userAnswer = parseInt(elements.input.value);
        if (isNaN(userAnswer)) {
            showFeedback('Iltimos, son kiriting!', false);
            return;
        }

        const elapsedTime = (Date.now() - state.startTime) / 1000;

        if (userAnswer === state.correctAnswer) {
            handleCorrectAnswer(elapsedTime);
        } else {
            handleWrongAnswer();
        }
    }

    function handleCorrectAnswer(elapsedTime) {
        const speedBonus = elapsedTime <= 5 ? config.speedBonus : 0;
        const pointsEarned = state.currentPoints + speedBonus;

        state.score += pointsEarned;
        state.currentStreak++;
        state.timeLeft = config.initialTime;
        showFeedback(`+${pointsEarned}`, true);
        updateUI();
        updateProgressBar();

        // Move to next question after delay
        setTimeout(() => {
            generateSequence();
        }, 1000);
    }

    function handleWrongAnswer() {
        state.mistakes++;
        state.currentStreak = 0;
        showFeedback(`Noto'g'ri!`, false);
        updateUI();
        updateProgressBar();

        if (state.mistakes >= config.maxMistakes) {
            endGame('Siz 3 ta xato qildingiz!');
        } else {
            // Show same sequence again
            setTimeout(() => {
                elements.input.value = '';
                elements.input.focus();
            }, 1000);
        }
    }

    function showFeedback(text, isCorrect) {
        elements.feedbackBubble.textContent = text;
        elements.feedbackBubble.className = 'feedback-bubble';
        elements.feedbackBubble.classList.add(isCorrect ? 'correct' : 'wrong', 'show');

        setTimeout(() => {
            elements.feedbackBubble.classList.remove('show', 'correct', 'wrong');
            elements.feedbackBubble.textContent = '';
        }, 1000);
    }

    function endGame(message) {
        state.isGameOver = true;
        clearIntervals();
        elements.finalScore.textContent = state.score;
        elements.hiddenScore.value = state.score;
        elements.gameOverMessage.textContent = message;
        elements.gameOver.classList.add('active');
        elements.input.disabled = true;
        elements.submit.disabled = true;
    }

    // Event Listeners
    elements.submit.addEventListener('click', checkAnswer);
    elements.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });

    // Refresh page when Play Again button is clicked
    elements.restartBtn.addEventListener('click', () => {
        location.reload();
    });

    // Start the game
    initGame();
});