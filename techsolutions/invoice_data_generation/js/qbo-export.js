/**
 * InvoiceAI — QuickBooks Online Bill-Import CSV Exporter
 * 
 * Produces a CSV formatted to match QuickBooks Online's bill-import template.
 * Upload via: QBO > Expenses > Bills > Add bill > Upload from file
 *
 * QBO CSV common headers:
 *   *Bill no., *Supplier, *Bill date, *Due date, *Account, *Line amount, *Line description
 *
 * Row structure: one row per line item. Every row for the same invoice
 * repeats the header fields identically.
 */

window.InvoiceAI = window.InvoiceAI || {};

window.InvoiceAI.QboExport = {

  // ─── CONFIGURATION ──────────────────────────────────────────────
  CONFIG: {
    // Account name for services/labor
    SERVICES_ACCOUNT: 'Purchases - Services',   // REPLACE WITH YOUR QBO ACCOUNT NAME

    // Account name for materials/supplies
    MATERIALS_ACCOUNT: 'Purchases - Materials',  // REPLACE WITH YOUR QBO ACCOUNT NAME

    // Date format for Bill Date and Due Date.
    // QBO accepts MM/DD/YYYY or DD/MM/YYYY depending on org settings.
    DATE_FORMAT: 'MM/DD/YYYY',

    // Keywords to map to services account
    SERVICE_KEYWORDS: ['charge', 'labor', 'labour', 'service', 'fee'],
  },

  // ─── PUBLIC API ─────────────────────────────────────────────────

  exportForQBO(data) {
    if (!data) return;

    const csvContent = this.buildCsv(data);
    const invoiceNum = this._val(data.invoice && data.invoice.invoice_number) || 'data';
    const filename = `qbo_bill_import_${invoiceNum}.csv`;

    this._downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  },

  buildCsv(data) {
    const HEADERS = [
      '*Bill no.',
      '*Supplier',
      '*Bill date',
      '*Due date',
      '*Account',
      '*Line amount',
      '*Line description',
    ];

    const invoiceNum   = this._val(data.invoice && data.invoice.invoice_number) || '';
    const supplier     = this._val(data.vendor && data.vendor.name) 
                      || this._val(data.customer && data.customer.name) 
                      || 'Unknown Supplier';
    const invoiceDateRaw = this._val(data.invoice && data.invoice.invoice_date) || '';
    const dueDateRaw     = this._val(data.invoice && data.invoice.due_date) || '';

    const billDate = this._formatDate(invoiceDateRaw);
    const dueDate  = dueDateRaw ? this._formatDate(dueDateRaw) : '';

    const rows = [];
    rows.push(HEADERS.map(h => this._csvQuote(h)).join(','));

    const lineItems = (data.line_items && data.line_items.length > 0)
      ? data.line_items
      : [{ description: { value: '' }, amount: { value: 0 } }];

    lineItems.forEach(item => {
      const description = this._val(item.description) || '';
      const unitPrice   = this._val(item.unit_price);
      const amount      = this._val(item.amount);

      // Prefer line total amount, fall back to unit price
      const lineAmount = (amount !== null && amount !== undefined && amount !== '') ? amount : (unitPrice || '');

      const account = this._mapAccount(description);

      const row = [
        invoiceNum,
        supplier,
        billDate,
        dueDate,
        account,
        lineAmount,
        description,
      ];

      rows.push(row.map(v => this._csvQuote(v)).join(','));
    });

    return rows.join('\n') + '\n';
  },

  // ─── PRIVATE HELPERS ────────────────────────────────────────────

  _val(fieldObj) {
    if (fieldObj && typeof fieldObj === 'object' && 'value' in fieldObj) {
      return fieldObj.value;
    }
    return (fieldObj !== undefined) ? fieldObj : null;
  },

  _formatDate(dateStr) {
    if (!dateStr) return '';
    const str = String(dateStr).trim();
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return str; 

    const [, yyyy, mm, dd] = match;

    switch (this.CONFIG.DATE_FORMAT) {
      case 'DD/MM/YYYY': return `${dd}/${mm}/${yyyy}`;
      case 'MM/DD/YYYY': return `${mm}/${dd}/${yyyy}`;
      case 'YYYY-MM-DD': return str;
      default: return `${mm}/${dd}/${yyyy}`; 
    }
  },

  _mapAccount(description) {
    if (!description) return this.CONFIG.MATERIALS_ACCOUNT;
    const descLower = String(description).toLowerCase();
    const isService = this.CONFIG.SERVICE_KEYWORDS.some(kw => descLower.includes(kw));
    return isService ? this.CONFIG.SERVICES_ACCOUNT : this.CONFIG.MATERIALS_ACCOUNT;
  },

  _csvQuote(value) {
    const s = (value === null || value === undefined) ? '' : String(value);
    return `"${s.replace(/"/g, '""')}"`;
  },

  _downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
