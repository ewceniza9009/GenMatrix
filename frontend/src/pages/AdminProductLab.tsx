import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, FlaskConical, Beaker, Rocket, CheckCircle } from 'lucide-react';
import { useGetProductIdeasQuery, useCreateProductIdeaMutation, useUpdateProductIdeaMutation, useDeleteProductIdeaMutation, usePromoteProductIdeaMutation } from '../store/api';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { useUI } from '../components/UIContext';

const AdminProductLab = () => {
    const { showConfirm, showAlert } = useUI();
    const { data: ideas = [], isLoading } = useGetProductIdeasQuery({});
    const [createIdea] = useCreateProductIdeaMutation();
    const [updateIdea] = useUpdateProductIdeaMutation();
    const [deleteIdea] = useDeleteProductIdeaMutation();
    const [promoteIdea, { isLoading: isPromoting }] = usePromoteProductIdeaMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIdea, setEditingIdea] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: '',
        proposedPrice: 0,
        targetPV: 0,
        description: '',
        notes: '',
        status: 'draft',
        priority: 'medium'
    });

    const handleOpenCreate = () => {
        setEditingIdea(null);
        setFormData({
            name: '',
            proposedPrice: 0,
            targetPV: 0,
            description: '',
            notes: '',
            status: 'draft',
            priority: 'medium'
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (idea: any) => {
        setEditingIdea(idea);
        setFormData({
            name: idea.name,
            proposedPrice: idea.proposedPrice || 0,
            targetPV: idea.targetPV || 0,
            description: idea.description || '',
            notes: idea.notes || '',
            status: idea.status || 'draft',
            priority: idea.priority || 'medium'
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        showConfirm({
            title: 'Delete Concept?',
            message: 'Are you sure you want to discard this product concept?',
            type: 'danger',
            confirmText: 'Discard',
            onConfirm: async () => {
                try {
                    await deleteIdea(id).unwrap();
                    showAlert('Concept discarded', 'success');
                } catch {
                    showAlert('Failed to discard concept', 'error');
                }
            }
        });
    };

    const handlePromote = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        showConfirm({
            title: 'Launch Product?',
            message: 'This will convert the concept into a live Product in the store. This action cannot be undone.',
            type: 'info',
            confirmText: 'Launch Product',
            onConfirm: async () => {
                try {
                    await promoteIdea(id).unwrap();
                    showAlert('Product successfully launched!', 'success');
                } catch (err: any) {
                    showAlert(err?.data?.message || 'Failed to launch product', 'error');
                }
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingIdea) {
                await updateIdea({ id: editingIdea._id, ...formData }).unwrap();
                showAlert('Concept updated', 'success');
            } else {
                await createIdea(formData).unwrap();
                showAlert('Concept created', 'success');
            }
            setIsModalOpen(false);
        } catch (err) {
            showAlert('Failed to save concept', 'error');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
            case 'review': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'approved': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'converted': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Product Lab"
                subtitle="Incubator for new product concepts and ideas."
                icon={<FlaskConical size={24} />}
                actions={
                    <button
                        onClick={handleOpenCreate}
                        className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-bold transition-colors shadow-lg"
                    >
                        <Plus size={20} /> New Concept
                    </button>
                }
            />

            {isLoading ? (
                <div className="text-center py-20 text-gray-500">Loading concepts...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Add Card */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        onClick={handleOpenCreate}
                        className="min-h-[280px] rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-700 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 hover:text-teal-500 dark:hover:text-teal-400 hover:border-teal-500 dark:hover:border-teal-400 cursor-pointer transition-all bg-gray-50/50 dark:bg-slate-900/50 group"
                    >
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-4 group-hover:shadow-md transition-shadow">
                            <Plus size={32} />
                        </div>
                        <span className="font-bold text-lg">Add New Concept</span>
                    </motion.div>

                    {ideas.map((idea: any) => (
                        <motion.div
                            layout
                            key={idea._id}
                            onClick={() => handleOpenEdit(idea)}
                            className={`relative bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col group ${idea.status === 'converted' ? 'opacity-75 grayscale-[0.5] hover:grayscale-0' : ''}`}
                        >
                            {/* Status Stripe */}
                            <div className={`h-1.5 w-full ${getStatusColor(idea.status).split(' ')[0].replace('/30', '')} bg-opacity-100`} />

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(idea.status)}`}>
                                        {idea.status}
                                    </span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {idea.status !== 'converted' && (
                                            <button
                                                onClick={(e) => handleDelete(idea._id, e)}
                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                                title="Discard"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                                    {idea.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-3 mb-4">
                                    {idea.description || 'No description provided.'}
                                </p>

                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-700/50 flex items-end justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target Price</span>
                                        <span className="text-lg font-mono font-bold text-gray-900 dark:text-white">${idea.proposedPrice}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Potential PV</span>
                                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{idea.targetPV} PV</span>
                                    </div>
                                </div>

                                {idea.status !== 'converted' ? (
                                    <button
                                        onClick={(e) => handlePromote(idea._id, e)}
                                        disabled={isPromoting}
                                        className="mt-4 w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg font-bold text-sm flex items-center justify-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-lg hover:bg-teal-600 dark:hover:bg-teal-400 dark:hover:text-white"
                                    >
                                        <Rocket size={16} /> Launch Product
                                    </button>
                                ) : (
                                    <div className="mt-4 w-full py-2.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg font-bold text-sm flex items-center justify-center gap-2 border border-green-200 dark:border-green-500/20">
                                        <CheckCircle size={16} /> Launched
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    {editingIdea ? <Edit2 size={20} className="text-teal-500" /> : <Beaker size={20} className="text-teal-500" />}
                                    {editingIdea ? 'Refine Concept' : 'New Product Concept'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white dark:bg-slate-700/50 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Concept Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Anti-Aging Serum X"
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all font-medium"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Proposed Price</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                            <input
                                                required
                                                type="number"
                                                min="0"
                                                className="w-full pl-7 pr-3 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all font-mono font-bold"
                                                value={formData.proposedPrice}
                                                onChange={e => setFormData({ ...formData, proposedPrice: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Target PV</label>
                                        <div className="relative">
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">PV</span>
                                            <input
                                                required
                                                type="number"
                                                min="0"
                                                className="w-full pl-3 pr-10 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all font-mono font-bold"
                                                value={formData.targetPV}
                                                onChange={e => setFormData({ ...formData, targetPV: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                                    <textarea
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white h-24 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe the product features and benefits..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                                        <select
                                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all appearance-none"
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                            disabled={editingIdea?.status === 'converted'}
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="review">In Review</option>
                                            <option value="approved">Approved</option>
                                            {editingIdea?.status === 'converted' && <option value="converted">Converted</option>}
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Priority</label>
                                        <select
                                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all appearance-none"
                                            value={formData.priority}
                                            onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Admin Notes</label>
                                    <textarea
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-yellow-50 dark:bg-yellow-900/10 text-gray-900 dark:text-white h-20 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all resize-none"
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Internal notes, supplier details, etc..."
                                    />
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-700">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700 font-bold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-200 hover:shadow-lg text-white dark:text-black font-bold flex items-center gap-2 transition-all active:scale-95"
                                    >
                                        <Save size={18} /> Save Concept
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminProductLab;
