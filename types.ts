export interface Client {
  id: string;
  name: string;
  idType: 'NIT' | 'Cédula' | 'Otro';
  idNumber: string;
  address: string;
  phone: string;
  email: string;
  fiscalResponsibilities: string[];
}

export interface Product {
  id: string;
  sku: string;
  name:string;
  description: string;
  price: number; // Price before tax
  cost?: number; // Cost of product, optional
  stock: number;
  ivaRate: number; // e.g., 19 for 19%
  type: 'product' | 'service';
  lowStockThreshold?: number; // Optional low stock alert threshold
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  date: string;
  type: 'Entrada' | 'Venta' | 'Ajuste';
  quantity: number; // positive for entry, negative for sale
  notes: string;
  relatedDocument?: string;
}

export interface InvoiceLineItem {
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  ivaRate: number;
  total: number;
}

export interface Invoice {
  id: string; // Consecutive number like FVC67
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  totalIva: number;
  total: number;
  status: 'Borrador' | 'Pagada' | 'Vencida' | 'Enviada';
  paymentForm?: 'Contado' | 'Crédito';
  paymentMethod?: 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Otro';
  globalDiscountPercentage?: number;
  retencionFuentePercentage?: number;
  icaPercentage?: number;
  notes?: string;
  isContingency?: boolean;
  cufe?: string;
}

export interface QuoteLineItem {
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  ivaRate: number;
  total: number;
}

export interface Quote {
  id: string; // Consecutive number like COT-001
  clientId: string;
  clientName: string;
  issueDate: string;
  lineItems: QuoteLineItem[];
  notes: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  subtotal: number;
  totalIva: number;
  totalDiscount: number;
  total: number;
  status: 'Borrador' | 'Enviada' | 'Aceptada' | 'Rechazada';
}

export interface CreditNoteLineItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}


export interface CreditNote {
  id: string; // e.g., NC-001
  invoiceId: string;
  clientId: string;
  clientName: string;
  issueDate: string;
  type: 'Crédito (Devolución/Anulación)' | 'Débito (Intereses/Gasto)';
  reason: string;
  lineItems: CreditNoteLineItem[];
  total: number;
  additionalNotes: string;
  status: 'Borrador' | 'Aplicada';
}

export interface ExpenseCategory {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  categoryId: string;
  categoryName: string; // Denormalized for easy display
  description: string;
  amount: number;
}

export interface CompanyInfo {
  name: string;
  nit: string;
  subscriptionEndDate: string;
  fiscalResponsibilities: string[];
  address: string;
  city: string;
  phone: string;
  email: string;
  showDianInfoInPdf: boolean;
  logoUrl?: string;
}

export interface DianResolution {
  number: string;
  date: string;
  prefix: string;
  validity: string; // e.g., "12 meses"
  rangeFrom: number;
  rangeTo: number;
}

export interface UserAccount {
  id: string;
  email: string;
  role: 'Administrador' | 'Usuario';
}

export interface ConnectionLog {
  id: string;
  userEmail: string;
  timestamp: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'Facturación' | 'Inventario' | 'Reporte de Error' | 'Duda General';
  description: string;
  status: 'Abierto' | 'En Proceso' | 'Resuelto';
  date: string; // YYYY-MM-DD
}