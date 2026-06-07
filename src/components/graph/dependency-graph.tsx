"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
  MarkerType,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUp, ArrowDown, AlertTriangle } from "lucide-react";
import { useStore } from "@/store/use-store";
import { cn } from "@/lib/utils";
import type { GraphNode } from "@/types";

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  blocker: { bg: "#450a0a", border: "#dc2626", text: "#fca5a5" },
  delayed: { bg: "#422006", border: "#d97706", text: "#fcd34d" },
  completed: { bg: "#052e16", border: "#16a34a", text: "#86efac" },
  pending: { bg: "#18181b", border: "#52525b", text: "#a1a1aa" },
};

type NodeData = GraphNode & { selected?: boolean; highlighted?: boolean; dimmed?: boolean };

function CustomNode({ data }: NodeProps) {
  const nodeData = data as unknown as NodeData;
  const colors = statusColors[nodeData.status] ?? statusColors.pending;
  return (
    <div
      className={cn(
        "rounded-lg border-2 px-4 py-3 min-w-[180px] transition-all duration-500",
        nodeData.selected && "ring-2 ring-amber-500 ring-offset-2 ring-offset-[#080b12] scale-105",
        nodeData.highlighted && !nodeData.selected && "ring-1 ring-amber-600/50",
        nodeData.dimmed && "opacity-30"
      )}
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      <p className="text-xs font-semibold" style={{ color: colors.text }}>
        {nodeData.label}
      </p>
      <p className="text-[10px] text-zinc-500 mt-1">{nodeData.agency}</p>
      <p className="text-[9px] text-zinc-600 mt-0.5">Owner: {nodeData.owner}</p>
      {nodeData.daysWaiting !== undefined && nodeData.daysWaiting > 0 && (
        <p className="text-[10px] font-mono mt-1" style={{ color: colors.text }}>
          {nodeData.daysWaiting}d waiting
        </p>
      )}
    </div>
  );
}

const nodeTypes = { custom: CustomNode };

const layout: Record<string, { x: number; y: number }> = {
  "orr-congestion": { x: 400, y: 50 },
  "metro-construction": { x: 400, y: 200 },
  "utility-relocation": { x: 400, y: 350 },
  "bescom-approval": { x: 200, y: 500 },
  "road-closure": { x: 600, y: 500 },
  "bbmp-survey": { x: 400, y: 500 },
  "signal-optimization": { x: 700, y: 200 },
  "whitefield-corridor": { x: 150, y: 200 },
};

function getImpactChain(
  nodeId: string,
  edges: { source: string; target: string }[],
  direction: "upstream" | "downstream"
): Set<string> {
  const result = new Set<string>();
  const queue = [nodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    edges.forEach((e) => {
      const next = direction === "upstream" ? e.target : e.source;
      const prev = direction === "upstream" ? e.source : e.target;
      if (next === current && !result.has(prev) && prev !== nodeId) {
        result.add(prev);
        queue.push(prev);
      }
    });
  }

  return result;
}

export function DependencyGraph() {
  const graphNodes = useStore((s) => s.graphNodes);
  const graphEdges = useStore((s) => s.graphEdges);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const upstreamIds = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    return getImpactChain(selectedNode.id, graphEdges, "upstream");
  }, [selectedNode, graphEdges]);

  const downstreamIds = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    return getImpactChain(selectedNode.id, graphEdges, "downstream");
  }, [selectedNode, graphEdges]);

  const highlightedIds = useMemo(() => {
    const ids = new Set<string>();
    upstreamIds.forEach((id) => ids.add(id));
    downstreamIds.forEach((id) => ids.add(id));
    if (selectedNode) ids.add(selectedNode.id);
    return ids;
  }, [upstreamIds, downstreamIds, selectedNode]);

  const initialNodes: Node[] = useMemo(
    () =>
      graphNodes.map((n) => ({
        id: n.id,
        type: "custom",
        position: layout[n.id] ?? { x: 0, y: 0 },
        data: { ...n } as Record<string, unknown>,
      })),
    [graphNodes]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      graphEdges.map((e) => {
        const isOnPath =
          selectedNode &&
          (highlightedIds.has(e.source) && highlightedIds.has(e.target));
        const targetNode = graphNodes.find((n) => n.id === e.target);
        const isBlockerPath = targetNode?.status === "blocker";
        const animated = isOnPath || isBlockerPath;
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          animated,
          style: {
            stroke: isOnPath ? "#f59e0b" : isBlockerPath ? "#dc2626" : "#3f3f46",
            strokeWidth: isOnPath ? 2.5 : isBlockerPath ? 2 : 1.5,
            opacity: selectedNode && !isOnPath && !isBlockerPath ? 0.25 : 1,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isOnPath ? "#f59e0b" : isBlockerPath ? "#dc2626" : "#3f3f46",
          },
        };
      }),
    [graphEdges, graphNodes, selectedNode, highlightedIds]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(
      graphNodes.map((n) => ({
        id: n.id,
        type: "custom",
        position: layout[n.id] ?? { x: 0, y: 0 },
        data: {
          ...n,
          selected: selectedNode?.id === n.id,
          highlighted: highlightedIds.has(n.id) && selectedNode?.id !== n.id,
          dimmed: selectedNode !== null && !highlightedIds.has(n.id),
        } as Record<string, unknown>,
      }))
    );
  }, [graphNodes, selectedNode, highlightedIds, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const graphNode = graphNodes.find((n) => n.id === node.id);
      if (graphNode) setSelectedNode(graphNode);
    },
    [graphNodes]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const blockingLabels = selectedNode
    ? graphNodes.filter((n) => selectedNode.blocking.includes(n.id)).map((n) => n.label)
    : [];

  const blockedByLabels = selectedNode
    ? graphNodes.filter((n) => selectedNode.blockedBy.includes(n.id)).map((n) => n.label)
    : [];

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        className="bg-[#080b12]"
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls className="!bg-zinc-900 !border-zinc-700 !shadow-lg [&>button]:!bg-zinc-800 [&>button]:!border-zinc-700 [&>button]:!text-zinc-300 [&>button:hover]:!bg-zinc-700" />
        <MiniMap
          nodeColor={(n) => {
            const status = (n.data as unknown as GraphNode)?.status;
            return statusColors[status]?.border ?? "#52525b";
          }}
          maskColor="rgba(8, 11, 18, 0.8)"
          className="!bg-zinc-900 !border-zinc-700"
        />
        <Panel position="top-left" className="!m-4">
          <div className="rounded-lg border border-zinc-800 bg-[#0d1117]/95 p-4 backdrop-blur-sm">
            <h3 className="text-xs font-semibold text-zinc-300 mb-3">Dependency Legend</h3>
            <div className="space-y-2">
              {Object.entries(statusColors).map(([status, colors]) => (
                <div key={status} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-sm border"
                    style={{ backgroundColor: colors.bg, borderColor: colors.border }}
                  />
                  <span className="text-[10px] capitalize text-zinc-400">{status}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-zinc-600 mt-3">Select a node to view upstream/downstream impact</p>
          </div>
        </Panel>
      </ReactFlow>

      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-4 top-4 w-96 rounded-lg border border-zinc-800 bg-[#0d1117]/95 p-5 backdrop-blur-sm shadow-2xl max-h-[calc(100%-2rem)] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-zinc-100">{selectedNode.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{selectedNode.agency}</p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Owner</p>
                <p className="text-zinc-300">{selectedNode.owner}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Status</p>
                <div
                  className="inline-flex rounded border px-2 py-1 text-[10px] uppercase tracking-wider"
                  style={{
                    backgroundColor: statusColors[selectedNode.status]?.bg,
                    borderColor: statusColors[selectedNode.status]?.border,
                    color: statusColors[selectedNode.status]?.text,
                  }}
                >
                  {selectedNode.status}
                </div>
              </div>

              <p className="text-zinc-400 leading-relaxed">{selectedNode.description}</p>

              {blockedByLabels.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-red-500 mb-2 flex items-center gap-1">
                    <ArrowUp className="h-3 w-3" /> Blocked By
                  </p>
                  <ul className="space-y-1">
                    {blockedByLabels.map((label) => (
                      <li key={label} className="text-red-300/80 flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-red-500" />
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {blockingLabels.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-amber-500 mb-2 flex items-center gap-1">
                    <ArrowDown className="h-3 w-3" /> Blocks
                  </p>
                  <ul className="space-y-1">
                    {blockingLabels.map((label) => (
                      <li key={label} className="text-amber-300/80 flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-amber-500" />
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedNode.impacts.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Impacts
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.impacts.map((impact) => (
                      <span
                        key={impact}
                        className="rounded border border-zinc-700 bg-zinc-900/50 px-2 py-0.5 text-[10px] text-zinc-400"
                      >
                        {impact}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedNode.dependencies.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Dependencies</p>
                  <p className="text-zinc-400">{selectedNode.dependencies.join(", ")}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
