// Animation Utilities for Game Feedback

(function(window) {
    'use strict';

    const GameAnimations = {
        // Confetti burst animation
        confetti: function(element, color = '#6f42c1', count = 20) {
            if (!element) return;

            const rect = element.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            for (let i = 0; i < count; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti animate-gpu';
                confetti.style.left = x + 'px';
                confetti.style.top = y + 'px';
                confetti.style.backgroundColor = color;
                confetti.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');

                document.body.appendChild(confetti);

                // Remove element after animation
                setTimeout(() => confetti.remove(), 1500);
            }
        },

        // Particle burst effect
        particleBurst: function(x, y, color = '#6f42c1', count = 15) {
            for (let i = 0; i < count; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle animate-gpu';
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                particle.style.backgroundColor = color;

                const angle = (i / count) * Math.PI * 2;
                const distance = Math.random() * 100 + 50;
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;

                particle.style.setProperty('--tx', tx + 'px');
                particle.style.setProperty('--ty', ty + 'px');

                document.body.appendChild(particle);

                // Remove element after animation
                setTimeout(() => particle.remove(), 1000);
            }
        },

        // Shake animation
        shake: function(element, duration = 500, intensity = 5) {
            if (!element) return;

            const originalStyle = element.getAttribute('style') || '';
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                if (elapsed < duration) {
                    const offset = Math.sin(elapsed / 50) * intensity;
                    element.style.transform = 'translateX(' + offset + 'px)';
                    requestAnimationFrame(animate);
                } else {
                    element.setAttribute('style', originalStyle);
                }
            };

            requestAnimationFrame(animate);
        },

        // Bounce animation
        bounce: function(element, duration = 600, height = 20) {
            if (!element) return;

            const originalStyle = element.getAttribute('style') || '';
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                if (progress < 1) {
                    const bounceAmount = Math.sin(progress * Math.PI) * height;
                    element.style.transform = 'translateY(-' + bounceAmount + 'px)';
                    requestAnimationFrame(animate);
                } else {
                    element.setAttribute('style', originalStyle);
                }
            };

            requestAnimationFrame(animate);
        },

        // Floating text animation
        floatingText: function(text, x, y, color = '#28a745', duration = 1000) {
            const floatingText = document.createElement('div');
            floatingText.className = 'float-up animate-gpu';
            floatingText.textContent = text;
            floatingText.style.position = 'fixed';
            floatingText.style.left = x + 'px';
            floatingText.style.top = y + 'px';
            floatingText.style.color = color;
            floatingText.style.fontWeight = 'bold';
            floatingText.style.fontSize = '24px';
            floatingText.style.pointerEvents = 'none';
            floatingText.style.zIndex = '9999';
            floatingText.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.3)';

            document.body.appendChild(floatingText);

            setTimeout(() => floatingText.remove(), duration);
        },

        // Score popup
        showScore: function(score, x, y, isNegative = false) {
            const color = isNegative ? '#dc3545' : '#28a745';
            const prefix = isNegative ? '-' : '+';
            const text = prefix + score;

            this.floatingText(text, x, y, color, 1000);
        },

        // Add shake class to element
        addShake: function(element, duration = 500) {
            if (!element) return;

            element.classList.add('shake');
            setTimeout(() => {
                element.classList.remove('shake');
            }, duration);
        },

        // Add bounce class to element
        addBounce: function(element, duration = 600) {
            if (!element) return;

            element.classList.add('bounce');
            setTimeout(() => {
                element.classList.remove('bounce');
            }, duration);
        },

        // Add scale pop animation
        addScalePop: function(element, duration = 500) {
            if (!element) return;

            element.classList.add('scale-pop');
            setTimeout(() => {
                element.classList.remove('scale-pop');
            }, duration);
        },

        // Pulse animation
        pulse: function(element, duration = 1500) {
            if (!element) return;

            element.classList.add('pulse');
            setTimeout(() => {
                element.classList.remove('pulse');
            }, duration);
        },

        // Fade in animation
        fadeIn: function(element, duration = 500) {
            if (!element) return;

            element.style.opacity = '0';
            element.classList.add('fade-in');

            setTimeout(() => {
                element.classList.remove('fade-in');
            }, duration);
        },

        // Celebration animation
        celebrate: function(element, duration = 1500) {
            if (!element) return;

            // Create multiple bursts of confetti
            this.confetti(element, '#FFD700', 30);
            this.particleBurst(
                element.getBoundingClientRect().left + element.offsetWidth / 2,
                element.getBoundingClientRect().top + element.offsetHeight / 2,
                '#6f42c1',
                25
            );

            element.classList.add('scale-pop');
            setTimeout(() => {
                element.classList.remove('scale-pop');
            }, duration);
        },

        // Game correct answer feedback
        correctAnswer: function(element, options = {}) {
            const defaults = {
                showConfetti: true,
                shake: false,
                bounce: true,
                score: null,
                scoreX: 0,
                scoreY: 0
            };

            const opts = { ...defaults, ...options };

            if (opts.bounce) {
                this.bounce(element);
            }

            if (opts.showConfetti) {
                this.confetti(element, '#28a745', 15);
            }

            if (opts.score !== null) {
                this.showScore(opts.score, opts.scoreX, opts.scoreY);
            }
        },

        // Game wrong answer feedback
        wrongAnswer: function(element, options = {}) {
            const defaults = {
                shake: true,
                pulse: false,
                color: '#dc3545'
            };

            const opts = { ...defaults, ...options };

            if (opts.shake) {
                this.shake(element, 400, 3);
            }

            if (opts.pulse) {
                this.pulse(element);
            }
        },

        // Loading spinner
        createSpinner: function(container, color = '#6f42c1') {
            if (!container) return;

            const spinner = document.createElement('div');
            spinner.className = 'spinner-border';
            spinner.style.color = color;
            spinner.setAttribute('role', 'status');

            const span = document.createElement('span');
            span.className = 'sr-only';
            span.textContent = 'Loading...';

            spinner.appendChild(span);
            container.appendChild(spinner);

            return spinner;
        },

        // Show toast notification
        toast: function(message, type = 'info', duration = 3000) {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.right = '20px';
            toast.style.padding = '15px 20px';
            toast.style.borderRadius = '4px';
            toast.style.zIndex = '10000';
            toast.textContent = message;

            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        },

        // Create achievement badge animation
        achievementUnlock: function(achievementElement, options = {}) {
            const defaults = {
                duration: 1500,
                showConfetti: true,
                celebrateColor: '#FFD700'
            };

            const opts = { ...defaults, ...options };

            achievementElement.classList.add('achievement-unlock');

            if (opts.showConfetti) {
                this.confetti(achievementElement, opts.celebrateColor, 40);
            }

            setTimeout(() => {
                achievementElement.classList.remove('achievement-unlock');
            }, opts.duration);
        }
    };

    // Export to window
    window.GameAnimations = GameAnimations;

})(window);
