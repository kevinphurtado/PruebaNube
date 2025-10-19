import { Client, Product, Invoice, Quote, CreditNote, Expense, ExpenseCategory, CompanyInfo, DianResolution, UserAccount, ConnectionLog, FaqItem, SupportTicket, StockMovement } from './types';

export const initialClients: Client[] = [
    { id: 'CL-1', name: 'Constructora S.A.S', idType: 'NIT', idNumber: '900.123.456-7', address: 'Calle 100 # 20-30', phone: '3101234567', email: 'compras@constructora.com', fiscalResponsibilities: ['IVA', 'ReteFuente'] },
    { id: 'CL-2', name: 'Juan Pérez', idType: 'Cédula', idNumber: '1.234.567.890', address: 'Carrera 5 # 15-25', phone: '3209876543', email: 'juan.perez@email.com', fiscalResponsibilities: ['No responsable de IVA'] },
];

export const initialProducts: Product[] = [
    { id: 'PROD-1', sku: 'CEM-001', name: 'Cemento Gris 50kg', description: 'Cemento Portland para construcción', price: 28000, cost: 22000, stock: 150, ivaRate: 19, type: 'product', lowStockThreshold: 20 },
    { id: 'PROD-2', sku: 'VAR-001', name: 'Varilla de Acero 1/2"', description: 'Varilla corrugada para refuerzo', price: 35000, cost: 29000, stock: 300, ivaRate: 19, type: 'product', lowStockThreshold: 50 },
    { id: 'PROD-3', sku: 'SERV-01', name: 'Asesoría de Ingeniería', description: 'Hora de asesoría especializada', price: 150000, stock: 100, ivaRate: 19, type: 'service' },
];

export const initialStockMovements: StockMovement[] = [
    { id: 'MOV-1', productId: 'PROD-1', productName: 'Cemento Gris 50kg', date: '2023-10-01', type: 'Entrada', quantity: 200, notes: 'Compra inicial' },
    { id: 'MOV-2', productId: 'PROD-2', productName: 'Varilla de Acero 1/2"', date: '2023-10-01', type: 'Entrada', quantity: 500, notes: 'Compra inicial' },
    { id: 'MOV-3', productId: 'PROD-1', productName: 'Cemento Gris 50kg', date: '2023-10-15', type: 'Venta', quantity: -50, notes: 'Venta Factura FVC-1' },
];

export const initialInvoices: Invoice[] = [
    {
        id: 'FVC-1', clientId: 'CL-1', clientName: 'Constructora S.A.S', issueDate: '2023-10-15', dueDate: '2023-11-14',
        lineItems: [
            { productId: 'PROD-1', productSku: 'CEM-001', productName: 'Cemento Gris 50kg', quantity: 50, unitPrice: 28000, ivaRate: 19, total: 1400000 },
        ],
        subtotal: 1400000, totalIva: 266000, total: 1666000, status: 'Pagada', paymentForm: 'Crédito', paymentMethod: 'Transferencia',
        cufe: 'e4a2c1f017b2b0a3c9e8d7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0'
    }
];

export const initialQuotes: Quote[] = [
    {
        id: 'COT-1', clientId: 'CL-2', clientName: 'Juan Pérez', issueDate: '2023-10-20',
        lineItems: [
            { productId: 'PROD-2', productSku: 'VAR-001', productName: 'Varilla de Acero 1/2"', quantity: 10, unitPrice: 35000, ivaRate: 19, total: 350000 }
        ],
        subtotal: 350000, totalIva: 66500, totalDiscount: 0, total: 416500,
        notes: 'Validez de la oferta: 15 días.', discountType: 'percentage', discountValue: 0, status: 'Enviada'
    }
];

export const initialCreditNotes: CreditNote[] = [];

export const initialExpenses: Expense[] = [
    { id: 'EXP-1', date: '2023-10-05', categoryId: 'CAT-1', categoryName: 'Arriendo', description: 'Arriendo de oficina Octubre', amount: 1200000 },
    { id: 'EXP-2', date: '2023-10-10', categoryId: 'CAT-2', categoryName: 'Servicios Públicos', description: 'Factura de energía', amount: 250000 }
];

export const initialExpenseCategories: ExpenseCategory[] = [
    { id: 'CAT-1', name: 'Arriendo' },
    { id: 'CAT-2', name: 'Servicios Públicos' },
    { id: 'CAT-3', name: 'Nómina' },
];

export const initialCompanyInfo: CompanyInfo = {
    name: 'Mi Empresa S.A.S.',
    nit: '900.000.000-1',
    subscriptionEndDate: '2024-12-31',
    fiscalResponsibilities: ['IVA', 'ReteFuente'],
    address: 'Avenida Siempre Viva 123',
    city: 'Bogotá D.C.',
    phone: '3001234567',
    email: 'contacto@miempresa.com',
    showDianInfoInPdf: true,
    logoUrl: 'https://placehold.co/200x80.png?text=Mi+Logo',
};

export const initialDianResolution: DianResolution = {
    number: '18760000001',
    date: '2023-01-01',
    prefix: 'FVE',
    validity: '24 meses',
    rangeFrom: 1,
    rangeTo: 10000,
};

export const initialUserAccounts: UserAccount[] = [
    { id: 'USR-1', email: 'admin@nubifica.com', role: 'Administrador' },
];

export const initialConnectionLogs: ConnectionLog[] = [];

export const initialFaqItems: FaqItem[] = [
    { id: 'FAQ-1', question: '¿Cómo creo una factura?', answer: 'Ve a la sección de "Facturas", haz clic en "Nueva Factura", llena los datos del cliente, añade los productos y haz clic en "Guardar y Emitir".' },
    { id: 'FAQ-2', question: '¿Puedo personalizar el logo de mi empresa?', answer: 'Sí, en la sección de "Configuración", en la tarjeta de "Datos del Emisor", puedes añadir la URL de tu logo.' },
];

export const initialSupportTickets: SupportTicket[] = [];