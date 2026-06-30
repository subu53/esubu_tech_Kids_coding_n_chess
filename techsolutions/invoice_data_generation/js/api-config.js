window.InvoiceAI = window.InvoiceAI || {};

window.InvoiceAI.ApiConfig = {
  STORAGE_KEY: 'invoiceai_api_key',
  API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
  MODEL: 'gemini-2.5-flash',
  
  getApiKey() {
    return localStorage.getItem(this.STORAGE_KEY) || '';
  },
  
  setApiKey(key) {
    if (key) {
      localStorage.setItem(this.STORAGE_KEY, key.trim());
    } else {
      this.removeApiKey();
    }
  },
  
  removeApiKey() {
    localStorage.removeItem(this.STORAGE_KEY);
  },
  
  hasApiKey() {
    const key = this.getApiKey();
    return this.validateKeyFormat(key);
  },
  
  validateKeyFormat(key) {
    if (!key || typeof key !== 'string') return false;
    return key.trim().length > 0;
  }
};
