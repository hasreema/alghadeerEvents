// Employees page functionality
let employeesData = [];
let currentEmployeesPage = 1;
let employeesPerPage = 10;
let employeesTotalPages = 1;
let employeesFilters = {
  role: '',
  eventId: '',
  status: '',
  paymentDateFrom: '',
  paymentDateTo: ''
};

// Initialize employees page
function loadEmployees() {
  showLoading();
  loadEmployeesData();
  setupEmployeeFilters();
}

// Setup employee filters
function setupEmployeeFilters() {
  const filterForm = document.getElementById('employeeFilters');
  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      currentEmployeesPage = 1;
      loadEmployeesData();
    });

    // Clear filters
    const clearBtn = document.getElementById('clearEmployeeFilters');
    if (clearBtn) {
      clearBtn.addEventListener('click', clearEmployeeFilters);
    }
  }
}

// Load employees data
async function loadEmployeesData() {
  try {
    const params = new URLSearchParams({
      page: currentEmployeesPage,
      limit: employeesPerPage,
      ...employeesFilters
    });

    const response = await apiCall(`/api/employees?${params}`, 'GET');
    
    if (response.success) {
      employeesData = response.data.employees;
      employeesTotalPages = Math.ceil(response.data.total / employeesPerPage);
      updateEmployeesTable();
      updateEmployeesPagination();
    }
  } catch (error) {
    showError('Failed to load employees');
  } finally {
    hideLoading();
  }
}

// Update employees table
function updateEmployeesTable() {
  const tbody = document.querySelector('#employeesTable tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  employeesData.forEach(employee => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="d-flex align-items-center">
          <div class="avatar me-2">
            <i class="fas fa-user-circle fa-2x text-primary"></i>
          </div>
          <div>
            <div class="fw-bold">${employee.name}</div>
            <small class="text-muted">${employee.role}</small>
          </div>
        </div>
      </td>
      <td>${employee.eventName || 'N/A'}</td>
      <td>${formatCurrency(employee.wage)}</td>
      <td>${formatDate(employee.paymentDate)}</td>
      <td>${getStatusBadgeClass(employee.paymentStatus)}</td>
      <td>
        <div class="btn-group" role="group">
          <button type="button" class="btn btn-sm btn-outline-primary" onclick="viewEmployee('${employee._id}')">
            <i class="fas fa-eye"></i>
          </button>
          <button type="button" class="btn btn-sm btn-outline-warning" onclick="editEmployee('${employee._id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button type="button" class="btn btn-sm btn-outline-success" onclick="markEmployeePaid('${employee._id}')">
            <i class="fas fa-check"></i>
          </button>
          <button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteEmployee('${employee._id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Update employees pagination
function updateEmployeesPagination() {
  const pagination = document.getElementById('employeesPagination');
  if (!pagination) return;

  pagination.innerHTML = '';

  // Previous button
  const prevBtn = document.createElement('li');
  prevBtn.className = `page-item ${currentEmployeesPage === 1 ? 'disabled' : ''}`;
  prevBtn.innerHTML = `<a class="page-link" href="#" onclick="changeEmployeesPage(${currentEmployeesPage - 1})">Previous</a>`;
  pagination.appendChild(prevBtn);

  // Page numbers
  for (let i = 1; i <= employeesTotalPages; i++) {
    if (i === 1 || i === employeesTotalPages || (i >= currentEmployeesPage - 2 && i <= currentEmployeesPage + 2)) {
      const pageBtn = document.createElement('li');
      pageBtn.className = `page-item ${i === currentEmployeesPage ? 'active' : ''}`;
      pageBtn.innerHTML = `<a class="page-link" href="#" onclick="changeEmployeesPage(${i})">${i}</a>`;
      pagination.appendChild(pageBtn);
    } else if (i === currentEmployeesPage - 3 || i === currentEmployeesPage + 3) {
      const ellipsis = document.createElement('li');
      ellipsis.className = 'page-item disabled';
      ellipsis.innerHTML = '<span class="page-link">...</span>';
      pagination.appendChild(ellipsis);
    }
  }

  // Next button
  const nextBtn = document.createElement('li');
  nextBtn.className = `page-item ${currentEmployeesPage === employeesTotalPages ? 'disabled' : ''}`;
  nextBtn.innerHTML = `<a class="page-link" href="#" onclick="changeEmployeesPage(${currentEmployeesPage + 1})">Next</a>`;
  pagination.appendChild(nextBtn);
}

// Change employees page
function changeEmployeesPage(page) {
  if (page >= 1 && page <= employeesTotalPages) {
    currentEmployeesPage = page;
    loadEmployeesData();
  }
}

// Employee actions
function viewEmployee(employeeId) {
  const employee = employeesData.find(e => e._id === employeeId);
  if (employee) {
    showEmployeeDetailsModal(employee);
  }
}

function editEmployee(employeeId) {
  const employee = employeesData.find(e => e._id === employeeId);
  if (employee) {
    populateEmployeeForm(employee);
    showAddEmployeeModal();
  }
}

function markEmployeePaid(employeeId) {
  if (confirm('Mark this employee as paid?')) {
    apiCall(`/api/employees/${employeeId}/mark-paid`, 'PATCH')
      .then(response => {
        if (response.success) {
          showSuccess('Employee marked as paid');
          loadEmployeesData();
        }
      })
      .catch(error => {
        showError('Failed to mark employee as paid');
      });
  }
}

function deleteEmployee(employeeId) {
  if (confirm('Are you sure you want to delete this employee?')) {
    apiCall(`/api/employees/${employeeId}`, 'DELETE')
      .then(response => {
        if (response.success) {
          showSuccess('Employee deleted successfully');
          loadEmployeesData();
        }
      })
      .catch(error => {
        showError('Failed to delete employee');
      });
  }
}

// Show employee details modal
function showEmployeeDetailsModal(employee) {
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'employeeDetailsModal';
  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Employee Details</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6">
              <h6>Employee Information</h6>
              <table class="table table-borderless">
                <tr><td><strong>Name:</strong></td><td>${employee.name}</td></tr>
                <tr><td><strong>Role:</strong></td><td>${employee.role}</td></tr>
                <tr><td><strong>Wage:</strong></td><td>${formatCurrency(employee.wage)}</td></tr>
                <tr><td><strong>Payment Date:</strong></td><td>${formatDate(employee.paymentDate)}</td></tr>
                <tr><td><strong>Status:</strong></td><td>${getStatusBadgeClass(employee.paymentStatus)}</td></tr>
              </table>
            </div>
            <div class="col-md-6">
              <h6>Event Information</h6>
              <table class="table table-borderless">
                <tr><td><strong>Event:</strong></td><td>${employee.eventName || 'N/A'}</td></tr>
                <tr><td><strong>Event Date:</strong></td><td>${employee.eventDate ? formatDate(employee.eventDate) : 'N/A'}</td></tr>
              </table>
            </div>
          </div>
          ${employee.contactInfo ? `<div class="mt-3"><h6>Contact Information</h6><p>${employee.contactInfo}</p></div>` : ''}
          ${employee.notes ? `<div class="mt-3"><h6>Notes</h6><p>${employee.notes}</p></div>` : ''}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-success" onclick="markEmployeePaid('${employee._id}')" data-bs-dismiss="modal">Mark as Paid</button>
          <button type="button" class="btn btn-warning" onclick="editEmployee('${employee._id}')" data-bs-dismiss="modal">Edit Employee</button>
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

// Populate employee form
function populateEmployeeForm(employee) {
  const form = document.getElementById('employeeForm');
  if (form) {
    form.querySelector('[name="eventId"]').value = employee.eventId || '';
    form.querySelector('[name="name"]').value = employee.name || '';
    form.querySelector('[name="role"]').value = employee.role || '';
    form.querySelector('[name="wage"]').value = employee.wage || '';
    form.querySelector('[name="paymentDate"]').value = employee.paymentDate ? employee.paymentDate.split('T')[0] : '';
    form.querySelector('[name="contactInfo"]').value = employee.contactInfo || '';
    form.querySelector('[name="notes"]').value = employee.notes || '';
    
    // Set form mode to edit
    form.dataset.mode = 'edit';
    form.dataset.employeeId = employee._id;
  }
}

// Clear employee filters
function clearEmployeeFilters() {
  employeesFilters = {
    role: '',
    eventId: '',
    status: '',
    paymentDateFrom: '',
    paymentDateTo: ''
  };

  const form = document.getElementById('employeeFilters');
  if (form) {
    form.reset();
  }

  currentEmployeesPage = 1;
  loadEmployeesData();
}

// Save employee
async function saveEmployee(formData) {
  try {
    const mode = formData.get('mode') || 'create';
    const employeeId = formData.get('employeeId');
    
    const url = mode === 'edit' ? `/api/employees/${employeeId}` : '/api/employees';
    const method = mode === 'edit' ? 'PUT' : 'POST';

    const response = await apiCall(url, method, formData);
    
    if (response.success) {
      showSuccess(`Employee ${mode === 'edit' ? 'updated' : 'created'} successfully`);
      loadEmployeesData();
      return true;
    }
  } catch (error) {
    showError(`Failed to ${formData.get('mode') === 'edit' ? 'update' : 'create'} employee`);
  }
  return false;
}

// Load overdue payments
async function loadOverduePayments() {
  try {
    const response = await apiCall('/api/employees/overdue/payments', 'GET');
    
    if (response.success) {
      const overdueContainer = document.getElementById('overduePayments');
      if (overdueContainer) {
        overdueContainer.innerHTML = '';
        
        response.data.forEach(employee => {
          const card = document.createElement('div');
          card.className = 'col-md-6 col-lg-4 mb-3';
          card.innerHTML = `
            <div class="card border-danger">
              <div class="card-body">
                <h6 class="card-title">${employee.name}</h6>
                <p class="card-text">
                  <strong>Role:</strong> ${employee.role}<br>
                  <strong>Wage:</strong> ${formatCurrency(employee.wage)}<br>
                  <strong>Due Date:</strong> ${formatDate(employee.paymentDate)}<br>
                  <strong>Days Overdue:</strong> ${employee.daysOverdue}
                </p>
                <button class="btn btn-sm btn-success" onclick="markEmployeePaid('${employee._id}')">
                  Mark as Paid
                </button>
              </div>
            </div>
          `;
          overdueContainer.appendChild(card);
        });
      }
    }
  } catch (error) {
    console.error('Failed to load overdue payments:', error);
  }
}

// Load upcoming payments
async function loadUpcomingPayments() {
  try {
    const response = await apiCall('/api/employees/upcoming/payments', 'GET');
    
    if (response.success) {
      const upcomingContainer = document.getElementById('upcomingPayments');
      if (upcomingContainer) {
        upcomingContainer.innerHTML = '';
        
        response.data.forEach(employee => {
          const card = document.createElement('div');
          card.className = 'col-md-6 col-lg-4 mb-3';
          card.innerHTML = `
            <div class="card border-warning">
              <div class="card-body">
                <h6 class="card-title">${employee.name}</h6>
                <p class="card-text">
                  <strong>Role:</strong> ${employee.role}<br>
                  <strong>Wage:</strong> ${formatCurrency(employee.wage)}<br>
                  <strong>Due Date:</strong> ${formatDate(employee.paymentDate)}<br>
                  <strong>Days Until Due:</strong> ${employee.daysUntilDue}
                </p>
                <button class="btn btn-sm btn-warning" onclick="viewEmployee('${employee._id}')">
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
    console.error('Failed to load upcoming payments:', error);
  }
}

// Export employees
function exportEmployees() {
  // Implementation for exporting employees to Excel/CSV
  showSuccess('Export functionality will be implemented');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('employeesPage')) {
    loadEmployees();
    loadOverduePayments();
    loadUpcomingPayments();
  }
});