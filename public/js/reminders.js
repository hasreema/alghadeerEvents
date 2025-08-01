// Reminders page functionality
let remindersData = [];
let currentRemindersPage = 1;
let remindersPerPage = 10;
let remindersTotalPages = 1;
let remindersFilters = {
  status: '',
  eventId: '',
  assignee: '',
  type: '',
  dateFrom: '',
  dateTo: ''
};

// Initialize reminders page
function loadReminders() {
  showLoading();
  loadRemindersData();
  setupReminderFilters();
}

// Setup reminder filters
function setupReminderFilters() {
  const filterForm = document.getElementById('reminderFilters');
  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      currentRemindersPage = 1;
      loadRemindersData();
    });

    // Clear filters
    const clearBtn = document.getElementById('clearReminderFilters');
    if (clearBtn) {
      clearBtn.addEventListener('click', clearReminderFilters);
    }
  }
}

// Load reminders data
async function loadRemindersData() {
  try {
    const params = new URLSearchParams({
      page: currentRemindersPage,
      limit: remindersPerPage,
      ...remindersFilters
    });

    const response = await apiCall(`/api/reminders?${params}`, 'GET');
    
    if (response.success) {
      remindersData = response.data.reminders;
      remindersTotalPages = Math.ceil(response.data.total / remindersPerPage);
      updateRemindersTable();
      updateRemindersPagination();
    }
  } catch (error) {
    showError('Failed to load reminders');
  } finally {
    hideLoading();
  }
}

// Update reminders table
function updateRemindersTable() {
  const tbody = document.querySelector('#remindersTable tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  remindersData.forEach(reminder => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="d-flex align-items-center">
          <div class="reminder-icon me-2">
            <i class="fas ${getReminderTypeIcon(reminder.type)} fa-2x text-${getReminderTypeColor(reminder.type)}"></i>
          </div>
          <div>
            <div class="fw-bold">${reminder.title}</div>
            <small class="text-muted">${reminder.description}</small>
          </div>
        </div>
      </td>
      <td>${reminder.eventName || 'N/A'}</td>
      <td>${reminder.assignee}</td>
      <td>${formatDateTime(reminder.date)}</td>
      <td>${getStatusBadgeClass(reminder.status)}</td>
      <td>
        <div class="btn-group" role="group">
          <button type="button" class="btn btn-sm btn-outline-primary" onclick="viewReminder('${reminder._id}')">
            <i class="fas fa-eye"></i>
          </button>
          <button type="button" class="btn btn-sm btn-outline-warning" onclick="editReminder('${reminder._id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button type="button" class="btn btn-sm btn-outline-success" onclick="completeReminder('${reminder._id}')" ${reminder.status === 'completed' ? 'disabled' : ''}>
            <i class="fas fa-check"></i>
          </button>
          <button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteReminder('${reminder._id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Update reminders pagination
function updateRemindersPagination() {
  const pagination = document.getElementById('remindersPagination');
  if (!pagination) return;

  pagination.innerHTML = '';

  // Previous button
  const prevBtn = document.createElement('li');
  prevBtn.className = `page-item ${currentRemindersPage === 1 ? 'disabled' : ''}`;
  prevBtn.innerHTML = `<a class="page-link" href="#" onclick="changeRemindersPage(${currentRemindersPage - 1})">Previous</a>`;
  pagination.appendChild(prevBtn);

  // Page numbers
  for (let i = 1; i <= remindersTotalPages; i++) {
    if (i === 1 || i === remindersTotalPages || (i >= currentRemindersPage - 2 && i <= currentRemindersPage + 2)) {
      const pageBtn = document.createElement('li');
      pageBtn.className = `page-item ${i === currentRemindersPage ? 'active' : ''}`;
      pageBtn.innerHTML = `<a class="page-link" href="#" onclick="changeRemindersPage(${i})">${i}</a>`;
      pagination.appendChild(pageBtn);
    } else if (i === currentRemindersPage - 3 || i === currentRemindersPage + 3) {
      const ellipsis = document.createElement('li');
      ellipsis.className = 'page-item disabled';
      ellipsis.innerHTML = '<span class="page-link">...</span>';
      pagination.appendChild(ellipsis);
    }
  }

  // Next button
  const nextBtn = document.createElement('li');
  nextBtn.className = `page-item ${currentRemindersPage === remindersTotalPages ? 'disabled' : ''}`;
  nextBtn.innerHTML = `<a class="page-link" href="#" onclick="changeRemindersPage(${currentRemindersPage + 1})">Next</a>`;
  pagination.appendChild(nextBtn);
}

// Change reminders page
function changeRemindersPage(page) {
  if (page >= 1 && page <= remindersTotalPages) {
    currentRemindersPage = page;
    loadRemindersData();
  }
}

// Reminder actions
function viewReminder(reminderId) {
  const reminder = remindersData.find(r => r._id === reminderId);
  if (reminder) {
    showReminderDetailsModal(reminder);
  }
}

function editReminder(reminderId) {
  const reminder = remindersData.find(r => r._id === reminderId);
  if (reminder) {
    populateReminderForm(reminder);
    showAddReminderModal();
  }
}

function completeReminder(reminderId) {
  if (confirm('Mark this reminder as completed?')) {
    apiCall(`/api/reminders/${reminderId}/complete`, 'PATCH')
      .then(response => {
        if (response.success) {
          showSuccess('Reminder marked as completed');
          loadRemindersData();
        }
      })
      .catch(error => {
        showError('Failed to complete reminder');
      });
  }
}

function cancelReminder(reminderId) {
  if (confirm('Cancel this reminder?')) {
    apiCall(`/api/reminders/${reminderId}/cancel`, 'PATCH')
      .then(response => {
        if (response.success) {
          showSuccess('Reminder cancelled');
          loadRemindersData();
        }
      })
      .catch(error => {
        showError('Failed to cancel reminder');
      });
  }
}

function deleteReminder(reminderId) {
  if (confirm('Are you sure you want to delete this reminder?')) {
    apiCall(`/api/reminders/${reminderId}`, 'DELETE')
      .then(response => {
        if (response.success) {
          showSuccess('Reminder deleted successfully');
          loadRemindersData();
        }
      })
      .catch(error => {
        showError('Failed to delete reminder');
      });
  }
}

// Show reminder details modal
function showReminderDetailsModal(reminder) {
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'reminderDetailsModal';
  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Reminder Details</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6">
              <h6>Reminder Information</h6>
              <table class="table table-borderless">
                <tr><td><strong>Title:</strong></td><td>${reminder.title}</td></tr>
                <tr><td><strong>Description:</strong></td><td>${reminder.description}</td></tr>
                <tr><td><strong>Type:</strong></td><td>${reminder.type}</td></tr>
                <tr><td><strong>Date & Time:</strong></td><td>${formatDateTime(reminder.date)}</td></tr>
                <tr><td><strong>Status:</strong></td><td>${getStatusBadgeClass(reminder.status)}</td></tr>
              </table>
            </div>
            <div class="col-md-6">
              <h6>Assignment Information</h6>
              <table class="table table-borderless">
                <tr><td><strong>Assignee:</strong></td><td>${reminder.assignee}</td></tr>
                <tr><td><strong>Event:</strong></td><td>${reminder.eventName || 'N/A'}</td></tr>
                <tr><td><strong>Event Date:</strong></td><td>${reminder.eventDate ? formatDate(reminder.eventDate) : 'N/A'}</td></tr>
              </table>
            </div>
          </div>
          ${reminder.recurrencePattern ? `<div class="mt-3"><h6>Recurrence Pattern</h6><p>${reminder.recurrencePattern}</p></div>` : ''}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          ${reminder.status !== 'completed' ? `<button type="button" class="btn btn-success" onclick="completeReminder('${reminder._id}')" data-bs-dismiss="modal">Mark Complete</button>` : ''}
          ${reminder.status !== 'cancelled' ? `<button type="button" class="btn btn-warning" onclick="cancelReminder('${reminder._id}')" data-bs-dismiss="modal">Cancel</button>` : ''}
          <button type="button" class="btn btn-info" onclick="editReminder('${reminder._id}')" data-bs-dismiss="modal">Edit Reminder</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();

  modal.addEventListener('hidden.bs.modal', () => {
    document.body.removeChild(modal);
  });
}

// Populate reminder form
function populateReminderForm(reminder) {
  const form = document.getElementById('reminderForm');
  if (form) {
    form.querySelector('[name="title"]').value = reminder.title || '';
    form.querySelector('[name="description"]').value = reminder.description || '';
    form.querySelector('[name="eventId"]').value = reminder.eventId || '';
    form.querySelector('[name="assignee"]').value = reminder.assignee || '';
    form.querySelector('[name="type"]').value = reminder.type || '';
    form.querySelector('[name="date"]').value = reminder.date ? reminder.date.split('T')[0] : '';
    form.querySelector('[name="time"]').value = reminder.date ? reminder.date.split('T')[1].substring(0, 5) : '';
    form.querySelector('[name="recurrencePattern"]').value = reminder.recurrencePattern || '';
    
    // Set form mode to edit
    form.dataset.mode = 'edit';
    form.dataset.reminderId = reminder._id;
  }
}

// Clear reminder filters
function clearReminderFilters() {
  remindersFilters = {
    status: '',
    eventId: '',
    assignee: '',
    type: '',
    dateFrom: '',
    dateTo: ''
  };

  const form = document.getElementById('reminderFilters');
  if (form) {
    form.reset();
  }

  currentRemindersPage = 1;
  loadRemindersData();
}

// Save reminder
async function saveReminder(formData) {
  try {
    const mode = formData.get('mode') || 'create';
    const reminderId = formData.get('reminderId');
    
    // Combine date and time
    const date = formData.get('date');
    const time = formData.get('time');
    if (date && time) {
      formData.set('date', `${date}T${time}:00`);
    }
    
    const url = mode === 'edit' ? `/api/reminders/${reminderId}` : '/api/reminders';
    const method = mode === 'edit' ? 'PUT' : 'POST';

    const response = await apiCall(url, method, formData);
    
    if (response.success) {
      showSuccess(`Reminder ${mode === 'edit' ? 'updated' : 'created'} successfully`);
      loadRemindersData();
      return true;
    }
  } catch (error) {
    showError(`Failed to ${formData.get('mode') === 'edit' ? 'update' : 'create'} reminder`);
  }
  return false;
}

// Load overdue reminders
async function loadOverdueReminders() {
  try {
    const response = await apiCall('/api/reminders/overdue/reminders', 'GET');
    
    if (response.success) {
      const overdueContainer = document.getElementById('overdueReminders');
      if (overdueContainer) {
        overdueContainer.innerHTML = '';
        
        response.data.forEach(reminder => {
          const card = document.createElement('div');
          card.className = 'col-md-6 col-lg-4 mb-3';
          card.innerHTML = `
            <div class="card border-danger">
              <div class="card-body">
                <h6 class="card-title">${reminder.title}</h6>
                <p class="card-text">
                  <strong>Assignee:</strong> ${reminder.assignee}<br>
                  <strong>Due Date:</strong> ${formatDateTime(reminder.date)}<br>
                  <strong>Days Overdue:</strong> ${reminder.daysOverdue}
                </p>
                <button class="btn btn-sm btn-success" onclick="completeReminder('${reminder._id}')">
                  Mark Complete
                </button>
              </div>
            </div>
          `;
          overdueContainer.appendChild(card);
        });
      }
    }
  } catch (error) {
    console.error('Failed to load overdue reminders:', error);
  }
}

// Load upcoming reminders
async function loadUpcomingReminders() {
  try {
    const response = await apiCall('/api/reminders/upcoming/reminders', 'GET');
    
    if (response.success) {
      const upcomingContainer = document.getElementById('upcomingReminders');
      if (upcomingContainer) {
        upcomingContainer.innerHTML = '';
        
        response.data.forEach(reminder => {
          const card = document.createElement('div');
          card.className = 'col-md-6 col-lg-4 mb-3';
          card.innerHTML = `
            <div class="card border-warning">
              <div class="card-body">
                <h6 class="card-title">${reminder.title}</h6>
                <p class="card-text">
                  <strong>Assignee:</strong> ${reminder.assignee}<br>
                  <strong>Due Date:</strong> ${formatDateTime(reminder.date)}<br>
                  <strong>Days Until Due:</strong> ${reminder.daysUntilDue}
                </p>
                <button class="btn btn-sm btn-warning" onclick="viewReminder('${reminder._id}')">
                  View Details
                </button>
              </div>
            </div>
          `;
          upcomingContainer.appendChild(card);
        });
      }
    }
  } catch (error) {
    console.error('Failed to load upcoming reminders:', error);
  }
}

// Create predefined reminder
function createPredefinedReminder(type) {
  const predefinedReminders = {
    'generator': {
      title: 'Turn off generator after event',
      description: 'Ensure the generator is properly shut down and secured',
      type: 'maintenance'
    },
    'cleanup': {
      title: 'Event cleanup',
      description: 'Complete post-event cleanup and restoration',
      type: 'maintenance'
    },
    'payment': {
      title: 'Collect outstanding payment',
      description: 'Follow up on outstanding payment for the event',
      type: 'payment'
    },
    'setup': {
      title: 'Event setup reminder',
      description: 'Begin event setup and preparation',
      type: 'preparation'
    }
  };

  const reminder = predefinedReminders[type];
  if (reminder) {
    const form = document.getElementById('reminderForm');
    if (form) {
      form.querySelector('[name="title"]').value = reminder.title;
      form.querySelector('[name="description"]').value = reminder.description;
      form.querySelector('[name="type"]').value = reminder.type;
      showAddReminderModal();
    }
  }
}

// Utility functions
function getReminderTypeIcon(type) {
  const icons = {
    'payment': 'fa-money-bill-wave',
    'maintenance': 'fa-tools',
    'preparation': 'fa-clipboard-list',
    'follow_up': 'fa-phone',
    'general': 'fa-bell'
  };
  return icons[type] || 'fa-bell';
}

function getReminderTypeColor(type) {
  const colors = {
    'payment': 'success',
    'maintenance': 'warning',
    'preparation': 'info',
    'follow_up': 'primary',
    'general': 'secondary'
  };
  return colors[type] || 'secondary';
}

function getStatusBadgeClass(status) {
  const classes = {
    'pending': 'bg-warning',
    'completed': 'bg-success',
    'cancelled': 'bg-secondary',
    'overdue': 'bg-danger'
  };
  return `<span class="badge ${classes[status] || 'bg-secondary'}">${status}</span>`;
}

// Export reminders
function exportReminders() {
  // Implementation for exporting reminders to Excel/CSV
  showSuccess('Export functionality will be implemented');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('remindersPage')) {
    loadReminders();
    loadOverdueReminders();
    loadUpcomingReminders();
  }
});