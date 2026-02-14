document.addEventListener('DOMContentLoaded', () => {

    // --- Data ---
    const CONSTANTS = [
        { symbol: 'c', name: 'Speed of Light', value: '2.99792458e8', unit: 'm/s' },
        { symbol: 'h', name: 'Planck Constant', value: '6.62607015e-34', unit: 'J⋅s' },
        { symbol: 'ℏ', name: 'Reduced Planck Constant', value: '1.054571817e-34', unit: 'J⋅s' },
        { symbol: 'e', name: 'Elementary Charge', value: '1.602176634e-19', unit: 'C' },
        { symbol: 'G', name: 'Gravitational Constant', value: '6.67430e-11', unit: 'm³⋅kg⁻¹⋅s⁻²' },
        { symbol: 'k_B', name: 'Boltzmann Constant', value: '1.380649e-23', unit: 'J/K' }
    ];

    // Conversion Ratios (Base: Joule)
    const ENERGY_RATIOS = {
        J: 1,
        eV: 1.602176634e-19,
        GeV: 1.602176634e-10, // 1e9 * eV
        erg: 1e-7
    };

    // Conversion Ratios (Base: m^2)
    const CS_RATIOS = {
        m2: 1,
        cm2: 1e-4,
        b: 1e-28,
        mb: 1e-31, // 1e-3 * b
        ub: 1e-34, // 1e-6 * b
        nb: 1e-37, // 1e-9 * b
        pb: 1e-40, // 1e-12 * b
        fb: 1e-43  // 1e-15 * b
    };

    const NAT_CONVERT_FACTOR = 0.389379; // 1 GeV^-2 = 0.389379 mb

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

    // --- Converters ---

    // Helper: Parse scientific float
    const parseVal = (str) => {
        if (!str) return NaN;
        return parseFloat(str);
    };

    // Helper: Format with scientific notation if needed
    const formatVal = (num) => {
        if (isNaN(num)) return '';
        if (Math.abs(num) < 1e-3 || Math.abs(num) > 1e4) {
            return num.toExponential(4).replace('e+', 'e'); // simplify e+
        }
        return parseFloat(num.toPrecision(6)).toString(); // clean float
    };

    // Generic setup for a group of inputs derived from a base unit
    function setupConverter(containerId, ratios) {
        const container = document.getElementById(containerId);
        const inputs = container.querySelectorAll('input');

        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const val = parseVal(e.target.value);
                const unit = e.target.dataset.unit;

                if (isNaN(val)) {
                    // Clear others if invalid but also allow typing partials?
                    // Better to just not update if empty/invalid yet
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


    setupNaturalConverter();
    function setupNaturalConverter() {
        const container = document.getElementById('natural-converter');
        const inputGev = container.querySelector('input[data-unit="gevm2"]');
        const inputMb = container.querySelector('input[data-unit="mb"]');

        inputGev.addEventListener('input', () => {
            const val = parseVal(inputGev.value);
            if (isNaN(val)) {
                if (inputGev.value === '') inputMb.value = '';
                return;
            }
            inputMb.value = formatVal(val * NAT_CONVERT_FACTOR);
        });

        inputMb.addEventListener('input', () => {
            const val = parseVal(inputMb.value);
            if (isNaN(val)) {
                if (inputMb.value === '') inputGev.value = '';
                return;
            }
            inputGev.value = formatVal(val / NAT_CONVERT_FACTOR);
        });
    }


    // --- Utils ---
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`Copied: ${text}`);
        });
    }

    function showToast(msg) {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }
});
