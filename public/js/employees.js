// Employees Management JavaScript
let employeesData = [];
let currentEmployeesPage = 1;
let employeesPerPage = 10;
let employeesFilters = {
    status: '',
    eventId: '',
    role: '',
    dateFrom: '',
    dateTo: '',
    wageMin: '',
    wageMax: ''
};

// Initialize employees page
function loadEmployees() {
    showLoading();
    loadEmployeesData();
    setupEmployeeFilters();
    setupEventListeners();
}

// Load employees data from API
async function loadEmployeesData() {
    try {
        const queryParams = new URLSearchParams({
            page: currentEmployeesPage,
            limit: employeesPerPage,
            ...employeesFilters
        });

        const response = await apiCall(`/api/employees?${queryParams}`, 'GET');
        
        if (response.success) {
            employeesData = response.data.employees;
            updateEmployeesTable();
            updateEmployeesPagination(response.data.totalPages, response.data.currentPage);
            updateEmployeesStats(response.data.stats);
        } else {
            showError('Failed to load employees');
        }
    } catch (error) {
        console.error('Error loading employees:', error);
        showError('Error loading employees');
    } finally {
        hideLoading();
    }
}

// Setup employee filters
function setupEmployeeFilters() {
    const filterForm = document.getElementById('employeeFilters');
    if (!filterForm) return;

    // Status filter
    const statusFilter = filterForm.querySelector('#employeeStatusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            employeesFilters.status = e.target.value;
            currentEmployeesPage = 1;
            loadEmployeesData();
        });
    }

    // Event filter
    const eventFilter = filterForm.querySelector('#employeeEventFilter');
    if (eventFilter) {
        eventFilter.addEventListener('change', (e) => {
            employeesFilters.eventId = e.target.value;
            currentEmployeesPage = 1;
            loadEmployeesData();
        });
    }

    // Role filter
    const roleFilter = filterForm.querySelector('#employeeRoleFilter');
    if (roleFilter) {
        roleFilter.addEventListener('change', (e) => {
            employeesFilters.role = e.target.value;
            currentEmployeesPage = 1;
            loadEmployeesData();
        });
    }

    // Date range filters
    const dateFromFilter = filterForm.querySelector('#employeeDateFromFilter');
    const dateToFilter = filterForm.querySelector('#employeeDateToFilter');
    
    if (dateFromFilter) {
        dateFromFilter.addEventListener('change', (e) => {
            employeesFilters.dateFrom = e.target.value;
            currentEmployeesPage = 1;
            loadEmployeesData();
        });
    }
    
    if (dateToFilter) {
        dateToFilter.addEventListener('change', (e) => {
            employeesFilters.dateTo = e.target.value;
            currentEmployeesPage = 1;
            loadEmployeesData();
        });
    }

    // Wage range filters
    const wageMinFilter = filterForm.querySelector('#employeeWageMinFilter');
    const wageMaxFilter = filterForm.querySelector('#employeeWageMaxFilter');
    
    if (wageMinFilter) {
        wageMinFilter.addEventListener('change', (e) => {
            employeesFilters.wageMin = e.target.value;
            currentEmployeesPage = 1;
            loadEmployeesData();
        });
    }
    
    if (wageMaxFilter) {
        wageMaxFilter.addEventListener('change', (e) => {
            employeesFilters.wageMax = e.target.value;
            currentEmployeesPage = 1;
            loadEmployeesData();
        });
    }

    // Clear filters button
    const clearFiltersBtn = filterForm.querySelector('#clearEmployeeFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearEmployeeFilters);
    }
}

// Update employees table
function updateEmployeesTable() {
    const tableBody = document.querySelector('#employeesTable tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (employeesData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-4">
                    <i class="fas fa-users fa-2x mb-2"></i>
                    <p>No employees found</p>
                </td>
            </tr>
        `;
        return;
    }

    employeesData.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <div class="employee-avatar me-2">
                        <i class="fas fa-user-circle fa-2x text-primary"></i>
                    </div>
                    <div>
                        <div class="fw-bold">${employee.name}</div>
                        <small class="text-muted">${employee.role}</small>
                    </div>
                </div>
            </td>
            <td>${employee.role}</td>
            <td>${formatCurrency(employee.wage)}</td>
            <td>${formatDate(employee.paymentDate)}</td>
            <td>
                <span class="badge ${getEmployeeStatusBadgeClass(employee.status)}">
                    ${employee.status}
                </span>
            </td>
            <td>
                <span class="badge ${getPaymentUrgencyBadgeClass(employee.paymentUrgency)}">
                    ${employee.paymentUrgency}
                </span>
            </td>
            <td>${employee.eventName || 'N/A'}</td>
            <td>
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-sm btn-outline-primary" 
                            onclick="viewEmployee('${employee._id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-warning" 
                            onclick="editEmployee('${employee._id}')" title="Edit Employee">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-success" 
                            onclick="markEmployeePaid('${employee._id}')" title="Mark as Paid"
                            ${employee.status === 'paid' ? 'disabled' : ''}>
                        <i class="fas fa-check"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger" 
                            onclick="deleteEmployee('${employee._id}')" title="Delete Employee">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Update employees pagination
function updateEmployeesPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('employeesPagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    const ul = document.createElement('ul');
    ul.className = 'pagination justify-content-center';

    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" onclick="changeEmployeesPage(${currentPage - 1})">
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
            <a class="page-link" href="#" onclick="changeEmployeesPage(${i})">${i}</a>
        `;
        ul.appendChild(li);
    }

    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" onclick="changeEmployeesPage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </a>
    `;
    ul.appendChild(nextLi);

    paginationContainer.appendChild(ul);
}

// Update employees statistics
function updateEmployeesStats(stats) {
    if (!stats) return;

    const totalEmployeesEl = document.getElementById('totalEmployees');
    const totalWagesEl = document.getElementById('totalWages');
    const paidWagesEl = document.getElementById('paidWages');
    const outstandingWagesEl = document.getElementById('outstandingWages');
    const overduePaymentsEl = document.getElementById('overduePayments');

    if (totalEmployeesEl) totalEmployeesEl.textContent = stats.totalEmployees || 0;
    if (totalWagesEl) totalWagesEl.textContent = formatCurrency(stats.totalWages || 0);
    if (paidWagesEl) paidWagesEl.textContent = formatCurrency(stats.paidWages || 0);
    if (outstandingWagesEl) outstandingWagesEl.textContent = formatCurrency(stats.outstandingWages || 0);
    if (overduePaymentsEl) overduePaymentsEl.textContent = stats.overduePayments || 0;
}

// Change employees page
function changeEmployeesPage(page) {
    currentEmployeesPage = page;
    loadEmployeesData();
}

// Clear employee filters
function clearEmployeeFilters() {
    employeesFilters = {
        status: '',
        eventId: '',
        role: '',
        dateFrom: '',
        dateTo: '',
        wageMin: '',
        wageMax: ''
    };

    // Reset form fields
    const filterForm = document.getElementById('employeeFilters');
    if (filterForm) {
        filterForm.reset();
    }

    currentEmployeesPage = 1;
    loadEmployeesData();
}

// Employee action handlers
function viewEmployee(employeeId) {
    showEmployeeDetailsModal(employeeId);
}

function editEmployee(employeeId) {
    populateEmployeeForm(employeeId);
    showAddEmployeeModal();
}

async function markEmployeePaid(employeeId) {
    try {
        const response = await apiCall(`/api/employees/${employeeId}/mark-paid`, 'PATCH');
        
        if (response.success) {
            showSuccess('Employee marked as paid successfully');
            loadEmployeesData();
        } else {
            showError('Failed to mark employee as paid');
        }
    } catch (error) {
        console.error('Error marking employee as paid:', error);
        showError('Error marking employee as paid');
    }
}

function deleteEmployee(employeeId) {
    if (confirm('Are you sure you want to delete this employee?')) {
        apiCall(`/api/employees/${employeeId}`, 'DELETE')
            .then(response => {
                if (response.success) {
                    showSuccess('Employee deleted successfully');
                    loadEmployeesData();
                } else {
                    showError('Failed to delete employee');
                }
            })
            .catch(error => {
                console.error('Error deleting employee:', error);
                showError('Error deleting employee');
            });
    }
}

// Show employee details modal
async function showEmployeeDetailsModal(employeeId) {
    try {
        const response = await apiCall(`/api/employees/${employeeId}`, 'GET');
        
        if (response.success) {
            const employee = response.data;
            
            const modal = document.getElementById('employeeDetailsModal');
            if (modal) {
                modal.querySelector('#employeeDetailsTitle').textContent = `Employee Details - ${employee.name}`;
                modal.querySelector('#employeeDetailsContent').innerHTML = `
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Employee Information</h6>
                            <table class="table table-sm">
                                <tr><td><strong>Name:</strong></td><td>${employee.name}</td></tr>
                                <tr><td><strong>Role:</strong></td><td>${employee.role}</td></tr>
                                <tr><td><strong>Wage:</strong></td><td>${formatCurrency(employee.wage)}</td></tr>
                                <tr><td><strong>Payment Date:</strong></td><td>${formatDate(employee.paymentDate)}</td></tr>
                                <tr><td><strong>Status:</strong></td><td>
                                    <span class="badge ${getEmployeeStatusBadgeClass(employee.status)}">
                                        ${employee.status}
                                    </span>
                                </td></tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6>Event Information</h6>
                            <table class="table table-sm">
                                <tr><td><strong>Event:</strong></td><td>${employee.eventName || 'N/A'}</td></tr>
                                <tr><td><strong>Event Date:</strong></td><td>${employee.eventDate ? formatDate(employee.eventDate) : 'N/A'}</td></tr>
                                <tr><td><strong>Event Type:</strong></td><td>${employee.eventType || 'N/A'}</td></tr>
                            </table>
                        </div>
                    </div>
                    ${employee.contactInfo ? `
                        <div class="mt-3">
                            <h6>Contact Information</h6>
                            <p class="text-muted">${employee.contactInfo}</p>
                        </div>
                    ` : ''}
                    ${employee.notes ? `
                        <div class="mt-3">
                            <h6>Notes</h6>
                            <p class="text-muted">${employee.notes}</p>
                        </div>
                    ` : ''}
                `;
                
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
            }
        } else {
            showError('Failed to load employee details');
        }
    } catch (error) {
        console.error('Error loading employee details:', error);
        showError('Error loading employee details');
    }
}

// Populate employee form for editing
async function populateEmployeeForm(employeeId) {
    try {
        const response = await apiCall(`/api/employees/${employeeId}`, 'GET');
        
        if (response.success) {
            const employee = response.data;
            
            const form = document.getElementById('employeeForm');
            if (form) {
                form.querySelector('#employeeEventId').value = employee.eventId || '';
                form.querySelector('#employeeName').value = employee.name || '';
                form.querySelector('#employeeRole').value = employee.role || '';
                form.querySelector('#employeeWage').value = employee.wage || '';
                form.querySelector('#employeePaymentDate').value = employee.paymentDate ? employee.paymentDate.split('T')[0] : '';
                form.querySelector('#employeeStatus').value = employee.status || '';
                form.querySelector('#employeeContactInfo').value = employee.contactInfo || '';
                form.querySelector('#employeeNotes').value = employee.notes || '';
                
                // Set form mode to edit
                form.dataset.mode = 'edit';
                form.dataset.employeeId = employeeId;
            }
        } else {
            showError('Failed to load employee data');
        }
    } catch (error) {
        console.error('Error loading employee data:', error);
        showError('Error loading employee data');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Add employee form submission
    const employeeForm = document.getElementById('employeeForm');
    if (employeeForm) {
        employeeForm.addEventListener('submit', handleEmployeeFormSubmit);
    }

    // Add employee modal
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    if (addEmployeeBtn) {
        addEmployeeBtn.addEventListener('click', () => {
            resetEmployeeForm();
            showAddEmployeeModal();
        });
    }
}

// Handle employee form submission
async function handleEmployeeFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const isEdit = form.dataset.mode === 'edit';
    const employeeId = form.dataset.employeeId;
    
    try {
        showLoading();
        
        let response;
        if (isEdit) {
            response = await apiCall(`/api/employees/${employeeId}`, 'PUT', formData);
        } else {
            response = await apiCall('/api/employees', 'POST', formData);
        }
        
        if (response.success) {
            showSuccess(`Employee ${isEdit ? 'updated' : 'created'} successfully`);
            hideAddEmployeeModal();
            loadEmployeesData();
        } else {
            showError(`Failed to ${isEdit ? 'update' : 'create'} employee`);
        }
    } catch (error) {
        console.error('Error saving employee:', error);
        showError('Error saving employee');
    } finally {
        hideLoading();
    }
}

// Reset employee form
function resetEmployeeForm() {
    const form = document.getElementById('employeeForm');
    if (form) {
        form.reset();
        form.dataset.mode = 'create';
        delete form.dataset.employeeId;
    }
}

// Show add employee modal
function showAddEmployeeModal() {
    const modal = document.getElementById('addEmployeeModal');
    if (modal) {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
}

// Hide add employee modal
function hideAddEmployeeModal() {
    const modal = document.getElementById('addEmployeeModal');
    if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
            bsModal.hide();
        }
    }
}

// Load overdue payments
async function loadOverduePayments() {
    try {
        const response = await apiCall('/api/employees/overdue/payments', 'GET');
        
        if (response.success) {
            updateOverduePaymentsTable(response.data);
        } else {
            showError('Failed to load overdue payments');
        }
    } catch (error) {
        console.error('Error loading overdue payments:', error);
        showError('Error loading overdue payments');
    }
}

// Update overdue payments table
function updateOverduePaymentsTable(overduePayments) {
    const tableBody = document.querySelector('#overduePaymentsTable tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (overduePayments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="fas fa-check-circle fa-2x mb-2 text-success"></i>
                    <p>No overdue payments</p>
                </td>
            </tr>
        `;
        return;
    }

    overduePayments.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.name}</td>
            <td>${employee.role}</td>
            <td>${formatCurrency(employee.wage)}</td>
            <td>${formatDate(employee.paymentDate)}</td>
            <td>
                <button type="button" class="btn btn-sm btn-success" 
                        onclick="markEmployeePaid('${employee._id}')">
                    <i class="fas fa-check"></i> Mark Paid
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Utility functions
function getEmployeeStatusBadgeClass(status) {
    const classes = {
        'paid': 'bg-success',
        'pending': 'bg-warning',
        'overdue': 'bg-danger',
        'cancelled': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
}

function getPaymentUrgencyBadgeClass(urgency) {
    const classes = {
        'urgent': 'bg-danger',
        'high': 'bg-warning',
        'medium': 'bg-info',
        'low': 'bg-success'
    };
    return classes[urgency] || 'bg-secondary';
}

// Export functions for global access
window.loadEmployees = loadEmployees;
window.changeEmployeesPage = changeEmployeesPage;
window.viewEmployee = viewEmployee;
window.editEmployee = editEmployee;
window.markEmployeePaid = markEmployeePaid;
window.deleteEmployee = deleteEmployee;
window.clearEmployeeFilters = clearEmployeeFilters;
window.showAddEmployeeModal = showAddEmployeeModal;
window.hideAddEmployeeModal = hideAddEmployeeModal;
window.loadOverduePayments = loadOverduePayments;