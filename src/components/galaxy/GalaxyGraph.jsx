import React, { useState, useEffect, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const GalaxyGraph = ({ entries, searchTerm, onNodeClick }) => {
  const [init, setInit] = useState(false);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [hoverNode, setHoverNode] = useState(null);

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
      nodes.push({
        id: entryId, group: 'entry',
        // Safety check for date
        name: entry.createdAt?.toDate ? new Date(entry.createdAt.toDate()).toLocaleDateString() : 'Memory',
        val: 20, ...entry
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

  return (
    <div className="absolute inset-0 z-0">
        {init && <Particles id="tsparticles" options={particlesOptions} className="absolute inset-0 -z-20" />}
        
        <ForceGraph2D
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

                ctx.globalAlpha = alpha;
                ctx.shadowColor = color;
                ctx.shadowBlur = 15; 
                ctx.beginPath();
                ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            }}

            onNodeHover={node => setHoverNode(node || null)}
            onNodeClick={node => onNodeClick(node)}
            
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            linkColor={() => searchTerm ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.15)'} 
        />
    </div>
  );
};

export default GalaxyGraph;