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
        this.usedEvents = [];

        // Difficulty settings
        this.difficultySettings = {
            'easy': { timeSpan: 100, eventCount: 4 },
            'medium': { timeSpan: 50, eventCount: 5 },
            'hard': { timeSpan: 10, eventCount: 6 }
        };

        // Historical events (110+ events with variety for better gameplay)
        this.events = [
            // Ancient Times - Science & Mathematics
            { event: 'Pythagorean Theorem Discovered', year: -500 },
            { event: 'Archimedes Discovers Buoyancy', year: -250 },
            { event: 'Jesus Christ Born', year: 1 },
            { event: 'Cleopatra Dies', year: 30 },
            { event: 'Ptolemaic Egypt Ends', year: 30 },
            { event: 'Julius Caesar Assassinated', year: 44 },
            { event: 'Library of Alexandria Destroyed', year: 48 },
            { event: 'Vesuvius Erupts Pompeii', year: 79 },
            { event: 'Colosseum Built in Rome', year: 80 },
            { event: 'First Paper Made in China', year: 105 },
            { event: 'Ptolemy\'s Almagest Published', year: 150 },
            { event: 'Roman Empire Falls', year: 476 },

            // Medieval Period - Innovations
            { event: 'Gunpowder Invented in China', year: 850 },
            { event: 'Crusades Begin', year: 1096 },
            { event: 'Compass Used for Navigation', year: 1190 },
            { event: 'Magna Carta Signed', year: 1215 },
            { event: 'Spectacles Invented', year: 1286 },
            { event: 'Mechanical Clock Invented', year: 1335 },
            { event: 'Black Death Begins', year: 1347 },
            { event: 'Great Wall of China Built', year: 1368 },
            { event: 'Joan of Arc Born', year: 1412 },
            { event: 'Fall of Constantinople', year: 1453 },
            { event: 'Hundred Years War Ends', year: 1453 },

            // Renaissance & Reformation
            { event: 'Leonardo da Vinci Born', year: 1452 },
            { event: 'Gutenberg Prints First Bible', year: 1455 },
            { event: 'Columbus Reaches Americas', year: 1492 },
            { event: 'Vasco da Gama Reaches India', year: 1498 },
            { event: 'Portuguese Settle Brazil', year: 1500 },
            { event: 'Michelangelo Paints Sistine Chapel', year: 1512 },
            { event: 'Martin Luther Posts 95 Theses', year: 1517 },
            { event: 'Ferdinand Magellan Circumnavigates World', year: 1522 },
            { event: 'Copernicus Publishes Heliocentric Theory', year: 1543 },
            { event: 'Galileo Invents Telescope', year: 1609 },
            { event: 'Barometer Invented', year: 1643 },
            { event: 'Isaac Newton Publishes Principia', year: 1687 },

            // Early Modern Period - Industrial Revolution
            { event: 'Industrial Revolution Begins', year: 1760 },
            { event: 'Steam Engine Perfected', year: 1769 },
            { event: 'American Independence', year: 1776 },
            { event: 'French Revolution Begins', year: 1789 },
            { event: 'Vaccination Discovered by Jenner', year: 1796 },
            { event: 'Napoleon Crowned Emperor', year: 1804 },
            { event: 'Photography Invented', year: 1826 },

            // 19th Century - Inventions & Science
            { event: 'First Telegraph Message', year: 1844 },
            { event: 'Darwin Publishes Evolution Theory', year: 1859 },
            { event: 'American Civil War Begins', year: 1861 },
            { event: 'Dynamite Invented by Nobel', year: 1867 },
            { event: 'First Telephone Call', year: 1876 },
            { event: 'Edison Invents Light Bulb', year: 1879 },
            { event: 'X-ray Discovered', year: 1895 },
            { event: 'First Airplane Flight', year: 1903 },
            { event: 'Theory of Relativity Published', year: 1905 },
            { event: 'Titanic Sinks', year: 1912 },

            // 20th Century - Wars
            { event: 'World War 1 Starts', year: 1914 },
            { event: 'World War 1 Ends', year: 1918 },
            { event: 'First Television Broadcast', year: 1927 },
            { event: 'Penicillin Discovered', year: 1928 },
            { event: 'Nuclear Fission Discovered', year: 1938 },
            { event: 'World War 2 Starts', year: 1939 },
            { event: 'Atomic Bomb on Hiroshima', year: 1945 },
            { event: 'World War 2 Ends', year: 1945 },

            // 20th Century - Technology & Space Age
            { event: 'Computer Invented', year: 1946 },
            { event: 'Transistor Invented', year: 1947 },
            { event: 'DNA Structure Discovered', year: 1953 },
            { event: 'Polio Vaccine Developed', year: 1955 },
            { event: 'Sputnik First Satellite', year: 1957 },
            { event: 'Laser Invented', year: 1960 },
            { event: 'Yuri Gagarin First Human in Space', year: 1961 },
            { event: 'First Heart Transplant', year: 1967 },
            { event: 'Moon Landing', year: 1969 },
            { event: 'Internet Invented', year: 1969 },
            { event: 'Man Walks on Moon', year: 1969 },
            { event: 'First Email Sent', year: 1971 },
            { event: 'Microprocessor Invented', year: 1971 },
            { event: 'First Mobile Phone', year: 1973 },
            { event: 'Microsoft Founded', year: 1975 },
            { event: 'Apple Computer Founded', year: 1976 },
            { event: 'First Test Tube Baby', year: 1978 },
            { event: 'Personal Computer Released', year: 1981 },
            { event: 'Space Shuttle First Flight', year: 1981 },
            { event: 'Chernobyl Disaster', year: 1986 },
            { event: 'Challenger Space Shuttle Disaster', year: 1986 },
            { event: 'Fall of Berlin Wall', year: 1989 },
            { event: 'World Wide Web Created', year: 1989 },
            { event: 'Hubble Space Telescope Launched', year: 1990 },
            { event: 'Soviet Union Collapses', year: 1991 },

            // 21st Century - Modern Technology & Science
            { event: 'World Trade Center Attack', year: 2001 },
            { event: 'Human Genome Project Completed', year: 2003 },
            { event: 'Facebook Founded', year: 2004 },
            { event: 'YouTube Founded', year: 2005 },
            { event: 'iPhone Released', year: 2007 },
            { event: 'First Android Phone', year: 2008 },
            { event: 'Tesla Roadster Released', year: 2008 },
            { event: 'Higgs Boson Discovered', year: 2012 },
            { event: 'Curiosity Rover on Mars', year: 2012 },
            { event: 'CRISPR Gene Editing Breakthrough', year: 2013 },
            { event: 'Artificial Intelligence AlphaGo', year: 2016 },
            { event: 'First Image of Black Hole', year: 2019 },
            { event: 'COVID-19 Vaccines Developed', year: 2020 },
            { event: 'James Webb Space Telescope Launched', year: 2021 }
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

        // Canvas click detection for event selection
        this.canvas.addEventListener('click', (e) => {
            if (this.gameState === 'playing') {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Check which event was clicked
                const eventStartY = 160;
                const eventHeight = 50;
                const eventSpacing = 10;

                for (let idx = 0; idx < this.currentEvents.length; idx++) {
                    const eventY = eventStartY + idx * (eventHeight + eventSpacing);
                    if (y >= eventY && y <= eventY + eventHeight && x >= 40 && x <= this.canvas.width - 40) {
                        this.selectEvent(idx);
                        break;
                    }
                }
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
        // Toggle: if already selected, deselect it
        const existingIndex = this.selectedOrder.indexOf(index);
        if (existingIndex !== -1) {
            this.selectedOrder.splice(existingIndex, 1);
        } else {
            // Only add if not at max capacity
            if (this.selectedOrder.length < this.currentEvents.length) {
                this.selectedOrder.push(index);
            }
        }
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
            // No penalty for mistakes, just +0
            if (window.GameAnimations) {
                GameAnimations.showScore(0, this.canvas.width / 2, this.canvas.height / 2, true);
            }
        }

        this.newRound();
    }

    getRandomEvents() {
        const count = this.difficultySettings[this.difficulty].eventCount;

        // Fisher-Yates shuffle to get unique random events
        const shuffled = [...this.events];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Get unique events for this round
        const selectedEvents = shuffled.slice(0, count);

        // Shuffle them again for display order (different from chronological)
        return selectedEvents.sort(() => Math.random() - 0.5);
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

            // Draw text (year hidden for difficulty)
            this.ctx.fillStyle = isSelected ? '#fff' : '#212529';
            this.ctx.font = isSelected ? 'bold 16px Arial' : '16px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(event.event, 60, y + 28);

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
        this.ctx.font = '12px Arial';
        this.ctx.fillText('Hodisalarni bosing (tanlashni olib tashlash uchun yana bosing)', width / 2, instructionY + 25);
        this.ctx.fillText('Tugmalar: Yuborish / Ortga Qaytarish', width / 2, instructionY + 40);
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
        this.usedEvents = [];
        this.newRound();
        this.gameRenderLoop();
    }

    gameRenderLoop() {
        const renderTimer = setInterval(() => {
            if (this.gameState !== 'playing') {
                clearInterval(renderTimer);
                return;
            }
            // Continuously redraw to show updates
            this.draw();
        }, 100);
    }

    endGame() {
        this.gameState = 'gameOver';
        this.draw();
        // Update UI to hide game buttons
        if (window.updateGameUI) {
            window.updateGameUI();
        }
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

// Expose to window
window.HistoryTimeline = HistoryTimeline;
