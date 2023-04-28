const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
    },
    site: {
      type: String,
      require: true,
    },
    location: {
      type: String,
      require: true,
    },
    department: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);
const Employee = mongoose.model("Employee", fileSchema);

module.exports = Employee;
