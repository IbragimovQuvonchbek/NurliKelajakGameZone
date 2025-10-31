// Tile Match Game - Merge matching tiles (2048-like)

class TileMatch {
    constructor(canvasId = 'gameCanvas', difficulty = 'medium') {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.difficulty = difficulty;
        this.gameState = 'ready'; // ready, playing, gameOver
        this.score = 0;
        this.gridSize = difficulty === 'easy' ? 4 : 6;
        this.targetScore = 2048;
        this.grid = [];
        this.gameRunning = true;

        this.init();
        this.setupEventListeners();
    }

    init() {
        if (this.canvas) {
            this.resizeCanvas();
        }
        this.initializeGrid();
    }

    initializeGrid() {
        this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(0));
        this.addNewTile();
        this.addNewTile();
    }

    resizeCanvas() {
        if (!this.canvas) return;
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = Math.min(container.clientHeight, container.clientWidth * 1.2);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.draw();
        });

        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'playing') {
                if (e.key === 'ArrowLeft') this.move('left');
                if (e.key === 'ArrowRight') this.move('right');
                if (e.key === 'ArrowUp') this.move('up');
                if (e.key === 'ArrowDown') this.move('down');
            }
        });

        // Touch controls
        let startX = 0, startY = 0;
        this.canvas.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        this.canvas.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = endX - startX;
            const diffY = endY - startY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) this.move('right');
                else this.move('left');
            } else {
                if (diffY > 0) this.move('down');
                else this.move('up');
            }
        });
    }

    addNewTile() {
        const emptyTiles = [];
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) {
                    emptyTiles.push({ i, j });
                }
            }
        }

        if (emptyTiles.length === 0) return;

        const randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        this.grid[randomTile.i][randomTile.j] = Math.random() < 0.9 ? 2 : 4;
    }

    move(direction) {
        const oldGrid = JSON.parse(JSON.stringify(this.grid));

        if (direction === 'left') this.slideLeft();
        if (direction === 'right') this.slideRight();
        if (direction === 'up') this.slideUp();
        if (direction === 'down') this.slideDown();

        if (JSON.stringify(oldGrid) !== JSON.stringify(this.grid)) {
            this.addNewTile();
            this.draw();

            if (this.isGameOver()) {
                this.endGame();
            }
        }
    }

    slideLeft() {
        for (let i = 0; i < this.gridSize; i++) {
            this.grid[i] = this.removeBlanks(this.grid[i]);
            this.grid[i] = this.mergeArray(this.grid[i]);
            this.grid[i] = this.removeBlanks(this.grid[i]);
            this.grid[i] = [...this.grid[i], ...Array(this.gridSize - this.grid[i].length).fill(0)];
        }
    }

    slideRight() {
        for (let i = 0; i < this.gridSize; i++) {
            this.grid[i].reverse();
            this.grid[i] = this.removeBlanks(this.grid[i]);
            this.grid[i] = this.mergeArray(this.grid[i]);
            this.grid[i] = this.removeBlanks(this.grid[i]);
            this.grid[i] = [...Array(this.gridSize - this.grid[i].length).fill(0), ...this.grid[i]];
            this.grid[i].reverse();
        }
    }

    slideUp() {
        const transposed = this.transpose(this.grid);
        this.slideLeft();
        this.grid = this.transpose(this.grid);
    }

    slideDown() {
        const transposed = this.transpose(this.grid);
        this.slideRight();
        this.grid = this.transpose(this.grid);
    }

    mergeArray(arr) {
        const merged = [];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === arr[i + 1]) {
                merged.push(arr[i] * 2);
                this.score += arr[i] * 2;
                i++;
            } else {
                merged.push(arr[i]);
            }
        }
        return merged;
    }

    removeBlanks(arr) {
        return arr.filter(val => val !== 0);
    }

    transpose(matrix) {
        return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
    }

    isGameOver() {
        // Check if any moves are possible
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) return false;
                if (i < this.gridSize - 1 && this.grid[i][j] === this.grid[i + 1][j]) return false;
                if (j < this.gridSize - 1 && this.grid[i][j] === this.grid[i][j + 1]) return false;
            }
        }
        return true;
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

        if (this.gameState === 'ready') {
            this.drawReady();
        } else if (this.gameState === 'playing') {
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
        this.ctx.fillText('Tile Match', width / 2, height / 2 - 100);

        this.ctx.font = '18px Arial';
        this.ctx.fillStyle = '#666';
        this.ctx.fillText('Merge matching tiles to reach 2048!', width / 2, height / 2 - 20);
        this.ctx.fillText(`Difficulty: ${this.difficulty.toUpperCase()} (${this.gridSize}x${this.gridSize})`, width / 2, height / 2 + 20);
        this.ctx.fillText('Use arrow keys or swipe to move tiles', width / 2, height / 2 + 70);
    }

    drawGame() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        const tileSize = (width - 80) / this.gridSize;
        const startX = 40;
        const startY = 100;

        // Draw grid background
        this.ctx.fillStyle = '#ccc';
        this.ctx.fillRect(startX - 5, startY - 5, tileSize * this.gridSize + 10, tileSize * this.gridSize + 10);

        // Draw tiles
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const value = this.grid[i][j];
                const x = startX + j * tileSize;
                const y = startY + i * tileSize;

                const color = this.getTileColor(value);
                this.ctx.fillStyle = color;
                this.ctx.fillRect(x, y, tileSize - 5, tileSize - 5);

                if (value > 0) {
                    this.ctx.fillStyle = '#fff';
                    this.ctx.font = 'bold 24px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(value, x + (tileSize - 5) / 2, y + (tileSize - 5) / 2);
                }
            }
        }
    }

    getTileColor(value) {
        const colors = {
            0: '#ddd',
            2: '#eee4da',
            4: '#ede0c8',
            8: '#f2b179',
            16: '#f59563',
            32: '#f67c5f',
            64: '#f65e3b',
            128: '#edcf72',
            256: '#edcc61',
            512: '#edc850',
            1024: '#edc53f',
            2048: '#edc22e'
        };
        return colors[value] || '#e0e0e0';
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
        this.grid = [];
        this.initializeGrid();
        this.draw();
    }

    endGame() {
        this.gameState = 'gameOver';
        this.draw();
        this.saveScore();
    }

    saveScore() {
        const gameSlug = window.gameSlug || 'tile-match';
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
let tileMatchGame;
document.addEventListener('DOMContentLoaded', () => {
    const difficulty = document.getElementById('gameCanvas')?.dataset.difficulty || 'medium';
    tileMatchGame = new TileMatch('gameCanvas', difficulty);
});

// Expose to window
window.TileMatch = TileMatch;
