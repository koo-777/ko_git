// Custom Shape Generators for Konva

// Helper: Calculate distance and angle between two points
function getLineGeometry(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    return { length, angle };
}

// 1. Photon (Wavy Line)
function createPhotonShape(x1, y1, x2, y2, amplitude = 5, frequency = 0.06) {
    return new Konva.Shape({
        x: x1,
        y: y1,
        stroke: '#000',
        strokeWidth: 2,
        sceneFunc: function (context, shape) {
            const { length, angle } = getLineGeometry(0, 0, x2 - x1, y2 - y1);

            // ... (rest is same)
            context.beginPath();
            context.save();
            context.rotate(angle);

            // Draw Sine Wave
            const cycles = length * frequency;
            const step = length / (cycles * 20);

            context.moveTo(0, 0);
            for (let i = 0; i <= length; i += step) {
                const y = amplitude * Math.sin(i * (Math.PI * 2 * frequency));
                context.lineTo(i, y);
            }
            context.lineTo(length, 0);

            context.restore();
            context.strokeShape(shape);
        },
        hitFunc: function (context, shape) {
            const { length, angle } = getLineGeometry(0, 0, x2 - x1, y2 - y1);
            context.beginPath();
            context.save();
            context.rotate(angle);
            context.rect(0, -10, length, 20);
            context.restore();
            context.fillStrokeShape(shape);
        },
        name: 'propagator',
        type: 'photon',
        startX: x1, startY: y1, endX: x2, endY: y2
    });
}

// 2. Gluon (Loopy Line)
function createGluonShape(x1, y1, x2, y2, amplitude = 6, frequency = 0.09) {
    return new Konva.Shape({
        x: x1,
        y: y1,
        stroke: '#000',
        strokeWidth: 2,
        sceneFunc: function (context, shape) {
            const { length, angle } = getLineGeometry(0, 0, x2 - x1, y2 - y1);

            context.beginPath();
            context.save();
            context.rotate(angle);

            // Draw Loops (Cycloid-ish)
            const steps = length * 2;
            const loops = length * frequency;

            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const xBase = t * length;
                const theta = t * loops * Math.PI * 2;
                const x = xBase + (amplitude * 0.8) * Math.cos(theta + Math.PI);
                const y = amplitude * Math.sin(theta + Math.PI);

                if (i === 0) context.moveTo(x, y);
                else context.lineTo(x, y);
            }

            context.restore();
            context.strokeShape(shape);
        },
        hitFunc: function (context, shape) {
            const { length, angle } = getLineGeometry(0, 0, x2 - x1, y2 - y1);
            context.beginPath();
            context.save();
            context.rotate(angle);
            context.rect(0, -10, length, 20);
            context.restore();
            context.fillStrokeShape(shape);
        },
        name: 'propagator',
        type: 'gluon',
        startX: x1, startY: y1, endX: x2, endY: y2
    });
}

// 3. Fermion (Arrow at Midpoint)
function createFermionLine(x1, y1, x2, y2) {
    return new Konva.Shape({
        x: x1,
        y: y1,
        stroke: 'black',
        strokeWidth: 2,
        fill: 'black',
        sceneFunc: function (context, shape) {
            const { length, angle } = getLineGeometry(0, 0, x2 - x1, y2 - y1);
            context.beginPath();
            context.save();
            context.rotate(angle);

            // Main Line
            context.moveTo(0, 0);
            context.lineTo(length, 0);
            context.strokeShape(shape);

            // Arrowhead at Midpoint
            const mid = length / 2;
            const arrowSize = 8;

            context.beginPath();
            context.moveTo(mid - arrowSize, -arrowSize / 2);
            context.lineTo(mid, 0);
            context.lineTo(mid - arrowSize, arrowSize / 2);
            context.closePath();

            context.fillShape(shape);
            context.restore();
        },
        hitFunc: function (context, shape) {
            const { length, angle } = getLineGeometry(0, 0, x2 - x1, y2 - y1);
            context.beginPath();
            context.save();
            context.rotate(angle);
            context.rect(0, -10, length, 20);
            context.restore();
            context.fillStrokeShape(shape);
        },
        name: 'propagator',
        type: 'fermion',
        startX: x1, startY: y1, endX: x2, endY: y2
    });
}

// 4. Scalar (Dashed)
function createScalarLine(x1, y1, x2, y2) {
    return new Konva.Line({
        points: [x1, y1, x2, y2],
        stroke: 'black',
        strokeWidth: 2,
        dash: [8, 6],
        name: 'propagator',
        type: 'scalar'
    });
}
