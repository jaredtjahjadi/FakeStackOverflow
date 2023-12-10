// Tag Document Schema

const mongoose = require('mongoose');

var Schema = mongoose.Schema;

const tagSchema = new Schema({
    name: {type: String, required: true},
    created_by: {type: Schema.Types.ObjectId, ref: 'User'}
})

const Tag = mongoose.model('Tags', tagSchema);

tagSchema.virtual('url').get(function() {
    return 'post/tag/' + this._id
})

module.exports = Tag;