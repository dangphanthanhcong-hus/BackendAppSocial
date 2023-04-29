const Users = require('../models/userModel');

const cloudinary = require('cloudinary')
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const userCtrl = {
    searchUser: async (req, res) => {
        try {
            const users = await Users.findOne({
                fullname: { $regex: req.query.fullname }
            })
                .limit(10)
                .select('fullname avatar');

            res.json({ users });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getUser: async (req, res) => {
        try {
            const user = await Users.findOne(
                { _id: req.params.id }
            )
                .populate('followers following');

            if (!user) {
                return res.status(400).json({ msg: "This user does not exist." });
            }

            res.json({ user });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    updateUser: async (req, res) => {
        try {
            const { fullname, birth, gender, address } = req.body;

            if (!fullname) {
                return res.status(400).json({ msg: "Full name must not be empty." });
            }

            const updatedUser = await Users.findOneAndUpdate(
                { _id: req.user._id },
                { fullname, birth, gender, address }
            );

            if (!updatedUser) {
                return res.status(400).json({ msg: "This user does not exist." });
            }

            res.json({ msg: "Profile updated successfully." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    updateAvatar: async (req, res) => {
        try {
            const imageFile = req.files.image.tempFilePath;

            if (!imageFile) {
                return res.status(400).json({ msg: "Avatar must not be empty." });
            }

            if (req.user.avatar.id !== "zr9ugp") {
                await cloudinary.v2.uploader.destroy(req.user.avatar.id)
            };

            const mycloud = await cloudinary.v2.uploader.upload(imageFile);

            const avatar = {
                id: mycloud.public_id,
                url: mycloud.secure_url,
            };

            const updatedUser = await Users.findOneAndUpdate(
                { _id: req.user._id },
                { avatar }
            );

            if (!updatedUser) {
                return res.status(400).json({ msg: "This user does not exist." });
            }

            res.json({ msg: "Avatar updated successfully." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    follow: async (req, res) => {
        try {
            const user = await Users.findOne({
                _id: req.params.id,
                followers: req.user._id,
            });

            if (user.length > 0)
                return res
                    .status(400)
                    .json({ msg: "You are already followed this user." });

            const followedUser = await Users.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { followers: req.user._id } },
                { new: true }
            );

            if (!followedUser) {
                return res.status(400).json({ msg: "This user does not exist." });
            }

            res.json({ msg: "You are now following this user." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    unfollow: async (req, res) => {
        try {
            const unfollowedUser = await Users.findOneAndUpdate(
                { _id: req.params.id },
                { $pull: { followers: req.user._id } },
                { new: true }
            );

            if (!unfollowedUser) {
                return res.status(400).json({ msg: "This user does not exist." });
            }

            res.json({ msg: "You are now unfollowing this user." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = userCtrl;