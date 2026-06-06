"use client";

import { useCallback, useMemo, useState } from "react";
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
import { X } from "lucide-react";
import { graphNodes, graphEdges } from "@/data/mock-data";
import { cn } from "@/lib/utils";
import type { GraphNode } from "@/types";

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  blocker: { bg: "#450a0a", border: "#dc2626", text: "#fca5a5" },
  delayed: { bg: "#422006", border: "#d97706", text: "#fcd34d" },
  completed: { bg: "#052e16", border: "#16a34a", text: "#86efac" },
  pending: { bg: "#18181b", border: "#52525b", text: "#a1a1aa" },
};

type NodeData = GraphNode & { selected?: boolean };

function CustomNode({ data }: NodeProps) {
  const nodeData = data as unknown as NodeData;
  const colors = statusColors[nodeData.status] ?? statusColors.pending;
  return (
    <div
      className={cn(
        "rounded-lg border-2 px-4 py-3 min-w-[160px] transition-all duration-300",
        nodeData.selected && "ring-2 ring-amber-500 ring-offset-2 ring-offset-[#080b12]"
      )}
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      <p className="text-xs font-semibold" style={{ color: colors.text }}>
        {nodeData.label}
      </p>
      <p className="text-[10px] text-zinc-500 mt-1">{nodeData.agency}</p>
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

export function DependencyGraph() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const initialNodes: Node[] = useMemo(
    () =>
      graphNodes.map((n) => ({
        id: n.id,
        type: "custom",
        position: layout[n.id] ?? { x: 0, y: 0 },
        data: { ...n } as Record<string, unknown>,
      })),
    []
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      graphEdges.map((e) => {
        const targetNode = graphNodes.find((n) => n.id === e.target);
        const isBlockerPath = targetNode?.status === "blocker";
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          animated: isBlockerPath,
          style: {
            stroke: isBlockerPath ? "#dc2626" : "#3f3f46",
            strokeWidth: isBlockerPath ? 2 : 1.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isBlockerPath ? "#dc2626" : "#3f3f46",
          },
        };
      }),
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const graphNode = graphNodes.find((n) => n.id === node.id);
      if (graphNode) {
        setSelectedNode(graphNode);
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            data: { ...n.data, selected: n.id === node.id },
          }))
        );
      }
    },
    [setNodes]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setNodes((nds) =>
      nds.map((n) => ({ ...n, data: { ...n.data, selected: false } }))
    );
  }, [setNodes]);

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
                  <span className="text-[10px capitalize text-zinc-400">{status}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </ReactFlow>

      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-4 top-4 w-80 rounded-lg border border-zinc-800 bg-[#0d1117]/95 p-5 backdrop-blur-sm shadow-2xl"
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
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              {selectedNode.description}
            </p>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
