// User Document Schema

const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const Roles = {
    STANDARD_USER: 'STANDARD_USER', 
    ADMIN: 'ADMIN'
}

const userSchema = new Schema({
    username: {type: String, required: true},
    email: {type: String, required: true},
    passwordHash: {type: String, required: true},
    role: {type: String, enum: Roles, required: true},
    reputation: {type: Number, required: true, default: 0},
    timeJoined: {type: Date, required: true}
})

const User = mongoose.model('Users', userSchema);

module.exports = User