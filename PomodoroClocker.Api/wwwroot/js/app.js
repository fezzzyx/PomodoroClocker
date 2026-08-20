let seconds = 25 * 60;
let timer = null;

let pomodoroCount = 0;
let focusMinutes = 0;
let workMinutes = 25

let currentSessionType = 0;
let currentCycle = 0;

let shortBreakMinutes = 5;
let longBreakMinutes = 15;
let cyclesBeforeLongBreak = 4;

let sessionStartTime = null;


async function apiFetch(url, options = {}) {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/login.html";
        return;
    }

    const headers = {
        ...(options.headers || {}),
        "Authorization": `Bearer ${token}`
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");

        window.location.href = "/login.html";

        return;
    }

    return response;
}

// -------------------------
// Timer
// -------------------------

const timeElement =
    document.getElementById("time");

const startButton =
    document.getElementById("startButton");

const pauseButton =
    document.getElementById("pauseButton");

const resetButton =
    document.getElementById("resetButton");

const sessionTypeElement =
    document.querySelector(".session-type");

const ringProgress =
    document.getElementById("timerRingProgress");

const cycleIndicator =
    document.getElementById("cycleIndicator");

const RING_CIRCUMFERENCE = 628.3185;

function getSessionDurationSeconds(sessionType) {

    switch (sessionType) {

        case 0:
            return workMinutes * 60;

        case 1:
            return shortBreakMinutes * 60;

        case 2:
            return longBreakMinutes * 60;

        default:
            return workMinutes * 60;
    }
}

function updateRing() {

    if (!ringProgress) {
        return;
    }

    const total =
        getSessionDurationSeconds(currentSessionType) || 1;

    const fraction =
        Math.max(0, Math.min(1, seconds / total));

    ringProgress.style.strokeDashoffset =
        String(RING_CIRCUMFERENCE * (1 - fraction));
}

const DEFAULT_TAB_TITLE = document.title;

function getSessionShortLabel() {

    switch (currentSessionType) {

        case 0:
            return "Work";

        case 1:
            return "Short Break";

        case 2:
            return "Long Break";

        default:
            return "";
    }
}

function updateTabTitle(isPaused = false) {

    if (timer === null && !isPaused) {

        document.title = DEFAULT_TAB_TITLE;

        return;
    }

    const minutes =
        Math.floor(seconds / 60);

    const remainingSeconds =
        seconds % 60;

    const timeLabel =
        `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;

    const icon =
        isPaused ? "⏸" : "⏱";

    document.title =
        `${icon} ${timeLabel} · ${getSessionShortLabel()}`;
}

function updateDisplay() {

    const minutes =
        Math.floor(seconds / 60);

    const remainingSeconds =
        seconds % 60;

    timeElement.textContent =
        `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;

    updateRing();
    updateTabTitle();
}
function updateSessionTypeDisplay() {

    switch (currentSessionType) {

        case 0:
            sessionTypeElement.textContent =
                "🍅 Work Session";
            break;

        case 1:
            sessionTypeElement.textContent =
                "☕ Short Break";
            break;

        case 2:
            sessionTypeElement.textContent =
                "🌙 Long Break";
            break;
    }

    if (ringProgress) {

        ringProgress.classList.remove(
            "ring-short",
            "ring-long"
        );

        if (currentSessionType === 1) {
            ringProgress.classList.add("ring-short");
        } else if (currentSessionType === 2) {
            ringProgress.classList.add("ring-long");
        }
    }

    if (cycleIndicator) {

        const cyclePosition =
            currentSessionType === 0
                ? (currentCycle % cyclesBeforeLongBreak) + 1
                : currentCycle;

        cycleIndicator.textContent =
            `Cycle ${cyclePosition} of ${cyclesBeforeLongBreak}`;
    }

    renderSessionQueue();
}

// -------------------------
// Session queue
// -------------------------

const queueTrack =
    document.getElementById("queueTrack");

const QUEUE_TYPE_LABELS = {
    0: "Work",
    1: "Short Break",
    2: "Long Break"
};

function buildSessionSequence(cycleLength) {

    const sequence = [];

    for (let i = 0; i < cycleLength; i++) {

        sequence.push(0);

        sequence.push(
            i === cycleLength - 1 ? 2 : 1
        );
    }

    return sequence;
}

function getCurrentQueueIndex(cycleLength) {

    if (currentSessionType === 0) {

        const workSlot =
            currentCycle % cycleLength;

        return workSlot * 2;
    }

    const breakSlot =
        ((currentCycle - 1) % cycleLength + cycleLength) % cycleLength;

    return breakSlot * 2 + 1;
}

function renderSessionQueue() {

    if (!queueTrack) {
        return;
    }

    const cycleLength =
        cyclesBeforeLongBreak > 0 ? cyclesBeforeLongBreak : 1;

    const sequence =
        buildSessionSequence(cycleLength);

    const currentIndex =
        getCurrentQueueIndex(cycleLength);

    queueTrack.innerHTML = "";

    sequence.forEach((type, index) => {

        const state =
            index < currentIndex
                ? "done"
                : index === currentIndex
                    ? "current"
                    : "upcoming";

        const item =
            document.createElement("div");

        item.className =
            `queue-item queue-${state} queue-type-${type}`;

        const dot =
            document.createElement("span");

        dot.className = "queue-dot";

        dot.textContent =
            state === "done" ? "✓" : "";

        const label =
            document.createElement("span");

        label.className = "queue-label";
        label.textContent = QUEUE_TYPE_LABELS[type];

        item.appendChild(dot);
        item.appendChild(label);

        queueTrack.appendChild(item);
    });
}
function startNextSession() {

    if (currentSessionType === 0) {

        currentCycle++;

        if (currentCycle >= cyclesBeforeLongBreak) {

            currentSessionType = 2;
            seconds = longBreakMinutes * 60;

        } else {

            currentSessionType = 1;
            seconds = shortBreakMinutes * 60;
        }
    }

    else {

        currentSessionType = 0;
        seconds = workMinutes * 60;
    }

    sessionStartTime = new Date();

    updateSessionTypeDisplay();
    updateDisplay();

    console.log(
        "Starting:",
        getSessionType(currentSessionType)
    );
}

async function loadHistory() {

    const historyList =
        document.getElementById("historyList");

    try {

        const response =
            await apiFetch("/api/Sessions/my");

        if (!response) {
            return;
        }

        if (!response.ok) {
            throw new Error(
                `HTTP error: ${response.status}`
            );
        }

        const sessions =
            await response.json();

        if (sessions.length === 0) {

            historyList.innerHTML = `
                <p class="empty-message">
                    No sessions yet.
                </p>
            `;

            return;
        }

        historyList.innerHTML = "";

        sessions.forEach(session => {

            const start =
                new Date(session.startTime);

            const end =
                new Date(session.endTime);

            const duration =
                Math.max(
                    1,
                    Math.round(
                        (end - start) / 60000
                    )
                );

            const item =
                document.createElement("div");

            item.className =
                "history-item";

            const isCompleted =
                session.isCompleted !== false;

            item.innerHTML = `
                <div class="history-item-main">
                    <div>
                        <span class="session-badge badge-type-${session.sessionType}">
                            ${getSessionType(session.sessionType)}
                        </span>

                        <div class="history-date">
                            ${start.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div class="history-meta">
                    <span class="status-badge ${isCompleted ? "status-completed" : ""}">
                        ${isCompleted ? "✓ Completed" : "Incomplete"}
                    </span>

                    <span class="history-duration">
                        ${duration} min
                    </span>
                </div>
            `;

            historyList.appendChild(item);
        });

    } catch (error) {

        console.error(
            "Error loading history:",
            error
        );

        historyList.innerHTML = `
            <p class="empty-message">
                Failed to load history.
            </p>
        `;
    }
}

async function loadSettings() {

    try {

        const response =
            await apiFetch("/api/settings");

        if (!response) {
            return;
        }

        if (!response.ok) {
            throw new Error(
                `HTTP error: ${response.status}`
            );
        }

        const settings =
            await response.json();

        workMinutes =
            settings.workMinutes;

        shortBreakMinutes =
            settings.shortBreakMinutes;

        longBreakMinutes =
            settings.longBreakMinutes;

        cyclesBeforeLongBreak =
            settings.cyclesBeforeLongBreak;

        document.getElementById(
            "workMinutes"
        ).value = workMinutes;

        document.getElementById(
            "shortBreakMinutes"
        ).value = shortBreakMinutes;

        document.getElementById(
            "longBreakMinutes"
        ).value = longBreakMinutes;

        document.getElementById(
            "cyclesBeforeLongBreak"
        ).value =
            cyclesBeforeLongBreak;

        seconds =
            workMinutes * 60;

        updateSessionTypeDisplay();
        updateDisplay();

        console.log(
            "Settings loaded:",
            settings
        );

    } catch (error) {

        console.error(
            "Error loading settings:",
            error
        );
    }
}

async function saveSettings() {

    const settings = {

        workMinutes:
            Number(
                document.getElementById(
                    "workMinutes"
                ).value
            ),

        shortBreakMinutes:
            Number(
                document.getElementById(
                    "shortBreakMinutes"
                ).value
            ),

        longBreakMinutes:
            Number(
                document.getElementById(
                    "longBreakMinutes"
                ).value
            ),

        cyclesBeforeLongBreak:
            Number(
                document.getElementById(
                    "cyclesBeforeLongBreak"
                ).value
            )
    };

    try {

        const response =
            await apiFetch(
                "/api/settings",
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(settings)
                }
            );

        if (!response) {
            return false;
        }

        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                `HTTP ${response.status}: ${errorText}`
            );
        }

        const result =
            await response.json();

        console.log(
            "Settings saved:",
            result
        );

        workMinutes =
            result.workMinutes;

        shortBreakMinutes =
            result.shortBreakMinutes;

        longBreakMinutes =
            result.longBreakMinutes;

        cyclesBeforeLongBreak =
            result.cyclesBeforeLongBreak;

        seconds =
            workMinutes * 60;

        currentSessionType = 0;
        currentCycle = 0;

        updateSessionTypeDisplay();
        updateDisplay();

        alert("Settings saved!");

        return true;

    } catch (error) {

        console.error(
            "Error saving settings:",
            error
        );

        alert(
            "Failed to save settings."
        );

        return false;
    }
}

const saveSettingsButton =
    document.getElementById(
        "saveSettingsButton"
    );

saveSettingsButton.addEventListener(
    "click",
    saveSettings
);
function getSessionType(type) {

    switch (type) {

        case 0:
            return "🍅 Work";

        case 1:
            return "☕ Short Break";

        case 2:
            return "🌙 Long Break";

        default:
            return "Unknown";
    }
}
function runTimer() {

    if (timer !== null) {
        return;
    }

    timer = setInterval(async () => {

        if (seconds <= 0) {

            clearInterval(timer);
            timer = null;

            const finishedSessionType =
                currentSessionType;

            console.log(
                "TIMER FINISHED:",
                getSessionType(finishedSessionType)
            );

            await saveSession();


            if (finishedSessionType === 0) {

                console.log("CALLING NOTIFICATION");

                playChime("break");

                showNotification(
                    "Pomodoro finished",
                    "Time for a short break!"
                );

                pomodoroCount++;

                focusMinutes += workMinutes;

                updateStatistics();

            } else if (finishedSessionType === 1) {

                playChime("work");

                showNotification(
                    "Short break finished",
                    "Time to focus!"
                );

            } else if (finishedSessionType === 2) {

                playChime("work");

                showNotification(
                    "Long break finished",
                    "Ready for another Pomodoro?"
                );
            }

            startNextSession();

            runTimer();

            return;
        }

        seconds--;

        updateDisplay();

    }, 1000);
}

startButton.addEventListener("click", async () => {

    getAudioContext();

    if (!("Notification" in window)) {
        console.log("Notifications are not supported.");
    }

    if (Notification.permission === "default") {

        const permission =
            await Notification.requestPermission();

        console.log(
            "Notification permission:",
            permission
        );
    }

    if (timer !== null) {
        return;
    }

    if (sessionStartTime === null) {
        sessionStartTime = new Date();
    }

    runTimer();
});


pauseButton.addEventListener("click", () => {

    clearInterval(timer);

    timer = null;

    updateTabTitle(true);
});


resetButton.addEventListener("click", () => {

    clearInterval(timer);
    timer = null;

    currentSessionType = 0;
    currentCycle = 0;

    sessionStartTime = null;

    seconds = workMinutes * 60;

    updateSessionTypeDisplay();
    updateDisplay();

});

async function saveSession() {

    const sessionEndTime = new Date();

    const session = {
        sessionType: currentSessionType,
        startTime: sessionStartTime.toISOString(),
        endTime: sessionEndTime.toISOString(),
        isCompleted: true,
    };

    try {

        const response = await apiFetch("/api/Sessions", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(session)
        });

        if (!response.ok) {
            throw new Error(
                `HTTP error: ${response.status}`
            );
        }

        console.log("Pomodoro session saved!");

        await loadHistory();
        await loadStatistics();

    } catch (error) {

        console.error(
            "Error saving session:",
            error
        );
    }
}

const logoutButton =
    document.getElementById("logoutButton");

logoutButton.addEventListener(
    "click",
    () => {

        localStorage.removeItem("token");
        localStorage.removeItem("username");

        window.location.href =
            "/login.html";
    }
);

// -------------------------
// Statistics
// -------------------------

function updateStatistics() {

    document.getElementById(
        "pomodoroCount"
    ).textContent = pomodoroCount;


    document.getElementById(
        "focusTime"
    ).textContent = `${focusMinutes} min`;
}


// -------------------------
// Navigation
// -------------------------

const navItems =
    document.querySelectorAll(".nav-item");

const pages =
    document.querySelectorAll(".page");


navItems.forEach(item => {

    item.addEventListener("click", () => {

        const pageName =
            item.dataset.page;


        navItems.forEach(nav => {
            nav.classList.remove("active");
        });


        pages.forEach(page => {
            page.classList.remove("active");
        });


        item.classList.add("active");

        document
            .getElementById(pageName)
            .classList.add("active");

        closeMobileSidebar();

    });

});


// -------------------------
// Mobile sidebar
// -------------------------

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const mobileMenuToggle =
    document.getElementById("mobileMenuToggle");

function openMobileSidebar() {

    if (!sidebar) {
        return;
    }

    sidebar.classList.add("open");

    if (sidebarOverlay) {
        sidebarOverlay.classList.add("show");
    }
}

function closeMobileSidebar() {

    if (!sidebar) {
        return;
    }

    sidebar.classList.remove("open");

    if (sidebarOverlay) {
        sidebarOverlay.classList.remove("show");
    }
}

if (mobileMenuToggle) {

    mobileMenuToggle.addEventListener(
        "click",
        openMobileSidebar
    );
}

if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeMobileSidebar
    );
}


// -------------------------
// Settings
// -------------------------


async function loadStatistics() {

    const totalPomodoros =
        document.getElementById("totalPomodoros");

    const totalFocusMinutes =
        document.getElementById("totalFocusMinutes");

    try {

        const response =
            await apiFetch("/api/Statistics/my");

        if (!response) {
            return;
        }

        if (!response.ok) {
            throw new Error(
                `HTTP error: ${response.status}`
            );
        }

        const statistics =
            await response.json();

        totalPomodoros.textContent =
            statistics.totalPomodoros;

        totalFocusMinutes.textContent =
            `${statistics.totalFocusMinutes} min`;

        updateWeeklyChart(
            statistics.weeklyData
        );

    } catch (error) {

        console.error(
            "Error loading statistics:",
            error
        );

        totalPomodoros.textContent = "—";
        totalFocusMinutes.textContent = "—";
    }
}

let weeklyChart = null;

function updateWeeklyChart(data) {

    const canvas =
        document.getElementById("weeklyChart");

    if (!canvas) {
        return;
    }

    const labels =
        data.map(item => item.day);

    const values =
        data.map(item => item.count);

    if (weeklyChart) {
        weeklyChart.destroy();
    }

    weeklyChart = new Chart(canvas, {

        type: "bar",

        data: {

            labels,

            datasets: [
                {
                    label: "Pomodoros",
                    data: values,
                    backgroundColor: "#2E6F5E",
                    borderRadius: 6,
                    maxBarThickness: 32
                }
            ]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: false
                }
            },

            scales: {

                x: {
                    grid: {
                        display: false
                    }
                },

                y: {
                    beginAtZero: true,

                    grid: {
                        color: "#E2E4DE"
                    },

                    ticks: {
                        precision: 0
                    }
                }
            }

        }
    });
}

// -------------------------
// Sound
// -------------------------

let notificationAudioContext = null;

function getAudioContext() {

    if (!("AudioContext" in window || "webkitAudioContext" in window)) {
        return null;
    }

    if (!notificationAudioContext) {

        try {

            notificationAudioContext =
                new (window.AudioContext || window.webkitAudioContext)();

        } catch (error) {

            console.error(
                "Could not create AudioContext:",
                error
            );

            return null;
        }
    }

    if (notificationAudioContext.state === "suspended") {
        notificationAudioContext.resume();
    }

    return notificationAudioContext;
}

function isSoundEnabled() {

    return localStorage.getItem("pomodoroSoundEnabled") !== "false";
}

function playChime(kind) {

    if (!isSoundEnabled()) {
        return;
    }

    const ctx = getAudioContext();

    if (!ctx) {
        return;
    }

    const now = ctx.currentTime;


    const notes =
        kind === "break"
            ? [[587.33, 0, 0.16], [783.99, 0.14, 0.24]]
            : [[659.25, 0, 0.16], [523.25, 0.14, 0.24]];

    notes.forEach(([frequency, offset, duration]) => {

        const oscillator =
            ctx.createOscillator();

        const gain =
            ctx.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;

        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.2, now + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + duration);

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start(now + offset);
        oscillator.stop(now + offset + duration + 0.05);
    });
}

const soundToggle =
    document.getElementById("soundToggle");

if (soundToggle) {

    soundToggle.checked = isSoundEnabled();

    soundToggle.addEventListener("change", () => {

        localStorage.setItem(
            "pomodoroSoundEnabled",
            soundToggle.checked
        );

        if (soundToggle.checked) {
            playChime("work");
        }
    });
}


let currentNotification = null;

function showInAppNotification(title, message) {

    const toast =
        document.getElementById(
            "notificationToast"
        );

    const titleElement =
        document.getElementById(
            "notificationTitle"
        );

    const messageElement =
        document.getElementById(
            "notificationMessage"
        );

    if (!toast) {
        return;
    }

    titleElement.textContent =
        title;

    messageElement.textContent =
        message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 5000);
}

function showNotification(title, message) {

    showInAppNotification(title, message);

    if (!("Notification" in window)) {
        console.log("Notifications are not supported.");
        return;
    }

    console.log(
        "Notification permission:",
        Notification.permission
    );

    if (Notification.permission !== "granted") {
        console.log("Notification permission is not granted.");
        return;
    }

    try {

        currentNotification = new Notification(
            title,
            {
                body: message,
                requireInteraction: true,
                tag: "pomodoro-clocker",
                silent: false
            }
        );

        currentNotification.onclick = () => {

            window.focus();

            currentNotification.close();
        };

        console.log("System notification created.");

    } catch (error) {

        console.error(
            "Failed to create system notification:",
            error
        );
    }
}

const notificationButton =
    document.getElementById("notificationButton");

notificationButton.addEventListener(
    "click",
    async () => {

        if (!("Notification" in window)) {

            alert(
                "Notifications are not supported by your browser."
            );

            return;
        }

        const permission =
            await Notification.requestPermission();

        if (permission === "granted") {

            alert(
                "Notifications enabled!"
            );

        } else {

            alert(
                "Notifications are disabled."
            );
        }
    }
);

window.testNotification = function () {

    showNotification(
        "Pomodoro Clocker",
        "Test notification works!"
    );

};


updateDisplay();
loadHistory();
loadStatistics();
loadSettings();
updateSessionTypeDisplay();
updateDisplay();