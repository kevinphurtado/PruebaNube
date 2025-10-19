import React, { useState, useMemo } from 'react';
import { Invoice, Client, CreditNote, CreditNoteLineItem } from '../types';
import { PlusIcon, DeleteIcon, HelpIcon, SaveNoteIcon, CreditNoteIcon } from './Icons';

interface CreditNotesProps {
    invoices: Invoice[];
    clients: Client[];
    creditNotes: CreditNote[];
    addCreditNote: (note: Omit<CreditNote, 'id' | 'clientName' | 'status'>) => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);

const CreditNotes: React.FC<CreditNotesProps> = ({ invoices, clients, creditNotes, addCreditNote }) => {
    const [isLocked, setIsLocked] = useState(true);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
    const [noteType, setNoteType] = useState<'Crédito (Devolución/Anulación)' | 'Débito (Intereses/Gasto)'>('Crédito (Devolución/Anulación)');
    const [reason, setReason] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [noteDate, setNoteDate] = useState(new Date().toISOString().split('T')[0]);
    
    const selectedInvoice = useMemo(() => {
        return invoices.find(inv => inv.id === selectedInvoiceId);
    }, [selectedInvoiceId, invoices]);
    
    const client = useMemo(() => {
        if (!selectedInvoice) return null;
        return clients.find(c => c.id === selectedInvoice.clientId);
    }, [selectedInvoice, clients]);

    const total = useMemo(() => {
        return selectedInvoice?.total ?? 0;
    }, [selectedInvoice]);

    const nextNoteId = useMemo(() => {
        const maxNum = creditNotes
            .map(cn => parseInt(cn.id.replace('NC-', ''), 10) || 0)
            .reduce((max, num) => Math.max(max, num), 0);
        return `NC-${maxNum + 1}`;
    }, [creditNotes]);
    
    const handleClear = () => {
        setSelectedInvoiceId('');
        setReason('');
        setAdditionalNotes('');
        setNoteType('Crédito (Devolución/Anulación)');
        setNoteDate(new Date().toISOString().split('T')[0]);
        setIsLocked(true);
    };

    const handleNew = () => {
        handleClear();
        setIsLocked(false);
    };

    const handleGenerateNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInvoice || !client) {
            alert('Por favor, seleccione una factura válida.');
            return;
        }

        const creditNoteData: Omit<CreditNote, 'id' | 'clientName' | 'status'> = {
            invoiceId: selectedInvoice.id,
            clientId: client.id,
            issueDate: noteDate,
            type: noteType,
            reason: reason,
            lineItems: selectedInvoice.lineItems.map(item => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total
            })),
            total: selectedInvoice.total,
            additionalNotes: additionalNotes,
        };

        addCreditNote(creditNoteData);
        handleClear();
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <span className="bg-gray-200 p-2 rounded-full mr-4">
                        <CreditNoteIcon />
                    </span>
                    <h1 className="text-3xl font-bold text-gray-800">Crear Nota Crédito/Débito</h1>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="p-2 bg-white border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100">
                        <HelpIcon />
                    </button>
                    <button onClick={handleNew} className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200">
                        <PlusIcon /> Nueva
                    </button>
                    <button onClick={handleClear} className="flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">
                        <DeleteIcon /> Limpiar
                    </button>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleGenerateNote}>
                <fieldset disabled={isLocked} className="bg-white p-8 rounded-lg shadow-md border-t-4 border-blue-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Factura a modificar</label>
                            <div className="flex">
                                <select 
                                    value={selectedInvoiceId} 
                                    onChange={(e) => setSelectedInvoiceId(e.target.value)}
                                    className="flex-grow p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Seleccione una factura</option>
                                    {[...invoices].sort((a,b) => b.id.localeCompare(a.id)).map(inv => <option key={inv.id} value={inv.id}>{`${inv.id} - ${inv.clientName}`}</option>)}
                                </select>
                                <button type="button" className="px-4 py-2 bg-gray-100 border-t border-b border-r border-gray-300 text-gray-600 rounded-r-md hover:bg-gray-200">Buscar</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                            <input type="text" readOnly value={client?.name || ''} className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nº Documento</label>
                            <input type="text" readOnly value={selectedInvoice ? nextNoteId : 'Seleccione Factura'} className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                            <input type="date" value={noteDate} onChange={e => setNoteDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Nota</label>
                            <select value={noteType} onChange={e => setNoteType(e.target.value as any)} className="w-full p-2 border border-gray-300 rounded-md">
                                <option>Crédito (Devolución/Anulación)</option>
                                <option>Débito (Intereses/Gasto)</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Razón / Motivo</label>
                        <input 
                            type="text" 
                            value={reason} 
                            onChange={e => setReason(e.target.value)} 
                            placeholder="Ej: Devolución de mercancía"
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div className="w-full overflow-x-auto mb-6">
                         <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto / Servicio</th>
                                    <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cant.</th>
                                    <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">V. Unit</th>
                                    <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                               {selectedInvoice ? selectedInvoice.lineItems.map((item, index) => (
                                   <tr key={`${item.productId}-${index}`}>
                                       <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.productName}</td>
                                       <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{item.quantity}</td>
                                       <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(item.unitPrice)}</td>
                                       <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(item.unitPrice * item.quantity)}</td>
                                   </tr>
                               )) : (
                                   <tr><td colSpan={4} className="text-center py-10 text-gray-500">Seleccione una factura para ver los productos.</td></tr>
                               )}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-700 mb-1">Notas Adicionales</label>
                             <textarea 
                                 rows={4}
                                 value={additionalNotes}
                                 onChange={e => setAdditionalNotes(e.target.value)}
                                 className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                             />
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg flex flex-col justify-center">
                            <div className="flex justify-between items-center text-xl font-bold text-gray-800">
                                <span>Total</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end mt-8">
                        <button type="submit" className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md">
                            <SaveNoteIcon /> Generar Nota
                        </button>
                    </div>
                </fieldset>
            </form>
        </div>
    );
}

export default CreditNotes;