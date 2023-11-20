// Answer Document Schema

const mongoose = require('mongoose');

var Schema = mongoose.Schema;

const answerSchema = new Schema({
    text: {type: String, required: true},
    ans_by: {type: String, required: true},
    ans_date_time: {type: Date, default: new Date()}
})

const Answer = mongoose.model('Answers', answerSchema)

answerSchema.virtual('url').get(function() {
    return 'post/answer/' + this._id
})

module.exports = Answer;