// Global variables
let currentQuestionIndex = 0;
const answers = {};

// DOM elements
const questionsContainer = document.getElementById('questions-container');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const progressPercentage = document.getElementById('progress-percentage');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const completionScreen = document.getElementById('completion-screen');
const loadingIndicator = document.getElementById('loading-indicator');
const restartBtn = document.getElementById('restart-btn');

let surveyData = null; // To hold the survey data
// Initialize the survey
function initSurvey() {
    const urlParams = new URLSearchParams(window.location.search);
    const m0 = urlParams.get('m0');
    const jsonUrl = m0 ? `${m0}.json` : 'default.json'; // fallback to default if m0 is missing

    fetch(jsonUrl)
        .then(res => res.json())
        .then(data => {
            surveyData = data;

            // Set header text from survey data
            document.querySelector('.survey-header h1').textContent = surveyData.title;
            document.querySelector('.survey-header p').textContent = surveyData.subtitle;

            // Create question elements
            surveyData.questions.forEach((question, index) => {
                const questionEl = createQuestionElement(question, index);
                questionsContainer.appendChild(questionEl);
            });

            // Show the first question
            updateQuestionVisibility();
            updateProgressBar();
            updateNavButtons();

            // Initial button state
            prevBtn.style.visibility = currentQuestionIndex === 0 ? 'hidden' : 'visible';
        });
}

function createQuestionElement(question, index) {
    const questionEl = document.createElement('div');
    questionEl.className = 'question';
    questionEl.id = `question-${index}`;
    questionEl.dataset.id = question.id;
    questionEl.setAttribute('role', 'group');
    questionEl.setAttribute('aria-labelledby', `question-title-${index}`);

    const numberEl = document.createElement('div');
    numberEl.className = 'question-number';
    numberEl.textContent = `Question ${index + 1}`;
    questionEl.appendChild(numberEl);

    const titleEl = document.createElement('h2');
    titleEl.className = 'question-title';
    titleEl.id = `question-title-${index}`;
    titleEl.textContent = question.title;
    questionEl.appendChild(titleEl);

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';
    optionsContainer.setAttribute('role', 'radiogroup');

    // Calculate if we need to adjust height based on number of options
    const optionsCount = question.options.length;
    if (optionsCount > 6) {
        // No need to set a style here because the options-container will scroll
    }

    question.options.forEach((optionText, optIndex) => {
        const optionEl = document.createElement('div');
        optionEl.className = 'option';
        optionEl.dataset.value = optionText;
        optionEl.setAttribute('role', 'radio');
        optionEl.setAttribute('aria-checked', 'false');
        optionEl.tabIndex = 0;

        const radioOuter = document.createElement('div');
        radioOuter.className = 'radio-outer';

        const radioInner = document.createElement('div');
        radioInner.className = 'radio-inner';
        radioOuter.appendChild(radioInner);

        const textEl = document.createElement('div');
        textEl.className = 'option-text';
        textEl.textContent = optionText;

        optionEl.appendChild(radioOuter);
        optionEl.appendChild(textEl);

        // Adjust option height if text is long
        if (optionText.length > 40) {
            optionEl.style.minHeight = "auto";
        }

        // Click handler
        optionEl.addEventListener('click', (e) => {
            createSplashEffect(e, optionEl);
            selectOption(index, optionText);
        });

        // Keyboard handler
        optionEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectOption(index, optionText);
            }
        });

        optionsContainer.appendChild(optionEl);
    });

    questionEl.appendChild(optionsContainer);
    return questionEl;
}
function createSplashEffect(e, optionEl) {
    const splash = document.createElement('div');
    splash.className = 'splash';
    const rect = optionEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    splash.style.left = `${x}px`;
    splash.style.top = `${y}px`;
    optionEl.appendChild(splash);

    // Remove splash after animation completes
    setTimeout(() => {
        splash.remove();
    }, 600);
}

// Handle option selection
function selectOption(questionIndex, optionValue) {
    const questionId = surveyData.questions[questionIndex].id;
    answers[questionId] = optionValue;

    // Update UI to show selection
    const questionEl = document.getElementById(`question-${questionIndex}`);
    const options = questionEl.querySelectorAll('.option');

    options.forEach(option => {
        if (option.dataset.value === optionValue) {
            option.classList.add('selected');
            option.setAttribute('aria-checked', 'true');
        } else {
            option.classList.remove('selected');
            option.setAttribute('aria-checked', 'false');
        }
    });

    // If this is the last question, change next button to submit
    if (questionIndex === surveyData.questions.length - 1) {
        nextBtn.textContent = 'Submit';
        nextBtn.className = 'btn btn-submit';
        nextBtn.innerHTML = 'Submit <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/></svg>';
    }

    // Auto-advance to next question after a short delay
    if (questionIndex < surveyData.questions.length - 1) {
        setTimeout(() => {
            nextQuestion();
        }, 800);
    }
}

// Go to the next question
function nextQuestion() {
    if (currentQuestionIndex < surveyData.questions.length - 1) {
        // Get current question ID
        const currentQuestionId = surveyData.questions[currentQuestionIndex].id;

        // If no answer selected, highlight options and show validation message
        if (!answers[currentQuestionId]) {
            const questionEl = document.getElementById(`question-${currentQuestionIndex}`);
            const optionsContainer = questionEl.querySelector('.options-container');
            optionsContainer.classList.add('shake');

            // Add validation message if it doesn't exist
            let validationMsg = questionEl.querySelector('.validation-message');
            if (!validationMsg) {
                validationMsg = document.createElement('div');
                validationMsg.className = 'validation-message';
                validationMsg.style.color = 'var(--error)';
                validationMsg.style.fontSize = '0.85rem';
                validationMsg.style.marginTop = '0.75rem';
                validationMsg.style.fontWeight = '500';
                validationMsg.textContent = 'Please select an option to continue';
                validationMsg.setAttribute('role', 'alert');
                questionEl.appendChild(validationMsg);
            }

            // Gentle pulse animation for options
            const options = questionEl.querySelectorAll('.option');
            options.forEach((option, i) => {
                setTimeout(() => {
                    option.style.transform = 'scale(1.02)';
                    setTimeout(() => {
                        option.style.transform = 'scale(1)';
                    }, 200);
                }, i * 100);
            });

            setTimeout(() => {
                optionsContainer.classList.remove('shake');
            }, 600);

            return;
        }

        // Remove validation message if it exists
        const questionEl = document.getElementById(`question-${currentQuestionIndex}`);
        const validationMsg = questionEl.querySelector('.validation-message');
        if (validationMsg) {
            validationMsg.remove();
        }

        currentQuestionIndex++;
        updateQuestionVisibility();
        updateProgressBar();
        updateNavButtons();
    } else {
        // This is the last question, submit the survey
        submitSurvey();
    }
}

// Go to the previous question
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        updateQuestionVisibility();
        updateProgressBar();
        updateNavButtons();
    }
}

// Update which question is visible
function updateQuestionVisibility() {
    const questions = document.querySelectorAll('.question');

    questions.forEach((question, index) => {
        if (index === currentQuestionIndex) {
            question.classList.add('active');
            question.classList.remove('previous');
        } else if (index < currentQuestionIndex) {
            question.classList.remove('active');
            question.classList.add('previous');
        } else {
            question.classList.remove('active');
            question.classList.remove('previous');
        }
    });
}

// Update the progress bar
function updateProgressBar() {
    const totalQuestions = surveyData.questions.length;
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `Question ${currentQuestionIndex + 1} of ${totalQuestions}`;
    progressPercentage.textContent = `${Math.round(progress)}%`;
}

// Update navigation buttons
function updateNavButtons() {
    prevBtn.style.visibility = currentQuestionIndex === 0 ? 'hidden' : 'visible';

    if (currentQuestionIndex === surveyData.questions.length - 1) {
        // Check if the last question has been answered
        const lastQuestionId = surveyData.questions[currentQuestionIndex].id;
        if (answers[lastQuestionId]) {
            nextBtn.textContent = 'Submit';
            nextBtn.className = 'btn btn-submit';
            nextBtn.innerHTML = 'Submit <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/></svg>';
        } else {
            nextBtn.textContent = 'Next';
            nextBtn.className = 'btn btn-next';
            nextBtn.innerHTML = 'Next <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>';
        }
    } else {
        nextBtn.textContent = 'Next';
        nextBtn.className = 'btn btn-next';
        nextBtn.innerHTML = 'Next <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>';
    }
}

// Pre-select any previously answered questions
function restoreAnswers() {
    Object.keys(answers).forEach(questionId => {
        const questionIndex = surveyData.questions.findIndex(q => q.id === questionId);
        if (questionIndex !== -1) {
            const questionEl = document.getElementById(`question-${questionIndex}`);
            const options = questionEl.querySelectorAll('.option');

            options.forEach(option => {
                if (option.dataset.value === answers[questionId]) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });
        }
    });
}

function submitSurvey() {
    // Show loading indicator
    loadingIndicator.style.display = 'flex';
    loadingIndicator.querySelector('.loading-text').textContent = '';

    // Format the data for submission
    const formData = new FormData();

    // Add user email to the form data
    formData.append('Email', userEmail);
    formData.append('UserName', userName);
    console.log('Answers to submit:', JSON.stringify(answers));

    surveyData.questions.forEach(question => {
        const answer = answers[question.id] || ''; // Use empty string as fallback
        formData.append(question.title, answer);
        // Debug log for each question's data
        console.log(`Appending ${question.title}: ${answer}`);
    });

    // Add timestamp
    const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    formData.append('Timestamp', istTime);


    // Send data to Google Sheets
    fetch(surveyData.submitUrl, {
        method: 'POST',
        body: formData,
        mode: 'no-cors' // Important for Google Apps Script
    })
        .then(() => {
            // Request completed successfully (note: with no-cors, we can't access response details)
            showCompletionScreen();
        })
        .catch(error => {
            console.error('Error:', error);
            showErrorMessage('There was an error submitting your survey. Please try again.');
        })
        .finally(() => {
            // Hide loading indicator
            loadingIndicator.style.display = 'none';
        });
}

function showCompletionScreen() {
    document.getElementById('questions-container').style.display = 'none';
    document.querySelector('.nav-buttons').style.display = 'none';
    completionScreen.style.display = 'flex';
}

function showErrorMessage(message) {
    // Remove any existing error messages
    const existingError = document.getElementById('error-message');
    if (existingError) existingError.remove();

    // Create and show error message
    const errorBanner = document.createElement('div');
    errorBanner.id = 'error-message';
    errorBanner.style.backgroundColor = 'var(--error)';
    errorBanner.style.color = 'white';
    errorBanner.style.padding = '0.75rem';
    errorBanner.style.borderRadius = '8px';
    errorBanner.style.margin = '0.75rem 1.25rem';
    errorBanner.textContent = message;
    errorBanner.setAttribute('role', 'alert');

    const surveyHeader = document.querySelector('.survey-header');
    surveyHeader.insertAdjacentElement('afterend', errorBanner);
}

// Restart the survey
function restartSurvey() {
    // Reset variables
    currentQuestionIndex = 0;
    Object.keys(answers).forEach(key => delete answers[key]);

    // Reset UI
    document.getElementById('questions-container').style.display = 'block';
    document.querySelector('.nav-buttons').style.display = 'flex';
    completionScreen.style.display = 'none';

    // Show first question
    updateQuestionVisibility();
    updateProgressBar();
    updateNavButtons();

    // Remove selected classes
    const options = document.querySelectorAll('.option');
    options.forEach(option => option.classList.remove('selected'));
}

// Event listeners
prevBtn.addEventListener('click', prevQuestion);
nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', restartSurvey);

// Initialize the survey when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initSurvey();
});