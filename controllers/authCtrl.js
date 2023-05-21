const Users = require('../models/userModel');

const jwt = require('jsonwebtoken');

const authCtrl = {
    register: async (req, res) => {
        try {
            const { fullname, emailAddress, phoneNumber, password } = req.body;

            const user_emailAddress = await Users.findOne({ emailAddress });
            if (user_emailAddress) {
                return res
                    .status(400)
                    .json({ msg: "This email address is already registered." });
            }

            const user_phoneNumber = await Users.findOne({ phoneNumber });
            if (user_phoneNumber) {
                return res
                    .status(400)
                    .json({ msg: "This phone number is already registered." });
            }

            const newUser = new Users({
                fullname,
                emailAddress,
                phoneNumber,
                password,
            });

            const access_token = createAccessToken({ id: newUser._id });
            const refresh_token = createRefreshToken({ id: newUser._id });

            res.cookie("refreshtoken", refresh_token, {
                httpOnly: true,
                path: "/api/refresh_token",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            await newUser.save();

            // auto follow
            await Users.updateMany(
                {},
                {
                    $push: {
                        following: newUser._id,
                        followers: newUser._id
                    }
                }
            );

            const newUserUpdated = await Users.findOne(
                { _id: newUser._id }
            );

            res.json({
                msg: "Registered successfully.",
                access_token,
                newUser: {
                    ...newUserUpdated._doc,
                    password: "",
                },
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    registerAdmin: async (req, res) => {
        try {
            const { fullname, emailAddress, phoneNumber, password } = req.body;

            const user_emailAddress = await Users.findOne({ emailAddress });
            if (user_emailAddress) {
                return res
                    .status(400)
                    .json({ msg: "This email address is already registered." });
            }

            const user_phoneNumber = await Users.findOne({ phoneNumber });
            if (user_phoneNumber) {
                return res
                    .status(400)
                    .json({ msg: "This phone number is already registered." });
            }

            const newUser = new Users({
                fullname,
                emailAddress,
                phoneNumber,
                password,
                role: 'admin',
            });

            await newUser.save();

            // auto follow
            await Users.updateMany(
                {},
                {
                    $push: {
                        following: newUser._id,
                        followers: newUser._id
                    }
                }
            );

            const newUserUpdated = await Users.findOne(
                { _id: newUser._id }
            );

            res.json({ msg: "Registered admin successfully." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    changePassword: async (req, res) => {
        try {
            const { oldPassword, newPassword } = req.body;
            const user = await Users.findOne({ _id: req.user._id }).select('+password');
            const isMatch = await user.comparePassword(oldPassword);

            if (!isMatch) {
                return res.status(400).json({ msg: "Wrong password." });
            }

            await Users.findOneAndUpdate(
                { _id: req.user._id },
                { password: newPassword }
            );

            res.json({ msg: "Password updated successfully." })
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    login: async (req, res) => {
        try {
            const { emailAddress, password } = req.body;

            const user = await Users.findOne({ emailAddress, role: 'user' }).select('+password')
                .populate('followers following');
            if (!user) {
                return res.status(400).json({ msg: "Email address or password is incorrect." });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(400).json({ msg: "Email address or password is incorrect." });
            }

            const access_token = createAccessToken({ id: user._id });
            const refresh_token = createRefreshToken({ id: user._id });

            res.cookie("refreshtoken", refresh_token, {
                httpOnly: true,
                path: "/api/refresh_token",
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.json({
                msg: "Logged in successfully.",
                access_token,
                user: {
                    ...user._doc,
                    password: "",
                },
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    loginAdmin: async (req, res) => {
        try {
            const { emailAddress, password } = req.body;

            const user = await Users.findOne({ emailAddress, role: 'admin' }).select('+password');
            if (!user) {
                return res.status(400).json({ msg: "Email address or password is incorrect." });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(400).json({ msg: "Email address or password is incorrect." });
            }

            const access_token = createAccessToken({ id: user._id });
            const refresh_token = createRefreshToken({ id: user._id });

            res.cookie("refreshtoken", refresh_token, {
                httpOnly: true,
                path: "/api/refresh_token",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.json({
                msg: "Logged in as admin successfully.",
                access_token,
                user: {
                    ...user._doc,
                    password: "",
                },
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    logout: async (req, res) => {
        try {
            res.clearCookie("refreshtoken", { path: "/api/refresh_token" });
            return res.json({ msg: "Logged out successfully." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    generateAccessToken: async (req, res) => {
        try {
            const rf_token = req.cookies.refreshtoken;

            if (!rf_token) {
                return res.status(400).json({ msg: "Please login again." });
            }

            jwt.verify(
                rf_token,
                process.env.REFRESH_TOKEN_SECRET,
                async (err, result) => {
                    if (err) {
                        res.status(400).json({ msg: "Please login again." });
                    }

                    const user = await Users.findOne(
                        { _id: result.id }
                    )
                        .populate('followers following');

                    if (!user) {
                        res.status(400).json({ msg: "This user does not exist." });
                    }

                    const access_token = createAccessToken({ id: result.id });
                    res.json({ access_token, user });
                }
            );
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
    });
};

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "30d",
    });
};

module.exports = authCtrl;