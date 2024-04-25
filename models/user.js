const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    // fruits: [{ type: mongoose.Types.ObjectId, ref: 'Fruit'}]
})

module.exports = mongoose.model('User', userSchema)