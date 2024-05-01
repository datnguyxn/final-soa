import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        lowercase: true,
        required: true,
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        default: 'STAFF',
    },
    active: {
        type: Boolean,
        default: false,
    },
    isLocked: {
        type: Boolean,
        default: false,
    },
    logging: {
        type: Boolean,
        default: false,
    },
    token: {
        type: String
    },
    refreshToken: {
        type: String
    },
}, {timestamps: true});

const User = mongoose.model('User', userSchema);

export default User;