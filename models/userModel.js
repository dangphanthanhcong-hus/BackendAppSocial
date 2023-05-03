const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 25,
        },

        emailAddress: {
            type: String,
            required: true,
            match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please enter a valid email address."],
            trim: true,
            unique: true,
        },

        phoneNumber: {
            type: String,
            required: true,
            match: [/(0[3|5|7|8|9])+([0-9]{8})\b/, "Please enter a valid phone number."],
            trim: true,
            unique: true,
        },

        password: {
            type: String,
            required: true,
            match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one number and one special character."],
            select: false,
        },

        role: {
            type: String,
            default: 'user',
        },

        avatar: {
            id: {
                type: String,
                default: "zr9ugp",
            },
            url: {
                type: String,
                default: "https://res.cloudinary.com/dm8loxxcm/image/upload/v1682232472/App%20Social/avatar/avatar_default_zr9ugp.jpg",
            }
        },

        birth: {
            type: Date,
            default: null,
        },

        gender: {
            type: String,
            default: null,
        },

        address: {
            type: String,
            default: null,
        },

        followers: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'user',
            }
        ],

        following: [
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

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
};

module.exports = mongoose.model('user', userSchema);