/**
 * API utility for communicating with the Node.js backend.
 * All requests go through the Vite proxy → Node.js server.
 */

const rawApiUrl = import.meta.env.VITE_API_URL;
const API_BASE = rawApiUrl
  ? `${rawApiUrl.replace(/\/$/, '')}/api`
  : '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('finguide_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('finguide_token', token);
    } else {
      localStorage.removeItem('finguide_token');
    }
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(method, path, body = null) {
    const options = {
      method,
      headers: this.getHeaders(),
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${path}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed: ${response.status}`);
    }

    return data;
  }

  async upload(path, file, fieldName = 'statement') {
    const formData = new FormData();
    formData.append(fieldName, file);

    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  }

  // ── Auth & Security ──
  register(email, name, password) {
    return this.request('POST', '/auth/register', { email, name, password });
  }

  requestRegisterOTP(email, name, password) {
    return this.request('POST', '/auth/register/request-otp', { email, name, password });
  }

  verifyRegisterOTP(email, name, password, otp) {
    return this.request('POST', '/auth/register/verify', { email, name, password, otp });
  }

  checkLoginStatus(email = '') {
    return this.request('GET', `/auth/login-status${email ? `?email=${encodeURIComponent(email)}` : ''}`);
  }

  login(email, password) {
    return this.request('POST', '/auth/login', { email, password });
  }

  requestPasswordResetOTP(email) {
    return this.request('POST', '/auth/password-reset/request-otp', { email });
  }

  verifyPasswordResetOTP(email, otp, newPassword) {
    return this.request('POST', '/auth/password-reset/verify', { email, otp, new_password: newPassword });
  }

  resetPassword(email, newPassword) {
    return this.request('POST', '/auth/reset-password', { email, new_password: newPassword });
  }

  requestPasswordChangeOTP(currentPassword) {
    return this.request('POST', '/auth/password-change/request-otp', { current_password: currentPassword });
  }

  verifyPasswordChangeOTP(currentPassword, newPassword, otp) {
    return this.request('POST', '/auth/password-change/verify', { current_password: currentPassword, new_password: newPassword, otp });
  }

  getSecurityLogs(limit = 20) {
    return this.request('GET', `/auth/security-logs?limit=${limit}`);
  }

  getProfile() {
    return this.request('GET', '/auth/me');
  }

  updateProfile(name, currency) {
    return this.request('PUT', '/auth/profile', { name, currency });
  }

  changePassword(currentPassword, newPassword) {
    return this.request('PUT', '/auth/password', { current_password: currentPassword, new_password: newPassword });
  }

  getDataSummary() {
    return this.request('GET', '/auth/data-summary');
  }

  exportAllData() {
    return this.request('GET', '/auth/export-data');
  }

  clearTransactions() {
    return this.request('POST', '/auth/clear-transactions');
  }

  clearSnapshots() {
    return this.request('POST', '/auth/clear-snapshots');
  }

  deleteAccount(password) {
    return this.request('DELETE', '/auth/account', { password });
  }

  // ── I&E Snapshots ──
  getSnapshots(year, month) {
    let path = '/ie/snapshots';
    const params = [];
    if (year) params.push(`year=${year}`);
    if (month) params.push(`month=${month}`);
    if (params.length) path += `?${params.join('&')}`;
    return this.request('GET', path);
  }

  createSnapshot(data) {
    return this.request('POST', '/ie/snapshots', data);
  }

  deleteSnapshot(id) {
    return this.request('DELETE', `/ie/snapshots/${id}`);
  }

  // ── Transactions ──
  getTransactions(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, v);
    });
    const qs = params.toString();
    return this.request('GET', `/transactions${qs ? '?' + qs : ''}`);
  }

  addTransaction(data) {
    return this.request('POST', '/transactions', data);
  }

  uploadStatement(file) {
    return this.upload('/transactions/upload', file);
  }

  parseStatement(file) {
    return this.upload('/transactions/parse', file);
  }

  confirmStatement(data) {
    return this.request('POST', '/transactions/confirm', data);
  }

  getTransactionSummary(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    const qs = params.toString();
    return this.request('GET', `/transactions/summary${qs ? '?' + qs : ''}`);
  }

  deleteTransaction(id) {
    return this.request('DELETE', `/transactions/${id}`);
  }

  // ── Goals ──
  getGoals() {
    return this.request('GET', '/goals');
  }

  createGoal(data) {
    return this.request('POST', '/goals', data);
  }

  updateGoal(id, data) {
    return this.request('PUT', `/goals/${id}`, data);
  }

  deleteGoal(id) {
    return this.request('DELETE', `/goals/${id}`);
  }

  // ── Agent (AI) ──
  analyze(data = {}) {
    return this.request('POST', '/agent/analyze', data);
  }

  chat(message, conversationHistory = []) {
    return this.request('POST', '/agent/chat', {
      message,
      conversation_history: conversationHistory,
    });
  }

  reactChat(message, conversationHistory = []) {
    return this.request('POST', '/agent/react', {
      message,
      conversation_history: conversationHistory,
    });
  }

  approveHitlAction(tool, data) {
    return this.request('POST', '/agent/hitl/approve', { tool, data });
  }

  getBudgetProposal() {
    return this.request('POST', '/agent/budget', {});
  }

  getForecast(monthsAhead = 3) {
    return this.request('POST', '/agent/forecast', { months_ahead: monthsAhead });
  }

  getTimeSeriesForecast(params = {}) {
    const { history, monthsAhead = 2, modelType = 'auto' } = params;
    return this.request('POST', '/agent/time-series-forecast', {
      history,
      months_ahead: monthsAhead,
      model_type: modelType,
    });
  }

  // ── Guest ──
  guestAnalyze(incomeData, expenseData, transactions = [], query = '') {
    return this.request('POST', '/guest/analyze', {
      income_data: incomeData,
      expense_data: expenseData,
      transactions,
      query,
    });
  }

  guestParseStatement(file) {
    return this.upload('/guest/parse', file);
  }

  // ── Health ──
  healthCheck() {
    return this.request('GET', '/health');
  }
}

export const api = new ApiClient();
