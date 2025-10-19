import React, { useState, useMemo, useEffect } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { 
    ExpensesIcon, HelpIcon, CalendarIcon, ExportIcon, 
    AdminCategoriesIcon, RegisterExpenseIcon, EditIcon, DeleteIcon, PlusIcon
} from './Icons';

interface ExpensesProps {
    expenses: Expense[];
    categories: ExpenseCategory[];
    addExpense: (expense: Omit<Expense, 'id'>) => void;
    updateExpense: (expense: Expense) => void;
    deleteExpense: (expenseId: string) => void;
    addCategory: (category: Omit<ExpenseCategory, 'id'>) => void;
    deleteCategory: (categoryId: string) => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
const todayDate = today.toISOString().split('T')[0];


// Category Management Modal
const CategoryModal: React.FC<{
    categories: ExpenseCategory[];
    onClose: () => void;
    onAddCategory: (category: Omit<ExpenseCategory, 'id'>) => void;
    onDeleteCategory: (categoryId: string) => void;
}> = ({ categories, onClose, onAddCategory, onDeleteCategory }) => {
    const [newCategory, setNewCategory] = useState('');

    const handleAdd = () => {
        if(newCategory.trim()){
            onAddCategory({ name: newCategory.trim() });
            setNewCategory('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Administrar Categorías</h2>
                <div className="flex mb-4">
                    <input 
                        type="text" 
                        value={newCategory} 
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Nueva categoría"
                        className="flex-grow p-2 border rounded-l-md"
                    />
                    <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700">Añadir</button>
                </div>
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {categories.map(cat => (
                        <li key={cat.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span>{cat.name}</span>
                            <button onClick={() => onDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700">
                                <DeleteIcon />
                            </button>
                        </li>
                    ))}
                </ul>
                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cerrar</button>
                </div>
            </div>
        </div>
    );
};


// Expense Add/Edit Modal
const ExpenseModal: React.FC<{
    expense: Expense | null;
    categories: ExpenseCategory[];
    onClose: () => void;
    onSave: (expenseData: Omit<Expense, 'id'>, id?: string) => void;
}> = ({ expense, categories, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Expense, 'id' | 'categoryName'>>(
        expense ? { date: expense.date, categoryId: expense.categoryId, description: expense.description, amount: expense.amount } : {
            date: new Date().toISOString().split('T')[0],
            categoryId: '',
            description: '',
            amount: 0,
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name === 'amount' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const category = categories.find(c => c.id === formData.categoryId);
        if(!category) {
            alert("Por favor, seleccione una categoría válida.");
            return;
        }
        const expenseDataWithCategoryName = { ...formData, categoryName: category.name };
        onSave(expenseDataWithCategoryName, expense?.id);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">{expense ? 'Editar Gasto' : 'Registrar Gasto'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="date" type="date" value={formData.date} onChange={handleChange} className="p-2 border rounded" required />
                        <input name="amount" type="number" value={formData.amount} onChange={handleChange} placeholder="Monto" className="p-2 border rounded" required />
                        <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="p-2 border rounded md:col-span-2" required>
                            <option value="">Seleccionar categoría...</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                        <input name="description" value={formData.description} onChange={handleChange} placeholder="Descripción" className="p-2 border rounded md:col-span-2" required />
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg text-gray-800 hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Expenses: React.FC<ExpensesProps> = (props) => {
    const { expenses, categories, addExpense, updateExpense, deleteExpense, addCategory, deleteCategory } = props;
    
    const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(todayDate);
    const [totalAmount, setTotalAmount] = useState(0);

    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const handleFilter = () => {
        const filtered = expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate >= new Date(startDate) && expDate <= new Date(endDate);
        });
        setFilteredExpenses(filtered);
    };
    
    useEffect(() => {
        handleFilter();
    }, [expenses, startDate, endDate]);
    
    useEffect(() => {
        const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        setTotalAmount(total);
    }, [filteredExpenses]);

    const handleSaveExpense = (expenseData: Omit<Expense, 'id'>, id?: string) => {
        if (id) {
            updateExpense({ ...expenseData, id });
        } else {
            addExpense(expenseData);
        }
        setIsExpenseModalOpen(false);
        setEditingExpense(null);
    };

    const handleEditExpense = (expense: Expense) => {
        setEditingExpense(expense);
        setIsExpenseModalOpen(true);
    };

    const handleDeleteExpense = (expenseId: string) => {
        deleteExpense(expenseId);
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <ExpensesIcon />
                    <h1 className="text-3xl font-bold text-gray-800 ml-3">Gestión de Gastos</h1>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="p-2 bg-white border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100"><HelpIcon /></button>
                    <button onClick={() => setIsCategoryModalOpen(true)} className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50">
                        <AdminCategoriesIcon /> Administrar Categorías
                    </button>
                    <button onClick={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }} className="flex items-center px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow">
                        <RegisterExpenseIcon /> Registrar Gasto
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center justify-between border-t-4 border-blue-500">
                <div className="flex items-center gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Filtrar desde:</label>
                        <div className="relative">
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40 p-2 pl-3 pr-8 border border-gray-300 rounded-md text-sm"/>
                        </div>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Hasta:</label>
                        <div className="relative">
                           <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40 p-2 pl-3 pr-8 border border-gray-300 rounded-md text-sm"/>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleFilter} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Filtrar</button>
                    <button onClick={() => { setStartDate(''); setEndDate(''); }} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50">Ver Todos</button>
                </div>
            </div>

            {/* Total Card and Export */}
            <div className="flex justify-between items-center mb-6">
                 <div className="bg-blue-50 p-4 rounded-lg shadow-sm w-full lg:w-1/3">
                    <h3 className="text-center text-sm font-medium text-blue-800">Total Gastos (Periodo Seleccionado)</h3>
                    <p className="text-center text-3xl font-bold text-blue-900 mt-2">{formatCurrency(totalAmount)}</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50">
                    <ExportIcon className="h-5 w-5 mr-2 text-green-600" /> Exportar a Excel
                </button>
            </div>


            {/* Expenses Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                 <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                            <th className="py-3 px-6">Fecha</th>
                            <th className="py-3 px-6">Categoría</th>
                            <th className="py-3 px-6">Descripción</th>
                            <th className="py-3 px-6 text-right">Monto</th>
                            <th className="py-3 px-6 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {filteredExpenses.map(expense => (
                            <tr key={expense.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-4 px-6">{expense.date}</td>
                                <td className="py-4 px-6">
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700">
                                        {expense.categoryName}
                                    </span>
                                </td>
                                <td className="py-4 px-6">{expense.description}</td>
                                <td className="py-4 px-6 text-right font-medium">{formatCurrency(expense.amount)}</td>
                                <td className="py-4 px-6 flex justify-center space-x-2">
                                    <button onClick={() => handleEditExpense(expense)} className="p-2 rounded-full hover:bg-gray-200 text-gray-600"><EditIcon className="h-5 w-5"/></button>
                                    <button onClick={() => handleDeleteExpense(expense.id)} className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"><DeleteIcon className="h-5 w-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
                 {filteredExpenses.length === 0 && <p className="text-center text-gray-500 py-8">No hay gastos registrados en este período.</p>}
            </div>
            
            {isExpenseModalOpen && <ExpenseModal expense={editingExpense} categories={categories} onClose={() => setIsExpenseModalOpen(false)} onSave={handleSaveExpense} />}
            {isCategoryModalOpen && <CategoryModal categories={categories} onClose={() => setIsCategoryModalOpen(false)} onAddCategory={addCategory} onDeleteCategory={deleteCategory}/>}
        </div>
    );
};

export default Expenses;