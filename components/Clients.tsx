import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import { ClientsIcon, PlusIcon, EditIcon, DeleteIcon, SearchIcon, CloseIcon } from './Icons';

interface ClientsProps {
    clients: Client[];
    addClient: (client: Omit<Client, 'id'>) => void;
    updateClient: (client: Client) => void;
    deleteClient: (clientId: string) => void;
}

const ClientModal: React.FC<{
    client: Client | null;
    onClose: () => void;
    onSave: (clientData: Omit<Client, 'id'>, id?: string) => void;
}> = ({ client, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Client, 'id'>>({
        name: '',
        idType: 'NIT',
        idNumber: '',
        address: '',
        phone: '',
        email: '',
        fiscalResponsibilities: [],
    });

    useEffect(() => {
        if (client) {
            setFormData({
                name: client.name,
                idType: client.idType,
                idNumber: client.idNumber,
                address: client.address,
                phone: client.phone,
                email: client.email,
                fiscalResponsibilities: client.fiscalResponsibilities || [],
            });
        }
    }, [client]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, client?.id);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{client ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                        <CloseIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre / Razón Social" className="p-2 border dark:border-gray-600 rounded md:col-span-2 dark:bg-gray-700" required />
                        <select name="idType" value={formData.idType} onChange={handleChange} className="p-2 border dark:border-gray-600 rounded dark:bg-gray-700">
                            <option value="NIT">NIT</option>
                            <option value="Cédula">Cédula</option>
                            <option value="Otro">Otro</option>
                        </select>
                        <input name="idNumber" value={formData.idNumber} onChange={handleChange} placeholder="Número de Identificación" className="p-2 border dark:border-gray-600 rounded dark:bg-gray-700" required />
                        <input name="address" value={formData.address} onChange={handleChange} placeholder="Dirección" className="p-2 border dark:border-gray-600 rounded md:col-span-2 dark:bg-gray-700" />
                        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Teléfono" className="p-2 border dark:border-gray-600 rounded dark:bg-gray-700" />
                        <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Correo Electrónico" className="p-2 border dark:border-gray-600 rounded dark:bg-gray-700" />
                        <input name="fiscalResponsibilities" value={formData.fiscalResponsibilities.join(', ')} onChange={(e) => setFormData(p => ({...p, fiscalResponsibilities: e.target.value.split(',').map(s=>s.trim())}))} placeholder="Responsabilidades Fiscales (separadas por coma)" className="p-2 border dark:border-gray-600 rounded md:col-span-2 dark:bg-gray-700" />
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Clients: React.FC<ClientsProps> = ({ clients, addClient, updateClient, deleteClient }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleOpenModal = (client: Client | null = null) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingClient(null);
        setIsModalOpen(false);
    };

    const handleSaveClient = (clientData: Omit<Client, 'id'>, id?: string) => {
        if (id) {
            updateClient({ ...clientData, id });
        } else {
            addClient(clientData);
        }
        handleCloseModal();
    };

    const handleDeleteClient = (clientId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
            deleteClient(clientId);
        }
    };
    
    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.idNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dark:text-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <ClientsIcon />
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 ml-3">Clientes</h1>
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow">
                    <PlusIcon /> Nuevo Cliente
                </button>
            </div>

            {/* Search and Filter */}
            <div className="mb-6">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o identificación..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                    />
                </div>
            </div>

            {/* Clients Table */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700 text-left text-gray-600 dark:text-gray-300 uppercase text-sm">
                                <th className="py-3 px-6">Nombre / Razón Social</th>
                                <th className="py-3 px-6">Identificación</th>
                                <th className="py-3 px-6">Correo Electrónico</th>
                                <th className="py-3 px-6">Teléfono</th>
                                <th className="py-3 px-6 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 dark:text-gray-200">
                            {filteredClients.map(client => (
                                <tr key={client.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="py-4 px-6">{client.name}</td>
                                    <td className="py-4 px-6">{client.idType}: {client.idNumber}</td>
                                    <td className="py-4 px-6">{client.email}</td>
                                    <td className="py-4 px-6">{client.phone}</td>
                                    <td className="py-4 px-6 flex justify-center space-x-2">
                                        <button onClick={() => handleOpenModal(client)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300">
                                            <EditIcon />
                                        </button>
                                        <button onClick={() => handleDeleteClient(client.id)} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500">
                                            <DeleteIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredClients.length === 0 && <p className="text-center text-gray-500 py-8">No se encontraron clientes.</p>}
            </div>

            {isModalOpen && <ClientModal client={editingClient} onClose={handleCloseModal} onSave={handleSaveClient} />}
        </div>
    );
};

export default Clients;
