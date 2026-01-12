// Shared JavaScript utilities for Electrical Aptitude Test Practice Site

/**
 * Initialize common functionality when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function () {
    // Add any shared initialization code here
    console.log('Electrical Aptitude Test Practice Site loaded');

    // Example: Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});

/**
 * Utility function to format time (for future timer functionality)
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Utility function to show notifications/alerts
 */
function showNotification(message, type = 'info') {
    // Placeholder for future notification system
    console.log(`[${type.toUpperCase()}] ${message}`);
}

/**
 * Exam Grading Functions - Shared between exam1.html and exam2.html
 */

/**
 * Clear all radio button answers
 */
function clearAllAnswers() {
    const allRadioButtons = document.querySelectorAll('input[type="radio"]');
    allRadioButtons.forEach(radio => {
        radio.checked = false;
    });
}

/**
 * Get color class based on percentage (for math and reading scores)
 */
function getColorClass(percent) {
    if (percent >= 60) {
        return 'bg-success';
    } else if (percent >= 40 && percent < 60) {
        return 'bg-warning';
    } else {
        return 'bg-danger';
    }
}

/**
 * Get color class for overall score (40-60 is yellow)
 */
function getOverallColorClass(percent) {
    if (percent >= 60) {
        return 'bg-success';
    } else if (percent >= 40 && percent < 60) {
        return 'bg-warning';
    } else {
        return 'bg-danger';
    }
}

/**
 * Update a score bar element
 */
function updateScoreBar(barId, scoreId, totalId, correct, total, percentage, colorClassFn = getColorClass) {
    const bar = document.getElementById(barId);
    const scoreEl = document.getElementById(scoreId);
    const totalEl = document.getElementById(totalId);

    console.log(`Updating ${barId}:`, { bar: !!bar, scoreEl: !!scoreEl, totalEl: !!totalEl, correct, total, percentage });

    if (bar) {
        bar.style.width = percentage + '%';
        bar.setAttribute('aria-valuenow', percentage);
        bar.textContent = percentage + '%';
        bar.className = 'progress-bar ' + colorClassFn(percentage);
    } else {
        console.error(`Element not found: ${barId}`);
    }
    if (scoreEl) {
        scoreEl.textContent = correct;
    } else {
        console.error(`Element not found: ${scoreId}`);
    }
    if (totalEl) {
        totalEl.textContent = total;
    } else {
        console.error(`Element not found: ${totalId}`);
    }
}

/**
 * Initialize exam grading functionality
 * @param {Object} answerExplanations - Object mapping question numbers to their explanations
 */
function initExamGrading(answerExplanations) {
    const gradeBtn = document.getElementById('gradeExamBtn');
    const resultsSection = document.getElementById('resultsSection');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const missedQuestionsDiv = document.getElementById('missedQuestions');
    const donationModalElement = document.getElementById('donationModal');
    const donationModal = donationModalElement ? new bootstrap.Modal(donationModalElement) : null;

    // Initialize timer functionality (this also sets up clear button handlers)
    initTimers();

    if (!gradeBtn) {
        console.error('Grade button not found');
        return;
    }

    gradeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        // Stop all timers when grading
        stopAllTimers();
        try {
            gradeReadingSection(answerExplanations, resultsSection, scoreDisplay, missedQuestionsDiv, donationModal);
        } catch (error) {
            console.error('Error grading exam:', error);
            alert('An error occurred while grading the exam. Please check the console for details.');
        }
    });
}

/**
 * Grade the reading section and display results
 */
function gradeReadingSection(answerExplanations, resultsSection, scoreDisplay, missedQuestionsDiv, donationModal) {
    const questions = document.querySelectorAll('.question[data-question]');
    let correct = 0;
    let total = questions.length;
    let mathCorrect = 0;
    let mathTotal = 0;
    let readingCorrect = 0;
    let readingTotal = 0;
    const allQuestions = [];

    questions.forEach(question => {
        const questionNum = question.getAttribute('data-question');
        const correctAnswer = question.getAttribute('data-correct');
        const isMathQuestion = questionNum.startsWith('m');

        // Handle both reading questions (q1, q2, etc.) and math questions (m1, m2, etc.)
        const inputName = isMathQuestion ? questionNum : `q${questionNum}`;
        const selectedRadio = question.querySelector(`input[name="${inputName}"]:checked`);
        const questionElement = document.querySelector(`.question[data-question="${questionNum}"]`);

        // Extract question text - handle math questions differently
        let questionText = '';
        if (isMathQuestion) {
            // For math questions, extract all content before the form-check divs
            const questionContent = questionElement.cloneNode(true);
            // Remove all form-check elements
            questionContent.querySelectorAll('.form-check').forEach(el => el.remove());
            // Get all paragraph elements
            const paragraphs = questionContent.querySelectorAll('p');
            let questionHTML = '';
            paragraphs.forEach(p => {
                questionHTML += p.outerHTML;
            });
            questionText = questionHTML || 'Question ' + questionNum;
            mathTotal++;
        } else {
            // For reading questions, just get the bold text
            const questionTextElement = questionElement ? questionElement.querySelector('.fw-bold') : null;
            questionText = questionTextElement ? questionTextElement.textContent : 'Question ' + questionNum;
            readingTotal++;
        }

        const isCorrect = selectedRadio && selectedRadio.value === correctAnswer;

        if (isCorrect) {
            correct++;
            if (isMathQuestion) {
                mathCorrect++;
            } else {
                readingCorrect++;
            }
        }

        // For sorting: math questions (m1, m2) get lower numbers (1, 2) so they appear first
        // Reading questions (1, 2, etc.) get higher numbers (1000+) so they appear after
        let sortNum;
        if (questionNum.startsWith('m')) {
            sortNum = parseInt(questionNum.substring(1));
        } else {
            sortNum = 1000 + parseInt(questionNum);
        }

        allQuestions.push({
            num: questionNum,
            sortNum: sortNum,
            correct: correctAnswer,
            selected: selectedRadio ? selectedRadio.value : 'No answer selected',
            explanation: answerExplanations[questionNum] || 'No explanation available',
            questionText: questionText,
            isCorrect: isCorrect
        });
    });

    // Sort all questions by sort number (math first, then reading)
    allQuestions.sort((a, b) => a.sortNum - b.sortNum);

    // Calculate percentages
    const overallPercentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const mathPercentage = mathTotal > 0 ? Math.round((mathCorrect / mathTotal) * 100) : 0;
    const readingPercentage = readingTotal > 0 ? Math.round((readingCorrect / readingTotal) * 100) : 0;

    // Debug logging
    console.log('Score Calculation:', {
        overall: { correct, total, percentage: overallPercentage },
        math: { correct: mathCorrect, total: mathTotal, percentage: mathPercentage },
        reading: { correct: readingCorrect, total: readingTotal, percentage: readingPercentage }
    });

    // Update modal with all three scores BEFORE showing it
    updateScoreBar('modalOverallBar', 'modalOverallScore', 'modalOverallTotal', correct, total, overallPercentage, getOverallColorClass);
    updateScoreBar('modalMathBar', 'modalMathScore', 'modalMathTotal', mathCorrect, mathTotal, mathPercentage);
    updateScoreBar('modalReadingBar', 'modalReadingScore', 'modalReadingTotal', readingCorrect, readingTotal, readingPercentage);

    // Show the modal after updating
    if (donationModal) {
        donationModal.show();
    }

    // Display score breakdowns
    scoreDisplay.innerHTML = `
        <h4 class="mb-4">Your Scores</h4>
        
        <!-- Overall Score -->
        <div class="mb-4">
            <h5 class="mb-2">Overall Score</h5>
            <div class="progress mb-2" style="height: 35px;">
                <div class="progress-bar ${getOverallColorClass(overallPercentage)}" 
                     role="progressbar" style="width: ${overallPercentage}%" 
                     aria-valuenow="${overallPercentage}" aria-valuemin="0" aria-valuemax="100">${overallPercentage}%</div>
            </div>
            <p class="mb-1">${correct} out of ${total} correct</p>
            <p class="mb-0 small text-muted"><em>A score of 60% or higher indicates that you have a great chance of passing the test.</em></p>
        </div>

        <!-- Math Score -->
        <div class="mb-4">
            <h5 class="mb-2">Math Score</h5>
            <div class="progress mb-2" style="height: 35px;">
                <div class="progress-bar ${getColorClass(mathPercentage)}" 
                     role="progressbar" style="width: ${mathPercentage}%" 
                     aria-valuenow="${mathPercentage}" aria-valuemin="0" aria-valuemax="100">${mathPercentage}%</div>
            </div>
            <p class="mb-0">${mathCorrect} out of ${mathTotal} correct</p>
        </div>

        <!-- Reading Score -->
        <div class="mb-4">
            <h5 class="mb-2">Reading Score</h5>
            <div class="progress mb-2" style="height: 35px;">
                <div class="progress-bar ${getColorClass(readingPercentage)}" 
                     role="progressbar" style="width: ${readingPercentage}%" 
                     aria-valuenow="${readingPercentage}" aria-valuemin="0" aria-valuemax="100">${readingPercentage}%</div>
            </div>
            <p class="mb-0">${readingCorrect} out of ${readingTotal} correct</p>
        </div>
    `;

    // Display all questions in order (math first, then reading)
    let allQuestionsHTML = '<h5 class="mb-3">All Questions:</h5>';
    let currentSection = null;

    allQuestions.forEach(item => {
        // Add section header when transitioning from math to reading
        if (item.num.startsWith('m') && currentSection !== 'math') {
            allQuestionsHTML += '<h5 class="mt-4 mb-3">Math Section</h5>';
            currentSection = 'math';
        } else if (!item.num.startsWith('m') && currentSection !== 'reading') {
            allQuestionsHTML += '<h5 class="mt-4 mb-3">Reading Section</h5>';
            currentSection = 'reading';
        }
        const questionLabel = item.num.startsWith('m') ? `Math Question ${item.num.substring(1)}` : `Reading Question ${item.num}`;
        const isMathQuestion = item.num.startsWith('m');
        const questionDisplay = isMathQuestion
            ? `<div class="mb-3" style="text-align: center;">${item.questionText}</div>`
            : `<p class="mb-2"><strong>Question:</strong> ${item.questionText}</p>`;

        if (item.isCorrect) {
            // Green box for correct answers
            allQuestionsHTML += `
                <div class="card mb-3 border-success">
                    <div class="card-header bg-success text-white">
                        <strong>${questionLabel}</strong>
                    </div>
                    <div class="card-body">
                        ${questionDisplay}
                        <p class="mb-2 text-success"><strong>Your Answer:</strong> ${item.selected} ✓</p>
                        <p class="mb-0"><strong>Explanation:</strong> ${item.explanation}</p>
                    </div>
                </div>
            `;
        } else {
            // Red box for incorrect answers
            allQuestionsHTML += `
                <div class="card mb-3 border-danger">
                    <div class="card-header bg-danger text-white">
                        <strong>${questionLabel}</strong>
                    </div>
                    <div class="card-body">
                        ${questionDisplay}
                        <p class="mb-1 text-danger"><strong>Your Answer:</strong> ${item.selected}</p>
                        <p class="mb-2 text-success"><strong>Correct Answer:</strong> ${item.correct}</p>
                        <p class="mb-0"><strong>Explanation:</strong> ${item.explanation}</p>
                    </div>
                </div>
            `;
        }
    });

    missedQuestionsDiv.innerHTML = allQuestionsHTML;

    // Show results section
    resultsSection.style.display = 'block';

    // Re-render MathJax for the explanations
    if (window.MathJax && window.MathJax.typesetPromise) {
        MathJax.typesetPromise([missedQuestionsDiv]).catch(function (err) {
            console.error('MathJax rendering error:', err);
        });
    }

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Timer functionality for exam sections
 */

// TIMER LENGTH CONFIGURATION - Change this value to adjust timer duration (in minutes)
const TIMER_DURATION_MINUTES = 50

let mathTimerInterval = null;
let readingTimerInterval = null;
let mathTimerSeconds = 0;
let readingTimerSeconds = 0;
let mathTimerRunning = false;
let readingTimerRunning = false;

/**
 * Format seconds into MM:SS format
 */
function formatTimerTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Update timer display
 */
function updateTimerDisplay(timerId, seconds) {
    const timerElement = document.getElementById(timerId);
    if (timerElement) {
        const remaining = TIMER_DURATION_MINUTES * 60 - seconds;
        if (remaining <= 0) {
            timerElement.textContent = '00:00';
        } else {
            timerElement.textContent = formatTimerTime(remaining);
        }
    }
}

/**
 * Reset timer display to initial value
 */
function resetTimerDisplay(timerId) {
    const timerElement = document.getElementById(timerId);
    if (timerElement) {
        timerElement.textContent = formatTimerTime(TIMER_DURATION_MINUTES * 60);
    }
}

/**
 * Stop and reset math timer
 */
function stopMathTimer() {
    if (mathTimerInterval) {
        clearInterval(mathTimerInterval);
        mathTimerInterval = null;
    }
    mathTimerRunning = false;
    mathTimerSeconds = 0;

    const mathTimerBtn = document.getElementById('startMathTimerBtn');
    const mathStopBtn = document.getElementById('stopMathTimerBtn');

    if (mathTimerBtn) {
        mathTimerBtn.disabled = false;
        mathTimerBtn.textContent = 'Start Timer';
    }

    if (mathStopBtn) {
        mathStopBtn.style.display = 'none';
    }

    resetTimerDisplay('mathTimerDisplay');
}

/**
 * Stop and reset reading timer
 */
function stopReadingTimer() {
    if (readingTimerInterval) {
        clearInterval(readingTimerInterval);
        readingTimerInterval = null;
    }
    readingTimerRunning = false;
    readingTimerSeconds = 0;

    const readingTimerBtn = document.getElementById('startReadingTimerBtn');
    const readingStopBtn = document.getElementById('stopReadingTimerBtn');

    if (readingTimerBtn) {
        readingTimerBtn.disabled = false;
        readingTimerBtn.textContent = 'Start Timer';
    }

    if (readingStopBtn) {
        readingStopBtn.style.display = 'none';
    }

    resetTimerDisplay('readingTimerDisplay');
}

/**
 * Stop and reset all timers
 */
function stopAllTimers() {
    stopMathTimer();
    stopReadingTimer();
}

/**
 * Start math section timer
 */
function startMathTimer() {
    if (mathTimerRunning) {
        return; // Timer already running
    }

    mathTimerSeconds = 0;
    mathTimerRunning = true;
    const mathTimerDisplay = document.getElementById('mathTimerDisplay');
    const mathTimerBtn = document.getElementById('startMathTimerBtn');
    const mathStopBtn = document.getElementById('stopMathTimerBtn');

    if (mathTimerBtn) {
        mathTimerBtn.disabled = true;
        mathTimerBtn.textContent = 'Timer Running...';
    }

    if (mathStopBtn) {
        mathStopBtn.style.display = 'inline-block';
    }

    mathTimerInterval = setInterval(() => {
        mathTimerSeconds++;
        updateTimerDisplay('mathTimerDisplay', mathTimerSeconds);

        // Check if timer duration has passed
        if (mathTimerSeconds >= TIMER_DURATION_MINUTES * 60) {
            clearInterval(mathTimerInterval);
            mathTimerInterval = null;
            mathTimerRunning = false;
            showMathTimerCompleteModal();

            // Reset button states
            if (mathTimerBtn) {
                mathTimerBtn.disabled = false;
                mathTimerBtn.textContent = 'Start Timer';
            }
            if (mathStopBtn) {
                mathStopBtn.style.display = 'none';
            }
        }
    }, 1000);
}

/**
 * Start reading section timer
 */
function startReadingTimer() {
    if (readingTimerRunning) {
        return; // Timer already running
    }

    readingTimerSeconds = 0;
    readingTimerRunning = true;
    const readingTimerDisplay = document.getElementById('readingTimerDisplay');
    const readingTimerBtn = document.getElementById('startReadingTimerBtn');
    const readingStopBtn = document.getElementById('stopReadingTimerBtn');

    if (readingTimerBtn) {
        readingTimerBtn.disabled = true;
        readingTimerBtn.textContent = 'Timer Running...';
    }

    if (readingStopBtn) {
        readingStopBtn.style.display = 'inline-block';
    }

    readingTimerInterval = setInterval(() => {
        readingTimerSeconds++;
        updateTimerDisplay('readingTimerDisplay', readingTimerSeconds);

        // Check if timer duration has passed
        if (readingTimerSeconds >= TIMER_DURATION_MINUTES * 60) {
            clearInterval(readingTimerInterval);
            readingTimerInterval = null;
            readingTimerRunning = false;
            showReadingTimerCompleteModal();

            // Reset button states
            if (readingTimerBtn) {
                readingTimerBtn.disabled = false;
                readingTimerBtn.textContent = 'Start Timer';
            }
            if (readingStopBtn) {
                readingStopBtn.style.display = 'none';
            }
        }
    }, 1000);
}

/**
 * Show modal when math timer completes
 */
function showMathTimerCompleteModal() {
    const modal = document.getElementById('mathTimerCompleteModal');
    if (modal) {
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }
}

/**
 * Show modal when reading timer completes and trigger grading
 */
function showReadingTimerCompleteModal() {
    const modal = document.getElementById('readingTimerCompleteModal');
    if (modal) {
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }
}

/**
 * Initialize timer functionality
 */
function initTimers() {
    const startMathBtn = document.getElementById('startMathTimerBtn');
    const startReadingBtn = document.getElementById('startReadingTimerBtn');
    const stopMathBtn = document.getElementById('stopMathTimerBtn');
    const stopReadingBtn = document.getElementById('stopReadingTimerBtn');
    const mathTimerCloseBtn = document.getElementById('mathTimerCloseBtn');
    const readingTimerGradeBtn = document.getElementById('readingTimerGradeBtn');
    const gradeBtn = document.getElementById('gradeExamBtn');
    const clearBtnTop = document.getElementById('clearAnswersBtnTop');
    const clearBtnBottom = document.getElementById('clearAnswersBtnBottom');

    if (startMathBtn) {
        startMathBtn.addEventListener('click', startMathTimer);
    }

    if (startReadingBtn) {
        startReadingBtn.addEventListener('click', startReadingTimer);
    }

    if (stopMathBtn) {
        stopMathBtn.addEventListener('click', stopMathTimer);
        stopMathBtn.style.display = 'none'; // Initially hidden
    }

    if (stopReadingBtn) {
        stopReadingBtn.addEventListener('click', stopReadingTimer);
        stopReadingBtn.style.display = 'none'; // Initially hidden
    }

    if (mathTimerCloseBtn) {
        mathTimerCloseBtn.addEventListener('click', () => {
            const modal = document.getElementById('mathTimerCompleteModal');
            if (modal) {
                const bootstrapModal = bootstrap.Modal.getInstance(modal);
                if (bootstrapModal) {
                    bootstrapModal.hide();
                }
            }
        });
    }

    if (readingTimerGradeBtn) {
        readingTimerGradeBtn.addEventListener('click', () => {
            // Stop all timers
            stopAllTimers();

            // Close the reading timer modal
            const readingModal = document.getElementById('readingTimerCompleteModal');
            if (readingModal) {
                const bootstrapModal = bootstrap.Modal.getInstance(readingModal);
                if (bootstrapModal) {
                    bootstrapModal.hide();
                }
            }

            // Trigger the grade exam button click
            if (gradeBtn) {
                gradeBtn.click();
            }
        });
    }

    // Stop and reset timers when clear answers buttons are clicked
    if (clearBtnTop) {
        clearBtnTop.addEventListener('click', function () {
            if (confirm('Are you sure you want to clear all answers? This cannot be undone.')) {
                stopAllTimers();
                clearAllAnswers();
            }
        });
    }

    if (clearBtnBottom) {
        clearBtnBottom.addEventListener('click', function () {
            if (confirm('Are you sure you want to clear all answers? This cannot be undone.')) {
                stopAllTimers();
                clearAllAnswers();
            }
        });
    }
}

