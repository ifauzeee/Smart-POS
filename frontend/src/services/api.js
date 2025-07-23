import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- User Routes ---
export const loginUser = (userData) => API.post('/users/login', userData);
export const createUser = (userData) => API.post('/users/register', userData);
export const getUsers = () => API.get('/users');
export const updateUser = (id, userData) => API.put(`/users/${id}`, userData);
export const deleteUser = (id) => API.delete(`/users/${id}`);

// --- Product Routes ---
export const getProducts = () => API.get('/products');
export const createProduct = (productData) => API.post('/products', productData);
export const updateProduct = (id, productData) => API.put(`/products/${id}`, productData);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

// --- Order Routes ---
export const createOrder = (orderData) => API.post('/orders', orderData);
export const getOrders = () => API.get('/orders');
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const deleteOrder = (id) => API.delete(`/orders/${id}`);
export const sendReceipt = (orderId, email) => API.post(`/orders/${orderId}/send-receipt`, { email });

// --- Analytics Routes ---
export const getAnalyticsSummary = () => API.get('/analytics/summary');
export const getLowStockProducts = () => API.get('/analytics/low-stock');

// --- Settings Routes ---
export const getEmailSettings = () => API.get('/settings/email');
export const saveEmailSettings = (settingsData) => API.post('/settings/email', settingsData);

// --- Category Routes ---
export const getCategories = () => API.get('/categories');
export const createCategory = (name) => API.post('/categories', { name });
export const deleteCategory = (id) => API.delete(`/categories/${id}`);
export const getSubCategories = (categoryId) => API.get(`/categories/${categoryId}/subcategories`);
export const createSubCategory = (categoryId, subCategoryData) => API.post(`/categories/${categoryId}/subcategories`, subCategoryData);
export const deleteSubCategory = (id) => API.delete(`/categories/subcategories/${id}`);

// --- Supplier Routes ---
export const getSuppliers = () => API.get('/suppliers');
export const createSupplier = (supplierData) => API.post('/suppliers', supplierData);
export const updateSupplier = (id, supplierData) => API.put(`/suppliers/${id}`, supplierData);
export const deleteSupplier = (id) => API.delete(`/suppliers/${id}`);

export default API;