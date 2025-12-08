import React, { useState } from 'react';
import Tree from 'react-d3-tree';
import { useGetTreeQuery } from '../store/api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { User, Shield, Zap } from 'lucide-react';

const TreeVisualizer = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: treeData, isLoading, error } = useGetTreeQuery(user?.id);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const containerStyles = {
    width: '100%',
    height: '100%',
    background: '#0f172a' // slate-900
  };

  const renderForeignObjectNode = ({ nodeDatum, toggleNode }: { nodeDatum: any, toggleNode: () => void }) => {
    // Determine rank color
    let rankColor = 'border-slate-500';
    if (nodeDatum.attributes?.rank === 'Gold') rankColor = 'border-yellow-500';
    if (nodeDatum.attributes?.rank === 'Silver') rankColor = 'border-gray-300';
    if (nodeDatum.attributes?.rank === 'Bronze') rankColor = 'border-orange-700';
    if (nodeDatum.attributes?.rank === 'Diamond') rankColor = 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]';

    return (
      <foreignObject width="220" height="120" x="-110" y="-60">
        <div 
          className={`bg-slate-800 rounded-lg p-3 border-l-4 ${rankColor} shadow-lg cursor-pointer hover:bg-slate-750 transition-colors flex flex-col justify-between h-full`}
          onClick={toggleNode}
        >
          <div className="flex items-start justify-between">
             <div className="flex items-center space-x-2">
                <div className="bg-slate-700 p-1.5 rounded-full">
                  <User size={16} className="text-teal-400" />
                </div>
                <div>
                   <p className="text-white font-bold text-sm truncate w-24" title={nodeDatum.name}>
                     {nodeDatum.name}
                   </p>
                   <p className="text-xs text-slate-400">{nodeDatum.attributes?.rank || 'Member'}</p>
                </div>
             </div>
             {nodeDatum.attributes?.active && <div className="w-2 h-2 bg-green-500 rounded-full" title="Active"></div>}
          </div>
          
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
             <div className="bg-slate-900/50 p-1 rounded">
               <p className="text-slate-500">Left</p>
               <p className="text-white font-mono">{nodeDatum.attributes?.leftPV || 0}</p>
             </div>
             <div className="bg-slate-900/50 p-1 rounded">
               <p className="text-slate-500">Right</p>
               <p className="text-white font-mono">{nodeDatum.attributes?.rightPV || 0}</p>
             </div>
          </div>
        </div>
      </foreignObject>
    );
  };

  if (isLoading) return <div className="text-white p-4">Loading Network...</div>;
  if (error) return <div className="text-red-500 p-4">Error loading tree</div>;
  if (!treeData) return <div className="text-white p-4">No tree data found</div>;

  return (
    <div style={containerStyles} ref={el => {
      if (el && !translate.x) {
         setTranslate({ x: el.getBoundingClientRect().width / 2, y: 100 });
      }
    }} className="rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
      <Tree
        data={treeData}
        translate={translate}
        pathFunc="step"
        orientation="vertical"
        renderCustomNodeElement={renderForeignObjectNode}
        nodeSize={{ x: 250, y: 180 }}
        pathClassFunc={() => 'stroke-slate-600 !stroke-2'} // High contrast path
      />
    </div>
  );
};

export default TreeVisualizer;
