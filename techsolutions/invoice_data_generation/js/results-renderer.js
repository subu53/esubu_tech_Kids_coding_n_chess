window.InvoiceAI = window.InvoiceAI || {};

window.InvoiceAI.ResultsRenderer = {
  render(data) {
    const { Schema } = window.InvoiceAI;

    // Set overall confidence indicator
    this.renderOverallConfidence(data);

    // Currency: user override > AI-detected > fallback
    const userCurrency = localStorage.getItem('invoiceai_currency');
    const aiCurrency = data.invoice.currency ? data.invoice.currency.value : null;
    const currency = (userCurrency && userCurrency !== 'auto') ? userCurrency : (aiCurrency || 'USD');

    // Override the displayed currency field if user has set a preference
    if (userCurrency && userCurrency !== 'auto') {
      data.invoice.currency = { value: userCurrency, confidence: 'high' };
    }

    // Invoice Meta Section
    const invoiceLabels = {
      invoice_number: "Invoice #",
      invoice_date: "Date",
      due_date: "Due Date",
      purchase_order: "PO Number",
      currency: "Currency"
    };
    this.renderFieldSection('invoice-fields', data.invoice, invoiceLabels);

    // Vendor Section
    const vendorLabels = {
      name: "Company Name",
      address: "Address",
      phone: "Phone",
      email: "Email",
      tax_id: "Tax ID",
      website: "Website"
    };
    this.renderFieldSection('vendor-fields', data.vendor, vendorLabels);

    // Customer Section
    const customerLabels = {
      name: "Bill To Name",
      address: "Address",
      phone: "Phone",
      email: "Email"
    };
    this.renderFieldSection('customer-fields', data.customer, customerLabels);

    // Line Items Section
    this.renderLineItems(data.line_items, currency);

    // Totals Section
    this.renderTotals(data.totals, currency);

    // Payment Section
    const paymentLabels = {
      payment_terms: "Terms",
      payment_method: "Method",
      bank_name: "Bank",
      account_number: "Account Number",
      routing_number: "Routing Number"
    };
    this.renderFieldSection('payment-fields', data.payment, paymentLabels);

    // Notes Section
    const notesContainer = document.getElementById('notes-field');
    if (notesContainer) {
      notesContainer.innerHTML = '';
      if (data.notes && data.notes.value) {
        notesContainer.appendChild(this.createFieldElement("Terms & Notes", data.notes));
      } else {
        notesContainer.innerHTML = `<div class="no-notes-msg">No additional notes detected.</div>`;
      }
    }
  },

  renderFieldSection(containerId, fields, labels) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    
    Object.keys(labels).forEach(key => {
      const fieldData = fields[key] || { value: null, confidence: null };
      const el = this.createFieldElement(labels[key], fieldData);
      container.appendChild(el);
    });
  },

  renderLineItems(lineItems, currency) {
    const tbody = document.getElementById('line-items-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!lineItems || lineItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-table-row">No line items extracted.</td></tr>`;
      return;
    }

    lineItems.forEach((item, index) => {
      const tr = document.createElement('tr');
      
      const cols = [
        { data: item.description, class: 'item-desc' },
        { data: item.quantity, class: 'item-qty text-center', format: 'number' },
        { data: item.unit_price, class: 'item-price text-right', format: 'currency' },
        { data: item.tax_rate, class: 'item-tax text-center', format: 'percent' },
        { data: item.amount, class: 'item-amount text-right', format: 'currency' }
      ];

      cols.forEach(col => {
        const td = document.createElement('td');
        if (col.class) td.className = col.class;
        
        const val = col.data ? col.data.value : null;
        const confidence = col.data ? col.data.confidence : null;

        if (val === null || val === undefined) {
          td.innerHTML = `<span class="val-muted">—</span>`;
        } else {
          let text = String(val);
          if (col.format === 'currency') {
            text = this.formatCurrency(val, currency);
          } else if (col.format === 'percent') {
            text = `${val}%`;
          }
          
          td.innerHTML = `
            <div class="table-cell-wrapper">
              <span class="cell-val">${text}</span>
              ${this.createConfidenceIndicator(confidence)}
            </div>
          `;
        }
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  },

  renderTotals(totals, currency) {
    const container = document.getElementById('totals-fields');
    if (!container) return;

    container.innerHTML = '';

    const labels = {
      subtotal: "Subtotal",
      tax_amount: "Tax Amount",
      discount_amount: "Discount",
      shipping: "Shipping & Handling",
      total_amount: "Total Amount"
    };

    Object.keys(labels).forEach(key => {
      const fieldData = totals[key] || { value: null, confidence: null };
      const val = fieldData.value;
      const confidence = fieldData.confidence;

      const row = document.createElement('div');
      row.className = `totals-row ${key === 'total_amount' ? 'totals-row-final' : ''}`;
      
      let formattedVal = '—';
      if (val !== null && val !== undefined) {
        formattedVal = this.formatCurrency(val, currency);
      }

      row.innerHTML = `
        <span class="totals-label">${labels[key]}</span>
        <div class="totals-val-wrapper">
          <span class="totals-val">${formattedVal}</span>
          ${this.createConfidenceIndicator(confidence)}
        </div>
      `;
      container.appendChild(row);
    });
  },

  createFieldElement(label, fieldData) {
    const el = document.createElement('div');
    el.className = 'info-field-card';

    const val = fieldData.value;
    const confidence = fieldData.confidence;
    
    let displayVal = val;
    let isMuted = false;

    if (val === null || val === undefined || String(val).trim() === '') {
      displayVal = '—';
      isMuted = true;
    }

    el.innerHTML = `
      <div class="field-hdr">
        <span class="field-lbl">${label}</span>
        ${this.createConfidenceIndicator(confidence)}
      </div>
      <div class="field-val ${isMuted ? 'val-muted' : ''}">${displayVal}</div>
    `;

    return el;
  },

  createConfidenceIndicator(confidence) {
    if (!confidence) return '';
    const confClass = confidence.toLowerCase();
    return `<span class="confidence-dot conf-${confClass}" title="Confidence: ${confidence}"></span>`;
  },

  renderOverallConfidence(data) {
    const badge = document.getElementById('overall-confidence');
    if (!badge) return;

    // Calculate an average confidence
    let high = 0, med = 0, low = 0, total = 0;
    
    const countField = (f) => {
      if (f && f.confidence) {
        total++;
        if (f.confidence === 'high') high++;
        else if (f.confidence === 'medium') med++;
        else if (f.confidence === 'low') low++;
      }
    };

    // Meta
    Object.values(data.invoice).forEach(countField);
    // Vendor
    Object.values(data.vendor).forEach(countField);
    // Customer
    Object.values(data.customer).forEach(countField);
    // Totals
    Object.values(data.totals).forEach(countField);

    let score = 'high';
    if (total > 0) {
      const scoreNum = (high * 1.0 + med * 0.6 + low * 0.2) / total;
      if (scoreNum < 0.5) score = 'low';
      else if (scoreNum < 0.85) score = 'medium';
    }

    badge.className = `confidence-badge conf-${score}`;
    badge.textContent = `${score.toUpperCase()} CONFIDENCE`;
  },

  showResults() {
    const hero = document.getElementById('hero-section');
    const results = document.getElementById('results-section');
    const howItWorks = document.getElementById('how-it-works');

    if (hero) hero.style.display = 'none';
    if (howItWorks) howItWorks.style.display = 'none';
    if (results) {
      results.style.display = 'grid';
      results.scrollIntoView({ behavior: 'smooth' });
    }
  },

  hideResults() {
    const hero = document.getElementById('hero-section');
    const results = document.getElementById('results-section');
    const howItWorks = document.getElementById('how-it-works');

    if (results) results.style.display = 'none';
    if (hero) hero.style.display = 'block';
    if (howItWorks) howItWorks.style.display = 'block';
  },

  showSkeleton() {
    const resultDetails = document.getElementById('extracted-data');
    if (resultDetails) {
      resultDetails.classList.add('skeleton-active');
    }
  },

  hideSkeleton() {
    const resultDetails = document.getElementById('extracted-data');
    if (resultDetails) {
      resultDetails.classList.remove('skeleton-active');
    }
  },

  formatCurrency(val, currencyCode) {
    try {
      const c = currencyCode || 'USD';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: c
      }).format(val);
    } catch (e) {
      return `${currencyCode || '$'} ${Number(val).toFixed(2)}`;
    }
  }
};
