let users = [];
let admins = [];

const socketServer = (socket) => {
    // Connection
    socket.on('joinUser', (id) => {
        users.push({ id, socketId: socket.id });
    });

    socket.on('joinAdmin', (id) => {
        admins.push({ id, socketId: socket.id });
        const admin = admins.find((admin) => admin.id === id);
        let totalActiveUsers = users.length;

        socket.to(`${admin.socketId}`).emit('activeUsers', totalActiveUsers);
    });

    socket.on('disconnect', () => {
        users = users.filter((user) => user.socketId !== socket.id);
        admins = admins.filter((user) => user.socketId !== socket.id);
    });


    // Follow
    socket.on('follow', (newUser) => {
        const user = users.find((user) => user.id === newUser._id);
        user && socket.to(`${user.socketId}`).emit('followToClient', newUser);
    });

    socket.on('unfollow', (newUser) => {
        const user = users.find((user) => user.id === newUser._id);
        user && socket.to(`${user.socketId}`).emit('unfollowToClient', newUser);
    });


    // Like
    socket.on('likePost', (newPost) => {
        let ids = [...newPost.user.followers, newPost.user._id];
        const clients = users.filter((user) => ids.includes(user.id));
        if (clients.length > 0) {
            clients.forEach((client) => {
                socket.to(`${client.socketId}`).emit('likeToClient', newPost);
            });
        };
    });

    socket.on('unlikePost', (newPost) => {
        let ids = [...newPost.user.followers, newPost.user._id];
        const clients = users.filter((user) => ids.includes(user.id));
        if (clients.length > 0) {
            clients.forEach((client) => {
                socket.to(`${client.socketId}`).emit('unlikeToClient', newPost);
            });
        };
    });


    // Comment
    socket.on('createComment', (newPost) => {
        let ids = [...newPost.user.followers, newPost.user._id];
        const clients = users.filter((user) => ids.includes(user.id));
        if (clients.length > 0) {
            clients.forEach((client) => {
                socket.to(`${client.socketId}`).emit('createCommentToClient', newPost);
            });
        };
    });

    socket.on('deleteComment', (newPost) => {
        let ids = [...newPost.user.followers, newPost.user._id];
        const clients = users.filter((user) => ids.includes(user.id));
        if (clients.length > 0) {
            clients.forEach((client) => {
                socket.to(`${client.socketId}`).emit('deleteCommentToClient', newPost);
            });
        };
    });


    // Notification
    socket.on('createNotification', (msg) => {
        const clients = users.filter((user) => msg.receivers.includes(user.id));
        if (clients.length > 0) {
            clients.forEach((client) => {
                socket.to(`${client.socketId}`).emit('createNotificationToClient', msg);
            });
        };
    });

    socket.on('removeNotification', (msg) => {
        const clients = users.filter((user) => msg.receivers.includes(user.id));
        if (clients.length > 0) {
            clients.forEach((client) => {
                socket.to(`${client.socketId}`).emit('removeNotificationToClient', msg);
            });
        };
    });


    // Active Users
    socket.on("getActiveUsers", (id) => {
        const admin = admins.find((user) => user.id === id);
        const totalActiveUsers = users.length;
        socket.to(`${admin.socketId}`).emit("getActiveUsersToClient", totalActiveUsers);
    });

}

module.exports = socketServer;