import React from 'react';
import { useGetTreeQuery } from '../../store/api';
import { User, Zap, AlertCircle } from 'lucide-react';

const MatrixTree = () => {
    // We re-use getTree because Matrix View is just a visual re-arrangement of the same data structure (Binary Tree)
    // Ideally we might want a different endpoint if we need deeper levels at once, but getTree(depth=4) is a good start.
    const { data: treeData, isLoading } = useGetTreeQuery(undefined);

    // Flatten the tree into levels for Matrix rendering
    // Breadth-First Search to organize by rank/level? 
    // Matrix view usually shows:
    // Level 1: [Left, Right]
    // Level 2: [LL, LR, RL, RR]

    const renderLevel = (nodes: any[], levelIndex: number) => {
        if (nodes.length === 0) return null;

        return (
            <div key={levelIndex} className="mb-8 relative z-10">
                <div className="flex justify-center mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-slate-900 px-2 py-1 rounded">Level {levelIndex + 1}</span>
                </div>
                <div className="flex justify-center gap-4 sm:gap-8 flex-wrap">
                    {nodes.map((node, i) => (
                        <MatrixNode key={`${levelIndex}-${i}`} node={node} />
                    ))}
                </div>
            </div>
        );
    };

    // Helper to generate levels
    const generateLevels = (root: any, maxDepth: number = 4) => {
        if (!root) return [];
        const levels = [];
        let queue = [root];

        for (let i = 0; i < maxDepth; i++) {
            const currentLevel = [...queue];
            levels.push(currentLevel);

            const nextLevel: any[] = [];
            // For binary matrix, we ALWAYS need to show slots, even if empty?
            // That is complex. For now, let's just show filld nodes and gaps if we can infer them.
            // Actually, simple "Matrix View" usually just centers the nodes.

            currentLevel.forEach(node => {
                if (node.children && node.children.length > 0) {
                    nextLevel.push(...node.children);
                }
            });

            if (nextLevel.length === 0) break;
            queue = nextLevel;
        }
        return levels;
    };

    const levels = treeData ? generateLevels(treeData) : [];

    if (isLoading) return <div className="p-10 text-center animate-pulse">Loading Matrix...</div>;

    return (
        <div className="h-full overflow-auto bg-gray-50/50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-200 dark:border-slate-800 relative">
            {/* Background Grid Lines (Decorative) */}
            <div className="absolute inset-0 pointer-events-none opacity-5"
                style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="relative z-10 min-w-[800px] flex flex-col items-center">
                {levels.map((levelNodes, i) => renderLevel(levelNodes, i))}
            </div>
        </div>
    );
};

const MatrixNode = ({ node }: { node: any }) => {
    const isActive = node.attributes.active;
    const isStrong = node.attributes.rank !== 'Bronze' && node.attributes.rank !== 'Member';

    return (
        <div className="flex flex-col items-center group relative">
            {/* Connection Line (Top) */}
            <div className="h-4 w-px bg-gray-300 dark:bg-slate-600 absolute -top-4"></div>

            <div className={`
                w-16 h-16 rounded-xl flex items-center justify-center shadow-lg border-2 transition-transform hover:scale-110 cursor-pointer
                ${isActive
                    ? isStrong ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-300 text-white'
                        : 'bg-white dark:bg-slate-800 border-green-500 text-gray-900 dark:text-white'
                    : 'bg-gray-100 dark:bg-slate-900 border-gray-300 dark:border-slate-700 text-gray-400 grayscale'
                }
            `}>
                <div className="text-center">
                    <div className="text-[10px] font-bold truncate max-w-[50px]">{node.name}</div>
                    <div className="text-[9px] opacity-70">{node.attributes.rank}</div>
                </div>

                {/* Checkmark/Status Badge */}
                {!isActive && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                        <AlertCircle size={10} />
                    </div>
                )}
            </div>

            {/* Stats Tooltip (Hover) */}
            <div className="absolute opacity-0 group-hover:opacity-100 top-full mt-2 bg-black/80 text-white text-xs rounded px-2 py-1 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                L: {node.attributes.leftPV} | R: {node.attributes.rightPV}
            </div>

            {/* Connection Line (Bottom) - Only if has children */}
            {node.children && node.children.length > 0 && (
                <div className="h-4 w-px bg-gray-300 dark:bg-slate-600 absolute -bottom-4"></div>
            )}
        </div>
    )
}

export default MatrixTree;
