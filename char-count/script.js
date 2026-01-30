/**
 * Character Count Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const textInput = document.getElementById('textInput');
    const countTotal = document.getElementById('countTotal');
    const countNoSpace = document.getElementById('countNoSpace');
    const countNoNewline = document.getElementById('countNoNewline');
    const countLines = document.getElementById('countLines');

    // Toggles
    const excludeSpacesToggle = document.getElementById('excludeSpaces');
    const excludeNewlinesToggle = document.getElementById('excludeNewlines');
    const excludeTabsToggle = document.getElementById('excludeTabs');

    // Buttons
    const clearBtn = document.getElementById('clearBtn');
    const copyTextBtn = document.getElementById('copyTextBtn');
    const copyResultBtn = document.getElementById('copyResultBtn');

    // Storage Keys
    const STORAGE_KEY_TEXT = 'charCount_text';
    const STORAGE_KEY_SETTINGS = 'charCount_settings';

    // State
    let settings = {
        excludeSpaces: false,
        excludeNewlines: false,
        excludeTabs: true,
        // Fixed settings: Always Guide Mode, Always 40 chars
        showGuide: true,
        charsPerLine: 40
    };

    /**
     * loadSettings
     * Load settings and text from localStorage
     */
    function loadData() {
        const savedText = localStorage.getItem(STORAGE_KEY_TEXT);
        if (savedText) {
            textInput.value = savedText;
        }

        const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (savedSettings) {
            try {
                // Only load count-related user preferences
                const parsed = JSON.parse(savedSettings);
                settings.excludeSpaces = parsed.excludeSpaces !== undefined ? parsed.excludeSpaces : false;
                settings.excludeNewlines = parsed.excludeNewlines !== undefined ? parsed.excludeNewlines : false;
                settings.excludeTabs = parsed.excludeTabs !== undefined ? parsed.excludeTabs : true;
            } catch (e) {
                console.error('Failed to parse settings', e);
            }
        }

        // Apply settings to UI
        excludeSpacesToggle.checked = settings.excludeSpaces;
        excludeNewlinesToggle.checked = settings.excludeNewlines;
        excludeTabsToggle.checked = settings.excludeTabs;

        applyGuideMode();
    }

    /**
     * saveData
     * Save text and settings to localStorage
     */
    function saveData() {
        localStorage.setItem(STORAGE_KEY_TEXT, textInput.value);
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    }

    /**
     * updateCounts
     * Calculate and display character counts
     */
    function updateCounts() {
        const text = textInput.value;

        // 1. Total Count (Raw length)
        countTotal.textContent = text.length;

        // 2. No Spaces Count
        const regexSpace = /[ 　]/g;
        const regexTab = /\t/g;
        const regexNewline = /\r\n|\r|\n/g;

        const textNoSpace = text.replace(regexSpace, '').replace(regexTab, '');
        countNoSpace.textContent = textNoSpace.length;

        // "No Newline"
        const textNoNewline = text.replace(regexNewline, '');
        countNoNewline.textContent = textNoNewline.length;

        // "Lines"
        const lines = text.length === 0 ? 0 : text.split(/\r\n|\r|\n/).length;
        countLines.textContent = lines;

        // Main Counter (Respects Toggles)
        let mainText = text;

        if (settings.excludeSpaces) {
            mainText = mainText.replace(regexSpace, '');
        }
        if (settings.excludeTabs) {
            mainText = mainText.replace(regexTab, '');
        }
        if (settings.excludeNewlines) {
            mainText = mainText.replace(regexNewline, '');
        }

        // Update Main Counter
        countTotal.textContent = mainText.length;
        animateValue(countTotal);
        saveData();
    }

    /**
     * animateValue
     * Simple pop animation for the main counter
     */
    function animateValue(element) {
        element.classList.remove('pop');
        void element.offsetWidth; // trigger reflow
        element.classList.add('pop');
    }

    /**
     * applyGuideMode
     * Always apply the visual guide styles for 40 characters
     */
    function applyGuideMode() {
        textInput.classList.add('textarea-guide-mode');

        const chars = 40; // Fixed per requirement

        // Width calculation
        textInput.style.width = `${chars}em`;
        textInput.style.maxWidth = 'none';

        // Gradient lines
        const color1 = 'transparent';
        const color2 = 'var(--border-color)';

        // 1. Horizontal line (Row separator): transparent top -> color bottom 1px
        const horizontalGradient = `linear-gradient(${color1} calc(100% - 1px), ${color2} calc(100% - 1px))`;

        // 2. Vertical line (Center separator): transparent -> color at 50% -> transparent
        // Using 'to right'
        const verticalGradient = `linear-gradient(to right, transparent 50%, ${color2} 50%, ${color2} calc(50% + 1px), transparent calc(50% + 1px))`;

        // Combine backgrounds
        // Note: CSS order matters. First one is on top.
        textInput.style.backgroundImage = `${verticalGradient}, ${horizontalGradient}`;

        // Set size for both. Horizontal needs to be 100% width x 2rem height. Vertical needs same.
        textInput.style.backgroundSize = `100% 2rem, 100% 2rem`;

        // Adjust position: Shift grid down by 1rem (equal to padding-top)
        // because default 'local' attachment starts at padding edge? 
        // No, local starts at padding box origin (top-left of padding).
        // Text starts at y=1rem. First baseline ~2rem.
        // We want line at y=3rem (1rem padding + 2rem line height).
        // Grid repeats every 2rem.
        // If we start at 0: Lines at 2rem, 4rem...
        // We want lines at 3rem, 5rem... 
        // So we need to shift by 1rem.
        textInput.style.backgroundPosition = `0 1rem`;
    }

    /**
     * Event Listeners
     */

    // Input
    textInput.addEventListener('input', updateCounts);

    // Toggles
    excludeSpacesToggle.addEventListener('change', (e) => {
        settings.excludeSpaces = e.target.checked;
        updateCounts();
    });

    excludeNewlinesToggle.addEventListener('change', (e) => {
        settings.excludeNewlines = e.target.checked;
        updateCounts();
    });

    excludeTabsToggle.addEventListener('change', (e) => {
        settings.excludeTabs = e.target.checked;
        updateCounts();
    });

    // Clear
    clearBtn.addEventListener('click', () => {
        if (confirm('テキストを消去しますか？')) {
            textInput.value = '';
            textInput.focus();
            updateCounts();
        }
    });

    // Copy Text
    copyTextBtn.addEventListener('click', async () => {
        if (!textInput.value) return;

        try {
            await navigator.clipboard.writeText(textInput.value);
            showFeedback(copyTextBtn, 'コピーしました！');
        } catch (err) {
            console.error('Copy failed', err);
            textInput.select();
            document.execCommand('copy');
            showFeedback(copyTextBtn, 'コピーしました！');
        }
    });

    // Copy Result
    copyResultBtn.addEventListener('click', async () => {
        const resultText = `
文字数カウント結果
------------------
総数（設定適用）: ${countTotal.textContent}
空白除外: ${countNoSpace.textContent}
改行除外: ${countNoNewline.textContent}
行数: ${countLines.textContent}
------------------
        `.trim();

        try {
            await navigator.clipboard.writeText(resultText);
            showFeedback(copyResultBtn, '結果をコピーしました！');
        } catch (err) {
            console.error('Copy failed', err);
        }
    });

    /**
     * showFeedback
     */
    function showFeedback(btn, message) {
        const originalText = btn.innerHTML;
        const originalWidth = btn.offsetWidth;
        btn.style.width = `${originalWidth}px`;
        btn.style.justifyContent = 'center';
        const checkIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        btn.innerHTML = `${checkIcon} 完了`;
        btn.classList.add('btn-primary');
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.width = '';
            btn.style.justifyContent = '';
        }, 1500);
    }

    // Initialize
    loadData();
    updateCounts();
});
