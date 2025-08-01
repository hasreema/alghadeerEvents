// Events JavaScript for Al Ghadeer Events Management System

let currentPage = 1;
let totalPages = 1;
let currentFilters = {};

// Load events page
async function loadEvents() {
    try {
        // Set up filters
        setupEventFilters();
        
        // Load events
        await loadEventsData();
        
    } catch (error) {
        console.error('Failed to load events:', error);
        App.showError('Failed to load events');
    }
}

// Set up event filters
function setupEventFilters() {
    // Event type filter
    const eventTypeFilter = document.getElementById('eventTypeFilter');
    if (eventTypeFilter) {
        eventTypeFilter.addEventListener('change', function() {
            currentFilters.type = this.value;
            currentPage = 1;
            loadEventsData();
        });
    }
    
    // Location filter
    const locationFilter = document.getElementById('locationFilter');
    if (locationFilter) {
        locationFilter.addEventListener('change', function() {
            currentFilters.location = this.value;
            currentPage = 1;
            loadEventsData();
        });
    }
    
    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            currentFilters.status = this.value;
            currentPage = 1;
            loadEventsData();
        });
    }
    
    // Date filter
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            currentFilters.dateFrom = this.value;
            currentPage = 1;
            loadEventsData();
        });
    }
}

// Load events data
async function loadEventsData() {
    try {
        App.showLoading();
        
        // Build query parameters
        const params = new URLSearchParams({
            page: currentPage,
            limit: 10,
            ...currentFilters
        });
        
        const events = await App.apiCall(`/events?${params}`);
        
        App.hideLoading();
        
        // Update table
        updateEventsTable(events.events || []);
        
        // Update pagination
        updateEventsPagination(events.currentPage, events.totalPages, events.total);
        
    } catch (error) {
        App.hideLoading();
        console.error('Failed to load events data:', error);
        App.showError('Failed to load events data');
    }
}

// Update events table
function updateEventsTable(events) {
    const tbody = document.querySelector('#eventsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = events.map(event => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <div class="status-indicator ${event.status}"></div>
                    <strong>${event.eventName}</strong>
                </div>
            </td>
            <td>
                <span class="badge ${App.getStatusBadgeClass(event.eventType)}">
                    ${event.eventType}
                </span>
            </td>
            <td>
                <div>
                    <div>${App.formatDate(event.eventDate)}</div>
                    <small class="text-muted">${event.eventTime}</small>
                </div>
            </td>
            <td>${event.location}</td>
            <td>${event.guestCount}</td>
            <td>${App.formatCurrency(event.totalCost)}</td>
            <td>
                <span class="badge ${App.getStatusBadgeClass(event.status)}">
                    ${event.status}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary" data-action="view" data-id="${event._id}" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" data-action="edit" data-id="${event._id}" title="Edit Event">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" data-action="payments" data-id="${event._id}" title="View Payments">
                        <i class="fas fa-credit-card"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" data-action="employees" data-id="${event._id}" title="View Employees">
                        <i class="fas fa-users"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${event._id}" title="Delete Event">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Add empty row if no events
    if (events.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-4">
                    <i class="fas fa-calendar-times fa-3x mb-3"></i>
                    <div>No events found</div>
                    <small>Try adjusting your filters or add a new event</small>
                </td>
            </tr>
        `;
    }
}

// Update events pagination
function updateEventsPagination(currentPage, totalPages, total) {
    const pagination = document.getElementById('eventsPagination');
    if (!pagination) return;
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;
    
    pagination.innerHTML = paginationHTML;
    
    // Add event listeners to pagination
    pagination.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = parseInt(this.getAttribute('data-page'));
            if (page >= 1 && page <= totalPages) {
                currentPage = page;
                loadEventsData();
            }
        });
    });
}

// Handle event actions
function handleEventAction(action, eventId) {
    switch (action) {
        case 'view':
            viewEvent(eventId);
            break;
        case 'edit':
            editEvent(eventId);
            break;
        case 'payments':
            viewEventPayments(eventId);
            break;
        case 'employees':
            viewEventEmployees(eventId);
            break;
        case 'delete':
            deleteEvent(eventId);
            break;
    }
}

// View event details
async function viewEvent(eventId) {
    try {
        App.showLoading();
        
        const event = await App.apiCall(`/events/${eventId}`);
        
        App.hideLoading();
        
        // Show event details modal
        showEventDetailsModal(event);
        
    } catch (error) {
        App.hideLoading();
        App.showError('Failed to load event details');
    }
}

// Show event details modal
function showEventDetailsModal(event) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Event Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Basic Information</h6>
                            <table class="table table-borderless">
                                <tr>
                                    <td><strong>Event Name:</strong></td>
                                    <td>${event.eventName}</td>
                                </tr>
                                <tr>
                                    <td><strong>Type:</strong></td>
                                    <td>
                                        <span class="badge ${App.getStatusBadgeClass(event.eventType)}">
                                            ${event.eventType}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Date:</strong></td>
                                    <td>${App.formatDate(event.eventDate)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Time:</strong></td>
                                    <td>${event.eventTime}</td>
                                </tr>
                                <tr>
                                    <td><strong>Location:</strong></td>
                                    <td>${event.location}</td>
                                </tr>
                                <tr>
                                    <td><strong>Gender:</strong></td>
                                    <td>${event.gender}</td>
                                </tr>
                                <tr>
                                    <td><strong>Guest Count:</strong></td>
                                    <td>${event.guestCount}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6>Financial Information</h6>
                            <table class="table table-borderless">
                                <tr>
                                    <td><strong>Base Price:</strong></td>
                                    <td>${App.formatCurrency(event.basePrice)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Total Cost:</strong></td>
                                    <td>${App.formatCurrency(event.totalCost)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Status:</strong></td>
                                    <td>
                                        <span class="badge ${App.getStatusBadgeClass(event.status)}">
                                            ${event.status}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                            
                            ${event.notes ? `
                                <h6>Notes</h6>
                                <p class="text-muted">${event.notes}</p>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" onclick="editEvent('${event._id}')">Edit Event</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    // Remove modal from DOM after it's hidden
    modal.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

// Edit event
async function editEvent(eventId) {
    try {
        App.showLoading();
        
        const event = await App.apiCall(`/events/${eventId}`);
        
        App.hideLoading();
        
        // Populate edit form
        populateEventForm(event);
        
        // Show edit modal
        const modal = new bootstrap.Modal(document.getElementById('addEventModal'));
        modal.show();
        
    } catch (error) {
        App.hideLoading();
        App.showError('Failed to load event for editing');
    }
}

// Populate event form
function populateEventForm(event) {
    const form = document.getElementById('addEventForm');
    if (!form) return;
    
    // Update modal title
    const modalTitle = document.querySelector('#addEventModal .modal-title');
    if (modalTitle) {
        modalTitle.textContent = 'Edit Event';
    }
    
    // Populate form fields
    form.querySelector('[name="eventName"]').value = event.eventName || '';
    form.querySelector('[name="eventType"]').value = event.eventType || '';
    form.querySelector('[name="eventDate"]').value = event.eventDate ? event.eventDate.split('T')[0] : '';
    form.querySelector('[name="eventTime"]').value = event.eventTime || '';
    form.querySelector('[name="location"]').value = event.location || '';
    form.querySelector('[name="gender"]').value = event.gender || '';
    form.querySelector('[name="guestCount"]').value = event.guestCount || '';
    form.querySelector('[name="basePrice"]').value = event.basePrice || '';
    form.querySelector('[name="notes"]').value = event.notes || '';
    
    // Store event ID for update
    form.setAttribute('data-event-id', event._id);
}

// View event payments
function viewEventPayments(eventId) {
    // Navigate to payments page with event filter
    App.navigateToPage('payments');
    // This will be implemented when payments page is created
    App.showSuccess('Payments page will show payments for this event');
}

// View event employees
function viewEventEmployees(eventId) {
    // Navigate to employees page with event filter
    App.navigateToPage('employees');
    // This will be implemented when employees page is created
    App.showSuccess('Employees page will show employees for this event');
}

// Delete event
async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        return;
    }
    
    try {
        App.showLoading();
        
        await App.apiCall(`/events/${eventId}`, {
            method: 'DELETE'
        });
        
        App.hideLoading();
        App.showSuccess('Event deleted successfully');
        
        // Reload events
        loadEventsData();
        
    } catch (error) {
        App.hideLoading();
        App.showError('Failed to delete event');
    }
}

// Clear filters
function clearEventFilters() {
    // Reset filter values
    document.getElementById('eventTypeFilter').value = '';
    document.getElementById('locationFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('dateFilter').value = '';
    
    // Clear current filters
    currentFilters = {};
    currentPage = 1;
    
    // Reload events
    loadEventsData();
}

// Export functions for global access
window.Events = {
    loadEvents,
    loadEventsData,
    handleEventAction,
    viewEvent,
    editEvent,
    deleteEvent,
    clearEventFilters
};

// Override global action handlers for events
window.handleEdit = function(id) {
    handleEventAction('edit', id);
};

window.handleDelete = function(id) {
    handleEventAction('delete', id);
};

window.handleView = function(id) {
    handleEventAction('view', id);
};