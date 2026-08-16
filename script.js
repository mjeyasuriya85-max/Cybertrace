// ==========================================
// CYBERTRACE - REAL-TIME SECURITY DASHBOARD
// ==========================================


// ==========================================
// DOM ELEMENTS
// ==========================================

const liveThreatFeed =
    document.getElementById("liveThreatFeed");

const threatCount =
    document.getElementById("threatCount");

const connectionStatus =
    document.getElementById("connectionStatus");

const highThreatCount =
    document.getElementById("highThreatCount");

const mediumThreatCount =
    document.getElementById("mediumThreatCount");

const lowThreatCount =
    document.getElementById("lowThreatCount");

const emptyThreatMessage =
    document.getElementById("emptyThreatMessage");

const securityScore =
    document.getElementById("securityScore");

const analysisButton =
    document.getElementById("analysisButton");

const aiResult =
    document.getElementById("aiResult");

const aiAssessment =
    document.getElementById("aiAssessment");

const systemTime =
    document.getElementById("systemTime");
// ==========================================
// THREAT STORAGE
// ==========================================

let threats = [];

// ==========================================
// LIVE SYSTEM CLOCK
// ==========================================

function updateSystemTime() {

    if (!systemTime) {
        return;
    }


    const now =
        new Date();


    systemTime.textContent =
        now.toLocaleTimeString();

}


updateSystemTime();


setInterval(
    updateSystemTime,
    1000
);


// ==========================================
// SOCKET.IO CONNECTION
// ==========================================

const socket =
    io("https://cybertrace-vxzp.onrender.com");


// ==========================================
// SOCKET CONNECTED
// ==========================================

socket.on("connect", () => {

    console.log(
        "🟢 CyberTrace connected to real-time server"
    );


    if (connectionStatus) {

        connectionStatus.textContent =
            "🟢 LIVE";


        connectionStatus.classList.remove(
            "offline"
        );


        connectionStatus.classList.add(
            "online"
        );

    }

});


// ==========================================
// SOCKET DISCONNECTED
// ==========================================

socket.on("disconnect", () => {

    console.log(
        "🔴 CyberTrace disconnected from server"
    );


    if (connectionStatus) {

        connectionStatus.textContent =
            "🔴 OFFLINE";


        connectionStatus.classList.remove(
            "online"
        );


        connectionStatus.classList.add(
            "offline"
        );

    }

});


// ==========================================
// REAL-TIME THREAT UPDATE
// ==========================================

socket.on(
    "threatUpdate",
    (threat) => {


        console.log(
            "🚨 Real-Time Threat Received:",
            threat
        );


        // ======================================
        // CHECK THREAT
        // ======================================

        if (!threat) {

            return;

        }


        // ======================================
        // HIGH THREAT ALERT
        // ======================================

        if (
            threat.severity === "HIGH"
        ) {
            // ==================================
            // VISUAL ALERT
            // ==================================

            const threatAlert =
                document.getElementById(
                    "threatAlert"
                );


            const alertMessage =
                document.getElementById(
                    "alertMessage"
                );


            if (
                threatAlert &&
                alertMessage
            ) {

                alertMessage.textContent =
                    ` — ${
                        threat.name ||
                        "High Threat Detected"
                    }`;


                threatAlert.classList.add(
                    "show"
                );


                setTimeout(
                    () => {

                        threatAlert.classList.remove(
                            "show"
                        );

                    },
                    5000
                );

            }

        }


        // ======================================
        // ADD THREAT
        // ======================================

        threats.unshift(
            threat
        );


        // ======================================
        // KEEP ONLY 5 THREATS
        // ======================================

        if (
            threats.length > 5
        ) {

            threats.pop();

        }


        // ======================================
        // UPDATE THREAT FEED
        // ======================================

        renderThreats();


        // ======================================
        // UPDATE SECURITY SCORE
        // ======================================

        updateSecurityScore(
            threat
        );

    }
);


// ==========================================
// RENDER THREATS
// ==========================================

function renderThreats() {

    if (!liveThreatFeed) {

        return;

    }


    // ======================================
    // CLEAR FEED
    // ======================================

    liveThreatFeed.innerHTML = "";


    // ======================================
    // NO THREATS
    // ======================================

    if (
        threats.length === 0
    ) {

        liveThreatFeed.innerHTML = `

            <div class="empty-state">

                <div>
                    🛡️
                </div>

                <p>
                    No real-time threats detected
                </p>

            </div>

        `;


        if (threatCount) {

            threatCount.textContent =
                "0";

        }


        updateThreatCounters();

        return;

    }


    // ======================================
    // UPDATE COUNTERS
    // ======================================

    updateThreatCounters();


    // ======================================
    // RENDER THREATS
    // ======================================

    threats.forEach(
        (threat) => {


            const threatRow =
                document.createElement(
                    "div"
                );


            threatRow.className =
                "threat-row";


            // ==================================
            // SEVERITY
            // ==================================

            let severityClass =
                "low";


            let icon =
                "🛡️";


            if (
                threat.severity === "HIGH"
            ) {

                severityClass =
                    "high";

                icon =
                    "🚨";

            }


            else if (
                threat.severity === "MEDIUM"
            ) {

                severityClass =
                    "medium";

                icon =
                    "⚠️";

            }


            // ==================================
            // THREAT DATA
            // ==================================

            const threatName =
                threat.name ||
                "Unknown Threat";


            const threatDescription =
                threat.description ||
                "Suspicious activity detected";


            const threatSeverity =
                threat.severity ||
                "LOW";


            // ==================================
            // THREAT HTML
            // ==================================

            threatRow.innerHTML = `

                <div class="threat-info">

                    <div class="threat-icon ${severityClass}">
                        ${icon}
                    </div>


                    <div>

                        <h3>
                            ${threatName}
                        </h3>


                        <p>
                            ${threatDescription}
                        </p>

                    </div>

                </div>


                <span
                    class="severity ${severityClass}"
                >
                    ${threatSeverity}
                </span>


                <span class="threat-time">
                    REAL-TIME
                </span>

            `;


            // ==================================
            // ADD TO FEED
            // ==================================

            liveThreatFeed.appendChild(
                threatRow
            );

        }
    );


    // ======================================
    // TOTAL THREAT COUNT
    // ======================================

    if (threatCount) {

        threatCount.textContent =
            threats.length;

    }

}


// ==========================================
// THREAT COUNTERS
// ==========================================

function updateThreatCounters() {


    let highCount =
        0;


    let mediumCount =
        0;


    let lowCount =
        0;


    threats.forEach(
        (threat) => {


            if (
                threat.severity === "HIGH"
            ) {

                highCount++;

            }


            else if (
                threat.severity === "MEDIUM"
            ) {

                mediumCount++;

            }


            else {

                lowCount++;

            }

        }
    );


    if (highThreatCount) {

        highThreatCount.textContent =
            highCount;

    }


    if (mediumThreatCount) {

        mediumThreatCount.textContent =
            mediumCount;

    }


    if (lowThreatCount) {

        lowThreatCount.textContent =
            lowCount;

    }

}


// ==========================================
// SECURITY SCORE
// ==========================================

function updateSecurityScore(
    threat
) {


    if (!securityScore) {

        return;

    }


    let score =
        parseInt(
            securityScore.textContent
        ) || 100;


    // ======================================
    // SCORE REDUCTION
    // ======================================

    if (
        threat.severity === "HIGH"
    ) {

        score -= 5;

    }


    else if (
        threat.severity === "MEDIUM"
    ) {

        score -= 3;

    }


    else {

        score -= 1;

    }


    // ======================================
    // MINIMUM SCORE
    // ======================================

    score =
        Math.max(
            score,
            0
        );


    // ======================================
    // UPDATE SCORE
    // ======================================

    securityScore.textContent =
        score;


    // ======================================
    // SCORE CARD
    // ======================================

    const scoreCard =
        securityScore.closest(
            ".score-card"
        );


    if (scoreCard) {


        scoreCard.classList.remove(
            "score-safe",
            "score-warning",
            "score-critical"
        );


        if (
            score >= 70
        ) {

            scoreCard.classList.add(
                "score-safe"
            );

        }


        else if (
            score >= 40
        ) {

            scoreCard.classList.add(
                "score-warning"
            );

        }


        else {

            scoreCard.classList.add(
                "score-critical"
            );

        }

    }


    console.log(
        `🛡️ Security Score Updated: ${score}/100`
    );

}


// ==========================================
// AI ANALYSIS BUTTON
// ==========================================

if (analysisButton) {

    analysisButton.addEventListener(
        "click",
        () => {


            // ==================================
            // SHOW AI RESULT
            // ==================================

            if (aiResult) {

                aiResult.classList.add(
                    "show"
                );

            }


            // ==================================
            // NO THREATS
            // ==================================

            if (
                threats.length === 0
            ) {


                if (aiAssessment) {

                    aiAssessment.textContent =
                        "System is currently secure. No real-time threats have been detected.";

                }


                return;

            }


            // ==================================
            // LATEST THREAT
            // ==================================

            const latest =
                threats[0];


            let riskScore =
                35;


            let recommendation =
                "";


            // ==================================
            // HIGH
            // ==================================

            if (
                latest.severity === "HIGH"
            ) {

                riskScore =
                    92;


                recommendation =
                    "Immediately investigate login logs, enable MFA, and isolate affected accounts.";

            }


            // ==================================
            // MEDIUM
            // ==================================

            else if (
                latest.severity === "MEDIUM"
            ) {

                riskScore =
                    68;


                recommendation =
                    "Monitor network activity, verify connected devices, and review firewall events.";

            }


            // ==================================
            // LOW
            // ==================================

            else {

                riskScore =
                    28;


                recommendation =
                    "Threat was contained successfully. Continue routine monitoring.";

            }


            // ==================================
            // AI RESULT
            // ==================================

            if (aiAssessment) {

                aiAssessment.textContent =

                    `Threat: ${
                        latest.name ||
                        "Unknown"
                    } | ` +

                    `Severity: ${
                        latest.severity ||
                        "LOW"
                    } | ` +

                    `Risk Score: ${
                        riskScore
                    }/100.\n\n` +

                    `AI Recommendation: ${
                        recommendation
                    }`;

            }

        }
    );

}


// ==========================================
// INITIAL UI
// ==========================================

renderThreats();


// ==========================================
// CYBERTRACE READY
// ==========================================

console.log(
    "🟢 CyberTrace dashboard initialized successfully"
);