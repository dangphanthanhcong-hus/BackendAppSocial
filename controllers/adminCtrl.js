const Users = require('../models/userModel');
const Posts = require('../models/postModel');
const Comments = require('../models/commentModel');

const adminCtrl = {
    getTotalUsers: async (req, res) => {
        try {
            const users = await Users.find();
            const total_users = users.length;
            res.json({ total_users });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getTotalPosts: async (req, res) => {
        try {
            const posts = await Posts.find();
            const total_posts = posts.length;
            res.json({ total_posts });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getTotalComments: async (req, res) => {
        try {
            const comments = await Comments.find();
            const total_comments = comments.length;
            res.json({ total_comments });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getTotalLikes: async (req, res) => {
        try {
            const posts = await Posts.find();
            let total_likes = 0;
            await posts.map((post) => (total_likes += post.likes.length));
            res.json({ total_likes });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = adminCtrl;