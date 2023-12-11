// User Document Schema

const mongoose = require('mongoose');

var Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {type: String, required: true},
    email: {type: String, required: true},
    passwordHash: {type: String, required: true},
    role: {type: String, required: true},
    reputation: {type: Number, required: true, default: 0},
    timeJoined: {type: Date, required: true},
    upvoted_posts: [{type: String}],
    downvoted_posts: [{type: String}]
})

const User = mongoose.model('Users', userSchema);

module.exports = User;