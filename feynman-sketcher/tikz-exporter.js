// TikZ Export Logic using tikz-feynman package syntax

function exportToTikZ(nodes, edges, labels) {
    let tikz = "% Requires \\usepackage{tikz-feynman}\n";
    tikz += "\\begin{feynman}\n";

    // 1. Vertices
    // We need to normalize coordinates. Canvas is huge (pixels).
    // Let's scale down: 100px = 1 unit
    const SCALE = 100;

    // Find bounds to center (optional, but good for cleanliness)
    let minX = Infinity, minY = Infinity;
    nodes.forEach(n => {
        if (n.x() < minX) minX = n.x();
        if (n.y() < minY) minY = n.y();
    });

    // Map Konva Node IDs to simple TikZ labels (v1, v2...)
    const idMap = {};
    nodes.forEach((n, index) => {
        const id = `v${index + 1}`;
        idMap[n.id()] = id;

        const x = ((n.x() - minX) / SCALE).toFixed(2);
        const y = -((n.y() - minY) / SCALE).toFixed(2); // TikZ y is up, Canvas y is down. Negate to preserve visual orientation relative to top-left? 
        // Actually, TikZ (0,0) is center usually. 
        // Let's just create absolute positions. 
        // Note: In TikZ, y increases upwards. In Canvas, y increases downwards.
        // To preserve the drawing 'look', we should invert Y.

        tikz += `  \\vertex (${id}) at (${x}, ${y});\n`;
    });

    tikz += "\n  \\diagram* {\n";

    // 2. Edges
    edges.forEach(edge => {
        const startId = idMap[edge.startNode];
        const endId = idMap[edge.endNode];

        let style = "";
        switch (edge.type) {
            case 'fermion': style = "fermion"; break; // or particle
            case 'photon': style = "photon"; break;
            case 'gluon': style = "gluon"; break;
            case 'scalar': style = "scalar"; break; // or dashed
            default: style = "plain";
        }

        tikz += `    (${startId}) -- [${style}] (${endId}),\n`;
    });

    tikz += "  };\n";

    // 3. Labels (Extras)
    // TikZ-Feynman puts labels on edges typically, but our app allows free labels.
    // We can use standard TikZ nodes for free labels.
    if (labels && labels.length > 0) {
        tikz += "\n  % Free Labels\n";
        labels.forEach(l => {
            const x = ((l.x - minX) / SCALE).toFixed(2);
            const y = -((l.y - minY) / SCALE).toFixed(2);
            // Escape LaTeX content? Assuming user enters valid LaTeX like \gamma
            tikz += `  \\node at (${x}, ${y}) {${l.text}};\n`;
        });
    }

    tikz += "\\end{feynman}";
    return tikz;
}
