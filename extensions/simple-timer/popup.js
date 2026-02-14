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

        if (task.isRunning) {
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

    // --- Logic ---

    function loadTasks() {
        chrome.storage.local.get(['tasks', 'activeTaskId'], (result) => {
            tasks = result.tasks || [];
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
            startTime: null,
            elapsedTime: 0,
            isRunning: false
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

    function startTask(task) {
        task.isRunning = true;
        task.startTime = Date.now();
        saveTasks();
        renderUI();
    }

    function stopTask(task) {
        // Calculate accrued time
        const now = Date.now();
        task.elapsedTime += (now - task.startTime);
        task.startTime = null; // Clear start time
        task.isRunning = false;
        saveTasks();
        renderUI();
    }

    function resetTask(task) {
        task.isRunning = false;
        task.startTime = null;
        task.elapsedTime = 0;
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

        // Update Name Input if not focused (to avoid overwriting user typing if re-rendered)
        if (document.activeElement !== taskNameInput) {
            taskNameInput.value = task.name;
        }

        // Calculate Time
        let totalTime = task.elapsedTime;
        if (task.isRunning) {
            totalTime += (Date.now() - task.startTime);
        }
        timerDisplay.textContent = formatTime(totalTime);

        // Update Buttons
        if (task.isRunning) {
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
