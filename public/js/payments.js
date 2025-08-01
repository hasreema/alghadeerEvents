// Payments page functionality
let paymentsData = [];
let currentPaymentsPage = 1;
let paymentsPerPage = 10;
let paymentsTotalPages = 1;
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
}

// Setup payment filters
function setupPaymentFilters() {
  const filterForm = document.getElementById('paymentFilters');
  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      currentPaymentsPage = 1;
      loadPaymentsData();
    });

    // Clear filters
    const clearBtn = document.getElementById('clearPaymentFilters');
    if (clearBtn) {
      clearBtn.addEventListener('click', clearPaymentFilters);
    }
  }
}

// Load payments data
async function loadPaymentsData() {
  try {
    const params = new URLSearchParams({
      page: currentPaymentsPage,
      limit: paymentsPerPage,
      ...paymentsFilters
    });

    const response = await apiCall(`/api/payments?${params}`, 'GET');
    
    if (response.success) {
      paymentsData = response.data.payments;
      paymentsTotalPages = Math.ceil(response.data.total / paymentsPerPage);
      updatePaymentsTable();
      updatePaymentsPagination();
    }
  } catch (error) {
    showError('Failed to load payments');
  } finally {
    hideLoading();
  }
}

// Update payments table
function updatePaymentsTable() {
  const tbody = document.querySelector('#paymentsTable tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  paymentsData.forEach(payment => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${payment.receiptNumber}</td>
      <td>${payment.eventName || 'N/A'}</td>
      <td>${formatCurrency(payment.amount)}</td>
      <td>${formatDate(payment.date)}</td>
      <td>${getStatusBadgeClass(payment.status)}</td>
      <td>${payment.method}</td>
      <td>
        <div class="btn-group" role="group">
          <button type="button" class="btn btn-sm btn-outline-primary" onclick="viewPayment('${payment._id}')">
            <i class="fas fa-eye"></i>
          </button>
          <button type="button" class="btn btn-sm btn-outline-warning" onclick="editPayment('${payment._id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button type="button" class="btn btn-sm btn-outline-danger" onclick="deletePayment('${payment._id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Update payments pagination
function updatePaymentsPagination() {
  const pagination = document.getElementById('paymentsPagination');
  if (!pagination) return;

  pagination.innerHTML = '';

  // Previous button
  const prevBtn = document.createElement('li');
  prevBtn.className = `page-item ${currentPaymentsPage === 1 ? 'disabled' : ''}`;
  prevBtn.innerHTML = `<a class="page-link" href="#" onclick="changePaymentsPage(${currentPaymentsPage - 1})">Previous</a>`;
  pagination.appendChild(prevBtn);

  // Page numbers
  for (let i = 1; i <= paymentsTotalPages; i++) {
    if (i === 1 || i === paymentsTotalPages || (i >= currentPaymentsPage - 2 && i <= currentPaymentsPage + 2)) {
      const pageBtn = document.createElement('li');
      pageBtn.className = `page-item ${i === currentPaymentsPage ? 'active' : ''}`;
      pageBtn.innerHTML = `<a class="page-link" href="#" onclick="changePaymentsPage(${i})">${i}</a>`;
      pagination.appendChild(pageBtn);
    } else if (i === currentPaymentsPage - 3 || i === currentPaymentsPage + 3) {
      const ellipsis = document.createElement('li');
      ellipsis.className = 'page-item disabled';
      ellipsis.innerHTML = '<span class="page-link">...</span>';
      pagination.appendChild(ellipsis);
    }
  }

  // Next button
  const nextBtn = document.createElement('li');
  nextBtn.className = `page-item ${currentPaymentsPage === paymentsTotalPages ? 'disabled' : ''}`;
  nextBtn.innerHTML = `<a class="page-link" href="#" onclick="changePaymentsPage(${currentPaymentsPage + 1})">Next</a>`;
  pagination.appendChild(nextBtn);
}

// Change payments page
function changePaymentsPage(page) {
  if (page >= 1 && page <= paymentsTotalPages) {
    currentPaymentsPage = page;
    loadPaymentsData();
  }
}

// Payment actions
function viewPayment(paymentId) {
  const payment = paymentsData.find(p => p._id === paymentId);
  if (payment) {
    showPaymentDetailsModal(payment);
  }
}

function editPayment(paymentId) {
  const payment = paymentsData.find(p => p._id === paymentId);
  if (payment) {
    populatePaymentForm(payment);
    showAddPaymentModal();
  }
}

function deletePayment(paymentId) {
  if (confirm('Are you sure you want to delete this payment?')) {
    apiCall(`/api/payments/${paymentId}`, 'DELETE')
      .then(response => {
        if (response.success) {
          showSuccess('Payment deleted successfully');
          loadPaymentsData();
        }
      })
      .catch(error => {
        showError('Failed to delete payment');
      });
  }
}

// Show payment details modal
function showPaymentDetailsModal(payment) {
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'paymentDetailsModal';
  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Payment Details</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6">
              <h6>Payment Information</h6>
              <table class="table table-borderless">
                <tr><td><strong>Receipt Number:</strong></td><td>${payment.receiptNumber}</td></tr>
                <tr><td><strong>Amount:</strong></td><td>${formatCurrency(payment.amount)}</td></tr>
                <tr><td><strong>Date:</strong></td><td>${formatDate(payment.date)}</td></tr>
                <tr><td><strong>Method:</strong></td><td>${payment.method}</td></tr>
                <tr><td><strong>Status:</strong></td><td>${getStatusBadgeClass(payment.status)}</td></tr>
              </table>
            </div>
            <div class="col-md-6">
              <h6>Event Information</h6>
              <table class="table table-borderless">
                <tr><td><strong>Event:</strong></td><td>${payment.eventName || 'N/A'}</td></tr>
                <tr><td><strong>Event Date:</strong></td><td>${payment.eventDate ? formatDate(payment.eventDate) : 'N/A'}</td></tr>
              </table>
            </div>
          </div>
          ${payment.notes ? `<div class="mt-3"><h6>Notes</h6><p>${payment.notes}</p></div>` : ''}
          ${payment.receiptFile ? `<div class="mt-3"><h6>Receipt</h6><a href="/api/payments/${payment._id}/receipt" target="_blank" class="btn btn-sm btn-outline-primary"><i class="fas fa-download"></i> Download Receipt</a></div>` : ''}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-warning" onclick="editPayment('${payment._id}')" data-bs-dismiss="modal">Edit Payment</button>
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

// Populate payment form
function populatePaymentForm(payment) {
  const form = document.getElementById('paymentForm');
  if (form) {
    form.querySelector('[name="eventId"]').value = payment.eventId || '';
    form.querySelector('[name="amount"]').value = payment.amount || '';
    form.querySelector('[name="date"]').value = payment.date ? payment.date.split('T')[0] : '';
    form.querySelector('[name="method"]').value = payment.method || '';
    form.querySelector('[name="status"]').value = payment.status || '';
    form.querySelector('[name="notes"]').value = payment.notes || '';
    
    // Set form mode to edit
    form.dataset.mode = 'edit';
    form.dataset.paymentId = payment._id;
  }
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

  const form = document.getElementById('paymentFilters');
  if (form) {
    form.reset();
  }

  currentPaymentsPage = 1;
  loadPaymentsData();
}

// Save payment
async function savePayment(formData) {
  try {
    const mode = formData.get('mode') || 'create';
    const paymentId = formData.get('paymentId');
    
    const url = mode === 'edit' ? `/api/payments/${paymentId}` : '/api/payments';
    const method = mode === 'edit' ? 'PUT' : 'POST';

    const response = await apiCall(url, method, formData);
    
    if (response.success) {
      showSuccess(`Payment ${mode === 'edit' ? 'updated' : 'created'} successfully`);
      loadPaymentsData();
      return true;
    }
  } catch (error) {
    showError(`Failed to ${formData.get('mode') === 'edit' ? 'update' : 'create'} payment`);
  }
  return false;
}

// Load outstanding balances
async function loadOutstandingBalances() {
  try {
    const response = await apiCall('/api/payments/outstanding/balances', 'GET');
    
    if (response.success) {
      const balancesContainer = document.getElementById('outstandingBalances');
      if (balancesContainer) {
        balancesContainer.innerHTML = '';
        
        response.data.forEach(balance => {
          const card = document.createElement('div');
          card.className = 'col-md-6 col-lg-4 mb-3';
          card.innerHTML = `
            <div class="card border-warning">
              <div class="card-body">
                <h6 class="card-title">${balance.eventName}</h6>
                <p class="card-text">
                  <strong>Outstanding:</strong> ${formatCurrency(balance.outstandingAmount)}<br>
                  <strong>Event Date:</strong> ${formatDate(balance.eventDate)}<br>
                  <strong>Days Overdue:</strong> ${balance.daysOverdue}
                </p>
                <button class="btn btn-sm btn-warning" onclick="viewPayment('${balance.eventId}')">
                  View Details
                </button>
              </div>
            </div>
          `;
          balancesContainer.appendChild(card);
        });
      }
    }
  } catch (error) {
    console.error('Failed to load outstanding balances:', error);
  }
}

// Export payments
function exportPayments() {
  // Implementation for exporting payments to Excel/CSV
  showSuccess('Export functionality will be implemented');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('paymentsPage')) {
    loadPayments();
    loadOutstandingBalances();
  }
});