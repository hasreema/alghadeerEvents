// Reports page functionality
let reportsData = {};
let currentReportType = 'monthly';
let currentReportPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM format

// Initialize reports page
function loadReports() {
  showLoading();
  loadDashboardStats();
  loadProfitabilityData();
  setupReportFilters();
}

// Setup report filters
function setupReportFilters() {
  const filterForm = document.getElementById('reportFilters');
  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      loadReportData();
    });

    // Clear filters
    const clearBtn = document.getElementById('clearReportFilters');
    if (clearBtn) {
      clearBtn.addEventListener('click', clearReportFilters);
    }
  }
}

// Load dashboard statistics
async function loadDashboardStats() {
  try {
    const response = await apiCall('/api/reports/dashboard', 'GET');
    
    if (response.success) {
      reportsData.dashboard = response.data;
      updateDashboardStats();
      updateProfitabilityMeter();
      createDashboardCharts();
    }
  } catch (error) {
    showError('Failed to load dashboard statistics');
  }
}

// Update dashboard statistics
function updateDashboardStats() {
  const stats = reportsData.dashboard;
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

  // Animate numbers
  animateNumbers();
}

// Update profitability meter
function updateProfitabilityMeter() {
  const stats = reportsData.dashboard;
  if (!stats) return;

  const meterEl = document.getElementById('profitabilityMeter');
  if (!meterEl) return;

  const percentage = stats.profitabilityPercentage || 0;
  let color = 'success';
  let status = 'Excellent';

  if (percentage < 20) {
    color = 'danger';
    status = 'Critical';
  } else if (percentage < 40) {
    color = 'warning';
    status = 'Low';
  } else if (percentage < 60) {
    color = 'info';
    status = 'Good';
  }

  meterEl.innerHTML = `
    <div class="profitability-meter">
      <div class="meter-circle ${color}">
        <div class="meter-value">${percentage.toFixed(1)}%</div>
        <div class="meter-label">${status}</div>
      </div>
      <div class="meter-details">
        <div class="detail-item">
          <span class="label">Revenue:</span>
          <span class="value">${formatCurrency(stats.totalRevenue || 0)}</span>
        </div>
        <div class="detail-item">
          <span class="label">Expenses:</span>
          <span class="value">${formatCurrency(stats.totalExpenses || 0)}</span>
        </div>
        <div class="detail-item">
          <span class="label">Net Profit:</span>
          <span class="value">${formatCurrency(stats.netProfit || 0)}</span>
        </div>
      </div>
    </div>
  `;
}

// Create dashboard charts
function createDashboardCharts() {
  const stats = reportsData.dashboard;
  if (!stats) return;

  // Revenue vs Expenses Chart
  createRevenueExpensesChart(stats.revenueVsExpenses);
  
  // Events by Type Chart
  createEventsByTypeChart(stats.eventsByType);
  
  // Profitability by Location Chart
  createProfitabilityByLocationChart(stats.profitabilityByLocation);
}

// Create revenue vs expenses chart
function createRevenueExpensesChart(data) {
  const ctx = document.getElementById('revenueExpensesChart');
  if (!ctx || !data) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels || [],
      datasets: [
        {
          label: 'Revenue',
          data: data.revenue || [],
          backgroundColor: 'rgba(40, 167, 69, 0.8)',
          borderColor: 'rgba(40, 167, 69, 1)',
          borderWidth: 1
        },
        {
          label: 'Expenses',
          data: data.expenses || [],
          backgroundColor: 'rgba(220, 53, 69, 0.8)',
          borderColor: 'rgba(220, 53, 69, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
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
  if (!ctx || !data) return;

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data.labels || [],
      datasets: [{
        data: data.values || [],
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
  if (!ctx || !data) return;

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.labels || [],
      datasets: [{
        data: data.values || [],
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
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Load profitability data
async function loadProfitabilityData() {
  try {
    const response = await apiCall('/api/reports/profitability', 'GET');
    
    if (response.success) {
      reportsData.profitability = response.data;
      updateProfitabilityTable();
    }
  } catch (error) {
    showError('Failed to load profitability data');
  }
}

// Update profitability table
function updateProfitabilityTable() {
  const data = reportsData.profitability;
  if (!data) return;

  const tbody = document.querySelector('#profitabilityTable tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  data.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${formatCurrency(item.revenue)}</td>
      <td>${formatCurrency(item.expenses)}</td>
      <td>${formatCurrency(item.profit)}</td>
      <td>${item.profitabilityPercentage.toFixed(1)}%</td>
      <td>${item.count}</td>
    `;
    tbody.appendChild(row);
  });
}

// Load report data
async function loadReportData() {
  try {
    const params = new URLSearchParams({
      type: currentReportType,
      period: currentReportPeriod
    });

    const response = await apiCall(`/api/reports/data?${params}`, 'GET');
    
    if (response.success) {
      reportsData.current = response.data;
      updateReportDisplay();
    }
  } catch (error) {
    showError('Failed to load report data');
  }
}

// Update report display
function updateReportDisplay() {
  const data = reportsData.current;
  if (!data) return;

  const container = document.getElementById('reportDisplay');
  if (!container) return;

  container.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Summary</h5>
          </div>
          <div class="card-body">
            <table class="table table-borderless">
              <tr><td><strong>Total Revenue:</strong></td><td>${formatCurrency(data.totalRevenue)}</td></tr>
              <tr><td><strong>Total Expenses:</strong></td><td>${formatCurrency(data.totalExpenses)}</td></tr>
              <tr><td><strong>Net Profit:</strong></td><td>${formatCurrency(data.netProfit)}</td></tr>
              <tr><td><strong>Profitability:</strong></td><td>${data.profitabilityPercentage.toFixed(1)}%</td></tr>
              <tr><td><strong>Total Events:</strong></td><td>${data.totalEvents}</td></tr>
            </table>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Top Performing Events</h5>
          </div>
          <div class="card-body">
            ${data.topEvents ? data.topEvents.map(event => `
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <strong>${event.name}</strong><br>
                  <small class="text-muted">${event.type} - ${formatDate(event.date)}</small>
                </div>
                <div class="text-end">
                  <div class="fw-bold text-success">${formatCurrency(event.profit)}</div>
                  <small class="text-muted">${event.profitabilityPercentage.toFixed(1)}%</small>
                </div>
              </div>
            `).join('') : '<p class="text-muted">No data available</p>'}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Generate monthly report
async function generateMonthlyReport() {
  try {
    showLoading();
    
    const response = await apiCall('/api/reports/monthly', 'POST', {
      month: currentReportPeriod,
      sendEmail: true,
      sendWhatsApp: true
    });
    
    if (response.success) {
      showSuccess('Monthly report generated and sent successfully');
      
      // Download the report
      if (response.data.reportUrl) {
        const link = document.createElement('a');
        link.href = response.data.reportUrl;
        link.download = `monthly-report-${currentReportPeriod}.pdf`;
        link.click();
      }
    }
  } catch (error) {
    showError('Failed to generate monthly report');
  } finally {
    hideLoading();
  }
}

// Export report data
function exportReportData() {
  const data = reportsData.current;
  if (!data) {
    showError('No report data to export');
    return;
  }

  // Create CSV content
  let csvContent = 'data:text/csv;charset=utf-8,';
  
  // Add headers
  csvContent += 'Event Name,Type,Date,Revenue,Expenses,Profit,Profitability%\n';
  
  // Add data
  if (data.events) {
    data.events.forEach(event => {
      csvContent += `"${event.name}","${event.type}","${event.date}","${event.revenue}","${event.expenses}","${event.profit}","${event.profitabilityPercentage}"\n`;
    });
  }
  
  // Download file
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `report-${currentReportType}-${currentReportPeriod}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showSuccess('Report exported successfully');
}

// Clear report filters
function clearReportFilters() {
  currentReportType = 'monthly';
  currentReportPeriod = new Date().toISOString().slice(0, 7);
  
  const form = document.getElementById('reportFilters');
  if (form) {
    form.reset();
  }
  
  loadReportData();
}

// Load outstanding balances
async function loadOutstandingBalances() {
  try {
    const response = await apiCall('/api/reports/outstanding-balances', 'GET');
    
    if (response.success) {
      const container = document.getElementById('outstandingBalancesList');
      if (container) {
        container.innerHTML = '';
        
        response.data.forEach(balance => {
          const item = document.createElement('div');
          item.className = 'alert alert-warning d-flex justify-content-between align-items-center';
          item.innerHTML = `
            <div>
              <strong>${balance.eventName}</strong><br>
              <small>Due: ${formatDate(balance.dueDate)}</small>
            </div>
            <div class="text-end">
              <div class="fw-bold">${formatCurrency(balance.amount)}</div>
              <small class="text-muted">${balance.daysOverdue} days overdue</small>
            </div>
          `;
          container.appendChild(item);
        });
      }
    }
  } catch (error) {
    console.error('Failed to load outstanding balances:', error);
  }
}

// Animate numbers
function animateNumbers() {
  const elements = document.querySelectorAll('.animate-number');
  elements.forEach(element => {
    const finalValue = parseFloat(element.textContent.replace(/[^\d.-]/g, ''));
    const isCurrency = element.textContent.includes('₪') || element.textContent.includes('$');
    
    animateNumber(element, 0, finalValue, isCurrency);
  });
}

function animateNumber(element, start, end, isCurrency) {
  const duration = 1000;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const current = start + (end - start) * progress;
    element.textContent = isCurrency ? formatCurrency(current) : Math.round(current);
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('reportsPage')) {
    loadReports();
    loadOutstandingBalances();
  }
});