// Main JavaScript file for Al Ghadeer Events Management System

// Global variables
let currentPage = 'dashboard';
let currentLanguage = 'en';
let notifications = [];

// API Base URL
const API_BASE_URL = '/api';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set up navigation
    setupNavigation();
    
    // Set up language switching
    setupLanguageSwitching();
    
    // Set up notifications
    setupNotifications();
    
    // Load initial page
    loadPage(currentPage);
    
    // Set up event listeners
    setupEventListeners();
    
    // Start periodic updates
    startPeriodicUpdates();
}

// Navigation setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link[data-page]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            navigateToPage(page);
        });
    });
}

// Navigate to a specific page
function navigateToPage(page) {
    // Update active navigation
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(pageContent => {
        pageContent.style.display = 'none';
    });
    
    // Show target page
    const targetPage = document.getElementById(`${page}-page`);
    if (targetPage) {
        targetPage.style.display = 'block';
        currentPage = page;
        
        // Load page-specific content
        loadPageContent(page);
    }
}

// Load page-specific content
function loadPageContent(page) {
    switch (page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'events':
            loadEvents();
            break;
        case 'payments':
            loadPayments();
            break;
        case 'employees':
            loadEmployees();
            break;
        case 'reminders':
            loadReminders();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

// Language switching setup
function setupLanguageSwitching() {
    const languageLinks = document.querySelectorAll('[data-lang]');
    
    languageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            changeLanguage(lang);
        });
    });
}

// Change application language
function changeLanguage(lang) {
    currentLanguage = lang;
    
    // Update document direction for RTL languages
    if (lang === 'ar' || lang === 'he') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.body.classList.add('rtl');
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.body.classList.remove('rtl');
    }
    
    // Load language-specific content
    loadLanguageContent(lang);
    
    // Store language preference
    localStorage.setItem('preferredLanguage', lang);
}

// Load language-specific content
function loadLanguageContent(lang) {
    // This would load translations from a language file
    // For now, we'll use a simple approach
    const translations = getTranslations(lang);
    
    // Update page titles and labels
    updatePageTranslations(translations);
}

// Get translations for a language
function getTranslations(lang) {
    const translations = {
        en: {
            dashboard: 'Dashboard',
            events: 'Events',
            payments: 'Payments',
            employees: 'Employees',
            reminders: 'Reminders',
            reports: 'Reports',
            totalEvents: 'Total Events',
            totalRevenue: 'Total Revenue',
            upcomingEvents: 'Upcoming Events',
            outstandingBalances: 'Outstanding Balances'
        },
        he: {
            dashboard: 'לוח בקרה',
            events: 'אירועים',
            payments: 'תשלומים',
            employees: 'עובדים',
            reminders: 'תזכורות',
            reports: 'דוחות',
            totalEvents: 'סה"כ אירועים',
            totalRevenue: 'סה"כ הכנסות',
            upcomingEvents: 'אירועים קרובים',
            outstandingBalances: 'יתרות לתשלום'
        },
        ar: {
            dashboard: 'لوحة التحكم',
            events: 'الفعاليات',
            payments: 'المدفوعات',
            employees: 'الموظفين',
            reminders: 'التذكيرات',
            reports: 'التقارير',
            totalEvents: 'إجمالي الفعاليات',
            totalRevenue: 'إجمالي الإيرادات',
            upcomingEvents: 'الفعاليات القادمة',
            outstandingBalances: 'الأرصدة المستحقة'
        }
    };
    
    return translations[lang] || translations.en;
}

// Update page translations
function updatePageTranslations(translations) {
    // Update navigation
    document.querySelectorAll('[data-page]').forEach(element => {
        const page = element.getAttribute('data-page');
        if (translations[page]) {
            const icon = element.querySelector('i');
            if (icon) {
                element.innerHTML = icon.outerHTML + ' ' + translations[page];
            }
        }
    });
    
    // Update page titles
    document.querySelectorAll('h1').forEach(h1 => {
        const key = h1.textContent.toLowerCase().replace(/\s+/g, '');
        if (translations[key]) {
            const icon = h1.querySelector('i');
            if (icon) {
                h1.innerHTML = icon.outerHTML + ' ' + translations[key];
            }
        }
    });
}

// Notifications setup
function setupNotifications() {
    // Load notifications from server
    loadNotifications();
    
    // Set up notification button
    const notificationsBtn = document.getElementById('notificationsBtn');
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showNotificationsPanel();
        });
    }
}

// Load notifications
async function loadNotifications() {
    try {
        const response = await fetch(`${API_BASE_URL}/notifications/history`);
        const data = await response.json();
        notifications = data.notifications || [];
        updateNotificationCount();
    } catch (error) {
        console.error('Failed to load notifications:', error);
    }
}

// Update notification count
function updateNotificationCount() {
    const countElement = document.getElementById('notificationCount');
    if (countElement) {
        const unreadCount = notifications.filter(n => n.status === 'unread').length;
        countElement.textContent = unreadCount;
        countElement.style.display = unreadCount > 0 ? 'inline' : 'none';
    }
}

// Show notifications panel
function showNotificationsPanel() {
    // Create and show notifications modal
    const modal = createNotificationsModal();
    document.body.appendChild(modal);
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// Create notifications modal
function createNotificationsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Notifications</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div id="notificationsList">
                        ${notifications.map(notification => `
                            <div class="notification-item p-3 border-bottom">
                                <div class="d-flex justify-content-between">
                                    <h6 class="mb-1">${notification.title}</h6>
                                    <small class="text-muted">${new Date(notification.sentAt).toLocaleDateString()}</small>
                                </div>
                                <p class="mb-1">${notification.message || ''}</p>
                                <small class="text-muted">${notification.type}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

// Event listeners setup
function setupEventListeners() {
    // Global event listeners
    document.addEventListener('click', function(e) {
        // Handle dynamic content clicks
        if (e.target.matches('[data-action]')) {
            handleActionClick(e.target);
        }
    });
    
    // Form submissions
    document.addEventListener('submit', function(e) {
        if (e.target.matches('form')) {
            e.preventDefault();
            handleFormSubmit(e.target);
        }
    });
}

// Handle action clicks
function handleActionClick(element) {
    const action = element.getAttribute('data-action');
    const id = element.getAttribute('data-id');
    
    switch (action) {
        case 'edit':
            handleEdit(id);
            break;
        case 'delete':
            handleDelete(id);
            break;
        case 'view':
            handleView(id);
            break;
    }
}

// Handle form submissions
function handleFormSubmit(form) {
    const formId = form.id;
    
    switch (formId) {
        case 'addEventForm':
            saveEvent();
            break;
        case 'addPaymentForm':
            savePayment();
            break;
        case 'addEmployeeForm':
            saveEmployee();
            break;
    }
}

// API utility functions
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
        showLoading();
        const response = await fetch(url, finalOptions);
        hideLoading();
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        hideLoading();
        showError(`API call failed: ${error.message}`);
        throw error;
    }
}

// Show loading spinner
function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = 'flex';
    }
}

// Hide loading spinner
function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

// Show error message
function showError(message) {
    // Create and show error toast
    const toast = createToast('Error', message, 'danger');
    showToast(toast);
}

// Show success message
function showSuccess(message) {
    // Create and show success toast
    const toast = createToast('Success', message, 'success');
    showToast(toast);
}

// Create toast notification
function createToast(title, message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <strong>${title}:</strong> ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    return toast;
}

// Show toast notification
function showToast(toast) {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    
    container.appendChild(toast);
    
    const bootstrapToast = new bootstrap.Toast(toast);
    bootstrapToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        container.removeChild(toast);
    });
}

// Format currency
function formatCurrency(amount, currency = 'ILS') {
    return new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Format date and time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Get status badge class
function getStatusBadgeClass(status) {
    const statusClasses = {
        'scheduled': 'badge-scheduled',
        'in-progress': 'badge-in-progress',
        'completed': 'badge-completed',
        'cancelled': 'badge-cancelled',
        'paid': 'badge-success',
        'partially_paid': 'badge-warning',
        'not_paid': 'badge-danger',
        'pending': 'badge-warning',
        'overdue': 'badge-danger'
    };
    
    return statusClasses[status] || 'badge-secondary';
}

// Start periodic updates
function startPeriodicUpdates() {
    // Update dashboard every 30 seconds
    setInterval(() => {
        if (currentPage === 'dashboard') {
            loadDashboard();
        }
    }, 30000);
    
    // Update notifications every minute
    setInterval(() => {
        loadNotifications();
    }, 60000);
}

// Handle edit action
function handleEdit(id) {
    // This will be implemented in specific page modules
    console.log('Edit item:', id);
}

// Handle delete action
function handleDelete(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        // This will be implemented in specific page modules
        console.log('Delete item:', id);
    }
}

// Handle view action
function handleView(id) {
    // This will be implemented in specific page modules
    console.log('View item:', id);
}

// Load initial page
function loadPage(page) {
    navigateToPage(page);
}

// Export functions for use in other modules
window.App = {
    apiCall,
    showLoading,
    hideLoading,
    showError,
    showSuccess,
    formatCurrency,
    formatDate,
    formatDateTime,
    getStatusBadgeClass,
    navigateToPage,
    changeLanguage
};