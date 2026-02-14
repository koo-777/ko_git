document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const tabsContainer = document.getElementById('tabs-container');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskNameInput = document.getElementById('task-name-input');
    const timerDisplay = document.getElementById('timer-display');
    const startStopBtn = document.getElementById('start-stop-btn');
    const resetBtn = document.getElementById('reset-btn');
    const statusMsg = document.getElementById('status-msg');
    const deleteTaskBtn = document.getElementById('delete-task-btn');
    const copyLogBtn = document.getElementById('copy-log-btn');

    let tasks = [];
    let activeTaskId = null;
    let uiInterval = null;

    // --- Initialization ---
    loadTasks();
    setInterval(refreshTimerUI, 1000); // Global UI refresh loop

    // --- Event Listeners ---
    addTaskBtn.addEventListener('click', addNewTask);

    taskNameInput.addEventListener('change', (e) => {
        updateTask(activeTaskId, { name: e.target.value });
        renderTabs();
    });

    startStopBtn.addEventListener('click', () => {
        const task = getTask(activeTaskId);
        if (!task) return;

        if (isTaskRunning(task)) {
            stopTask(task);
        } else {
            startTask(task);
        }
    });

    resetBtn.addEventListener('click', () => {
        const task = getTask(activeTaskId);
        if (task) resetTask(task);
    });

    deleteTaskBtn.addEventListener('click', () => {
        if (confirm('Delete this task?')) {
            deleteTask(activeTaskId);
        }
    });

    copyLogBtn.addEventListener('click', () => {
        const task = getTask(activeTaskId);
        if (task) {
            const log = generateLogMarkdown(task);
            copyToClipboard(log);
        }
    });

    // --- Logic ---

    function loadTasks() {
        chrome.storage.local.get(['tasks', 'activeTaskId'], (result) => {
            tasks = result.tasks || [];

            // Migration: Check if tasks have 'history' property. If not, reset/migrate.
            // For simplicity in this dev phase, if data format is old, we'll reset or wrap it.
            // Let's reset if it looks like old format to ensure clean history.
            if (tasks.length > 0 && !tasks[0].history) {
                console.log("Migrating old data format...");
                tasks = [];
            }

            if (tasks.length === 0) {
                // Create default task if none exist
                tasks.push(createTaskObject('Task 1'));
                activeTaskId = tasks[0].id;
                saveTasks();
            } else {
                activeTaskId = result.activeTaskId || tasks[0].id;
                // Validate activeTaskId exists
                if (!tasks.find(t => t.id === activeTaskId)) {
                    activeTaskId = tasks[0].id;
                }
            }
            renderUI();
        });
    }

    function createTaskObject(name) {
        return {
            id: Date.now().toString(),
            name: name,
            history: [] // Array of { start: timestamp, end: timestamp|null }
        };
    }

    function addNewTask() {
        const newTask = createTaskObject(`Task ${tasks.length + 1}`);
        tasks.push(newTask);
        activeTaskId = newTask.id;
        saveTasks();
        renderUI();
    }

    function deleteTask(id) {
        if (tasks.length <= 1) {
            alert("Cannot delete the last task.");
            return;
        }
        tasks = tasks.filter(t => t.id !== id);
        if (activeTaskId === id) {
            activeTaskId = tasks[0].id;
        }
        saveTasks();
        renderUI();
    }

    function isTaskRunning(task) {
        if (!task.history || task.history.length === 0) return false;
        const lastSegment = task.history[task.history.length - 1];
        return lastSegment.end === null;
    }

    function startTask(task) {
        // Start a new segment
        task.history.push({
            start: Date.now(),
            end: null
        });
        saveTasks();
        renderUI();
    }

    function stopTask(task) {
        // Find running segment and close it
        const lastSegment = task.history[task.history.length - 1];
        if (lastSegment && lastSegment.end === null) {
            lastSegment.end = Date.now();
        }
        saveTasks();
        renderUI();
    }

    function resetTask(task) {
        task.history = [];
        saveTasks();
        renderUI();
    }

    function updateTask(id, updates) {
        const task = getTask(id);
        if (task) {
            Object.assign(task, updates);
            saveTasks();
        }
    }

    function getTask(id) {
        return tasks.find(t => t.id === id);
    }

    function saveTasks() {
        chrome.storage.local.set({
            tasks: tasks,
            activeTaskId: activeTaskId
        });
    }

    function calculateTotalTime(task) {
        let total = 0;
        const now = Date.now();
        task.history.forEach(segment => {
            if (segment.end) {
                total += (segment.end - segment.start);
            } else {
                total += (now - segment.start);
            }
        });
        return total;
    }

    // --- Log Generation ---
    function generateLogMarkdown(task) {
        if (!task.history || task.history.length === 0) {
            return `# ${task.name}\nNo activity recorded.`;
        }

        const formatDate = (ts) => new Date(ts).toLocaleString();
        const formatDuration = (ms) => {
            const s = Math.floor(ms / 1000);
            const m = Math.floor(s / 60);
            const h = Math.floor(m / 60);
            return `${pad(h)}:${pad(m % 60)}:${pad(s % 60)}`;
        };

        const firstStart = task.history[0].start;
        const lastSegment = task.history[task.history.length - 1];
        const lastEnd = lastSegment.end ? lastSegment.end : Date.now();
        const isRunning = lastSegment.end === null;

        let md = `# ${task.name}\n\n`;
        md += `## Total Work Time: ${formatDuration(calculateTotalTime(task))}\n\n`;
        md += `Start: ${formatDate(firstStart)}\n`;
        md += `End: ${isRunning ? 'Running...' : formatDate(lastEnd)}\n\n`;

        // Pauses
        const pauses = [];
        for (let i = 0; i < task.history.length - 1; i++) {
            const currentEnd = task.history[i].end;
            const nextStart = task.history[i + 1].start;
            if (currentEnd && nextStart > currentEnd) {
                pauses.push({
                    start: currentEnd,
                    end: nextStart,
                    duration: nextStart - currentEnd
                });
            }
        }

        if (pauses.length > 0) {
            md += `### Pauses\n`;
            pauses.forEach((p, index) => {
                md += `${index + 1}. ${formatDate(p.start)} - ${formatDate(p.end)} (Duration: ${formatDuration(p.duration)})\n`;
            });
            md += `\n`;
        } else {
            md += `### Pauses\nNone\n\n`;
        }

        return md;
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyLogBtn.textContent;
            copyLogBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyLogBtn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert('Failed to copy log.');
        });
    }

    // --- Rendering ---

    function renderUI() {
        renderTabs();
        refreshTimerUI(); // Update main display immediately
    }

    function renderTabs() {
        tabsContainer.innerHTML = '';
        tasks.forEach(task => {
            const tab = document.createElement('div');
            tab.className = `tab ${task.id === activeTaskId ? 'active' : ''}`;
            tab.textContent = task.name;
            tab.title = task.name;
            tab.onclick = () => {
                activeTaskId = task.id;
                saveTasks(); // Save active tab preference
                renderUI();
            };
            tabsContainer.appendChild(tab);
        });
    }

    function refreshTimerUI() {
        const task = getTask(activeTaskId);
        if (!task) return;

        // Update Name Input if not focused
        if (document.activeElement !== taskNameInput) {
            taskNameInput.value = task.name;
        }

        const running = isTaskRunning(task);
        timerDisplay.textContent = formatTime(calculateTotalTime(task));

        // Update Buttons
        if (running) {
            startStopBtn.textContent = 'Stop';
            startStopBtn.classList.add('stop');
            statusMsg.textContent = 'Running...';
        } else {
            startStopBtn.textContent = 'Start';
            startStopBtn.classList.remove('stop');
            statusMsg.textContent = 'Paused';
        }
    }

    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    function pad(num) {
        return num.toString().padStart(2, '0');
    }
});
