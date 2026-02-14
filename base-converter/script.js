document.addEventListener('DOMContentLoaded', () => {
    const binaryInput = document.getElementById('binary');
    const decimalInput = document.getElementById('decimal');
    const hexInput = document.getElementById('hex');

    // Helper to clear all inputs
    const clearAll = () => {
        binaryInput.value = '';
        decimalInput.value = '';
        hexInput.value = '';
    };

    // Update fields from Decimal value
    const updateFromDecimal = (decimalValue) => {
        if (isNaN(decimalValue) || decimalValue === '') {
            clearAll();
            return;
        }
        
        const dec = BigInt(decimalValue);
        binaryInput.value = dec.toString(2);
        hexInput.value = dec.toString(16).toUpperCase();
        
        // Keep the source input as is, but ensure valid formatting if needed
        // Here we just update the others
    };

    binaryInput.addEventListener('input', (e) => {
        const val = e.target.value.replace(/[^0-1]/g, '');
        if (val !== e.target.value) {
            e.target.value = val; // Remove invalid chars
        }
        
        if (val === '') {
            decimalInput.value = '';
            hexInput.value = '';
            return;
        }

        const dec = BigInt('0b' + val);
        decimalInput.value = dec.toString();
        hexInput.value = dec.toString(16).toUpperCase();
    });

    decimalInput.addEventListener('input', (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        if (val !== e.target.value) {
            e.target.value = val;
        }

        if (val === '') {
            binaryInput.value = '';
            hexInput.value = '';
            return;
        }

        updateFromDecimal(val);
    });

    hexInput.addEventListener('input', (e) => {
        const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
        if (val !== e.target.value) {
            e.target.value = val;
        }

        if (val === '') {
            binaryInput.value = '';
            decimalInput.value = '';
            return;
        }

        const dec = BigInt('0x' + val);
        decimalInput.value = dec.toString();
        binaryInput.value = dec.toString(2);
    });
});
