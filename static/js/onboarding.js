// Onboarding Tour for First-Time Users

(function(window) {
    'use strict';

    const OnboardingTour = {
        tourCompleted: false,
        currentStep: 0,
        steps: [
            {
                title: 'Nurli Kelajak Game Zone',
                description: 'Welcome to our amazing game platform! Let\'s take a quick tour to get you started.',
                target: '.navbar',
                position: 'bottom'
            },
            {
                title: 'Explore Games',
                description: 'Browse through our collection of fun and educational games. Each game offers unique challenges and learning opportunities.',
                target: '.game-card:first-child',
                position: 'top'
            },
            {
                title: 'Earn Achievements',
                description: 'Complete games and challenges to unlock achievements. Collect badges to showcase your progress and skill!',
                target: '.achievement-badge',
                position: 'top'
            },
            {
                title: 'Climb the Leaderboards',
                description: 'Compete with other players and earn your place on our leaderboards. Test your skills and see how you rank!',
                target: '.leaderboard-link, a[href*="leaderboard"]',
                position: 'bottom'
            },
            {
                title: 'Challenge Friends',
                description: 'Take on your friends in head-to-head challenges! Send and accept game challenges to compete directly.',
                target: '.btn-challenge, .challenge-btn',
                position: 'bottom'
            },
            {
                title: 'Share Your Scores',
                description: 'Share your achievements and scores with friends. Show off your best performances!',
                target: '.btn-share, .share-btn',
                position: 'bottom'
            },
            {
                title: 'Customize Your Experience',
                description: 'Visit your profile to customize your settings, track progress, and manage your preferences.',
                target: '.profile-link, a[href*="profile"]',
                position: 'bottom'
            }
        ],

        // Initialize the tour
        init: function() {
            const tourCompleted = localStorage.getItem('nurli_tour_completed') === 'true';

            if (!tourCompleted && this.steps.length > 0) {
                // Show on first visit
                this.showTourBanner();
            }
        },

        // Show banner prompting tour
        showTourBanner: function() {
            const banner = document.createElement('div');
            banner.id = 'tour-banner';
            banner.className = 'alert alert-info';
            banner.style.cssText = 'position: sticky; top: 0; z-index: 5000; margin: 0; border-radius: 0; display: flex; justify-content: space-between; align-items: center;';

            const message = document.createElement('span');
            message.textContent = '👋 New here? Take a tour to learn about all the amazing features!';

            const buttons = document.createElement('div');
            buttons.style.display = 'flex';
            buttons.style.gap = '10px';

            const startBtn = document.createElement('button');
            startBtn.className = 'btn btn-sm btn-primary';
            startBtn.textContent = 'Start Tour';
            startBtn.onclick = () => this.start();

            const skipBtn = document.createElement('button');
            skipBtn.className = 'btn btn-sm btn-secondary';
            skipBtn.textContent = 'Skip';
            skipBtn.onclick = () => {
                banner.remove();
                this.markCompleted();
            };

            buttons.appendChild(startBtn);
            buttons.appendChild(skipBtn);
            banner.appendChild(message);
            banner.appendChild(buttons);

            const firstElement = document.body.firstChild;
            if (firstElement) {
                document.body.insertBefore(banner, firstElement);
            } else {
                document.body.appendChild(banner);
            }
        },

        // Start the tour
        start: function() {
            const banner = document.getElementById('tour-banner');
            if (banner) banner.remove();

            this.currentStep = 0;
            this.showStep(0);
        },

        // Show a specific step
        showStep: function(stepIndex) {
            if (stepIndex >= this.steps.length) {
                this.complete();
                return;
            }

            const step = this.steps[stepIndex];
            const target = document.querySelector(step.target);

            if (!target) {
                // Skip if target doesn't exist
                this.currentStep++;
                this.showStep(this.currentStep);
                return;
            }

            const overlay = this.createOverlay(target, step);
            this.currentStep = stepIndex;
        },

        // Create overlay and tooltip
        createOverlay: function(target, step) {
            // Remove existing overlay
            const existingOverlay = document.getElementById('tour-overlay');
            if (existingOverlay) existingOverlay.remove();

            const overlay = document.createElement('div');
            overlay.id = 'tour-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                z-index: 10000;
            `;

            // Create spotlight on target
            const rect = target.getBoundingClientRect();
            const spotlight = document.createElement('div');
            spotlight.style.cssText = `
                position: fixed;
                top: ${rect.top - 5}px;
                left: ${rect.left - 5}px;
                width: ${rect.width + 10}px;
                height: ${rect.height + 10}px;
                border: 3px solid #6f42c1;
                border-radius: 8px;
                box-shadow: inset 0 0 0 9999px rgba(0, 0, 0, 0.8);
                z-index: 10001;
                pointer-events: none;
            `;

            // Create tooltip
            const tooltip = this.createTooltip(step, rect);

            overlay.appendChild(spotlight);
            overlay.appendChild(tooltip);

            // Click outside to skip step
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.nextStep();
                }
            });

            document.body.appendChild(overlay);

            // Scroll to target
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });

            return overlay;
        },

        // Create tooltip element
        createTooltip: function(step, targetRect) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tour-tooltip';
            tooltip.style.cssText = `
                position: fixed;
                background: white;
                border: 2px solid #6f42c1;
                border-radius: 8px;
                padding: 20px;
                z-index: 10002;
                max-width: 350px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            `;

            // Title
            const title = document.createElement('h4');
            title.style.marginTop = '0';
            title.style.marginBottom = '10px';
            title.style.color = '#6f42c1';
            title.textContent = step.title;

            // Description
            const description = document.createElement('p');
            description.style.marginBottom = '15px';
            description.style.fontSize = '14px';
            description.textContent = step.description;

            // Buttons container
            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.cssText = 'display: flex; gap: 10px; justify-content: flex-end;';

            // Skip button
            const skipBtn = document.createElement('button');
            skipBtn.className = 'btn btn-sm btn-secondary';
            skipBtn.textContent = 'Skip Tour';
            skipBtn.onclick = () => this.complete();

            // Next button
            const nextBtn = document.createElement('button');
            nextBtn.className = 'btn btn-sm btn-primary';
            nextBtn.textContent = this.currentStep === this.steps.length - 1 ? 'Finish' : 'Next';
            nextBtn.onclick = () => this.nextStep();

            buttonsContainer.appendChild(skipBtn);
            buttonsContainer.appendChild(nextBtn);

            // Progress indicator
            const progress = document.createElement('div');
            progress.style.cssText = 'font-size: 12px; color: #999; margin-bottom: 10px;';
            progress.textContent = `Step ${this.currentStep + 1} of ${this.steps.length}`;

            tooltip.appendChild(progress);
            tooltip.appendChild(title);
            tooltip.appendChild(description);
            tooltip.appendChild(buttonsContainer);

            // Position tooltip
            const tooltipWidth = 350;
            const tooltipHeight = 200;
            let top, left;

            if (step.position === 'bottom') {
                top = targetRect.bottom + 20;
                left = targetRect.left + (targetRect.width - tooltipWidth) / 2;
            } else {
                top = targetRect.top - tooltipHeight - 20;
                left = targetRect.left + (targetRect.width - tooltipWidth) / 2;
            }

            // Keep tooltip in viewport
            if (left < 10) left = 10;
            if (left + tooltipWidth > window.innerWidth - 10) {
                left = window.innerWidth - tooltipWidth - 10;
            }

            tooltip.style.top = Math.max(10, top) + 'px';
            tooltip.style.left = left + 'px';

            return tooltip;
        },

        // Go to next step
        nextStep: function() {
            this.currentStep++;
            if (this.currentStep >= this.steps.length) {
                this.complete();
            } else {
                this.showStep(this.currentStep);
            }
        },

        // Complete the tour
        complete: function() {
            const overlay = document.getElementById('tour-overlay');
            if (overlay) overlay.remove();

            this.markCompleted();

            // Show completion message
            if (window.GameAnimations && window.GameAnimations.toast) {
                GameAnimations.toast('🎉 Tour complete! Enjoy playing!', 'success', 3000);
            }
        },

        // Mark tour as completed
        markCompleted: function() {
            localStorage.setItem('nurli_tour_completed', 'true');
        },

        // Restart tour
        restart: function() {
            localStorage.setItem('nurli_tour_completed', 'false');
            this.init();
        }
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => OnboardingTour.init());
    } else {
        OnboardingTour.init();
    }

    // Expose to window
    window.OnboardingTour = OnboardingTour;

})(window);
