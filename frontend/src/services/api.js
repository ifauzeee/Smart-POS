import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 30000,
});

// Request Interceptor
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) {
        console.log('Sending request:', config.method?.toUpperCase(), config.url, config.data);
    }
    return config;
}, (error) => {
    if (import.meta.env.DEV) {
        console.error('Request error:', error.config?.method?.toUpperCase(), error.config?.url, error.message);
    }
    return Promise.reject(error);
});

// Response Interceptor
API.interceptors.response.use(
    (response) => {
        if (import.meta.env.DEV) {
            console.log('Received response:', response.config.method?.toUpperCase(), response.config.url, response.status, response.data);
        }
        return response;
    },
    (error) => {
        if (import.meta.env.DEV) {
            console.error('Response error:', error.response?.config?.method?.toUpperCase(), error.response?.config?.url, error.response?.status, error.message);
        }
        if (axios.isCancel(error)) {
            return Promise.reject(new Error('Request was canceled.'));
        }
        if (error.code === 'ECONNABORTED') {
            return Promise.reject(new Error('Connection timeout. Please ensure the backend is running and connected.'));
        }
        if (error.response) {
            return Promise.reject(error.response);
        }
        if (error.request) {
            return Promise.reject(new Error('No response from server. The server may not be running.'));
        }
        return Promise.reject(new Error('An unexpected error occurred.'));
    }
);

const createQueryParams = (params = {}) => {
    const searchParams = new URLSearchParams();
    for (const key in params) {
        const value = params[key];
        if (value instanceof Date && !isNaN(value)) {
            searchParams.append(key, value.toISOString());
        } else if (value !== null && value !== undefined) {
            searchParams.append(key, value);
        }
    }
    return searchParams.toString();
};

// --- API Services ---

// User & Auth
export const login = (userData) => API.post('/users/login', userData);
export const registerAdmin = (userData) => API.post('/users/register', userData);
export const createUserByAdmin = (userData) => API.post('/users', userData);
export const getUsers = () => API.get('/users');
export const updateUser = (id, userData) => API.put(`/users/${id}`, userData);
export const deleteUser = (id) => API.delete(`/users/${id}`);
export const forgotPassword = (data) => API.post('/users/forgot-password', data);
export const resetPassword = (token, data) => API.post(`/users/reset-password/${token}`, data);

// Roles & Permissions
export const getRoles = () => API.get('/roles');
export const getRoleById = (id) => API.get(`/roles/${id}`);
export const createRole = (roleData) => API.post('/roles', roleData);
export const updateRole = (id, roleData) => API.put(`/roles/${id}`, roleData);
export const deleteRole = (id) => API.delete(`/roles/${id}`);
export const getPermissions = () => API.get('/roles/permissions');

// Products & Inventory
export const getProducts = (params = {}) => API.get(`/products?${createQueryParams(params)}`);
export const getProductById = (id) => API.get(`/products/${id}`);
export const createProduct = (productData) => API.post('/products', productData);
export const updateProduct = (id, productData) => API.put(`/products/${id}`, productData);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const receiveStock = (submissionData) => API.post('/products/receive-stock', submissionData);
export const adjustStock = (adjustmentData) => API.post('/stock/adjust', adjustmentData);

// Orders
export const createOrder = (orderData) => API.post('/orders', orderData);
export const getOrders = (startDate, endDate) => API.get(`/orders?${createQueryParams({ startDate, endDate })}`);
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const deleteOrder = (id) => API.delete(`/orders/${id}`);
export const sendReceipt = (orderId, email) => API.post(`/orders/${orderId}/send-receipt`, { email });
export const clearOrderHistory = () => API.delete('/orders/clear-history');
export const exportOrders = (startDate, endDate) => API.get(`/orders/export?${createQueryParams({ startDate, endDate })}`, { responseType: 'blob' });

// Analytics & Reports
export const getStats = (startDate, endDate, compareStartDate, compareEndDate) => API.get(`/analytics/stats?${createQueryParams({ startDate, endDate, compareStartDate, compareEndDate })}`);
export const getDailySales = (startDate, endDate) => API.get(`/analytics/daily-sales?${createQueryParams({ startDate, endDate })}`);
export const getTopProducts = (startDate, endDate) => API.get(`/analytics/top-products?${createQueryParams({ startDate, endDate })}`);
export const getProductSalesPerformance = (startDate, endDate) => API.get(`/analytics/product-sales-performance?${createQueryParams({ startDate, endDate })}`);
export const getTopCustomers = (startDate, endDate) => API.get(`/analytics/top-customers?${createQueryParams({ startDate, endDate })}`);
export const getCashierPerformance = (startDate, endDate) => API.get(`/analytics/cashier-performance?${createQueryParams({ startDate, endDate })}`);
export const getRecentSuppliers = (limit = 5) => API.get(`/analytics/recent-suppliers?limit=${limit}`);
export const getInsights = (startDate, endDate) => API.get(`/analytics/insights?${createQueryParams({ startDate, endDate })}`);
export const getNotifications = () => API.get('/analytics/notifications');
export const getStockInfo = () => API.get('/analytics/stock-info');
export const getStaleProducts = (days = 30) => API.get(`/analytics/stale-products?days=${days}`);
export const getExpiredProducts = (days = 30) => API.get(`/analytics/expired-products?days=${days}`);
export const getDailyRevenueProfit = (startDate, endDate) => API.get(`/analytics/daily-revenue-profit?${createQueryParams({ startDate, endDate })}`);
export const getProductProfitabilityReport = (params) => API.get('/analytics/product-profitability', { params });
export const exportSalesSummaryPDF = (startDate, endDate) => API.get(`/reports/sales-summary?${createQueryParams({ startDate, endDate })}`, {
    responseType: 'blob',
});

// Settings
export const getEmailSettings = () => API.get('/settings/email');
export const saveEmailSettings = (settingsData) => API.post('/settings/email', settingsData);
export const getRevenueTarget = () => API.get('/settings/revenue-target');
export const saveRevenueTarget = (targetData) => API.post('/settings/revenue-target', targetData);
export const getBusinessSettings = () => API.get('/settings/business');
export const saveBusinessSettings = (settingsData) => API.post('/settings/business', settingsData);

// Categories
export const getCategories = () => API.get('/categories');
export const createCategory = (name) => API.post('/categories', { name });
export const deleteCategory = (id) => API.delete(`/categories/${id}`);
export const getSubCategories = (categoryId) => API.get(`/categories/${categoryId}/subcategories`);
export const createSubCategory = (categoryId, subCategoryData) => API.post(`/categories/${categoryId}/subcategories`, subCategoryData);
export const deleteSubCategory = (id) => API.delete(`/categories/subcategories/${id}`);

// Suppliers
export const getSuppliers = () => API.get('/suppliers');
export const createSupplier = (supplierData) => API.post('/suppliers', supplierData);
export const updateSupplier = (id, supplierData) => API.put(`/suppliers/${id}`, supplierData);
export const deleteSupplier = (id) => API.delete(`/suppliers/${id}`);

// Customers
export const getCustomers = (searchTerm = '') => API.get(`/customers?search=${searchTerm}`);
export const getCustomerById = (id) => API.get(`/customers/${id}`);
export const getCustomerHistory = (id) => API.get(`/customers/${id}/history`);
export const getCustomerStats = (id) => API.get(`/customers/${id}/stats`); // PERBAIKAN: Menambahkan fungsi yang hilang
export const redeemCustomerPoints = (id, data) => API.post(`/customers/${id}/redeem`, data);
export const createCustomer = (customerData) => API.post('/customers', customerData);
export const updateCustomer = (id, customerData) => API.put(`/customers/${id}`, customerData);
export const deleteCustomer = (id) => API.delete(`/customers/${id}`);

// Expenses
export const getExpenses = () => API.get('/expenses');
export const createExpense = (expenseData) => API.post('/expenses', expenseData);
export const updateExpense = (id, expenseData) => API.put(`/expenses/${id}`, expenseData);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);

// Promotions
export const getPromotions = () => API.get('/promotions');
export const getPromotionById = (id) => API.get(`/promotions/${id}`);
export const createPromotion = (promoData) => API.post('/promotions', promoData);
export const updatePromotion = (id, promoData) => API.put(`/promotions/${id}`, promoData);
export const deletePromotion = (id) => API.delete(`/promotions/${id}`);
export const validateCoupon = (code) => API.get(`/promotions/validate/${code}`);

// Shifts
export const getCurrentShift = () => API.get('/shifts/current');
export const startShift = (data = {}) => API.post('/shifts/start', data);
export const closeShift = (id, data) => API.post(`/shifts/close/${id}`, data);
export const getShiftHistory = () => API.get('/shifts/history');
export const deleteShift = (id) => API.delete(`/shifts/${id}`);
export const clearShiftHistory = () => API.delete('/shifts/clear-history');
export const exportShiftHistory = () => API.get('/shifts/export', { responseType: 'blob' });

// Purchase Orders
export const getPurchaseOrders = () => API.get('/purchase-orders');
export const createPurchaseOrder = (poData) => API.post('/purchase-orders', poData);
export const updatePurchaseOrderStatus = (id, status) => API.patch(`/purchase-orders/${id}/status`, { status });
export const getPurchaseOrderById = (id) => API.get(`/purchase-orders/${id}`);

// Raw Materials
export const getRawMaterials = () => API.get('/raw-materials');
export const createRawMaterial = (materialData) => API.post('/raw-materials', materialData);
export const updateRawMaterial = (id, materialData) => API.put(`/raw-materials/${id}`, materialData);
export const deleteRawMaterial = (id) => API.delete(`/raw-materials/${id}`);

// Utility
export const uploadImage = (formData) => API.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});

export default API;