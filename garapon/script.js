window.onload = () => {
            loadSettings();
            loadHistory();
        };

        // --- 設定と保存 ---
        function saveSettings() {
            const rows = document.querySelectorAll('#settings-table tbody tr');
            const settings = Array.from(rows).map(row => {
                const inputs = row.querySelectorAll('input');
                return { 
                    color: inputs[0].value, 
                    name: inputs[1].value, 
                    init: inputs[2].value, 
                    stock: inputs[3].value 
                };
            });
            localStorage.setItem('garagara_v2_settings', JSON.stringify(settings));
        }

        function loadSettings() {
            const saved = localStorage.getItem('garagara_v2_settings');
            const data = saved ? JSON.parse(saved) : [
                { color: '#ffd700', name: '1等', init: '1', stock: '1' },
                { color: '#ffffff', name: 'ハズレ', init: '10', stock: '10' }
            ];
            const tbody = document.getElementById('settings-body');
            tbody.innerHTML = '';
            data.forEach(item => addRow(item.color, item.name, item.init, item.stock));
        }

        function addRow(color="#3498db", name=null, init="1", stock=null) {
            const tbody = document.getElementById('settings-body');
            if (!name) {
                const nextNum = tbody.querySelectorAll('tr').length + 1;
                name = `${nextNum}等`;
            }
            const finalStock = (stock === null) ? init : stock;
            const row = document.createElement('tr');
            row.innerHTML = `
            <td><input type="color" value="${color}" onchange="saveSettings()"></td>
            <td><input type="text" value="${name}" onchange="saveSettings()"></td>
            <td><input type="number" value="${init}" min="0" onchange="saveSettings()"></td>
            <td><input type="number" value="${finalStock}" min="0" onchange="saveSettings()"></td>
            <td><button class="btn btn-delete" onclick="this.closest('tr').remove(); saveSettings();">消す</button></td>
            `;  
            tbody.appendChild(row);
            saveSettings();
        }

        // --- 補充機能 ---
        function refillAll() {
            if(!confirm('すべての在庫を初期数まで補充しますか？')) return;
            const rows = document.querySelectorAll('#settings-table tbody tr');
            rows.forEach(row => {
                const inputs = row.querySelectorAll('input');
                inputs[3].value = inputs[2].value;
            });
            saveSettings();
            document.getElementById('result-text').innerText = "玉を補充しました！";
        }

        // --- 履歴機能 ---
        function addHistory(prize) {
            const saved = JSON.parse(localStorage.getItem('garagara_v2_history') || '[]');
            const now = new Date();
            const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
            saved.unshift({ time: timeStr, color: prize.color, name: prize.name });
            localStorage.setItem('garagara_v2_history', JSON.stringify(saved.slice(0, 50)));
            renderHistory();
        }

        function renderHistory() {
            const list = document.getElementById('history-list');
            const saved = JSON.parse(localStorage.getItem('garagara_v2_history') || '[]');
            list.innerHTML = saved.map(item => `
                <li class="history-item">
                    <span style="color:#888; font-size:11px; width:40px;">${item.time}</span>
                    <div class="history-dot" style="background-color: ${item.color}"></div>
                    <span>${item.name}</span>
                </li>
            `).join('');
        }

        function loadHistory() { renderHistory(); }
        function clearHistory() { localStorage.removeItem('garagara_v2_history'); renderHistory(); }

        // --- 抽選ロジック ---
        function startLottery() {
            const btn = document.getElementById('draw-btn');
            const machine = document.getElementById('machine');
            const ball = document.getElementById('ball');
            const resultText = document.getElementById('result-text');

            const rows = document.querySelectorAll('#settings-table tbody tr');
            let prizes = [];
            rows.forEach(row => {
                const inputs = row.querySelectorAll('input');
                const stock = parseInt(inputs[3].value);
                if (stock > 0) {
                    prizes.push({ color: inputs[0].value, name: inputs[1].value, stock: stock, inputElement: inputs[3] });
                }
            });

            if (prizes.length === 0) {
                resultText.innerText = "玉がありません！補充してください。";
                return;
            }

            btn.disabled = true;
            resultText.innerText = "抽選中...";
            machine.classList.remove('rotating');
            ball.classList.remove('ball-drop');
            void machine.offsetWidth;
            machine.classList.add('rotating');

            const totalStock = prizes.reduce((sum, p) => sum + p.stock, 0);
            let random = Math.floor(Math.random() * totalStock);
            let selected = prizes.find(p => (random -= p.stock) < 0);

            setTimeout(() => {
                ball.style.backgroundColor = selected.color;
                ball.classList.add('ball-drop');
                setTimeout(() => {
                    resultText.innerText = `出た！【${selected.name}】`;
                    selected.inputElement.value = selected.stock - 1;
                    saveSettings();
                    addHistory(selected);
                    btn.disabled = false;
                }, 600);
            }, 1200);
        }