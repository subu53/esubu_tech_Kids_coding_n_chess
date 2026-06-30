window.InvoiceAI = window.InvoiceAI || {};

window.InvoiceAI.ExportManager = {
  currentData: null,

  setData(data) {
    this.currentData = data;
  },

  exportJSON() {
    if (!this.currentData) return;
    const jsonStr = JSON.stringify(this.currentData, null, 2);
    const filename = `invoice_extraction_${this.currentData.invoice.invoice_number.value || 'data'}.json`;
    this.downloadFile(jsonStr, filename, 'application/json');
    this.showExportSuccess('export-json');
  },

  exportCSV() {
    if (!this.currentData) return;
    
    // Flatten metadata & main structures
    const flat = {};
    const d = this.currentData;

    // Helper to safely fetch value
    const val = (obj) => (obj && obj.value !== undefined) ? obj.value : '';

    flat.InvoiceNumber = val(d.invoice.invoice_number);
    flat.InvoiceDate = val(d.invoice.invoice_date);
    flat.DueDate = val(d.invoice.due_date);
    flat.PO = val(d.invoice.purchase_order);
    flat.Currency = val(d.invoice.currency);

    flat.VendorName = val(d.vendor.name);
    flat.VendorAddress = val(d.vendor.address);
    flat.VendorPhone = val(d.vendor.phone);
    flat.VendorEmail = val(d.vendor.email);
    flat.VendorTaxID = val(d.vendor.tax_id);

    flat.CustomerName = val(d.customer.name);
    flat.CustomerAddress = val(d.customer.address);

    flat.Subtotal = val(d.totals.subtotal);
    flat.Tax = val(d.totals.tax_amount);
    flat.Discount = val(d.totals.discount_amount);
    flat.Shipping = val(d.totals.shipping);
    flat.Total = val(d.totals.total_amount);

    flat.PaymentTerms = val(d.payment.payment_terms);
    flat.PaymentMethod = val(d.payment.payment_method);
    flat.BankName = val(d.payment.bank_name);
    flat.AccountNum = val(d.payment.account_number);

    // Build CSV content
    let csvContent = "";
    
    // CSV Header row
    const headers = Object.keys(flat).concat([
      'LineItem_Desc', 'LineItem_Qty', 'LineItem_Price', 'LineItem_Tax', 'LineItem_Amount'
    ]);
    csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\n";

    // Row generator
    const baseValues = Object.values(flat).map(v => {
      const s = v === null || v === undefined ? '' : String(v);
      return `"${s.replace(/"/g, '""')}"`;
    });

    if (d.line_items && d.line_items.length > 0) {
      d.line_items.forEach(item => {
        const itemValues = [
          val(item.description),
          val(item.quantity),
          val(item.unit_price),
          val(item.tax_rate),
          val(item.amount)
        ].map(v => {
          const s = v === null || v === undefined ? '' : String(v);
          return `"${s.replace(/"/g, '""')}"`;
        });
        
        csvContent += baseValues.concat(itemValues).join(",") + "\n";
      });
    } else {
      // Just one row with empty items
      csvContent += baseValues.concat(['', '', '', '', '']).join(",") + "\n";
    }

    const filename = `invoice_extraction_${flat.InvoiceNumber || 'data'}.csv`;
    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
    this.showExportSuccess('export-csv');
  },

  async copyToClipboard() {
    if (!this.currentData) return;
    
    const d = this.currentData;
    const val = (obj) => (obj && obj.value !== undefined && obj.value !== null) ? obj.value : '—';

    let text = `=========================================\n`;
    text += `       INVOICE EXTRACTION RESULTS        \n`;
    text += `=========================================\n\n`;
    
    text += `INVOICE INFORMATION:\n`;
    text += `- Invoice Number: ${val(d.invoice.invoice_number)}\n`;
    text += `- Date:           ${val(d.invoice.invoice_date)}\n`;
    text += `- Due Date:       ${val(d.invoice.due_date)}\n`;
    text += `- Purchase Order: ${val(d.invoice.purchase_order)}\n`;
    text += `- Currency:       ${val(d.invoice.currency)}\n\n`;

    text += `VENDOR DETAILS:\n`;
    text += `- Name:           ${val(d.vendor.name)}\n`;
    text += `- Address:        ${val(d.vendor.address)}\n`;
    text += `- Phone:          ${val(d.vendor.phone)}\n`;
    text += `- Email:          ${val(d.vendor.email)}\n`;
    text += `- Tax ID:         ${val(d.vendor.tax_id)}\n`;
    text += `- Website:        ${val(d.vendor.website)}\n\n`;

    text += `CUSTOMER DETAILS:\n`;
    text += `- Bill To:        ${val(d.customer.name)}\n`;
    text += `- Address:        ${val(d.customer.address)}\n\n`;

    text += `LINE ITEMS:\n`;
    if (d.line_items && d.line_items.length > 0) {
      d.line_items.forEach((item, idx) => {
        text += `  ${idx + 1}. ${val(item.description)} | Qty: ${val(item.quantity)} | Price: ${val(item.unit_price)} | Total: ${val(item.amount)}\n`;
      });
    } else {
      text += `  No line items.\n`;
    }
    text += `\n`;

    text += `TOTALS:\n`;
    text += `- Subtotal:       ${val(d.totals.subtotal)}\n`;
    text += `- Tax:            ${val(d.totals.tax_amount)}\n`;
    text += `- Discount:       ${val(d.totals.discount_amount)}\n`;
    text += `- Shipping:       ${val(d.totals.shipping)}\n`;
    text += `- Total Amount:   ${val(d.totals.total_amount)}\n\n`;

    text += `PAYMENT DETAILS:\n`;
    text += `- Terms:          ${val(d.payment.payment_terms)}\n`;
    text += `- Method:         ${val(d.payment.payment_method)}\n`;
    text += `- Bank:           ${val(d.payment.bank_name)}\n`;
    text += `- Account:        ${val(d.payment.account_number)}\n`;
    text += `=========================================\n`;

    try {
      await navigator.clipboard.writeText(text);
      this.showExportSuccess('copy-clipboard');
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  },

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  showExportSuccess(buttonId) {
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
