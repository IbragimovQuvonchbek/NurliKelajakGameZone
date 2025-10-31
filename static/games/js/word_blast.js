// Word Blast Game - Unscramble words within time limit

class WordBlast {
    constructor(canvasId = 'gameCanvas', difficulty = 'medium') {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.difficulty = difficulty;
        this.gameState = 'ready'; // ready, playing, gameOver
        this.score = 0;
        this.round = 0;
        this.maxRounds = 10;
        this.timeLeft = 60;
        this.totalTime = 60;
        this.currentWord = null;
        this.scrambledLetters = [];
        this.selectedLetters = [];
        this.usedWords = new Set(); // Track used words to prevent duplicates
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Difficulty settings
        this.difficultySettings = {
            'easy': { minLength: 3, maxLength: 4, timePerWord: 8 },
            'medium': { minLength: 5, maxLength: 6, timePerWord: 10 },
            'hard': { minLength: 7, maxLength: 8, timePerWord: 12 }
        };

        // Expanded word list (same as before)
        this.words = [
            // Easy words (3-4 letters)
            'cat', 'dog', 'bird', 'fish', 'tree', 'rain', 'wind', 'fire', 'snow', 'moon',
            'sun', 'star', 'book', 'pen', 'car', 'bus', 'hat', 'cup', 'key', 'ball',
            'house', 'door', 'window', 'chair', 'table', 'water', 'flower', 'cloud', 'grass', 'stone',
            'apple', 'banana', 'orange', 'grape', 'lemon', 'peach', 'pear', 'mango', 'berry', 'cherry',
            'red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'brown', 'gray', 'purple',
            'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
            'mother', 'father', 'sister', 'brother', 'family', 'friend', 'teacher', 'student', 'doctor', 'nurse',
            'school', 'class', 'desk', 'pencil', 'paper', 'ruler', 'eraser', 'glue', 'paint', 'music',
            'animal', 'tiger', 'lion', 'bear', 'wolf', 'fox', 'deer', 'rabbit', 'mouse', 'horse',
            'summer', 'winter', 'spring', 'autumn', 'season', 'weather', 'storm', 'lightning', 'thunder', 'rainbow',

            // Medium words (5-6 letters)
            'house', 'water', 'peace', 'dream', 'fruit', 'smile', 'dance', 'music', 'light', 'heart',
            'beauty', 'nature', 'flower', 'garden', 'forest', 'river', 'mountain', 'valley', 'island', 'ocean',
            'friend', 'family', 'school', 'teacher', 'student', 'pencil', 'notebook', 'backpack', 'library', 'science',
            'animal', 'tiger', 'elephant', 'giraffe', 'monkey', 'butterfly', 'dolphin', 'penguin', 'kangaroo', 'zebra',
            'color', 'yellow', 'orange', 'purple', 'silver', 'golden', 'bright', 'dark', 'light', 'shadow',
            'happy', 'joyful', 'smiling', 'laughing', 'dancing', 'singing', 'playing', 'running', 'jumping', 'swimming',
            'computer', 'keyboard', 'monitor', 'printer', 'internet', 'website', 'browser', 'program', 'digital', 'virtual',
            'country', 'city', 'village', 'street', 'building', 'apartment', 'garden', 'park', 'bridge', 'tunnel',
            'weather', 'sunny', 'cloudy', 'rainy', 'windy', 'stormy', 'snowy', 'foggy', 'hot', 'cold',
            'food', 'pizza', 'burger', 'salad', 'sandwich', 'cookie', 'chocolate', 'icecream', 'coffee', 'juice',

            // Hard words (7+ letters)
            'adventure', 'celebrate', 'dangerous', 'knowledge', 'beautiful', 'community', 'elephant', 'favorite',
            'mysterious', 'wonderful', 'fantastic', 'incredible', 'magnificent', 'brilliant', 'excellent', 'wonderful',
            'university', 'education', 'graduation', 'celebration', 'congratulations', 'communication', 'information', 'technology',
            'butterfly', 'dragonfly', 'hummingbird', 'caterpillar', 'grasshopper', 'ladybug', 'firefly', 'mosquito',
            'restaurant', 'cafeteria', 'supermarket', 'bookstore', 'pharmacy', 'hospital', 'apartment', 'building',
            'mountain', 'volcano', 'waterfall', 'landscape', 'wilderness', 'adventure', 'exploration', 'discovery',
            'chocolate', 'strawberry', 'blueberry', 'raspberry', 'pineapple', 'watermelon', 'cantaloupe', 'pomegranate',
            'basketball', 'football', 'baseball', 'volleyball', 'tennis', 'swimming', 'gymnastics', 'athletics',
            'photograph', 'camera', 'picture', 'landscape', 'portrait', 'sunset', 'sunrise', 'horizon',
            'friendship', 'relationship', 'companionship', 'partnership', 'collaboration', 'cooperation', 'understanding', 'appreciation'
        ];

        this.init();
        this.setupEventListeners();
        this.createVirtualKeyboard();
    }

    init() {
        if (this.canvas) {
            this.resizeCanvas();
        }
    }

    resizeCanvas() {
        if (!this.canvas) return;

        const container = this.canvas.parentElement;
        let width = container.clientWidth || 800;
        let height = container.clientHeight || 600;

        // Adjust for mobile
        if (this.isMobile) {
            width = Math.min(width, 400);
            height = Math.min(height, 300);
        }

        if (width > 0 && height > 0) {
            this.canvas.width = width;
            this.canvas.height = height;
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());

        // Keyboard input for typing letters (only for desktop)
        if (!this.isMobile) {
            document.addEventListener('keydown', (e) => {
                if (this.gameState === 'playing') {
                    const letter = e.key.toLowerCase();
                    if (/^[a-z]$/.test(letter)) {
                        this.selectLetter(letter);
                    } else if (e.key === 'Backspace') {
                        this.removeLetter();
                    } else if (e.key === 'Enter') {
                        this.submitWord();
                    }
                }
            });
        }
    }

    createVirtualKeyboard() {
        const keyboardContainer = document.getElementById('virtualKeyboard');
        if (!keyboardContainer) return;

        // Clear existing keyboard
        keyboardContainer.innerHTML = '';

        // Create keyboard buttons for A-Z
        for (let i = 65; i <= 90; i++) {
            const letter = String.fromCharCode(i).toLowerCase();
            const button = document.createElement('button');
            button.className = 'keyboard-btn';
            button.textContent = letter.toUpperCase();
            button.onclick = () => this.selectLetter(letter);
            keyboardContainer.appendChild(button);
        }
    }

    selectLetter(letter) {
        if (this.gameState !== 'playing') return;

        // Find available letters (excluding already selected ones)
        const availableLetters = [...this.scrambledLetters];
        const selectedIndices = this.selectedLetters.map(s => s.index);

        // Mark selected letters as unavailable
        selectedIndices.forEach(idx => {
            availableLetters[idx] = null;
        });

        // Find the first available occurrence of the letter
        for (let i = 0; i < availableLetters.length; i++) {
            if (availableLetters[i] === letter) {
                this.selectedLetters.push({
                    letter: letter,
                    index: i
                });
                this.draw();
                this.updateScoreDisplay();
                return;
            }
        }
    }

    removeLetter() {
        if (this.selectedLetters.length > 0) {
            this.selectedLetters.pop();
            this.draw();
            this.updateScoreDisplay();
        }
    }

    updateScoreDisplay() {
        if (typeof updateScoreDisplay === 'function') {
            updateScoreDisplay(this.score);
        }
    }

    getRandomWord() {
        const settings = this.difficultySettings[this.difficulty];

        // Filter words by length and exclude used words
        const availableWords = this.words.filter(
            w => w.length >= settings.minLength &&
                 w.length <= settings.maxLength &&
                 !this.usedWords.has(w)
        );

        // If no available words, reset used words (for very long games)
        if (availableWords.length === 0) {
            this.usedWords.clear();
            return this.getRandomWord(); // Try again with reset used words
        }

        // Improved random selection
        const randomIndex = Math.floor(Math.random() * availableWords.length);
        const selectedWord = availableWords[randomIndex];

        // Mark word as used
        this.usedWords.add(selectedWord);

        return selectedWord;
    }

    scrambleWord(word) {
        const letters = word.split('');

        // Improved Fisher-Yates shuffle algorithm
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }

        // Ensure the scrambled word is different from original
        const scrambled = letters.join('');
        if (scrambled === word && word.length > 1) {
            // If by chance it's the same, swap first two letters
            [letters[0], letters[1]] = [letters[1], letters[0]];
        }

        return letters;
    }

    newWord() {
        this.round++;
        if (this.round > this.maxRounds) {
            this.endGame();
            return;
        }

        this.currentWord = this.getRandomWord();
        this.scrambledLetters = this.scrambleWord(this.currentWord);
        this.selectedLetters = [];
        this.draw();
        this.updateScoreDisplay();
    }

    submitWord() {
        if (this.gameState !== 'playing') return;

        const submittedWord = this.selectedLetters.map(s => s.letter).join('');

        if (submittedWord === this.currentWord) {
            this.score += 10;
            // Add time bonus for correct answer
            this.timeLeft += 2;

            // Show success animation if available
            if (window.GameAnimations) {
                const canvasRect = this.canvas.getBoundingClientRect();
                GameAnimations.showScore(10, canvasRect.width / 2, canvasRect.height / 2, false);
            }

            // Visual feedback for correct answer
            this.showFeedback(true);
        } else {
            // Small time penalty for wrong answer
            this.timeLeft = Math.max(1, this.timeLeft - 1);

            // Show fail animation if available
            if (window.GameAnimations) {
                const canvasRect = this.canvas.getBoundingClientRect();
                GameAnimations.showScore(0, canvasRect.width / 2, canvasRect.height / 2, true);
            }

            // Visual feedback for wrong answer
            this.showFeedback(false);
        }

        // Move to next word after a short delay
        setTimeout(() => {
            this.newWord();
        }, 1000);
    }

    showFeedback(isCorrect) {
        if (!this.ctx) return;

        const width = this.canvas.width;
        const height = this.canvas.height;

        // Save current canvas state
        this.ctx.save();

        // Draw feedback overlay
        this.ctx.fillStyle = isCorrect ? 'rgba(40, 167, 69, 0.8)' : 'rgba(220, 53, 69, 0.8)';
        this.ctx.fillRect(0, 0, width, height);

        // Draw feedback text
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(isCorrect ? 'To\'g\'ri! +10' : 'Noto\'g\'ri', width / 2, height / 2);

        this.ctx.font = '24px Arial';
        this.ctx.fillText(`So'z: ${this.currentWord}`, width / 2, height / 2 + 50);

        // Restore canvas state after short delay
        setTimeout(() => {
            this.ctx.restore();
            this.draw();
        }, 800);
    }

    draw() {
        if (!this.ctx) return;

        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear canvas
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, width, height);

        // Adjust font sizes for mobile
        const titleFont = this.isMobile ? '20px Arial' : '24px Arial';
        const wordFont = this.isMobile ? 'bold 24px Arial' : 'bold 32px Arial';
        const letterFont = this.isMobile ? 'bold 18px Arial' : 'bold 24px Arial';

        // Draw header
        this.ctx.fillStyle = '#212529';
        this.ctx.font = titleFont;
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Ball: ${this.score}`, 20, 30);
        this.ctx.fillText(`Raund: ${this.round}/${this.maxRounds}`, 20, this.isMobile ? 55 : 60);
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Vaqt: ${Math.ceil(this.timeLeft)}s`, width - 20, 30);

        if (this.gameState === 'ready') {
            this.drawReady();
        } else if (this.gameState === 'playing' && this.currentWord) {
            this.drawGame();
        } else if (this.gameState === 'gameOver') {
            this.drawGameOver();
        }
    }

    drawReady() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        const titleFont = this.isMobile ? 'bold 32px Arial' : 'bold 48px Arial';
        const textFont = this.isMobile ? '14px Arial' : '18px Arial';

        this.ctx.fillStyle = '#6f42c1';
        this.ctx.font = titleFont;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Word Blast', width / 2, height / 2 - (this.isMobile ? 60 : 100));

        this.ctx.font = textFont;
        this.ctx.fillStyle = '#666';
        this.ctx.fillText('Harflarni shakllantirish uchun so\'zlarni tartiblashtiringiz!', width / 2, height / 2 - (this.isMobile ? 20 : 20));
        const diffLabel = this.difficulty === 'easy' ? 'OSON' : this.difficulty === 'medium' ? 'O\'RTA' : 'QIYIN';
        this.ctx.fillText(`Qiyinlik: ${diffLabel}`, width / 2, height / 2 + (this.isMobile ? 10 : 20));
        this.ctx.fillText('O\'yinni boshlash uchun Start Game ni bosing', width / 2, height / 2 + (this.isMobile ? 40 : 70));
    }

    drawGame() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Adjust sizes for mobile
        const letterSpacing = this.isMobile ? 35 : 45;
        const letterSize = this.isMobile ? 25 : 30;
        const yOffset = this.isMobile ? -30 : -50;

        // Draw scrambled letters
        this.ctx.fillStyle = '#6f42c1';
        this.ctx.font = this.isMobile ? 'bold 20px Arial' : 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Tartiblashtiringiz:', width / 2, height / 2 + yOffset);

        const startX = width / 2 - (this.scrambledLetters.length * letterSpacing) / 2;
        const y = height / 2 + (this.isMobile ? 10 : 20);

        this.scrambledLetters.forEach((letter, idx) => {
            const x = startX + idx * letterSpacing;
            const isSelected = this.selectedLetters.some(s => s.index === idx);

            this.ctx.fillStyle = isSelected ? '#e9ecef' : '#ffffff';
            this.ctx.strokeStyle = isSelected ? '#495057' : '#6f42c1';
            this.ctx.lineWidth = 2;

            const rectSize = this.isMobile ? 20 : 30;
            this.ctx.fillRect(x - rectSize/2, y - rectSize/2, rectSize, rectSize);
            this.ctx.strokeRect(x - rectSize/2, y - rectSize/2, rectSize, rectSize);

            this.ctx.fillStyle = isSelected ? '#495057' : '#212529';
            this.ctx.font = this.isMobile ? 'bold 16px Arial' : 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(letter.toUpperCase(), x, y + (this.isMobile ? 5 : 8));
        });

        // Draw selected word
        this.ctx.fillStyle = '#212529';
        this.ctx.font = this.isMobile ? 'bold 16px Arial' : 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        const selectedWord = this.selectedLetters.map(s => s.letter).join('');
        this.ctx.fillText(`Sizning so'zingiz: ${selectedWord}`, width / 2, height / 2 + (this.isMobile ? 80 : 120));

        // Draw hint only for desktop
        if (!this.isMobile) {
            this.ctx.font = '14px Arial';
            this.ctx.fillStyle = '#666';
            this.ctx.fillText('Harflarni kiriting, olib tashlash uchun Backspace, yuborish uchun Enter', width / 2, height / 2 + 160);
        }
    }

    drawGameOver() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        const titleFont = this.isMobile ? 'bold 32px Arial' : 'bold 48px Arial';
        const scoreFont = this.isMobile ? '24px Arial' : '36px Arial';
        const textFont = this.isMobile ? '14px Arial' : '18px Arial';

        this.ctx.fillStyle = '#6f42c1';
        this.ctx.font = titleFont;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('O\'yin tugadi!', width / 2, height / 2 - (this.isMobile ? 60 : 100));

        this.ctx.font = scoreFont;
        this.ctx.fillText(`Yakuniy ball: ${this.score}`, width / 2, height / 2 - (this.isMobile ? 20 : 20));

        this.ctx.font = textFont;
        this.ctx.fillStyle = '#666';
        this.ctx.fillText('Yana o\'ynash uchun Start Game ni bosing', width / 2, height / 2 + (this.isMobile ? 40 : 70));
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.round = 0;
        this.timeLeft = this.totalTime;
        this.usedWords.clear(); // Clear used words for new game
        this.newWord();

        // Update score display
        this.updateScoreDisplay();

        // Draw immediately to show initial state
        this.draw();
        this.gameTimer();
    }

    gameTimer() {
        const timer = setInterval(() => {
            if (this.gameState !== 'playing') {
                clearInterval(timer);
                return;
            }

            this.timeLeft -= 0.1;
            this.draw();

            if (this.timeLeft <= 0) {
                clearInterval(timer);
                this.endGame();
            }
        }, 100);
    }

    endGame() {
        this.gameState = 'gameOver';
        this.draw();
        this.saveScore();
    }

    saveScore() {
        const gameSlug = window.gameSlug || 'word-blast';

        // Create form data
        const formData = new FormData();
        formData.append('score', this.score);

        // Get CSRF token from meta tag (Django standard)
        const csrfToken = this.getCSRFToken();
        if (csrfToken) {
            formData.append('csrfmiddlewaretoken', csrfToken);
        }

        console.log('Saving score:', this.score, 'for game:', gameSlug);

        fetch(`/games/${gameSlug}/save-score/`, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: formData,
            credentials: 'same-origin'
        })
        .then(response => {
            console.log('Response status:', response.status);
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok');
        })
        .then(data => {
            console.log('Score saved successfully:', data);
            // Redirect to leaderboard after delay
            setTimeout(() => {
                window.location.href = `/leaderboard/games/${gameSlug}/`;
            }, 3000);
        })
        .catch(error => {
            console.error('Error saving score:', error);
            // Still redirect even if save fails
            setTimeout(() => {
                window.location.href = `/leaderboard/games/${gameSlug}/`;
            }, 3000);
        });
    }

    getCSRFToken() {
        // Try to get CSRF token from meta tag
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        if (csrfToken) {
            return csrfToken.value;
        }

        // Fallback to cookie method
        return this.getCookie('csrftoken');
    }

    getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    getScore() {
        return this.score;
    }
}

// Expose to window
window.WordBlast = WordBlast;