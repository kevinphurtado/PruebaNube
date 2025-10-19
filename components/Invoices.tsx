import React, { useState, useMemo } from 'react';
import { Client, Product, Invoice, InvoiceLineItem, CompanyInfo, DianResolution } from '../types';
import { PlusIcon, DeleteIcon, SaveIcon, InvoicesIcon } from './Icons';

interface InvoicesProps {
    clients: Client[];
    products: Product[];
    addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
    companyInfo: CompanyInfo | null;
    dianResolution: DianResolution | null;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);

// Helper function to generate a simulated CUFE
const generateCUFE = (): string => {
    // A real CUFE is a SHA-384 hash. We'll simulate it with a random hex string.
    const array = new Uint8Array(48); // 48 bytes = 384 bits
    window.crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
};

const Invoices: React.FC<InvoicesProps> = ({ clients, products, addInvoice, companyInfo, dianResolution }) => {
    const [clientId, setClientId] = useState('');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]);
    const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
    const [paymentForm, setPaymentForm] = useState<'Contado' | 'Crédito'>('Contado');
    const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Otro'>('Efectivo');
    const [notes, setNotes] = useState('');

    const selectedClient = useMemo(() => clients.find(c => c.id === clientId), [clientId, clients]);

    const handleAddLineItem = () => {
        const firstProduct = products[0];
        if (!firstProduct) {
            alert("No hay productos para añadir.");
            return;
        }
        setLineItems(prev => [
            ...prev,
            {
                productId: firstProduct.id,
                productSku: firstProduct.sku,
                productName: firstProduct.name,
                quantity: 1,
                unitPrice: firstProduct.price,
                ivaRate: firstProduct.ivaRate,
                total: firstProduct.price,
            },
        ]);
    };

    const handleLineItemChange = (index: number, field: keyof InvoiceLineItem, value: any) => {
        const updatedItems = [...lineItems];
        const item = { ...updatedItems[index] };
        (item as any)[field] = value;

        if (field === 'productId') {
            const product = products.find(p => p.id === value);
            if (product) {
                item.productName = product.name;
                item.productSku = product.sku;
                item.unitPrice = product.price;
                item.ivaRate = product.ivaRate;
            }
        }
        
        if (field === 'quantity' || field === 'unitPrice' || field === 'productId') {
            item.total = item.quantity * item.unitPrice;
        }

        updatedItems[index] = item;
        setLineItems(updatedItems);
    };

    const handleRemoveLineItem = (index: number) => {
        setLineItems(prev => prev.filter((_, i) => i !== index));
    };

    const { subtotal, totalIva, total } = useMemo(() => {
        let sub = 0;
        let iva = 0;
        lineItems.forEach(item => {
            const itemSubtotal = item.quantity * item.unitPrice;
            sub += itemSubtotal;
            iva += itemSubtotal * (item.ivaRate / 100);
        });
        return { subtotal: sub, totalIva: iva, total: sub + iva };
    }, [lineItems]);
    
    const handleSaveInvoice = (status: 'Borrador' | 'Enviada') => {
        if (!selectedClient) {
            alert('Por favor, seleccione un cliente.');
            return;
        }
        if (lineItems.length === 0) {
            alert('Por favor, añada al menos un producto a la factura.');
            return;
        }
        
        const cufe = status === 'Enviada' ? generateCUFE() : undefined;
        
        const invoiceData: Omit<Invoice, 'id'> = {
            clientId: selectedClient.id,
            clientName: selectedClient.name,
            issueDate,
            dueDate,
            lineItems,
            subtotal,
            totalIva,
            total,
            status,
            paymentForm,
            paymentMethod,
            notes,
            cufe,
        };
        addInvoice(invoiceData);
        // Reset form
        setClientId('');
        setLineItems([]);
        setNotes('');
    };

    return (
        <div className="dark:text-gray-200">
            <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center">
                    <InvoicesIcon />
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 ml-3">Nueva Factura de Venta</h1>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border-t-4 border-blue-500">
                {/* Header */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
                        <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700" required>
                            <option value="">Seleccione un cliente</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {selectedClient && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selectedClient.idType}: {selectedClient.idNumber}</div>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Emisión</label>
                        <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Vencimiento</label>
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"/>
                    </div>
                </div>

                {/* Line Items */}
                <div className="overflow-x-auto mb-6">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-2/5">Producto / Servicio</th>
                                <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cant.</th>
                                <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">V. Unit</th>
                                <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">IVA</th>
                                <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                                <th className="py-2 px-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {lineItems.map((item, index) => (
                                <tr key={index}>
                                    <td className="p-2">
                                        <select value={item.productId} onChange={e => handleLineItemChange(index, 'productId', e.target.value)} className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600">
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-2"><input type="number" min="1" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', parseInt(e.target.value))} className="w-20 p-1 border rounded text-right dark:bg-gray-700 dark:border-gray-600"/></td>
                                    <td className="p-2"><input type="number" value={item.unitPrice} onChange={e => handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value))} className="w-32 p-1 border rounded text-right dark:bg-gray-700 dark:border-gray-600"/></td>
                                    <td className="p-2 text-right">{item.ivaRate}%</td>
                                    <td className="p-2 text-right">{formatCurrency(item.total)}</td>
                                    <td className="p-2 text-center"><button onClick={() => handleRemoveLineItem(index)} className="text-red-500 hover:text-red-700"><DeleteIcon /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button onClick={handleAddLineItem} className="flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800">
                    <PlusIcon className="h-4 w-4 mr-1"/> Añadir Línea
                </button>

                {/* Footer and Totals */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 pt-6 border-t dark:border-gray-700">
                    <div className="md:col-span-2 space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
                            <textarea rows={4} value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                        <div className="flex gap-4">
                             <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Forma de Pago</label>
                                <select value={paymentForm} onChange={e => setPaymentForm(e.target.value as any)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                    <option>Contado</option>
                                    <option>Crédito</option>
                                </select>
                            </div>
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medio de Pago</option>
                                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                    <option>Efectivo</option>
                                    <option>Transferencia</option>
                                    <option>Tarjeta</option>
                                    <option>Otro</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg space-y-2">
                        <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>IVA</span><span>{formatCurrency(totalIva)}</span></div>
                        <div className="flex justify-between font-bold text-xl text-gray-800 dark:text-gray-100 border-t dark:border-gray-600 pt-2 mt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>
                    </div>
                </div>

                 <div className="flex justify-end space-x-4 mt-8">
                    <button onClick={() => handleSaveInvoice('Borrador')} className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                        Guardar Borrador
                    </button>
                    <button onClick={() => handleSaveInvoice('Enviada')} className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md">
                        <SaveIcon /> Guardar y Emitir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Invoices;