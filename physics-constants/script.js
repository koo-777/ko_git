document.addEventListener('DOMContentLoaded', () => {

    // --- Data ---
    const CONSTANTS = [
        { symbol: 'c', name: 'Speed of Light', value: '2.99792458e8', unit: '$\\text{m/s}$' },
        { symbol: 'h', name: 'Planck Constant', value: '6.62607015e-34', unit: '$\\text{J}\\cdot\\text{s}$' },
        { symbol: 'ℏ', name: 'Reduced Planck Constant', value: '1.054571817e-34', unit: '$\\text{J}\\cdot\\text{s}$' },
        { symbol: 'e', name: 'Elementary Charge', value: '1.602176634e-19', unit: '$\\text{C}$' },
        { symbol: 'G', name: 'Gravitational Constant', value: '6.67430e-11', unit: '$\\text{m}^3\\cdot\\text{kg}^{-1}\\cdot\\text{s}^{-2}$' },
        { symbol: 'k_B', name: 'Boltzmann Constant', value: '1.380649e-23', unit: '$\\text{J/K}$' }
    ];

    // ... (ratios omitted for brevity, no changes needed there) ...

    // --- Render Constants ---
    const constantsGrid = document.getElementById('constants-grid');
    CONSTANTS.forEach(c => {
        const card = document.createElement('div');
        card.className = 'constant-card';
        card.innerHTML = `
            <div class="constant-symbol">$${c.symbol}$</div>
            <div class="constant-name">${c.name}</div>
            <div class="constant-value">${c.value}<span class="unit">${c.unit}</span></div>
        `;
        card.addEventListener('click', () => copyToClipboard(c.value));
        constantsGrid.appendChild(card);
    });

    // Trigger MathJax to render the newly injected content
    if (window.MathJax) {
        window.MathJax.typesetPromise([constantsGrid]).catch((err) => console.log('MathJax error:', err));
    }

    // Conversion Ratios (Base: Joule)
    const ENERGY_RATIOS = {
        J: 1,
        eV: 1.602176634e-19,
        GeV: 1.602176634e-10, // 1e9 * eV
        erg: 1e-7
    };

    // Cross Section Constants
    // 1 mb = 1e-31 m^2
    // 1 GeV^-2 = 0.389379 mb = 0.389379e-31 m^2
    const MB_IN_M2 = 1e-31;
    const GEV2_IN_MB = 0.389379;

    // Conversion Ratios (Base: m^2)
    const CS_RATIOS = {
        m2: 1,
        cm2: 1e-4,
        b: 1e-28,
        mb: MB_IN_M2,             // 1e-3 * b
        ub: 1e-34,                // 1e-6 * b
        nb: 1e-37,                // 1e-9 * b
        pb: 1e-40,                // 1e-12 * b
        fb: 1e-43,                // 1e-15 * b
        gevm2: GEV2_IN_MB * MB_IN_M2 // ~3.89e-32
    };

    // Natural Units Conversion Factors
    // Length: 1 GeV^-1 = 0.197326 fm = 0.197326e-15 m
    const LEN_RATIOS = {
        m: 1,
        fm: 1e-15,
        n_len: 0.197326e-15 // GeV^-1 in meters
    };

    // Time: 1 GeV^-1 = 6.582119e-25 s
    const TIME_RATIOS = {
        s: 1,
        n_time: 6.582119e-25 // GeV^-1 in seconds
    };



    // --- Utils ---

    // Helper: Parse scientific float
    const parseVal = (str) => {
        if (!str) return NaN;
        // Handle "1.2 * 10^-5" style if pasted? For now standard float/e-notation
        return parseFloat(str);
    };

    // Helper: Format with scientific notation if needed
    const formatVal = (num) => {
        if (isNaN(num)) return '';
        if (num === 0) return '0';
        if (Math.abs(num) < 1e-3 || Math.abs(num) > 1e4) {
            return num.toExponential(4).replace('e+', 'e'); // simplify e+
        }
        return parseFloat(num.toPrecision(6)).toString(); // clean float
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`Copied: ${text}`);
        });
    };

    const showToast = (msg) => {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    };

    // --- Converters ---

    // Generic setup for a group of inputs derived from a base unit
    function setupConverter(containerId, ratios) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const inputs = container.querySelectorAll('input');

        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const val = parseVal(e.target.value);
                const unit = e.target.dataset.unit;

                if (isNaN(val)) {
                    if (e.target.value === '') {
                        inputs.forEach(i => { if (i !== e.target) i.value = ''; });
                    }
                    return;
                }

                // Convert to base
                const baseValue = val * ratios[unit];

                // Update others
                inputs.forEach(other => {
                    if (other === e.target) return;
                    const otherUnit = other.dataset.unit;
                    const converted = baseValue / ratios[otherUnit];
                    other.value = formatVal(converted);
                });
            });
        });
    }

    setupConverter('energy-converter', ENERGY_RATIOS);
    setupConverter('cs-converter', CS_RATIOS);
    setupConverter('length-converter', LEN_RATIOS);
    setupConverter('time-converter', TIME_RATIOS);


    // --- Kinematics Calculator ---
    const kE = document.getElementById('k-E');
    const kP = document.getElementById('k-p');
    const kM = document.getElementById('k-m');
    const kBtn = document.getElementById('calc-k-btn');
    const kReset = document.getElementById('reset-k-btn');
    const kError = document.getElementById('k-error');

    kBtn.addEventListener('click', () => {
        const E = parseVal(kE.value);
        const p = parseVal(kP.value);
        const m = parseVal(kM.value);

        kError.style.display = 'none';

        // Count inputs
        const inputs = [E, p, m];
        const validCount = inputs.filter(v => !isNaN(v)).length;

        if (validCount !== 2) {
            showError("Please enter exactly two values.");
            return;
        }

        try {
            if (isNaN(E)) {
                // Calculate E = sqrt(p^2 + m^2)
                const res = Math.sqrt(p * p + m * m);
                kE.value = formatVal(res);
            } else if (isNaN(p)) {
                // Calculate p = sqrt(E^2 - m^2)
                if (E < m) throw new Error("E cannot be less than m");
                const res = Math.sqrt(E * E - m * m);
                kP.value = formatVal(res);
            } else if (isNaN(m)) {
                // Calculate m = sqrt(E^2 - p^2)
                if (E < p) throw new Error("E cannot be less than p");
                const res = Math.sqrt(E * E - p * p);
                kM.value = formatVal(res);
            }
        } catch (e) {
            showError(e.message);
        }
    });

    kReset.addEventListener('click', () => {
        kE.value = '';
        kP.value = '';
        kM.value = '';
        kError.style.display = 'none';
    });

    function showError(msg) {
        kError.textContent = msg;
        kError.style.display = 'block';
    }

});
