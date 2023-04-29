require('dotenv').config({ path: './config/.env' });
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const corsOptions = {
    Credential: 'true',
};
const cookieParser = require('cookie-parser');
const socketServer = require('./socketServer');

// App
const app = express();
app.use(express.json());
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));
app.use(cookieParser());

// Socket
const http = require('http').createServer(app);
const io = require('socket.io')(http);
io.on('connection', socket => {
    socketServer(socket);
});

// Routers
app.use('/api', require('./routers/adminRouter'));
app.use('/api', require('./routers/authRouter'));
app.use('/api', require('./routers/userRouter'));
app.use('/api', require('./routers/postRouter'));
app.use('/api', require('./routers/commentRouter'));
app.use('/api', require('./routers/notificationRouter'));

// Connect to DB
const URI = process.env.MONGODB_URL;
mongoose.connect(URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, err => {
    if (err) throw err;
    console.log("Successfully connected to MongoDB.");
});

// Running on port
const port = process.env.PORT;
http.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});