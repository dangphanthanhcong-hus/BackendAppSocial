const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        post: {
            type: mongoose.Types.ObjectId,
            ref: 'post',
        },

        user: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
        },

        reply: {
            type: mongoose.Types.ObjectId,
            ref: 'comment',
        },

        content: {
            type: String,
            required: true,
        },

        likes: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'user',
            }
        ],
    },

    {
        timestamps: true,
    }
);

module.exports = mongoose.model('comment', commentSchema);