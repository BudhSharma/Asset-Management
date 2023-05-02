const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      require: true,
    },
    country: {
      type: String,
      require: true,
    },
    address: {
      type: String,
      require: true,
    },
    city: {
      type: String,
      require: true,
    },
    state: {
      type: String,
      require: true,
    },
    postal_code: {
      type: String,
      require: true,
    },
    timezone: {
      type: String,
      require: true,
    },
    curruncy_symbol: {
      type: String,
      require: true,
    },
    financial_year: {
      type: String,
      require: true,
    },
    path: {
      type: String,
      require: true,
    },
    mimetype: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);
const Company = mongoose.model("Company", fileSchema);

module.exports = Company;
