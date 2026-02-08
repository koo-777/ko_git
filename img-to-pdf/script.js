// Simple Image to PDF Logic
console.log('Simple Image to PDF loaded');

const { jsPDF } = window.jspdf;

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const previewArea = document.getElementById('preview-area');
const generateBtn = document.getElementById('generate-btn');
const reverseBtn = document.getElementById('reverse-btn');
const clearBtn = document.getElementById('clear-btn');
const statusMessage = document.getElementById('status-message');

let images = []; // Stores { file: File, url: string }

document.addEventListener('DOMContentLoaded', () => {
    // Drop Zone Events
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    // Button Events
    generateBtn.addEventListener('click', generatePDF);
    reverseBtn.addEventListener('click', reverseOrder);
    clearBtn.addEventListener('click', clearAll);

    // SortableJS Initialization
    new Sortable(previewArea, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: (evt) => {
            // Sync array with DOM order
            if (evt.oldIndex !== evt.newIndex) {
                const item = images.splice(evt.oldIndex, 1)[0];
                images.splice(evt.newIndex, 0, item);
                updateImageIndices();
                showStatus('並び替えました', 'info');
            }
        }
    });
});

function handleFiles(files) {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

    if (validFiles.length === 0 && files.length > 0) {
        showStatus('画像ファイル(JPG, PNG)のみ選択できます', 'error');
        return;
    }

    validFiles.forEach(file => {
        const url = URL.createObjectURL(file);
        images.push({ file, url });

        // Append to DOM directly
        const el = document.createElement('div');
        el.className = 'preview-item';

        // Image Index span will be updated by updateImageIndices()
        el.innerHTML = `
                <span class="image-index"></span>
                <img src="${url}">
                <button class="remove-btn" onclick="removeImage(this)">×</button>
            `;
        previewArea.appendChild(el);
    });

    updateImageIndices();
    updateUIStatus();
}

// Updates the number (1, 2, 3...) on each image
function updateImageIndices() {
    const items = previewArea.children;
    for (let i = 0; i < items.length; i++) {
        const indexSpan = items[i].querySelector('.image-index');
        if (indexSpan) {
            indexSpan.textContent = i + 1;
        }
    }
}

// Reverse the order of images
function reverseOrder() {
    if (images.length === 0) return;

    images.reverse();

    // Re-append elements in new order
    // Note: images array is source of truth for order, but we need to map to DOM elements
    // Actually, easiest is to clear and rebuild, but to save DOM/URL churn, let's just re-append existing nodes.
    // We need to map images back to DOM nodes? No, DOM nodes are simple.
    // Safer way: Screen scramble?
    // Let's just reverse the DOM nodes directly.

    const items = Array.from(previewArea.children);
    items.reverse().forEach(item => previewArea.appendChild(item));

    updateImageIndices();
    showStatus('並び順を逆にしました', 'info');
}

// Focuses on button state/message
function updateUIStatus() {
    if (images.length > 0) {
        generateBtn.disabled = false;
        reverseBtn.style.display = 'inline-block';
        clearBtn.style.display = 'inline-block';
        showStatus(`${images.length}枚の画像を選択中 (ドラッグで並び替え可能)`, 'info');
    } else {
        generateBtn.disabled = true;
        reverseBtn.style.display = 'none';
        clearBtn.style.display = 'none';
        showStatus('', '');
    }
}

window.removeImage = (btn) => {
    const item = btn.closest('.preview-item');
    // Find index based on DOM position
    const index = Array.from(previewArea.children).indexOf(item);

    if (index > -1) {
        URL.revokeObjectURL(images[index].url);
        images.splice(index, 1);
        item.remove();
        updateImageIndices();
        updateUIStatus();
    }
};

function clearAll() {
    images.forEach(img => URL.revokeObjectURL(img.url));
    images = [];
    previewArea.innerHTML = '';
    fileInput.value = '';
    updateUIStatus();
}

async function generatePDF() {
    if (images.length === 0) return;

    try {
        generateBtn.disabled = true;

        // Get selected quality
        const qualitySelect = document.getElementById('quality-select');
        const qualityFn = parseFloat(qualitySelect.value) || 0.8;

        const total = images.length;

        let doc = null;

        for (let i = 0; i < total; i++) {
            // Update status
            const progress = Math.round(((i + 1) / total) * 100);
            generateBtn.textContent = `生成中... ${progress}%`;
            showStatus(`画像処理中... (${i + 1}/${total})`, 'info');

            // Give UI a moment to update
            await new Promise(r => setTimeout(r, 10));

            // Load and Compress Image with selected quality
            const imgData = await compressImage(images[i].url, qualityFn);

            // Get properties of compressed image (it returns data URL)
            const props = await getImageProperties(imgData);
            const width = props.width;
            const height = props.height;

            if (i === 0) {
                // Initialize PDF with the dimensions of the first image
                // Orientation: 'p' (portrait) or 'l' (landscape) based on dimensions
                const orientation = width > height ? 'l' : 'p';
                doc = new jsPDF({
                    orientation: orientation,
                    unit: 'px',
                    format: [width, height]
                });
            } else {
                // Add new page with specific dimensions
                const orientation = width > height ? 'l' : 'p';
                doc.addPage([width, height], orientation);
            }

            // Draw image at 0,0 filling the page
            doc.addImage(imgData, 'JPEG', 0, 0, width, height);
        }

        doc.save('images.pdf');
        showStatus('ダウンロードを開始しました', 'success');
    } catch (e) {
        console.error(e);
        showStatus('エラーが発生しました: ' + e.message, 'error');
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'PDFを作成・ダウンロード';
    }
}

// Helper to get dimensions of a Data URL
function getImageProperties(dataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = reject;
        img.src = dataUrl;
    });
}

// Optimizes image: Resize to max 2000px and compress to JPEG with specified quality
function compressImage(url, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 2000;

            // Resize if too large
            if (width > maxDim || height > maxDim) {
                if (width > height) {
                    height = Math.round((height * maxDim) / width);
                    width = maxDim;
                } else {
                    width = Math.round((width * maxDim) / height);
                    height = maxDim;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // JPEG Compression
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = url;
    });
}

function showStatus(msg, type) {
    statusMessage.textContent = msg;
    statusMessage.style.color = type === 'error' ? 'red' : (type === 'success' ? 'green' : '#333');
}
