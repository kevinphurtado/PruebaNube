import React, { useState } from 'react';
import { CompanyInfo, DianResolution, UserAccount, ConnectionLog } from '../types';
import { HelpIcon, SunIcon, MoonIcon, ShieldCheckIcon, ImportIcon, DownloadIcon, SaveNoteIcon, UserPlusIcon, SettingsIcon, CloseIcon } from './Icons';
import LoadingSpinner from './LoadingSpinner';

// Props Interface
interface SettingsProps {
    companyInfo: CompanyInfo | null;
    dianResolution: DianResolution | null;
    userAccounts: UserAccount[];
    connectionLogs: ConnectionLog[];
    theme: 'light' | 'dark';
    onUpdateCompanyInfo: (info: CompanyInfo) => void;
    onUpdateDianResolution: (resolution: DianResolution) => void;
    onAddUserAccount: (user: Omit<UserAccount, 'id'> & { password?: string }) => void;
    onChangePassword: (passwords: any) => void;
    onToggleTheme: () => void;
    onCreateBackup: () => void;
    onDownloadClientTemplate: () => void;
    onDownloadProductTemplate: () => void;
}

// Helper Components
const SettingsCard: React.FC<{ title: string; description?: string; children: React.ReactNode, className?: string }> = ({ title, description, children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-md border dark:border-gray-700 flex flex-col ${className}`}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">{description}</p>}
        <div className="mt-4 flex-grow flex flex-col">{children}</div>
    </div>
);

const FormField: React.FC<{ label: string; fullWidth?: boolean; children: React.ReactNode }> = ({ label, fullWidth = false, children }) => (
    <div className={fullWidth ? 'col-span-2' : ''}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        {children}
    </div>
);

const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed" />
);

const FormSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 text-sm" />
);

// Card Components
const IssuerDataCard: React.FC<{ info: CompanyInfo; onSave: (info: CompanyInfo) => void }> = ({ info, onSave }) => {
    const [formData, setFormData] = useState(info);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev!, [e.target.name]: e.target.value}));
    };
    
    const handleSave = () => {
        onSave(formData);
    };

    return (
        <SettingsCard title="Datos del Emisor" className="lg:row-span-2">
            <div className="space-y-3 text-sm flex-grow flex flex-col">
                <FormField label="Nombre / Razón Social"><FormInput name="name" value={formData.name} onChange={handleChange} /></FormField>
                <FormField label="NIT"><FormInput name="nit" value={formData.nit} onChange={handleChange} /></FormField>
                <FormField label="Vencimiento de Suscripción"><FormInput value={formData.subscriptionEndDate} disabled /></FormField>
                <FormField label="Dirección"><FormInput name="address" value={formData.address} onChange={handleChange} /></FormField>
                <FormField label="Ciudad"><FormInput name="city" value={formData.city} onChange={handleChange} /></FormField>
                <FormField label="Teléfono"><FormInput name="phone" value={formData.phone} onChange={handleChange} /></FormField>
                <FormField label="Correo"><FormInput name="email" value={formData.email} onChange={handleChange} /></FormField>
                 <div className="pt-4 border-t dark:border-gray-700">
                    <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Personalización de Factura</h4>
                    <FormField label="URL del Logo (opcional)">
                        <FormInput name="logoUrl" value={formData.logoUrl || ''} onChange={handleChange} placeholder="https://ejemplo.com/logo.png" />
                    </FormField>
                    {formData.logoUrl && (
                        <div className="mt-2 p-2 border rounded-md flex justify-center bg-gray-50 dark:bg-gray-700/50">
                            <img src={formData.logoUrl} alt="Vista previa del logo" className="max-h-16" />
                        </div>
                    )}
                </div>
            </div>
            <button onClick={handleSave} className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                Guardar Cambios Emisor
            </button>
        </SettingsCard>
    );
};

const DianResolutionCard: React.FC<{ resolution: DianResolution; onSave: (res: DianResolution) => void }> = ({ resolution, onSave }) => {
    const [formData, setFormData] = useState(resolution);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({...prev!, [e.target.name]: e.target.value}));
    };
    
    const handleSave = () => {
        onSave(formData);
    };

    return (
        <SettingsCard title="Resolución de Facturación DIAN">
            <div className="space-y-3 text-sm flex-grow flex flex-col">
                 <FormField label="Número de Resolución"><FormInput name="number" value={formData.number} onChange={handleChange} /></FormField>
                 <FormField label="Fecha de Resolución"><FormInput type="date" name="date" value={formData.date} onChange={handleChange} /></FormField>
                 <FormField label="Prefijo"><FormInput name="prefix" value={formData.prefix} onChange={handleChange} /></FormField>
                 <FormField label="Vigencia"><FormSelect name="validity" value={formData.validity} onChange={handleChange}>
                        <option>12 meses</option>
                        <option>6 meses</option>
                        <option>24 meses</option>
                    </FormSelect>
                 </FormField>
                 <FormField label="Rango Desde"><FormInput type="number" name="rangeFrom" value={formData.rangeFrom} onChange={handleChange} /></FormField>
                 <FormField label="Rango Hasta"><FormInput type="number" name="rangeTo" value={formData.rangeTo} onChange={handleChange} /></FormField>
            </div>
             <button onClick={handleSave} className="w-full mt-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                <ShieldCheckIcon /> Guardar Configuración
            </button>
        </SettingsCard>
    );
};

const DatabaseCard: React.FC<{ onCreateBackup: () => void; onDownloadClientTemplate: () => void; onDownloadProductTemplate: () => void; }> = ({ onCreateBackup, onDownloadClientTemplate, onDownloadProductTemplate }) => (
     <SettingsCard title="Base de Datos Local" description="Importa y exporta datos. Descarga plantillas para empezar.">
        <div className="flex-grow flex flex-col justify-center space-y-3">
            <button onClick={onDownloadClientTemplate} className="w-full flex items-center justify-center px-4 py-2 bg-blue-50 dark:bg-gray-700/50 text-blue-700 dark:text-gray-200 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600 font-semibold"><DownloadIcon /> Descargar Plantilla (Clientes)</button>
            <button onClick={onDownloadProductTemplate} className="w-full flex items-center justify-center px-4 py-2 bg-blue-50 dark:bg-gray-700/50 text-blue-700 dark:text-gray-200 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600 font-semibold"><DownloadIcon /> Descargar Plantilla (Productos)</button>
            <button onClick={() => alert('Función de importación no implementada.')} className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold"><ImportIcon /> Importar desde CSV/Excel</button>
            <button onClick={onCreateBackup} className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"><SaveNoteIcon /> Crear Copia de Seguridad (JSON)</button>
        </div>
    </SettingsCard>
);

const ConnectionLogCard: React.FC<{ logs: ConnectionLog[] }> = ({ logs }) => (
    <SettingsCard title="Registro de Conexiones" description="Últimas 10 conexiones de los usuarios de esta empresa.">
        <div className="border dark:border-gray-700 rounded-md overflow-hidden flex-grow">
            <div className="overflow-y-auto max-h-60 text-sm">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Usuario</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Fecha/Hora</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {logs.slice(0, 10).map(log => (
                            <tr key={log.id}>
                                <td className="px-3 py-2 whitespace-nowrap">{log.userEmail}</td>
                                <td className="px-3 py-2 whitespace-nowrap">{log.timestamp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </SettingsCard>
);

const UserManagementCard: React.FC<{ users: UserAccount[], onAddUser: (user: Omit<UserAccount, 'id'> & { password?: string }) => void }> = ({ users, onAddUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
        {isModalOpen && <UserModal onClose={() => setIsModalOpen(false)} onSave={onAddUser} />}
        <SettingsCard title="Gestión de Usuarios" description='Crea nuevos usuarios y asígnales un rol. El rol "Usuario" tiene permisos limitados y no puede crear, editar o eliminar clientes y productos.'>
            <button onClick={() => setIsModalOpen(true)} className="w-full mb-4 flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                <UserPlusIcon /> Crear Usuario
            </button>
            <h4 className="font-semibold text-sm mb-2 text-gray-800 dark:text-gray-200">Usuarios Activos en la Empresa</h4>
            <div className="border dark:border-gray-700 rounded-md overflow-hidden flex-grow">
                 <div className="overflow-y-auto max-h-48 text-sm">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                            <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Correo Electrónico</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Rol Asignado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map(user => (
                                 <tr key={user.id}>
                                    <td className="px-3 py-2 whitespace-nowrap">{user.email}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${user.role === 'Administrador' ? 'bg-green-100 text-green-800 dark:bg-green-200 dark:text-green-900' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>{user.role}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SettingsCard>
        </>
    );
};

const AccountSecurityCard: React.FC<{ onSave: (passwords: any) => void }> = ({ onSave }) => {
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords(p => ({ ...p, [e.target.name]: e.target.value }));
    };

    const handleSave = () => {
        if (passwords.new !== passwords.confirm) {
            alert("Las nuevas contraseñas no coinciden.");
            return;
        }
        if (passwords.new.length < 6) {
            alert("La nueva contraseña debe tener al menos 6 caracteres.");
            return;
        }
        onSave(passwords);
        setPasswords({ current: '', new: '', confirm: '' });
    };

    return (
        <SettingsCard title="Seguridad de la Cuenta" description="Cambia la contraseña de acceso a tu cuenta.">
            <div className="space-y-3 text-sm flex-grow flex flex-col">
                 <FormField label="Contraseña Actual"><FormInput name="current" type="password" placeholder="Ingresa tu contraseña actual" value={passwords.current} onChange={handleChange} /></FormField>
                 <FormField label="Nueva Contraseña"><FormInput name="new" type="password" placeholder="Mínimo 6 caracteres" value={passwords.new} onChange={handleChange} /></FormField>
                 <FormField label="Confirmar Nueva Contraseña"><FormInput name="confirm" type="password" placeholder="Repite la nueva contraseña" value={passwords.confirm} onChange={handleChange} /></FormField>
            </div>
             <button onClick={handleSave} className="w-full mt-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                Cambiar Contraseña
            </button>
        </SettingsCard>
    );
};

const UserModal: React.FC<{ onClose: () => void; onSave: (user: Omit<UserAccount, 'id'> & { password?: string }) => void; }> = ({ onClose, onSave }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'Administrador' | 'Usuario'>('Usuario');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            alert("El correo es obligatorio.");
            return;
        }
        if (password !== confirmPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }
        if (password.length < 6) {
            alert("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        onSave({ email, role, password });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Crear Nuevo Usuario</h2>
                    <button onClick={onClose}><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <FormField label="Correo Electrónico">
                            <FormInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@ejemplo.com" required />
                        </FormField>
                        <FormField label="Rol Asignado">
                            <FormSelect value={role} onChange={e => setRole(e.target.value as any)}>
                                <option value="Usuario">Usuario</option>
                                <option value="Administrador">Administrador</option>
                            </FormSelect>
                        </FormField>
                        <FormField label="Contraseña">
                            <FormInput type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required />
                        </FormField>
                        <FormField label="Confirmar Contraseña">
                            <FormInput type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                        </FormField>
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar Usuario</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Settings: React.FC<SettingsProps> = (props) => {
    if (!props.companyInfo || !props.dianResolution) {
        return <LoadingSpinner text="Cargando configuración..." />;
    }
    
    return (
        <div className="text-gray-800 dark:text-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                    <span className="p-2 bg-white dark:bg-gray-700/50 rounded-full shadow-sm border dark:border-gray-700">
                        <SettingsIcon />
                    </span>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Configuración</h1>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><HelpIcon /></button>
                </div>
                <button 
                    onClick={props.onToggleTheme}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                    {props.theme === 'light' ? <SunIcon /> : <MoonIcon />}
                    <span className="hidden sm:inline">Modo {props.theme === 'light' ? 'Claro' : 'Oscuro'}</span>
                </button>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-6 gap-6">
                 <IssuerDataCard info={props.companyInfo} onSave={props.onUpdateCompanyInfo} />
                 <DianResolutionCard resolution={props.dianResolution} onSave={props.onUpdateDianResolution} />
                 <DatabaseCard 
                    onCreateBackup={props.onCreateBackup} 
                    onDownloadClientTemplate={props.onDownloadClientTemplate} 
                    onDownloadProductTemplate={props.onDownloadProductTemplate}
                 />
                 <ConnectionLogCard logs={props.connectionLogs} />
                 <UserManagementCard users={props.userAccounts} onAddUser={props.onAddUserAccount} />
                 <AccountSecurityCard onSave={props.onChangePassword} />
            </div>
        </div>
    );
};

export default Settings;
