window.InvoiceAI = window.InvoiceAI || {};

document.addEventListener('DOMContentLoaded', () => {
  const { Schema, ApiConfig, DocumentHandler, ExtractionEngine, ResultsRenderer, ExportManager, XeroExport, QboExport, DextExport, SampleManager } = window.InvoiceAI;

  // DOM Elements
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const resultsSection = document.getElementById('results-section');
  const heroSection = document.getElementById('hero-section');
  const howItWorksSection = document.getElementById('how-it-works');
  
  const docCanvas = document.getElementById('doc-canvas');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  const pageIndicator = document.getElementById('page-indicator');
  const pageControls = document.getElementById('page-controls');

  const exportFormatSelect = document.getElementById('export-format');
  const exportDownloadBtn = document.getElementById('export-download');
  const copyClipboardBtn = document.getElementById('copy-clipboard');
  const newUploadBtn = document.getElementById('new-upload-btn');

  const settingsBtn = document.getElementById('settings-btn');
  const apiKeyModal = document.getElementById('api-key-modal');
  const apiKeyInput = document.getElementById('api-key-input');
  const saveApiKeyBtn = document.getElementById('save-api-key');
  const cancelApiKeyBtn = document.getElementById('cancel-api-key');
  const cancelApiKeyBtnSecondary = document.getElementById('cancel-api-key-btn');
  const currencySelect = document.getElementById('currency-select');

  const processingOverlay = document.getElementById('processing-overlay');
  const processingStatus = document.getElementById('processing-status');

  const errorToast = document.getElementById('error-toast');
  const errorMessage = document.getElementById('error-message');
  const closeToastBtn = document.getElementById('close-toast');

  // Application State
  let currentFile = null;
  let processingInterval = null;

  // Initialize Event Listeners
  init();

  function init() {
    setupDragAndDrop();
    setupFileInput();
    setupSampleButtons();
    setupApiKeyModal();
    setupExportButtons();
    setupPageControls();
    setupNewUploadButton();
    setupErrorToast();
    setupNavbarLinks();
    setupRoiCalculator();

    // Populate API Key input if stored
    if (ApiConfig.hasApiKey()) {
      apiKeyInput.value = ApiConfig.getApiKey();
    }

    // Populate currency selector if stored
    const savedCurrency = localStorage.getItem('invoiceai_currency');
    if (savedCurrency && currencySelect) {
      currencySelect.value = savedCurrency;
    }
  }

  // Drag and Drop Handlers
  function setupDragAndDrop() {
    if (!uploadZone) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      uploadZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadZone.classList.add('drag-active');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      uploadZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadZone.classList.remove('drag-active');
      }, false);
    });

    uploadZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        handleFileSelection(files[0]);
      }
    }, false);

    uploadZone.addEventListener('click', () => {
      fileInput.click();
    });
  }

  function setupFileInput() {
    if (!fileInput) return;
    fileInput.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent click event bubbling to uploadZone
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
      }
    });
  }

  // Handle document file ingestion and processing
  async function handleFileSelection(file) {
    currentFile = file;

    // Check if API Key is configured before processing own files
    if (!ApiConfig.hasApiKey()) {
      showError("Please connect your secure integration key first by clicking the settings gear in the top right.");
      openSettingsModal();
      return;
    }

    showProcessing("Ingesting file...");
    rotateStatusMessages();

    try {
      // 1. Process document file (Image or PDF)
      const doc = await DocumentHandler.processFile(file);
      
      // Update PDF pagination controls visibility
      updatePaginationControls();
      
      // Show results layout first so parent container has non-zero width for canvas rendering
      ResultsRenderer.showSkeleton();
      ResultsRenderer.showResults();
      
      // 2. Render first page to Canvas
      DocumentHandler.renderToCanvas(docCanvas, 0);

      // 3. Perform AI Extraction
      hideProcessing();

      showProcessing("Extracting data via Cognitive Engine...");
      const base64Pages = DocumentHandler.getBase64Pages();
      const extractedData = await ExtractionEngine.extract(base64Pages, (msg) => {
        processingStatus.textContent = msg;
      });

      // 4. Render extracted content to UI
      ResultsRenderer.hideSkeleton();
      ResultsRenderer.render(extractedData);
      ExportManager.setData(extractedData);
      hideProcessing();

      // Clear info banner if there was one
      removeDemoBanner();
    } catch (err) {
      console.error(err);
      hideProcessing();
      ResultsRenderer.hideResults();
      showError(err.message || "Failed to process document. Please try again.");
    }
  }

  // Sample Buttons setup (Instant Demo mode)
  function setupSampleButtons() {
    const sampleContainer = document.getElementById('sample-buttons');
    if (!sampleContainer) return;

    sampleContainer.addEventListener('click', async (e) => {
      const btn = e.target.closest('.sample-btn');
      if (!btn) return;

      const sampleKey = btn.getAttribute('data-sample');
      const sample = SampleManager.getSample(sampleKey);
      if (!sample) return;

      showProcessing(`Loading ${sample.name}...`);

      try {
        // Load the sample image
        const imgData = await SampleManager.loadSampleImage(sampleKey);
        
        // Mock the DocumentHandler state
        DocumentHandler.currentDocument = {
          type: 'image',
          pages: [imgData],
          currentPage: 0
        };

        updatePaginationControls();
        ResultsRenderer.showSkeleton();
        ResultsRenderer.showResults();
        
        // Render page after results layout is shown so width calculations succeed
        DocumentHandler.renderToCanvas(docCanvas, 0);
        
        // Check if API key is present. If yes, extract live. If not, use pre-computed JSON.
        if (ApiConfig.hasApiKey()) {
          hideProcessing();
          showProcessing("Running live extraction on sample invoice...");
          
          const base64Pages = DocumentHandler.getBase64Pages();
          const extractedData = await ExtractionEngine.extract(base64Pages, (msg) => {
            processingStatus.textContent = msg;
          });

          ResultsRenderer.hideSkeleton();
          ResultsRenderer.render(extractedData);
          ExportManager.setData(extractedData);
          removeDemoBanner();
        } else {
          // Pre-computed fallback
          setTimeout(() => {
            const preComputed = SampleManager.getPrecomputedResult(sampleKey);
            ResultsRenderer.hideSkeleton();
            ResultsRenderer.render(preComputed);
            ExportManager.setData(preComputed);
            
            // Add notice banner that it is pre-computed
            showDemoBanner();
          }, 1000);
        }

        hideProcessing();
      } catch (err) {
        console.error(err);
        hideProcessing();
        showError("Failed to load sample invoice: " + err.message);
      }
    });
  }

  // API Key Settings Modal handlers
  function setupApiKeyModal() {
    if (settingsBtn) {
      settingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openSettingsModal();
      });
    }

    if (saveApiKeyBtn) {
      saveApiKeyBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        ApiConfig.setApiKey(key);

        // Save currency preference
        if (currencySelect) {
          localStorage.setItem('invoiceai_currency', currencySelect.value);
        }

        closeSettingsModal();
        
        if (ApiConfig.hasApiKey()) {
          settingsBtn.classList.add('api-configured');
        } else {
          settingsBtn.classList.remove('api-configured');
        }
      });
    }

    if (cancelApiKeyBtn) {
      cancelApiKeyBtn.addEventListener('click', () => {
        closeSettingsModal();
      });
    }

    if (cancelApiKeyBtnSecondary) {
      cancelApiKeyBtnSecondary.addEventListener('click', () => {
        closeSettingsModal();
      });
    }

    // Click outside modal to close
    if (apiKeyModal) {
      apiKeyModal.addEventListener('click', (e) => {
        if (e.target === apiKeyModal) {
          closeSettingsModal();
        }
      });
    }
  }

  function openSettingsModal() {
    if (apiKeyModal) {
      apiKeyModal.classList.add('visible');
      apiKeyInput.focus();
    }
  }

  function closeSettingsModal() {
    if (apiKeyModal) {
      apiKeyModal.classList.remove('visible');
    }
  }

  // Export Buttons
  function setupExportButtons() {
    if (exportDownloadBtn && exportFormatSelect) {
      exportDownloadBtn.addEventListener('click', () => {
        const format = exportFormatSelect.value;
        const data = ExportManager.currentData;
        
        switch (format) {
          case 'xero':
            XeroExport.exportForXero(data);
            break;
          case 'qbo':
            QboExport.exportForQBO(data);
            break;
          case 'dext':
            DextExport.exportForDext(data);
            break;
          case 'csv':
            ExportManager.exportCSV();
            break;
          case 'json':
            ExportManager.exportJSON();
            break;
        }
      });
    }
    if (copyClipboardBtn) {
      copyClipboardBtn.addEventListener('click', () => ExportManager.copyToClipboard());
    }
  }

  // Page navigation controls for PDFs
  function setupPageControls() {
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => {
        if (DocumentHandler.prevPage()) {
          const cur = DocumentHandler.getCurrentPage();
          DocumentHandler.renderToCanvas(docCanvas, cur);
          updatePageLabel();
        }
      });
    }

    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => {
        if (DocumentHandler.nextPage()) {
          const cur = DocumentHandler.getCurrentPage();
          DocumentHandler.renderToCanvas(docCanvas, cur);
          updatePageLabel();
        }
      });
    }
  }

  function updatePaginationControls() {
    const total = DocumentHandler.getPageCount();
    if (total > 1) {
      if (pageControls) pageControls.style.display = 'flex';
      updatePageLabel();
    } else {
      if (pageControls) pageControls.style.display = 'none';
    }
  }

  function updatePageLabel() {
    if (pageIndicator) {
      const cur = DocumentHandler.getCurrentPage() + 1;
      const total = DocumentHandler.getPageCount();
      pageIndicator.textContent = `Page ${cur} of ${total}`;
    }
  }

  // Reset and New Upload Handler
  function setupNewUploadButton() {
    if (newUploadBtn) {
      newUploadBtn.addEventListener('click', () => {
        currentFile = null;
        if (fileInput) fileInput.value = '';
        ResultsRenderer.hideResults();
        removeDemoBanner();
      });
    }
  }

  // Error Alert Toast handler
  function setupErrorToast() {
    if (closeToastBtn) {
      closeToastBtn.addEventListener('click', () => {
        errorToast.classList.remove('visible');
      });
    }
  }

  function showError(msg) {
    if (errorToast && errorMessage) {
      errorMessage.textContent = msg;
      errorToast.classList.add('visible');
      
      // Auto-hide after 6 seconds
      setTimeout(() => {
        errorToast.classList.remove('visible');
      }, 6000);
    } else {
      alert(msg);
    }
  }

  // Loading Overlay Utilities
  function showProcessing(statusText) {
    if (processingOverlay && processingStatus) {
      processingStatus.textContent = statusText;
      processingOverlay.style.display = 'flex';
    }
  }

  function hideProcessing() {
    if (processingOverlay) {
      processingOverlay.style.display = 'none';
    }
    clearInterval(processingInterval);
  }

  function rotateStatusMessages() {
    const messages = [
      "Analyzing document structure...",
      "Reading invoice content...",
      "Extracting vendor information...",
      "Processing line items...",
      "Validating extracted data...",
      "Almost done..."
    ];
    let i = 0;
    
    clearInterval(processingInterval);
    processingInterval = setInterval(() => {
      if (processingStatus && processingOverlay.style.display !== 'none') {
        processingStatus.textContent = messages[i];
        i = (i + 1) % messages.length;
      }
    }, 2500);
  }

  // Header Navigation Link anchors scroll setup
  function setupNavbarLinks() {
    document.querySelectorAll('.nav-scroll-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
          ResultsRenderer.hideResults(); // Make sure hero/landing sections are visible
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // ROI Calculator Calculations Logic
  function setupRoiCalculator() {
    const inputVolume = document.getElementById('calc-input-volume');
    const inputWage = document.getElementById('calc-input-wage');
    const inputTime = document.getElementById('calc-input-time');

    const valVolume = document.getElementById('calc-val-volume');
    const valWage = document.getElementById('calc-val-wage');
    const valTime = document.getElementById('calc-val-time');

    const resultSavings = document.getElementById('calc-result-savings');
    const resultHours = document.getElementById('calc-result-hours');

    if (!inputVolume || !inputWage || !inputTime) return;

    function calculate() {
      const volume = parseInt(inputVolume.value);
      const wage = parseInt(inputWage.value);
      const time = parseInt(inputTime.value);

      // Update slider values in UI
      valVolume.textContent = volume.toLocaleString();
      valWage.textContent = `$${wage}`;
      valTime.textContent = `${time} min`;

      // Manual cost = (Volume * Time * Wage) / 60
      const manualCost = (volume * time * wage) / 60;
      
      // Automated cost assumes 90% time savings (i.e. takes 10% of time)
      const automatedCost = manualCost * 0.1;
      const savings = Math.round(manualCost - automatedCost);
      const hoursReclaimed = Math.round((volume * time * 0.9) / 60);

      // Render outputs
      resultSavings.textContent = `$${savings.toLocaleString()}`;
      resultHours.textContent = `${hoursReclaimed.toLocaleString()} Hours`;
    }

    // Attach input event listeners for real-time recalculations
    [inputVolume, inputWage, inputTime].forEach(slider => {
      slider.addEventListener('input', calculate);
    });

    // Run initial calculation
    calculate();
  }

  // Demo precomputed notice banners
  function showDemoBanner() {
    removeDemoBanner();
    const banner = document.createElement('div');
    banner.id = 'demo-notice-banner';
    banner.className = 'demo-notice-banner';
    banner.innerHTML = `
      <span>📋 Showing pre-computed demo results. Connect your secure integration key (via settings gear) to process custom invoices.</span>
      <button class="banner-close-btn" onclick="this.parentElement.remove()">✕</button>
    `;
    
    // Insert under header or top of details
    const target = document.getElementById('extracted-data');
    if (target) {
      target.insertBefore(banner, target.firstChild);
    }
  }

  function removeDemoBanner() {
    const banner = document.getElementById('demo-notice-banner');
    if (banner) banner.remove();
  }
});
