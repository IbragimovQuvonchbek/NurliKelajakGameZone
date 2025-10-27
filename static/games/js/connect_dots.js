// Connect the Dots Game Logic

class ConnectDotsGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.difficulty = 'medium';
        this.currentLevel = 0;
        this.dotPositions = [];
        this.connectedDots = [];
        this.selectedDot = null;
        this.nextDot = 1;
        this.moves = 0;
        this.score = 0;
        this.startTime = null;
        this.timer = null;
        this.isGameActive = false;
        this.gameComplete = false;
        
        // Get CSRF token from page
        this.csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || this.getCookie('csrftoken');
        
        this.setupEventListeners();
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
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

    setupEventListeners() {
        document.getElementById('startGameBtn').addEventListener('click', () => this.startGame());
        document.getElementById('newGameBtn').addEventListener('click', () => this.startGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.startGame());
        
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // Touch support
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
        });
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const maxWidth = container.clientWidth - 64;
        this.canvas.width = Math.min(700, maxWidth);
        this.canvas.height = this.canvas.width;
        
        if (this.isGameActive) {
            this.generateDots();
            this.draw();
        }
    }

    startGame() {
        this.difficulty = document.getElementById('difficulty').value;
        this.currentLevel = 0;
        this.connectedDots = [];
        this.selectedDot = null;
        this.nextDot = 1;
        this.moves = 0;
        this.score = 0;
        this.isGameActive = true;
        this.gameComplete = false;
        
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('moves').textContent = '0';
        document.getElementById('score').textContent = '0';
        document.getElementById('timer').textContent = '00:00';
        
        this.startTimer();
        this.generateDots();
        this.draw();
    }

    generateDots() {
        const difficulties = {
            easy: { count: 16, grid: 4 },
            medium: { count: 25, grid: 5 },
            hard: { count: 36, grid: 6 }
        };
        
        const config = difficulties[this.difficulty];
        this.dotPositions = [];
        
        const padding = 80;
        const minDistance = 60; // Minimum distance between dots
        
        for (let i = 0; i < config.count; i++) {
            let attempts = 0;
            let validPosition = false;
            let x, y;
            
            // Try to find a valid random position
            while (!validPosition && attempts < 100) {
                x = padding + Math.random() * (this.canvas.width - padding * 2);
                y = padding + Math.random() * (this.canvas.height - padding * 2);
                
                // Check if this position is far enough from all existing dots
                validPosition = true;
                for (let existingDot of this.dotPositions) {
                    const distance = Math.sqrt(
                        Math.pow(x - existingDot.x, 2) + Math.pow(y - existingDot.y, 2)
                    );
                    if (distance < minDistance) {
                        validPosition = false;
                        break;
                    }
                }
                attempts++;
            }
            
            // If we couldn't find a valid position, use a fallback grid-based position
            if (!validPosition) {
                const gridSize = Math.ceil(Math.sqrt(config.count));
                const cellSize = (this.canvas.width - padding * 2) / gridSize;
                const row = Math.floor(i / gridSize);
                const col = i % gridSize;
                x = padding + col * cellSize + cellSize / 2;
                y = padding + row * cellSize + cellSize / 2;
            }
            
            this.dotPositions.push({
                number: i + 1,
                x: x,
                y: y
            });
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections
        this.ctx.strokeStyle = '#6366F1';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        
        for (let i = 0; i < this.connectedDots.length - 1; i++) {
            const current = this.connectedDots[i];
            const next = this.connectedDots[i + 1];
            
            this.ctx.moveTo(current.x, current.y);
            this.ctx.lineTo(next.x, next.y);
        }
        this.ctx.stroke();
        
        // Draw dots
        this.dotPositions.forEach((dot, index) => {
            const isConnected = this.connectedDots.some(d => d.number === dot.number);
            const isHighlighted = dot === this.selectedDot;
            
            // Draw dot circle
            this.ctx.beginPath();
            if (isHighlighted) {
                this.ctx.fillStyle = '#10B981';
            } else if (isConnected) {
                this.ctx.fillStyle = '#6366F1';
            } else {
                this.ctx.fillStyle = '#fff';
            }
            this.ctx.arc(dot.x, dot.y, 15, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw border
            this.ctx.strokeStyle = isHighlighted ? '#10B981' : '#6366F1';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw number
            this.ctx.fillStyle = isConnected || isHighlighted ? '#fff' : '#6366F1';
            this.ctx.font = 'bold 14px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(dot.number, dot.x, dot.y);
        });
    }

    getDotAtPosition(x, y) {
        const clickRadius = 20;
        
        for (let dot of this.dotPositions) {
            const dx = x - dot.x;
            const dy = y - dot.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < clickRadius) {
                return dot;
            }
        }
        return null;
    }

    handleMouseDown(e) {
        if (!this.isGameActive || this.gameComplete) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const dot = this.getDotAtPosition(x, y);
        if (dot) {
            this.handleDotClick(dot);
        }
    }

    handleMouseMove(e) {
        if (!this.isGameActive || this.gameComplete) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.canvas.style.cursor = this.getDotAtPosition(x, y) ? 'pointer' : 'default';
    }

    handleClick(e) {
        // Additional click handling if needed
    }

    handleDotClick(dot) {
        const isAlreadyConnected = this.connectedDots.some(d => d.number === dot.number);
        
        if (dot.number === this.nextDot && !isAlreadyConnected) {
            this.connectedDots.push(dot);
            this.selectedDot = dot;
            this.nextDot++;
            this.moves++;
            
            document.getElementById('moves').textContent = this.moves;
            this.updateScore();
            this.draw();
            
            if (this.connectedDots.length === this.dotPositions.length) {
                this.completeGame();
            }
        }
    }

    updateScore() {
        const baseScore = 1000;
        const moveBonus = Math.max(0, this.dotPositions.length * 10 - this.moves * 10);
        const timeBonus = Math.max(0, 500 - Math.floor((Date.now() - this.startTime) / 1000));
        this.score = baseScore + moveBonus + timeBonus;
        
        document.getElementById('score').textContent = this.score.toLocaleString();
    }

    completeGame() {
        this.gameComplete = true;
        this.isGameActive = false;
        this.updateScore();
        
        const finalTime = document.getElementById('timer').textContent;
        document.getElementById('finalTime').textContent = finalTime;
        document.getElementById('finalMoves').textContent = this.moves;
        document.getElementById('finalScore').textContent = this.score.toLocaleString();
        
        document.getElementById('gameOverScreen').classList.remove('hidden');
        this.stopTimer();
        
        // Automatically save the score
        this.submitScore();
    }

    startTimer() {
        this.startTime = Date.now();
        this.timer = setInterval(() => {
            if (!this.gameComplete) {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                document.getElementById('timer').textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    submitScore() {
        if (!this.gameComplete) return;
        
        if (!this.csrfToken) {
            console.error('CSRF token not found');
            const gameOverMessage = document.querySelector('.completion-message');
            if (gameOverMessage) {
                gameOverMessage.innerHTML = '<i class="fas fa-exclamation-circle text-warning"></i> Xavfsizlik muammosi! Qayta yuklang.';
            }
            return;
        }
        
        const formData = new FormData();
        formData.append('score', this.score);
        formData.append('csrfmiddlewaretoken', this.csrfToken);
        
        console.log('Submitting score:', this.score, 'to', window.location.pathname + 'save-score/');
        
        fetch(window.location.pathname + 'save-score/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': this.csrfToken,
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            console.log('Response status:', response.status);
            if (response.redirected) {
                // Server redirected to leaderboard
                window.location.href = response.url;
                return;
            } else if (response.ok) {
                return response.json();
            } else {
                return response.text().then(text => {
                    console.error('Server error response:', text);
                    throw new Error(`Server error: ${response.status}`);
                });
            }
        })
        .then(data => {
            console.log('Score saved successfully:', data);
            // Show success in game over screen
            const gameOverMessage = document.querySelector('.completion-message');
            if (gameOverMessage) {
                gameOverMessage.innerHTML = '<i class="fas fa-check-circle text-success"></i> Natija avtomatik saqlandi!';
            }
            
            // Add leaderboard button if not exists
            const playAgainBtn = document.getElementById('playAgainBtn');
            if (playAgainBtn && !document.getElementById('leaderboardBtn')) {
                const leaderboardBtn = document.createElement('button');
                leaderboardBtn.id = 'leaderboardBtn';
                leaderboardBtn.className = 'btn btn-success btn-lg mt-3';
                leaderboardBtn.innerHTML = '<i class="fas fa-trophy"></i> Reytingni Ko\'rish';
                leaderboardBtn.onclick = () => {
                    window.location.href = '/leaderboard/games/connect_dots/';
                };
                playAgainBtn.parentNode.appendChild(leaderboardBtn);
            }
        })
        .catch(error => {
            console.error('Error saving score:', error);
            // Show error in game over screen
            const gameOverMessage = document.querySelector('.completion-message');
            if (gameOverMessage) {
                gameOverMessage.innerHTML = '<i class="fas fa-exclamation-circle text-warning"></i> Ball saqlashda xatolik yuz berdi.';
            }
        });
    }
}

// Initialize game when page loads
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new ConnectDotsGame();
});
