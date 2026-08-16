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

const PORT = 3000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());


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