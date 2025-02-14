const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");
const path = require("path");

const app = express();
dotenv.config();
const port = process.env.PORT || 3000;

// Fix CORS issue by allowing frontend URL
app.use(cors({
    origin: ["http://localhost:5173"], // Allow frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());

app.use(require('./routes/auth'));
app.use(require('./routes/user'));
app.use(require('./routes/chat'));
app.use(require('./routes/message'));

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Database connected".yellow.bold);
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
};

connectDB();

const server = app.listen(port, () => {
    console.log(`Server is running at port ${port}`.cyan.bold);
});


const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
        if (userData?.userId) {
            socket.join(userData.userId);
            socket.emit("connected");
        }
    });

    socket.on("join chat", (room) => {
        console.log("Chat Room ID:", room);
        socket.join(room);
    });

    socket.on("new message", (newMessageReceived) => {
        console.log("New message received:", newMessageReceived);
        const chat = newMessageReceived.chat;

        if (!chat?.users) return console.log("Chat users not defined");

        chat.users.forEach(user => {
            if (user._id === newMessageReceived.sender._id) return;
            socket.to(user._id).emit("message received", newMessageReceived);
        });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});
