// Capital Quest Game - Match capitals to countries

class CapitalQuest {
    constructor(canvasId = 'gameCanvas', difficulty = 'medium') {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.difficulty = difficulty;
        this.gameState = 'ready'; // ready, playing, gameOver
        this.score = 0;
        this.round = 0;
        this.maxRounds = 10;
        this.timePerRound = 0;
        this.roundTimer = 0;
        this.totalScore = 0;

        // Difficulty settings
        this.difficultySettings = {
            'easy': { timePerRound: 30, capitalsPool: 'easy' },
            'medium': { timePerRound: 25, capitalsPool: 'medium' },
            'hard': { timePerRound: 20, capitalsPool: 'hard' }
        };

        // Country-Capital pairs
        this.capitals = {
            'easy': [
                { country: 'France', capital: 'Paris' },
                { country: 'Germany', capital: 'Berlin' },
                { country: 'Italy', capital: 'Rome' },
                { country: 'Spain', capital: 'Madrid' },
                { country: 'Japan', capital: 'Tokyo' },
                { country: 'USA', capital: 'Washington' },
                { country: 'UK', capital: 'London' },
                { country: 'Canada', capital: 'Ottawa' },
                { country: 'Australia', capital: 'Canberra' },
                { country: 'Brazil', capital: 'Brasília' }
            ],
            'medium': [
                { country: 'Portugal', capital: 'Lisbon' },
                { country: 'Greece', capital: 'Athens' },
                { country: 'Turkey', capital: 'Ankara' },
                { country: 'Poland', capital: 'Warsaw' },
                { country: 'Hungary', capital: 'Budapest' },
                { country: 'Argentina', capital: 'Buenos Aires' },
                { country: 'Mexico', capital: 'Mexico City' },
                { country: 'Egypt', capital: 'Cairo' },
                { country: 'India', capital: 'New Delhi' },
                { country: 'Russia', capital: 'Moscow' }
            ],
            'hard': [
                { country: 'Uzbekistan', capital: 'Tashkent' },
                { country: 'Kazakhstan', capital: 'Astana' },
                { country: 'Azerbaijan', capital: 'Baku' },
                { country: 'Belarus', capital: 'Minsk' },
                { country: 'Georgia', capital: 'Tbilisi' },
                { country: 'Mongolia', capital: 'Ulaanbaatar' },
                { country: 'Vietnam', capital: 'Hanoi' },
                { country: 'Thailand', capital: 'Bangkok' },
                { country: 'Kenya', capital: 'Nairobi' },
                { country: 'Zimbabwe', capital: 'Harare' }
            ]
        };

        this.currentPair = null;
        this.options = [];
        this.selectedOption = null;
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

        document.addEventListener('click', (e) => {
            if (this.gameState === 'playing' && e.target.dataset.capitalIndex) {
                const index = parseInt(e.target.dataset.capitalIndex);
                this.selectOption(index);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'playing') {
                if (e.key === '1') this.selectOption(0);
                if (e.key === '2') this.selectOption(1);
                if (e.key === '3') this.selectOption(2);
                if (e.key === '4') this.selectOption(3);
            }
        });
    }

    getRandomPair() {
        const pool = this.capitals[this.difficultySettings[this.difficulty].capitalsPool];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    newRound() {
        this.round++;
        if (this.round > this.maxRounds) {
            this.endGame();
            return;
        }

        this.currentPair = this.getRandomPair();
        this.selectedOption = null;

        // Generate wrong options
        const pool = this.capitals[this.difficultySettings[this.difficulty].capitalsPool];
        const wrongOptions = pool.filter(p => p.capital !== this.currentPair.capital);
        const shuffledWrong = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 3);

        this.options = [this.currentPair.capital, ...shuffledWrong.map(p => p.capital)];
        this.options.sort(() => Math.random() - 0.5);

        this.roundTimer = this.difficultySettings[this.difficulty].timePerRound;
        this.draw();
        this.roundCountdown();
    }

    selectOption(index) {
        if (this.selectedOption !== null) return;

        this.selectedOption = index;
        const isCorrect = this.options[index] === this.currentPair.capital;

        if (isCorrect) {
            const points = 20 + Math.max(0, Math.floor(this.roundTimer * 2));
            this.score += points;
            if (window.GameAnimations) {
                GameAnimations.showScore(points, this.canvas.width / 2, this.canvas.height / 2, false);
            }
        } else {
            this.score = Math.max(0, this.score - 5);
            if (window.GameAnimations) {
                GameAnimations.showScore(-5, this.canvas.width / 2, this.canvas.height / 2, true);
            }
        }

        this.draw();
        setTimeout(() => this.newRound(), 1500);
    }

    roundCountdown() {
        const timer = setInterval(() => {
            if (this.gameState !== 'playing' || this.selectedOption !== null) {
                clearInterval(timer);
                return;
            }

            this.roundTimer -= 0.1;
            this.draw();

            if (this.roundTimer <= 0) {
                clearInterval(timer);
                this.roundTimer = 0;
                this.draw();
                setTimeout(() => this.newRound(), 1500);
            }
        }, 100);
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
        this.ctx.fillText(`Score: ${this.score}`, 20, 40);
        this.ctx.fillText(`Round: ${this.round}/${this.maxRounds}`, 20, 80);

        if (this.gameState === 'ready') {
            this.drawReady();
        } else if (this.gameState === 'playing' && this.currentPair) {
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
        this.ctx.fillText('Capital Quest', width / 2, height / 2 - 100);

        this.ctx.font = '18px Arial';
        this.ctx.fillStyle = '#666';
        this.ctx.fillText('Match countries to their capital cities!', width / 2, height / 2 - 20);
        this.ctx.fillText(`Difficulty: ${this.difficulty.toUpperCase()}`, width / 2, height / 2 + 20);
        this.ctx.fillText('Press Start Game to begin', width / 2, height / 2 + 70);
    }

    drawGame() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Draw country
        this.ctx.fillStyle = '#6f42c1';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('What is the capital of:', width / 2, height / 2 - 80);

        this.ctx.font = 'bold 48px Arial';
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillText(this.currentPair.country, width / 2, height / 2 - 10);

        // Draw timer
        this.ctx.font = '18px Arial';
        this.ctx.fillStyle = this.roundTimer < 5 ? '#dc3545' : '#28a745';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Time: ${Math.ceil(this.roundTimer)}s`, width - 20, 40);

        // Draw options
        const optionStartY = height / 2 + 60;
        const optionHeight = 50;
        const optionSpacing = 10;

        this.options.forEach((capital, idx) => {
            const y = optionStartY + idx * (optionHeight + optionSpacing);
            const isSelected = this.selectedOption === idx;
            const isCorrect = capital === this.currentPair.capital;

            // Draw button background
            if (isSelected) {
                this.ctx.fillStyle = isCorrect ? '#28a745' : '#dc3545';
            } else {
                this.ctx.fillStyle = '#e0e7ff';
            }

            this.ctx.fillRect(width / 2 - 150, y, 300, optionHeight);

            // Draw border
            this.ctx.strokeStyle = '#6f42c1';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(width / 2 - 150, y, 300, optionHeight);

            // Draw text
            this.ctx.fillStyle = isSelected ? '#fff' : '#212529';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(capital, width / 2, y + 32);

            // Draw option number
            this.ctx.font = '14px Arial';
            this.ctx.fillStyle = isSelected ? '#fff' : '#666';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(idx + 1, width / 2 - 140, y + 32);
        });
    }

    drawGameOver() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.ctx.fillStyle = '#6f42c1';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', width / 2, height / 2 - 100);

        this.ctx.font = '36px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, width / 2, height / 2 - 20);

        this.ctx.font = '18px Arial';
        this.ctx.fillStyle = '#666';
        this.ctx.fillText('Press Start Game to play again', width / 2, height / 2 + 70);
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.round = 0;
        this.newRound();
    }

    endGame() {
        this.gameState = 'gameOver';
        this.draw();
        this.saveScore();
    }

    saveScore() {
        const gameSlug = window.gameSlug || 'capital-quest';
        const formData = new FormData();
        formData.append('score', this.score);
        formData.append('csrfmiddlewaretoken', this.getCookie('csrftoken'));

        fetch(`/games/${gameSlug}/save-score/`, {
            method: 'POST',
            body: formData
        }).then(response => {
            if (response.ok) {
                setTimeout(() => {
                    window.location.href = `/leaderboard/${gameSlug}/`;
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
let capitalQuestGame;
document.addEventListener('DOMContentLoaded', () => {
    const difficulty = document.getElementById('gameCanvas')?.dataset.difficulty || 'medium';
    capitalQuestGame = new CapitalQuest('gameCanvas', difficulty);
});

// Expose to window
window.CapitalQuest = CapitalQuest;
