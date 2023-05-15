const Posts = require('../models/postModel');
const Comments = require('../models/commentModel');

const cloudinary = require('cloudinary');

class APIfeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    paginating() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 9;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

const postCtrl = {
    createPost: async (req, res) => {
        try {
            const { content } = req.body;
            const imageFile = req.files.image.tempFilePath;

            if (!imageFile || !content) {
                return res.status(400).json({ msg: "Content or image must not be empty." });
            }

            const mycloud = await cloudinary.v2.uploader.upload(imageFile);

            const image = {
                id: mycloud.public_id,
                url: mycloud.secure_url,
            };

            const newPost = new Posts({
                user: req.user._id,
                content,
                image,
            });

            await newPost.save();

            res.json({
                msg: "Post created successfully.",
                newPost: {
                    ...newPost._doc,
                    user: req.user
                }
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getPost: async (req, res) => {
        try {
            const post = await Posts.findOne(
                { _id: req.params.id }
            )
                .populate('user likes', 'avatar fullname followers')
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'user likes',
                    },
                });

            if (!post) {
                return res.status(400).json({ msg: "This post does not exist." });
            }

            res.json({ post });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    updatePost: async (req, res) => {
        try {
            const { content } = req.body;
            const imageFile = req.files.image.tempFilePath;

            if (!imageFile || !content) {
                return res.status(400).json({ msg: "Content or image must not be empty." });
            }

            const post = await Posts.findOne(
                { _id: req.params.id, user: req.user._id },
            );

            if (post.image.id != null) {
                await cloudinary.v2.uploader.destroy(post.image.id)
            };

            const mycloud = await cloudinary.v2.uploader.upload(imageFile);

            const image = {
                id: mycloud.public_id,
                url: mycloud.secure_url,
            };

            const updatedPost = await Posts.findOneAndUpdate(
                { _id: req.params.id, user: req.user._id },
                { content, image }
            );

            if (!updatedPost) {
                return res.status(400).json({ msg: "This post does not exist." });
            }

            res.json({
                msg: "Post updated successfully.",
                updatedPost: {
                    ...updatedPost._doc,
                    user: req.user
                }
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    likePost: async (req, res) => {
        try {
            const post = await Posts.findOne({
                _id: req.params.id,
                likes: req.user._id,
            });

            if (post.length > 0) {
                return res
                    .status(400)
                    .json({ msg: "You have already liked this post." });
            }

            const likedPost = await Posts.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { likes: req.user._id } },
                { new: true }
            );

            if (!likedPost) {
                return res.status(400).json({ msg: "This post does not exist." });
            }

            res.json({
                msg: "Post liked successfully.",
                likedPost: {
                    ...likedPost._doc,
                    user: req.user
                }
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    unlikePost: async (req, res) => {
        try {
            const unlikedPost = await Posts.findOneAndUpdate(
                { _id: req.params.id },
                { $pull: { likes: req.user._id } },
                { new: true }
            );

            if (!unlikedPost) {
                return res.status(400).json({ msg: "This post does not exist." });
            }

            res.json({
                msg: "Post unliked successfully.",
                unlikedPost: {
                    ...unlikedPost._doc,
                    user: req.user
                }
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    deletePost: async (req, res) => {
        try {
            const deletedPost = await Posts.findOneAndDelete({
                _id: req.params.id, user: req.user._id
            });

            await Comments.deleteMany({ _id: { $in: deletedPost.comments } });

            if (!deletedPost) {
                return res.status(400).json({ msg: "This post does not exist." });
            }

            res.json({ msg: "Post deleted successfully." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getUserPosts: async (req, res) => {
        try {
            const features = new APIfeatures(
                Posts.find({ user: req.params.id }),
                req.query
            ).paginating();

            const posts = await features.query
                .sort('-createdAt')
                .populate('user likes', 'avatar fullname followers')
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'user likes',
                    },
                });

            res.json({
                msg: "Successfully.",
                posts,
                result: posts.length,
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getFeedPosts: async (req, res) => {
        try {
            const features = new APIfeatures(
                Posts.find({
                    user: [...req.user.following, req.user._id],
                }),
                req.query
            ).paginating();

            const posts = await features.query
                .sort('-createdAt')
                .populate('user likes', 'avatar fullname followers')
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'user likes',
                    },
                });

            res.json({
                msg: "Successfully.",
                posts,
                result: posts.length,
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getDiscoverPost: async (req, res) => {
        try {
            const posts = await Posts.aggregate([
                { $match: { user: { $nin: [...req.user.following, req.user._id] } } },
                { $sample: { size: Number(req.query.num || 8) } },
            ]);

            res.json({
                msg: "Successfully.",
                posts,
                result: posts.length,
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = postCtrl;