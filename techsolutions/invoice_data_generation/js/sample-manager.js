window.InvoiceAI = window.InvoiceAI || {};

window.InvoiceAI.SampleManager = {
  samples: {
    standard: {
      name: 'Standard Invoice',
      description: 'Clean, typed design agency invoice',
      imagePath: 'assets/samples/sample-standard.png',
      result: {
        invoice: {
          invoice_number: { value: "INV-2024-0892", confidence: "high" },
          invoice_date: { value: "2024-03-15", confidence: "high" },
          due_date: { value: "2024-04-14", confidence: "high" },
          purchase_order: { value: "PO-7892", confidence: "high" },
          currency: { value: "USD", confidence: "high" }
        },
        vendor: {
          name: { value: "Quantum Design Studios", confidence: "high" },
          address: { value: "2847 Innovation Blvd, Suite 340, Austin, TX 78701", confidence: "high" },
          phone: { value: "+1-512-555-0199", confidence: "high" },
          email: { value: "billing@quantumdesign.co", confidence: "high" },
          tax_id: { value: "US-87654321", confidence: "high" },
          website: { value: "www.quantumdesign.co", confidence: "high" }
        },
        customer: {
          name: { value: "Meridian Technologies Inc.", confidence: "high" },
          address: { value: "1200 Commerce Park Dr, San Jose, CA 95131", confidence: "high" },
          phone: { value: null, confidence: null },
          email: { value: "accounts-payable@meridiantech.com", confidence: "high" }
        },
        line_items: [
          {
            description: { value: "Brand Identity Package - Logo design, color palette, typography guidelines", confidence: "high" },
            quantity: { value: 1, confidence: "high" },
            unit_price: { value: 4500.00, confidence: "high" },
            tax_rate: { value: 8.25, confidence: "high" },
            amount: { value: 4500.00, confidence: "high" }
          },
          {
            description: { value: "Website UI/UX Design - 12 page responsive landing page and product console templates", confidence: "high" },
            quantity: { value: 1, confidence: "high" },
            unit_price: { value: 8200.00, confidence: "high" },
            tax_rate: { value: 8.25, confidence: "high" },
            amount: { value: 8200.00, confidence: "high" }
          },
          {
            description: { value: "Marketing Collateral - Printed company brochures, business cards, physical envelopes", confidence: "high" },
            quantity: { value: 500, confidence: "high" },
            unit_price: { value: 2.50, confidence: "high" },
            tax_rate: { value: 8.25, confidence: "high" },
            amount: { value: 1250.00, confidence: "high" }
          },
          {
            description: { value: "Social Media Kit - Customizable post templates for LinkedIn, Twitter, Instagram", confidence: "high" },
            quantity: { value: 1, confidence: "high" },
            unit_price: { value: 1800.00, confidence: "high" },
            tax_rate: { value: 8.25, confidence: "high" },
            amount: { value: 1800.00, confidence: "high" }
          }
        ],
        totals: {
          subtotal: { value: 15750.00, confidence: "high" },
          tax_amount: { value: 1299.38, confidence: "high" },
          discount_amount: { value: 0.00, confidence: "high" },
          shipping: { value: null, confidence: null },
          total_amount: { value: 17049.38, confidence: "high" }
        },
        payment: {
          payment_terms: { value: "Net 30", confidence: "high" },
          payment_method: { value: "Bank Transfer", confidence: "high" },
          bank_name: { value: "Silicon Valley Bank", confidence: "high" },
          account_number: { value: "****8923", confidence: "high" },
          routing_number: { value: "****0210", confidence: "high" }
        },
        notes: { value: "Thank you for partnering with Quantum Design Studios. Please process payment to account listed above within 30 days.", confidence: "high" }
      }
    },
    complex: {
      name: 'Complex Invoice',
      description: 'Multi-item European digital infrastructure invoice',
      imagePath: 'assets/samples/sample-complex.png',
      result: {
        invoice: {
          invoice_number: { value: "FK-87234", confidence: "high" },
          invoice_date: { value: "2024-07-22", confidence: "high" },
          due_date: { value: "2024-08-21", confidence: "high" },
          purchase_order: { value: "PO-J99-10A", confidence: "medium" },
          currency: { value: "EUR", confidence: "high" }
        },
        vendor: {
          name: { value: "Friedrich & Krause GmbH", confidence: "high" },
          address: { value: "Berliner Str. 42, 80331 München, Germany", confidence: "high" },
          phone: { value: "+49-89-555-4200", confidence: "high" },
          email: { value: "accounts@friedrichkrause.de", confidence: "high" },
          tax_id: { value: "DE298745123", confidence: "high" },
          website: { value: "www.friedrichkrause.de", confidence: "high" }
        },
        customer: {
          name: { value: "Sakura Digital Ltd.", confidence: "high" },
          address: { value: "3-15-7 Roppongi, Minato-ku, Tokyo 106-0032, Japan", confidence: "high" },
          phone: { value: null, confidence: null },
          email: { value: null, confidence: null }
        },
        line_items: [
          {
            description: { value: "Cloud Infrastructure Setup - Multi-region AWS and GCP staging & production deployment", confidence: "high" },
            quantity: { value: 1, confidence: "high" },
            unit_price: { value: 12400.00, confidence: "high" },
            tax_rate: { value: 19.0, confidence: "high" },
            amount: { value: 12400.00, confidence: "high" }
          },
          {
            description: { value: "Data Migration Service - Legacy Oracle DB schema parsing and sync to PostgreSQL RDS", confidence: "high" },
            quantity: { value: 1, confidence: "high" },
            unit_price: { value: 8750.00, confidence: "high" },
            tax_rate: { value: 19.0, confidence: "high" },
            amount: { value: 8750.00, confidence: "high" }
          },
          {
            description: { value: "API Development - Go-based microservices development (6 core endpoints)", confidence: "high" },
            quantity: { value: 6, confidence: "high" },
            unit_price: { value: 1500.00, confidence: "high" },
            tax_rate: { value: 19.0, confidence: "high" },
            amount: { value: 9000.00, confidence: "high" }
          },
          {
            description: { value: "Security Audit - Third-party penetration testing and ISO 27001 vulnerability audit", confidence: "high" },
            quantity: { value: 1, confidence: "high" },
            unit_price: { value: 5200.00, confidence: "medium" },
            tax_rate: { value: 19.0, confidence: "high" },
            amount: { value: 5200.00, confidence: "high" }
          },
          {
            description: { value: "DevOps Pipeline - Fully automated CI/CD setup via GitHub Actions, Docker and Terraform", confidence: "high" },
            quantity: { value: 1, confidence: "high" },
            unit_price: { value: 3800.00, confidence: "high" },
            tax_rate: { value: 19.0, confidence: "high" },
            amount: { value: 3800.00, confidence: "high" }
          },
          {
            description: { value: "Technical Documentation - Architectural maps, code comments, API OpenAPI yaml specs", confidence: "medium" },
            quantity: { value: 240, confidence: "medium" },
            unit_price: { value: 85.00, confidence: "high" },
            tax_rate: { value: 19.0, confidence: "high" },
            amount: { value: 20400.00, confidence: "medium" }
          },
          {
            description: { value: "Training Sessions - Interactive video workshops on microservices deployment (3 days)", confidence: "high" },
            quantity: { value: 3, confidence: "high" },
            unit_price: { value: 2000.00, confidence: "high" },
            tax_rate: { value: 19.0, confidence: "high" },
            amount: { value: 6000.00, confidence: "high" }
          },
          {
            description: { value: "Support Package - 6-month tier-3 priority engineering support contract SLA", confidence: "high" },
            quantity: { value: 6, confidence: "high" },
            unit_price: { value: 1500.00, confidence: "high" },
            tax_rate: { value: 19.0, confidence: "high" },
            amount: { value: 9000.00, confidence: "high" }
          }
        ],
        totals: {
          subtotal: { value: 74550.00, confidence: "high" },
          tax_amount: { value: 14164.50, confidence: "high" },
          discount_amount: { value: 2000.00, confidence: "high" },
          shipping: { value: null, confidence: null },
          total_amount: { value: 86714.50, confidence: "high" }
        },
        payment: {
          payment_terms: { value: "Net 45", confidence: "high" },
          payment_method: { value: "Wire Transfer", confidence: "high" },
          bank_name: { value: "Deutsche Bank", confidence: "high" },
          account_number: { value: "DE89700200300012345678", confidence: "high" },
          routing_number: { value: "DBANKDEMM", confidence: "high" }
        },
        notes: { value: "Garantieansprüche und Leistungsbedingungen unterliegen unseren AGB. Bitte überweisen Sie den Betrag unter Angabe der Rechnungsnummer.", confidence: "medium" }
      }
    },
    handwritten: {
      name: 'Handwritten Invoice',
      description: 'Emergency plumbing scanned invoice',
      imagePath: 'assets/samples/sample-handwritten.png',
      result: {
        invoice: {
          invoice_number: { value: "0034", confidence: "medium" },
          invoice_date: { value: "2024-11-08", confidence: "medium" },
          due_date: { value: "2024-11-08", confidence: "medium" },
          purchase_order: { value: null, confidence: null },
          currency: { value: "USD", confidence: "high" }
        },
        vendor: {
          name: { value: "Mike's Plumbing Service", confidence: "medium" },
          address: { value: "48 Oak Lane, Portland, OR", confidence: "medium" },
          phone: { value: "503-555-0145", confidence: "medium" },
          email: null,
          tax_id: null,
          website: null
        },
        customer: {
          name: { value: "Johnson Residence", confidence: "medium" },
          address: { value: "127 Maple Street", confidence: "medium" },
          phone: null,
          email: null
        },
        line_items: [
          {
            description: { value: "Emergency pipe repair - kitchen sink drain line fix", confidence: "medium" },
            quantity: { value: 1, confidence: "medium" },
            unit_price: { value: 185.00, confidence: "medium" },
            tax_rate: { value: 0.00, confidence: "high" },
            amount: { value: 185.00, confidence: "medium" }
          },
          {
            description: { value: "Replacement parts - copper pipe, joints & solder paste", confidence: "medium" },
            quantity: { value: 4, confidence: "medium" },
            unit_price: { value: 12.50, confidence: "medium" },
            tax_rate: { value: 0.00, confidence: "high" },
            amount: { value: 50.00, confidence: "medium" }
          },
          {
            description: { value: "Labor - 3 hours on-site repair time", confidence: "high" },
            quantity: { value: 3, confidence: "high" },
            unit_price: { value: 75.00, confidence: "high" },
            tax_rate: { value: 0.00, confidence: "high" },
            amount: { value: 225.00, confidence: "high" }
          },
          {
            description: { value: "Drain cleaning services", confidence: "low" },
            quantity: { value: 1, confidence: "high" },
            unit_price: { value: 95.00, confidence: "low" },
            tax_rate: { value: 0.00, confidence: "high" },
            amount: { value: 95.00, confidence: "low" }
          }
        ],
        totals: {
          subtotal: { value: 555.00, confidence: "medium" },
          tax_amount: { value: 0.00, confidence: "high" },
          discount_amount: { value: null, confidence: null },
          shipping: { value: null, confidence: null },
          total_amount: { value: 555.00, confidence: "medium" }
        },
        payment: {
          payment_terms: { value: "Due on receipt", confidence: "high" },
          payment_method: { value: "Cash or Check", confidence: "medium" },
          bank_name: null,
          account_number: null,
          routing_number: null
        },
        notes: { value: "Plumbing repair completed. Emergency dispatch fee waived. Thank you!", confidence: "medium" }
      }
    },
    slack: {
      name: 'Slack Invoice',
      description: 'Standard Slack SaaS billing statement',
      imagePath: 'assets/samples/sample-slack.png',
      result: {
        invoice: {
          invoice_number: { value: "1223113", confidence: "high" },
          invoice_date: { value: "2023-12-01", confidence: "high" },
          due_date: { value: "2024-01-15", confidence: "high" },
          purchase_order: { value: null, confidence: null },
          currency: { value: "USD", confidence: "high" }
        },
        vendor: {
          name: { value: "Slack", confidence: "high" },
          address: { value: "500 Howard Street, San Francisco, CA 94105", confidence: "high" },
          phone: { value: null, confidence: null },
          email: { value: null, confidence: null },
          tax_id: { value: null, confidence: null },
          website: { value: null, confidence: null }
        },
        customer: {
          name: { value: "MineralTree", confidence: "high" },
          address: { value: "101 Arch Street, Boston, MA 02110", confidence: "high" },
          phone: { value: null, confidence: null },
          email: { value: null, confidence: null }
        },
        line_items: [
          {
            description: { value: "Business+ Monthly User License - August 2023", confidence: "high" },
            quantity: { value: 115, confidence: "high" },
            unit_price: { value: 15.00, confidence: "high" },
            tax_rate: { value: 0.00, confidence: "high" },
            amount: { value: 1725.00, confidence: "high" }
          }
        ],
        totals: {
          subtotal: { value: 1725.00, confidence: "high" },
          tax_amount: { value: 0.00, confidence: "high" },
          discount_amount: { value: null, confidence: null },
          shipping: { value: null, confidence: null },
          total_amount: { value: 1725.00, confidence: "high" }
        },
        payment: {
          payment_terms: { value: "Net 45", confidence: "high" },
          payment_method: { value: null, confidence: null },
          bank_name: { value: null, confidence: null },
          account_number: { value: null, confidence: null },
          routing_number: { value: null, confidence: null }
        },
        notes: { value: null, confidence: null }
      }
    }
  },

  getSample(key) {
    return this.samples[key] || null;
  },

  getSampleKeys() {
    return Object.keys(this.samples);
  },

  async loadSampleImage(key) {
    const s = this.getSample(key);
    if (!s) throw new Error("Sample not found");

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Render it offscreen to generate a base64 representations
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve({
          base64: canvas.toDataURL('image/png'),
          width: img.width,
          height: img.height
        });
      };
      img.onerror = (e) => {
        reject(new Error(`Failed to load sample image for ${key}: ${s.imagePath}`));
      };
      img.src = s.imagePath;
    });
  },

  hasPrecomputedResult(key) {
    return !!(this.samples[key] && this.samples[key].result);
  },

  getPrecomputedResult(key) {
    return this.samples[key] ? this.samples[key].result : null;
  }
};
