/**
 * InvoiceAI — Dext Bill-Import CSV Exporter
 * 
 * Produces a CSV formatted to match standard generic integrations for Dext.
 *
 * Dext standard CSV headers often include:
 *   Type, Date, Supplier, Reference, Total, Tax, Category, Description
 */

window.InvoiceAI = window.InvoiceAI || {};

window.InvoiceAI.DextExport = {

  // ─── CONFIGURATION ──────────────────────────────────────────────
  CONFIG: {
    // Default Category (Account Code)
    DEFAULT_CATEGORY: 'General Expenses',   // REPLACE WITH YOUR DEXT CATEGORY

    // Date format
    DATE_FORMAT: 'YYYY-MM-DD',
  },

  // ─── PUBLIC API ─────────────────────────────────────────────────

  exportForDext(data) {
    if (!data) return;

    const csvContent = this.buildCsv(data);
    const invoiceNum = this._val(data.invoice && data.invoice.invoice_number) || 'data';
    const filename = `dext_import_${invoiceNum}.csv`;

    this._downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  },

  buildCsv(data) {
    const HEADERS = [
      'Type',
      'Date',
      'Supplier',
      'Reference',
      'Total',
      'Tax',
      'Category',
      'Description',
    ];

    const reference   = this._val(data.invoice && data.invoice.invoice_number) || '';
    const supplier    = this._val(data.vendor && data.vendor.name) 
                     || this._val(data.customer && data.customer.name) 
                     || 'Unknown Supplier';
    const dateRaw     = this._val(data.invoice && data.invoice.invoice_date) || '';
    const dateStr     = this._formatDate(dateRaw);
    
    // Dext often prefers invoice totals at the row level if not split perfectly
    const total       = this._val(data.totals && data.totals.total_amount) || '';
    const tax         = this._val(data.totals && data.totals.tax_amount) || '';
    const description = this._val(data.notes) || 'Invoice Import';

    const rows = [];
    rows.push(HEADERS.map(h => this._csvQuote(h)).join(','));

    // Dext can take one summary line or line items. We will provide a summary line
    // or you could iterate line items. We will do line items for consistency.
    const lineItems = (data.line_items && data.line_items.length > 0)
      ? data.line_items
      : [{ description: { value: description }, amount: { value: total } }];

    lineItems.forEach(item => {
      const itemDesc = this._val(item.description) || '';
      const amount   = this._val(item.amount) || '';
      const category = this.CONFIG.DEFAULT_CATEGORY;

      const row = [
        'Receipt',
        dateStr,
        supplier,
        reference,
        amount,
        '', // We don't have line-item level tax reliable enough
        category,
        itemDesc,
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
      default: return str; 
    }
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
