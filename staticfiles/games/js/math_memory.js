document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        timer: document.getElementById('timer'),
        score: document.getElementById('score'),
        highScore: document.getElementById('high-score'),
        startBtn: document.getElementById('start-btn'),
        restartBtn: document.getElementById('restart-btn'),
        gameOver: document.getElementById('gameOver'),
        finalScore: document.getElementById('finalScore'),
        playAgainBtn: document.getElementById('playAgainBtn'),
        hiddenScore: document.getElementById('hiddenScore'),
        gameOverMessage: document.getElementById('gameOverMessage'),
        loading: document.getElementById('loading'),
        scoreForm: document.getElementById('scoreForm'),
        gameBoard: document.getElementById('game-board'),
        messageElement: document.getElementById('message') || createMessageElement(),
        csrfToken: document.querySelector('[name=csrfmiddlewaretoken]').value
    };

    // Game Configuration
    const config = {
        totalTime: 180,          // 180 seconds for the entire game
        pointsPerMatch: 10,
        timeBonus: 5,            // seconds added for correct match
        warningThreshold: 30,
        dangerThreshold: 10,
        cardPairs: 12,
        flipSpeed: 300,
        messageDuration: 2000
    };

    // Game State
    const state = {
        cards: [],
        firstCard: null,
        secondCard: null,
        lockBoard: false,
        score: 0,
        highScore: parseInt(localStorage.getItem('mathMemoryHighScore')) || 0,
        timeLeft: config.totalTime,
        timerInterval: null,
        matchedCount: 0,
        gameActive: false,
        gameSlug: 'math_memory'
    };

    // Initialize Game
    function initGame() {
        setupEventListeners();
        updateUI();

        // Set initial button states
        elements.startBtn.style.display = 'block';
        elements.restartBtn.style.display = 'none';
        elements.playAgainBtn.style.display = 'none';

        // Hide loading screen
        setTimeout(hideLoadingScreen, 1000);
    }

    function setupEventListeners() {
        elements.startBtn.addEventListener('click', startGame);
        elements.restartBtn.addEventListener('click', restartGame);
        elements.playAgainBtn.addEventListener('click', restartGame);

        // Save score when leaving page
        window.addEventListener('beforeunload', () => {
            if (state.gameActive && state.score > 0) {
                saveScoreToServer();
            }
        });
    }

    // Game Control Functions
    function startGame() {
        resetGameState();
        createCards();
        state.gameActive = true;
        updateUI();

        // Update button visibility
        elements.startBtn.style.display = 'none';
        elements.restartBtn.style.display = 'block';

        // Start game timer
        state.timerInterval = setInterval(updateTimer, 1000);
    }

    function restartGame() {
        if (state.score > 0) {
            saveScoreToServer();
        }
        startGame();
    }

    function resetGameState() {
        clearInterval(state.timerInterval);
        state.cards = [];
        state.firstCard = null;
        state.secondCard = null;
        state.lockBoard = false;
        state.score = 0;
        state.timeLeft = config.totalTime;
        state.matchedCount = 0;
        state.gameActive = false;

        // Reset UI
        elements.gameOver.classList.remove('active');
        hideMessage();
        elements.gameBoard.innerHTML = '';

        // Update displays
        updateUI();
    }

    // Game Logic
    function createCards() {
    const expressions = [
        "2 + 3", "4 × 2", "6 − 1", "12 ÷ 4", "5 + 4", "3 × 3", "8 − 2",
        "10 ÷ 2", "7 + 6", "9 − 4", "2 × 5", "14 ÷ 2", "3 + 9", "16 − 8",
        "18 ÷ 3", "6 × 2", "1 + 1", "11 − 5", "5 × 3", "20 ÷ 4", "7 + 8",
        "15 − 6", "4 × 4", "24 ÷ 3", "9 + 7", "13 − 5", "5 × 5", "30 ÷ 5"
    ].slice(0, 18); // 18 pairs for 4×9 grid (36 cards total)

    const cardData = expressions.flatMap(expr => {
        const jsExpr = expr.replace('×', '*').replace('−', '-').replace('÷', '/');
        const result = eval(jsExpr);
        return [
            { type: 'expr', value: expr },
            { type: 'res', value: result.toString() }
        ];
    });

    state.cards = shuffleArray(cardData);

    // Create card elements
    state.cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.index = index;
        cardElement.dataset.type = card.type;
        cardElement.dataset.value = card.value;

        cardElement.addEventListener('click', () => handleCardClick(cardElement));
        elements.gameBoard.appendChild(cardElement);
    });
}


    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    function handleCardClick(cardElement) {
        if (!state.gameActive || state.lockBoard ||
            cardElement.classList.contains('flipped') ||
            cardElement.classList.contains('matched')) {
            return;
        }

        flipCard(cardElement);

        if (!state.firstCard) {
            state.firstCard = cardElement;
            return;
        }

        state.secondCard = cardElement;
        state.lockBoard = true;

        setTimeout(checkForMatch, config.flipSpeed);
    }

    function flipCard(cardElement) {
    cardElement.textContent = cardElement.dataset.value;
    cardElement.classList.add('flipped');

    // Force reflow to ensure animation plays
    void cardElement.offsetWidth;
}

// Updated handleMismatch function:
function handleMismatch() {
    showMessage('Notoʻgʻri! Qayta urinib koʻring', 'error');

    setTimeout(() => {
        state.firstCard.textContent = '';
        state.firstCard.classList.remove('flipped');
        state.secondCard.textContent = '';
        state.secondCard.classList.remove('flipped');
        resetBoard();
    }, config.flipSpeed * 2);
}

    function checkForMatch() {
        const isMatch = checkCardMatch(state.firstCard, state.secondCard);
        isMatch ? handleMatch() : handleMismatch();
    }

    function checkCardMatch(card1, card2) {
        if (card1.dataset.type === card2.dataset.type) return false;

        const expr = card1.dataset.type === 'expr' ? card1.dataset.value : card2.dataset.value;
        const result = card1.dataset.type === 'res' ? card1.dataset.value : card2.dataset.value;
        const jsExpr = expr.replace('×', '*').replace('−', '-').replace('÷', '/');

        return eval(jsExpr).toString() === result;
    }

    function handleMatch() {
        state.firstCard.classList.add('matched');
        state.secondCard.classList.add('matched');

        state.matchedCount += 2;
        state.score += config.pointsPerMatch;
        state.timeLeft = Math.min(state.timeLeft + config.timeBonus, config.totalTime);

        updateUI();
        showMessage(`To'g'ri! +${config.pointsPerMatch} ball`, 'success');

        resetBoard();
        checkWin();
    }

    function handleMismatch() {
        showMessage('Notoʻgʻri! Qayta urinib koʻring', 'error');

        setTimeout(() => {
            state.firstCard.textContent = '';
            state.secondCard.textContent = '';
            state.firstCard.classList.remove('flipped');
            state.secondCard.classList.remove('flipped');
            resetBoard();
        }, config.flipSpeed * 2);
    }

    function resetBoard() {
        state.firstCard = null;
        state.secondCard = null;
        state.lockBoard = false;
    }

    // Timer Functions
    function updateTimer() {
        state.timeLeft--;
        updateUI();

        // Handle timer warnings
        if (state.timeLeft <= config.dangerThreshold) {
            elements.timer.classList.add('danger');
            elements.timer.classList.remove('warning');
        }
        else if (state.timeLeft <= config.warningThreshold) {
            elements.timer.classList.add('warning');
        }

        // End game if time runs out
        if (state.timeLeft <= 0) {
            gameOver(false);
        }
    }

    // Game End Logic
    function checkWin() {
        if (state.matchedCount === state.cards.length) {
            gameOver(true);
        }
    }

    function gameOver(isWin) {
        clearInterval(state.timerInterval);
        state.gameActive = false;

        // Update high score
        if (state.score > state.highScore) {
            state.highScore = state.score;
            localStorage.setItem('mathMemoryHighScore', state.highScore);
        }

        // Update game over screen
        elements.finalScore.textContent = state.score;
        elements.hiddenScore.value = state.score;

        const message = isWin
            ? `Tabriklaymiz! Barcha ${config.cardPairs} juftlikni topdingiz!`
            : `Vaqt tugadi! ${state.matchedCount/2} juftlik topdingiz.`;
        elements.gameOverMessage.textContent = message;

        // Show game over screen
        elements.gameOver.classList.add('active');

        // Update button visibility
        elements.startBtn.style.display = 'none';
        elements.restartBtn.style.display = 'none';
        elements.playAgainBtn.style.display = 'block';

        // Save score
        saveScoreToServer();
    }

    // Score Saving
    function saveScoreToServer() {
        if (state.score <= 0) return;

        const formData = new FormData();
        formData.append('score', state.score);
        formData.append('csrfmiddlewaretoken', elements.csrfToken);

        fetch(`/games/${state.gameSlug}/save-score/`, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => console.log('Score saved:', data))
        .catch(error => console.error('Error saving score:', error));
    }

    // UI Functions
    function updateUI() {
        // Update displays with emojis
        elements.timer.innerHTML = `⏱ ${state.timeLeft}`;
        elements.score.innerHTML = `🔢 ${state.score}`;
        elements.highScore.innerHTML = `🏆 ${state.highScore}`;
    }

    function showMessage(text, type) {
        elements.messageElement.textContent = text;
        elements.messageElement.className = `message ${type}`;
        elements.messageElement.style.opacity = '1';

        setTimeout(hideMessage, config.messageDuration);
    }

    function hideMessage() {
        elements.messageElement.style.opacity = '0';
        setTimeout(() => {
            elements.messageElement.textContent = '';
            elements.messageElement.className = 'message';
        }, 300);
    }

    function hideLoadingScreen() {
        elements.loading.style.opacity = '0';
        setTimeout(() => {
            elements.loading.style.display = 'none';
        }, 500);
    }

    function createMessageElement() {
        const msgEl = document.createElement('div');
        msgEl.id = 'message';
        msgEl.className = 'message';
        document.body.appendChild(msgEl);
        return msgEl;
    }

    // Initialize the game
    initGame();
});