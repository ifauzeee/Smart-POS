import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 30000,
});

// Request Interceptor
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (import.meta.env.DEV && import.meta.env.VITE_LOG_LEVEL === 'debug') {
            console.log(`Request: ${config.method.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error) => {
        if (import.meta.env.DEV && import.meta.env.VITE_LOG_LEVEL === 'debug') {
            console.error(`Request error: ${error.config?.method.toUpperCase()} ${error.config?.url} - ${error.message}`);
        }
        return Promise.reject({ message: error.message, code: 'REQUEST_ERROR', status: null });
    }
);

// Response Interceptor
API.interceptors.response.use(
    (response) => {
        if (import.meta.env.DEV && import.meta.env.VITE_LOG_LEVEL === 'debug') {
            console.log(`Response: ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
        }
        return response;
    },
    (error) => {
        if (import.meta.env.DEV && import.meta.env.VITE_LOG_LEVEL === 'debug') {
            console.error(`Response error: ${error.response?.config?.method.toUpperCase()} ${error.response?.config?.url} - ${error.response?.status || 'No status'} - ${error.message}`);
        }
        const errorResponse = {
            message: 'An unexpected error occurred.',
            code: 'UNKNOWN',
            status: null,
        };
        if (axios.isCancel(error)) {
            errorResponse.message = 'Request was canceled.';
            errorResponse.code = 'CANCELLED';
        } else if (error.code === 'ECONNABORTED') {
            errorResponse.message = 'Connection timeout. Please ensure the backend is running and connected.';
            errorResponse.code = 'TIMEOUT';
        } else if (error.response) {
            errorResponse.status = error.response.status;
            switch (error.response.status) {
                case 401:
                    errorResponse.message = 'Unauthorized access. Please log in again.';
                    errorResponse.code = 'UNAUTHORIZED';
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    break;
                case 403:
                    errorResponse.message = 'Access forbidden. You lack the necessary permissions.';
                    errorResponse.code = 'FORBIDDEN';
                    break;
                case 429:
                    errorResponse.message = 'Too many requests. Please try again later.';
                    errorResponse.code = 'RATE_LIMIT';
                    break;
                default:
                    errorResponse.message = error.response.data?.message || 'Server error occurred.';
                    errorResponse.code = 'SERVER_ERROR';
            }
        } else if (error.request) {
            errorResponse.message = 'No response from server. The server may not be running.';
            errorResponse.code = 'NO_RESPONSE';
        }
        return Promise.reject(errorResponse);
    }
);

/**
 * Creates query parameters from an object, handling strings, numbers, dates, arrays, and nested objects.
 * @param {Object} params - Parameters to convert to query string.
 * @returns {string} - URL-encoded query string.
 */
const createQueryParams = (params = {}) => {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined) continue;
        if (Array.isArray(value)) {
            value.forEach((item) => searchParams.append(key, String(item)));
        } else if (value instanceof Date && !isNaN(value)) {
            searchParams.append(key, value.toISOString());
        } else if (typeof value === 'object') {
            searchParams.append(key, JSON.stringify(value));
        } else if (typeof value === 'string' || typeof value === 'number') {
            searchParams.append(key, String(value));
        }
    }
    return searchParams.toString();
};

// --- API Services ---
/**
 * Authenticates a user and returns a token.
 * @param {Object} userData - { email: string, password: string }
 * @returns {Promise} - Axios response with token.
 */
export const login = (userData) => API.post('/users/login', userData);

/**
 * Registers a new admin user.
 * @param {Object} userData - { email: string, password: string, name: string, ... }
 * @returns {Promise} - Axios response with user data.
 */
export const registerAdmin = (userData) => API.post('/users/register', userData);

/**
 * Creates a new user by admin.
 * @param {Object} userData - { email: string, password: string, name: string, roleId: string, ... }
 * @returns {Promise} - Axios response with user data.
 */
export const createUserByAdmin = (userData) => API.post('/users', userData);

export const getUsers = () => API.get('/users');
export const updateUser = (id, userData) => API.put(`/users/${id}`, userData);
export const deleteUser = (id) => API.delete(`/users/${id}`);
export const forgotPassword = (data) => API.post('/users/forgot-password', data);
export const resetPassword = (token, data) => API.post(`/users/reset-password/${token}`, data);
export const getRoles = () => API.get('/roles');
export const getRoleById = (id) => API.get(`/roles/${id}`);
export const createRole = (roleData) => API.post('/roles', roleData);
export const updateRole = (id, roleData) => API.put(`/roles/${id}`, roleData);
export const deleteRole = (id) => API.delete(`/roles/${id}`);
export const getPermissions = () => API.get('/roles/permissions');
export const getProducts = (params = {}) => API.get(`/products?${createQueryParams(params)}`);
export const getProductById = (id) => API.get(`/products/${id}`);
export const createProduct = (productData) => API.post('/products', productData);
export const updateProduct = (id, productData) => API.put(`/products/${id}`, productData);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const receiveStock = (submissionData) => API.post('/products/receive-stock', submissionData);
export const adjustStock = (adjustmentData) => API.post('/stock/adjust', adjustmentData);
export const createOrder = (orderData) => API.post('/orders', orderData);
export const getOrders = (startDate, endDate) => API.get(`/orders?${createQueryParams({ startDate, endDate })}`);
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const deleteOrder = (id) => API.delete(`/orders/${id}`);
export const sendReceipt = (orderId, email) => API.post(`/orders/${orderId}/send-receipt`, { email });
export const clearOrderHistory = () => API.delete('/orders/clear-history');
export const exportOrders = (startDate, endDate) => API.get(`/orders/export?${createQueryParams({ startDate, endDate })}`, { responseType: 'blob' });
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
export const getEmailSettings = () => API.get('/settings/email');
export const saveEmailSettings = (settingsData) => API.post('/settings/email', settingsData);
export const getRevenueTarget = () => API.get('/settings/revenue-target');
export const saveRevenueTarget = (targetData) => API.post('/settings/revenue-target', targetData);
export const getBusinessSettings = () => API.get('/settings/business');
export const saveBusinessSettings = (settingsData) => API.post('/settings/business', settingsData);
export const getCategories = () => API.get('/categories');
export const createCategory = (name) => API.post('/categories', { name });
export const deleteCategory = (id) => API.delete(`/categories/${id}`);
export const getSubCategories = (categoryId) => API.get(`/categories/${categoryId}/subcategories`);
export const createSubCategory = (categoryId, subCategoryData) => API.post(`/categories/${categoryId}/subcategories`, subCategoryData);
export const deleteSubCategory = (id) => API.delete(`/categories/subcategories/${id}`);
export const getSuppliers = () => API.get('/suppliers');
export const createSupplier = (supplierData) => API.post('/suppliers', supplierData);
export const updateSupplier = (id, supplierData) => API.put(`/suppliers/${id}`, supplierData);
export const deleteSupplier = (id) => API.delete(`/suppliers/${id}`);
export const getCustomers = (searchTerm = '') => API.get(`/customers?search=${searchTerm}`);
export const getCustomerById = (id) => API.get(`/customers/${id}`);
export const getCustomerHistory = (id) => API.get(`/customers/${id}/history`);
export const getCustomerStats = (id) => API.get(`/customers/${id}/stats`);
export const redeemCustomerPoints = (id, data) => API.post(`/customers/${id}/redeem`, data);
export const createCustomer = (customerData) => API.post('/customers', customerData);
export const updateCustomer = (id, customerData) => API.put(`/customers/${id}`, customerData);
export const deleteCustomer = (id) => API.delete(`/customers/${id}`);
export const getExpenses = () => API.get('/expenses');
export const createExpense = (expenseData) => API.post('/expenses', expenseData);
export const updateExpense = (id, expenseData) => API.put(`/expenses/${id}`, expenseData);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);
export const getPromotions = () => API.get('/promotions');
export const getPromotionById = (id) => API.get(`/promotions/${id}`);
export const createPromotion = (promoData) => API.post('/promotions', promoData);
export const updatePromotion = (id, promoData) => API.put(`/promotions/${id}`, promoData);
export const deletePromotion = (id) => API.delete(`/promotions/${id}`);
export const validateCoupon = (code) => API.get(`/promotions/validate/${code}`);
export const getCurrentShift = () => API.get('/shifts/current');
export const startShift = (data = {}) => API.post('/shifts/start', data);
export const closeShift = (id, data) => API.post(`/shifts/close/${id}`, data);
export const getShiftHistory = () => API.get('/shifts/history');
export const deleteShift = (id) => API.delete(`/shifts/${id}`);
export const clearShiftHistory = () => API.delete('/shifts/clear-history');
export const exportShiftHistory = () => API.get('/shifts/export', { responseType: 'blob' });
export const getPurchaseOrders = () => API.get('/purchase-orders');
export const createPurchaseOrder = (poData) => API.post('/purchase-orders', poData);
export const updatePurchaseOrderStatus = (id, status) => API.patch(`/purchase-orders/${id}/status`, { status });
export const getPurchaseOrderById = (id) => API.get(`/purchase-orders/${id}`);
export const getRawMaterials = () => API.get('/raw-materials');
export const createRawMaterial = (materialData) => API.post('/raw-materials', materialData);
export const updateRawMaterial = (id, materialData) => API.put(`/raw-materials/${id}`, materialData);
export const deleteRawMaterial = (id) => API.delete(`/raw-materials/${id}`);
export const uploadImage = (formData) => API.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});
export const getRewards = () => API.get('/rewards');
export const createReward = (rewardData) => API.post('/rewards', rewardData);
export const updateReward = (id, rewardData) => API.put(`/rewards/${id}`, rewardData);
export const deleteReward = (id) => API.delete(`/rewards/${id}`);
export const redeemRewardForCustomer = (customerId, rewardId) => API.post(`/customers/${customerId}/redeem-reward`, { reward_id: rewardId });

export default API;