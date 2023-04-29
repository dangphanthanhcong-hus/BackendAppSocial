const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
        },

        content: {
            type: String,
        },

        image: {
            id: {
                type: String,
            },
            url: {
                type: String,
            }
        },

        likes: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'user',
            }
        ],

        comments: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'comment',
            }
        ],
    },

    {
        timestamps: true,
    }
);

module.exports = mongoose.model('post', postSchema);