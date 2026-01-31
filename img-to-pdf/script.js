// Simple Image to PDF Logic
console.log('Simple Image to PDF loaded');

const { jsPDF } = window.jspdf;

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const previewArea = document.getElementById('preview-area');
const generateBtn = document.getElementById('generate-btn');
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
        el.innerHTML = `
            <img src="${url}">
            <button class="remove-btn" onclick="removeImage(this)">×</button>
        `;
        previewArea.appendChild(el);
    });

    updateUIStatus();
}

// Focuses on button state/message
function updateUIStatus() {
    if (images.length > 0) {
        generateBtn.disabled = false;
        clearBtn.style.display = 'inline-block';
        showStatus(`${images.length}枚の画像を選択中 (ドラッグで並び替え可能)`, 'info');
    } else {
        generateBtn.disabled = true;
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
        generateBtn.textContent = '生成中...';
        showStatus('PDFを生成しています...', 'info');

        const doc = new jsPDF();

        for (let i = 0; i < images.length; i++) {
            const imgData = await loadImage(images[i].url);
            const props = doc.getImageProperties(imgData);

            // Calculate dimensions to fit/contain
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // Simple fit logic (width priority)
            const ratio = props.width / props.height;
            const pdfWidth = pageWidth;
            const pdfHeight = pageWidth / ratio;

            // If image height is greater than page height, scale by height instead
            // But usually PDF fitting strictly to page width is expected for document scanners.
            // Let's stick to width fit for now, but handle multiple pages.

            // Support multipage if height overflows? No, specification says "Add Page".
            // "Assign selected images to PDF pages".

            if (i > 0) doc.addPage();

            // Optional: Check if image needs rotation (landscape/portrait match)
            // But KISS.

            doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
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

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

function showStatus(msg, type) {
    statusMessage.textContent = msg;
    statusMessage.style.color = type === 'error' ? 'red' : (type === 'success' ? 'green' : '#333');
}
