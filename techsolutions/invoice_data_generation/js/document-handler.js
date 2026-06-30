window.InvoiceAI = window.InvoiceAI || {};

window.InvoiceAI.DocumentHandler = {
  currentDocument: null, // { type: 'pdf'|'image', pages: [{base64, width, height}], currentPage: 0 }
  
  async processFile(file) {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    if (file.type === 'application/pdf') {
      return await this.processPDF(file);
    } else {
      return await this.processImage(file);
    }
  },

  async processPDF(file) {
    try {
      // Ensure pdfjsLib is loaded
      if (!window.pdfjsLib) {
        throw new Error("PDF.js library is not loaded. Please refresh the page.");
      }

      // Configure worker
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const pages = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // 2.0x scale for crisp OCR text
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
        const base64 = canvas.toDataURL('image/png');
        
        pages.push({
          base64: base64,
          width: viewport.width,
          height: viewport.height
        });
      }

      this.currentDocument = {
        type: 'pdf',
        pages: pages,
        currentPage: 0
      };

      return this.currentDocument;
    } catch (error) {
      console.error("PDF processing failed:", error);
      throw new Error("Failed to process PDF file: " + error.message);
    }
  },

  async processImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          this.currentDocument = {
            type: 'image',
            pages: [{
              base64: event.target.result,
              width: img.width,
              height: img.height
            }],
            currentPage: 0
          };
          resolve(this.currentDocument);
        };
        img.onerror = () => {
          reject(new Error("Failed to load image file. Check if it's corrupt."));
        };
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error("File reading failed."));
      reader.readAsDataURL(file);
    });
  },

  renderToCanvas(canvasElement, pageIndex) {
    if (!this.currentDocument || !this.currentDocument.pages[pageIndex]) {
      return false;
    }

    const page = this.currentDocument.pages[pageIndex];
    const canvas = typeof canvasElement === 'string' ? document.getElementById(canvasElement) : canvasElement;
    if (!canvas) return false;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      // Calculate responsive fit
      const parent = canvas.parentElement;
      let parentWidth = parent ? parent.clientWidth : 0;
      if (parentWidth < 100) {
        parentWidth = 600; // sensible default width fallback if parent is collapsed/hidden
      }
      const maxWidth = parentWidth - 32;
      const scale = Math.max(0.1, Math.min(maxWidth / page.width, 1));
      
      canvas.width = page.width * scale;
      canvas.height = page.height * scale;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = page.base64;
    return true;
  },

  getBase64Pages() {
    if (!this.currentDocument) return [];
    return this.currentDocument.pages.map(p => {
      // Strip "data:image/png;base64," or similar prefixes
      const commaIdx = p.base64.indexOf(',');
      return commaIdx !== -1 ? p.base64.substring(commaIdx + 1) : p.base64;
    });
  },

  validateFile(file) {
    if (!file) {
      return { valid: false, error: "No file selected." };
    }
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: "Unsupported file type. Please upload a PDF, JPEG, PNG, or WebP image." };
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: "File size exceeds 10MB limit." };
    }
    return { valid: true };
  },

  getPageCount() {
    return this.currentDocument ? this.currentDocument.pages.length : 0;
  },

  getCurrentPage() {
    return this.currentDocument ? this.currentDocument.currentPage : 0;
  },

  nextPage() {
    if (this.currentDocument && this.currentDocument.currentPage < this.getPageCount() - 1) {
      this.currentDocument.currentPage++;
      return true;
    }
    return false;
  },

  prevPage() {
    if (this.currentDocument && this.currentDocument.currentPage > 0) {
      this.currentDocument.currentPage--;
      return true;
    }
    return false;
  }
};
