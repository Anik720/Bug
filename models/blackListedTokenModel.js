const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,

    trim: true,
  },
});

const BlackToken = mongoose.model("BlackToken", tokenSchema);

module.exports = BlackToken;
