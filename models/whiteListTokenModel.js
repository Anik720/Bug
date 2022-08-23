const mongoose = require("mongoose");

const whiteTokenSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  refreshToken: {
    type: String,

    trim: true,
  },
});

const WhiteToken = mongoose.model("WhiteToken", whiteTokenSchema);

module.exports = WhiteToken;
