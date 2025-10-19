import React, { useState, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Invoice, Product, Expense, Client } from '../types';
import { FilterIcon, DashboardIcon } from './Icons';

interface DashboardProps {
    invoices: Invoice[];
    products: Product[];
    clients: Client[];
    expenses: Expense[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const DashboardCard: React.FC<{ title: string; value: string | number; color: string; }> = ({ title, value, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
);

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>
        {children}
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ invoices, products, clients, expenses }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isFiltered, setIsFiltered] = useState(false);
    const [generalView, setGeneralView] = useState<'chart' | 'activity'>('chart');

    const handleFilter = () => {
        if (startDate && endDate) {
            setIsFiltered(true);
        } else {
            alert('Por favor, seleccione un rango de fechas válido.');
        }
    };

    const clearFilter = () => {
        setIsFiltered(false);
        setStartDate('');
        setEndDate('');
    };

    const {
        displayInvoices,
        displayExpenses
    } = useMemo(() => {
        if (!isFiltered) {
            return { displayInvoices: invoices, displayExpenses: expenses };
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        const filteredInvoices = invoices.filter(inv => {
            const issueDate = new Date(inv.issueDate);
            return issueDate >= start && issueDate <= end;
        });
        const filteredExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate >= start && expDate <= end;
        });
        return { displayInvoices: filteredInvoices, displayExpenses: filteredExpenses };
    }, [invoices, expenses, startDate, endDate, isFiltered]);


    const {
        totalCobrado,
        totalGastos,
        utilidadNeta,
        pendienteCobro,
        clientesActivos,
        facturasEmitidas
    } = useMemo(() => {
        const cobrado = displayInvoices
            .filter(i => i.status === 'Pagada')
            .reduce((sum, inv) => sum + inv.total, 0);
        
        const gastos = displayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        const pendiente = displayInvoices
            .filter(i => ['Enviada', 'Vencida'].includes(i.status))
            .reduce((sum, inv) => sum + inv.total, 0);

        const activos = new Set(displayInvoices.map(i => i.clientId)).size;

        return {
            totalCobrado: cobrado,
            totalGastos: gastos,
            utilidadNeta: cobrado - gastos,
            pendienteCobro: pendiente,
            clientesActivos: activos,
            facturasEmitidas: displayInvoices.length
        };
    }, [displayInvoices, displayExpenses]);

    const salesData = useMemo(() => {
        return displayInvoices.reduce((acc, inv) => {
            const month = new Date(inv.issueDate).toLocaleString('es-CO', { month: 'short' });
            const year = new Date(inv.issueDate).getFullYear();
            const key = `${month.charAt(0).toUpperCase() + month.slice(1)}. ${year}`;
            const existing = acc.find(item => item.name === key);
            if (existing) {
                existing.Ventas += inv.total;
            } else {
                acc.push({ name: key, Ventas: inv.total });
            }
            return acc;
        }, [] as { name: string; Ventas: number }[]).reverse();
    }, [displayInvoices]);
    
    const recentActivity = useMemo(() => {
        const invoiceActivities = displayInvoices.map(i => ({ type: 'Factura', date: i.issueDate, description: `${i.id} - ${i.clientName}`, amount: i.total, status: 'positive' as const }));
        const expenseActivities = displayExpenses.map(e => ({ type: 'Gasto', date: e.date, description: e.description, amount: e.amount, status: 'negative' as const }));
        
        return [...invoiceActivities, ...expenseActivities]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
    }, [displayInvoices, displayExpenses]);

    const topClientsData = useMemo(() => {
        const clientSales = new Map<string, number>();
        displayInvoices.forEach(inv => {
            clientSales.set(inv.clientName, (clientSales.get(inv.clientName) || 0) + inv.total);
        });
        return Array.from(clientSales.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [displayInvoices]);

    const topProductsData = useMemo(() => {
        const productSales = new Map<string, { name: string, quantity: number }>();
        displayInvoices.forEach(inv => {
            inv.lineItems.forEach(item => {
                const existing = productSales.get(item.productId);
                if (existing) {
                    existing.quantity += item.quantity;
                } else {
                    productSales.set(item.productId, { name: item.productName, quantity: item.quantity });
                }
            });
        });
        return Array.from(productSales.values())
            .map(({ name, quantity }) => ({ name, value: quantity }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [displayInvoices]);
    
    const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    return (
        <div className="dark:text-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Dashboard</h1>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-8 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700"/>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border dark:border-gray-600 rounded-md dark:bg-gray-700"/>
                    <button onClick={handleFilter} className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                        <FilterIcon /> Filtrar Fechas
                    </button>
                    <button onClick={clearFilter} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                        Ver Total Global
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                <DashboardCard title="Total Cobrado" value={formatCurrency(totalCobrado)} color="text-green-600" />
                <DashboardCard title="Total Gastos" value={formatCurrency(totalGastos)} color="text-red-600" />
                <DashboardCard title="Utilidad Neta" value={formatCurrency(utilidadNeta)} color={utilidadNeta >= 0 ? "text-blue-600" : "text-red-600"} />
                <DashboardCard title="Pendiente de Cobro" value={formatCurrency(pendienteCobro)} color="text-yellow-600" />
                <DashboardCard title="Clientes Activos" value={clientesActivos} color="text-indigo-600" />
                <DashboardCard title="Facturas Emitidas" value={facturasEmitidas} color="text-gray-600 dark:text-gray-300" />
            </div>

            {/* General View */}
            <ChartCard title="Vista General">
                 <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-4">
                    <button onClick={() => setGeneralView('chart')} className={`px-4 py-2 font-semibold ${generalView === 'chart' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Gráfico Mensual</button>
                    <button onClick={() => setGeneralView('activity')} className={`px-4 py-2 font-semibold ${generalView === 'activity' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Actividad Reciente</button>
                </div>
                {generalView === 'chart' ? (
                     <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)"/>
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis tickFormatter={(value) => formatCurrency(Number(value))} stroke="#9CA3AF" />
                            <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Ventas"]} contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none' }} itemStyle={{ color: '#E5E7EB' }} />
                            <Legend />
                            <Bar dataKey="Ventas" fill="#3B82F6" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase">
                                    <th className="py-2 px-3">Fecha</th>
                                    <th className="py-2 px-3">Tipo</th>
                                    <th className="py-2 px-3">Descripción</th>
                                    <th className="py-2 px-3 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentActivity.map((act, i) => (
                                    <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                                        <td className="py-3 px-3">{act.date}</td>
                                        <td className="py-3 px-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${act.type === 'Factura' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>{act.type}</span>
                                        </td>
                                        <td className="py-3 px-3">{act.description}</td>
                                        <td className={`py-3 px-3 text-right font-medium ${act.status === 'positive' ? 'text-green-600' : 'text-red-500'}`}>{formatCurrency(act.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </ChartCard>

            {/* Top 5 Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                 <ChartCard title="Top 5 Clientes (por valor)">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={topClientsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {topClientsData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => [formatCurrency(value), 'Ventas']} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
                 <ChartCard title="Top 5 Productos (por unidades)">
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={topProductsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {topProductsData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => [`${value} unidades`, 'Vendido']} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    );
};

export default Dashboard;