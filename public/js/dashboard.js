// Dashboard JavaScript for Al Ghadeer Events Management System

let dashboardCharts = {};

// Load dashboard data
async function loadDashboard() {
    try {
        // Load dashboard statistics
        const stats = await App.apiCall('/reports/dashboard');
        
        // Update metrics
        updateDashboardMetrics(stats);
        
        // Update profitability meter
        updateProfitabilityMeter(stats.profitabilityMeter, stats.profitabilityPercentage);
        
        // Load charts
        loadDashboardCharts();
        
        // Load recent events
        loadRecentEvents();
        
    } catch (error) {
        console.error('Failed to load dashboard:', error);
        App.showError('Failed to load dashboard data');
    }
}

// Update dashboard metrics
function updateDashboardMetrics(stats) {
    // Update metric cards
    document.getElementById('totalEvents').textContent = stats.totalEvents || 0;
    document.getElementById('totalRevenue').textContent = App.formatCurrency(stats.totalRevenue || 0);
    document.getElementById('upcomingEvents').textContent = stats.upcomingEvents || 0;
    document.getElementById('outstandingBalances').textContent = stats.outstandingBalances || 0;
    
    // Add animation to numbers
    animateNumbers();
}

// Update profitability meter
function updateProfitabilityMeter(meterColor, percentage) {
    const meterElement = document.getElementById('profitabilityMeter');
    const badgeElement = document.getElementById('profitabilityBadge');
    
    if (meterElement && badgeElement) {
        // Update meter fill
        meterElement.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
        
        // Update badge
        badgeElement.textContent = `${percentage.toFixed(1)}%`;
        badgeElement.className = `badge bg-${meterColor}`;
        
        // Add animation
        meterElement.style.transition = 'width 1s ease-in-out';
    }
}

// Load dashboard charts
async function loadDashboardCharts() {
    try {
        // Load chart data
        const chartData = await App.apiCall('/reports/profitability?groupBy=month');
        
        // Create revenue vs expenses chart
        createRevenueExpensesChart(chartData);
        
        // Create events by type chart
        createEventsByTypeChart();
        
    } catch (error) {
        console.error('Failed to load charts:', error);
    }
}

// Create revenue vs expenses chart
function createRevenueExpensesChart(data) {
    const ctx = document.getElementById('revenueExpensesChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (dashboardCharts.revenueExpenses) {
        dashboardCharts.revenueExpenses.destroy();
    }
    
    // Prepare data
    const labels = data.map(item => item.month || 'Unknown');
    const revenueData = data.map(item => item.totalRevenue || 0);
    const expensesData = data.map(item => item.totalExpenses || 0);
    
    dashboardCharts.revenueExpenses = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Revenue',
                    data: revenueData,
                    backgroundColor: 'rgba(40, 167, 69, 0.8)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: expensesData,
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
                            return App.formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + App.formatCurrency(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
}

// Create events by type chart
async function createEventsByTypeChart() {
    try {
        const eventsData = await App.apiCall('/events/stats/overview');
        const ctx = document.getElementById('eventsByTypeChart');
        if (!ctx) return;
        
        // Destroy existing chart if it exists
        if (dashboardCharts.eventsByType) {
            dashboardCharts.eventsByType.destroy();
        }
        
        // Prepare data
        const eventTypes = eventsData.eventsByType || {};
        const labels = Object.keys(eventTypes);
        const data = Object.values(eventTypes);
        
        // Generate colors
        const colors = [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)'
        ];
        
        dashboardCharts.eventsByType = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Failed to create events by type chart:', error);
    }
}

// Load recent events
async function loadRecentEvents() {
    try {
        const events = await App.apiCall('/events?limit=5');
        updateRecentEventsTable(events.events || []);
    } catch (error) {
        console.error('Failed to load recent events:', error);
    }
}

// Update recent events table
function updateRecentEventsTable(events) {
    const tbody = document.querySelector('#recentEventsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = events.map(event => `
        <tr>
            <td>${event.eventName}</td>
            <td>
                <span class="badge ${App.getStatusBadgeClass(event.eventType)}">
                    ${event.eventType}
                </span>
            </td>
            <td>${App.formatDate(event.eventDate)}</td>
            <td>${event.location}</td>
            <td>
                <span class="badge ${App.getStatusBadgeClass(event.status)}">
                    ${event.status}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary" data-action="view" data-id="${event._id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" data-action="edit" data-id="${event._id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Add empty row if no events
    if (events.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    No events found
                </td>
            </tr>
        `;
    }
}

// Animate numbers
function animateNumbers() {
    const numberElements = document.querySelectorAll('#totalEvents, #totalRevenue, #upcomingEvents, #outstandingBalances');
    
    numberElements.forEach(element => {
        const finalValue = element.textContent;
        const isCurrency = element.id === 'totalRevenue';
        
        if (isCurrency) {
            // Extract numeric value from currency string
            const numericValue = parseFloat(finalValue.replace(/[^\d.-]/g, ''));
            animateCurrency(element, 0, numericValue);
        } else {
            // Animate regular numbers
            const numericValue = parseInt(finalValue) || 0;
            animateNumber(element, 0, numericValue);
        }
    });
}

// Animate number
function animateNumber(element, start, end) {
    const duration = 1000;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (end - start) * progress);
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Animate currency
function animateCurrency(element, start, end) {
    const duration = 1000;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = start + (end - start) * progress;
        element.textContent = App.formatCurrency(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Show add event modal
function showAddEventModal() {
    const modal = new bootstrap.Modal(document.getElementById('addEventModal'));
    modal.show();
}

// Show add payment modal
function showAddPaymentModal() {
    // This will be implemented when payments page is created
    App.showSuccess('Payment modal will be implemented');
}

// Show add employee modal
function showAddEmployeeModal() {
    // This will be implemented when employees page is created
    App.showSuccess('Employee modal will be implemented');
}

// Generate monthly report
async function generateMonthlyReport() {
    try {
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        
        App.showLoading();
        
        const result = await App.apiCall('/reports/monthly', {
            method: 'POST',
            body: JSON.stringify({
                month: month,
                year: year,
                sendEmail: true,
                sendWhatsApp: true
            })
        });
        
        App.hideLoading();
        App.showSuccess('Monthly report generated and sent successfully!');
        
    } catch (error) {
        App.hideLoading();
        App.showError('Failed to generate monthly report');
    }
}

// Save event
async function saveEvent() {
    try {
        const form = document.getElementById('addEventForm');
        const formData = new FormData(form);
        
        // Convert form data to object
        const eventData = {};
        formData.forEach((value, key) => {
            eventData[key] = value;
        });
        
        // Add event time to event date
        if (eventData.eventDate && eventData.eventTime) {
            eventData.eventDate = `${eventData.eventDate}T${eventData.eventTime}`;
        }
        
        App.showLoading();
        
        const result = await App.apiCall('/events', {
            method: 'POST',
            body: JSON.stringify(eventData)
        });
        
        App.hideLoading();
        App.showSuccess('Event created successfully!');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addEventModal'));
        modal.hide();
        
        // Reset form
        form.reset();
        
        // Reload dashboard
        loadDashboard();
        
    } catch (error) {
        App.hideLoading();
        App.showError('Failed to create event');
    }
}

// Refresh dashboard
function refreshDashboard() {
    loadDashboard();
}

// Export functions for global access
window.Dashboard = {
    loadDashboard,
    showAddEventModal,
    showAddPaymentModal,
    showAddEmployeeModal,
    generateMonthlyReport,
    saveEvent,
    refreshDashboard
};

// Make functions globally available
window.showAddEventModal = showAddEventModal;
window.showAddPaymentModal = showAddPaymentModal;
window.showAddEmployeeModal = showAddEmployeeModal;
window.generateMonthlyReport = generateMonthlyReport;
window.saveEvent = saveEvent;