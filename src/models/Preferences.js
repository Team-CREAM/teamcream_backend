const mongoose = require('mongoose');
const preferencesSchema = new mongoose.Schema({
    vegan: {
        type: Boolean,
        default: false
    },
    vegetarian: {
        type: Boolean,
        default: false
    },
    dairyFree: {
        type: Boolean,
        default: false
    },
    glutenFree: {
        type: Boolean,
        default: false
    },
    keepMeSignedIn: {
        type: Boolean,
        default: false
    },
    intolerables: {
        type: [String],
        default: null
    },
    metric: {
        type: Boolean,
        default: false
    }
})

mongoose.model('Preferences', preferencesSchema);
module.exports = preferencesSchema;


