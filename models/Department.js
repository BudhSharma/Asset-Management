const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    department:String
  },
  { timestamps: true }
);
const Department = mongoose.model("Department", fileSchema);

module.exports = Department;
