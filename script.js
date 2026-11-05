(function () {
    "use strict";

    // ===== CONFIG =====
    var BACKEND_URL = "https://cybertrace-vxzp.onrender.com";
    var MAX_EVENTS = 20;
    var SEVERITIES = ["HIGH", "MEDIUM", "LOW"];

    // ===== ELEMENTS =====
    function $(id) { return document.getElementById(id); }

    var connectionStatus = $("connectionStatus");
    var networkStatus = $("networkStatus");
    var feed = $("liveThreatFeed");
    var threatCount = $("threatCount");
    var securityScore = $("securityScore");
    var scoreNote = $("scoreNote");
    var systemTime = $("systemTime");
    var analysisButton = $("analysisButton");
    var aiAssessment = $("aiAssessment");

    var counters = {
        HIGH: $("highThreatCount"),
        MEDIUM: $("mediumThreatCount"),
        LOW: $("lowThreatCount")
    };

    var count = { total: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    var byName = {};

    // ===== REAL CLOCK =====
    function tick() {
        if (systemTime) systemTime.textContent = new Date().toLocaleTimeString();
    }
    tick();
    setInterval(tick, 1000);

    // ===== CONNECTION STATUS =====
    function setConnection(cls, text, linkText) {
        connectionStatus.className = "status " + cls;
        connectionStatus.textContent = text;
        networkStatus.textContent = linkText;
    }

    // ===== DEMO SCORE (simple formula, only from received demo events) =====
    function updateScore() {
        var score = 100 - (count.HIGH * 5 + count.MEDIUM * 2 + count.LOW * 0.5);
        score = Math.max(0, Math.round(score));
        securityScore.textContent = String(score);
        scoreNote.textContent = "Demo score: starts at 100, minus 5 per High, 2 per Medium, 0.5 per Low demo event.";
    }

    // ===== EVENT VALIDATION =====
    function validate(threat) {
        if (!threat || typeof threat !== "object") return null;
        if (typeof threat.name !== "string" || !threat.name.trim()) return null;
        var sev = String(threat.severity || "").toUpperCase();
        if (SEVERITIES.indexOf(sev) === -1) return null;
        var desc = typeof threat.description === "string" ? threat.description.trim().slice(0, 200) : "";
        return { name: threat.name.trim().slice(0, 120), severity: sev, description: desc };
    }

    function tag(cls, text) {
        var s = document.createElement("span");
        s.className = "tag " + cls;
        s.textContent = text;
        return s;
    }

    // ===== HANDLE EVENT =====
    function onThreat(threat) {
        var ev = validate(threat);
        if (!ev) {
            console.warn("Ignored invalid event:", threat);
            return;
        }

        count.total++;
        count[ev.severity]++;
        byName[ev.name] = (byName[ev.name] || 0) + 1;

        counters[ev.severity].textContent = count[ev.severity];
        threatCount.textContent = count.total;
        updateScore();

        var empty = $("emptyThreatMessage");
        if (empty) empty.remove();

        var item = document.createElement("div");
        item.className = "threat-item " + ev.severity.toLowerCase();

        var main = document.createElement("div");
        main.className = "t-main";
        var title = document.createElement("strong");
        title.textContent = ev.name;
        main.appendChild(title);
        if (ev.description) {
            var small = document.createElement("small");
            small.textContent = ev.description;
            main.appendChild(small);
        }

        var time = document.createElement("time");
        time.textContent = new Date().toLocaleTimeString();

        item.appendChild(main);
        item.appendChild(tag("sev-" + ev.severity.toLowerCase(), ev.severity));
        item.appendChild(tag("demo", "DEMO EVENT"));
        item.appendChild(time);

        feed.prepend(item);
        while (feed.children.length > MAX_EVENTS) {
            feed.lastElementChild.remove();
        }
    }

    // ===== SUMMARY BUTTON (count-based, no AI) =====
    analysisButton.addEventListener("click", function () {
        if (count.total === 0) {
            aiAssessment.textContent = "No demo events received yet. Wait for the first event and try again.";
            return;
        }
        var top = "";
        var topCount = 0;
        Object.keys(byName).forEach(function (n) {
            if (byName[n] > topCount) { top = n; topCount = byName[n]; }
        });
        aiAssessment.textContent =
            "Received " + count.total + " demo events: " +
            count.HIGH + " High, " + count.MEDIUM + " Medium, " + count.LOW + " Low. " +
            "Most frequent: " + top + " (" + topCount + "). " +
            "This is a simple count of demo events, not a real security assessment.";
    });

    // ===== SOCKET.IO (one connection, listeners attached once) =====
    if (typeof io !== "function") {
        setConnection("offline", "🔴 Socket.IO library failed to load", "Unavailable");
        return;
    }

    setConnection("offline", "🟡 Connecting...", "Connecting");

    var socket = io(BACKEND_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000
    });

    socket.on("connect", function () {
        console.log("Dashboard connected:", socket.id);
        setConnection("online", "🟢 Connected to backend", "Connected");
    });

    socket.on("disconnect", function (reason) {
        console.log("Dashboard disconnected:", reason);
        setConnection("offline", "🔴 Disconnected", "Disconnected");
    });

    socket.on("connect_error", function (err) {
        console.error("Connection error:", err.message);
        setConnection("offline", "🔴 Cannot reach backend. Retrying...", "Unreachable");
    });

    socket.io.on("reconnect_attempt", function () {
        setConnection("offline", "🟡 Reconnecting...", "Reconnecting");
    });

    socket.on("threatUpdate", onThreat);
})();