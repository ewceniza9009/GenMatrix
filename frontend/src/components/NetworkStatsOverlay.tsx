import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap, Award, Layers, Minimize2, Maximize2, Move } from 'lucide-react';

interface NetworkStatsOverlayProps {
    nodeData: any;
}

const NetworkStatsOverlay: React.FC<NetworkStatsOverlayProps> = ({ nodeData }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);

    // Refs to track drag start positions without triggering re-renders
    const dragStart = useRef({ x: 0, y: 0 }); // Mouse/Touch Global Start
    const elmStart = useRef({ x: 0, y: 0 });  // Element Local Start

    // Global event listeners for drag move/end
    useEffect(() => {
        const handleMove = (clientX: number, clientY: number) => {
            if (isDragging) {
                const dx = clientX - dragStart.current.x;
                const dy = clientY - dragStart.current.y;
                setPosition({
                    x: elmStart.current.x + dx,
                    y: elmStart.current.y + dy
                });
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            handleMove(e.clientX, e.clientY);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                // Prevent default to stop scrolling while dragging the card
                e.preventDefault();
                handleMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        const handleEnd = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleTouchMove, { passive: false }); // Non-passive to allow preventDefault
            window.addEventListener('touchend', handleEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging]);

    if (!nodeData || !nodeData.attributes) return null;

    const { groupVolume, leftPV, rightPV, rank, personalPV } = nodeData.attributes;

    const startDrag = (clientX: number, clientY: number) => {
        setIsDragging(true);
        dragStart.current = { x: clientX, y: clientY };
        elmStart.current = { x: position.x, y: position.y };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        startDrag(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length > 0) {
            // e.stopPropagation(); // Optional: prevent triggering canvas drag if necessary
            startDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    return (
        <div
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                cursor: isDragging ? 'grabbing' : 'auto',
                touchAction: 'none' // Critical for browser to know we handle touches
            }}
            className="absolute z-50 flex flex-col gap-3 select-none"
        >
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl border border-white/20 dark:border-slate-700/50 shadow-2xl min-w-[220px] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                {/* Header - Draggable Area */}
                <div
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-slate-700/50 cursor-grab active:cursor-grabbing bg-gray-50/50 dark:bg-white/5 transition-colors hover:bg-gray-100/50 dark:hover:bg-white/10"
                >
                    <div className="flex items-center gap-2 pointer-events-none">
                        <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white shadow-lg shadow-indigo-500/30">
                            <Activity size={14} />
                        </div>
                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Network Stats</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Move size={14} className="text-gray-300 dark:text-slate-600 mr-1" />
                        <button
                            onTouchStart={(e) => e.stopPropagation()} // Prevent drag when clicking button
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded text-gray-500 dark:text-slate-400 transition-colors"
                        >
                            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                        </button>
                    </div>
                </div>

                {!isMinimized && (
                    <div className="p-4 space-y-3">
                        <div className="mb-2">
                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate">{nodeData.name}</p>
                        </div>

                        {/* Group Volume */}
                        <div className="bg-indigo-50 dark:bg-indigo-500/10 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-500/20 group hover:border-indigo-200 dark:hover:border-indigo-500/40 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-bold text-indigo-500 uppercase flex items-center gap-1">
                                    <Layers size={12} /> Group Volume
                                </span>
                                <span className="text-xl font-black text-indigo-700 dark:text-indigo-400">
                                    {(groupVolume || 0).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {/* Left PV */}
                            <div className="bg-gray-50 dark:bg-slate-700/50 p-2 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                <span className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">Left PV</span>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{(leftPV || 0).toLocaleString()}</span>
                            </div>

                            {/* Right PV */}
                            <div className="bg-gray-50 dark:bg-slate-700/50 p-2 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                <span className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">Right PV</span>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{(rightPV || 0).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 gap-2">
                            <div className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-amber-50 dark:bg-amber-500/10 rounded-md border border-amber-100 dark:border-amber-500/20">
                                <Award size={12} className="text-amber-500" />
                                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 truncate">{rank || 'Member'}</span>
                            </div>
                            <div className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-teal-50 dark:bg-teal-500/10 rounded-md border border-teal-100 dark:border-teal-500/20">
                                <Zap size={12} className="text-teal-500" />
                                <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 truncate">PPV: {personalPV || 0}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NetworkStatsOverlay;
