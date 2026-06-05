<script lang="ts">
    import { onDestroy } from "svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";

    type Mode = "MOVE" | "ADD_NODE" | "ADD_EDGE" | "SOURCE" | "TARGET";

    type NodeItem = {
        id: string;
        label: string;
        x: number;
        y: number;
    };

    type EdgeItem = {
        id: string;
        from: string;
        to: string;
        weight: number;
    };

    type DijkstraStep = {
        message: string;
        currentNodeId: string | null;
        checkedEdgeId: string | null;
        visited: string[];
        distances: Record<string, number>;
        previous: Record<string, string | null>;
        path: string[];
    };

    const NODE_RADIUS = 4.8;
    const MIN_NODE_DISTANCE = 13;
    const CANVAS_MIN_X = 7;
    const CANVAS_MAX_X = 93;
    const CANVAS_MIN_Y = 8;
    const CANVAS_MAX_Y = 92;

    const initialNodes: NodeItem[] = [
        { id: "A", label: "A", x: 18, y: 28 },
        { id: "B", label: "B", x: 42, y: 18 },
        { id: "C", label: "C", x: 68, y: 32 },
        { id: "D", label: "D", x: 32, y: 70 },
        { id: "E", label: "E", x: 72, y: 72 },
    ];

    const initialEdges: EdgeItem[] = [
        { id: "A-B", from: "A", to: "B", weight: 4 },
        { id: "A-D", from: "A", to: "D", weight: 2 },
        { id: "B-C", from: "B", to: "C", weight: 5 },
        { id: "B-D", from: "B", to: "D", weight: 1 },
        { id: "D-E", from: "D", to: "E", weight: 7 },
        { id: "C-E", from: "C", to: "E", weight: 3 },
    ];

    let nodes = $state<NodeItem[]>(initialNodes.map((node) => ({ ...node })));
    let edges = $state<EdgeItem[]>(initialEdges.map((edge) => ({ ...edge })));

    let mode = $state<Mode>("MOVE");
    let sourceNodeId = $state("A");
    let targetNodeId = $state("E");
    let edgeWeight = $state(1);
    let selectedEdgeFrom = $state<string | null>(null);
    let selectedEdgeId = $state<string | null>(null);
    let draggingNodeId = $state<string | null>(null);
    let errorMessage = $state("");

    let steps = $state<DijkstraStep[]>([]);
    let currentStepIndex = $state(0);
    let isPlaying = $state(false);
    let timer: ReturnType<typeof setInterval> | null = null;

    let currentStep = $derived(steps[currentStepIndex] ?? null);
    let selectedEdge = $derived(
        edges.find((edge) => edge.id === selectedEdgeId) ?? null,
    );

    let modeDescription = $derived(
        mode === "MOVE"
            ? "Drag nodes to organize the graph."
            : mode === "ADD_NODE"
              ? "Click an empty area on the canvas to add a node."
              : mode === "ADD_EDGE"
                ? "Click the first node, then click the second node to create an edge."
                : mode === "SOURCE"
                  ? "Click a node to set it as the source."
                  : "Click a node to set it as the target.",
    );

    function cloneInitialNodes() {
        return initialNodes.map((node) => ({ ...node }));
    }

    function cloneInitialEdges() {
        return initialEdges.map((edge) => ({ ...edge }));
    }

    function getNode(id: string) {
        return nodes.find((node) => node.id === id) ?? null;
    }

    function getEdgeId(from: string, to: string) {
        return [from, to].sort().join("-");
    }

    function clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max);
    }

    function getDistance(
        a: { x: number; y: number },
        b: { x: number; y: number },
    ) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function isPointTooCloseToNode(
        point: { x: number; y: number },
        ignoredNodeId: string | null = null,
    ) {
        return nodes.some((node) => {
            if (node.id === ignoredNodeId) return false;
            return getDistance(point, node) < MIN_NODE_DISTANCE;
        });
    }

    function normalizePoint(point: { x: number; y: number }) {
        return {
            x: clamp(point.x, CANVAS_MIN_X, CANVAS_MAX_X),
            y: clamp(point.y, CANVAS_MIN_Y, CANVAS_MAX_Y),
        };
    }

    function getNextNodeLabel() {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        for (const char of alphabet) {
            if (!nodes.some((node) => node.id === char)) {
                return char;
            }
        }

        return `N${nodes.length + 1}`;
    }

    function clearTimer() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }

        isPlaying = false;
    }

    function clearRun() {
        steps = [];
        currentStepIndex = 0;
        clearTimer();
    }

    function resetGraph() {
        clearRun();
        nodes = cloneInitialNodes();
        edges = cloneInitialEdges();
        sourceNodeId = "A";
        targetNodeId = "E";
        selectedEdgeFrom = null;
        selectedEdgeId = null;
        draggingNodeId = null;
        errorMessage = "";
        mode = "MOVE";
    }

    function getSvgPoint(event: PointerEvent) {
        const svg = event.currentTarget as SVGSVGElement;
        const rect = svg.getBoundingClientRect();

        return normalizePoint({
            x: ((event.clientX - rect.left) / rect.width) * 100,
            y: ((event.clientY - rect.top) / rect.height) * 100,
        });
    }

    function showError(message: string) {
        errorMessage = message;
    }

    function clearError() {
        errorMessage = "";
    }

    function handleCanvasPointerDown(event: PointerEvent) {
        if (mode !== "ADD_NODE") return;

        const point = getSvgPoint(event);

        if (isPointTooCloseToNode(point)) {
            showError(
                "This position is too close to another node. Choose an empty area.",
            );
            return;
        }

        const id = getNextNodeLabel();

        clearRun();
        clearError();

        nodes = [
            ...nodes,
            {
                id,
                label: id,
                x: point.x,
                y: point.y,
            },
        ];

        if (!sourceNodeId) {
            sourceNodeId = id;
        }

        if (!targetNodeId) {
            targetNodeId = id;
        }
    }

    function setMode(nextMode: Mode) {
        mode = nextMode;
        selectedEdgeFrom = null;
        draggingNodeId = null;
        clearError();
    }

    function handleNodeAction(nodeId: string) {
        clearError();

        if (mode === "SOURCE") {
            sourceNodeId = nodeId;
            selectedEdgeFrom = null;
            clearRun();
            return;
        }

        if (mode === "TARGET") {
            targetNodeId = nodeId;
            selectedEdgeFrom = null;
            clearRun();
            return;
        }

        if (mode === "ADD_EDGE") {
            if (!selectedEdgeFrom) {
                selectedEdgeFrom = nodeId;
                selectedEdgeId = null;
                return;
            }

            if (selectedEdgeFrom === nodeId) {
                selectedEdgeFrom = null;
                return;
            }

            const id = getEdgeId(selectedEdgeFrom, nodeId);
            const exists = edges.some((edge) => edge.id === id);

            if (exists) {
                selectedEdgeId = id;
                selectedEdgeFrom = null;
                showError(
                    "This edge already exists. Select it to update the weight.",
                );
                return;
            }

            clearRun();

            edges = [
                ...edges,
                {
                    id,
                    from: selectedEdgeFrom,
                    to: nodeId,
                    weight: Math.max(Number(edgeWeight) || 1, 1),
                },
            ];

            selectedEdgeId = id;
            selectedEdgeFrom = null;
        }
    }

    function handleNodeKeydown(event: KeyboardEvent, nodeId: string) {
        if (event.key !== "Enter" && event.key !== " ") return;

        event.preventDefault();
        handleNodeAction(nodeId);
    }

    function startDrag(event: PointerEvent, nodeId: string) {
        if (mode !== "MOVE") return;

        event.stopPropagation();
        draggingNodeId = nodeId;
        selectedEdgeFrom = null;
        selectedEdgeId = null;
        clearError();
    }

    function handlePointerMove(event: PointerEvent) {
        if (!draggingNodeId || mode !== "MOVE") return;

        const point = getSvgPoint(event);

        if (isPointTooCloseToNode(point, draggingNodeId)) {
            return;
        }

        clearRun();

        nodes = nodes.map((node) =>
            node.id === draggingNodeId
                ? {
                      ...node,
                      x: point.x,
                      y: point.y,
                  }
                : node,
        );
    }

    function stopDrag() {
        draggingNodeId = null;
    }

    function selectEdge(edgeId: string) {
        selectedEdgeId = edgeId;
        selectedEdgeFrom = null;
        clearError();
    }

    function handleEdgeKeydown(event: KeyboardEvent, edgeId: string) {
        if (event.key !== "Enter" && event.key !== " ") return;

        event.preventDefault();
        selectEdge(edgeId);
    }

    function updateSelectedEdgeWeight(event: Event) {
        if (!selectedEdgeId) return;

        const input = event.currentTarget as HTMLInputElement;
        const weight = Math.max(Number(input.value) || 1, 1);

        clearRun();

        edges = edges.map((edge) =>
            edge.id === selectedEdgeId ? { ...edge, weight } : edge,
        );
    }

    function deleteSelectedEdge() {
        if (!selectedEdgeId) return;

        clearRun();

        edges = edges.filter((edge) => edge.id !== selectedEdgeId);
        selectedEdgeId = null;
        clearError();
    }

    function deleteNode(nodeId: string) {
        if (nodes.length <= 1) {
            showError("At least one node is required.");
            return;
        }

        clearRun();

        const nextNodes = nodes.filter((node) => node.id !== nodeId);
        nodes = nextNodes;
        edges = edges.filter(
            (edge) => edge.from !== nodeId && edge.to !== nodeId,
        );

        if (sourceNodeId === nodeId) {
            sourceNodeId = nextNodes[0]?.id ?? "";
        }

        if (targetNodeId === nodeId) {
            targetNodeId = nextNodes[0]?.id ?? "";
        }

        if (selectedEdgeFrom === nodeId) {
            selectedEdgeFrom = null;
        }

        clearError();
    }

    function snapshot(
        message: string,
        currentNodeId: string | null,
        checkedEdgeId: string | null,
        visited: Set<string>,
        distances: Record<string, number>,
        previous: Record<string, string | null>,
        path: string[] = [],
    ): DijkstraStep {
        return {
            message,
            currentNodeId,
            checkedEdgeId,
            visited: Array.from(visited),
            distances: { ...distances },
            previous: { ...previous },
            path: [...path],
        };
    }

    function buildPath(previous: Record<string, string | null>) {
        if (!sourceNodeId || !targetNodeId) return [];

        const path: string[] = [];
        let current: string | null = targetNodeId;

        while (current) {
            path.unshift(current);

            if (current === sourceNodeId) {
                return path;
            }

            current = previous[current];
        }

        return [];
    }

    function buildDijkstraSteps() {
        const result: DijkstraStep[] = [];
        const distances: Record<string, number> = {};
        const previous: Record<string, string | null> = {};
        const visited = new Set<string>();

        for (const node of nodes) {
            distances[node.id] = Infinity;
            previous[node.id] = null;
        }

        distances[sourceNodeId] = 0;

        result.push(
            snapshot(
                `Initialize distances. Source ${sourceNodeId} starts with distance 0.`,
                sourceNodeId,
                null,
                visited,
                distances,
                previous,
            ),
        );

        while (visited.size < nodes.length) {
            let currentNodeId: string | null = null;
            let bestDistance = Infinity;

            for (const node of nodes) {
                if (
                    !visited.has(node.id) &&
                    distances[node.id] < bestDistance
                ) {
                    bestDistance = distances[node.id];
                    currentNodeId = node.id;
                }
            }

            if (!currentNodeId) break;

            visited.add(currentNodeId);

            result.push(
                snapshot(
                    `Visit node ${currentNodeId} with current shortest distance ${bestDistance}.`,
                    currentNodeId,
                    null,
                    visited,
                    distances,
                    previous,
                ),
            );

            if (currentNodeId === targetNodeId) {
                break;
            }

            const neighborEdges = edges.filter(
                (edge) =>
                    edge.from === currentNodeId || edge.to === currentNodeId,
            );

            for (const edge of neighborEdges) {
                const neighborId =
                    edge.from === currentNodeId ? edge.to : edge.from;

                if (visited.has(neighborId)) {
                    continue;
                }

                const candidate = distances[currentNodeId] + edge.weight;

                if (candidate < distances[neighborId]) {
                    distances[neighborId] = candidate;
                    previous[neighborId] = currentNodeId;

                    result.push(
                        snapshot(
                            `Relax edge ${currentNodeId} → ${neighborId}. Update distance of ${neighborId} to ${candidate}.`,
                            currentNodeId,
                            edge.id,
                            visited,
                            distances,
                            previous,
                        ),
                    );
                } else {
                    result.push(
                        snapshot(
                            `Check edge ${currentNodeId} → ${neighborId}. No update because ${candidate} is not better than ${distances[neighborId]}.`,
                            currentNodeId,
                            edge.id,
                            visited,
                            distances,
                            previous,
                        ),
                    );
                }
            }
        }

        const path =
            distances[targetNodeId] === Infinity ? [] : buildPath(previous);

        result.push(
            snapshot(
                path.length
                    ? `Shortest path found: ${path.join(" → ")} with total distance ${distances[targetNodeId]}.`
                    : `No path exists from ${sourceNodeId} to ${targetNodeId}.`,
                null,
                null,
                visited,
                distances,
                previous,
                path,
            ),
        );

        return result;
    }

    function validateBeforeRun() {
        if (!sourceNodeId || !targetNodeId) {
            return "Please select source and target nodes.";
        }

        if (!nodes.some((node) => node.id === sourceNodeId)) {
            return "Source node is invalid.";
        }

        if (!nodes.some((node) => node.id === targetNodeId)) {
            return "Target node is invalid.";
        }

        if (
            edges.some((edge) => edge.weight <= 0 || Number.isNaN(edge.weight))
        ) {
            return "All edge weights must be positive numbers.";
        }

        return "";
    }

    function runAlgorithm() {
        const validationError = validateBeforeRun();

        if (validationError) {
            showError(validationError);
            return;
        }

        clearError();
        selectedEdgeFrom = null;
        steps = buildDijkstraSteps();
        currentStepIndex = 0;
        clearTimer();
    }

    function previousStep() {
        if (currentStepIndex > 0) {
            currentStepIndex -= 1;
        }
    }

    function nextStep() {
        if (currentStepIndex < steps.length - 1) {
            currentStepIndex += 1;
        }
    }

    function play() {
        if (!steps.length) {
            runAlgorithm();
        }

        if (!steps.length) return;

        clearTimer();
        isPlaying = true;

        timer = setInterval(() => {
            if (currentStepIndex >= steps.length - 1) {
                clearTimer();
                return;
            }

            currentStepIndex += 1;
        }, 900);
    }

    function pause() {
        clearTimer();
    }

    function isPathEdge(edge: EdgeItem) {
        if (!currentStep?.path?.length) return false;

        for (let i = 0; i < currentStep.path.length - 1; i += 1) {
            const a = currentStep.path[i];
            const b = currentStep.path[i + 1];

            if (edge.id === getEdgeId(a, b)) {
                return true;
            }
        }

        return false;
    }

    function formatDistance(value: number | undefined) {
        if (value === undefined || value === Infinity) return "∞";
        return String(value);
    }

    function getPreviousLabel(nodeId: string) {
        if (!currentStep) return "-";
        return currentStep.previous[nodeId] ?? "-";
    }

    onDestroy(() => {
        clearTimer();
    });
</script>

<section class="dijkstra-layout">
    <div class="workspace">
        <div class="toolbar">
            <div class="toolbar-main">
                <div class="mode-group" aria-label="Graph editing modes">
                    <button
                        type="button"
                        class:active={mode === "MOVE"}
                        onclick={() => setMode("MOVE")}
                    >
                        Move
                    </button>

                    <button
                        type="button"
                        class:active={mode === "ADD_NODE"}
                        onclick={() => setMode("ADD_NODE")}
                    >
                        Add Node
                    </button>

                    <button
                        type="button"
                        class:active={mode === "ADD_EDGE"}
                        onclick={() => setMode("ADD_EDGE")}
                    >
                        Add Edge
                    </button>

                    <button
                        type="button"
                        class:active={mode === "SOURCE"}
                        onclick={() => setMode("SOURCE")}
                    >
                        Source
                    </button>

                    <button
                        type="button"
                        class:active={mode === "TARGET"}
                        onclick={() => setMode("TARGET")}
                    >
                        Target
                    </button>
                </div>

                <p class="mode-hint">{modeDescription}</p>
            </div>

            <div class="field-row">
                <label>
                    Edge weight
                    <input type="number" min="1" bind:value={edgeWeight} />
                </label>

                {#if selectedEdge}
                    <label>
                        Selected edge
                        <input
                            type="number"
                            min="1"
                            value={selectedEdge.weight}
                            onchange={updateSelectedEdgeWeight}
                        />
                    </label>

                    <Button variant="secondary" onclick={deleteSelectedEdge}>
                        Delete Edge
                    </Button>
                {/if}
            </div>
        </div>

        {#if errorMessage}
            <div class="error-message">{errorMessage}</div>
        {/if}

        <svg
            class="graph-canvas"
            viewBox="0 0 100 100"
            role="img"
            aria-label="Dijkstra graph editor"
            onpointerdown={handleCanvasPointerDown}
            onpointermove={handlePointerMove}
            onpointerup={stopDrag}
            onpointerleave={stopDrag}
        >
            {#each edges as edge (edge.id)}
                {@const from = getNode(edge.from)}
                {@const to = getNode(edge.to)}

                {#if from && to}
                    <line
                        class="edge-hitbox"
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        role="button"
                        tabindex="0"
                        aria-label="Select edge {edge.from} to {edge.to}"
                        onclick={(event) => {
                            event.stopPropagation();
                            selectEdge(edge.id);
                        }}
                        onkeydown={(event) => handleEdgeKeydown(event, edge.id)}
                    />

                    <line
                        class="edge-line"
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        class:selected={selectedEdgeId === edge.id}
                        class:checking={currentStep?.checkedEdgeId === edge.id}
                        class:path={isPathEdge(edge)}
                    />

                    <g
                        class="edge-label"
                        class:selected={selectedEdgeId === edge.id}
                        role="button"
                        tabindex="0"
                        aria-label="Select edge {edge.from} to {edge.to} with weight {edge.weight}"
                        onclick={(event) => {
                            event.stopPropagation();
                            selectEdge(edge.id);
                        }}
                        onkeydown={(event) => handleEdgeKeydown(event, edge.id)}
                    >
                        <rect
                            x={(from.x + to.x) / 2 - 3.8}
                            y={(from.y + to.y) / 2 - 3.8}
                            width="7.6"
                            height="7.6"
                            rx="2.2"
                        />
                        <text
                            x={(from.x + to.x) / 2}
                            y={(from.y + to.y) / 2 + 1.4}
                        >
                            {edge.weight}
                        </text>
                    </g>
                {/if}
            {/each}

            {#each nodes as node (node.id)}
                <g
                    class="node"
                    class:source={node.id === sourceNodeId}
                    class:target={node.id === targetNodeId}
                    class:current={currentStep?.currentNodeId === node.id}
                    class:visited={currentStep?.visited.includes(node.id)}
                    class:selected={selectedEdgeFrom === node.id}
                    class:path={currentStep?.path.includes(node.id)}
                    transform="translate({node.x} {node.y})"
                    role="button"
                    tabindex="0"
                    aria-label="Node {node.label}"
                    onpointerdown={(event) => startDrag(event, node.id)}
                    onclick={(event) => {
                        event.stopPropagation();
                        handleNodeAction(node.id);
                    }}
                    onkeydown={(event) => handleNodeKeydown(event, node.id)}
                >
                    <circle r={NODE_RADIUS} />
                    <text y="1.4">{node.label}</text>
                </g>
            {/each}
        </svg>

        <div class="legend-row">
            <div><span class="legend-dot source"></span> Source</div>
            <div><span class="legend-dot target"></span> Target</div>
            <div><span class="legend-dot current"></span> Current</div>
            <div><span class="legend-dot path"></span> Shortest path</div>
        </div>

        <div class="run-panel">
            <div class="step-message">
                <div class="step-title">
                    <Icon name="trending-up" size={16} />
                    <span>
                        {steps.length
                            ? `Step ${currentStepIndex + 1}/${steps.length}`
                            : "Ready"}
                    </span>
                </div>

                <p>
                    {currentStep?.message ||
                        "Create a graph, select source and target, then run Dijkstra."}
                </p>
            </div>

            <div class="run-actions">
                <Button variant="primary" onclick={runAlgorithm}>Run</Button>

                {#if isPlaying}
                    <Button variant="secondary" onclick={pause}>Pause</Button>
                {:else}
                    <Button variant="secondary" onclick={play}>Play</Button>
                {/if}

                <Button
                    variant="secondary"
                    onclick={previousStep}
                    disabled={!steps.length || currentStepIndex === 0}
                >
                    Previous
                </Button>

                <Button
                    variant="secondary"
                    onclick={nextStep}
                    disabled={!steps.length ||
                        currentStepIndex >= steps.length - 1}
                >
                    Next
                </Button>

                <Button variant="secondary" onclick={resetGraph}>Reset</Button>
            </div>
        </div>
    </div>

    <aside class="state-panel">
        <div class="panel-card">
            <h3>Graph Setup</h3>

            <div class="setup-row">
                <span>Mode</span>
                <strong>{mode}</strong>
            </div>

            <div class="setup-row">
                <span>Source</span>
                <strong>{sourceNodeId || "-"}</strong>
            </div>

            <div class="setup-row">
                <span>Target</span>
                <strong>{targetNodeId || "-"}</strong>
            </div>

            <div class="setup-row">
                <span>Nodes</span>
                <strong>{nodes.length}</strong>
            </div>

            <div class="setup-row">
                <span>Edges</span>
                <strong>{edges.length}</strong>
            </div>

            {#if selectedEdgeFrom}
                <div class="selection-note">
                    Selected first node: <strong>{selectedEdgeFrom}</strong>
                </div>
            {/if}

            {#if selectedEdge}
                <div class="selection-note">
                    Selected edge:
                    <strong>{selectedEdge.from} — {selectedEdge.to}</strong>
                </div>
            {/if}
        </div>

        <div class="panel-card">
            <h3>Distance Table</h3>

            <div class="table-head">
                <span>Node</span>
                <span>Dist</span>
                <span>Prev</span>
            </div>

            <div class="distance-table">
                {#each nodes as node}
                    <div
                        class="distance-row"
                        class:active={currentStep?.currentNodeId === node.id}
                    >
                        <span>{node.label}</span>
                        <strong>
                            {currentStep
                                ? formatDistance(currentStep.distances[node.id])
                                : node.id === sourceNodeId
                                  ? "0"
                                  : "∞"}
                        </strong>
                        <em>{getPreviousLabel(node.id)}</em>
                    </div>
                {/each}
            </div>
        </div>

        <div class="panel-card">
            <h3>Node Manager</h3>

            <div class="node-list">
                {#each nodes as node}
                    <div class="node-row">
                        <span>{node.label}</span>

                        <button
                            type="button"
                            onclick={() => deleteNode(node.id)}
                        >
                            Delete
                        </button>
                    </div>
                {/each}
            </div>
        </div>
    </aside>
</section>

<style>
    .dijkstra-layout {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 24px;
    }

    .workspace,
    .panel-card {
        border-radius: 14px;
        background: #1e222b;
        border: 1px solid #2a2e36;
    }

    .workspace {
        padding: 18px;
        min-width: 0;
    }

    .toolbar {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        align-items: flex-start;
        margin-bottom: 14px;
    }

    .toolbar-main {
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-width: 0;
    }

    .mode-group {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .mode-group button {
        padding: 8px 12px;
        border: 1px solid #2a2e36;
        border-radius: 999px;
        background: #14161c;
        color: #9ca3af;
        font-family: inherit;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .mode-group button:hover {
        color: #fff;
        border-color: #4b5563;
    }

    .mode-group button.active {
        background: #6366f1;
        color: #fff;
        border-color: #6366f1;
    }

    .mode-hint {
        margin: 0;
        color: #6b7280;
        font-size: 13px;
        line-height: 1.5;
    }

    .field-row {
        display: flex;
        align-items: flex-end;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: flex-end;
    }

    label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        color: #9ca3af;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }

    input {
        width: 112px;
        box-sizing: border-box;
        border: 1px solid #2a2e36;
        border-radius: 10px;
        padding: 10px 12px;
        background: #14161c;
        color: #e5e7eb;
        font: inherit;
        outline: none;
    }

    input:focus {
        border-color: #8b5cf6;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.18);
    }

    .error-message {
        margin-bottom: 12px;
        color: #fca5a5;
        font-size: 14px;
        background: rgba(239, 68, 68, 0.12);
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid rgba(239, 68, 68, 0.28);
    }

    .graph-canvas {
        width: 100%;
        height: 540px;
        display: block;
        border-radius: 12px;
        background: linear-gradient(
                rgba(255, 255, 255, 0.025) 1px,
                transparent 1px
            ),
            linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.025) 1px,
                transparent 1px
            ),
            #14161c;
        background-size: 24px 24px;
        border: 1px solid #2a2e36;
        touch-action: none;
    }

    .edge-hitbox {
        stroke: transparent;
        stroke-width: 4;
        cursor: pointer;
    }

    .edge-line {
        stroke: #4b5563;
        stroke-width: 0.8;
        pointer-events: none;
        transition: all 0.2s ease;
    }

    .edge-line.selected {
        stroke: #a5b4fc;
        stroke-width: 1.1;
    }

    .edge-line.checking {
        stroke: #f59e0b;
        stroke-width: 1.3;
    }

    .edge-line.path {
        stroke: #10b981;
        stroke-width: 1.6;
    }

    .edge-label {
        cursor: pointer;
    }

    .edge-label rect {
        fill: #252a35;
        stroke: #4b5563;
        stroke-width: 0.3;
        transition: all 0.2s ease;
    }

    .edge-label:hover rect,
    .edge-label:focus rect,
    .edge-label.selected rect {
        fill: rgba(99, 102, 241, 0.28);
        stroke: #a5b4fc;
    }

    .edge-label text {
        fill: #e5e7eb;
        font-size: 3px;
        font-weight: 800;
        text-anchor: middle;
        pointer-events: none;
    }

    .node {
        cursor: pointer;
        outline: none;
    }

    .node circle {
        fill: #252a35;
        stroke: #6b7280;
        stroke-width: 0.6;
        transition: all 0.2s ease;
    }

    .node text {
        fill: #f9fafb;
        font-size: 3.2px;
        font-weight: 800;
        text-anchor: middle;
        pointer-events: none;
    }

    .node:hover circle,
    .node:focus circle {
        stroke: #a5b4fc;
        stroke-width: 0.9;
    }

    .node.source circle {
        fill: rgba(16, 185, 129, 0.18);
        stroke: #10b981;
    }

    .node.target circle {
        fill: rgba(239, 68, 68, 0.14);
        stroke: #ef4444;
    }

    .node.current circle {
        fill: rgba(245, 158, 11, 0.2);
        stroke: #f59e0b;
        stroke-width: 0.9;
    }

    .node.visited circle {
        stroke: #818cf8;
    }

    .node.selected circle {
        fill: rgba(99, 102, 241, 0.25);
        stroke: #a5b4fc;
        stroke-width: 1;
    }

    .node.path circle {
        fill: rgba(16, 185, 129, 0.2);
        stroke: #10b981;
        stroke-width: 1;
    }

    .legend-row {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        margin-top: 12px;
        color: #9ca3af;
        font-size: 12px;
    }

    .legend-row div {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .legend-dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        display: inline-block;
        background: #6b7280;
    }

    .legend-dot.source {
        background: #10b981;
    }

    .legend-dot.target {
        background: #ef4444;
    }

    .legend-dot.current {
        background: #f59e0b;
    }

    .legend-dot.path {
        background: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
    }

    .run-panel {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-start;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #2a2e36;
    }

    .step-message {
        min-width: 0;
    }

    .step-title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #a5b4fc;
        font-size: 13px;
        font-weight: 800;
        margin-bottom: 6px;
    }

    .step-message p {
        margin: 0;
        color: #d1d5db;
        font-size: 14px;
        line-height: 1.6;
    }

    .run-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: flex-end;
        flex-shrink: 0;
    }

    .state-panel {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .panel-card {
        padding: 20px;
    }

    .panel-card h3 {
        margin: 0 0 16px;
        color: #6b7280;
        font-size: 14px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .setup-row,
    .distance-row,
    .node-row,
    .table-head {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 12px;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }

    .table-head,
    .distance-row {
        grid-template-columns: 1fr 70px 70px;
    }

    .setup-row span,
    .distance-row span,
    .node-row span,
    .table-head span {
        color: #9ca3af;
        font-size: 13px;
    }

    .table-head span {
        color: #6b7280;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

    .setup-row strong,
    .distance-row strong,
    .distance-row em {
        color: #e5e7eb;
        font-size: 13px;
        font-style: normal;
        text-align: right;
    }

    .distance-row.active {
        background: rgba(99, 102, 241, 0.08);
        margin: 0 -8px;
        padding-left: 8px;
        padding-right: 8px;
        border-radius: 8px;
    }

    .selection-note {
        margin-top: 12px;
        padding: 10px;
        border-radius: 10px;
        background: rgba(99, 102, 241, 0.1);
        border: 1px solid rgba(99, 102, 241, 0.2);
        color: #d1d5db;
        font-size: 13px;
        line-height: 1.5;
    }

    .selection-note strong {
        color: #a5b4fc;
    }

    .node-list,
    .distance-table {
        display: flex;
        flex-direction: column;
    }

    .node-row button {
        border: none;
        background: transparent;
        color: #ef4444;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        font-family: inherit;
    }

    .node-row button:hover {
        color: #fca5a5;
    }

    @media (max-width: 1000px) {
        .dijkstra-layout {
            grid-template-columns: 1fr;
        }

        .toolbar,
        .run-panel {
            flex-direction: column;
        }

        .field-row,
        .run-actions {
            justify-content: flex-start;
        }

        .graph-canvas {
            height: 420px;
        }
    }

    @media (max-width: 640px) {
        .workspace {
            padding: 12px;
        }

        .graph-canvas {
            height: 340px;
        }

        .mode-group button {
            padding: 7px 10px;
            font-size: 13px;
        }

        .run-actions {
            width: 100%;
        }
    }
</style>
