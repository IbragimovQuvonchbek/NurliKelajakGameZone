document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements with null checks
    const getElement = (id) => {
        const el = document.getElementById(id);
        if (!el) console.error(`Element with ID '${id}' not found`);
        return el;
    };

    const elements = {
        level: getElement('level'),
        score: getElement('score'),
        highScore: getElement('high-score'),
        startBtn: getElement('start-btn'),
        strictBtn: getElement('strict-btn'),
        gameOver: getElement('gameOver'),
        finalScore: getElement('finalScore'),
        restartBtn: getElement('restartBtn'),
        hiddenScore: getElement('hiddenScore'),
        gameOverMessage: getElement('gameOverMessage'),
        loading: getElement('loading'),
        scoreForm: getElement('scoreForm'),
        colorButtons: document.querySelectorAll('.color-btn'),
        messageElement: getElement('message')
    };

    // Sound effects with error handling
    const sounds = {
        red: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3'),
        blue: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3'),
        green: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3'),
        yellow: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3'),
        error: new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3'),
        success: new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3')
    };

    // Verify all sounds loaded
    Object.values(sounds).forEach(sound => {
        sound.onerror = () => console.error('Failed to load sound:', sound.src);
    });

    // Game Configuration
    const config = {
        initialLevel: 1,
        maxLevel: 20,
        pointsPerLevel: 10,
        speed: 800,
        maxMistakes: 3,
        strictMode: false
    };

    // Game State
    let state = {
        sequence: [],
        playerSequence: [],
        level: config.initialLevel,
        score: 0,
        highScore: localStorage.getItem('simonHighScore') || 0,
        mistakes: 0,
        gameActive: false,
        computerPlaying: false,
        strictMode: config.strictMode,
        timer: null
    };

    // Initialize Game
    function initGame() {
        // Verify essential elements exist
        if (!elements.level || !elements.score || !elements.startBtn) {
            console.error('Essential game elements missing');
            return;
        }

        resetGameState();
        updateUI();

        // Event listeners with error handling
        try {
            elements.startBtn.addEventListener('click', startGame);
            elements.strictBtn.addEventListener('click', toggleStrictMode);
            elements.restartBtn.addEventListener('click', startGame);

            elements.colorButtons.forEach(button => {
                button.addEventListener('click', () => {
                    if (state.gameActive && !state.computerPlaying) {
                        const color = button.dataset.color;
                        handlePlayerMove(color);
                    }
                });
            });

            // Score form submission
            elements.scoreForm?.addEventListener('submit', (e) => {
                const score = parseInt(elements.hiddenScore.value);
                if (isNaN(score) || score < 0) {
                    e.preventDefault();
                    showMessage('Xato: Noto\'g\'ri ball', 'error');
                }
            });

            // Hide loading screen
            setTimeout(() => {
                if (elements.loading) {
                    elements.loading.style.opacity = '0';
                    setTimeout(() => {
                        elements.loading.style.display = 'none';
                    }, 500);
                }
            }, 1000);
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    function resetGameState() {
        clearTimeout(state.timer);
        state.sequence = [];
        state.playerSequence = [];
        state.level = config.initialLevel;
        state.score = 0;
        state.mistakes = 0;
        state.gameActive = false;
        state.computerPlaying = false;

        if (elements.gameOver) elements.gameOver.classList.remove('active');
        hideMessage();
    }

    function startGame() {
        resetGameState();
        state.gameActive = true;
        if (elements.startBtn) elements.startBtn.textContent = 'Qayta Boshlash';
        nextLevel();
    }

    function nextLevel() {
        state.playerSequence = [];
        state.computerPlaying = true;

        // Add a new random color to the sequence
        const colors = ['red', 'blue', 'green', 'yellow'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        state.sequence.push(randomColor);

        // Update level and score
        state.level++;
        state.score = (state.level - 1) * config.pointsPerLevel;
        updateUI();

        // Show the sequence to the player
        showSequence();
    }

    function showSequence() {
        let i = 0;
        clearTimeout(state.timer);

        const showNextColor = () => {
            if (i >= state.sequence.length) {
                state.computerPlaying = false;
                return;
            }

            const color = state.sequence[i];
            lightUpButton(color);
            playSound(color);
            i++;

            state.timer = setTimeout(showNextColor, config.speed);
        };

        showNextColor();
    }

    function handlePlayerMove(color) {
        if (!state.gameActive || state.computerPlaying) return;

        playSound(color);
        lightUpButton(color);
        state.playerSequence.push(color);
        checkPlayerMove();
    }

    function checkPlayerMove() {
        const index = state.playerSequence.length - 1;

        if (state.playerSequence[index] !== state.sequence[index]) {
            // Wrong move
            state.mistakes++;
            playSound('error');
            showMessage(`Noto'g'ri! Xatolar: ${state.mistakes}/${config.maxMistakes}`, 'error');

            if (state.strictMode || state.mistakes >= config.maxMistakes) {
                // Game over in strict mode or after max mistakes
                setTimeout(() => gameOver(), 1000);
            } else {
                // Show sequence again in normal mode
                setTimeout(() => {
                    state.playerSequence = [];
                    state.computerPlaying = true;
                    showSequence();
                }, 1500);
            }
            return;
        }

        // Correct move
        if (state.playerSequence.length === state.sequence.length) {
            // Completed the sequence
            playSound('success');
            showMessage('To\'g\'ri! Keyingi daraja...', 'success');

            if (state.level === config.maxLevel) {
                // Won the game
                setTimeout(() => gameOver(true), 1000);
                return;
            }

            // Advance to next level
            setTimeout(() => {
                hideMessage();
                nextLevel();
            }, 1500);
        }
    }

    function gameOver(isWin = false) {
        state.gameActive = false;
        state.computerPlaying = false;
        clearTimeout(state.timer);

        // Update high score if needed
        if (state.score > state.highScore) {
            state.highScore = state.score;
            localStorage.setItem('simonHighScore', state.highScore);
        }

        // Show game over screen
        if (elements.finalScore) elements.finalScore.textContent = state.score;
        if (elements.hiddenScore) elements.hiddenScore.value = state.score;

        const message = isWin
            ? 'Tabriklaymiz! Siz yutdingiz!'
            : `O'yin tugadi! ${state.level - 1} darajagacha yetdingiz!`;

        if (elements.gameOverMessage) elements.gameOverMessage.textContent = message;
        if (elements.gameOver) elements.gameOver.classList.add('active');
    }

    function lightUpButton(color) {
        const button = document.getElementById(color);
        if (!button) return;

        button.classList.add('active');
        setTimeout(() => {
            button.classList.remove('active');
        }, 300);
    }

    function playSound(color) {
        const sound = sounds[color];
        if (!sound) return;

        try {
            sound.currentTime = 0;
            sound.play().catch(e => console.error('Sound play failed:', e));
        } catch (error) {
            console.error('Sound error:', error);
        }
    }

    function toggleStrictMode() {
        state.strictMode = !state.strictMode;

        if (elements.strictBtn) {
            elements.strictBtn.classList.toggle('strict-on');
            elements.strictBtn.textContent = `Qattiq Rejim: ${state.strictMode ? 'YOQILGAN' : 'O\'CHIRILGAN'}`;
            elements.strictBtn.style.backgroundColor = state.strictMode ? '#2ecc71' : '#e74c3c';
        }
    }

    function updateUI() {
        if (elements.level) elements.level.textContent = state.level - 1;
        if (elements.score) elements.score.textContent = state.score;
        if (elements.highScore) elements.highScore.textContent = state.highScore;
    }

    function showMessage(text, type) {
        if (!elements.messageElement) return;

        elements.messageElement.textContent = text;
        elements.messageElement.className = `message ${type}`;
        elements.messageElement.style.opacity = '1';

        // Auto-hide message after 2 seconds
        setTimeout(hideMessage, 2000);
    }

    function hideMessage() {
        if (!elements.messageElement) return;

        elements.messageElement.style.opacity = '0';
        setTimeout(() => {
            elements.messageElement.textContent = '';
            elements.messageElement.className = 'message';
        }, 300);
    }

    // Initialize the game
    initGame();
});