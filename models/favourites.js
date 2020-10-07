const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const dishes = require("./dishes");

const favouriteSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    dishes: [dishes.dishSchema],
  },
  {
    timestamps: true,
  }
);

const Favourites = mongoose.model('Favourite', favouriteSchema);
module.exports = Favourites;