// Main Logic for Feynman Sketcher

document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let currentTool = 'select'; // select, vertex, fermion, photon, gluon, scalar
    let nodes = []; // Array of Konva.Circle
    let edges = []; // Array of custom shapes
    let labels = []; // Array of {id, element, x, y, text}

    let selectedObject = null; // Node, Edge, or Label
    let connectionStartNode = null; // For connecting lines

    // --- Konva Setup ---
    const container = document.getElementById('konva-container');
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    const stage = new Konva.Stage({
        container: 'konva-container',
        width: width,
        height: height
    });

    const gridLayer = new Konva.Layer();
    const edgeLayer = new Konva.Layer();
    const nodeLayer = new Konva.Layer();

    stage.add(gridLayer);
    stage.add(edgeLayer);
    stage.add(nodeLayer);

    // --- Tools & UI ---
    const toolBtns = document.querySelectorAll('.tool-btn[data-tool]');
    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Deactivate old
            document.querySelector('.tool-btn.active')?.classList.remove('active');
            // Activate new
            btn.classList.add('active');
            currentTool = btn.dataset.tool;

            // Reset connection state
            connectionStartNode = null;
            renderNodes(); // visual feedback?

            console.log('Tool:', currentTool);
        });
    });

    // --- Interaction: Stage Click ---
    stage.on('click', (e) => {
        // If clicked on empty space
        if (e.target === stage) {
            if (currentTool === 'vertex') {
                const pos = stage.getPointerPosition();
                createNode(pos.x, pos.y);
            } else if (currentTool === 'select') {
                deselectAll();
            }
        }
    });

    // --- Node Handling ---
    function createNode(x, y) {
        const node = new Konva.Circle({
            x: x,
            y: y,
            radius: 6,
            fill: '#000',
            stroke: 'white',
            strokeWidth: 2,
            draggable: true,
            name: 'vertex',
            id: 'node-' + Date.now()
        });

        // Hover effect
        node.on('mouseover', () => {
            document.body.style.cursor = 'pointer';
            if (currentTool !== 'select' && currentTool !== 'vertex') {
                node.scale({ x: 1.5, y: 1.5 }); // highlight potential connection target
            }
        });
        node.on('mouseout', () => {
            document.body.style.cursor = 'default';
            node.scale({ x: 1, y: 1 });
        });

        // Click / Drag
        node.on('click', (e) => {
            e.cancelBubble = true; // stop propagation
            handleNodeClick(node);
        });

        node.on('dragmove', () => {
            updateConnectedEdges(node);
        });

        node.on('dragstart', () => {
            if (currentTool !== 'select') node.stopDrag();
        });

        nodes.push(node);
        nodeLayer.add(node);
    }

    function handleNodeClick(node) {
        if (currentTool === 'select') {
            selectObject(node);
        }
        else if (['fermion', 'photon', 'gluon', 'scalar'].includes(currentTool)) {
            // Connection Logic
            if (!connectionStartNode) {
                // Start connection
                connectionStartNode = node;
                node.fill(getComputedStyle(document.documentElement).getPropertyValue('--primary')); // visual feedback
            } else {
                // Complete connection
                if (connectionStartNode !== node) {
                    createEdge(connectionStartNode, node, currentTool);
                }
                // Reset
                connectionStartNode.fill('#000');
                connectionStartNode = null;
            }
        }
    }

    // --- Edge Handling ---
    function createEdge(startNode, endNode, type) {
        const x1 = startNode.x();
        const y1 = startNode.y();
        const x2 = endNode.x();
        const y2 = endNode.y();

        let edge;
        if (type === 'fermion') edge = createFermionLine(x1, y1, x2, y2);
        else if (type === 'photon') edge = createPhotonShape(x1, y1, x2, y2);
        else if (type === 'gluon') edge = createGluonShape(x1, y1, x2, y2);
        else if (type === 'scalar') edge = createScalarLine(x1, y1, x2, y2);

        // Metadata for linking
        edge.startNode = startNode.id();
        edge.endNode = endNode.id();
        edge.edgeType = type; // Store distinct from Konva type

        edge.on('click', (e) => {
            e.cancelBubble = true;
            if (currentTool === 'select') selectObject(edge);
        });

        edges.push(edge);
        edgeLayer.add(edge);
        edgeLayer.draw(); // important for custom shapes
    }

    function updateConnectedEdges(node) {
        const id = node.id();
        const x = node.x();
        const y = node.y();

        edges.forEach(edge => {
            let changed = false;
            // Native lines/arrows use points array
            // Custom shapes use setX/Y or custom vars. 
            // Our custom shapes logic in propagators.js needs to be re-run or we just replace the shape?
            // Re-creating complex custom shapes is easier than mutating their internal path logic dynamically.

            if (edge.startNode === id) {
                // Current edge starts at this node
                // We need end node pos
                const endNode = nodes.find(n => n.id() === edge.endNode);
                if (endNode) {
                    refreshEdge(edge, x, y, endNode.x(), endNode.y());
                }
            } else if (edge.endNode === id) {
                const startNode = nodes.find(n => n.id() === edge.startNode);
                if (startNode) {
                    refreshEdge(edge, startNode.x(), startNode.y(), x, y);
                }
            }
        });
    }

    function refreshEdge(oldEdge, x1, y1, x2, y2) {
        // Destroy old, create new with same props (except pos)
        const type = oldEdge.edgeType;
        const startId = oldEdge.startNode;
        const endId = oldEdge.endNode;
        const isSelected = (selectedObject === oldEdge);

        oldEdge.destroy();

        let newEdge;
        if (type === 'fermion') newEdge = createFermionLine(x1, y1, x2, y2);
        else if (type === 'photon') newEdge = createPhotonShape(x1, y1, x2, y2);
        else if (type === 'gluon') newEdge = createGluonShape(x1, y1, x2, y2);
        else if (type === 'scalar') newEdge = createScalarLine(x1, y1, x2, y2);

        newEdge.startNode = startId;
        newEdge.endNode = endId;
        newEdge.edgeType = type;

        newEdge.on('click', (e) => {
            e.cancelBubble = true;
            if (currentTool === 'select') selectObject(newEdge);
        });

        // Replace in array
        const idx = edges.indexOf(oldEdge);
        if (idx !== -1) edges[idx] = newEdge;

        edgeLayer.add(newEdge);

        if (isSelected) selectObject(newEdge);
    }

    // --- Selection ---
    function selectObject(obj) {
        deselectAll();
        selectedObject = obj;

        // Visual feedback
        if (obj instanceof Konva.Shape) {
            // For custom shapes, stroke color change
            obj.stroke('#3b82f6');
        }

        updatePropertiesPanel(obj);
    }

    function deselectAll() {
        if (selectedObject) {
            if (selectedObject instanceof Konva.Shape) {
                selectedObject.stroke(selectedObject.edgeType === 'photon' || selectedObject.edgeType === 'gluon' ? '#000' : 'black');
                if (selectedObject.name() === 'vertex') selectedObject.stroke('white'); // Vertex default stroke
            } else if (selectedObject.classList && selectedObject.classList.contains('math-label')) {
                selectedObject.classList.remove('selected');
            }
        }
        selectedObject = null;
        updatePropertiesPanel(null);
    }

    // --- Labels ---
    const btnLabel = document.getElementById('btn-label');
    const labelsLayer = document.getElementById('labels-layer');

    btnLabel.addEventListener('click', () => {
        // labelModal is defined below, need to hoist or move definition up
        const labelModal = document.getElementById('label-select-modal');
        labelModal.classList.remove('hidden');
    });

    function addLabel(x, y, text) {
        const div = document.createElement('div');
        div.className = 'math-label';
        div.style.left = x + 'px';
        div.style.top = y + 'px';
        div.innerText = `$$${text}$$`; // Double $ for display math if needed, or single
        // Wait, user might input raw tex. Let's wrap in $...$ if not present? 
        // Better: Let user type raw LaTeX.

        div.setAttribute('data-tex', text);

        // Interaction
        div.addEventListener('mousedown', (e) => startLabelDrag(e, div));
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            selectLabel(div);
        });

        labelsLayer.appendChild(div);

        const labelObj = { id: Date.now(), element: div, x, y, text };
        labels.push(labelObj);

        // Render Math
        if (window.MathJax) {
            window.MathJax.typesetPromise([div]);
        }
    }

    function selectLabel(div) {
        deselectAll();
        selectedObject = div;
        div.classList.add('selected');
        updatePropertiesPanel(div);
    }

    // -- Label Drag --
    let dragLabel = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    function startLabelDrag(e, div) {
        if (currentTool !== 'select') return;
        dragLabel = div;
        const rect = div.getBoundingClientRect();
        // Calculate offset relative to div top-left
        const parentRect = labelsLayer.getBoundingClientRect();

        // Mouse pos relative to container
        const mouseX = e.clientX - parentRect.left;
        const mouseY = e.clientY - parentRect.top;

        // Div pos relative to container (parsed from style)
        const divX = parseFloat(div.style.left);
        const divY = parseFloat(div.style.top);

        dragOffsetX = mouseX - divX;
        dragOffsetY = mouseY - divY;

        document.addEventListener('mousemove', onLabelMove);
        document.addEventListener('mouseup', endLabelDrag);
    }

    function onLabelMove(e) {
        if (!dragLabel) return;
        const parentRect = labelsLayer.getBoundingClientRect();
        const x = e.clientX - parentRect.left - dragOffsetX;
        const y = e.clientY - parentRect.top - dragOffsetY;

        dragLabel.style.left = x + 'px';
        dragLabel.style.top = y + 'px';

        // Update model
        const l = labels.find(lb => lb.element === dragLabel);
        if (l) { l.x = x; l.y = y; }
    }

    function endLabelDrag() {
        document.removeEventListener('mousemove', onLabelMove);
        document.removeEventListener('mouseup', endLabelDrag);
        dragLabel = null;
    }


    // --- Properties Panel ---
    const panel = document.getElementById('selection-info');

    function updatePropertiesPanel(obj) {
        panel.innerHTML = '';
        if (!obj) {
            panel.innerHTML = '<p class="placeholder-text">Select an object to edit properties.</p>';
            return;
        }

        if (obj.name && obj.name() === 'propagator') {
            // Edge Properties
            panel.innerHTML += `<h3>Propagator (${obj.edgeType})</h3>`;

            // Invert Direction (swap nodes)
            // Only for Fermions usually matter, but internal logic holds for all
            const invertBtn = document.createElement('button');
            invertBtn.className = 'action-btn secondary';
            invertBtn.innerText = 'Reverse Direction';
            invertBtn.onclick = () => reverseEdge(obj);
            panel.appendChild(invertBtn);

        } else if (obj.classList && obj.classList.contains('math-label')) {
            // Label Properties
            panel.innerHTML += `<h3>Label</h3>`;

            const div = document.createElement('div');
            div.className = 'prop-row';
            div.innerHTML = `<label>LaTeX Text</label>`;

            const input = document.createElement('input');
            input.className = 'prop-input';
            input.value = obj.getAttribute('data-tex');
            input.addEventListener('change', (e) => {
                const newTex = e.target.value;
                obj.setAttribute('data-tex', newTex);
                obj.innerText = `$$${newTex}$$`;

                // Update model
                const l = labels.find(lb => lb.element === obj);
                if (l) l.text = newTex;

                if (window.MathJax) {
                    window.MathJax.typesetPromise([obj]);
                }
            });

            div.appendChild(input);
            panel.appendChild(div);
        }
    }

    function reverseEdge(edge) {
        const s = edge.startNode;
        const e = edge.endNode;
        const type = edge.edgeType;

        // Find nodes
        const startNode = nodes.find(n => n.id() === s);
        const endNode = nodes.find(n => n.id() === e);

        if (!startNode || !endNode) return;

        // Destroy old, create new swapped
        edge.destroy();
        // Remove from array is handled by creation replacement logic or manual splice
        const idx = edges.indexOf(edge);
        if (idx !== -1) edges.splice(idx, 1); // remove old

        createEdge(endNode, startNode, type); // swapped
        deselectAll();
    }

    // --- Actions ---
    const btnClear = document.getElementById('btn-clear');
    const btnDelete = document.getElementById('btn-delete');

    btnClear.addEventListener('click', () => {
        if (confirm("Clear canvas?")) {
            nodes.forEach(n => n.destroy());
            edges.forEach(e => e.destroy());
            labels.forEach(l => l.element.remove());
            nodes = [];
            edges = [];
            labels = [];

            // Re-init layers just in case? No, Konva handles destroy well
            createNode(width / 2 - 50, height / 2); // Sample nodes
            createNode(width / 2 + 50, height / 2);
        }
    });

    btnDelete.addEventListener('click', () => {
        if (selectedObject) {
            if (selectedObject instanceof Konva.Node) { // Vertex or Edge
                if (selectedObject.name() === 'vertex') {
                    // Delete connected edges first
                    const id = selectedObject.id();
                    const toRemove = edges.filter(e => e.startNode === id || e.endNode === id);
                    toRemove.forEach(e => {
                        e.destroy();
                        edges = edges.filter(ed => ed !== e);
                    });

                    // Delete node
                    selectedObject.destroy();
                    nodes = nodes.filter(n => n !== selectedObject);
                } else {
                    // Edge
                    selectedObject.destroy();
                    edges = edges.filter(e => e !== selectedObject);
                }
            } else if (selectedObject.classList) {
                // Label
                selectedObject.remove();
                labels = labels.filter(l => l.element !== selectedObject);
            }
            deselectAll();
        }
    });

    // --- Export ---
    const btnExportPng = document.getElementById('btn-export-png');
    const btnExportTikz = document.getElementById('btn-export-tikz');
    const tikzModal = document.getElementById('tikz-modal');
    const tikzOutput = document.getElementById('tikz-output');
    const closeModal = document.querySelector('.close-modal');

    btnExportPng.addEventListener('click', () => {
        // Konva to DataURL
        // Hide grid?
        gridLayer.hide();
        // Labels are HTML, they won't appear in Konva export!
        // Limitation: To export HTML labels, we need html2canvas or similar, OR manually render text in Konva for export.
        // For now, let's just export the diagram lines/vertices.

        const dataURL = stage.toDataURL({ pixelRatio: 2 });
        downloadURI(dataURL, 'feynman-diagram.png');

        gridLayer.show();
    });

    function downloadURI(uri, name) {
        const link = document.createElement('a');
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    btnExportTikz.addEventListener('click', () => {
        // Generate TikZ
        const code = exportToTikZ(nodes, edges, labels);
        tikzOutput.value = code;
        tikzModal.classList.remove('hidden');
    });

    closeModal.addEventListener('click', () => {
        tikzModal.classList.add('hidden');
    });

    document.getElementById('btn-copy-tikz').addEventListener('click', () => {
        tikzOutput.select();
        document.execCommand('copy');
        alert("Copied to clipboard!");
    });

    // Init some starter nodes
    createNode(width / 2 - 100, height / 2);
    createNode(width / 2 + 100, height / 2);
});
