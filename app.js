// Store applications in localStorage
let applications = JSON.parse(localStorage.getItem('applications')) || [];

// DOM Elements
const newApplicationModal = document.getElementById('newApplicationModal');
const statsModal = document.getElementById('statsModal');
const newApplicationForm = document.getElementById('newApplicationForm');

// Event Listeners
document.getElementById('showNewApplication').addEventListener('click', () => {
  newApplicationModal.classList.add('active');
});

document.getElementById('showStats').addEventListener('click', () => {
  updateStats();
  statsModal.classList.add('active');
});

document.querySelectorAll('.close-btn, .close-modal').forEach(button => {
  button.addEventListener('click', () => {
    newApplicationModal.classList.remove('active');
    statsModal.classList.remove('active');
  });
});

// Form submission
newApplicationForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const newApplication = {
    id: Date.now().toString(),
    company: document.getElementById('company').value,
    position: document.getElementById('position').value,
    jobUrl: document.getElementById('jobUrl').value,
    salary: document.getElementById('salary').value ? parseFloat(document.getElementById('salary').value) : null,
    nextInterview: document.getElementById('nextInterview').value,
    notes: document.getElementById('notes').value,
    status: 'applied',
    applicationDate: new Date().toISOString()
  };

  applications.push(newApplication);
  saveApplications();
  renderApplications();
  newApplicationForm.reset();
  newApplicationModal.classList.remove('active');
});

// Drag and Drop functions
function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData('text', ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  const cardId = ev.dataTransfer.getData('text');
  const card = document.getElementById(cardId);
  const newStatus = ev.target.closest('.column').dataset.status;
  
  if (card && newStatus) {
    const applicationIndex = applications.findIndex(app => app.id === cardId);
    if (applicationIndex !== -1) {
      applications[applicationIndex].status = newStatus;
      saveApplications();
      renderApplications();
    }
  }
}

// Helper functions
function saveApplications() {
  localStorage.setItem('applications', JSON.stringify(applications));
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

function formatMoney(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

function createCard(application) {
  return `
    <div id="${application.id}" class="card" draggable="true" ondragstart="drag(event)">
      <h3>${application.position}</h3>
      <div class="card-detail">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        ${application.company}
      </div>
      ${application.salary ? `
        <div class="card-detail">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          ${formatMoney(application.salary)}
        </div>
      ` : ''}
      <div class="card-detail">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Applied: ${formatDate(application.applicationDate)}
      </div>
      ${application.nextInterview ? `
        <div class="card-detail">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Interview: ${formatDate(application.nextInterview)}
        </div>
      ` : ''}
      ${application.jobUrl ? `
        <a href="${application.jobUrl}" target="_blank" rel="noopener noreferrer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          View Job Posting
        </a>
      ` : ''}
    </div>
  `;
}

function renderApplications() {
  const columns = document.querySelectorAll('.column');
  
  columns.forEach(column => {
    const status = column.dataset.status;
    const container = column.querySelector('.cards-container');
    const statusApplications = applications.filter(app => app.status === status);
    
    container.innerHTML = statusApplications.map(createCard).join('');
    column.querySelector('.counter').textContent = statusApplications.length;
  });
}

function updateStats() {
  const totalApplications = applications.length;
  document.getElementById('totalApplications').textContent = totalApplications;

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const statsContainer = document.getElementById('statusStats');
  statsContainer.innerHTML = Object.entries(statusCounts).map(([status, count]) => {
    const percentage = (count / totalApplications * 100).toFixed(1);
    return `
      <div class="status-item">
        <div class="status-header">
          <span class="status-name">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
          <span class="status-count">${count} (${percentage}%)</span>
        </div>
        <div class="progress-bar">
          <div class="progress-value" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

// Initial render
renderApplications();