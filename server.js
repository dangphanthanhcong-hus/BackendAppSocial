// Config
const dotenv = require('dotenv');
dotenv.config({
    path: './config/config.env'
});

const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// App
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const cors = require('cors');
const corsOptions = {
    Credential: 'true',
};
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

const fileUpload = require('express-fileupload');
app.use(
    fileUpload({
        useTempFiles: true
    })
);

// Socket
const socketServer = require('./socketServer');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
io.on('connection', socket => {
    socketServer(socket);
});

// Routers
app.get('/', (req, res) => {
    res.send("Server is working.")
});
app.use('/api', require('./routers/adminRouter'));
app.use('/api', require('./routers/authRouter'));
app.use('/api', require('./routers/userRouter'));
app.use('/api', require('./routers/postRouter'));
app.use('/api', require('./routers/commentRouter'));
app.use('/api', require('./routers/notificationRouter'));

// Connect to DB
const mongoose = require('mongoose');
const URI = process.env.MONGODB_URI;
mongoose.connect(URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if (err) throw err;
    console.log("Successfully connected to MongoDB.");
});

// Running on port
const port = process.env.PORT;
http.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});