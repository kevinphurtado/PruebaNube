import React, { useState } from 'react';
import { Product, StockMovement } from '../types';
import { InventoryIcon, PlusIcon, EditIcon, DeleteIcon, CloseIcon, AdjustmentsIcon, ProductsIcon } from './Icons';

interface InventoryProps {
    products: Product[];
    stockMovements: StockMovement[];
    addOrUpdateProduct: (product: Omit<Product, 'id'>, id?: string) => void;
    deleteProduct: (productId: string) => void;
    addStockMovement: (movement: Omit<StockMovement, 'id'>) => void;
}

type Tab = 'products' | 'movements';

const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);


// --- Modals ---

const ProductModal: React.FC<{
    product: Product | null;
    onClose: () => void;
    onSave: (productData: Omit<Product, 'id'>, id?: string) => void;
}> = ({ product, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Product, 'id'>>({
        sku: '',
        name: '',
        description: '',
        price: 0,
        cost: 0,
        stock: 0,
        ivaRate: 19,
        type: 'product',
        lowStockThreshold: 10,
    });

    React.useEffect(() => {
        if (product) {
            setFormData({
                sku: product.sku,
                name: product.name,
                description: product.description,
                price: product.price,
                cost: product.cost || 0,
                stock: product.stock,
                ivaRate: product.ivaRate,
                type: product.type,
                lowStockThreshold: product.lowStockThreshold || 10,
            });
        }
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: (name === 'price' || name === 'cost' || name === 'stock' || name === 'ivaRate' || name === 'lowStockThreshold') ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, product?.id);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                    <button type="button" onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre del Producto/Servicio" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 md:col-span-2" required />
                    <input name="sku" value={formData.sku} onChange={handleChange} placeholder="SKU / Código" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <select name="type" value={formData.type} onChange={handleChange} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                        <option value="product">Producto</option>
                        <option value="service">Servicio</option>
                    </select>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descripción" rows={3} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 md:col-span-2" />
                    <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Precio de Venta (sin IVA)" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
                    <input name="cost" type="number" value={formData.cost} onChange={handleChange} placeholder="Costo (opcional)" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <input name="stock" type="number" value={formData.stock} onChange={handleChange} placeholder="Stock Inicial" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" disabled={formData.type === 'service'}/>
                    <input name="ivaRate" type="number" value={formData.ivaRate} onChange={handleChange} placeholder="Tasa IVA (%)" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
                </div>
            </form>
        </div>
    );
};

const MovementModal: React.FC<{
    products: Product[];
    onClose: () => void;
    onSave: (movementData: Omit<StockMovement, 'id'>) => void;
}> = ({ products, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        productId: products[0]?.id || '',
        type: 'Entrada' as 'Entrada' | 'Ajuste',
        quantity: 0,
        notes: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name === 'quantity' ? parseInt(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const product = products.find(p => p.id === formData.productId);
        if(!product) return;
        const finalQuantity = formData.type === 'Ajuste' ? formData.quantity - product.stock : formData.quantity;
        onSave({ 
            productId: product.id,
            productName: product.name,
            date: new Date().toISOString().split('T')[0],
            type: formData.type,
            quantity: finalQuantity,
            notes: formData.notes,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
             <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">Nuevo Movimiento de Stock</h2>
                <div className="space-y-4">
                    <select name="productId" value={formData.productId} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required>
                        <option value="">Seleccionar producto...</option>
                        {products.filter(p => p.type === 'product').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                        <option value="Entrada">Entrada (+)</option>
                        <option value="Ajuste">Ajuste (Total)</option>
                    </select>
                    <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} placeholder={formData.type === 'Ajuste' ? "Cantidad final en stock" : "Cantidad a añadir"} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required/>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Notas (Ej: Compra a proveedor X)" rows={3} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar Movimiento</button>
                </div>
            </form>
        </div>
    )
}

// --- Main Component ---

const Inventory: React.FC<InventoryProps> = (props) => {
    const { products, stockMovements, addOrUpdateProduct, deleteProduct, addStockMovement } = props;
    const [activeTab, setActiveTab] = useState<Tab>('products');
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const handleOpenProductModal = (product: Product | null = null) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };
    
    const handleDeleteProduct = (productId: string) => {
        if(window.confirm('¿Estás seguro de eliminar este producto? Esto no se puede deshacer.')) {
            deleteProduct(productId);
        }
    };

    const renderContent = () => {
        if (activeTab === 'products') {
            return (
                 <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase">
                                <th className="py-2 px-3">SKU</th>
                                <th className="py-2 px-3">Nombre</th>
                                <th className="py-2 px-3 text-right">Precio Venta</th>
                                <th className="py-2 px-3 text-right">Stock</th>
                                <th className="py-2 px-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id} className="border-b dark:border-gray-700">
                                    <td className="py-3 px-3">{p.sku}</td>
                                    <td className="py-3 px-3 font-medium">{p.name}</td>
                                    <td className="py-3 px-3 text-right">{formatCurrency(p.price)}</td>
                                    <td className="py-3 px-3 text-right">{p.type === 'product' ? p.stock : 'N/A'}</td>
                                    <td className="py-3 px-3 flex justify-center space-x-2">
                                        <button onClick={() => handleOpenProductModal(p)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><EditIcon/></button>
                                        <button onClick={() => handleDeleteProduct(p.id)} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500"><DeleteIcon/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        if (activeTab === 'movements') {
             return (
                 <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase">
                                <th className="py-2 px-3">Fecha</th>
                                <th className="py-2 px-3">Producto</th>
                                <th className="py-2 px-3">Tipo</th>
                                <th className="py-2 px-3 text-right">Cantidad</th>
                                <th className="py-2 px-3">Notas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockMovements.map(m => (
                                <tr key={m.id} className="border-b dark:border-gray-700">
                                    <td className="py-3 px-3">{m.date}</td>
                                    <td className="py-3 px-3 font-medium">{m.productName}</td>
                                    <td className="py-3 px-3">{m.type}</td>
                                    <td className={`py-3 px-3 text-right font-bold ${m.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</td>
                                    <td className="py-3 px-3 text-sm text-gray-500">{m.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
    };

    return (
        <div className="dark:text-gray-200">
            {/* Modals */}
            {isProductModalOpen && <ProductModal product={editingProduct} onClose={() => setIsProductModalOpen(false)} onSave={(data, id) => { addOrUpdateProduct(data, id); setIsProductModalOpen(false); }} />}
            {isMovementModalOpen && <MovementModal products={products} onClose={() => setIsMovementModalOpen(false)} onSave={(data) => addStockMovement(data)} />}

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <InventoryIcon />
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 ml-3">Inventario y Productos</h1>
                </div>
                <div className="flex space-x-2">
                     <button onClick={() => setIsMovementModalOpen(true)} className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">
                        <AdjustmentsIcon /> Registrar Movimiento
                    </button>
                    <button onClick={() => handleOpenProductModal()} className="flex items-center px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow">
                        <ProductsIcon /> Nuevo Producto/Servicio
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="border-b dark:border-gray-700 mb-4">
                    <nav className="-mb-px flex space-x-6">
                        <button onClick={() => setActiveTab('products')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'products' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>
                            Productos y Servicios
                        </button>
                         <button onClick={() => setActiveTab('movements')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'movements' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>
                            Movimientos de Stock
                        </button>
                    </nav>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default Inventory;
