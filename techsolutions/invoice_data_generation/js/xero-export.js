/**
 * InvoiceAI — Xero Bill-Import CSV Exporter
 * 
 * Produces a CSV formatted to match Xero's native bill-import template.
 * Upload via: Xero > Business > Bills to pay > Import
 *
 * Xero CSV columns (exact spelling, case-sensitive):
 *   ContactName, InvoiceNumber, InvoiceDate, DueDate, Description,
 *   Quantity, UnitAmount, AccountCode, TaxType
 *
 * Row structure: one row per line item. Every row for the same invoice
 * repeats ContactName, InvoiceNumber, InvoiceDate, DueDate identically.
 * Xero groups rows into a single bill by matching InvoiceNumber.
 */

window.InvoiceAI = window.InvoiceAI || {};

window.InvoiceAI.XeroExport = {

  // ─── CONFIGURATION ──────────────────────────────────────────────
  // REPLACE THESE WITH YOUR XERO ACCOUNT CODES.
  // These must match entries in your Xero org's Chart of Accounts.
  // Go to Xero > Accounting > Chart of Accounts to find your codes.
  CONFIG: {
    // Account code for services, labor, fees, charges
    SERVICES_ACCOUNT_CODE: '400',   // REPLACE WITH YOUR XERO ACCOUNT CODE

    // Account code for materials, supplies, goods
    MATERIALS_ACCOUNT_CODE: '300',  // REPLACE WITH YOUR XERO ACCOUNT CODE

    // Date format for InvoiceDate and DueDate.
    // Xero accepts: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, and others.
    // The correct format depends on your Xero org's regional setting.
    // Common options:
    //   'DD/MM/YYYY' — UK, AU, NZ, ZA, most of world
    //   'MM/DD/YYYY' — US
    //   'YYYY-MM-DD' — ISO (accepted universally by Xero)
    DATE_FORMAT: 'DD/MM/YYYY',

    // Keywords (case-insensitive substring match on description) that
    // map a line item to the services/labor account code.
    // Everything else falls back to the materials/supplies code.
    SERVICE_KEYWORDS: ['charge', 'labor', 'labour', 'service', 'fee'],
  },

  // ─── PUBLIC API ─────────────────────────────────────────────────

  /**
   * Generate and download a Xero-compatible bill-import CSV.
   * @param {Object} data — The normalized extraction result object
   *                        (same shape as ExportManager.currentData).
   */
  exportForXero(data) {
    if (!data) return;

    const csvContent = this.buildCsv(data);
    const invoiceNum = this._val(data.invoice && data.invoice.invoice_number) || 'data';
    const filename = `xero_bill_import_${invoiceNum}.csv`;

    this._downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
    this._showExportSuccess('export-xero');
  },

  /**
   * Build the full CSV string (header + data rows).
   * @param {Object} data — normalized extraction data.
   * @returns {string} CSV content ready for Blob download.
   */
  buildCsv(data) {
    const HEADERS = [
      'ContactName',
      'InvoiceNumber',
      'InvoiceDate',
      'DueDate',
      'Description',
      'Quantity',
      'UnitAmount',
      'AccountCode',
      'TaxType',
    ];

    // Invoice-level fields (repeated on every row)
    const contactName  = this._val(data.vendor && data.vendor.name) 
                      || this._val(data.customer && data.customer.name) 
                      || 'Unknown Vendor';
    const invoiceNum   = this._val(data.invoice && data.invoice.invoice_number) || '';
    const invoiceDateRaw = this._val(data.invoice && data.invoice.invoice_date) || '';
    const dueDateRaw     = this._val(data.invoice && data.invoice.due_date) || '';

    const invoiceDate = this._formatDate(invoiceDateRaw);
    const dueDate     = dueDateRaw ? this._formatDate(dueDateRaw) : '';

    // Build rows — one per line item
    const rows = [];

    // Header row
    rows.push(HEADERS.map(h => this._csvQuote(h)).join(','));

    const lineItems = (data.line_items && data.line_items.length > 0)
      ? data.line_items
      : [{ description: { value: '' }, quantity: { value: 1 }, unit_price: { value: 0 }, amount: { value: 0 } }];

    lineItems.forEach(item => {
      const description = this._val(item.description) || '';
      const quantity    = this._val(item.quantity);
      const unitPrice   = this._val(item.unit_price);
      const amount      = this._val(item.amount);

      // Quantity: default to 1 if null (flat-fee items)
      const qty = (quantity !== null && quantity !== undefined && quantity !== '') ? quantity : 1;

      // UnitAmount: prefer unit_price, fall back to amount
      const unitAmount = (unitPrice !== null && unitPrice !== undefined && unitPrice !== '') ? unitPrice : (amount || '');

      // AccountCode: keyword-based mapping
      const accountCode = this._mapAccountCode(description);

      // TaxType: leave blank — Xero applies default tax rate
      const taxType = '';

      const row = [
        contactName,
        invoiceNum,
        invoiceDate,
        dueDate,
        description,
        qty,
        unitAmount,
        accountCode,
        taxType,
      ];

      rows.push(row.map(v => this._csvQuote(v)).join(','));
    });

    return rows.join('\n') + '\n';
  },

  // ─── PRIVATE HELPERS ────────────────────────────────────────────

  /**
   * Safely extract .value from a schema field object.
   */
  _val(fieldObj) {
    if (fieldObj && typeof fieldObj === 'object' && 'value' in fieldObj) {
      return fieldObj.value;
    }
    return (fieldObj !== undefined) ? fieldObj : null;
  },

  /**
   * Convert an internal YYYY-MM-DD date to the configured Xero date format.
   */
  _formatDate(dateStr) {
    if (!dateStr) return '';
    const str = String(dateStr).trim();

    // Parse YYYY-MM-DD (our internal normalized format)
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return str; // Return as-is if not in expected format

    const [, yyyy, mm, dd] = match;

    switch (this.CONFIG.DATE_FORMAT) {
      case 'DD/MM/YYYY':
        return `${dd}/${mm}/${yyyy}`;
      case 'MM/DD/YYYY':
        return `${mm}/${dd}/${yyyy}`;
      case 'YYYY-MM-DD':
        return str; // Already in ISO format
      default:
        return `${dd}/${mm}/${yyyy}`; // Fallback to DD/MM/YYYY
    }
  },

  /**
   * Map a line item description to a Xero account code using
   * case-insensitive keyword substring matching.
   */
  _mapAccountCode(description) {
    if (!description) return this.CONFIG.MATERIALS_ACCOUNT_CODE;

    const descLower = String(description).toLowerCase();
    const isService = this.CONFIG.SERVICE_KEYWORDS.some(
      keyword => descLower.includes(keyword.toLowerCase())
    );

    return isService
      ? this.CONFIG.SERVICES_ACCOUNT_CODE
      : this.CONFIG.MATERIALS_ACCOUNT_CODE;
  },

  /**
   * Quote a CSV field value: wrap in double quotes, escape internal
   * double quotes by doubling them. Matches existing codebase convention.
   */
  _csvQuote(value) {
    const s = (value === null || value === undefined) ? '' : String(value);
    return `"${s.replace(/"/g, '""')}"`;
  },

  /**
   * Download a string as a file. Mirrors ExportManager.downloadFile().
   */
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
  },

  /**
   * Flash a success indicator on the button.
   * Mirrors ExportManager.showExportSuccess().
   */
  _showExportSuccess(buttonId) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<span class="btn-success-indicator">✓ Exported</span>`;
    btn.classList.add('btn-success-flash');
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove('btn-success-flash');
      btn.disabled = false;
    }, 2000);
  }
};
