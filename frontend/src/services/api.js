// frontend/src/services/api.js

import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 30000, // Tetapkan di 30 detik. Jangan naikkan kecuali sudah yakin backend responsif.
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Log requests for debugging
    console.log('Sending request:', config.method, config.url, config.data); 
    return config;
}, (error) => {
    // Log request errors
    console.error('Request error:', error.config?.method, error.config?.url, error.message); 
    return Promise.reject(error);
});

// Add a response interceptor to log responses and handle common errors
API.interceptors.response.use(
    (response) => {
        console.log('Received response:', response.config.method, response.config.url, response.status, response.data); 
        return response;
    },
    (error) => {
        console.error('Response error:', error.response?.config?.method, error.response?.config?.url, error.response?.status, error.message); 
        if (error.code === 'ECONNABORTED') {
            return Promise.reject(new Error('Koneksi timeout. Pastikan backend berjalan dan terhubung dengan benar.')); 
        }
        if (error.response) {
            // Server responded with a status other than 2xx
            // The `error.response.data.message` is the custom error message from your backend
            return Promise.reject(error.response); 
        } else if (error.request) {
            // Request was made but no response was received
            return Promise.reject(new Error('Tidak ada respons dari server. Server mungkin tidak berjalan.')); 
        } else {
            // Something happened in setting up the request that triggered an Error
            return Promise.reject(new Error('Terjadi kesalahan saat menyiapkan permintaan.')); 
        }
    }
);


// User Routes
export const loginUser = (userData) => API.post('/users/login', userData); 
export const createUser = (userData) => API.post('/users/register', userData); 
export const createUserByAdmin = (userData) => API.post('/users', userData); 
export const getUsers = () => API.get('/users'); 
export const updateUser = (id, userData) => API.put(`/users/${id}`, userData); 
export const deleteUser = (id) => API.delete(`/users/${id}`); 
export const forgotPassword = (data) => API.post('/users/forgot-password', data); 
export const resetPassword = (token, data) => API.post(`/users/reset-password/${token}`, data); 

// Product Routes
export const getProducts = (barcode = '') => { 
    const params = new URLSearchParams(); 
    if (barcode) { 
        params.append('barcode', barcode); 
    }
    return API.get(`/products?${params.toString()}`); 
};
export const getProductById = (id) => API.get(`/products/${id}`); 
export const createProduct = (productData) => API.post('/products', productData); 
export const updateProduct = (id, productData) => API.put(`/products/${id}`, productData);
export const deleteProduct = (id) => API.delete(`/products/${id}`); 
export const receiveStock = (stockData) => API.post('/products/receive-stock', stockData); 

// Order Routes
export const createOrder = (orderData) => API.post('/orders', orderData); 
export const getOrders = (startDate, endDate) => { 
    const params = new URLSearchParams(); 
    if (startDate instanceof Date && !isNaN(startDate)) params.append('startDate', startDate.toISOString()); 
    if (endDate instanceof Date && !isNaN(endDate)) params.append('endDate', endDate.toISOString()); 
    return API.get(`/orders?${params.toString()}`); 
};
export const getOrderById = (id) => API.get(`/orders/${id}`); 
export const deleteOrder = (id) => API.delete(`/orders/${id}`); 
export const sendReceipt = (orderId, email) => API.post(`/orders/${orderId}/send-receipt`, { email }); 
export const clearOrderHistory = () => API.delete('/orders/clear-history'); 
export const exportOrders = (startDate, endDate) => { 
    const params = new URLSearchParams(); 
    if (startDate instanceof Date && !isNaN(startDate)) params.append('startDate', startDate.toISOString()); 
    if (endDate instanceof Date && !isNaN(endDate)) params.append('endDate', endDate.toISOString()); 
    return API.get(`/orders/export?${params.toString()}`, { responseType: 'blob' }); 
};

// Analytics Routes
export const getStats = (startDate, endDate) => { 
    const params = new URLSearchParams(); 
    if (startDate instanceof Date && !isNaN(startDate)) params.append('startDate', startDate.toISOString()); 
    if (endDate instanceof Date && !isNaN(endDate)) params.append('endDate', endDate.toISOString()); 
    return API.get(`/analytics/stats?${params.toString()}`); 
};
export const getDailySales = (startDate, endDate) => { 
    const params = new URLSearchParams(); 
    if (startDate instanceof Date && !isNaN(startDate)) params.append('startDate', startDate.toISOString()); 
    if (endDate instanceof Date && !isNaN(endDate)) params.append('endDate', endDate.toISOString()); 
    return API.get(`/analytics/daily-sales?${params.toString()}`); 
};
export const getTopProducts = (startDate, endDate) => { 
    const params = new URLSearchParams(); 
    if (startDate instanceof Date && !isNaN(startDate)) params.append('startDate', startDate.toISOString()); 
    if (endDate instanceof Date && !isNaN(endDate)) params.append('endDate', endDate.toISOString()); 
    return API.get(`/analytics/top-products?${params.toString()}`); 
};
export const getProductSalesPerformance = (startDate, endDate) => { 
    const params = new URLSearchParams(); 
    if (startDate instanceof Date && !isNaN(startDate)) params.append('startDate', startDate.toISOString()); 
    if (endDate instanceof Date && !isNaN(endDate)) params.append('endDate', endDate.toISOString()); 
    return API.get(`/analytics/product-sales-performance?${params.toString()}`); 
};
export const getTopRevenueProducts = (startDate, endDate) => { 
    const params = new URLSearchParams(); 
    if (startDate instanceof Date && !isNaN(startDate)) params.append('startDate', startDate.toISOString()); 
    if (endDate instanceof Date && !isNaN(endDate)) params.append('endDate', endDate.toISOString()); 
    return API.get(`/analytics/top-revenue-products?${params.toString()}`); 
};
export const getHourlySales = (startDate, endDate) => { 
    const params = new URLSearchParams(); 
    if (startDate instanceof Date && !isNaN(startDate)) params.append('startDate', startDate.toISOString()); 
    if (endDate instanceof Date && !isNaN(endDate)) params.append('endDate', endDate.toISOString()); 
    return API.get(`/analytics/hourly-sales?${params.toString()}`); 
};
export const getStaleProducts = (days = 30) => API.get(`/analytics/stale-products?days=${days}`); 
export const getExpiredProducts = (days = 30) => API.get(`/analytics/expired-products?days=${days}`); 
export const getLowMarginProducts = () => API.get(`/analytics/low-margin-products`); 
export const getTopCustomers = (startDate, endDate) => { 
    const params = new URLSearchParams(); 
    if (startDate instanceof Date && !isNaN(startDate)) params.append('startDate', startDate.toISOString()); 
    if (endDate instanceof Date && !isNaN(endDate)) params.append('endDate', endDate.toISOString()); 
    return API.get(`/analytics/top-customers?${params.toString()}`); 
};
export const getCashierPerformance = (startDate, endDate) => { 
    const params = new URLSearchParams(); 
    if (startDate instanceof Date && !isNaN(startDate)) params.append('startDate', startDate.toISOString()); 
    if (endDate instanceof Date && !isNaN(endDate)) params.append('endDate', endDate.toISOString());
    return API.get(`/analytics/cashier-performance?${params.toString()}`); 
};
export const getRecentSuppliers = (limit = 5) => API.get(`/analytics/recent-suppliers?limit=${limit}`); 
export const getActivityLogs = (limit = 5) => API.get(`/analytics/activity-logs?limit=${limit}`); 
export const getInsights = (startDate, endDate) => { 
    const params = new URLSearchParams(); 
    if (startDate instanceof Date && !isNaN(startDate)) params.append('startDate', startDate.toISOString()); 
    if (endDate instanceof Date && !isNaN(endDate)) params.append('endDate', endDate.toISOString()); 
    return API.get(`/analytics/insights?${params.toString()}`); 
};
export const getNotifications = (startDate, endDate) => { 
    const params = new URLSearchParams(); 
    if (startDate instanceof Date && !isNaN(startDate)) params.append('startDate', startDate.toISOString()); 
    if (endDate instanceof Date && !isNaN(endDate)) params.append('endDate', endDate.toISOString()); 
    return API.get(`/analytics/notifications?${params.toString()}`); 
};
export const getStockInfo = () => API.get('/analytics/stock-info'); 

// Settings Routes
export const getEmailSettings = () => API.get('/settings/email'); 
export const saveEmailSettings = (settingsData) => API.post('/settings/email', settingsData); 
export const getRevenueTarget = () => API.get('/settings/revenue-target'); 
export const saveRevenueTarget = (targetData) => API.post('/settings/revenue-target', targetData); 
export const getBusinessSettings = () => API.get('/settings/business'); 
export const saveBusinessSettings = (settingsData) => API.post('/settings/business', settingsData); 

// Category Routes
export const getCategories = () => API.get('/categories'); 
export const createCategory = (name) => API.post('/categories', { name }); 
export const deleteCategory = (id) => API.delete(`/categories/${id}`); 
export const getSubCategories = (categoryId) => API.get(`/categories/${categoryId}/subcategories`); 
export const createSubCategory = (categoryId, subCategoryData) => API.post(`/categories/${categoryId}/subcategories`, subCategoryData); 
export const deleteSubCategory = (id) => API.delete(`/categories/subcategories/${id}`); 
// Supplier Routes
export const getSuppliers = () => API.get('/suppliers'); 
export const createSupplier = (supplierData) => API.post('/suppliers', supplierData); 
export const updateSupplier = (id, supplierData) => API.put(`/suppliers/${id}`, supplierData); 
export const deleteSupplier = (id) => API.delete(`/suppliers/${id}`); 

// Customer Routes
export const getCustomers = (searchTerm = '') => API.get(`/customers?search=${searchTerm}`); 
export const getCustomerById = (id) => API.get(`/customers/${id}`); 
export const getCustomerHistory = (id) => API.get(`/customers/${id}/history`); 
export const redeemCustomerPoints = (id, data) => API.post(`/customers/${id}/redeem`, data); 
export const createCustomer = (customerData) => API.post('/customers', customerData); 
export const updateCustomer = (id, customerData) => API.put(`/customers/${id}`, customerData); 
export const deleteCustomer = (id) => API.delete(`/customers/${id}`); 

// Image Upload Route
export const uploadImage = (formData) => API.post('/upload/image', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' }, 
});

// Expense Routes
export const getExpenses = () => API.get('/expenses'); 
export const createExpense = (expenseData) => API.post('/expenses', expenseData); 
export const updateExpense = (id, expenseData) => API.put(`/expenses/${id}`, expenseData); 
export const deleteExpense = (id) => API.delete(`/expenses/${id}`); 

// Stock Routes
export const adjustStock = (adjustmentData) => API.post('/stock/adjust', adjustmentData); 

// Promotion Routes
export const getPromotions = () => API.get('/promotions'); 
export const getPromotionById = (id) => API.get(`/promotions/${id}`); 
export const createPromotion = (promoData) => API.post('/promotions', promoData); 
export const updatePromotion = (id, promoData) => API.put(`/promotions/${id}`, promoData); 
export const deletePromotion = (id) => API.delete(`/promotions/${id}`); 
export const validateCoupon = (code) => API.get(`/promotions/validate/${code}`); 

// Report Routes
export const getSalesReportPdf = (params) => { 
    return API.get('/reports/sales-summary', { 
        params, 
        responseType: 'blob', 
    });
};

// Shift Routes
export const getCurrentShift = () => API.get('/shifts/current'); 
export const startShift = (data) => API.post('/shifts/start', data); 
export const closeShift = (id, data) => API.post(`/shifts/close/${id}`, data); 
export const getShiftHistory = () => API.get('/shifts/history'); 
export const deleteShift = (id) => API.delete(`/shifts/${id}`); 
export default API;