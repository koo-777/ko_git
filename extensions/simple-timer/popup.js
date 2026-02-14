document.addEventListener('DOMContentLoaded', () => {
    const timerDisplay = document.getElementById('timer-display');
    const startStopBtn = document.getElementById('start-stop-btn');
    const resetBtn = document.getElementById('reset-btn');
    const statusMsg = document.getElementById('status-msg');

    let timerInterval;

    // Load state from storage
    chrome.storage.local.get(['startTime', 'elapsedTime', 'isRunning'], (result) => {
        const startTime = result.startTime;
        const elapsedTime = result.elapsedTime || 0;
        const isRunning = result.isRunning || false;

        if (isRunning && startTime) {
            startTimerUI(startTime, elapsedTime);
        } else {
            updateDisplay(elapsedTime);
            resetUI();
        }
    });

    startStopBtn.addEventListener('click', () => {
        chrome.storage.local.get(['startTime', 'elapsedTime', 'isRunning'], (result) => {
            const isRunning = result.isRunning || false;

            if (!isRunning) {
                // Start
                const now = Date.now();
                const currentElapsed = result.elapsedTime || 0;

                chrome.storage.local.set({
                    startTime: now,
                    isRunning: true,
                    elapsedTime: currentElapsed
                }, () => {
                    startTimerUI(now, currentElapsed);
                });
            } else {
                // Stop (Pause)
                const now = Date.now();
                const startTime = result.startTime;
                const previousElapsed = result.elapsedTime || 0;
                const sessionElapsed = now - startTime;
                const totalElapsed = previousElapsed + sessionElapsed;

                chrome.storage.local.set({
                    isRunning: false,
                    elapsedTime: totalElapsed,
                    startTime: null
                }, () => {
                    clearInterval(timerInterval);
                    updateDisplay(totalElapsed);
                    resetUI();
                    statusMsg.textContent = 'Paused';
                });
            }
        });
    });

    resetBtn.addEventListener('click', () => {
        chrome.storage.local.set({
            startTime: null,
            elapsedTime: 0,
            isRunning: false
        }, () => {
            clearInterval(timerInterval);
            updateDisplay(0);
            resetUI();
            statusMsg.textContent = 'Reset';
        });
    });

    function startTimerUI(startTime, baseElapsed) {
        startStopBtn.textContent = 'Stop';
        startStopBtn.classList.add('stop');
        statusMsg.textContent = 'Tracking...';

        // Immediate update
        const now = Date.now();
        updateDisplay(baseElapsed + (now - startTime));

        // Loop
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            const currentNow = Date.now();
            const total = baseElapsed + (currentNow - startTime);
            updateDisplay(total);
        }, 1000);
    }

    function resetUI() {
        startStopBtn.textContent = 'Start';
        startStopBtn.classList.remove('stop');
    }

    function updateDisplay(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const formatted =
            pad(hours) + ':' +
            pad(minutes) + ':' +
            pad(seconds);

        timerDisplay.textContent = formatted;
    }

    function pad(num) {
        return num.toString().padStart(2, '0');
    }
});
