// Reports Management JavaScript
let reportsData = [];
let currentReportsPage = 1;
let reportsPerPage = 10;

// Initialize reports page
function loadReports() {
    showLoading();
    loadDashboardStats();
    loadProfitabilityReports();
    setupEventListeners();
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await apiCall('/api/reports/dashboard', 'GET');
        
        if (response.success) {
            updateDashboardStats(response.data);
            createDashboardCharts(response.data);
        } else {
            showError('Failed to load dashboard statistics');
        }
    } catch (error) {
        console.error('Error loading dashboard statistics:', error);
        showError('Error loading dashboard statistics');
    } finally {
        hideLoading();
    }
}

// Update dashboard statistics
function updateDashboardStats(stats) {
    if (!stats) return;

    // Update metric cards
    const totalRevenueEl = document.getElementById('totalRevenue');
    const totalExpensesEl = document.getElementById('totalExpenses');
    const netProfitEl = document.getElementById('netProfit');
    const profitabilityEl = document.getElementById('profitability');
    const totalEventsEl = document.getElementById('totalEvents');
    const outstandingBalancesEl = document.getElementById('outstandingBalances');

    if (totalRevenueEl) totalRevenueEl.textContent = formatCurrency(stats.totalRevenue || 0);
    if (totalExpensesEl) totalExpensesEl.textContent = formatCurrency(stats.totalExpenses || 0);
    if (netProfitEl) netProfitEl.textContent = formatCurrency(stats.netProfit || 0);
    if (profitabilityEl) profitabilityEl.textContent = `${(stats.profitabilityPercentage || 0).toFixed(1)}%`;
    if (totalEventsEl) totalEventsEl.textContent = stats.totalEvents || 0;
    if (outstandingBalancesEl) outstandingBalancesEl.textContent = formatCurrency(stats.outstandingBalances || 0);

    // Update profitability meter
    updateProfitabilityMeter(stats.profitabilityPercentage || 0);

    // Update upcoming events
    updateUpcomingEvents(stats.upcomingEvents || []);

    // Update outstanding balances
    updateOutstandingBalances(stats.outstandingBalancesList || []);
}

// Update profitability meter
function updateProfitabilityMeter(percentage) {
    const meterEl = document.getElementById('profitabilityMeter');
    if (!meterEl) return;

    // Determine color based on percentage
    let color = 'success';
    if (percentage < 10) color = 'danger';
    else if (percentage < 25) color = 'warning';
    else if (percentage < 50) color = 'info';

    meterEl.innerHTML = `
        <div class="progress" style="height: 30px;">
            <div class="progress-bar bg-${color}" role="progressbar" 
                 style="width: ${Math.min(percentage, 100)}%" 
                 aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
                ${percentage.toFixed(1)}%
            </div>
        </div>
        <div class="text-center mt-2">
            <small class="text-muted">Profitability Rate</small>
        </div>
    `;
}

// Update upcoming events
function updateUpcomingEvents(events) {
    const containerEl = document.getElementById('upcomingEvents');
    if (!containerEl) return;

    if (events.length === 0) {
        containerEl.innerHTML = `
            <div class="text-center text-muted py-3">
                <i class="fas fa-calendar fa-2x mb-2"></i>
                <p>No upcoming events</p>
            </div>
        `;
        return;
    }

    containerEl.innerHTML = events.map(event => `
        <div class="card mb-2">
            <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="card-title mb-1">${event.name}</h6>
                        <p class="card-text small text-muted mb-1">
                            <i class="fas fa-calendar"></i> ${formatDate(event.date)}
                        </p>
                        <p class="card-text small text-muted mb-0">
                            <i class="fas fa-map-marker-alt"></i> ${event.location}
                        </p>
                    </div>
                    <div class="text-end">
                        <span class="badge ${getEventStatusBadgeClass(event.status)}">
                            ${event.status}
                        </span>
                        <div class="small text-muted mt-1">
                            ${formatCurrency(event.totalCost)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Update outstanding balances
function updateOutstandingBalances(balances) {
    const containerEl = document.getElementById('outstandingBalancesList');
    if (!containerEl) return;

    if (balances.length === 0) {
        containerEl.innerHTML = `
            <div class="text-center text-muted py-3">
                <i class="fas fa-check-circle fa-2x mb-2 text-success"></i>
                <p>No outstanding balances</p>
            </div>
        `;
        return;
    }

    containerEl.innerHTML = balances.map(balance => `
        <div class="card mb-2 border-warning">
            <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="card-title mb-1">${balance.eventName}</h6>
                        <p class="card-text small text-muted mb-0">
                            <i class="fas fa-calendar"></i> ${formatDate(balance.eventDate)}
                        </p>
                    </div>
                    <div class="text-end">
                        <div class="text-warning fw-bold">
                            ${formatCurrency(balance.outstandingAmount)}
                        </div>
                        <small class="text-muted">
                            ${balance.daysOverdue} days overdue
                        </small>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Create dashboard charts
function createDashboardCharts(stats) {
    // Revenue vs Expenses Chart
    createRevenueExpensesChart(stats.revenueExpensesData || []);
    
    // Events by Type Chart
    createEventsByTypeChart(stats.eventsByTypeData || []);
    
    // Profitability by Location Chart
    createProfitabilityByLocationChart(stats.profitabilityByLocationData || []);
    
    // Monthly Trends Chart
    createMonthlyTrendsChart(stats.monthlyTrendsData || []);
}

// Create revenue vs expenses chart
function createRevenueExpensesChart(data) {
    const ctx = document.getElementById('revenueExpensesChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.month),
            datasets: [
                {
                    label: 'Revenue',
                    data: data.map(item => item.revenue),
                    backgroundColor: 'rgba(40, 167, 69, 0.8)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: data.map(item => item.expenses),
                    backgroundColor: 'rgba(220, 53, 69, 0.8)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

// Create events by type chart
function createEventsByTypeChart(data) {
    const ctx = document.getElementById('eventsByTypeChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(item => item.type),
            datasets: [{
                data: data.map(item => item.count),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Create profitability by location chart
function createProfitabilityByLocationChart(data) {
    const ctx = document.getElementById('profitabilityByLocationChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(item => item.location),
            datasets: [{
                data: data.map(item => item.profitability),
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(220, 53, 69, 0.8)',
                    'rgba(23, 162, 184, 0.8)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Create monthly trends chart
function createMonthlyTrendsChart(data) {
    const ctx = document.getElementById('monthlyTrendsChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => item.month),
            datasets: [
                {
                    label: 'Revenue',
                    data: data.map(item => item.revenue),
                    borderColor: 'rgba(40, 167, 69, 1)',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Profit',
                    data: data.map(item => item.profit),
                    borderColor: 'rgba(23, 162, 184, 1)',
                    backgroundColor: 'rgba(23, 162, 184, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

// Load profitability reports
async function loadProfitabilityReports() {
    try {
        const response = await apiCall('/api/reports/profitability', 'GET');
        
        if (response.success) {
            updateProfitabilityReports(response.data);
        } else {
            showError('Failed to load profitability reports');
        }
    } catch (error) {
        console.error('Error loading profitability reports:', error);
        showError('Error loading profitability reports');
    }
}

// Update profitability reports
function updateProfitabilityReports(data) {
    // Update profitability by event type
    updateProfitabilityByType(data.byType || []);
    
    // Update profitability by location
    updateProfitabilityByLocation(data.byLocation || []);
    
    // Update profitability by month
    updateProfitabilityByMonth(data.byMonth || []);
    
    // Update top profitable events
    updateTopProfitableEvents(data.topEvents || []);
}

// Update profitability by type
function updateProfitabilityByType(data) {
    const containerEl = document.getElementById('profitabilityByType');
    if (!containerEl) return;

    if (data.length === 0) {
        containerEl.innerHTML = '<p class="text-muted">No data available</p>';
        return;
    }

    containerEl.innerHTML = data.map(item => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <span>${item.type}</span>
            <span class="fw-bold ${item.profitability >= 0 ? 'text-success' : 'text-danger'}">
                ${formatCurrency(item.profitability)}
            </span>
        </div>
    `).join('');
}

// Update profitability by location
function updateProfitabilityByLocation(data) {
    const containerEl = document.getElementById('profitabilityByLocation');
    if (!containerEl) return;

    if (data.length === 0) {
        containerEl.innerHTML = '<p class="text-muted">No data available</p>';
        return;
    }

    containerEl.innerHTML = data.map(item => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <span>${item.location}</span>
            <span class="fw-bold ${item.profitability >= 0 ? 'text-success' : 'text-danger'}">
                ${formatCurrency(item.profitability)}
            </span>
        </div>
    `).join('');
}

// Update profitability by month
function updateProfitabilityByMonth(data) {
    const containerEl = document.getElementById('profitabilityByMonth');
    if (!containerEl) return;

    if (data.length === 0) {
        containerEl.innerHTML = '<p class="text-muted">No data available</p>';
        return;
    }

    containerEl.innerHTML = data.map(item => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <span>${item.month}</span>
            <span class="fw-bold ${item.profitability >= 0 ? 'text-success' : 'text-danger'}">
                ${formatCurrency(item.profitability)}
            </span>
        </div>
    `).join('');
}

// Update top profitable events
function updateTopProfitableEvents(data) {
    const containerEl = document.getElementById('topProfitableEvents');
    if (!containerEl) return;

    if (data.length === 0) {
        containerEl.innerHTML = '<p class="text-muted">No data available</p>';
        return;
    }

    containerEl.innerHTML = data.map((item, index) => `
        <div class="card mb-2">
            <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="card-title mb-1">${index + 1}. ${item.name}</h6>
                        <p class="card-text small text-muted mb-1">
                            <i class="fas fa-calendar"></i> ${formatDate(item.date)}
                        </p>
                        <p class="card-text small text-muted mb-0">
                            <i class="fas fa-map-marker-alt"></i> ${item.location}
                        </p>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold ${item.profitability >= 0 ? 'text-success' : 'text-danger'}">
                            ${formatCurrency(item.profitability)}
                        </div>
                        <small class="text-muted">
                            ${item.profitabilityPercentage.toFixed(1)}%
                        </small>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Generate monthly report
async function generateMonthlyReport() {
    try {
        showLoading();
        
        const response = await apiCall('/api/reports/monthly', 'POST', {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            sendEmail: true,
            sendWhatsApp: true
        });
        
        if (response.success) {
            showSuccess('Monthly report generated and sent successfully');
            
            // Download the report
            if (response.data.reportUrl) {
                const link = document.createElement('a');
                link.href = response.data.reportUrl;
                link.download = `monthly-report-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}.pdf`;
                link.click();
            }
        } else {
            showError('Failed to generate monthly report');
        }
    } catch (error) {
        console.error('Error generating monthly report:', error);
        showError('Error generating monthly report');
    } finally {
        hideLoading();
    }
}

// Generate custom report
async function generateCustomReport() {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    const reportType = document.getElementById('reportType').value;
    
    if (!startDate || !endDate) {
        showError('Please select start and end dates');
        return;
    }
    
    try {
        showLoading();
        
        const response = await apiCall('/api/reports/custom', 'POST', {
            startDate,
            endDate,
            reportType,
            includeCharts: true,
            includeDetails: true
        });
        
        if (response.success) {
            showSuccess('Custom report generated successfully');
            
            // Download the report
            if (response.data.reportUrl) {
                const link = document.createElement('a');
                link.href = response.data.reportUrl;
                link.download = `custom-report-${startDate}-to-${endDate}.pdf`;
                link.click();
            }
        } else {
            showError('Failed to generate custom report');
        }
    } catch (error) {
        console.error('Error generating custom report:', error);
        showError('Error generating custom report');
    } finally {
        hideLoading();
    }
}

// Export data to Excel
async function exportDataToExcel() {
    const dataType = document.getElementById('exportDataType').value;
    
    try {
        showLoading();
        
        const response = await apiCall('/api/reports/export', 'POST', {
            dataType,
            format: 'excel'
        });
        
        if (response.success) {
            showSuccess('Data exported successfully');
            
            // Download the file
            if (response.data.fileUrl) {
                const link = document.createElement('a');
                link.href = response.data.fileUrl;
                link.download = `${dataType}-export-${new Date().toISOString().split('T')[0]}.xlsx`;
                link.click();
            }
        } else {
            showError('Failed to export data');
        }
    } catch (error) {
        console.error('Error exporting data:', error);
        showError('Error exporting data');
    } finally {
        hideLoading();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Generate monthly report button
    const generateMonthlyBtn = document.getElementById('generateMonthlyReport');
    if (generateMonthlyBtn) {
        generateMonthlyBtn.addEventListener('click', generateMonthlyReport);
    }

    // Generate custom report form
    const customReportForm = document.getElementById('customReportForm');
    if (customReportForm) {
        customReportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            generateCustomReport();
        });
    }

    // Export data button
    const exportDataBtn = document.getElementById('exportData');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportDataToExcel);
    }

    // Refresh dashboard button
    const refreshDashboardBtn = document.getElementById('refreshDashboard');
    if (refreshDashboardBtn) {
        refreshDashboardBtn.addEventListener('click', loadDashboardStats);
    }
}

// Utility functions
function getEventStatusBadgeClass(status) {
    const classes = {
        'upcoming': 'bg-primary',
        'ongoing': 'bg-success',
        'completed': 'bg-secondary',
        'cancelled': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
}

// Export functions for global access
window.loadReports = loadReports;
window.generateMonthlyReport = generateMonthlyReport;
window.generateCustomReport = generateCustomReport;
window.exportDataToExcel = exportDataToExcel;