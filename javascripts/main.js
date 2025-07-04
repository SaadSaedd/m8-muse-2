// main.js - Main application logic and coordination
document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const introContainer      = document.getElementById('introContainer'),
          introVideo          = document.getElementById('introVideo'),
          mainApp             = document.getElementById('mainApp'),
          clickToStartOverlay = document.getElementById('clickToStartOverlay'),
          clickPrompt         = document.getElementById('clickPrompt'),
          floatingElements    = document.getElementById('floatingElements'),
          animationContainer  = document.getElementById('animationContainer'),
          animationGif        = document.getElementById('animationGif'),
          instructionsPopup   = document.getElementById('instructionsPopup'),
          closeInstructions   = document.getElementById('closeInstructions');


    // Application state
    let introCompleted       = false;
    let inactivityTimer      = null;
    let lastPersonDetected   = Date.now();
    const INACTIVITY_TIMEOUT = 3 * 60 * 1000; // 3 minutes in milliseconds

    // Initialize modules
    const handTracker  = new HandTracker();
    const wordAnimator = new WordAnimator();
    const quizManager  = new QuizManager(wordAnimator);

    // Set up callbacks between modules
    console.log( handTracker );
    handTracker.setOnHandDetectedCallback(() => {
        resetInactivityTimer();
    });

    handTracker.setOnFontSizeChangeCallback((fontSize) => {
        wordAnimator.updateFontSize(fontSize);
    });

    // Connect gesture detection to quiz answers and intro start
    handTracker.setOnGestureDetectedCallback((gestureIndex, confidence) => {
        gestureDetectedCallback(gestureIndex, confidence);
    });
    function gestureDetectedCallback(gestureIndex, confidence) {
        console.log('==> Gesture detected:', gestureIndex, '; with confidence:', confidence,'; introCompleted:', introCompleted);

        // If showing 5 fingers (open hand) during intro, start the quiz
        // Try multiple possible indices for 5 fingers gesture
        if (!introCompleted) {
            // Check for various possible 5-finger gesture indices
            const possibleFiveFingerIndices = [4, 5, 0]; // Common indices for 5 fingers

            if (possibleFiveFingerIndices.includes(gestureIndex)) {
                console.log(`5 fingers detected (index ${gestureIndex}) during intro - starting quiz!`);
                startMainApp();
                return;
            }

            // Also allow any high confidence gesture to start (fallback)
            if (confidence > 0.8) {
                console.log(`High confidence gesture (${gestureIndex}) detected during intro - starting quiz!`);
                startMainApp();
                return;
            }
        }

        // Only handle quiz answers if quiz is active
        if (introCompleted) {
            // Find the answer button that corresponds to this gesture
            const answerButtons = document.querySelectorAll('.quiz-section .answer');

            if (answerButtons[gestureIndex]) {
                // Simulate a click on the corresponding answer button
                answerButtons[gestureIndex].click();

                // Reset inactivity timer since user interacted
                resetInactivityTimer();

                // Visual feedback that gesture was recognized
                console.log(`Gesture ${gestureIndex + 1} triggered answer ${gestureIndex + 1}`);
            }
        }
    }

    quizManager.setOnUserInteractionCallback(() => {
        resetInactivityTimer();
    });

    quizManager.setOnQuizCompleteCallback(() => {
        showIntroAgain();
    });

    // Function to create floating elements
    function createFloatingElements() {
        const words                = ['Quiz', 'Spel', 'Vraag', 'Antwoord', 'Denken', 'Weten', '?', '!', '💡', '🎯', '🎪', '⭐'];
        floatingElements.innerHTML = '';

        for (let i = 0; i < 15; i++) {
            const element                   = document.createElement('div');
            element.className               = 'floating-element';
            element.textContent             = words[Math.floor(Math.random() * words.length)];
            element.style.left              = Math.random() * 100 + '%';
            element.style.top               = Math.random() * 100 + '%';
            element.style.animationDelay    = Math.random() * 8 + 's';
            element.style.animationDuration = (6 + Math.random() * 4) + 's';
            floatingElements.appendChild(element);
        }
    }

    // Function to show click to start overlay
    function showClickToStart() {
        createFloatingElements();
        clickToStartOverlay.classList.remove('hide');
    }

    // Function to start the main quiz app
    function startMainApp() {
        // Show animation first
        if (typeof window.showAnimation === 'function') {
            window.showAnimation();
        }

        // Start the quiz after animation with smooth transition (3.3 seconds total)
        setTimeout(() => {
            mainApp.style.opacity    = '0';
            mainApp.style.display    = 'block';
            mainApp.style.transition = 'opacity 0.5s ease-in-out';

            // Fade in the main app
            setTimeout(() => {
                mainApp.classList.add('show');
                mainApp.style.opacity = '1';
                initializeQuizApp();
            }, 50);
        }, 3300);
    }

    // Function to show intro video again
    function showIntroAgain() {
        // Reset states
        introCompleted = false;

        // Clean up quiz and animations
        wordAnimator.destroy();
        // Don't stop hand tracker here - keep it running

        // Reset video to beginning
        introVideo.currentTime = 0;

        // Hide main app and show overlay again
        mainApp.classList.remove('show');
        clickToStartOverlay.classList.remove('hide');

        // Show intro container
        introContainer.style.display = 'flex';
        introContainer.classList.remove('fade-out');

        // Play video
        introVideo.play().catch(console.error);

        // Reset inactivity timer
        resetInactivityTimer();

        // Clear any existing timeouts
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
            inactivityTimer = null;
        }
    }

    // Function to reset inactivity timer
    function resetInactivityTimer() {
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
        }

        lastPersonDetected = Date.now();

        // Only set timer if quiz is active (not during intro)
        if (introCompleted) {
            inactivityTimer = setTimeout(() => {
                console.log('No activity detected for 3 minutes, showing intro again');
                showIntroAgain();
            }, INACTIVITY_TIMEOUT);
        }
    }

    // Initialize the quiz application
    function initializeQuizApp() {
        introCompleted = true;

        // Start the quiz
        quizManager.start();

        // Camera is already running, no need to start it again

        // Start inactivity timer
        resetInactivityTimer();
    }



    // Instructions popup functionality
    function showInstructions() {
        instructionsPopup.classList.add('show');

        // Auto-hide after 10 seconds
        setTimeout(() => {
            hideInstructions();
        }, 10000);
    }

    function hideInstructions() {
        instructionsPopup.classList.remove('show');
    }


    // Event listeners
    clickPrompt.addEventListener('click', startMainApp);

    // Initialize click overlay immediately
    showClickToStart();

    // Start camera immediately when page loads
    handTracker.startCamera().catch(console.error);

    // Fallback if video fails to load
    introVideo.addEventListener('error', () => {
        console.warn('Intro video failed to load, showing click to start');
        showClickToStart();
    });

    // Optional: Auto-start after video ends (currently commented out in original)
    // introVideo.addEventListener('ended', startMainApp);



    // Close button functionality
    closeInstructions.addEventListener('click', hideInstructions);

    // Function to show animation (called from main.js)
    window.showAnimation = function() {
        console.log('Starting animation sequence...');

        // Hide intro container with fade
        introContainer.style.transition = 'opacity 0.3s ease-out';
        introContainer.style.opacity = '0';

        setTimeout(() => {
            introContainer.style.display = 'none';
        }, 300);

        // Hide click to start overlay with fade
        clickToStartOverlay.style.transition = 'opacity 0.3s ease-out';
        clickToStartOverlay.style.opacity = '0';

        setTimeout(() => {
            clickToStartOverlay.style.display = 'none';
        }, 300);

        // Show animation container with fade in
        setTimeout(() => {
            animationContainer.style.display = 'flex';
            animationContainer.classList.add('active');
        }, 300);

        // Force reload the GIF to restart it
        if (animationGif) {
            const gifSrc = 'ani.gif';
            animationGif.src = '';
            setTimeout(() => {
                // Add timestamp to force browser to reload the GIF
                animationGif.src = gifSrc + '?t=' + new Date().getTime();
            }, 400);
        }

        // After 3 seconds, hide animation with fade out
        setTimeout(() => {
            console.log('Animation finished, fading out...');
            animationContainer.style.opacity = '0';

            setTimeout(() => {
                animationContainer.classList.remove('active');
                animationContainer.style.display = 'none';
                animationContainer.style.opacity = '1'; // Reset for next time

                // Show instructions popup after animation ends and quiz starts
                setTimeout(() => {
                    showInstructions();
                }, 500);
            }, 300);
        }, 3000);
    };
});