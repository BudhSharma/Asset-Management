const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    category:String
  },
  { timestamps: true }
);
const Category = mongoose.model("Category", fileSchema);

module.exports = Category;
