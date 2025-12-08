import React from 'react';
import TreeVisualizer from '../components/TreeVisualizer';
import { Search, Filter, ZoomIn, ZoomOut, Download } from 'lucide-react';

const Network = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] space-y-4">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white">Network Genealogy</h1>
            <p className="text-slate-400 text-sm">Visual representation of your binary downline</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-grow md:flex-grow-0">
                <input 
                    type="text" 
                    placeholder="Find username..." 
                    className="bg-slate-800 text-white pl-9 pr-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-teal-500 w-full md:w-64 placeholder:text-slate-500"
                />
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            </div>

            {/* Action Buttons */}
            <button className="bg-slate-800 p-2 rounded-lg text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors" title="Filter">
                <Filter size={20} />
            </button>
            <button className="bg-slate-800 p-2 rounded-lg text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors" title="Export Tree">
                <Download size={20} />
            </button>
        </div>
      </div>

      {/* Main Tree Container */}
      <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700 relative w-full h-full flex flex-col">
         {/* Floating Controls (Visual only for now) */}
         <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 bg-slate-800/80 backdrop-blur p-2 rounded-lg border border-slate-700/50">
            <button className="p-2 hover:bg-slate-700 rounded text-slate-300"><ZoomIn size={20} /></button>
            <button className="p-2 hover:bg-slate-700 rounded text-slate-300"><ZoomOut size={20} /></button>
         </div>

         {/* The Tree Component */}
         <TreeVisualizer />
      </div>
    </div>
  );
};

export default Network;