const mongoose = require("mongoose");
const user = new mongoose.Schema({
    email: {type: String, unique: true},
    password: {type: String},
    authToken:{type: String}
      // authToken: {type:String}
    // createdd:{type:Date}
});
module.exports = mongoose.model('user', user);