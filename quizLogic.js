// lgbtqQuizLogic.js - Opinion-based quiz for LGBTQ+ topics
class QuizManager {
  constructor(wordAnimator) {
    this.wordAnimator = wordAnimator;
    this.quizData = [
      { 
        question: 'Vind jij dat lesbische vrouwen zich veilig moeten kunnen voelen om hand in hand over straat te lopen?', 
        answers: ['Ja, helemaal mee eens', 'Ja, maar niet overal', 'Geen commentaar', 'Nee, helemaal mee oneens'], 
        responses: {
          0: ['Mooi!', 'Liefde is liefde', 'Veiligheid voor iedereen', 'Respect!', 'Goed standpunt', 'Iedereen verdient liefde'],
          1: ['Begrijpelijk', 'Nuance waardevol', 'Contextafhankelijk', 'Eerlijk antwoord', 'Dank je', 'Respectvol'],
          2: ['Oké', 'Begrijpelijk', 'Jouw keuze', 'Neutraal', 'Respecteer ik', 'Dank je'],
          3: ['Begrijpelijk', 'Jouw mening telt', 'Oké', 'Eerlijk gezegd', 'Dank je', 'Respectvol']
        }
      },
      { 
        question: 'Ben jij van mening dat er meer ontmoetingsplekken moeten komen voor lesbische en bi+ vrouwen?', 
        answers: ['Ja, helemaal mee eens', 'Ja, maar niet overal', 'Geen commentaar', 'Nee, helemaal mee oneens'], 
        responses: {
          0: ['Super!', 'Gemeenschap is kracht', 'Meer plekken!', 'Verbinding helpt', 'Geweldig idee', 'Mooi gezegd'],
          1: ['Begrijpelijk', 'Selectief is ook goed', 'Interessant', 'Dank je', 'Respectvol', 'Eerlijk'],
          2: ['Oké', 'Begrijpelijk', 'Jouw keuze', 'Neutraal', 'Respecteer ik', 'Dank je'],
          3: ['Begrijpelijk', 'Jouw perspectief', 'Oké', 'Eerlijke mening', 'Dank je', 'Respectvol']
        }
      },
      { 
        question: 'Vind jij dat de gemeente moet zorgen voor veilige ruimtes voor LGBTQ-vrouwen van kleur?', 
        answers: ['Ja, helemaal mee eens', 'Ja, maar niet overal', 'Geen commentaar', 'Nee, helemaal mee oneens'], 
        responses: {
          0: ['Krachtig!', 'Inclusie belangrijk', 'Gelijkheid!', 'Geweldig standpunt', 'Diversiteit', 'Mooi gezegd'],
          1: ['Begrijpelijk', 'Selectief kan ook', 'Interessant', 'Eerlijk', 'Dank je', 'Respectvol'],
          2: ['Oké', 'Begrijpelijk', 'Jouw keuze', 'Neutraal', 'Respecteer ik', 'Dank je'],
          3: ['Begrijpelijk', 'Jouw kijk', 'Oké', 'Eerlijk', 'Dank je', 'Respectvol']
        }
      },
      { 
        question: 'Denk jij dat LGBTQ+ voorlichting op scholen belangrijk is?', 
        answers: ['Ja, helemaal mee eens', 'Ja, maar niet overal', 'Geen commentaar', 'Nee, helemaal mee oneens'], 
        responses: {
          0: ['Geweldig!', 'Educatie helpt', 'Begrip kweken', 'Heel belangrijk', 'Goede keuze', 'Vooruitgang'],
          1: ['Begrijpelijk', 'Selectief ook goed', 'Interessant', 'Eerlijk', 'Dank je', 'Respectvol'],
          2: ['Oké', 'Begrijpelijk', 'Jouw keuze', 'Neutraal', 'Respecteer ik', 'Dank je'],
          3: ['Begrijpelijk', 'Jouw mening', 'Oké', 'Eerlijke kijk', 'Dank je', 'Respectvol']
        }
      },
      { 
        question: 'Vind jij dat homoseksuele stellen kinderen mogen adopteren?', 
        answers: ['Ja, helemaal mee eens', 'Ja, maar niet overal', 'Geen commentaar', 'Nee, helemaal mee oneens'], 
        responses: {
          0: ['Liefde telt!', 'Gezin is liefde', 'Warm thuis', 'Mooi standpunt', 'Gelijkheid', 'Prachtig'],
          1: ['Begrijpelijk', 'Nuance waardevol', 'Contextafhankelijk', 'Eerlijk', 'Dank je', 'Respectvol'],
          2: ['Oké', 'Begrijpelijk', 'Jouw keuze', 'Neutraal', 'Respecteer ik', 'Dank je'],
          3: ['Begrijpelijk', 'Jouw kijk', 'Oké', 'Eerlijke mening', 'Dank je', 'Respectvol']
        }
      }
    ];

    this.currentIndex = 0;
    this.isTransitioning = false;
    this.responses = []; // Store user responses
    this.questionEl = document.querySelector('.quiz-section .question .text-question');
    this.questionContainer = document.querySelector('.quiz-section .question'); // Add reference to question container
    this.answersEl = document.querySelector('.quiz-section .answers');
    this.progressBar = document.getElementById('progressBar');
    this.quizSection = document.querySelector('.quiz-section');
    
    this.onUserInteractionCallback = null;
    this.onQuizCompleteCallback = null;

    // Finger emojis voor gesture mode (aantal vingers)
    this.fingerEmojis = ['☝️', '✌️', '🤟', '🖐️'];
    
    // Categorized word collections based on answer types
    this.wordCategories = {
      // Words for positive/supportive answers (Ja, helemaal mee eens)
      positive: ['lesbisch en vrij', 'trots', 'zichtbaar', 'liefde', 'zorg', 'transvrijheid', 'inclusief', 'veiligheid', 'sterk', 'hoorbaar', 'onzichtbaar? nooit!', 'eigenmachtig'],
      
      // Words for conditional answers (Ja, maar niet overal)
      conditional: ['haat', 'overleven', 'slopen', 'lawaai', 'verzet', 'trots', 'opstandig', 'angst', 'onveilig', 'pot'],
      
      // Words for neutral answers (Geen commentaar)
      neutral: ['wegloper', 'pot', 'leegte', 'angst', 'geweld', 'transhaat', 'slapzak', 'schaam je', 'hypocriet', 'haat', 'lippen dicht handen vuil'],
      
      // Words for negative answers (Nee, helemaal mee oneens)
      negative: ['onzichtbaar', 'onveilig', 'machteloos', 'geen vrijheid', 'gevangenschap', 'vrouwenhaat', 'gebroken', 'misbruikt', 'verraad', 'verstikt', 'afgestompt']
    };
    
    // Default words to show initially
    this.defaultWords = this.wordCategories.positive;
    
    // Track current word mode
    this.currentResponseWords = null;
    
    // Initialize question container styling
    this.setupQuestionContainer();
  }

  setupQuestionContainer() {
    if (this.questionContainer) {
      // Apply background image and styling to question container
      this.questionContainer.style.position = 'relative';
      this.questionContainer.style.backgroundImage = 'url("text.png")'; // Change to your image path
      this.questionContainer.style.backgroundSize = 'cover';
      this.questionContainer.style.backgroundPosition = 'center';
      this.questionContainer.style.backgroundRepeat = 'no-repeat';
      this.questionContainer.style.minHeight = '350px'; // Increased height
      this.questionContainer.style.height = 'auto'; // Allow height to grow
      this.questionContainer.style.display = 'flex';
      this.questionContainer.style.alignItems = 'center';
      this.questionContainer.style.justifyContent = 'center';
      this.questionContainer.style.padding = '1.5rem';
      this.questionContainer.style.borderRadius = '15px';
      this.questionContainer.style.marginBottom = '2rem';
      
      this.questionContainer.style.overflow = 'visible'; // Ensure text isn't clipped
      
      // Style the question text for better readability
      if (this.questionEl) {
        this.questionEl.style.position = 'relative';
        this.questionEl.style.zIndex = '2';
        this.questionEl.style.textAlign = 'center';
        this.questionEl.style.fontSize = 'clamp(1.1rem, 2.5vw, 1.4rem)'; // Responsive font size
        this.questionEl.style.fontWeight = 'bold';
        this.questionEl.style.lineHeight = '1.3';
        this.questionEl.style.color = '#ffffff';
        
        this.questionEl.style.padding = '1.2rem';
        this.questionEl.style.color = 'black';
        this.questionEl.style.marginLeft = '2rem';
        
        this.questionEl.style.borderRadius = '12px';
        
        this.questionEl.style.maxWidth = '60%';
        this.questionEl.style.width = '100%';
        this.questionEl.style.boxSizing = 'border-box';
        this.questionEl.style.wordWrap = 'break-word';
        this.questionEl.style.overflowWrap = 'break-word';
        this.questionEl.style.hyphens = 'auto';
        
        // Add media query styles for smaller screens
        const style = document.createElement('style');
        style.textContent = `
          @media (max-width: 768px) {
            .quiz-section .question {
              min-height: 200px !important;
              padding: 1rem !important;
            }
            .quiz-section .question .text-question {
              font-size: 1rem !important;
              line-height: 1.2 !important;
              padding: 1rem !important;
            }
          }
          @media (max-width: 480px) {
            .quiz-section .question {
              min-height: 350px !important;
              padding: 0.8rem !important;
            }
            .quiz-section .question .text-question {
              font-size: 0.9rem !important;
              line-height: 1.1 !important;
              padding: 0.8rem !important;
            }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }

  setOnUserInteractionCallback(callback) {
    this.onUserInteractionCallback = callback;
  }

  setOnQuizCompleteCallback(callback) {
    this.onQuizCompleteCallback = callback;
  }

  updateProgress() {
    const progress = (this.currentIndex / this.quizData.length) * 100;
    this.progressBar.style.width = `${progress}%`;
  }

  async loadQuestion() {
    const q = this.quizData[this.currentIndex];
    
    // Smooth question transition
    await this.animateQuestionChange(q.question);
    
    // Clear and rebuild answers
    this.answersEl.innerHTML = '';
    
    q.answers.forEach((ans, i) => {
      const btn = document.createElement('div');
      btn.className = 'answer opinion-answer image-button';
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.8) translateY(20px)';
      btn.style.cursor = 'pointer';
      
      // Completely clean button styling - only the image
      btn.style.position = 'relative';
      btn.style.width = '100%';
      btn.style.height = '100%';
      btn.style.border = 'none';
      btn.style.background = 'transparent ';
      btn.style.padding = '0';
      btn.style.margin = '0';
      
      // Pure image display
      const img = document.createElement('img');
      img.src = 'button.png';
      img.alt = ans;
      img.className = 'button-image';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.display = 'block';
      
      // Text overlay - completely transparent background
      const overlay = document.createElement('div');
      overlay.className = 'button-overlay';
      overlay.style.position = 'absolute';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.right = '0';
      overlay.style.bottom = '0';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.flexDirection = 'column';
     
      overlay.style.color = 'black';
      overlay.style.textShadow = '1px 1px 2px rgba(255, 255, 255, 0.8)';
      overlay.style.fontSize = '1rem';
      overlay.style.fontWeight = 'bold';
      overlay.style.textAlign = 'center';
      overlay.style.padding = '8px';
      overlay.style.pointerEvents = 'none';
      overlay.innerHTML = `<span class="finger-emoji" style="font-size: 1.2rem; margin-bottom: 4px;">${this.fingerEmojis[i]}</span><span class="answer-text" style="font-size: 1.6rem;">${ans}</span>`;
      
      // Simple hover effect - slight scale
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.02)';
        btn.style.transition = 'transform 0.2s ease';
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1)';
      });
      
      btn.appendChild(img);
      btn.appendChild(overlay);
      btn.addEventListener('click', () => this.handleResponse(i, btn));
      this.answersEl.appendChild(btn);
      
      // Staggered animation
      requestAnimationFrame(() => {
        setTimeout(() => {
          btn.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          btn.style.opacity = '1';
          btn.style.transform = 'scale(1) translateY(0)';
        }, i * 100);
      });
    });
    
    // Only show question words if we don't have response words to keep
    if (!this.currentResponseWords || this.currentIndex === 0) {
      this.wordAnimator.renderWords([...this.defaultWords]);
    }
    
    this.updateProgress();
    this.isTransitioning = false;
  }

  async animateQuestionChange(newQuestion) {
    return new Promise((resolve) => {
      // Animate the entire question container
      this.questionContainer.style.transition = 'all 0.4s ease-out';
      this.questionContainer.style.opacity = '0';
      this.questionContainer.style.transform = 'translateY(-30px) scale(0.95)';
      
      setTimeout(() => {
        this.questionEl.textContent = newQuestion;
        this.questionContainer.style.opacity = '1';
        this.questionContainer.style.transform = 'translateY(0) scale(1)';
        setTimeout(resolve, 400);
      }, 200);
    });
  }

  // Get words based on answer index
  getWordsForAnswer(answerIndex) {
    switch(answerIndex) {
      case 0: return this.wordCategories.positive;
      case 1: return this.wordCategories.conditional;
      case 2: return this.wordCategories.neutral;
      case 3: return this.wordCategories.negative;
      default: return this.wordCategories.positive;
    }
  }

  async handleResponse(selectedIndex, btnElement) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const q = this.quizData[this.currentIndex];
    
    // Store the response
    this.responses.push({
      questionIndex: this.currentIndex,
      answerIndex: selectedIndex,
      answer: q.answers[selectedIndex]
    });
    
    if (this.onUserInteractionCallback) {
      this.onUserInteractionCallback();
    }
    
    // Disable other buttons
    const allButtons = this.answersEl.querySelectorAll('.answer');
    allButtons.forEach(btn => {
      if (btn !== btnElement) {
        btn.style.transition = 'all 0.3s ease';
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
      }
    });
    
    // Get words based on the selected answer and store them
    const responseWords = this.getWordsForAnswer(selectedIndex);
    this.currentResponseWords = responseWords;
    
    // Animate selected answer and show response words
    await this.animateSelectedAnswer(btnElement, responseWords);
    
    // Longer delay to keep response words visible
    setTimeout(async () => {
      this.currentIndex++;
      if (this.currentIndex < this.quizData.length) {
        await this.loadQuestion();
      } else {
        this.completeQuiz();
      }
    }, 2000); // Increased from 800ms to 2000ms
  }

  async animateSelectedAnswer(btnElement, responseWords) {
    return new Promise((resolve) => {
      btnElement.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      btnElement.classList.add('selected-opinion');
      btnElement.style.transform = 'scale(1.1)';
      
      // Update words to show response and keep them
      this.wordAnimator.renderWords(responseWords);
      
      // Add gentle particle effect
      this.createResponseParticles(btnElement);
      
      setTimeout(resolve, 400);
    });
  }

  createResponseParticles(btnElement) {
    const rect = btnElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Gentler particles for opinion responses
    for (let i = 0; i < 6; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'fixed';
      particle.style.left = centerX + 'px';
      particle.style.top = centerY + 'px';
      particle.style.width = '6px';
      particle.style.height = '6px';
       // Purple color
      particle.style.borderRadius = '50%';
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '1000';
      particle.style.transition = 'all 0.8s ease-out';
      
      document.body.appendChild(particle);
      
      requestAnimationFrame(() => {
        const angle = (i / 6) * Math.PI * 2;
        const distance = 30 + Math.random() * 20;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        particle.style.transform = `translate(${x}px, ${y}px)`;
        particle.style.opacity = '0';
        particle.style.transform += ' scale(0.3)';
      });
      
      setTimeout(() => {
        if (document.body.contains(particle)) {
          document.body.removeChild(particle);
        }
      }, 800);
    }
  }

  completeQuiz() {
    // Animate the question container for completion
    this.questionContainer.style.transition = 'all 0.5s ease-out';
    this.questionContainer.style.transform = 'scale(1.05)';
    
    this.questionEl.style.transition = 'all 0.5s ease-out';
    this.questionEl.textContent = 'Bedankt voor je meningen!';
    this.quizSection.classList.add('quiz-complete');
    
    // Clear answers with fade out
    const allButtons = this.answersEl.querySelectorAll('.answer');
    allButtons.forEach((btn, i) => {
      setTimeout(() => {
        btn.style.transition = 'all 0.3s ease-out';
        btn.style.opacity = '0';
        btn.style.transform = 'scale(0.8) translateY(20px)';
      }, i * 50);
    });
    
    // Create summary and restart button
    setTimeout(() => {
      this.answersEl.innerHTML = '';
      
      // Show summary
      const summaryDiv = document.createElement('div');
      summaryDiv.className = 'quiz-summary';
      
      const restartBtn = document.createElement('div');
      restartBtn.className = 'answer restart-button image-button';

      restartBtn.style.gridColumn = '1 / -1';
      restartBtn.style.opacity = '0';
      restartBtn.style.transform = 'scale(0.8)';
      restartBtn.style.cursor = 'pointer';
      
      // Clean restart button styling - just the image
      restartBtn.style.position = 'relative';
      restartBtn.style.width = '60vw';
      restartBtn.style.height = '12rem';
      restartBtn.style.border = 'none';
      restartBtn.style.background = 'none';
      restartBtn.style.padding = '0';
      restartBtn.style.margin = '0';
      
      // Create image and overlay for restart button
      const restartImg = document.createElement('img');
      restartImg.src = 'button.png';
      restartImg.alt = 'Opnieuw Beginnen';
      restartImg.className = 'button-image';
      restartImg.style.width = '100vw';
      restartImg.style.height = '100rem';
      restartImg.style.objectFit = 'cover';
      restartImg.style.display = 'block';
      
      const restartOverlay = document.createElement('div');
      restartOverlay.className = 'button-overlay';
      restartOverlay.style.position = 'absolute';
      restartOverlay.style.top = '0';
      restartOverlay.style.left = '0';
      restartOverlay.style.right = '0';
      restartOverlay.style.bottom = '0';
      restartOverlay.style.display = 'flex';
      restartOverlay.style.alignItems = 'center';
      restartOverlay.style.justifyContent = 'center';
      restartOverlay.style.flexDirection = 'column';
      restartOverlay.style.background = 'transparent';
      restartOverlay.style.color = 'black';
      restartOverlay.style.textShadow = '1px 1px 2px rgba(255, 255, 255, 0.8)';
      restartOverlay.style.fontSize = '1.2rem';
      restartOverlay.style.fontWeight = 'bold';
      restartOverlay.style.textAlign = 'center';
      restartOverlay.style.padding = '8px';
      restartOverlay.style.pointerEvents = 'none';
      restartOverlay.innerHTML = '<span class="finger-emoji" style="font-size: 1.4rem; margin-bottom: 4px;">🔄</span><span class="answer-text" style="font-size: 1rem;">Opnieuw Beginnen</span>';
      
      restartBtn.appendChild(restartImg);
      restartBtn.appendChild(restartOverlay);
      
      restartBtn.addEventListener('click', () => {
        if (this.onUserInteractionCallback) {
          this.onUserInteractionCallback();
        }
        if (this.onQuizCompleteCallback) {
          this.onQuizCompleteCallback();
        }
      });
      
      this.answersEl.appendChild(summaryDiv);
      this.answersEl.appendChild(restartBtn);
      
      // Animate elements in
      requestAnimationFrame(() => {
        summaryDiv.style.opacity = '0';
        summaryDiv.style.transform = 'translateY(20px)';
        summaryDiv.style.transition = 'all 0.5s ease-out';
        
        setTimeout(() => {
          summaryDiv.style.opacity = '1';
          summaryDiv.style.transform = 'translateY(0)';
        }, 100);
        
        setTimeout(() => {
          restartBtn.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          restartBtn.style.opacity = '1';
          restartBtn.style.transform = 'scale(1)';
        }, 300);
      });
    }, 300);
    
    this.updateProgress();
    this.wordAnimator.renderWords(['Jouw stem telt', 'Bedankt!', 'Inclusie is belangrijk', 'Samen sterker', 'Respect']);
    
    // Auto-restart after 15 seconds
    setTimeout(() => {
      if (this.currentIndex >= this.quizData.length) {
        if (this.onQuizCompleteCallback) {
          this.onQuizCompleteCallback();
        }
      }
    }, 15000);
  }

  // Method to toggle word sets (now cycles through categories)
  toggleWordSet() {
    const categories = Object.keys(this.wordCategories);
    const currentCategory = Object.keys(this.wordCategories).find(key => 
      this.wordCategories[key] === this.defaultWords
    );
    const currentIndex = categories.indexOf(currentCategory);
    const nextIndex = (currentIndex + 1) % categories.length;
    
    this.defaultWords = this.wordCategories[categories[nextIndex]];
    
    // Update words immediately if we're not showing response words
    if (!this.currentResponseWords || this.currentIndex === 0) {
      this.wordAnimator.renderWords([...this.defaultWords]);
    }
  }

  reset() {
    this.currentIndex = 0;
    this.isTransitioning = false;
    this.responses = [];
    this.currentResponseWords = null;
    this.quizSection.classList.remove('quiz-complete');
    
    // Reset question container styling
    if (this.questionContainer) {
      this.questionContainer.style.transform = 'translateY(0) scale(1)';
      this.questionContainer.style.opacity = '1';
    }
    
    this.loadQuestion();
  }

  start() {
    this.reset();
  }

  isCompleted() {
    return this.currentIndex >= this.quizData.length;
  }

  // Get user responses for analysis
  getResponses() {
    return this.responses;
  }

  // Method to update question background image
  setQuestionBackgroundImage(imagePath) {
    if (this.questionContainer) {
      this.questionContainer.style.backgroundImage = `url("${imagePath}")`;
    }
  }

  // Method to customize question container styling
  customizeQuestionContainer(styles) {
    if (this.questionContainer) {
      Object.assign(this.questionContainer.style, styles);
    }
  }

  // Method to customize question text styling
  customizeQuestionText(styles) {
    if (this.questionEl) {
      Object.assign(this.questionEl.style, styles);
    }
  }
}