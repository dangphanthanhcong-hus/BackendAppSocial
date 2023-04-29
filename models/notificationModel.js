const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        id: {
            type: mongoose.Types.ObjectId,
        },

        sender: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
        },

        receivers: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'user',
            }
        ],

        url: {
            type: String,
        },

        text: {
            type: String,
        },

        content: {
            type: String,
        },

        image: {
            type: String,
        },

        isRead: {
            type: Boolean,
            default: false,
        },
    },

    {
        timestamps: true,
    }
);

module.exports = mongoose.model("notification", notificationSchema);