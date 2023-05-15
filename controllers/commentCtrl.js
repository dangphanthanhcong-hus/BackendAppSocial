const Posts = require('../models/postModel');
const Comments = require('../models/commentModel');

const commentCtrl = {
    createComment: async (req, res) => {
        try {
            const { post, reply, content } = req.body;

            const findedPost = await Posts.findOne(
                { _id: post }
            );

            if (!findedPost) {
                return res.status(400).json({ msg: "This post does not exist." });
            }

            if (reply) {
                const comment = await Comments.findOne(
                    { _id: reply }
                );

                if (!comment) {
                    return res.status(400).json({ msg: "This comment does not exist." });
                }
            }

            const newComment = new Comments({
                post,
                user: req.user._id,
                reply,
                content,
            });

            await newComment.save();

            res.json({
                msg: "Comment created successfully.",
                newComment: {
                    ...newComment._doc,
                    user: req.user
                }
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    updateComment: async (req, res) => {
        try {
            const { content } = req.body;

            const updatedComment = await Comments.findOneAndUpdate(
                { _id: req.params.id, user: req.user._id },
                { content }
            );

            if (!updatedComment) {
                return res.status(400).json({ msg: "This comment does not exist." });
            }

            res.json({
                msg: "Comment updated successfully.",
                updatedComment: {
                    ...updatedComment._doc,
                    user: req.user
                }
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    likeComment: async (req, res) => {
        try {
            const comment = await Comments.findOne({
                _id: req.params.id,
                likes: req.user._id,
            });

            if (comment.length > 0) {
                return res
                    .status(400)
                    .json({ msg: "You have already liked this comment." });
            }

            const likedComment = await Comments.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { likes: req.user._id } },
                { new: true }
            );

            if (!likedComment) {
                return res.status(400).json({ msg: "This comment does not exist." });
            }

            res.json({
                msg: "Comment liked successfully.",
                likedComment: {
                    ...likedComment._doc,
                    user: req.user
                }
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    unlikeComment: async (req, res) => {
        try {
            const unlikedComment = await Comments.findOneAndUpdate(
                { _id: req.params.id },
                { $pull: { likes: req.user._id } },
                { new: true }
            );

            if (!unlikedComment) {
                return res.status(400).json({ msg: "This comment does not exist." });
            }

            res.json({
                msg: "Comment unliked successfully.",
                unlikedComment: {
                    ...unlikedComment._doc,
                    user: req.user
                }
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    deleteComment: async (req, res) => {
        try {
            const deletedComment = await Comments.findOneAndDelete({
                _id: req.params.id, user: req.user._id
            });

            await Posts.findOneAndUpdate(
                { _id: updatedComment.post },
                { $pull: { comments: req.params.id } },
                { new: true }
            );

            if (!deletedComment) {
                return res.status(400).json({ msg: "This comment does not exist." });
            }

            res.json({ msg: "Comment deleted successfully." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = commentCtrl;