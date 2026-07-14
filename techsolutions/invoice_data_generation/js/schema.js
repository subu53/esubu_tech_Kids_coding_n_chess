window.InvoiceAI = window.InvoiceAI || {};

window.InvoiceAI.Schema = {
  EXTRACTION_SCHEMA: `{
  "invoice": {
    "invoice_number": { "value": "string|null", "confidence": "high|medium|low|null" },
    "invoice_date": { "value": "YYYY-MM-DD string|null", "confidence": "high|medium|low|null" },
    "due_date": { "value": "YYYY-MM-DD string|null", "confidence": "high|medium|low|null" },
    "purchase_order": { "value": "string|null", "confidence": "high|medium|low|null" },
    "currency": { "value": "ISO 4217 code|null", "confidence": "high|medium|low|null" }
  },
  "vendor": {
    "name": { "value": "string|null", "confidence": "high|medium|low|null" },
    "address": { "value": "string|null", "confidence": "high|medium|low|null" },
    "phone": { "value": "string|null", "confidence": "high|medium|low|null" },
    "email": { "value": "string|null", "confidence": "high|medium|low|null" },
    "tax_id": { "value": "string|null", "confidence": "high|medium|low|null" },
    "website": { "value": "string|null", "confidence": "high|medium|low|null" }
  },
  "customer": {
    "name": { "value": "string|null", "confidence": "high|medium|low|null" },
    "address": { "value": "string|null", "confidence": "high|medium|low|null" },
    "phone": { "value": "string|null", "confidence": "high|medium|low|null" },
    "email": { "value": "string|null", "confidence": "high|medium|low|null" }
  },
  "line_items": [
    {
      "description": { "value": "string|null", "confidence": "high|medium|low|null" },
      "quantity": { "value": "number|null", "confidence": "high|medium|low|null" },
      "unit_price": { "value": "number|null", "confidence": "high|medium|low|null" },
      "tax_rate": { "value": "number|null", "confidence": "high|medium|low|null" },
      "amount": { "value": "number|null", "confidence": "high|medium|low|null" }
    }
  ],
  "totals": {
    "subtotal": { "value": "number|null", "confidence": "high|medium|low|null" },
    "tax_amount": { "value": "number|null", "confidence": "high|medium|low|null" },
    "discount_amount": { "value": "number|null", "confidence": "high|medium|low|null" },
    "shipping": { "value": "number|null", "confidence": "high|medium|low|null" },
    "total_amount": { "value": "number|null", "confidence": "high|medium|low|null" },
    "amount_paid": { "value": "number|null", "confidence": "high|medium|low|null" },
    "amount_due": { "value": "number|null", "confidence": "high|medium|low|null" }
  },
  "payment": {
    "payment_terms": { "value": "string|null", "confidence": "high|medium|low|null" },
    "payment_method": { "value": "string|null", "confidence": "high|medium|low|null" },
    "bank_name": { "value": "string|null", "confidence": "high|medium|low|null" },
    "account_number": { "value": "string|null", "confidence": "high|medium|low|null" },
    "routing_number": { "value": "string|null", "confidence": "high|medium|low|null" }
  },
  "notes": { "value": "string|null", "confidence": "high|medium|low|null" }
}`,

  validate(rawData) {
    const errors = [];
    const normalized = {
      invoice: {},
      vendor: {},
      customer: {},
      line_items: [],
      totals: {},
      payment: {},
      notes: { value: null, confidence: null }
    };

    if (!rawData || typeof rawData !== 'object') {
      errors.push("Invalid response data format");
      return { valid: false, errors, data: rawData };
    }

    // Standardize object wrapper check
    const data = rawData.invoice ? rawData : (rawData.data || rawData);

    const safeField = (obj, field) => {
      const f = obj && obj[field];
      if (f && typeof f === 'object' && 'value' in f) {
        return {
          value: f.value,
          confidence: f.confidence || 'medium'
        };
      }
      return { value: f !== undefined ? f : null, confidence: f !== undefined ? 'medium' : null };
    };

    // Invoice fields
    const invoiceFields = ['invoice_number', 'invoice_date', 'due_date', 'purchase_order', 'currency'];
    invoiceFields.forEach(f => {
      const raw = safeField(data.invoice, f);
      normalized.invoice[f] = {
        value: f.includes('date') ? this.normalizeDate(raw.value) : raw.value,
        confidence: raw.value === null ? null : raw.confidence
      };
    });

    // Vendor fields
    const vendorFields = ['name', 'address', 'phone', 'email', 'tax_id', 'website'];
    vendorFields.forEach(f => {
      const raw = safeField(data.vendor, f);
      normalized.vendor[f] = {
        value: raw.value,
        confidence: raw.value === null ? null : raw.confidence
      };
    });

    // Customer fields
    const customerFields = ['name', 'address', 'phone', 'email'];
    customerFields.forEach(f => {
      const raw = safeField(data.customer, f);
      normalized.customer[f] = {
        value: raw.value,
        confidence: raw.value === null ? null : raw.confidence
      };
    });

    // Totals fields
    const totalsFields = ['subtotal', 'tax_amount', 'discount_amount', 'shipping', 'total_amount', 'amount_paid', 'amount_due'];
    totalsFields.forEach(f => {
      const raw = safeField(data.totals, f);
      normalized.totals[f] = {
        value: this.normalizeAmount(raw.value),
        confidence: raw.value === null ? null : raw.confidence
      };
    });

    // Payment fields
    const paymentFields = ['payment_terms', 'payment_method', 'bank_name', 'account_number', 'routing_number'];
    paymentFields.forEach(f => {
      const raw = safeField(data.payment, f);
      normalized.payment[f] = {
        value: raw.value,
        confidence: raw.value === null ? null : raw.confidence
      };
    });

    // Notes
    const rawNotes = safeField(data, 'notes');
    normalized.notes = {
      value: rawNotes.value,
      confidence: rawNotes.value === null ? null : rawNotes.confidence
    };

    // Line items
    if (Array.isArray(data.line_items)) {
      data.line_items.forEach((item, idx) => {
        const desc = safeField(item, 'description');
        const qty = safeField(item, 'quantity');
        const price = safeField(item, 'unit_price');
        const tax = safeField(item, 'tax_rate');
        const amt = safeField(item, 'amount');

        normalized.line_items.push({
          description: { value: desc.value, confidence: desc.value === null ? null : desc.confidence },
          quantity: { value: this.normalizeAmount(qty.value), confidence: qty.value === null ? null : qty.confidence },
          unit_price: { value: this.normalizeAmount(price.value), confidence: price.value === null ? null : price.confidence },
          tax_rate: { value: this.normalizeAmount(tax.value), confidence: tax.value === null ? null : tax.confidence },
          amount: { value: this.normalizeAmount(amt.value), confidence: amt.value === null ? null : amt.confidence }
        });
      });
    }

    return { valid: errors.length === 0, errors, data: normalized };
  },

  normalizeDate(dateStr) {
    if (!dateStr) return null;
    const str = String(dateStr).trim();
    // Match common formats and convert to YYYY-MM-DD
    const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (isoMatch) {
      return `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;
    }
    
    // US Format: MM/DD/YYYY
    const usMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (usMatch) {
      return `${usMatch[3]}-${usMatch[1].padStart(2, '0')}-${usMatch[2].padStart(2, '0')}`;
    }

    // EU Format: DD.MM.YYYY
    const euMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    // JS Date parse fallback if possible
    try {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    } catch (e) {}

    return str; // Return raw string if unable to parse fully
  },

  normalizeAmount(amountVal) {
    if (amountVal === null || amountVal === undefined) return null;
    if (typeof amountVal === 'number') return amountVal;
    
    const str = String(amountVal).trim()
      .replace(/[^0-9.,-]/g, ''); // strip symbols like $, €, etc.
    
    if (!str) return null;

    // Detect German/French format where comma is decimal separator and dot is thousands separator
    const hasComma = str.includes(',');
    const hasDot = str.includes('.');

    if (hasComma && hasDot) {
      if (str.indexOf(',') > str.indexOf('.')) {
        // comma is decimal: replace dot with empty, replace comma with dot
        return parseFloat(str.replace(/\./g, '').replace(/,/g, '.'));
      } else {
        // dot is decimal: replace comma with empty
        return parseFloat(str.replace(/,/g, ''));
      }
    } else if (hasComma) {
      const parts = str.split(',');
      if (parts[parts.length - 1].length === 2) {
        return parseFloat(str.replace(/,/g, '.'));
      } else {
        return parseFloat(str.replace(/,/g, ''));
      }
    } else if (hasDot) {
      return parseFloat(str);
    }
    
    return parseFloat(str) || null;
  },

  getConfidenceClass(confidence) {
    if (!confidence) return 'none';
    const c = String(confidence).toLowerCase();
    if (c === 'high' || c === 'medium' || c === 'low') return c;
    return 'none';
  }
};
