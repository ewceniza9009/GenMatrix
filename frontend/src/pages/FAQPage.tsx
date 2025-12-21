import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, MessageSquare, ArrowLeft, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

const FAQPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: "How do I withdraw my earnings?",
            answer: "To withdraw your earnings, navigate to the Wallet page and select 'Withdraw'. You can choose from various withdrawal methods including bank transfer and crypto. Note that there may be a minimum withdrawal amount and processing times vary by method."
        },
        {
            question: "What is the difference between PV and GV?",
            answer: "PV (Personal Volume) refers to the volume generated from your own purchases and direct sales. GV (Group Volume) includes the PV of everyone in your downline organization. Both are used to determine your rank and commission eligibility."
        },
        {
            question: "How are commissions calculated?",
            answer: "Commissions are calculated based on the GenMatrix compensation plan. This typically involves a combination of direct referral bonuses, binary team commissions, and matching bonuses. Detailed breakdowns can be found in the Documentation section."
        },
        {
            question: "Can I change my sponsor?",
            answer: "Sponsor changes are generally not permitted to maintain the implementation of the network structure. In exceptional circumstances, please contact support with a detailed reason for your request."
        },
        {
            question: "How do I upgrade my membership package?",
            answer: "You can upgrade your package at any time by going to the Shop or Packages page. You simply need to pay the difference between your current package and the new one to unlock higher commission rates and benefits."
        },
        {
            question: "What happens if I forget my password?",
            answer: "If you forget your password, click on the 'Forgot Password' link on the login page. You'll receive an email with instructions to reset your password. For security reasons, support cannot see your password."
        }
    ];

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="shrink-0">
                <PageHeader
                    title="Frequently Asked Questions"
                    subtitle="Quick answers to the most common questions about GenMatrix."
                    icon={<HelpCircle size={24} />}
                    actions={
                        <div className="flex items-center gap-3">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search answers..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1a1b23] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm text-sm text-gray-900 dark:text-white"
                                />
                            </div>
                            <button
                                onClick={() => navigate('/dashboard/help')}
                                className="flex items-center gap-2 text-gray-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-white transition-colors bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm font-medium"
                            >
                                <ArrowLeft size={16} />
                                <span className="hidden sm:inline">Back</span>
                            </button>
                        </div>
                    }
                />
            </div>

            {/* Mobile View: Standard Stack (Preserves Order) */}
            <div className="lg:hidden space-y-4">
                {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-[#1a1b23] rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden transition-all duration-200"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-5 text-left bg-transparent hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                            >
                                <span className="font-semibold text-gray-900 dark:text-white pr-8">
                                    {faq.question}
                                </span>
                                {openIndex === index ? (
                                    <ChevronUp className="flex-shrink-0 text-teal-500" size={20} />
                                ) : (
                                    <ChevronDown className="flex-shrink-0 text-gray-400" size={20} />
                                )}
                            </button>

                            <div
                                className={`transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    } overflow-hidden`}
                            >
                                <div className="p-5 pt-0 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/5 mt-2">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-[#1a1b23] rounded-xl border border-gray-200 dark:border-white/5">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No questions found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Currently there are no FAQ items matching your search.
                        </p>
                    </div>
                )}
            </div>

            {/* Desktop View: Masonry Split (Evens/Odds) to Fix Expansion Gaps */}
            <div className="hidden lg:flex gap-4 items-start">
                {filteredFaqs.length > 0 ? (
                    <>
                        {/* Left Column (Even Indices) */}
                        <div className="flex-1 space-y-4">
                            {filteredFaqs.filter((_, i) => i % 2 === 0).map((faq) => {
                                const displayIndex = filteredFaqs.indexOf(faq);
                                return (
                                    <div
                                        key={displayIndex}
                                        className="bg-white dark:bg-[#1a1b23] rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden hover:border-teal-500/30 transition-all duration-200 h-fit"
                                    >
                                        <button
                                            onClick={() => setOpenIndex(openIndex === displayIndex ? null : displayIndex)}
                                            className="w-full flex items-center justify-between p-5 text-left bg-transparent hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                                        >
                                            <span className="font-semibold text-gray-900 dark:text-white pr-8">
                                                {faq.question}
                                            </span>
                                            {openIndex === displayIndex ? (
                                                <ChevronUp className="flex-shrink-0 text-teal-500" size={20} />
                                            ) : (
                                                <ChevronDown className="flex-shrink-0 text-gray-400" size={20} />
                                            )}
                                        </button>

                                        <div
                                            className={`transition-all duration-300 ease-in-out ${openIndex === displayIndex ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                                } overflow-hidden`}
                                        >
                                            <div className="p-5 pt-0 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/5 mt-2">
                                                {faq.answer}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right Column (Odd Indices) */}
                        <div className="flex-1 space-y-4">
                            {filteredFaqs.filter((_, i) => i % 2 !== 0).map((faq) => {
                                const displayIndex = filteredFaqs.indexOf(faq);
                                return (
                                    <div
                                        key={displayIndex}
                                        className="bg-white dark:bg-[#1a1b23] rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden hover:border-teal-500/30 transition-all duration-200 h-fit"
                                    >
                                        <button
                                            onClick={() => setOpenIndex(openIndex === displayIndex ? null : displayIndex)}
                                            className="w-full flex items-center justify-between p-5 text-left bg-transparent hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                                        >
                                            <span className="font-semibold text-gray-900 dark:text-white pr-8">
                                                {faq.question}
                                            </span>
                                            {openIndex === displayIndex ? (
                                                <ChevronUp className="flex-shrink-0 text-teal-500" size={20} />
                                            ) : (
                                                <ChevronDown className="flex-shrink-0 text-gray-400" size={20} />
                                            )}
                                        </button>

                                        <div
                                            className={`transition-all duration-300 ease-in-out ${openIndex === displayIndex ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                                } overflow-hidden`}
                                        >
                                            <div className="p-5 pt-0 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/5 mt-2">
                                                {faq.answer}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="w-full text-center py-12 bg-white dark:bg-[#1a1b23] rounded-xl border border-gray-200 dark:border-white/5">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No questions found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Currently there are no FAQ items matching your search.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FAQPage;
