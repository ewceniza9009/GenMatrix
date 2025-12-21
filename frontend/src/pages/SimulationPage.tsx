
import CommissionSimulation from '../components/CommissionSimulation';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const SimulationPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-auto lg:h-[calc(100vh-6rem)] gap-2 lg:gap-4 animate-in fade-in duration-500">
            <PageHeader
                title="Compensation Simulator"
                subtitle="Interactive commission & rank simulation."
                icon={<Calculator size={24} />}
                className="shrink-0"
                actions={
                    <button
                        onClick={() => navigate('/dashboard/help')}
                        className="flex items-center gap-2 text-gray-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-white transition-colors bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm font-medium"
                    >
                        <ArrowLeft size={16} />
                        <span className="hidden sm:inline">Help Center</span>
                    </button>
                }
            />

            <div className="flex-1 min-h-0">
                <CommissionSimulation />
            </div>
        </div>
    );
};

export default SimulationPage;
