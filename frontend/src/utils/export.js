/**
 * Export data array as downloadable CSV file
 */
export const exportToCSV = (filename, rows, headers) => {
  if (!rows || !rows.length) {
    alert('No data available to export.');
    return;
  }

  const separator = ',';
  const keys = Object.keys(headers);

  let csvContent =
    keys.map((k) => `"${headers[k]}"`).join(separator) + '\n';

  rows.forEach((row) => {
    const line = keys
      .map((k) => {
        let val = row[k] !== undefined && row[k] !== null ? row[k] : '';
        if (typeof val === 'object') {
          val = JSON.stringify(val);
        }
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      })
      .join(separator);
    csvContent += line + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Printable modal / window helper (supports Thermal Receipt printing)
 */
export const printElement = (title, elementId) => {
  const content = document.getElementById(elementId);
  if (!content) return;

  const isThermal = elementId.includes('thermal') || content.innerHTML.includes('SALES INVOICE');

  const printWindow = window.open('', '', 'width=450,height=700');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            padding: 10px;
            margin: 0 auto;
            color: #000;
            background: #fff;
            width: 300px;
            font-size: 11px;
            line-height: 1.2;
          }
          h2 { color: #0786C5; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 4px 0; text-align: left; }
          .flex { display: flex; justify-content: space-between; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
          .footer { margin-top: 20px; font-size: 10px; text-align: center; border-top: 1px dashed #000; padding-top: 10px; }
        </style>
      </head>
      <body>
        ${content.innerHTML}
        ${
          !isThermal
            ? `<div class="footer">
                <p>TrakZ Software Dev Corp - Official POS Receipt Print</p>
                <p>Printed on: ${new Date().toLocaleString()}</p>
              </div>`
            : ''
        }
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 300);
};
