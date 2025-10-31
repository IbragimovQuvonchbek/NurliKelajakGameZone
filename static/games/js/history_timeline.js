// History Timeline Game - Order events chronologically

class HistoryTimeline {
    constructor(canvasId = 'gameCanvas', difficulty = 'medium') {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.difficulty = difficulty;
        this.gameState = 'ready'; // ready, playing, gameOver
        this.score = 0;
        this.round = 0;
        this.maxRounds = 8;
        this.currentEvents = [];
        this.selectedOrder = [];
        this.eventPool = [];

        // Difficulty settings
        this.difficultySettings = {
            'easy': { timeSpan: 100, eventCount: 4 },
            'medium': { timeSpan: 50, eventCount: 5 },
            'hard': { timeSpan: 10, eventCount: 6 }
        };

        // Historical events
        this.events = [
            { event: 'Fall of Berlin Wall', year: 1989 },
            { event: 'Moon Landing', year: 1969 },
            { event: 'French Revolution', year: 1789 },
            { event: 'Columbus Reaches Americas', year: 1492 },
            { event: 'Industrial Revolution Begins', year: 1760 },
            { event: 'American Independence', year: 1776 },
            { event: 'Titanic Sinks', year: 1912 },
            { event: 'World War 1 Starts', year: 1914 },
            { event: 'World War 2 Starts', year: 1939 },
            { event: 'Computer Invented', year: 1946 },
            { event: 'Internet Invented', year: 1969 },
            { event: 'First Mobile Phone', year: 1973 },
            { event: 'Black Death', year: 1347 },
            { event: 'Roman Empire Falls', year: 476 },
            { event: 'Great Wall of China Built', year: 1368 }
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
        const width = container.clientWidth || 800;
        const height = container.clientHeight || 600;
        if (width > 0 && height > 0) {
            this.canvas.width = width;
            this.canvas.height = height;
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.draw();
        });

        document.addEventListener('click', (e) => {
            if (this.gameState === 'playing' && e.target.dataset.eventIndex !== undefined) {
                const index = parseInt(e.target.dataset.eventIndex);
                this.selectEvent(index);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'playing') {
                if (e.key === 'Enter') this.submitOrder();
                if (e.key === 'Backspace') this.undoSelection();
            }
        });
    }

    selectEvent(index) {
        if (this.selectedOrder.includes(index)) return;
        if (this.selectedOrder.length >= this.currentEvents.length) return;

        this.selectedOrder.push(index);
        this.draw();
    }

    undoSelection() {
        if (this.selectedOrder.length > 0) {
            this.selectedOrder.pop();
            this.draw();
        }
    }

    submitOrder() {
        if (this.selectedOrder.length !== this.currentEvents.length) return;

        // Check if order is correct
        const orderedEvents = this.selectedOrder.map(idx => this.currentEvents[idx]);
        const isCorrect = orderedEvents.every((event, idx) => {
            if (idx === 0) return true;
            return event.year >= orderedEvents[idx - 1].year;
        });

        if (isCorrect) {
            this.score += 30;
            if (window.GameAnimations) {
                GameAnimations.showScore(30, this.canvas.width / 2, this.canvas.height / 2, false);
            }
        } else {
            this.score = Math.max(0, this.score - 10);
            if (window.GameAnimations) {
                GameAnimations.showScore(-10, this.canvas.width / 2, this.canvas.height / 2, true);
            }
        }

        this.newRound();
    }

    getRandomEvents() {
        const count = this.difficultySettings[this.difficulty].eventCount;
        const randomized = [...this.events].sort(() => Math.random() - 0.5).slice(0, count);
        return randomized.sort(() => Math.random() - 0.5);
    }

    newRound() {
        this.round++;
        if (this.round > this.maxRounds) {
            this.endGame();
            return;
        }

        this.currentEvents = this.getRandomEvents();
        this.selectedOrder = [];
        this.draw();
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

        if (this.gameState === 'ready') {
            this.drawReady();
        } else if (this.gameState === 'playing' && this.currentEvents.length > 0) {
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
        this.ctx.fillText('Tarix Xronologiyasi', width / 2, height / 2 - 100);

        this.ctx.font = '18px Arial';
        this.ctx.fillStyle = '#666';
        this.ctx.fillText('Tarixiy hodisalarni xronologik tartibda aniqlashtiringiz!', width / 2, height / 2 - 20);
        const diffLabel = this.difficulty === 'easy' ? 'OSON' : this.difficulty === 'medium' ? 'O\'RTA' : 'QIYIN';
        this.ctx.fillText(`Qiyinlik: ${diffLabel}`, width / 2, height / 2 + 20);
        this.ctx.fillText('O\'yinni boshlash uchun Start Game ni bosing', width / 2, height / 2 + 70);
    }

    drawGame() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Draw instructions
        this.ctx.fillStyle = '#6f42c1';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Hodisalarni xronologik tartibda bosing (eng eski dan eng yangi gacha)', width / 2, 120);

        // Draw events
        const eventStartY = 160;
        const eventHeight = 50;
        const eventSpacing = 10;

        this.currentEvents.forEach((event, idx) => {
            const y = eventStartY + idx * (eventHeight + eventSpacing);
            const isSelected = this.selectedOrder.includes(idx);
            const selectionOrder = this.selectedOrder.indexOf(idx);

            // Draw button background
            if (isSelected) {
                this.ctx.fillStyle = '#6f42c1';
            } else {
                this.ctx.fillStyle = '#e0e7ff';
            }

            this.ctx.fillRect(40, y, width - 80, eventHeight);

            // Draw border
            this.ctx.strokeStyle = '#6f42c1';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(40, y, width - 80, eventHeight);

            // Draw text
            this.ctx.fillStyle = isSelected ? '#fff' : '#212529';
            this.ctx.font = isSelected ? 'bold 16px Arial' : '16px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(event.event, 60, y + 20);
            this.ctx.fillText(`(${event.year})`, 60, y + 38);

            // Draw selection number
            if (isSelected) {
                this.ctx.fillStyle = '#fff';
                this.ctx.font = 'bold 18px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(selectionOrder + 1, width - 50, y + 28);
            }
        });

        // Draw instructions
        this.ctx.fillStyle = '#666';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        const instructionY = eventStartY + (this.currentEvents.length * (eventHeight + eventSpacing)) + 30;
        this.ctx.fillText(`Tanlangan: ${this.selectedOrder.length}/${this.currentEvents.length}`, width / 2, instructionY);
        this.ctx.fillText('Yuborish uchun Enter yoki ortga qaytish uchun Backspace bosing', width / 2, instructionY + 25);
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
        this.newRound();
    }

    endGame() {
        this.gameState = 'gameOver';
        this.draw();
        this.saveScore();
    }

    saveScore() {
        const gameSlug = window.gameSlug || 'history-timeline';
        const formData = new FormData();
        formData.append('score', this.score);
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
let historyTimelineGame;
document.addEventListener('DOMContentLoaded', () => {
    const difficulty = document.getElementById('gameCanvas')?.dataset.difficulty || 'medium';
    historyTimelineGame = new HistoryTimeline('gameCanvas', difficulty);
});

// Expose to window
window.HistoryTimeline = HistoryTimeline;
