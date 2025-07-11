document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        equation: document.getElementById('equation'),
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
        multiplierValue: document.querySelector('.multiplier-value'),
        loading: document.getElementById('loading'),
        scoreForm: document.getElementById('scoreForm'),
        gameOverMessage: document.getElementById('gameOverMessage')
    };

    // Game Configuration
    const config = {
        initialTime: 7,
        maxTime: 7,
        timeBonus: 2,
        maxMistakes: 3,
        basePoints: 1,
        streakBonus: 0.5,
        glowMultiplier: 2
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
        progressInterval: null
    };

    // Initialize Game
    function initGame() {
        resetGameState();
        updateUI();
        startTimer();
        generateEquation();

        // Hide loading screen
        setTimeout(() => {
            elements.loading.style.opacity = '0';
            setTimeout(() => {
                elements.loading.style.display = 'none';
            }, 500);
        }, 1000);

        // Handle form submission
        elements.scoreForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const response = await fetch(elements.scoreForm.action, {
                    method: 'POST',
                    body: new FormData(elements.scoreForm),
                });
                if (response.ok) {
                    window.location.href = elements.scoreForm.action;
                } else {
                    alert('Failed to save score. Please try again.');
                }
            } catch (error) {
                alert('Network error. Please check your connection and try again.');
            }
        });
    }

    function resetGameState() {
        state = {
            score: 0,
            timeLeft: config.initialTime,
            mistakes: 0,
            isGameOver: false,
            isGlowing: false,
            currentStreak: 0,
            timer: null,
            progressInterval: null
        };
        elements.gameOver.classList.remove('active');
        elements.equation.classList.remove('glow');
        clearIntervals();
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
                endGame('Time ran out!');
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
        elements.mistakesIndicator.textContent = `Lives: ${config.maxMistakes - state.mistakes}/${config.maxMistakes}`;
        elements.streak.textContent = state.currentStreak;

        const multiplier = state.isGlowing ? config.glowMultiplier :
                          (1 + (state.currentStreak * config.streakBonus));
        elements.multiplierValue.textContent = multiplier.toFixed(1);
    }

    function addTime(seconds) {
        state.timeLeft = Math.min(state.timeLeft + seconds, config.maxTime);
        showTimeFeedback(`+${seconds}s`);
        updateUI();
    }

    function showTimeFeedback(text) {
        const feedback = document.createElement('span');
        feedback.className = 'time-feedback';
        feedback.textContent = text;
        elements.timeIndicator.appendChild(feedback);

        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateY(-10px)';
            setTimeout(() => feedback.remove(), 300);
        }, 800);
    }

    function showMistakeFeedback() {
        const feedback = document.createElement('span');
        feedback.className = 'mistake-feedback';
        feedback.textContent = `Mistake ${state.mistakes}/${config.maxMistakes}`;
        elements.mistakesIndicator.appendChild(feedback);

        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateY(-10px)';
            setTimeout(() => feedback.remove(), 300);
        }, 800);
    }

    function generateEquation() {
        if (state.isGameOver) return;

        state.isGlowing = Math.random() < 0.3;
        elements.equation.classList.toggle('glow', state.isGlowing);

        const num1 = Math.floor(Math.random() * 20) + 1;
        const num2 = Math.floor(Math.random() * 20) + 1;
        const correctAnswer = num1 + num2;

        let wrongAnswer;
        do {
            const offset = Math.floor(Math.random() * 4) + 1;
            wrongAnswer = Math.random() < 0.5 ? correctAnswer + offset : correctAnswer - offset;
        } while (wrongAnswer === correctAnswer || wrongAnswer <= 0);

        const isCorrectOption = Math.random() < 0.75;
        const displayedAnswer = isCorrectOption ? correctAnswer : wrongAnswer;

        elements.equation.textContent = `${num1} + ${num2} = ${displayedAnswer}`;
        createOptions(isCorrectOption);
    }

    function createOptions(isCorrect) {
        elements.options.innerHTML = '';

        const options = [
            { text: '✓', isCorrect: isCorrect, className: 'option-correct' },
            { text: '✗', isCorrect: !isCorrect, className: 'option-wrong' }
        ];

        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        options.forEach(option => {
            const button = document.createElement('button');
            button.className = `option ${option.className}`;
            button.innerHTML = `<span class="option-icon">${option.text}</span>`;
            button.addEventListener('click', () => checkAnswer(option.isCorrect));
            elements.options.appendChild(button);
        });
    }

    function checkAnswer(isCorrect) {
        if (state.isGameOver) return;

        if (isCorrect) {
            handleCorrectAnswer();
        } else {
            handleWrongAnswer();
        }

        setTimeout(generateEquation, 1000);
    }

    function handleCorrectAnswer() {
        const basePoints = config.basePoints;
        const streakBonus = state.currentStreak * config.streakBonus;
        const glowBonus = state.isGlowing ? config.glowMultiplier : 1;
        const pointsEarned = Math.floor((basePoints + streakBonus) * glowBonus);

        state.score += pointsEarned;
        state.currentStreak++;
        addTime(config.timeBonus);
        showFeedback(`+${pointsEarned}`, true);
        updateUI();
        updateProgressBar();
    }

    function handleWrongAnswer() {
        state.mistakes++;
        state.currentStreak = 0;
        showMistakeFeedback();
        showFeedback('Wrong!', false);
        updateUI();
        updateProgressBar();

        if (state.mistakes >= config.maxMistakes) {
            endGame('You made 3 mistakes!');
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
    }

    // Event Listeners
    elements.restartBtn.addEventListener('click', initGame);

    // Start the game
    window.addEventListener('load', initGame);
});