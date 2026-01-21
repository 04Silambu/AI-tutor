// AI Programming Tutor - Frontend JavaScript
// AJAX requests to Flask backend

const API_BASE_URL = 'http://localhost:5000';

// State Management
let currentTopic = '';
let currentProblem = '';

// DOM Elements
const topicsList = document.getElementById('topicsList');
const welcomeScreen = document.getElementById('welcomeScreen');
const learningSection = document.getElementById('learningSection');
const currentTopicTitle = document.getElementById('currentTopic');
const explanationArea = document.getElementById('explanationArea');
const examplesArea = document.getElementById('examplesArea');
const practiceArea = document.getElementById('practiceArea');
const getExamplesBtn = document.getElementById('getExamplesBtn');
const getPracticeBtn = document.getElementById('getPracticeBtn');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log(' AI Tutor initialized');
    loadTopics();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    getExamplesBtn.addEventListener('click', loadExamples);
    getPracticeBtn.addEventListener('click', loadPractice);
}

// Load all available topics
async function loadTopics() {
    try {
        const response = await fetch(`${API_BASE_URL}/topics`);
        const data = await response.json();

        if (data.topics) {
            displayTopics(data.topics);
        } else {
            topicsList.innerHTML = '<div class="error">Failed to load topics</div>';
        }
    } catch (error) {
        console.error('Error loading topics:', error);
        topicsList.innerHTML = '<div class="error">Error connecting to backend. Make sure server is running.</div>';
    }
}

// Display topics in sidebar
function displayTopics(topics) {
    topicsList.innerHTML = '';

    topics.forEach(topic => {
        const topicItem = document.createElement('div');
        topicItem.className = 'topic-item';
        topicItem.textContent = topic;
        topicItem.onclick = () => selectTopic(topic);
        topicsList.appendChild(topicItem);
    });
}

// Select a topic
async function selectTopic(topic) {
    currentTopic = topic;

    // Update UI
    document.querySelectorAll('.topic-item').forEach(item => {
        item.classList.remove('active');
        if (item.textContent === topic) {
            item.classList.add('active');
        }
    });

    // Show learning section
    welcomeScreen.style.display = 'none';
    learningSection.style.display = 'block';
    currentTopicTitle.textContent = `📖 ${topic}`;

    // Reset other sections
    examplesArea.style.display = 'none';
    practiceArea.style.display = 'none';

    // Load explanation
    await loadExplanation(topic);
}

// Load concept explanation
async function loadExplanation(topic) {
    explanationArea.innerHTML = '<div class="loading">Loading explanation</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/explain`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic })
        });

        const data = await response.json();

        if (data.error) {
            explanationArea.innerHTML = `<div class="error">❌ ${data.error}</div>`;
            return;
        }

        displayExplanation(data);
    } catch (error) {
        console.error('Error loading explanation:', error);
        explanationArea.innerHTML = '<div class="error">❌ Failed to load explanation</div>';
    }
}

// Display explanation
function displayExplanation(data) {
    const html = `
        <h3>📚 Understanding ${data.topic}</h3>
        
        <div style="margin: 1rem 0;">
            <h4 style="color: var(--accent-primary); margin-bottom: 0.5rem;">Base Concept:</h4>
            <p style="color: var(--text-secondary);">${data.base_description}</p>
        </div>
        
        <div style="margin: 1rem 0;">
            <h4 style="color: var(--accent-primary); margin-bottom: 0.5rem;">Basic Example:</h4>
            <pre><code>${escapeHtml(data.base_example)}</code></pre>
        </div>
        
        <div style="margin: 1rem 0;">
            <h4 style="color: var(--accent-primary); margin-bottom: 0.5rem;">Detailed Explanation:</h4>
            <div style="color: var(--text-secondary); white-space: pre-line;">${data.detailed_explanation}</div>
        </div>
    `;

    explanationArea.innerHTML = html;
}

// Load code examples
async function loadExamples() {
    if (!currentTopic) {
        alert('Please select a topic first');
        return;
    }

    examplesArea.style.display = 'block';
    examplesArea.innerHTML = '<div class="loading">Generating examples</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/examples`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic: currentTopic })
        });

        const data = await response.json();

        if (data.error) {
            examplesArea.innerHTML = `<div class="error">❌ ${data.error}</div>`;
            return;
        }

        displayExamples(data);
    } catch (error) {
        console.error('Error loading examples:', error);
        examplesArea.innerHTML = '<div class="error">❌ Failed to load examples</div>';
    }
}

// Display examples
function displayExamples(data) {
    const html = `
        <h3>📝 Code Examples for ${data.topic}</h3>
        <div style="margin-top: 1rem; white-space: pre-line; color: var(--text-secondary);">
            ${data.examples}
        </div>
    `;

    examplesArea.innerHTML = html;
}

// Load practice problem
async function loadPractice() {
    if (!currentTopic) {
        alert('Please select a topic first');
        return;
    }

    practiceArea.style.display = 'block';
    practiceArea.innerHTML = '<div class="loading">Generating practice problem</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/practice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic: currentTopic })
        });

        const data = await response.json();

        if (data.error) {
            practiceArea.innerHTML = `<div class="error">❌ ${data.error}</div>`;
            return;
        }

        currentProblem = data.problem;
        displayPractice(data);
    } catch (error) {
        console.error('Error loading practice:', error);
        practiceArea.innerHTML = '<div class="error">❌ Failed to load practice problem</div>';
    }
}

// Display practice problem
function displayPractice(data) {
    const html = `
        <h3>🎯 Practice Problem: ${data.topic}</h3>
        
        <div style="margin: 1rem 0; white-space: pre-line; color: var(--text-secondary);">
            ${data.problem}
        </div>
        
        <div class="code-editor">
            <h4 style="color: var(--accent-primary); margin-bottom: 0.5rem;">Your Solution:</h4>
            <textarea id="userCode" placeholder="Write your code here..."></textarea>
            <button onclick="submitSolution()" class="btn btn-primary" style="margin-top: 1rem;">
                ✅ Submit Solution
            </button>
        </div>
        
        <div id="feedbackArea"></div>
    `;

    practiceArea.innerHTML = html;
}

// Submit user's solution
async function submitSolution() {
    const userCode = document.getElementById('userCode').value;
    const feedbackArea = document.getElementById('feedbackArea');

    if (!userCode.trim()) {
        alert('Please write some code first!');
        return;
    }

    feedbackArea.innerHTML = '<div class="loading">Validating your code</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic: currentTopic,
                problem: currentProblem,
                code: userCode
            })
        });

        const data = await response.json();

        if (data.error) {
            feedbackArea.innerHTML = `<div class="feedback error">❌ ${data.error}</div>`;
            return;
        }

        displayFeedback(data.feedback);
    } catch (error) {
        console.error('Error validating solution:', error);
        feedbackArea.innerHTML = '<div class="feedback error">❌ Failed to validate solution</div>';
    }
}

// Display feedback
function displayFeedback(feedback) {
    const feedbackArea = document.getElementById('feedbackArea');

    const html = `
        <div class="feedback success">
            <h4 style="color: var(--success); margin-bottom: 0.5rem;">🎓 Feedback:</h4>
            <div style="white-space: pre-line; color: var(--text-secondary);">
                ${feedback}
            </div>
        </div>
    `;

    feedbackArea.innerHTML = html;
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Console welcome message
console.log(`
╔═══════════════════════════════════════╗
║   🤖 AI Programming Tutor             ║
║   Frontend initialized successfully   ║
║   Backend: ${API_BASE_URL}            ║
╚═══════════════════════════════════════╝
`);
