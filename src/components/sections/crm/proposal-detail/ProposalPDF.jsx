'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#1976d2',
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  proposalNumber: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  validUntil: {
    fontSize: 12,
    color: '#666666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    textTransform: 'uppercase',
    borderBottom: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 11,
    color: '#666666',
    width: 120,
  },
  infoValue: {
    fontSize: 11,
    color: '#333333',
    flex: 1,
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottom: 2,
    borderBottomColor: '#1976d2',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tableCell: {
    fontSize: 10,
    color: '#333333',
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
  },
  colType: {
    width: '15%',
  },
  colDescription: {
    width: '40%',
  },
  colQuantity: {
    width: '15%',
    textAlign: 'right',
  },
  colUnitPrice: {
    width: '15%',
    textAlign: 'right',
  },
  colTotal: {
    width: '15%',
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 20,
    marginLeft: 'auto',
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  totalLabel: {
    fontSize: 11,
    color: '#666666',
  },
  totalValue: {
    fontSize: 11,
    color: '#333333',
    fontWeight: 'bold',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginTop: 5,
    borderTop: 2,
    borderTopColor: '#1976d2',
  },
  grandTotalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  grandTotalValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  terms: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderLeft: 3,
    borderLeftColor: '#1976d2',
  },
  termsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 10,
    color: '#666666',
    lineHeight: 1.6,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#999999',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 40,
    fontSize: 9,
    color: '#999999',
  },
});

const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * ProposalPDF Component
 *
 * Generates a professional PDF document for a proposal using @react-pdf/renderer.
 *
 * @param {Object} props
 * @param {Object} props.proposal - Proposal object with line_items, opportunity, and account
 *
 * Expected proposal structure:
 * {
 *   proposal_number: string,
 *   title: string,
 *   description: string,
 *   valid_until: string (ISO date),
 *   subtotal: number,
 *   tax_rate: number,
 *   tax_amount: number,
 *   total_amount: number,
 *   terms_and_conditions: string,
 *   line_items: Array<{
 *     item_type: string,
 *     description: string,
 *     quantity: number,
 *     unit_price: number,
 *     total_price: number
 *   }>,
 *   opportunity: { name: string },
 *   account: { name: string, billing_address: string, billing_city: string, billing_state: string, billing_zip: string }
 * }
 */
const ProposalPDF = ({ proposal }) => {
  if (!proposal) {
    return null;
  }

  const {
    proposal_number,
    title,
    description,
    valid_until,
    subtotal = 0,
    tax_rate = 0,
    tax_amount = 0,
    total_amount = 0,
    terms_and_conditions,
    line_items = [],
    opportunity,
    account,
  } = proposal;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PROPOSAL</Text>
          <Text style={styles.proposalNumber}>Proposal Number: {proposal_number}</Text>
          <Text style={styles.validUntil}>Valid Until: {formatDate(valid_until)}</Text>
        </View>

        {/* Proposal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Proposal Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Title:</Text>
            <Text style={styles.infoValue}>{title}</Text>
          </View>
          {description && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Description:</Text>
              <Text style={styles.infoValue}>{description}</Text>
            </View>
          )}
          {opportunity && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Opportunity:</Text>
              <Text style={styles.infoValue}>{opportunity.name}</Text>
            </View>
          )}
        </View>

        {/* Client Info */}
        {account && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Client Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Company:</Text>
              <Text style={styles.infoValue}>{account.name}</Text>
            </View>
            {account.billing_address && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>
                  {account.billing_address}
                  {account.billing_city && `, ${account.billing_city}`}
                  {account.billing_state && `, ${account.billing_state}`}
                  {account.billing_zip && ` ${account.billing_zip}`}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Line Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Line Items</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colType]}>Type</Text>
              <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
              <Text style={[styles.tableHeaderCell, styles.colQuantity]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.colUnitPrice]}>Unit Price</Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
            </View>
            {/* Table Rows */}
            {line_items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colType]}>
                  {item.item_type ? item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1) : '—'}
                </Text>
                <Text style={[styles.tableCell, styles.colDescription]}>{item.description}</Text>
                <Text style={[styles.tableCell, styles.colQuantity]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.colUnitPrice]}>
                  {formatCurrency(item.unit_price)}
                </Text>
                <Text style={[styles.tableCell, styles.colTotal]}>
                  {formatCurrency(item.total_price)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({tax_rate}%):</Text>
            <Text style={styles.totalValue}>{formatCurrency(tax_amount)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(total_amount)}</Text>
          </View>
        </View>

        {/* Terms and Conditions */}
        {terms_and_conditions && (
          <View style={styles.terms}>
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
            <Text style={styles.termsText}>{terms_and_conditions}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          This proposal is valid until {formatDate(valid_until)}
        </Text>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
};

export default ProposalPDF;
