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

        // Difficulty settings
        this.difficultySettings = {
            'easy': { minLength: 3, maxLength: 4, timePerWord: 8 },
            'medium': { minLength: 5, maxLength: 6, timePerWord: 10 },
            'hard': { minLength: 7, maxLength: 8, timePerWord: 12 }
        };

        // Word list
        this.words = [
            // Easy words
            'cat', 'dog', 'bird', 'fish', 'tree', 'rain', 'wind', 'fire', 'snow', 'moon',
            // Medium words
            'house', 'water', 'peace', 'dream', 'fruit', 'smile', 'dance', 'music', 'light', 'heart',
            // Hard words
            'adventure', 'celebrate', 'dangerous', 'knowledge', 'beautiful', 'community', 'elephant', 'favorite'
        ];

        this.init();
        this.setupEventListeners();
    }

    init() {
        if (this.canvas) {
            this.resizeCanvas();
        }
    }

    resizeCanvas() {
        if (!this.canvas) return;

        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());

        // Keyboard input for typing letters
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

    selectLetter(letter) {
        const availableLetters = [...this.scrambledLetters];
        const selectedIndices = this.selectedLetters.map(s => s.index);
        selectedIndices.forEach(idx => {
            availableLetters[idx] = null;
        });

        const letterIndex = availableLetters.indexOf(letter);
        if (letterIndex !== -1) {
            this.selectedLetters.push({
                letter: letter,
                index: letterIndex
            });
            this.draw();
        }
    }

    removeLetter() {
        if (this.selectedLetters.length > 0) {
            this.selectedLetters.pop();
            this.draw();
        }
    }

    getRandomWord() {
        const settings = this.difficultySettings[this.difficulty];
        const filteredWords = this.words.filter(
            w => w.length >= settings.minLength && w.length <= settings.maxLength
        );
        return filteredWords[Math.floor(Math.random() * filteredWords.length)];
    }

    scrambleWord(word) {
        const letters = word.split('');
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
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
    }

    submitWord() {
        const word = this.selectedLetters.map(s => s.letter).join('');
        if (word === this.currentWord) {
            this.score += 10;
            if (window.GameAnimations) {
                GameAnimations.showScore(10, this.canvas.width / 2, this.canvas.height / 2, false);
            }
        } else {
            this.score = Math.max(0, this.score - 2);
            if (window.GameAnimations) {
                GameAnimations.showScore(-2, this.canvas.width / 2, this.canvas.height / 2, true);
            }
        }
        this.newWord();
    }

    draw() {
        if (!this.ctx) return;

        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear canvas
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, width, height);

        // Draw header
        this.ctx.fillStyle = '#212529';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Ball: ${this.score}`, 20, 40);
        this.ctx.fillText(`Raund: ${this.round}/${this.maxRounds}`, 20, 80);
        this.ctx.fillText(`Vaqt: ${Math.ceil(this.timeLeft)}s`, width - 150, 40);

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

        this.ctx.fillStyle = '#6f42c1';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Word Blast', width / 2, height / 2 - 100);

        this.ctx.font = '18px Arial';
        this.ctx.fillStyle = '#666';
        this.ctx.fillText('Harflarni shakllantirish uchun so\'zlarni tartiblashtiringiz!', width / 2, height / 2 - 20);
        const diffLabel = this.difficulty === 'easy' ? 'OSON' : this.difficulty === 'medium' ? 'O\'RTA' : 'QIYIN';
        this.ctx.fillText(`Qiyinlik: ${diffLabel}`, width / 2, height / 2 + 20);
        this.ctx.fillText('O\'yinni boshlash uchun Start Game ni bosing', width / 2, height / 2 + 70);
    }

    drawGame() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Draw scrambled letters
        this.ctx.fillStyle = '#6f42c1';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Tartiblashtiringiz:', width / 2, height / 2 - 50);

        const letterSpacing = 45;
        const startX = width / 2 - (this.scrambledLetters.length * letterSpacing) / 2;
        const y = height / 2 + 20;

        this.scrambledLetters.forEach((letter, idx) => {
            const x = startX + idx * letterSpacing;
            const isSelected = this.selectedLetters.some(s => s.index === idx);

            this.ctx.fillStyle = isSelected ? '#999' : '#fff';
            this.ctx.strokeStyle = '#6f42c1';
            this.ctx.lineWidth = 2;
            this.ctx.fillRect(x - 15, y - 20, 30, 40);
            this.ctx.strokeRect(x - 15, y - 20, 30, 40);

            this.ctx.fillStyle = '#212529';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(letter.toUpperCase(), x, y + 8);
        });

        // Draw selected word
        this.ctx.fillStyle = '#212529';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'center';
        const selectedWord = this.selectedLetters.map(s => s.letter).join('');
        this.ctx.fillText(`Sizning so'zingiz: ${selectedWord}`, width / 2, height / 2 + 120);

        // Draw hint
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#666';
        this.ctx.fillText('Harflarni kiriting, olib tashlash uchun Backspace, yuborish uchun Enter', width / 2, height / 2 + 160);
    }

    drawGameOver() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.ctx.fillStyle = '#6f42c1';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('O\'yin tugadi!', width / 2, height / 2 - 100);

        this.ctx.font = '36px Arial';
        this.ctx.fillText(`Yakuniy ball: ${this.score}`, width / 2, height / 2 - 20);

        this.ctx.font = '18px Arial';
        this.ctx.fillStyle = '#666';
        this.ctx.fillText('Yana o\'ynash uchun Start Game ni bosing', width / 2, height / 2 + 70);
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.round = 0;
        this.timeLeft = this.totalTime;
        this.newWord();
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
        const formData = new FormData();
        formData.append('score', Math.floor(this.score));
        formData.append('csrfmiddlewaretoken', this.getCookie('csrftoken'));

        fetch(`/games/${gameSlug}/save-score/`, {
            method: 'POST',
            body: formData
        }).then(response => {
            if (response.ok) {
                setTimeout(() => {
                    window.location.href = `/leaderboard/games/${gameSlug}/`;
                }, 2000);
            }
        });
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

// Initialize game
let wordBlastGame;
document.addEventListener('DOMContentLoaded', () => {
    const difficulty = document.getElementById('gameCanvas')?.dataset.difficulty || 'medium';
    wordBlastGame = new WordBlast('gameCanvas', difficulty);
});

// Expose to window
window.WordBlast = WordBlast;
