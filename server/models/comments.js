// Comment Document Schema

const mongoose = require('mongoose');

var Schema = mongoose.Schema;

const commentSchema = new Schema({
    text: {type: String, required: true},
    posted_by: {type: Schema.Types.ObjectId, ref: 'User'},
    com_date_time: {type: Date, default: new Date()},
    votes: {type: Number, default: 0}
})

const Comment = mongoose.model('Comments', commentSchema)

commentSchema.virtual('url').get(function() {
    return 'post/comment/' + this._id
})

module.exports = Comment;