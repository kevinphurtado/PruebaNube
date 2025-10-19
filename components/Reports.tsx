import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Invoice, Client, Expense, Product, CompanyInfo } from '../types';
import { ReportsIcon, HelpIcon, GenerateReportIcon, InfoIcon, ExportIcon } from './Icons';
import LoadingSpinner from './LoadingSpinner';


const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

const ReportCard: React.FC<{ title: string; value: string | number; description?: string, color?: string }> = ({ title, value, description, color = 'border-blue-500' }) => (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-t-4 ${color}`}>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">{value}</p>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
    </div>
);

const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Este reporte estará disponible próximamente.</p>
    </div>
);

// --- Report Sub-components ---

const VentasReport: React.FC<{ invoices: Invoice[], expenses: Expense[] }> = ({ invoices, expenses }) => {
    const data = useMemo(() => {
        const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        const salesByClientMap = new Map<string, { totalVendido: number; facturas: number }>();
        invoices.forEach(inv => {
            const clientData = salesByClientMap.get(inv.clientName) || { totalVendido: 0, facturas: 0 };
            clientData.totalVendido += inv.total;
            clientData.facturas += 1;
            salesByClientMap.set(inv.clientName, clientData);
        });

        const salesByClient = Array.from(salesByClientMap.entries())
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.totalVendido - a.totalVendido);
        
        return {
            totalSales,
            invoiceCount: invoices.length,
            expenses: totalExpenses,
            netProfit: totalSales - totalExpenses,
            salesByClient,
        };
    }, [invoices, expenses]);

    const pieChartData = data.salesByClient.slice(0, 5).map(client => ({ name: client.name, value: client.totalVendido }));
    const COLORS = ['#3B82F6', '#EF4444', '#F97316', '#FBBF24', '#10B981'];

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <ReportCard title="Total de Ventas" value={formatCurrency(data.totalSales)} description="En el período seleccionado" />
                <ReportCard title="Número de Facturas" value={data.invoiceCount} color="border-gray-400"/>
                <ReportCard title="Gastos" value={formatCurrency(data.expenses)} color="border-red-500"/>
                <ReportCard title="Utilidad Neta" value={formatCurrency(data.netProfit)} description="Ventas - Gastos" />
            </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-t-4 border-blue-500">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Ventas por Cliente</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                             <thead>
                                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase border-b dark:border-gray-700">
                                    <th className="py-2 px-3 font-semibold">Cliente</th>
                                    <th className="py-2 px-3 font-semibold text-right">Total Vendido</th>
                                    <th className="py-2 px-3 font-semibold text-center"># Facturas</th>
                                </tr>
                            </thead>
                            <tbody className="dark:text-gray-300">
                                {data.salesByClient.map(client => (
                                    <tr key={client.name} className="border-b dark:border-gray-700">
                                        <td className="py-3 px-3 text-sm font-medium">{client.name}</td>
                                        <td className="py-3 px-3 text-sm text-right">{formatCurrency(client.totalVendido)}</td>
                                        <td className="py-3 px-3 text-sm text-center">{client.facturas}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={pieChartData} cx="50%" cy="50%" labelLine={false} outerRadius={110} fill="#8884d8" dataKey="value" nameKey="name">
                                    {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Ventas']} />
                                <Legend iconSize={10} wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </>
    )
};

const TaxReport: React.FC<{ invoices: Invoice[] }> = ({ invoices }) => {
    const data = useMemo(() => {
        let totalBase = 0, totalIva = 0, totalRetefuente = 0, totalIca = 0;
        invoices.forEach(inv => {
            const base = inv.subtotal * (1 - (inv.globalDiscountPercentage || 0) / 100);
            totalBase += base;
            totalIva += inv.totalIva;
            totalRetefuente += base * (inv.retencionFuentePercentage || 0) / 100;
            totalIca += base * (inv.icaPercentage || 0) / 100;
        });
        return { totalBase, totalIva, totalRetefuente, totalIca };
    }, [invoices]);

    return (
         <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <ReportCard title="Base Gravable Total" value={formatCurrency(data.totalBase)} />
                <ReportCard title="Total IVA Recaudado" value={formatCurrency(data.totalIva)} color="border-green-500" />
                <ReportCard title="Total Retefuente" value={formatCurrency(data.totalRetefuente)} color="border-yellow-500" />
                <ReportCard title="Total ReteICA" value={formatCurrency(data.totalIca)} color="border-orange-500"/>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Detalle de Impuestos por Factura</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase border-b dark:border-gray-700">
                                <th className="py-2 px-3">Factura</th><th className="py-2 px-3">Cliente</th>
                                <th className="py-2 px-3 text-right">Base</th><th className="py-2 px-3 text-right">IVA</th>
                                <th className="py-2 px-3 text-right">Retefuente</th><th className="py-2 px-3 text-right">ReteICA</th>
                            </tr>
                        </thead>
                        <tbody className="dark:text-gray-300">
                            {invoices.map(inv => {
                                const base = inv.subtotal * (1 - (inv.globalDiscountPercentage || 0) / 100);
                                const retefuente = base * (inv.retencionFuentePercentage || 0) / 100;
                                const ica = base * (inv.icaPercentage || 0) / 100;
                                return (
                                    <tr key={inv.id} className="border-b dark:border-gray-700">
                                        <td className="py-2 px-3">{inv.id}</td><td className="py-2 px-3">{inv.clientName}</td>
                                        <td className="py-2 px-3 text-right">{formatCurrency(base)}</td><td className="py-2 px-3 text-right">{formatCurrency(inv.totalIva)}</td>
                                        <td className="py-2 px-3 text-right">{formatCurrency(retefuente)}</td><td className="py-2 px-3 text-right">{formatCurrency(ica)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

const AgingReport: React.FC<{ invoices: Invoice[] }> = ({ invoices }) => {
    const data = useMemo(() => {
        const today = new Date();
        const buckets = {
            current: { total: 0, count: 0 },
            '1-30': { total: 0, count: 0 },
            '31-60': { total: 0, count: 0 },
            '61-90': { total: 0, count: 0 },
            '91+': { total: 0, count: 0 },
        };
        const overdueInvoices: (Invoice & { daysOverdue: number, category: string })[] = [];

        invoices.filter(inv => inv.status === 'Enviada' || inv.status === 'Vencida').forEach(inv => {
            const dueDate = new Date(inv.dueDate);
            const diffTime = today.getTime() - dueDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            let category: keyof typeof buckets = 'current';
            if (diffDays > 90) category = '91+';
            else if (diffDays > 60) category = '61-90';
            else if (diffDays > 30) category = '31-60';
            else if (diffDays > 0) category = '1-30';
            
            buckets[category].total += inv.total;
            buckets[category].count += 1;
            overdueInvoices.push({ ...inv, daysOverdue: Math.max(0, diffDays), category });
        });
        
        return { buckets, overdueInvoices: overdueInvoices.sort((a,b) => b.daysOverdue - a.daysOverdue) };
    }, [invoices]);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <ReportCard title="Corriente" value={formatCurrency(data.buckets.current.total)} description={`${data.buckets.current.count} facturas`} color="border-green-500" />
                <ReportCard title="1-30 Días Vencido" value={formatCurrency(data.buckets['1-30'].total)} description={`${data.buckets['1-30'].count} facturas`} color="border-yellow-400" />
                <ReportCard title="31-60 Días Vencido" value={formatCurrency(data.buckets['31-60'].total)} description={`${data.buckets['31-60'].count} facturas`} color="border-orange-500" />
                <ReportCard title="61-90 Días Vencido" value={formatCurrency(data.buckets['61-90'].total)} description={`${data.buckets['61-90'].count} facturas`} color="border-red-500" />
                <ReportCard title="+91 Días Vencido" value={formatCurrency(data.buckets['91+'].total)} description={`${data.buckets['91+'].count} facturas`} color="border-red-700" />
            </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                 <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Detalle de Cartera Vencida</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase border-b dark:border-gray-700">
                                <th className="py-2 px-3">Factura</th><th>Cliente</th><th>Fecha Venc.</th>
                                <th className="text-center">Días Vencido</th><th className="text-right">Total Pendiente</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.overdueInvoices.map(inv => (
                                <tr key={inv.id} className="border-b dark:border-gray-700">
                                    <td className="py-2 px-3">{inv.id}</td><td>{inv.clientName}</td><td>{inv.dueDate}</td>
                                    <td className="text-center font-bold text-red-600">{inv.daysOverdue}</td>
                                    <td className="text-right font-medium">{formatCurrency(inv.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
};

const ProfitabilityReport: React.FC<{ invoices: Invoice[], products: Product[] }> = ({ invoices, products }) => {
    const data = useMemo(() => {
        let totalRevenue = 0;
        let totalCogs = 0;
        const profitByInvoice = [];

        const productMap = new Map<string, Product>(products.map(p => [p.id, p]));

        for(const inv of invoices) {
            const revenue = inv.subtotal;
            let cogs = 0;
            for(const item of inv.lineItems) {
                const product = productMap.get(item.productId);
                cogs += (product?.cost || 0) * item.quantity;
            }
            totalRevenue += revenue;
            totalCogs += cogs;
            profitByInvoice.push({ id: inv.id, clientName: inv.clientName, revenue, cogs, profit: revenue - cogs });
        }
        
        const grossProfit = totalRevenue - totalCogs;
        const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
        
        return { totalRevenue, totalCogs, grossProfit, grossMargin, profitByInvoice: profitByInvoice.sort((a,b) => b.profit - a.profit) };
    }, [invoices, products]);
    
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <ReportCard title="Ingresos (Venta Neta)" value={formatCurrency(data.totalRevenue)} />
                <ReportCard title="Costo de Mercancía (CMV)" value={formatCurrency(data.totalCogs)} color="border-red-500" />
                <ReportCard title="Utilidad Bruta" value={formatCurrency(data.grossProfit)} color="border-green-500" />
                <ReportCard title="Margen Bruto" value={`${data.grossMargin.toFixed(2)}%`} />
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Rentabilidad por Factura</h2>
                <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full">
                        <thead>
                            <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase border-b dark:border-gray-700">
                                <th>Factura</th><th>Cliente</th><th className="text-right">Ingreso</th>
                                <th className="text-right">Costo</th><th className="text-right">Utilidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.profitByInvoice.map(item => (
                                <tr key={item.id} className="border-b dark:border-gray-700">
                                    <td>{item.id}</td><td>{item.clientName}</td><td className="text-right">{formatCurrency(item.revenue)}</td>
                                    <td className="text-right">{formatCurrency(item.cogs)}</td>
                                    <td className="text-right font-bold">{formatCurrency(item.profit)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
};

const ProductAnalysisReport: React.FC<{ invoices: Invoice[], products: Product[] }> = ({ invoices, products }) => {
    const data = useMemo(() => {
        const stats = new Map<string, { name: string, sku: string, units: number, revenue: number }>();
        const productMap = new Map<string, Product>(products.map(p => [p.id, p]));

        invoices.forEach(inv => {
            inv.lineItems.forEach(item => {
                const product = productMap.get(item.productId);
                if (product) {
                    const current = stats.get(product.id) || { name: product.name, sku: product.sku, units: 0, revenue: 0 };
                    current.units += item.quantity;
                    current.revenue += item.total;
                    stats.set(product.id, current);
                }
            });
        });
        return Array.from(stats.values()).sort((a, b) => b.revenue - a.revenue);
    }, [invoices, products]);

    const chartData = data.slice(0, 10);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
             <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Análisis de Venta por Producto</h2>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full">
                         <thead>
                            <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase border-b dark:border-gray-700">
                                <th>Producto</th><th className="text-right">Unidades</th><th className="text-right">Ingresos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(p => (
                                <tr key={p.sku} className="border-b dark:border-gray-700">
                                    <td><p className="font-medium">{p.name}</p><p className="text-xs text-gray-500">{p.sku}</p></td>
                                    <td className="text-right">{p.units}</td>
                                    <td className="text-right font-medium">{formatCurrency(p.revenue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div>
                    <h3 className="text-center font-semibold mb-2">Top 10 Productos por Ingresos</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" tickFormatter={(val) => formatCurrency(val as number)} />
                            <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 10 }} />
                            <Tooltip formatter={(value: number) => [formatCurrency(value), 'Ingresos']} />
                            <Bar dataKey="revenue" fill="#3B82F6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
             </div>
        </div>
    )
};

const WithholdingCertificate: React.FC<{ invoices: Invoice[], clients: Client[], companyInfo: CompanyInfo | null }> = ({ invoices, clients, companyInfo }) => {
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [certificate, setCertificate] = useState<any>(null);
    
    const years = useMemo(() => {
        const invoiceYears = new Set<number>(invoices.map(i => new Date(i.issueDate).getFullYear()));
        return Array.from(invoiceYears).sort((a,b) => b - a);
    }, [invoices]);

    const generateCertificate = () => {
        const client = clients.find(c => c.id === selectedClientId);
        if(!client || !companyInfo) {
            alert("Seleccione un cliente y asegúrese que la información de la empresa esté completa.");
            return;
        }

        const filtered = invoices.filter(inv => 
            inv.clientId === selectedClientId &&
            new Date(inv.issueDate).getFullYear() === selectedYear &&
            ((inv.retencionFuentePercentage || 0) > 0 || (inv.icaPercentage || 0) > 0)
        );

        let totalRetefuente = 0;
        let totalIca = 0;
        let totalBase = 0;

        const details = filtered.map(inv => {
            const base = inv.subtotal * (1 - (inv.globalDiscountPercentage || 0) / 100);
            const retefuente = base * (inv.retencionFuentePercentage || 0) / 100;
            const ica = base * (inv.icaPercentage || 0) / 100;
            totalRetefuente += retefuente;
            totalIca += ica;
            totalBase += base;
            return { id: inv.id, date: inv.issueDate, base, retefuente, ica };
        });

        setCertificate({ client, companyInfo, year: selectedYear, details, totals: { totalBase, totalRetefuente, totalIca } });
    };

    return (
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Generador de Certificados de Retención</h2>
            <div className="flex flex-wrap items-end gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                    <label className="block text-xs font-medium">Cliente</label>
                    <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="w-64 p-2 border rounded-md">
                        <option value="">Seleccionar cliente...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-xs font-medium">Año</label>
                    <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="w-32 p-2 border rounded-md">
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <button onClick={generateCertificate} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">Generar Certificado</button>
            </div>
            {certificate && (
                <div className="mt-6 border-t dark:border-gray-700 pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">Certificado para: {certificate.client.name} - Año {certificate.year}</h3>
                        <button onClick={() => window.print()} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">Imprimir</button>
                    </div>
                    <div className="p-8 border dark:border-gray-700 rounded-lg text-sm" id="certificate-print">
                        <style>{`@media print { body * { visibility: hidden; } #certificate-print, #certificate-print * { visibility: visible; } #certificate-print { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>
                        <h2 className="text-center font-bold text-lg">CERTIFICADO DE RETENCIÓN EN LA FUENTE</h2>
                        <h3 className="text-center font-bold">AÑO GRAVABLE {certificate.year}</h3>
                        <div className="grid grid-cols-2 gap-8 my-8 text-xs">
                            <div>
                                <p className="font-bold">AGENTE RETENEDOR</p>
                                <p>{certificate.companyInfo.name}</p>
                                <p>NIT: {certificate.companyInfo.nit}</p>
                            </div>
                             <div>
                                <p className="font-bold">SUJETO PASIVO</p>
                                <p>{certificate.client.name}</p>
                                <p>NIT/CC: {certificate.client.idNumber}</p>
                            </div>
                        </div>
                        <table className="w-full text-xs">
                           <thead>
                             <tr className="border-b font-medium">
                                <td className="py-1">Concepto</td><td className="py-1 text-right">Base de Retención</td><td className="py-1 text-right">Valor Retenido</td>
                             </tr>
                           </thead>
                           <tbody>
                                <tr>
                                    <td>RETENCIÓN EN LA FUENTE A TÍTULO DE RENTA</td>
                                    <td className="text-right">{formatCurrency(certificate.totals.totalBase)}</td>
                                    <td className="text-right">{formatCurrency(certificate.totals.totalRetefuente)}</td>
                                </tr>
                                <tr>
                                    <td>RETENCIÓN EN LA FUENTE A TÍTULO DE ICA</td>
                                    <td className="text-right">{formatCurrency(certificate.totals.totalBase)}</td>
                                    <td className="text-right">{formatCurrency(certificate.totals.totalIca)}</td>
                                </tr>
                           </tbody>
                            <tfoot className="border-t font-bold">
                                <tr>
                                    <td>TOTALES</td>
                                    <td className="text-right">{formatCurrency(certificate.totals.totalBase)}</td>
                                    <td className="text-right">{formatCurrency(certificate.totals.totalRetefuente + certificate.totals.totalIca)}</td>
                                </tr>
                            </tfoot>
                        </table>
                        <p className="text-xs mt-8">Este certificado se expide para dar cumplimiento a las normas fiscales vigentes.</p>
                        <div className="mt-24 border-t w-64"><p className="text-xs">Firma del Agente Retenedor</p></div>
                    </div>
                </div>
            )}
        </div>
    )
};

// --- Main Reports Component ---

interface ReportsProps {
    invoices: Invoice[];
    clients: Client[];
    expenses: Expense[];
    products: Product[];
    companyInfo: CompanyInfo | null;
}

const Reports: React.FC<ReportsProps> = ({ invoices, clients, expenses, products, companyInfo }) => {
    const TABS = ['Ventas', 'Recaudo de Impuestos', 'Antigüedad de Cartera', 'Rentabilidad (Ventas)', 'Análisis de Productos', 'Certificados de Retención'];
    const [activeTab, setActiveTab] = useState(TABS[0]);
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const todayDate = today.toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(todayDate);
    const [isLoading, setIsLoading] = useState(false);

    // This memo filters data based on date range for most reports
    const filteredData = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const filteredInvoices = invoices.filter(inv => {
            const issueDate = new Date(inv.issueDate);
            return issueDate >= start && issueDate <= end;
        });

        const filteredExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate >= start && expDate <= end;
        });
        
        return { invoices: filteredInvoices, expenses: filteredExpenses };
    }, [invoices, expenses, startDate, endDate]);

    const handleGenerateReport = () => {
        setIsLoading(true);
        // Simulate report generation delay
        setTimeout(() => setIsLoading(false), 500);
    };

    useEffect(() => {
        handleGenerateReport();
    }, [startDate, endDate, activeTab]);

    const renderContent = () => {
        if (isLoading) return <LoadingSpinner text="Generando reporte..." />;

        switch(activeTab) {
            case 'Ventas':
                return <VentasReport invoices={filteredData.invoices} expenses={filteredData.expenses} />;
            case 'Recaudo de Impuestos':
                return <TaxReport invoices={filteredData.invoices} />;
            case 'Antigüedad de Cartera':
                return <AgingReport invoices={invoices} />; // Uses all invoices, not just filtered by issueDate
            case 'Rentabilidad (Ventas)':
                return <ProfitabilityReport invoices={filteredData.invoices} products={products} />;
            case 'Análisis de Productos':
                return <ProductAnalysisReport invoices={filteredData.invoices} products={products} />;
            case 'Certificados de Retención':
                return <WithholdingCertificate invoices={invoices} clients={clients} companyInfo={companyInfo} />;
            default:
                return null;
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <ReportsIcon />
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 ml-3">Reportes</h1>
                </div>
                <button className="p-2 bg-white dark:bg-gray-700/50 border dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <HelpIcon />
                </button>
            </div>

            {/* Filters and Controls */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4 border-t-4 border-blue-500">
                <div className="flex items-center gap-4 flex-wrap">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Desde:</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700"/>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Hasta:</label>
                           <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700"/>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50">
                        <ExportIcon className="h-5 w-5 mr-2 text-green-600" /> Exportar a Excel
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Report Content */}
            <div>
                {renderContent()}
            </div>
        </div>
    );
};

export default Reports;
