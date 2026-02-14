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
function createPhotonShape(x1, y1, x2, y2, amplitude = 5, frequency = 0.2) {
    return new Konva.Shape({
        x: x1,
        y: y1,
        stroke: '#000',
        strokeWidth: 2,
        sceneFunc: function (context, shape) {
            const { length, angle } = getLineGeometry(0, 0, x2 - x1, y2 - y1);

            context.beginPath();
            context.save();
            context.rotate(angle); // Rotate to align with line

            // Draw Sine Wave
            // Number of cycles depends on length
            const cycles = length * frequency;
            const step = length / (cycles * 20); // resolution

            context.moveTo(0, 0);
            for (let i = 0; i <= length; i += step) {
                // Sine wave equation: y = A * sin(k * x)
                // Normalize 0..length -> radians? No, k controls freq
                const y = amplitude * Math.sin(i * (Math.PI * 2 * frequency));
                context.lineTo(i, y);
            }
            context.lineTo(length, 0); // Ensure it ends exactly

            context.restore();
            context.strokeShape(shape);
        },
        hitFunc: function (context, shape) {
            // Expanded hit area for easier selection
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
function createGluonShape(x1, y1, x2, y2, amplitude = 6, frequency = 0.15) {
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
            // x(t) = r(t - sin t), y(t) = r(1 - cos t) ... modified for coil
            // Simple coil approximation

            const steps = length * 2; // high resolution
            const loops = length * frequency;

            for (let i = 0; i <= steps; i++) {
                const t = i / steps; // 0 to 1
                const xBase = t * length;

                // Coil logic
                const theta = t * loops * Math.PI * 2;

                // Add circular motion to linear progression
                // x = base + r * cos(theta) ... careful with advance
                // Standard spring projection:
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

// 3. Fermion (Arrow)
function createFermionLine(x1, y1, x2, y2) {
    // We use Konva.Arrow but manually manage it to match style
    return new Konva.Arrow({
        points: [x1, y1, x2, y2],
        pointerLength: 10,
        pointerWidth: 10,
        fill: 'black',
        stroke: 'black',
        strokeWidth: 2,
        name: 'propagator',
        type: 'fermion'
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
