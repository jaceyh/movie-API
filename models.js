const mongoose = require('mongoose');

let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Director: [{type: mongoose.Schema.Types.ObjectId, ref: 'Director'},
    {type: mongoose.Schema.Types.ObjectId, ref: 'Director'}],
    Tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'},
    {type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}],
    ImagePath: {type: String},
    Description: {type: String, required: true},
    Featured: {type: Boolean}
});
