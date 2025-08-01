// Reminders Management JavaScript
let remindersData = [];
let currentRemindersPage = 1;
let remindersPerPage = 10;
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
    setupEventListeners();
}

// Load reminders data from API
async function loadRemindersData() {
    try {
        const queryParams = new URLSearchParams({
            page: currentRemindersPage,
            limit: remindersPerPage,
            ...remindersFilters
        });

        const response = await apiCall(`/api/reminders?${queryParams}`, 'GET');
        
        if (response.success) {
            remindersData = response.data.reminders;
            updateRemindersTable();
            updateRemindersPagination(response.data.totalPages, response.data.currentPage);
            updateRemindersStats(response.data.stats);
        } else {
            showError('Failed to load reminders');
        }
    } catch (error) {
        console.error('Error loading reminders:', error);
        showError('Error loading reminders');
    } finally {
        hideLoading();
    }
}

// Setup reminder filters
function setupReminderFilters() {
    const filterForm = document.getElementById('reminderFilters');
    if (!filterForm) return;

    // Status filter
    const statusFilter = filterForm.querySelector('#reminderStatusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            remindersFilters.status = e.target.value;
            currentRemindersPage = 1;
            loadRemindersData();
        });
    }

    // Event filter
    const eventFilter = filterForm.querySelector('#reminderEventFilter');
    if (eventFilter) {
        eventFilter.addEventListener('change', (e) => {
            remindersFilters.eventId = e.target.value;
            currentRemindersPage = 1;
            loadRemindersData();
        });
    }

    // Assignee filter
    const assigneeFilter = filterForm.querySelector('#reminderAssigneeFilter');
    if (assigneeFilter) {
        assigneeFilter.addEventListener('change', (e) => {
            remindersFilters.assignee = e.target.value;
            currentRemindersPage = 1;
            loadRemindersData();
        });
    }

    // Type filter
    const typeFilter = filterForm.querySelector('#reminderTypeFilter');
    if (typeFilter) {
        typeFilter.addEventListener('change', (e) => {
            remindersFilters.type = e.target.value;
            currentRemindersPage = 1;
            loadRemindersData();
        });
    }

    // Date range filters
    const dateFromFilter = filterForm.querySelector('#reminderDateFromFilter');
    const dateToFilter = filterForm.querySelector('#reminderDateToFilter');
    
    if (dateFromFilter) {
        dateFromFilter.addEventListener('change', (e) => {
            remindersFilters.dateFrom = e.target.value;
            currentRemindersPage = 1;
            loadRemindersData();
        });
    }
    
    if (dateToFilter) {
        dateToFilter.addEventListener('change', (e) => {
            remindersFilters.dateTo = e.target.value;
            currentRemindersPage = 1;
            loadRemindersData();
        });
    }

    // Clear filters button
    const clearFiltersBtn = filterForm.querySelector('#clearReminderFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearReminderFilters);
    }
}

// Update reminders table
function updateRemindersTable() {
    const tableBody = document.querySelector('#remindersTable tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (remindersData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-4">
                    <i class="fas fa-bell fa-2x mb-2"></i>
                    <p>No reminders found</p>
                </td>
            </tr>
        `;
        return;
    }

    remindersData.forEach(reminder => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <div class="reminder-icon me-2">
                        <i class="fas ${getReminderTypeIcon(reminder.type)} text-${getReminderUrgencyColor(reminder.urgency)}"></i>
                    </div>
                    <div>
                        <div class="fw-bold">${reminder.title}</div>
                        <small class="text-muted">${reminder.eventName || 'General'}</small>
                    </div>
                </div>
            </td>
            <td>${reminder.description}</td>
            <td>${reminder.assignee}</td>
            <td>${formatDateTime(reminder.date)}</td>
            <td>
                <span class="badge ${getReminderStatusBadgeClass(reminder.status)}">
                    ${reminder.status}
                </span>
            </td>
            <td>
                <span class="badge ${getReminderUrgencyBadgeClass(reminder.urgency)}">
                    ${reminder.urgency}
                </span>
            </td>
            <td>
                <span class="badge ${getReminderTypeBadgeClass(reminder.type)}">
                    ${reminder.type}
                </span>
            </td>
            <td>
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-sm btn-outline-primary" 
                            onclick="viewReminder('${reminder._id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-warning" 
                            onclick="editReminder('${reminder._id}')" title="Edit Reminder">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-success" 
                            onclick="completeReminder('${reminder._id}')" title="Mark Complete"
                            ${reminder.status === 'completed' ? 'disabled' : ''}>
                        <i class="fas fa-check"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-secondary" 
                            onclick="cancelReminder('${reminder._id}')" title="Cancel Reminder"
                            ${reminder.status === 'cancelled' ? 'disabled' : ''}>
                        <i class="fas fa-times"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger" 
                            onclick="deleteReminder('${reminder._id}')" title="Delete Reminder">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Update reminders pagination
function updateRemindersPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('remindersPagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    const ul = document.createElement('ul');
    ul.className = 'pagination justify-content-center';

    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" onclick="changeRemindersPage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </a>
    `;
    ul.appendChild(prevLi);

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `
            <a class="page-link" href="#" onclick="changeRemindersPage(${i})">${i}</a>
        `;
        ul.appendChild(li);
    }

    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" onclick="changeRemindersPage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </a>
    `;
    ul.appendChild(nextLi);

    paginationContainer.appendChild(ul);
}

// Update reminders statistics
function updateRemindersStats(stats) {
    if (!stats) return;

    const totalRemindersEl = document.getElementById('totalReminders');
    const pendingRemindersEl = document.getElementById('pendingReminders');
    const completedRemindersEl = document.getElementById('completedReminders');
    const overdueRemindersEl = document.getElementById('overdueReminders');
    const todayRemindersEl = document.getElementById('todayReminders');

    if (totalRemindersEl) totalRemindersEl.textContent = stats.totalReminders || 0;
    if (pendingRemindersEl) pendingRemindersEl.textContent = stats.pendingReminders || 0;
    if (completedRemindersEl) completedRemindersEl.textContent = stats.completedReminders || 0;
    if (overdueRemindersEl) overdueRemindersEl.textContent = stats.overdueReminders || 0;
    if (todayRemindersEl) todayRemindersEl.textContent = stats.todayReminders || 0;
}

// Change reminders page
function changeRemindersPage(page) {
    currentRemindersPage = page;
    loadRemindersData();
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

    // Reset form fields
    const filterForm = document.getElementById('reminderFilters');
    if (filterForm) {
        filterForm.reset();
    }

    currentRemindersPage = 1;
    loadRemindersData();
}

// Reminder action handlers
function viewReminder(reminderId) {
    showReminderDetailsModal(reminderId);
}

function editReminder(reminderId) {
    populateReminderForm(reminderId);
    showAddReminderModal();
}

async function completeReminder(reminderId) {
    try {
        const response = await apiCall(`/api/reminders/${reminderId}/complete`, 'PATCH');
        
        if (response.success) {
            showSuccess('Reminder marked as completed successfully');
            loadRemindersData();
        } else {
            showError('Failed to mark reminder as completed');
        }
    } catch (error) {
        console.error('Error completing reminder:', error);
        showError('Error completing reminder');
    }
}

async function cancelReminder(reminderId) {
    try {
        const response = await apiCall(`/api/reminders/${reminderId}/cancel`, 'PATCH');
        
        if (response.success) {
            showSuccess('Reminder cancelled successfully');
            loadRemindersData();
        } else {
            showError('Failed to cancel reminder');
        }
    } catch (error) {
        console.error('Error cancelling reminder:', error);
        showError('Error cancelling reminder');
    }
}

function deleteReminder(reminderId) {
    if (confirm('Are you sure you want to delete this reminder?')) {
        apiCall(`/api/reminders/${reminderId}`, 'DELETE')
            .then(response => {
                if (response.success) {
                    showSuccess('Reminder deleted successfully');
                    loadRemindersData();
                } else {
                    showError('Failed to delete reminder');
                }
            })
            .catch(error => {
                console.error('Error deleting reminder:', error);
                showError('Error deleting reminder');
            });
    }
}

// Show reminder details modal
async function showReminderDetailsModal(reminderId) {
    try {
        const response = await apiCall(`/api/reminders/${reminderId}`, 'GET');
        
        if (response.success) {
            const reminder = response.data;
            
            const modal = document.getElementById('reminderDetailsModal');
            if (modal) {
                modal.querySelector('#reminderDetailsTitle').textContent = `Reminder Details - ${reminder.title}`;
                modal.querySelector('#reminderDetailsContent').innerHTML = `
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Reminder Information</h6>
                            <table class="table table-sm">
                                <tr><td><strong>Title:</strong></td><td>${reminder.title}</td></tr>
                                <tr><td><strong>Description:</strong></td><td>${reminder.description}</td></tr>
                                <tr><td><strong>Assignee:</strong></td><td>${reminder.assignee}</td></tr>
                                <tr><td><strong>Date & Time:</strong></td><td>${formatDateTime(reminder.date)}</td></tr>
                                <tr><td><strong>Status:</strong></td><td>
                                    <span class="badge ${getReminderStatusBadgeClass(reminder.status)}">
                                        ${reminder.status}
                                    </span>
                                </td></tr>
                                <tr><td><strong>Type:</strong></td><td>
                                    <span class="badge ${getReminderTypeBadgeClass(reminder.type)}">
                                        ${reminder.type}
                                    </span>
                                </td></tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6>Event Information</h6>
                            <table class="table table-sm">
                                <tr><td><strong>Event:</strong></td><td>${reminder.eventName || 'General'}</td></tr>
                                <tr><td><strong>Event Date:</strong></td><td>${reminder.eventDate ? formatDate(reminder.eventDate) : 'N/A'}</td></tr>
                                <tr><td><strong>Event Type:</strong></td><td>${reminder.eventType || 'N/A'}</td></tr>
                            </table>
                        </div>
                    </div>
                    ${reminder.recurrencePattern ? `
                        <div class="mt-3">
                            <h6>Recurrence Pattern</h6>
                            <p class="text-muted">${reminder.recurrencePattern}</p>
                        </div>
                    ` : ''}
                `;
                
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
            }
        } else {
            showError('Failed to load reminder details');
        }
    } catch (error) {
        console.error('Error loading reminder details:', error);
        showError('Error loading reminder details');
    }
}

// Populate reminder form for editing
async function populateReminderForm(reminderId) {
    try {
        const response = await apiCall(`/api/reminders/${reminderId}`, 'GET');
        
        if (response.success) {
            const reminder = response.data;
            
            const form = document.getElementById('reminderForm');
            if (form) {
                form.querySelector('#reminderEventId').value = reminder.eventId || '';
                form.querySelector('#reminderTitle').value = reminder.title || '';
                form.querySelector('#reminderDescription').value = reminder.description || '';
                form.querySelector('#reminderAssignee').value = reminder.assignee || '';
                form.querySelector('#reminderDate').value = reminder.date ? reminder.date.split('T')[0] : '';
                form.querySelector('#reminderTime').value = reminder.date ? reminder.date.split('T')[1].substring(0, 5) : '';
                form.querySelector('#reminderType').value = reminder.type || '';
                form.querySelector('#reminderStatus').value = reminder.status || '';
                form.querySelector('#reminderRecurrencePattern').value = reminder.recurrencePattern || '';
                
                // Set form mode to edit
                form.dataset.mode = 'edit';
                form.dataset.reminderId = reminderId;
            }
        } else {
            showError('Failed to load reminder data');
        }
    } catch (error) {
        console.error('Error loading reminder data:', error);
        showError('Error loading reminder data');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Add reminder form submission
    const reminderForm = document.getElementById('reminderForm');
    if (reminderForm) {
        reminderForm.addEventListener('submit', handleReminderFormSubmit);
    }

    // Add reminder modal
    const addReminderBtn = document.getElementById('addReminderBtn');
    if (addReminderBtn) {
        addReminderBtn.addEventListener('click', () => {
            resetReminderForm();
            showAddReminderModal();
        });
    }

    // Predefined reminders
    const predefinedReminders = document.querySelectorAll('.predefined-reminder');
    predefinedReminders.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const title = e.target.dataset.title;
            const description = e.target.dataset.description;
            addPredefinedReminder(title, description);
        });
    });
}

// Handle reminder form submission
async function handleReminderFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const isEdit = form.dataset.mode === 'edit';
    const reminderId = form.dataset.reminderId;
    
    // Combine date and time
    const date = formData.get('reminderDate');
    const time = formData.get('reminderTime');
    if (date && time) {
        formData.set('reminderDateTime', `${date}T${time}`);
    }
    
    try {
        showLoading();
        
        let response;
        if (isEdit) {
            response = await apiCall(`/api/reminders/${reminderId}`, 'PUT', formData);
        } else {
            response = await apiCall('/api/reminders', 'POST', formData);
        }
        
        if (response.success) {
            showSuccess(`Reminder ${isEdit ? 'updated' : 'created'} successfully`);
            hideAddReminderModal();
            loadRemindersData();
        } else {
            showError(`Failed to ${isEdit ? 'update' : 'create'} reminder`);
        }
    } catch (error) {
        console.error('Error saving reminder:', error);
        showError('Error saving reminder');
    } finally {
        hideLoading();
    }
}

// Add predefined reminder
function addPredefinedReminder(title, description) {
    const form = document.getElementById('reminderForm');
    if (form) {
        form.querySelector('#reminderTitle').value = title;
        form.querySelector('#reminderDescription').value = description;
        showAddReminderModal();
    }
}

// Reset reminder form
function resetReminderForm() {
    const form = document.getElementById('reminderForm');
    if (form) {
        form.reset();
        form.dataset.mode = 'create';
        delete form.dataset.reminderId;
    }
}

// Show add reminder modal
function showAddReminderModal() {
    const modal = document.getElementById('addReminderModal');
    if (modal) {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
}

// Hide add reminder modal
function hideAddReminderModal() {
    const modal = document.getElementById('addReminderModal');
    if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
            bsModal.hide();
        }
    }
}

// Load overdue reminders
async function loadOverdueReminders() {
    try {
        const response = await apiCall('/api/reminders/overdue/reminders', 'GET');
        
        if (response.success) {
            updateOverdueRemindersTable(response.data);
        } else {
            showError('Failed to load overdue reminders');
        }
    } catch (error) {
        console.error('Error loading overdue reminders:', error);
        showError('Error loading overdue reminders');
    }
}

// Update overdue reminders table
function updateOverdueRemindersTable(overdueReminders) {
    const tableBody = document.querySelector('#overdueRemindersTable tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (overdueReminders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="fas fa-check-circle fa-2x mb-2 text-success"></i>
                    <p>No overdue reminders</p>
                </td>
            </tr>
        `;
        return;
    }

    overdueReminders.forEach(reminder => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${reminder.title}</td>
            <td>${reminder.assignee}</td>
            <td>${formatDateTime(reminder.date)}</td>
            <td>${reminder.eventName || 'General'}</td>
            <td>
                <button type="button" class="btn btn-sm btn-success" 
                        onclick="completeReminder('${reminder._id}')">
                    <i class="fas fa-check"></i> Complete
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Utility functions
function getReminderTypeIcon(type) {
    const icons = {
        'one_time': 'fa-bell',
        'recurring': 'fa-sync-alt',
        'urgent': 'fa-exclamation-triangle',
        'general': 'fa-info-circle'
    };
    return icons[type] || 'fa-bell';
}

function getReminderStatusBadgeClass(status) {
    const classes = {
        'pending': 'bg-warning',
        'completed': 'bg-success',
        'cancelled': 'bg-secondary',
        'overdue': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
}

function getReminderTypeBadgeClass(type) {
    const classes = {
        'one_time': 'bg-primary',
        'recurring': 'bg-info',
        'urgent': 'bg-danger',
        'general': 'bg-secondary'
    };
    return classes[type] || 'bg-secondary';
}

function getReminderUrgencyBadgeClass(urgency) {
    const classes = {
        'urgent': 'bg-danger',
        'high': 'bg-warning',
        'medium': 'bg-info',
        'low': 'bg-success'
    };
    return classes[urgency] || 'bg-secondary';
}

function getReminderUrgencyColor(urgency) {
    const colors = {
        'urgent': 'danger',
        'high': 'warning',
        'medium': 'info',
        'low': 'success'
    };
    return colors[urgency] || 'secondary';
}

// Export functions for global access
window.loadReminders = loadReminders;
window.changeRemindersPage = changeRemindersPage;
window.viewReminder = viewReminder;
window.editReminder = editReminder;
window.completeReminder = completeReminder;
window.cancelReminder = cancelReminder;
window.deleteReminder = deleteReminder;
window.clearReminderFilters = clearReminderFilters;
window.showAddReminderModal = showAddReminderModal;
window.hideAddReminderModal = hideAddReminderModal;
window.loadOverdueReminders = loadOverdueReminders;