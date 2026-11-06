import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import {
  Network,
  Play,
  RotateCcw,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import * as d3 from 'd3';
import { apiService } from '../services/api';
import type { ParseTreeNodeData } from '../types';

const defaultGrammar = `E -> T E'
E' -> + T E' | ε
T -> F T'
T' -> * F T' | ε
F -> ( E ) | id`;

export const ParseTreeVisualizer: React.FC = () => {
  const [grammarText] = useState<string>(defaultGrammar);
  const [inputString, setInputString] = useState<string>('id + id * id');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<ParseTreeNodeData | null>(null);
  const [selectedNode, setSelectedNode] = useState<ParseTreeNodeData | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const handleGenerateTree = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiService.simulateParse(grammarText, inputString);
      if (data.success && data.parse_tree) {
        setTreeData(data.parse_tree);
      } else {
        setErrorMsg(data.error || 'Parsing failed. Unable to construct parse tree.');
        setTreeData(null);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail?.message || err.message || 'Tree generation failed');
      setTreeData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateTree();
  }, []);

  // Render D3 Tree
  useEffect(() => {
    if (!svgRef.current || !treeData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 960;
    const height = 550;

    const g = svg.append('g').attr('class', 'tree-container');

    // Zoom setup
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // D3 Hierarchy & Tree Layout
    const root = d3.hierarchy<ParseTreeNodeData>(treeData);
    const treeLayout = d3.tree<ParseTreeNodeData>().size([width - 120, height - 160]);
    treeLayout(root);

    // Initial center transform
    svg.call(zoom.transform, d3.zoomIdentity.translate(60, 40));

    // Links (Curves)
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#334155')
      .attr('stroke-width', 1.8)
      .attr('d', (d: any) => {
        return d3.linkVertical()({
          source: [d.source.x, d.source.y],
          target: [d.target.x, d.target.y],
        });
      });

    // Nodes
    const node = g
      .selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (_, d) => {
        setSelectedNode(d.data);
      });

    // Node Circle
    node
      .append('circle')
      .attr('r', 18)
      .attr('fill', (d) =>
        d.data.is_epsilon
          ? '#312e81'
          : d.data.is_terminal
          ? '#0e7490'
          : '#581c87'
      )
      .attr('stroke', (d) =>
        d.data.is_epsilon
          ? '#818cf8'
          : d.data.is_terminal
          ? '#22d3ee'
          : '#c084fc'
      )
      .attr('stroke-width', 2);

    // Node Label
    node
      .append('text')
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '11px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .text((d) => d.data.name);
  }, [treeData]);

  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 0.75);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(60, 40));
    }
  };

  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parse-tree-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parse Tree Visualizer"
        description="Hierarchical syntax tree generation powered by D3.js and actual LL(1) derivation outputs with pan, zoom, node inspection, and SVG export."
        icon={Network}
        badge="Phase 3 Live"
      />

      {/* Control Input Bar */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <span className="text-xs font-semibold uppercase text-slate-400">Input String:</span>
          <input
            type="text"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            className="flex-1 max-w-md bg-[#0B0F19] border border-slate-800 rounded-xl px-4 py-2 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
            placeholder="e.g. id + id * id"
          />
          <button
            onClick={handleGenerateTree}
            disabled={loading || !inputString.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md transition-all disabled:opacity-50"
          >
            {loading ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>Render Tree</span>
          </button>
        </div>

        {/* Canvas Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportSvg}
            disabled={!treeData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-300 hover:text-cyan-200 text-xs font-semibold disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export SVG</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-300 font-mono">{errorMsg}</div>
        </div>
      )}

      {/* Main Canvas + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-[#0B0F19] overflow-hidden shadow-2xl relative min-h-[550px] flex items-center justify-center">
          <svg
            ref={svgRef}
            className="w-full h-[550px] cursor-grab active:cursor-grabbing"
          />

          {/* Legend */}
          <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-slate-950/80 backdrop-blur border border-slate-800 flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-600 border border-purple-400" />
              <span className="text-slate-300">Non-Terminal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-600 border border-cyan-400" />
              <span className="text-slate-300">Terminal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-700 border border-indigo-400" />
              <span className="text-slate-300">Epsilon (ε)</span>
            </div>
          </div>
        </div>

        {/* Selected Node Details */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Node Inspector</span>
            </span>

            {selectedNode ? (
              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Symbol Name:</span>
                  <span className="text-lg font-bold text-white">{selectedNode.name}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Symbol Type:</span>
                  <span className="text-cyan-400">
                    {selectedNode.is_epsilon
                      ? 'Epsilon Alternative'
                      : selectedNode.is_terminal
                      ? 'Terminal Token'
                      : 'Non-Terminal Variable'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Subtree Children:</span>
                  <span className="text-purple-300">{selectedNode.children?.length || 0} child nodes</span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                Click any tree node on the canvas to inspect its derivation attributes.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
