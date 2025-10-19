import React, { useState } from 'react';
import { FaqItem, SupportTicket } from '../types';
import { HelpIcon, ChevronDownIcon, TicketIcon } from './Icons';

interface HelpProps {
    faqItems: FaqItem[];
    supportTickets: SupportTicket[];
    addSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'date'>) => void;
}

type Tab = 'faq' | 'create' | 'history';

// FAQ View Component
const FaqView: React.FC<{ items: FaqItem[] }> = ({ items }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleFaq = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Preguntas Frecuentes (FAQ)</h2>
            <div className="space-y-4">
                {items.map(item => (
                    <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                        <button
                            onClick={() => toggleFaq(item.id)}
                            className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <span>{item.question}</span>
                            <ChevronDownIcon className={`h-5 w-5 transform transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedId === item.id && (
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                                <p>{item.answer}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Create Ticket View Component
const CreateTicketView: React.FC<{ onSubmit: (ticket: Omit<SupportTicket, 'id' | 'status' | 'date'>) => void }> = ({ onSubmit }) => {
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState<'Facturación' | 'Inventario' | 'Reporte de Error' | 'Duda General'>('Duda General');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!subject || !description) {
            alert("Por favor, complete todos los campos.");
            return;
        }
        onSubmit({ subject, category, description });
        setSubject('');
        setCategory('Duda General');
        setDescription('');
    };
    
    return (
         <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Crear Ticket de Soporte</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Asunto</label>
                    <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700" />
                </div>
                 <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
                    <select id="category" value={category} onChange={e => setCategory(e.target.value as any)} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700">
                        <option>Duda General</option>
                        <option>Facturación</option>
                        <option>Inventario</option>
                        <option>Reporte de Error</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Describe tu problema o duda</label>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={6} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700" />
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="flex items-center px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                        <TicketIcon /> Enviar Ticket
                    </button>
                </div>
            </form>
        </div>
    );
};

// My Tickets View Component
const MyTicketsView: React.FC<{ tickets: SupportTicket[] }> = ({ tickets }) => {
    const getStatusBadge = (status: SupportTicket['status']) => {
        switch (status) {
            case 'Resuelto': return 'bg-green-100 text-green-800 dark:bg-green-200 dark:text-green-900';
            case 'En Proceso': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-200 dark:text-yellow-900';
            case 'Abierto': return 'bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-900';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200';
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Mis Tickets</h2>
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ticket ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Asunto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {tickets.map(ticket => (
                            <tr key={ticket.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{ticket.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{ticket.subject}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{ticket.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {tickets.length === 0 && <p className="text-center text-gray-500 py-8">No tienes tickets de soporte.</p>}
            </div>
        </div>
    );
}


// Main Help Component
const Help: React.FC<HelpProps> = ({ faqItems, supportTickets, addSupportTicket }) => {
    const [activeTab, setActiveTab] = useState<Tab>('faq');

    const renderContent = () => {
        switch (activeTab) {
            case 'faq':
                return <FaqView items={faqItems} />;
            case 'create':
                return <CreateTicketView onSubmit={addSupportTicket} />;
            case 'history':
                return <MyTicketsView tickets={supportTickets} />;
            default:
                return null;
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center mb-6">
                 <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Ayuda y Soporte</h1>
                 <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2">
                    <HelpIcon />
                 </button>
            </div>

            {/* Content Area with Tabs */}
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-md border dark:border-gray-700">
                <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                         <button
                            onClick={() => setActiveTab('faq')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'faq'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                            Preguntas Frecuentes
                        </button>
                        <button
                            onClick={() => setActiveTab('create')}
                             className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'create'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                            Crear Ticket de Soporte
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'history'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                            Mis Tickets
                        </button>
                    </nav>
                </div>
                <div>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Help;
