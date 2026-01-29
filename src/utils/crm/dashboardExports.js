import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

/**
 * Export dashboard as PDF
 * @param {string} elementId - DOM element ID to capture
 * @param {string} filename - Output filename
 */
export const exportToPDF = async (elementId, filename = 'CRM-Dashboard.pdf') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Element not found');

    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(filename);
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
};

/**
 * Export data as CSV
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Output filename
 */
export const exportToCSV = (data, filename = 'dashboard-data.csv') => {
  try {
    if (!data || data.length === 0) throw new Error('No data to export');

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => JSON.stringify(row[header] || '')).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('CSV export failed:', error);
    throw error;
  }
};

/**
 * Export data as Excel
 * @param {Object} sheets - Object with sheet names as keys and data arrays as values
 * @param {string} filename - Output filename
 */
export const exportToExcel = (sheets, filename = 'dashboard-data.xlsx') => {
  try {
    const workbook = XLSX.utils.book_new();

    Object.entries(sheets).forEach(([sheetName, data]) => {
      if (data && data.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }
    });

    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Excel export failed:', error);
    throw error;
  }
};
