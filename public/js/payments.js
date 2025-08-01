// Payments Management JavaScript
let paymentsData = [];
let currentPaymentsPage = 1;
let paymentsPerPage = 10;
let paymentsFilters = {
    status: '',
    eventId: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
};

// Initialize payments page
function loadPayments() {
    showLoading();
    loadPaymentsData();
    setupPaymentFilters();
    setupEventListeners();
}

// Load payments data from API
async function loadPaymentsData() {
    try {
        const queryParams = new URLSearchParams({
            page: currentPaymentsPage,
            limit: paymentsPerPage,
            ...paymentsFilters
        });

        const response = await apiCall(`/api/payments?${queryParams}`, 'GET');
        
        if (response.success) {
            paymentsData = response.data.payments;
            updatePaymentsTable();
            updatePaymentsPagination(response.data.totalPages, response.data.currentPage);
            updatePaymentsStats(response.data.stats);
        } else {
            showError('Failed to load payments');
        }
    } catch (error) {
        console.error('Error loading payments:', error);
        showError('Error loading payments');
    } finally {
        hideLoading();
    }
}

// Setup payment filters
function setupPaymentFilters() {
    const filterForm = document.getElementById('paymentFilters');
    if (!filterForm) return;

    // Status filter
    const statusFilter = filterForm.querySelector('#paymentStatusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            paymentsFilters.status = e.target.value;
            currentPaymentsPage = 1;
            loadPaymentsData();
        });
    }

    // Event filter
    const eventFilter = filterForm.querySelector('#paymentEventFilter');
    if (eventFilter) {
        eventFilter.addEventListener('change', (e) => {
            paymentsFilters.eventId = e.target.value;
            currentPaymentsPage = 1;
            loadPaymentsData();
        });
    }

    // Date range filters
    const dateFromFilter = filterForm.querySelector('#paymentDateFromFilter');
    const dateToFilter = filterForm.querySelector('#paymentDateToFilter');
    
    if (dateFromFilter) {
        dateFromFilter.addEventListener('change', (e) => {
            paymentsFilters.dateFrom = e.target.value;
            currentPaymentsPage = 1;
            loadPaymentsData();
        });
    }
    
    if (dateToFilter) {
        dateToFilter.addEventListener('change', (e) => {
            paymentsFilters.dateTo = e.target.value;
            currentPaymentsPage = 1;
            loadPaymentsData();
        });
    }

    // Amount range filters
    const amountMinFilter = filterForm.querySelector('#paymentAmountMinFilter');
    const amountMaxFilter = filterForm.querySelector('#paymentAmountMaxFilter');
    
    if (amountMinFilter) {
        amountMinFilter.addEventListener('change', (e) => {
            paymentsFilters.amountMin = e.target.value;
            currentPaymentsPage = 1;
            loadPaymentsData();
        });
    }
    
    if (amountMaxFilter) {
        amountMaxFilter.addEventListener('change', (e) => {
            paymentsFilters.amountMax = e.target.value;
            currentPaymentsPage = 1;
            loadPaymentsData();
        });
    }

    // Clear filters button
    const clearFiltersBtn = filterForm.querySelector('#clearPaymentFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearPaymentFilters);
    }
}

// Update payments table
function updatePaymentsTable() {
    const tableBody = document.querySelector('#paymentsTable tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (paymentsData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-4">
                    <i class="fas fa-inbox fa-2x mb-2"></i>
                    <p>No payments found</p>
                </td>
            </tr>
        `;
        return;
    }

    paymentsData.forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <div class="payment-icon me-2">
                        <i class="fas ${getPaymentMethodIcon(payment.method)}"></i>
                    </div>
                    <div>
                        <div class="fw-bold">${payment.receiptNumber}</div>
                        <small class="text-muted">${payment.eventName || 'N/A'}</small>
                    </div>
                </div>
            </td>
            <td>${formatCurrency(payment.amount)}</td>
            <td>${formatDate(payment.date)}</td>
            <td>
                <span class="badge ${getPaymentStatusBadgeClass(payment.status)}">
                    ${payment.status}
                </span>
            </td>
            <td>${payment.method}</td>
            <td>
                ${payment.receiptFile ? 
                    `<a href="/api/payments/${payment._id}/receipt" target="_blank" class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-download"></i> Receipt
                    </a>` : 
                    '<span class="text-muted">No receipt</span>'
                }
            </td>
            <td>
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-sm btn-outline-primary" 
                            onclick="viewPayment('${payment._id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-warning" 
                            onclick="editPayment('${payment._id}')" title="Edit Payment">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger" 
                            onclick="deletePayment('${payment._id}')" title="Delete Payment">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Update payments pagination
function updatePaymentsPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('paymentsPagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    const ul = document.createElement('ul');
    ul.className = 'pagination justify-content-center';

    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" onclick="changePaymentsPage(${currentPage - 1})">
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
            <a class="page-link" href="#" onclick="changePaymentsPage(${i})">${i}</a>
        `;
        ul.appendChild(li);
    }

    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" onclick="changePaymentsPage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </a>
    `;
    ul.appendChild(nextLi);

    paginationContainer.appendChild(ul);
}

// Update payments statistics
function updatePaymentsStats(stats) {
    if (!stats) return;

    const totalPaymentsEl = document.getElementById('totalPayments');
    const totalAmountEl = document.getElementById('totalAmount');
    const paidAmountEl = document.getElementById('paidAmount');
    const outstandingAmountEl = document.getElementById('outstandingAmount');

    if (totalPaymentsEl) totalPaymentsEl.textContent = stats.totalPayments || 0;
    if (totalAmountEl) totalAmountEl.textContent = formatCurrency(stats.totalAmount || 0);
    if (paidAmountEl) paidAmountEl.textContent = formatCurrency(stats.paidAmount || 0);
    if (outstandingAmountEl) outstandingAmountEl.textContent = formatCurrency(stats.outstandingAmount || 0);
}

// Change payments page
function changePaymentsPage(page) {
    currentPaymentsPage = page;
    loadPaymentsData();
}

// Clear payment filters
function clearPaymentFilters() {
    paymentsFilters = {
        status: '',
        eventId: '',
        dateFrom: '',
        dateTo: '',
        amountMin: '',
        amountMax: ''
    };

    // Reset form fields
    const filterForm = document.getElementById('paymentFilters');
    if (filterForm) {
        filterForm.reset();
    }

    currentPaymentsPage = 1;
    loadPaymentsData();
}

// Payment action handlers
function viewPayment(paymentId) {
    showPaymentDetailsModal(paymentId);
}

function editPayment(paymentId) {
    populatePaymentForm(paymentId);
    showAddPaymentModal();
}

function deletePayment(paymentId) {
    if (confirm('Are you sure you want to delete this payment?')) {
        apiCall(`/api/payments/${paymentId}`, 'DELETE')
            .then(response => {
                if (response.success) {
                    showSuccess('Payment deleted successfully');
                    loadPaymentsData();
                } else {
                    showError('Failed to delete payment');
                }
            })
            .catch(error => {
                console.error('Error deleting payment:', error);
                showError('Error deleting payment');
            });
    }
}

// Show payment details modal
async function showPaymentDetailsModal(paymentId) {
    try {
        const response = await apiCall(`/api/payments/${paymentId}`, 'GET');
        
        if (response.success) {
            const payment = response.data;
            
            const modal = document.getElementById('paymentDetailsModal');
            if (modal) {
                modal.querySelector('#paymentDetailsTitle').textContent = `Payment Details - ${payment.receiptNumber}`;
                modal.querySelector('#paymentDetailsContent').innerHTML = `
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Payment Information</h6>
                            <table class="table table-sm">
                                <tr><td><strong>Receipt Number:</strong></td><td>${payment.receiptNumber}</td></tr>
                                <tr><td><strong>Amount:</strong></td><td>${formatCurrency(payment.amount)}</td></tr>
                                <tr><td><strong>Date:</strong></td><td>${formatDate(payment.date)}</td></tr>
                                <tr><td><strong>Status:</strong></td><td>
                                    <span class="badge ${getPaymentStatusBadgeClass(payment.status)}">
                                        ${payment.status}
                                    </span>
                                </td></tr>
                                <tr><td><strong>Method:</strong></td><td>${payment.method}</td></tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6>Event Information</h6>
                            <table class="table table-sm">
                                <tr><td><strong>Event:</strong></td><td>${payment.eventName || 'N/A'}</td></tr>
                                <tr><td><strong>Event Date:</strong></td><td>${payment.eventDate ? formatDate(payment.eventDate) : 'N/A'}</td></tr>
                                <tr><td><strong>Event Type:</strong></td><td>${payment.eventType || 'N/A'}</td></tr>
                            </table>
                        </div>
                    </div>
                    ${payment.notes ? `
                        <div class="mt-3">
                            <h6>Notes</h6>
                            <p class="text-muted">${payment.notes}</p>
                        </div>
                    ` : ''}
                    ${payment.receiptFile ? `
                        <div class="mt-3">
                            <h6>Receipt</h6>
                            <a href="/api/payments/${payment._id}/receipt" target="_blank" class="btn btn-outline-primary">
                                <i class="fas fa-download"></i> Download Receipt
                            </a>
                        </div>
                    ` : ''}
                `;
                
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
            }
        } else {
            showError('Failed to load payment details');
        }
    } catch (error) {
        console.error('Error loading payment details:', error);
        showError('Error loading payment details');
    }
}

// Populate payment form for editing
async function populatePaymentForm(paymentId) {
    try {
        const response = await apiCall(`/api/payments/${paymentId}`, 'GET');
        
        if (response.success) {
            const payment = response.data;
            
            const form = document.getElementById('paymentForm');
            if (form) {
                form.querySelector('#paymentEventId').value = payment.eventId || '';
                form.querySelector('#paymentAmount').value = payment.amount || '';
                form.querySelector('#paymentDate').value = payment.date ? payment.date.split('T')[0] : '';
                form.querySelector('#paymentMethod').value = payment.method || '';
                form.querySelector('#paymentStatus').value = payment.status || '';
                form.querySelector('#paymentNotes').value = payment.notes || '';
                
                // Set form mode to edit
                form.dataset.mode = 'edit';
                form.dataset.paymentId = paymentId;
            }
        } else {
            showError('Failed to load payment data');
        }
    } catch (error) {
        console.error('Error loading payment data:', error);
        showError('Error loading payment data');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Add payment form submission
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentFormSubmit);
    }

    // Add payment modal
    const addPaymentBtn = document.getElementById('addPaymentBtn');
    if (addPaymentBtn) {
        addPaymentBtn.addEventListener('click', () => {
            resetPaymentForm();
            showAddPaymentModal();
        });
    }

    // Receipt upload
    const receiptFileInput = document.getElementById('receiptFile');
    if (receiptFileInput) {
        receiptFileInput.addEventListener('change', handleReceiptFileChange);
    }
}

// Handle payment form submission
async function handlePaymentFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const isEdit = form.dataset.mode === 'edit';
    const paymentId = form.dataset.paymentId;
    
    try {
        showLoading();
        
        let response;
        if (isEdit) {
            response = await apiCall(`/api/payments/${paymentId}`, 'PUT', formData);
        } else {
            response = await apiCall('/api/payments', 'POST', formData);
        }
        
        if (response.success) {
            showSuccess(`Payment ${isEdit ? 'updated' : 'created'} successfully`);
            hideAddPaymentModal();
            loadPaymentsData();
        } else {
            showError(`Failed to ${isEdit ? 'update' : 'create'} payment`);
        }
    } catch (error) {
        console.error('Error saving payment:', error);
        showError('Error saving payment');
    } finally {
        hideLoading();
    }
}

// Handle receipt file change
function handleReceiptFileChange(event) {
    const file = event.target.files[0];
    const fileInfo = document.getElementById('receiptFileInfo');
    
    if (file) {
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        fileInfo.textContent = `Selected: ${file.name} (${fileSize} MB)`;
        fileInfo.className = 'text-success small';
    } else {
        fileInfo.textContent = 'No file selected';
        fileInfo.className = 'text-muted small';
    }
}

// Reset payment form
function resetPaymentForm() {
    const form = document.getElementById('paymentForm');
    if (form) {
        form.reset();
        form.dataset.mode = 'create';
        delete form.dataset.paymentId;
        
        const fileInfo = document.getElementById('receiptFileInfo');
        if (fileInfo) {
            fileInfo.textContent = 'No file selected';
            fileInfo.className = 'text-muted small';
        }
    }
}

// Show add payment modal
function showAddPaymentModal() {
    const modal = document.getElementById('addPaymentModal');
    if (modal) {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
}

// Hide add payment modal
function hideAddPaymentModal() {
    const modal = document.getElementById('addPaymentModal');
    if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
            bsModal.hide();
        }
    }
}

// Utility functions
function getPaymentMethodIcon(method) {
    const icons = {
        'cash': 'fa-money-bill-wave',
        'card': 'fa-credit-card',
        'bank_transfer': 'fa-university',
        'check': 'fa-money-check',
        'other': 'fa-receipt'
    };
    return icons[method] || 'fa-receipt';
}

function getPaymentStatusBadgeClass(status) {
    const classes = {
        'paid': 'bg-success',
        'partially_paid': 'bg-warning',
        'not_paid': 'bg-danger',
        'overdue': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
}

// Export functions for global access
window.loadPayments = loadPayments;
window.changePaymentsPage = changePaymentsPage;
window.viewPayment = viewPayment;
window.editPayment = editPayment;
window.deletePayment = deletePayment;
window.clearPaymentFilters = clearPaymentFilters;
window.showAddPaymentModal = showAddPaymentModal;
window.hideAddPaymentModal = hideAddPaymentModal;