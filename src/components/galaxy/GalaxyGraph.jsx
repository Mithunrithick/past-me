import React, { useState, useEffect, useMemo, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const GalaxyGraph = ({ entries, searchTerm, onNodeClick }) => {
  const [init, setInit] = useState(false);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [hoverNode, setHoverNode] = useState(null);

  const fgRef = useRef();

  useEffect(() => {
    initParticlesEngine(async (engine) => { await loadSlim(engine); }).then(() => setInit(true));
  }, []);

  useEffect(() => {
    const handleResize = () => setDimensions({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const nodes = [];
    const links = [];
    const keywordMap = new Map(); 
    const emotionMap = new Map(); 

    entries.forEach((entry) => {
      const entryId = entry.id;
      
      // 1. ENTRY NODE
      // Calculate visual weight based on sentiment intensity
      const sentimentIntensity = entry.sentiment ? Math.abs(entry.sentiment) : 0;
      const nodeSize = 20 + (sentimentIntensity * 15); // Base 20, max +15

      nodes.push({
        id: entryId, group: 'entry',
        // Safety check for date
        name: entry.createdAt?.toDate ? new Date(entry.createdAt.toDate()).toLocaleDateString() : 'Memory',
        val: nodeSize, ...entry
      });

      // 2. EMOTION NODE
      if (entry.emotion) {
        if (!emotionMap.has(entry.emotion)) {
          emotionMap.set(entry.emotion, true);
          // FIX: Added 'name' property
          nodes.push({ id: entry.emotion, name: entry.emotion, group: 'emotion', val: 10 });
        }
        links.push({ source: entryId, target: entry.emotion });
      }

      // 3. KEYWORD NODES
      if (entry.keywords && Array.isArray(entry.keywords)) {
        entry.keywords.forEach(kw => {
          const lowerKw = kw.toLowerCase();
          if (!keywordMap.has(lowerKw)) {
            keywordMap.set(lowerKw, true);
            // FIX: Added 'name' property
            nodes.push({ id: lowerKw, name: lowerKw, group: 'keyword', val: 5 });
          }
          links.push({ source: entryId, target: lowerKw });
        });
      }
    });
    setGraphData({ nodes, links });
  }, [entries]);

  const particlesOptions = useMemo(() => ({
    background: { color: { value: "transparent" } }, 
    fpsLimit: 60,
    particles: {
      color: { value: "#ffffff" }, links: { enable: false }, 
      move: { enable: true, speed: 0.2, direction: "none", random: true, outModes: "out" },
      number: { value: 160, density: { enable: true, area: 800 } },
      opacity: { value: { min: 0.1, max: 0.5 }, animation: { enable: true, speed: 1, minimumValue: 0.1 } },
      size: { value: { min: 1, max: 3 } },
    },
  }), []);

  const isNeighbor = (node1, node2) => {
    return graphData.links.some(link => 
        (link.source.id === node1.id && link.target.id === node2.id) ||
        (link.source.id === node2.id && link.target.id === node1.id)
    );
  };

  // Calculate Tooltip Position
  const getTooltipPos = () => {
    if (!hoverNode || !fgRef.current) return { left: -9999, top: -9999 };
    // Translate graph coordinates (simulation space) to screen coordinates
    const coords = fgRef.current.graph2ScreenCoords(hoverNode.x, hoverNode.y);
    return {
       left: coords.x + 15, // Offset slightly so cursor doesn't cover it
       top: coords.y - 15
    };
  };

  const tooltipPos = getTooltipPos();

  return (
    <div className="absolute inset-0 z-0">
        {init && <Particles id="tsparticles" options={particlesOptions} className="absolute inset-0 -z-20" />}
        
        <ForceGraph2D
            ref={fgRef}
            width={dimensions.w} height={dimensions.h} 
            graphData={graphData} 
            nodeLabel="name" 
            backgroundColor="rgba(0,0,0,0)" 
            
            nodeCanvasObject={(node, ctx, globalScale) => {
                if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return;

                let color = '#a78bfa'; // Default Purple
                if (node.group === 'entry') color = '#60a5fa'; // Blue
                if (node.group === 'emotion') color = '#f472b6'; // Pink

                let alpha = 1;
                if (searchTerm) {
                    const lowerSearch = searchTerm.toLowerCase();
                    const check = (str) => str && str.toLowerCase().includes(lowerSearch);
                    const match = 
                        check(node.name) || check(node.content) || check(node.summary) || check(node.emotion) || check(node.id) ||
                        (node.keywords && Array.isArray(node.keywords) && node.keywords.some(k => check(k)));
                    if (!match) alpha = 0.1;
                }

                if (hoverNode && alpha > 0.1) {
                    const connected = node.id === hoverNode.id || isNeighbor(node, hoverNode);
                    if (!connected) alpha = 0.1;
                }

                // Node size calculation
                const baseRadius = 4;
                const radius = node.group === 'entry' ? baseRadius + ((node.val - 20) / 10) : baseRadius;

                ctx.globalAlpha = alpha;
                ctx.shadowColor = color;
                ctx.shadowBlur = 15; 
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            }}

            onNodeHover={node => {
                setHoverNode(node || null)
            }}
            onNodeClick={node => onNodeClick(node)}
            
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            linkColor={() => searchTerm ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.15)'} 
        />

        {/* --- ENTRY PREVIEW TOOLTIP --- */}
        {hoverNode && hoverNode.group === 'entry' && (
           <div
             className="absolute pointer-events-none z-50 p-4 bg-black/80 backdrop-blur-xl border border-blue-500/30 rounded-xl shadow-2xl max-w-xs"
             style={{
               left: tooltipPos.left,
               top: tooltipPos.top
             }}
           >
              <div className="flex items-center justify-between mb-2">
                 <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{hoverNode.name}</span>
                 {hoverNode.sentiment !== undefined && (
                   <span className={`text-[10px] font-bold ${hoverNode.sentiment > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {hoverNode.sentiment > 0 ? '▲ POSITIVE' : '▼ NEGATIVE'}
                   </span>
                 )}
              </div>

              <p className="text-white text-sm font-serif italic mb-3 line-clamp-3 leading-relaxed">
                "{hoverNode.summary || hoverNode.content}"
              </p>

              <div className="flex flex-wrap gap-2">
                 <span className="px-2 py-0.5 bg-pink-500/20 border border-pink-500/30 rounded text-[10px] text-pink-300 uppercase">{hoverNode.emotion}</span>
                 {hoverNode.keywords?.slice(0, 2).map((k, i) => (
                    <span key={i} className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-[10px] text-purple-300 uppercase">#{k}</span>
                 ))}
              </div>
           </div>
        )}
    </div>
  );
};

export default React.memo(GalaxyGraph, (prevProps, nextProps) => {
  // Custom comparison: only re-render if entries or searchTerm change meaningfully
  return (
    prevProps.entries.length === nextProps.entries.length &&
    prevProps.searchTerm === nextProps.searchTerm &&
    prevProps.onNodeClick === nextProps.onNodeClick
  );
});