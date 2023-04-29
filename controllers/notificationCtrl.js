const Notifications = require('../models/notificationModel');

const notificationCtrl = {
    createNotification: async (req, res) => {
        try {
            const { id, receivers, url, text, content, image } = req.body;

            if (receivers.includes(req.user._id.toString())) return;

            const notification = new Notifications({
                id,
                sender: req.user._id,
                receivers,
                url,
                text,
                content,
                image,
            });

            await notification.save();

            res.json({ msg: "Notification created successfully." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getAllNotification: async (req, res) => {
        try {
            const notifications = await Notifications.find({ receivers: req.user._id })
                .sort('-createdAt')
                .populate('sender', 'avatar fullname');

            res.json({ notifications });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    readNotification: async (req, res) => {
        try {
            const readNotification = await Notifications.findOneAndUpdate(
                { _id: req.params.id },
                { isRead: true }
            );

            if (!readNotification) {
                return res.status(400).json({ msg: "This notification does not exist." });
            }

            res.json({ msg: "Notification was read." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    deleteNotification: async (req, res) => {
        try {
            const deletedNotification = await Notifications.findOneAndDelete({
                id: req.params.id, url: req.query.url,
            });

            if (!deletedNotification) {
                return res.status(400).json({ msg: "This notification does not exist." });
            }

            res.json({ msg: "Notification deleted successfully." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    deleteAllNotification: async (req, res) => {
        try {
            await Notifications.deleteMany({ receivers: req.user._id });

            res.json({ msg: "Notifications deleted successfully." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = notificationCtrl;