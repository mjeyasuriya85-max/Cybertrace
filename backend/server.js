const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const PORT = process.env.PORT || 3000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());

app.set("trust proxy", 1);


// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {

    res.json({
        status: "CyberTrace backend running",
        port: PORT
    });

});


// ==========================================
// CONTACT FORM ROUTE
// ==========================================

const contactHits = new Map();

app.post("/api/contact", (req, res) => {

    const ip = req.ip;
    const now = Date.now();

    if (contactHits.size > 1000) {
        contactHits.clear();
    }

    const recent = (contactHits.get(ip) || [])
        .filter((time) => now - time < 60000);

    if (recent.length >= 3) {
        return res.status(429).json({
            ok: false,
            error: "Too many requests. Try again in a minute."
        });
    }

    recent.push(now);
    contactHits.set(ip, recent);

    const body = req.body || {};

    if (
        typeof body.name !== "string" ||
        typeof body.email !== "string" ||
        typeof body.message !== "string"
    ) {
        return res.status(400).json({
            ok: false,
            error: "Invalid form data."
        });
    }

    const name = body.name.trim();
    const email = body.email.trim();
    const message = body.message.trim();

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (
        !name || name.length > 80 ||
        !emailOk || email.length > 120 ||
        !message || message.length > 1000
    ) {
        return res.status(400).json({
            ok: false,
            error: "Please check name, email and message."
        });
    }

    console.log(
        "📩 New enquiry:",
        JSON.stringify({
            name,
            email,
            message,
            time: new Date().toISOString()
        })
    );

    res.status(201).json({ ok: true });

});


// ==========================================
// SOCKET CONNECTION
// ==========================================

io.on("connection", (socket) => {

    console.log(
        "🟢 Client connected:",
        socket.id
    );


    socket.on("disconnect", () => {

        console.log(
            "🔴 Client disconnected:",
            socket.id
        );

    });

});


// ==========================================
// TEST THREAT GENERATOR
// ==========================================

const threatTypes = [

    {
        name: "Suspicious Login",
        description:
            "Multiple authentication attempts detected",
        severity: "HIGH"
    },

    {
        name: "Unknown Device",
        description:
            "Unrecognized device connected to network",
        severity: "MEDIUM"
    },

    {
        name: "Abnormal Traffic",
        description:
            "Unusual network traffic pattern detected",
        severity: "MEDIUM"
    },

    {
        name: "Firewall Block",
        description:
            "Unauthorized connection successfully blocked",
        severity: "LOW"
    }

];


// ==========================================
// SEND RANDOM THREAT
// ==========================================

function generateThreat() {

    const threat =
        threatTypes[
            Math.floor(
                Math.random() *
                threatTypes.length
            )
        ];


    console.log(
        "🚨 Sending threat:",
        threat.name,
        "|",
        threat.severity
    );


    io.emit(
        "threatUpdate",
        threat
    );

}


// ==========================================
// TEST EVERY 10 SECONDS
// ==========================================

setInterval(
    generateThreat,
    10000
);


// ==========================================
// START SERVER
// ==========================================

server.listen(
    PORT,
    () => {

        console.log(
            `🟢 CyberTrace server running at http://localhost:${PORT}`
        );

    }
);