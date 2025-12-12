import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Activity, Users, Globe, BarChart3, Lock } from 'lucide-react';
import React from 'react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-midnight-950 text-white selection:bg-gold-500/30 font-sans overflow-x-hidden">

            {/* Abstract Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute top-[40%] -left-[20%] w-[600px] h-[600px] bg-gold-600/5 rounded-full blur-[100px] animate-float-slow"></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                        <span className="font-bold text-white text-xl">GM</span>
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white">Gen<span className="text-teal-400">Matrix</span><span className="text-gold-500">.</span></span>
                </div>
                <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
                    <a href="#features" className="hover:text-white transition-colors">Solutions</a>
                    <a href="#analytics" className="hover:text-white transition-colors">Analytics</a>
                    <a href="#security" className="hover:text-white transition-colors">Security</a>
                </div>
                <div className="flex gap-4">
                    <Link to="/login" className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-200 hover:text-white transition-colors">
                        Log In
                    </Link>
                    <Link to="/register" className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white text-sm font-semibold shadow-lg shadow-teal-500/25 transition-all hover:scale-105">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-8 animate-fade-in-up">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Enterprise Grade System v2.0
                    </div>

                    <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        Architecting the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-300">Future of Network</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Experience an institutional-grade platform designed for massive scale. Real-time genealogy tracking, algorithmic commission rendering, and bank-grade security protocols.
                    </p>

                    <div className="flex flex-col md:flex-row justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <Link to="/register" className="group relative px-8 py-4 bg-white text-midnight-950 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)]">
                            Start Your Empire
                            <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/login" className="px-8 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm font-semibold text-lg transition-colors">
                            Access Dashboard
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats/Social Proof */}
            <div className="border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: 'Network Uptime', value: '99.99%', icon: Activity },
                        { label: 'Active Members', value: '50k+', icon: Users },
                        { label: 'Global Reach', value: '24 Countries', icon: Globe },
                        { label: 'Transactions', value: '$25M+', icon: BarChart3 },
                    ].map((stat, i) => (
                        <div key={i} className="flex items-center gap-4 justify-center md:justify-start">
                            <div className="p-3 rounded-lg bg-teal-500/10 text-teal-400">
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Grid */}
            <section id="features" className="py-32 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Engineered for <span className="text-gradient-gold">Excellence</span></h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            Our platform combines cutting-edge technology with intuitive design to provide a seamless experience for administrators and distributors alike.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Activity />}
                            title="Dynamic Binary Tree"
                            desc="Visualize your entire network growth with our real-time 3D binary tree renderer. Track downlines, placement strategies, and team volume instantly."
                        />
                        <FeatureCard
                            icon={<ShieldCheck />}
                            title="Secure Wallet System"
                            desc="Integrated digital wallet for seamless commission withdrawals, fund transfers, and secure P2P transactions within your network."
                        />
                        <FeatureCard
                            icon={<BarChart3 />}
                            title="Real-Time Commissions"
                            desc="Automated calculation engine processing Direct Referral, Binary Match, and Rank Advancement bonuses instantly upon transaction completion."
                        />
                        <FeatureCard
                            icon={<Users />}
                            title="Global E-Commerce"
                            desc="Full-featured online store with inventory management, product categorization, and borderless product distribution capabilities."
                        />
                        <FeatureCard
                            icon={<Lock />}
                            title="Comprehensive Admin Control"
                            desc="Full administrative oversight of user management, order processing, commission approvals, and system-wide configuration."
                        />
                        <FeatureCard
                            icon={<Globe />}
                            title="Membership Packages"
                            desc="Flexible enrollment tiers with instant PV allocation, automated rank progression, and diverse entry points for new distributors."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10 bg-midnight-950 text-slate-400 text-sm">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-500 font-bold">GM</div>
                        <span className="font-semibold text-slate-200">GenMatrix Enterprise</span>
                    </div>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Contact Support</a>
                    </div>
                    <div className="text-slate-500">
                        © 2024 GenMatrix Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Sub-component for Feature Cards
const FeatureCard = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <div className="group p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-teal-500/30 transition-all duration-300 hover:-translate-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/10 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform duration-300">
            {React.cloneElement(icon, { size: 28 })}
        </div>
        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-teal-300 transition-colors">{title}</h3>
        <p className="text-slate-400 leading-relaxed font-light">
            {desc}
        </p>
    </div>
);

export default LandingPage;
