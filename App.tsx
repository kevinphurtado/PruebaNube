import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './firebase';

import useLocalStorage from './hooks/useLocalStorage';
import { Client, Product, Invoice, Quote, CreditNote, Expense, ExpenseCategory, CompanyInfo, DianResolution, UserAccount, ConnectionLog, FaqItem, SupportTicket, StockMovement } from './types';
import { initialClients, initialProducts, initialInvoices, initialQuotes, initialCreditNotes, initialExpenses, initialExpenseCategories, initialCompanyInfo, initialDianResolution, initialUserAccounts, initialConnectionLogs, initialFaqItems, initialSupportTickets, initialStockMovements } from './initialData';

import Dashboard from './components/Dashboard';
import Invoices from './components/Invoices';
import Quotes from './components/Quotes';
import CreditNotes from './components/CreditNotes';
import Inventory from './components/Inventory';
import Clients from './components/Clients';
import Expenses from './components/Expenses';
import Reports from './components/Reports';
import History from './components/History';
import Settings from './components/Settings';
import Help from './components/Help';
import Login from './components/Login';
import LoadingSpinner from './components/LoadingSpinner';
import Toast from './components/Toast';

import { 
    DashboardIcon, InvoicesIcon, QuoteIcon, CreditNoteIcon, InventoryIcon, ClientsIcon, 
    ExpensesIcon, ReportsIcon, HistoryIcon, SettingsIcon, HelpIcon, LogoutIcon 
} from './components/Icons';

type View = 'dashboard' | 'invoices' | 'quotes' | 'credit-notes' | 'inventory' | 'clients' | 'expenses' | 'reports' | 'history' | 'settings' | 'help';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // --- State Management using useLocalStorage ---
    const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
    const [clients, setClients] = useLocalStorage<Client[]>('clients', initialClients);
    const [products, setProducts] = useLocalStorage<Product[]>('products', initialProducts);
    const [stockMovements, setStockMovements] = useLocalStorage<StockMovement[]>('stockMovements', initialStockMovements);
    const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', initialInvoices);
    const [quotes, setQuotes] = useLocalStorage<Quote[]>('quotes', initialQuotes);
    const [creditNotes, setCreditNotes] = useLocalStorage<CreditNote[]>('creditNotes', initialCreditNotes);
    const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', initialExpenses);
    const [expenseCategories, setExpenseCategories] = useLocalStorage<ExpenseCategory[]>('expenseCategories', initialExpenseCategories);
    const [companyInfo, setCompanyInfo] = useLocalStorage<CompanyInfo | null>('companyInfo', initialCompanyInfo);
    const [dianResolution, setDianResolution] = useLocalStorage<DianResolution | null>('dianResolution', initialDianResolution);
    const [userAccounts, setUserAccounts] = useLocalStorage<UserAccount[]>('userAccounts', initialUserAccounts);
    const [connectionLogs, setConnectionLogs] = useLocalStorage<ConnectionLog[]>('connectionLogs', initialConnectionLogs);
    const [faqItems] = useLocalStorage<FaqItem[]>('faqItems', initialFaqItems);
    const [supportTickets, setSupportTickets] = useLocalStorage<SupportTicket[]>('supportTickets', initialSupportTickets);
    
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };
    
    // --- Authentication ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Log connection
                const newLog: ConnectionLog = {
                    id: `log-${Date.now()}`,
                    userEmail: currentUser.email || 'unknown',
                    timestamp: new Date().toLocaleString('es-CO'),
                };
                setConnectionLogs(prevLogs => [newLog, ...prevLogs]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [setConnectionLogs]);
    
    const handleLogout = () => {
        signOut(auth).catch(error => console.error("Logout Error:", error));
    };

    // --- CRUD Functions ---
    const crudFunctions = {
        addClient: (clientData: Omit<Client, 'id'>) => {
            const newClient = { ...clientData, id: `CL-${Date.now()}` };
            setClients(prev => [...prev, newClient]);
            showToast('Cliente creado exitosamente', 'success');
        },
        updateClient: (updatedClient: Client) => {
            setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
            showToast('Cliente actualizado', 'success');
        },
        deleteClient: (clientId: string) => {
            setClients(prev => prev.filter(c => c.id !== clientId));
            showToast('Cliente eliminado', 'error');
        },
        addOrUpdateProduct: (productData: Omit<Product, 'id'>, id?: string) => {
            if (id) {
                setProducts(prev => prev.map(p => p.id === id ? { ...p, ...productData, id } : p));
                showToast('Producto actualizado', 'success');
            } else {
                const newProduct = { ...productData, id: `PROD-${Date.now()}` };
                setProducts(prev => [...prev, newProduct]);
                showToast('Producto creado', 'success');
            }
        },
        deleteProduct: (productId: string) => {
            setProducts(prev => prev.filter(p => p.id !== productId));
            showToast('Producto eliminado', 'error');
        },
        addStockMovement: (movementData: Omit<StockMovement, 'id'>) => {
            const newMovement = { ...movementData, id: `MOV-${Date.now()}` };
            setStockMovements(prev => [newMovement, ...prev]);
            
            // Update product stock
            setProducts(prev => prev.map(p => {
                if (p.id === movementData.productId) {
                    return { ...p, stock: p.stock + movementData.quantity };
                }
                return p;
            }));
            showToast('Movimiento de stock registrado', 'success');
        },
        addInvoice: (invoiceData: Omit<Invoice, 'id'>) => {
            setInvoices(prev => [{ ...invoiceData, id: `FVC-${prev.length + 1}` }, ...prev]);
            // Adjust stock for sales
            invoiceData.lineItems.forEach(item => {
                setProducts(prevProducts => prevProducts.map(p => 
                    p.id === item.productId ? { ...p, stock: p.stock - item.quantity } : p
                ));
            });
            showToast('Factura creada exitosamente', 'success');
        },
         addQuote: (quoteData: Omit<Quote, 'id'>) => {
            setQuotes(prev => [{ ...quoteData, id: `COT-${prev.length + 1}` }, ...prev]);
            showToast('Cotización creada exitosamente', 'success');
        },
        addCreditNote: (noteData: Omit<CreditNote, 'id'>) => {
            const client = clients.find(c => c.id === noteData.clientId);
            if (!client) return;
            const newNote = {
                ...noteData,
                id: `NC-${creditNotes.length + 1}`,
                clientName: client.name,
                status: 'Borrador' as const
            };
            setCreditNotes(prev => [newNote, ...prev]);
            showToast('Nota de crédito creada', 'success');
        },
        addExpense: (expenseData: Omit<Expense, 'id'>) => {
            setExpenses(prev => [{...expenseData, id: `EXP-${Date.now()}`}, ...prev]);
            showToast('Gasto registrado', 'success');
        },
        updateExpense: (updatedExpense: Expense) => {
            setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
            showToast('Gasto actualizado', 'success');
        },
        deleteExpense: (expenseId: string) => {
            setExpenses(prev => prev.filter(e => e.id !== expenseId));
            showToast('Gasto eliminado', 'error');
        },
        addExpenseCategory: (categoryData: Omit<ExpenseCategory, 'id'>) => {
            setExpenseCategories(prev => [...prev, {...categoryData, id: `CAT-${Date.now()}`}]);
        },
        deleteExpenseCategory: (categoryId: string) => {
            setExpenseCategories(prev => prev.filter(c => c.id !== categoryId));
        },
        addSupportTicket: (ticketData: Omit<SupportTicket, 'id' | 'status' | 'date'>) => {
             const newTicket = { 
                ...ticketData, 
                id: `TKT-${supportTickets.length + 1}`, 
                status: 'Abierto' as const,
                date: new Date().toISOString().split('T')[0]
            };
            setSupportTickets(prev => [newTicket, ...prev]);
            showToast('Ticket de soporte enviado', 'success');
        },
    };
    
    // --- Render Logic ---
    if (loading) return <LoadingSpinner fullScreen text="Cargando..." />;
    if (!user) return <Login />;

    const renderContent = () => {
        switch(activeView) {
            case 'dashboard': return <Dashboard invoices={invoices} products={products} clients={clients} expenses={expenses} />;
            case 'invoices': return <Invoices clients={clients} products={products} addInvoice={crudFunctions.addInvoice} companyInfo={companyInfo} dianResolution={dianResolution} />;
            case 'quotes': return <Quotes clients={clients} products={products} addQuote={crudFunctions.addQuote} />;
            case 'credit-notes': return <CreditNotes invoices={invoices} clients={clients} creditNotes={creditNotes} addCreditNote={crudFunctions.addCreditNote} />;
            case 'inventory': return <Inventory products={products} stockMovements={stockMovements} addOrUpdateProduct={crudFunctions.addOrUpdateProduct} deleteProduct={crudFunctions.deleteProduct} addStockMovement={crudFunctions.addStockMovement}/>;
            case 'clients': return <Clients clients={clients} addClient={crudFunctions.addClient} updateClient={crudFunctions.updateClient} deleteClient={crudFunctions.deleteClient} />;
            case 'expenses': return <Expenses expenses={expenses} categories={expenseCategories} addExpense={crudFunctions.addExpense} updateExpense={crudFunctions.updateExpense} deleteExpense={crudFunctions.deleteExpense} addCategory={crudFunctions.addExpenseCategory} deleteCategory={crudFunctions.deleteExpenseCategory} />;
            case 'reports': return <Reports invoices={invoices} clients={clients} expenses={expenses} products={products} companyInfo={companyInfo} />;
            case 'history': return <History invoices={invoices} quotes={quotes} creditNotes={creditNotes} clients={clients} companyInfo={companyInfo} dianResolution={dianResolution} updateInvoice={()=>{}} deleteInvoice={()=>{}} deleteQuote={()=>{}} deleteCreditNote={()=>{}} onDuplicateInvoice={()=>{}} onQuoteToInvoice={()=>{}} />;
            case 'settings': return <Settings companyInfo={companyInfo} dianResolution={dianResolution} userAccounts={userAccounts} connectionLogs={connectionLogs} theme={theme} onUpdateCompanyInfo={setCompanyInfo} onUpdateDianResolution={setDianResolution} onAddUserAccount={()=>{}} onChangePassword={()=>{}} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} onCreateBackup={()=>{}} onDownloadClientTemplate={()=>{}} onDownloadProductTemplate={()=>{}} />;
            case 'help': return <Help faqItems={faqItems} supportTickets={supportTickets} addSupportTicket={crudFunctions.addSupportTicket} />;
            default: return <Dashboard invoices={invoices} products={products} clients={clients} expenses={expenses} />;
        }
    };
    
    const menuItems = [
        { view: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
        { view: 'invoices', label: 'Facturas', icon: InvoicesIcon },
        { view: 'quotes', label: 'Cotizaciones', icon: QuoteIcon },
        { view: 'credit-notes', label: 'Notas C/D', icon: CreditNoteIcon },
        { view: 'inventory', label: 'Inventario', icon: InventoryIcon },
        { view: 'clients', label: 'Clientes', icon: ClientsIcon },
        { view: 'expenses', label: 'Gastos', icon: ExpensesIcon },
        { view: 'reports', label: 'Reportes', icon: ReportsIcon },
        { view: 'history', label: 'Historial', icon: HistoryIcon },
    ];
    
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex flex-col">
                <div className="h-16 flex items-center justify-center border-b dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Nubifica</h1>
                </div>
                <nav className="flex-1 overflow-y-auto">
                    <ul>
                        {menuItems.map(item => (
                            <li key={item.view} className="px-4">
                                <button
                                    onClick={() => setActiveView(item.view as View)}
                                    className={`w-full flex items-center my-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                        activeView === item.view
                                            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <item.icon />
                                    <span className="ml-3">{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="border-t dark:border-gray-700 p-4">
                     <ul>
                        <li className="px-0">
                            <button onClick={() => setActiveView('settings')} className={`w-full flex items-center my-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${ activeView === 'settings' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                               <SettingsIcon /><span className="ml-3">Configuración</span>
                            </button>
                        </li>
                        <li className="px-0">
                             <button onClick={() => setActiveView('help')} className={`w-full flex items-center my-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${ activeView === 'help' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                <HelpIcon /><span className="ml-3">Ayuda</span>
                            </button>
                        </li>
                     </ul>
                    <div className="mt-4 pt-4 border-t dark:border-gray-700 flex items-center justify-between">
                         <div className="text-sm">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{user.email}</p>
                            <p className="text-gray-500 dark:text-gray-400">Admin</p>
                        </div>
                        <button onClick={handleLogout} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400" title="Cerrar sesión">
                            <LogoutIcon />
                        </button>
                    </div>
                </div>
            </aside>
            
            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {renderContent()}
            </main>

            {/* Toast Container */}
            <div className="fixed top-5 right-5 z-50">
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </div>
        </div>
    );
};

export default App;