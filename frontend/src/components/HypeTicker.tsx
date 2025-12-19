import React from 'react';
import { motion } from 'framer-motion';
import { useGetHypeTickerQuery } from '../store/api';

const HypeTicker: React.FC = () => {
    const { data: events } = useGetHypeTickerQuery(undefined, {
        pollingInterval: 30000, // Update every 30s
    });

    // Duplicate events to create seamless loop if there are few items
    const displayEvents = events ? [...events, ...events, ...events] : [];

    if (!events || events.length === 0) return null;

    return (
        <div className="w-full bg-gradient-to-r from-purple-900/90 to-blue-900/90 border-b border-white/10 overflow-hidden relative h-12 flex items-center shadow-lg backdrop-blur-md z-40">

            {/* Label Badge */}
            <div className="absolute left-0 top-0 bottom-0 bg-yellow-500/20 text-yellow-400 font-bold px-4 flex items-center z-10 skew-x-[-12deg] -ml-2 border-r border-yellow-500/50">
                <span className="skew-x-[12deg] flex items-center gap-2 text-sm uppercase tracking-wider">
                    <span className="animate-pulse">⚡</span> LIVE ACTION
                </span>
            </div>

            {/* Marquee Container */}
            <div className="flex overflow-hidden w-full mask-linear-fade relative pl-32">
                <motion.div
                    className="flex gap-8 whitespace-nowrap"
                    animate={{ x: [0, -1000] }} // Adjust logic for seamless loop based on width
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 40, // Adjust speed
                            ease: "linear",
                        },
                    }}
                >
                    {displayEvents.map((event: any, i: number) => (
                        <div
                            key={`${event.id}-${i}`}
                            className="flex items-center gap-2 text-sm text-white/90"
                        >
                            <span className="text-xl">{event.icon}</span>
                            <span className="font-bold text-blue-200">{event.username}</span>
                            <span className="text-blue-100/80">{event.message}</span>
                            <span className="text-xs text-white/40 ml-1">
                                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* CSS Mask for fade effect */}
            <style>{`
        .mask-linear-fade {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
        </div>
    );
};

export default HypeTicker;
