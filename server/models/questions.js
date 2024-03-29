// Question Document Schema

const mongoose = require('mongoose');

var Schema = mongoose.Schema;

const questionSchema = new Schema({
    title: {type: String, required: true, maxLength: 100},
    summary: {type: String, required: true, maxLength: 140},
    text: {type: String, required: true, default: new Date()},
    tags: [{type: Schema.Types.ObjectId, ref: 'Tag', required: true}],
    answers: [{type: Schema.Types.ObjectId, ref: 'Answer'}],
    posted_by: {type: Schema.Types.ObjectId, ref: 'User'},
    ask_date_time: {type: Date, default: new Date()},
    views: {type: Number, default: 0},
    votes: {type: Number, default: 0},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
})

questionSchema.virtual('url').get(function() {
    return 'post/question/' + this._id
})

const Question = mongoose.model('Questions', questionSchema);

module.exports = Question