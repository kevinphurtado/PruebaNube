import React, { useState, useMemo, useEffect } from 'react';
import { Invoice, Quote, CreditNote, Client, CompanyInfo, DianResolution } from '../types';
import { HistoryIcon, HelpIcon, SearchIcon, ExportIcon, DownloadIcon, ThreeDotsIcon } from './Icons';

interface HistoryProps {
    invoices: Invoice[];
    quotes: Quote[];
    creditNotes: CreditNote[];
    clients: Client[];
    companyInfo: CompanyInfo | null;
    dianResolution: DianResolution | null;
    updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => void;
    deleteInvoice: (invoiceId: string) => void;
    deleteQuote: (quoteId: string) => void;
    deleteCreditNote: (noteId: string) => void;
    onDuplicateInvoice: (invoice: Invoice) => void;
    onQuoteToInvoice: (quote: Quote) => void;
}

// --- Helper Functions and Components for PDF ---

const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);

// Function to convert number to words in Spanish
function numberToWords(n: number): string {
    const units = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const teens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
    const tens = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

    const convertGroup = (num: number): string => {
        let output = '';
        if (num === 100) return 'CIEN';
        if (num > 100) {
            output += hundreds[Math.floor(num / 100)] + ' ';
            num %= 100;
        }
        if (num >= 10 && num < 20) return output + teens[num - 10];
        if (num >= 20) {
            output += tens[Math.floor(num / 10)];
            if (num % 10 > 0) output += ' Y ' + units[num % 10];
        } else if (num > 0) {
            output += units[num];
        }
        return output.trim();
    };

    if (n === 0) return 'CERO';
    let words = '';
    if (n >= 1000000) {
        const millions = Math.floor(n / 1000000);
        words += (millions === 1 ? 'UN MILLON' : convertGroup(millions) + ' MILLONES');
        n %= 1000000;
        if (n > 0) words += ' ';
    }
    if (n >= 1000) {
        const thousands = Math.floor(n / 1000);
        words += (thousands === 1 ? 'MIL' : convertGroup(thousands) + ' MIL');
        n %= 1000;
        if (n > 0) words += ' ';
    }
    if (n > 0) words += convertGroup(n);
    
    return words.trim();
}

const PDFViewer: React.FC<{ onClose: () => void; children: React.ReactNode; }> = ({ onClose, children }) => {
    useEffect(() => {
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keyup', handleKeyUp);
        return () => window.removeEventListener('keyup', handleKeyUp);
    }, [onClose]);
    
    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 overflow-y-auto">
            <style>
            {`
                @media print {
                    body { -webkit-print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .pdf-viewer-content { margin: 0; box-shadow: none; border: none; }
                }
            `}
            </style>
            <div className="flex justify-center items-start min-h-screen p-4">
                <div className="w-full max-w-4xl bg-white shadow-lg my-8 font-[sans-serif] text-sm pdf-viewer-content">
                    {children}
                </div>
                <div className="no-print fixed top-4 right-4 flex flex-col space-y-2">
                    <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700">Imprimir</button>
                    <button onClick={onClose} className="px-4 py-2 bg-white text-gray-800 rounded-lg shadow-lg hover:bg-gray-200">Cerrar</button>
                </div>
            </div>
        </div>
    );
};

const InvoicePDF: React.FC<{ invoice: Invoice; client: Client; companyInfo: CompanyInfo; dianResolution: DianResolution; }> = ({ invoice, client, companyInfo, dianResolution }) => {
    const totalInWords = numberToWords(invoice.total);
    const cufe = invoice.cufe || 'Factura no emitida electrónicamente o en borrador';

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between mb-8">
                <div className="w-1/2">
                    {companyInfo.logoUrl && <img src={companyInfo.logoUrl} alt="Logo" className="h-16 mb-4"/>}
                    <h2 className="font-bold text-base">{companyInfo.name}</h2>
                    <p>NIT: {companyInfo.nit}</p>
                    <p>Resp. Fiscales: ${(companyInfo.fiscalResponsibilities || []).join(', ')}</p>
                    <p>{companyInfo.address}</p>
                    <p>{companyInfo.email}</p>
                    <p>{companyInfo.phone}</p>
                </div>
                <div className="w-1/2 text-right">
                    <h1 className="text-xl font-bold mb-4">FACTURA DE VENTA</h1>
                    <p><span className="font-bold">Número:</span> {invoice.id}</p>
                    <p><span className="font-bold">Fecha Emisión:</span> {invoice.issueDate}</p>
                    <p><span className="font-bold">Fecha Vencimiento:</span> {invoice.dueDate}</p>
                    <p><span className="font-bold">Forma de Pago:</span> {invoice.paymentForm}</p>
                    <p><span className="font-bold">Medio de Pago:</span> {invoice.paymentMethod}</p>
                </div>
            </div>
            {/* Client Info */}
            <div className="border-t border-b py-4 mb-8">
                <h3 className="font-bold">CLIENTE:</h3>
                <p className="font-bold text-base">{client.name}</p>
                <p>NIT: {client.idNumber}</p>
                <p>Resp. Fiscales: ${(client.fiscalResponsibilities || []).join(', ')}</p>
                <p>{client.address}</p>
            </div>
            {/* Line Items Table */}
            <table className="w-full mb-8">
                <thead className="bg-gray-100">
                    <tr className="text-left font-bold border-b">
                        <th className="p-2">Código</th>
                        <th className="p-2">Producto / Servicio</th>
                        <th className="p-2 text-center">Cant.</th>
                        <th className="p-2 text-right">V.Unit</th>
                        <th className="p-2 text-center">IVA</th>
                        <th className="p-2 text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.lineItems.map((item, i) => (
                        <tr key={i} className="border-b">
                            <td className="p-2">{item.productSku}</td>
                            <td className="p-2">{item.productName}</td>
                            <td className="p-2 text-center">{item.quantity}</td>
                            <td className="p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="p-2 text-center">{item.ivaRate}%</td>
                            <td className="p-2 text-right">{formatCurrency(item.unitPrice * item.quantity)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Footer Section */}
            <div className="flex justify-between">
                <div className="w-7/12">
                    {invoice.notes && <div className="mb-4"><p className="font-bold">Notas:</p><p>{invoice.notes}</p></div>}
                    <div className="flex">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(cufe)}`} alt="QR Code" className="w-24 h-24 mr-4"/>
                        <div>
                        <p className="font-bold">CUFE:</p>
                        <p className="break-all text-xs">{cufe}</p>
                        </div>
                    </div>
                </div>
                <div className="w-4/12">
                    <div className="space-y-2">
                        <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(invoice.subtotal)}</span></div>
                        <div className="flex justify-between"><span>Descuento:</span><span>- {formatCurrency(invoice.subtotal * (invoice.globalDiscountPercentage || 0) / 100)}</span></div>
                         <div className="flex justify-between"><span>IVA:</span><span>{formatCurrency(invoice.totalIva)}</span></div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2"><span>TOTAL:</span><span>{formatCurrency(invoice.total)}</span></div>
                    </div>
                    <p className="mt-4 text-xs"><span className="font-bold">Son:</span> {totalInWords} PESOS M/CTE</p>
                </div>
            </div>
            {/* DIAN Footer */}
            <div className="text-center text-xs text-gray-600 border-t mt-8 pt-4">
                <p>Resolución Facturación DIAN N° {dianResolution.number} de {dianResolution.date}. Prefijo {dianResolution.prefix} del {dianResolution.rangeFrom} al {dianResolution.rangeTo}. Vigencia {dianResolution.validity}.</p>
                <p>Generado con Nubifica | Página 1 de 1</p>
            </div>
        </div>
    );
};

const QuotePDF: React.FC<{ quote: Quote; client: Client; companyInfo: CompanyInfo; }> = ({ quote, client, companyInfo }) => {
    return (
        <div className="p-8">
            <div className="flex justify-between mb-8">
                <div className="w-1/2">
                    {companyInfo.logoUrl && <img src={companyInfo.logoUrl} alt="Logo" className="h-16 mb-4"/>}
                    <h2 className="font-bold text-base">{companyInfo.name}</h2>
                    <p>NIT: {companyInfo.nit}</p>
                    <p>{companyInfo.address}</p>
                    <p>{companyInfo.email} / {companyInfo.phone}</p>
                </div>
                <div className="w-1/2 text-right">
                    <h1 className="text-xl font-bold mb-4">COTIZACIÓN</h1>
                    <p><span className="font-bold">Número:</span> {quote.id}</p>
                    <p><span className="font-bold">Fecha:</span> {quote.issueDate}</p>
                </div>
            </div>
            <div className="border-t border-b py-4 mb-8">
                <h3 className="font-bold">CLIENTE:</h3>
                <p className="font-bold text-base">{client.name}</p>
                <p>NIT/CC: {client.idNumber}</p>
                <p>{client.address}</p>
            </div>
            <table className="w-full mb-8">
                <thead className="bg-gray-100"><tr className="text-left font-bold border-b"><th className="p-2">Código</th><th className="p-2">Producto / Servicio</th><th className="p-2 text-center">Cant.</th><th className="p-2 text-right">V.Unit</th><th className="p-2 text-center">IVA</th><th className="p-2 text-right">Total</th></tr></thead>
                <tbody>
                    {quote.lineItems.map((item, i) => (
                        <tr key={i} className="border-b"><td className="p-2">{item.productSku}</td><td className="p-2">{item.productName}</td><td className="p-2 text-center">{item.quantity}</td><td className="p-2 text-right">{formatCurrency(item.unitPrice)}</td><td className="p-2 text-center">{item.ivaRate}%</td><td className="p-2 text-right">{formatCurrency(item.total)}</td></tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-between">
                <div className="w-7/12">{quote.notes && <div className="mb-4"><p className="font-bold">Notas:</p><p className="whitespace-pre-wrap">{quote.notes}</p></div>}</div>
                <div className="w-4/12"><div className="space-y-2">
                    <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(quote.subtotal)}</span></div>
                    <div className="flex justify-between"><span>Descuento:</span><span>- {formatCurrency(quote.totalDiscount)}</span></div>
                    <div className="flex justify-between"><span>IVA:</span><span>{formatCurrency(quote.totalIva)}</span></div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2"><span>TOTAL:</span><span>{formatCurrency(quote.total)}</span></div>
                </div></div>
            </div>
            <div className="text-center text-xs text-gray-600 border-t mt-8 pt-4"><p>Generado con Nubifica</p></div>
        </div>
    );
};

const CreditNotePDF: React.FC<{ note: CreditNote; client: Client; companyInfo: CompanyInfo; }> = ({ note, client, companyInfo }) => {
    const noteTitle = note.type === 'Crédito (Devolución/Anulación)' ? 'NOTA CRÉDITO' : 'NOTA DÉBITO';
    return (
        <div className="p-8">
            <div className="flex justify-between mb-8">
                <div className="w-1/2">
                    {companyInfo.logoUrl && <img src={companyInfo.logoUrl} alt="Logo" className="h-16 mb-4"/>}
                    <h2 className="font-bold text-base">{companyInfo.name}</h2>
                    <p>NIT: {companyInfo.nit}</p>
                </div>
                <div className="w-1/2 text-right">
                    <h1 className="text-xl font-bold mb-4">{noteTitle}</h1>
                    <p><span className="font-bold">Número:</span> {note.id}</p>
                    <p><span className="font-bold">Fecha:</span> {note.issueDate}</p>
                </div>
            </div>
            <div className="border-t border-b py-4 mb-8 grid grid-cols-2">
                <div>
                    <h3 className="font-bold">CLIENTE:</h3>
                    <p className="font-bold text-base">{client.name}</p>
                    <p>NIT/CC: {client.idNumber}</p>
                </div>
                <div>
                    <p><span className="font-bold">Factura Afectada:</span> {note.invoiceId}</p>
                    <p><span className="font-bold">Motivo:</span> {note.reason}</p>
                </div>
            </div>
            <table className="w-full mb-8">
                <thead className="bg-gray-100"><tr className="text-left font-bold border-b"><th className="p-2">Producto / Servicio</th><th className="p-2 text-center">Cant.</th><th className="p-2 text-right">V.Unit</th><th className="p-2 text-right">Total</th></tr></thead>
                <tbody>
                    {note.lineItems.map((item, i) => (
                        <tr key={i} className="border-b"><td className="p-2">{item.productName}</td><td className="p-2 text-center">{item.quantity}</td><td className="p-2 text-right">{formatCurrency(item.unitPrice)}</td><td className="p-2 text-right">{formatCurrency(item.total)}</td></tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-between">
                <div className="w-7/12">{note.additionalNotes && <div className="mb-4"><p className="font-bold">Notas Adicionales:</p><p>{note.additionalNotes}</p></div>}</div>
                <div className="w-4/12"><div className="flex justify-between font-bold text-lg border-t pt-2"><span>TOTAL:</span><span>{formatCurrency(note.total)}</span></div></div>
            </div>
            <div className="text-center text-xs text-gray-600 border-t mt-8 pt-4"><p>Generado con Nubifica</p></div>
        </div>
    );
};

const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void; }> = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
        <nav className="flex justify-center items-center space-x-2 mt-8">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-sm text-gray-600 bg-white border rounded-md hover:bg-gray-100 disabled:opacity-50">Anterior</button>
            {pageNumbers.map(number => (<button key={number} onClick={() => onPageChange(number)} className={`px-4 py-2 text-sm border rounded-md ${currentPage === number ? 'bg-gray-200 text-gray-800 font-bold' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>{number}</button>))}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 text-sm text-gray-600 bg-white border rounded-md hover:bg-gray-100 disabled:opacity-50">Siguiente</button>
        </nav>
    );
};

type Tab = 'invoices' | 'quotes' | 'notes';

const ActionMenu: React.FC<{
    doc: Invoice | Quote | CreditNote;
    docType: 'invoice' | 'quote' | 'note';
    isOpen: boolean;
    onToggle: () => void;
    onUpdateStatus?: (status: Invoice['status']) => void;
    onDelete: () => void;
    onShareWhatsApp: () => void;
    onShareEmail: () => void;
    onDuplicate?: () => void;
    onConvertToInvoice?: () => void;
}> = ({ doc, docType, isOpen, onToggle, onUpdateStatus, onDelete, onShareWhatsApp, onShareEmail, onDuplicate, onConvertToInvoice }) => {
    if (!isOpen) return null;

    const handleDelete = () => {
        onDelete();
        onToggle(); // close menu
    };

    const handleUpdateStatus = (status: Invoice['status']) => {
        onUpdateStatus?.(status);
        onToggle();
    };
    
    const handleAction = (action: () => void) => {
        action();
        onToggle();
    }

    return (
        <div className="absolute right-4 top-10 z-10 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1" role="menu" aria-orientation="vertical">
                {docType === 'invoice' && onUpdateStatus && (
                    <>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleUpdateStatus('Pagada'); }} className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100">Marcar como Pagada</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleUpdateStatus('Enviada'); }} className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100">Marcar como Enviada</a>
                    </>
                )}
                {docType === 'invoice' && onDuplicate && (
                    <a href="#" onClick={(e) => { e.preventDefault(); handleAction(onDuplicate); }} className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100">Duplicar</a>
                )}
                {docType === 'quote' && onConvertToInvoice && (
                     <a href="#" onClick={(e) => { e.preventDefault(); handleAction(onConvertToInvoice); }} className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100">Convertir a Factura</a>
                )}
                {(docType === 'invoice' || docType === 'quote') && (
                     <>
                        <div className="border-t my-1"></div>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleAction(onShareWhatsApp); }} className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100">Enviar por WhatsApp</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleAction(onShareEmail); }} className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100">Enviar por Correo</a>
                    </>
                )}
                 <div className="border-t my-1"></div>
                 <a href="#" onClick={(e) => { e.preventDefault(); handleDelete(); }} className="text-red-600 block px-4 py-2 text-sm hover:bg-red-50">Eliminar</a>
            </div>
        </div>
    );
};


const History: React.FC<HistoryProps> = ({ invoices, quotes, creditNotes, clients, companyInfo, dianResolution, updateInvoice, deleteInvoice, deleteQuote, deleteCreditNote, onDuplicateInvoice, onQuoteToInvoice }) => {
    const [activeTab, setActiveTab] = useState<Tab>('invoices');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const itemsPerPage = 5;
    const [viewingPdf, setViewingPdf] = useState<Invoice | null>(null);
    const [viewingQuotePdf, setViewingQuotePdf] = useState<Quote | null>(null);
    const [viewingCreditNotePdf, setViewingCreditNotePdf] = useState<CreditNote | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeMenu && !(event.target as HTMLElement).closest('.action-menu-container')) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeMenu]);

    const handleWhatsAppShare = (doc: Invoice | Quote) => {
        const client = clients.find(c => c.id === doc.clientId);
        if (!client || !client.phone) {
            alert('El cliente no tiene un número de teléfono registrado.');
            return;
        }
        const docType = 'dueDate' in doc ? 'Factura' : 'Cotización';
        const message = `Hola ${client.name}, te envío la ${docType} ${doc.id} por un total de ${formatCurrency(doc.total)}. Saludos.`;
        const whatsappUrl = `https://wa.me/${client.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };
    
    const handleEmailShare = (doc: Invoice | Quote) => {
        const client = clients.find(c => c.id === doc.clientId);
        if (!client || !client.email) {
            alert('El cliente no tiene un correo electrónico registrado.');
            return;
        }
        const docType = 'dueDate' in doc ? 'Factura' : 'Cotización';
        const subject = `${docType} ${doc.id} de ${companyInfo?.name || 'tu empresa'}`;
        const body = `Hola ${client.name},\n\nTe envío la ${docType} ${doc.id} por un total de ${formatCurrency(doc.total)}.\n\nPor favor, descarga el PDF y adjúntalo a este correo antes de enviarlo.\n\nSaludos,\n${companyInfo?.name || ''}`;
        const mailtoUrl = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;
    };

    const getStatusBadge = (status: Invoice['status'] | Quote['status'] | CreditNote['status']) => {
        switch (status) { case 'Pagada': case 'Aceptada': case 'Aplicada': return 'bg-green-100 text-green-800'; case 'Vencida': case 'Rechazada': return 'bg-red-100 text-red-800'; case 'Enviada': return 'bg-blue-100 text-blue-800'; case 'Borrador': return 'bg-yellow-100 text-yellow-800'; default: return 'bg-gray-100 text-gray-800'; }
    };
    
    const filteredInvoices = useMemo(() => invoices.filter(inv => inv.id.toLowerCase().includes(searchTerm.toLowerCase()) || inv.clientName.toLowerCase().includes(searchTerm.toLowerCase())), [invoices, searchTerm]);
    const filteredQuotes = useMemo(() => quotes.filter(q => q.id.toLowerCase().includes(searchTerm.toLowerCase()) || q.clientName.toLowerCase().includes(searchTerm.toLowerCase())), [quotes, searchTerm]);
    const filteredCreditNotes = useMemo(() => creditNotes.filter(cn => cn.id.toLowerCase().includes(searchTerm.toLowerCase()) || cn.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || cn.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())), [creditNotes, searchTerm]);
    
    const dataMap = { invoices: filteredInvoices, quotes: filteredQuotes, notes: filteredCreditNotes };
    const currentData = dataMap[activeTab];
    const totalPages = Math.ceil(currentData.length / itemsPerPage);
    const paginatedData = currentData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleTabClick = (tab: Tab) => { setActiveTab(tab); setCurrentPage(1); setSearchTerm(''); };
    
    const clientForPdf = useMemo(() => clients.find(c => c.id === viewingPdf?.clientId), [clients, viewingPdf]);
    const clientForQuotePdf = useMemo(() => clients.find(c => c.id === viewingQuotePdf?.clientId), [clients, viewingQuotePdf]);
    const clientForCreditNotePdf = useMemo(() => clients.find(c => c.id === viewingCreditNotePdf?.clientId), [clients, viewingCreditNotePdf]);

    const renderContent = () => {
        if (paginatedData.length === 0) return <p className="text-center text-gray-500 py-16">No se encontraron documentos.</p>;
        if (activeTab === 'invoices') return (
            <table className="min-w-full">
                <thead><tr className="border-b text-left text-xs text-gray-500 uppercase"><th className="py-3 px-4 font-semibold"># Factura</th><th className="py-3 px-4 font-semibold">Fecha</th><th className="py-3 px-4 font-semibold">Cliente</th><th className="py-3 px-4 font-semibold text-right">Total</th><th className="py-3 px-4 font-semibold text-center">Estado y Acciones</th></tr></thead>
                <tbody className="text-gray-700">
                    {(paginatedData as Invoice[]).map(invoice => (
                        <tr key={invoice.id} className="border-b border-gray-200"><td className="py-3 px-4 font-medium text-gray-800">{invoice.id}</td><td className="py-3 px-4">{invoice.issueDate}</td><td className="py-3 px-4">{invoice.clientName}</td><td className="py-3 px-4 text-right">{formatCurrency(invoice.total)}</td>
                            <td className="py-3 px-4"><div className="flex items-center justify-center space-x-3">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusBadge(invoice.status)}`}>{invoice.status}</span>
                                <button onClick={() => setViewingPdf(invoice)} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow"><DownloadIcon /></button>
                                <div className="relative action-menu-container">
                                    <button onClick={() => setActiveMenu(activeMenu === invoice.id ? null : invoice.id)} className="p-2 rounded-full hover:bg-gray-200"><ThreeDotsIcon /></button>
                                    <ActionMenu doc={invoice} docType="invoice" isOpen={activeMenu === invoice.id} onToggle={() => setActiveMenu(null)} onUpdateStatus={(status) => updateInvoice(invoice.id, { status })} onDelete={() => deleteInvoice(invoice.id)} onShareWhatsApp={() => handleWhatsAppShare(invoice)} onShareEmail={() => handleEmailShare(invoice)} onDuplicate={() => onDuplicateInvoice(invoice)} />
                                </div>
                            </div></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
        if (activeTab === 'quotes') return (
            <table className="min-w-full">
                <thead><tr className="border-b text-left text-xs text-gray-500 uppercase"><th className="py-3 px-4 font-semibold"># Cotización</th><th className="py-3 px-4 font-semibold">Fecha</th><th className="py-3 px-4 font-semibold">Cliente</th><th className="py-3 px-4 font-semibold text-right">Total</th><th className="py-3 px-4 font-semibold text-center">Estado y Acciones</th></tr></thead>
                <tbody className="text-gray-700">
                    {(paginatedData as Quote[]).map(quote => (
                        <tr key={quote.id} className="border-b border-gray-200"><td className="py-3 px-4 font-medium text-gray-800">{quote.id}</td><td className="py-3 px-4">{quote.issueDate}</td><td className="py-3 px-4">{quote.clientName}</td><td className="py-3 px-4 text-right">{formatCurrency(quote.total)}</td>
                            <td className="py-3 px-4"><div className="flex items-center justify-center space-x-3">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusBadge(quote.status)}`}>{quote.status}</span>
                                <button onClick={() => setViewingQuotePdf(quote)} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow"><DownloadIcon /></button>
                                <div className="relative action-menu-container">
                                    <button onClick={() => setActiveMenu(activeMenu === quote.id ? null : quote.id)} className="p-2 rounded-full hover:bg-gray-200"><ThreeDotsIcon /></button>
                                    <ActionMenu doc={quote} docType="quote" isOpen={activeMenu === quote.id} onToggle={() => setActiveMenu(null)} onDelete={() => deleteQuote(quote.id)} onShareWhatsApp={() => handleWhatsAppShare(quote)} onShareEmail={() => handleEmailShare(quote)} onConvertToInvoice={() => onQuoteToInvoice(quote)} />
                                </div>
                            </div></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
        if (activeTab === 'notes') return (
            <table className="min-w-full">
                <thead><tr className="border-b text-left text-xs text-gray-500 uppercase"><th className="py-3 px-4 font-semibold"># Nota</th><th className="py-3 px-4 font-semibold">Factura Afectada</th><th className="py-3 px-4 font-semibold">Fecha</th><th className="py-3 px-4 font-semibold">Cliente</th><th className="py-3 px-4 font-semibold text-right">Total</th><th className="py-3 px-4 font-semibold text-center">Estado y Acciones</th></tr></thead>
                <tbody className="text-gray-700">
                    {(paginatedData as CreditNote[]).map(note => (
                        <tr key={note.id} className="border-b border-gray-200"><td className="py-3 px-4 font-medium text-gray-800">{note.id}</td><td className="py-3 px-4">{note.invoiceId}</td><td className="py-3 px-4">{note.issueDate}</td><td className="py-3 px-4">{note.clientName}</td><td className="py-3 px-4 text-right">{formatCurrency(note.total)}</td>
                            <td className="py-3 px-4"><div className="flex items-center justify-center space-x-3">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusBadge(note.status)}`}>{note.status}</span>
                                <button onClick={() => setViewingCreditNotePdf(note)} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow"><DownloadIcon /></button>
                                <div className="relative action-menu-container">
                                    <button onClick={() => setActiveMenu(activeMenu === note.id ? null : note.id)} className="p-2 rounded-full hover:bg-gray-200"><ThreeDotsIcon /></button>
                                    <ActionMenu doc={note} docType="note" isOpen={activeMenu === note.id} onToggle={() => setActiveMenu(null)} onDelete={() => deleteCreditNote(note.id)} onShareWhatsApp={() => {}} onShareEmail={() => {}}/>
                                </div>
                            </div></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div>
            {viewingPdf && clientForPdf && companyInfo && dianResolution && <PDFViewer onClose={() => setViewingPdf(null)}><InvoicePDF invoice={viewingPdf} client={clientForPdf} companyInfo={companyInfo} dianResolution={dianResolution} /></PDFViewer>}
            {viewingQuotePdf && clientForQuotePdf && companyInfo && <PDFViewer onClose={() => setViewingQuotePdf(null)}><QuotePDF quote={viewingQuotePdf} client={clientForQuotePdf} companyInfo={companyInfo} /></PDFViewer>}
            {viewingCreditNotePdf && clientForCreditNotePdf && companyInfo && <PDFViewer onClose={() => setViewingCreditNotePdf(null)}><CreditNotePDF note={viewingCreditNotePdf} client={clientForCreditNotePdf} companyInfo={companyInfo} /></PDFViewer>}
            
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center"><HistoryIcon /><h1 className="text-3xl font-bold text-gray-800 ml-3">Historial</h1></div>
                <div className="flex items-center space-x-2">
                    <button className="p-2 bg-white border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100"><HelpIcon /></button>
                    <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon className="h-5 w-5 text-gray-400" /></span><input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" /></div>
                    <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"><ExportIcon /> Exportar a Excel</button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
                <div className="flex items-center border-b border-gray-200 mb-4">
                    <button onClick={() => handleTabClick('invoices')} className={`px-4 py-2 font-semibold ${activeTab === 'invoices' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Facturas</button>
                    <button onClick={() => handleTabClick('quotes')} className={`px-4 py-2 font-semibold ${activeTab === 'quotes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Cotizaciones</button>
                    <button onClick={() => handleTabClick('notes')} className={`px-4 py-2 font-semibold ${activeTab === 'notes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Notas C/D</button>
                </div>
                <div className="overflow-x-auto">{renderContent()}</div>
                {totalPages > 1 && (<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />)}
            </div>
        </div>
    );
};

export default History;