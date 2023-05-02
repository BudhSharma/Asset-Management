const mongoose = require("mongoose");

const asset = new mongoose.Schema(
  {
    checkIn: {
      type: String,
    },
    checkOut: {
      type: String,
    },
    disposed: {
      type: Boolean,
    },
    path: {
      type: String,
    },
    mimetype: {
      type: String,
    },
    assetId: {
      type: String,
    },
    purchased_from: {
      type: String,
    },
    purchased_date: {
      type: String,
    },
    description: {
      type: String,
    },
    serial_no: {
      type: String,
    },
    employee_code: {
      type: String,
    },
    brand: {
      type: String,
    },
    organization: {
      type: String,
    },
    cost: {
      type: String,
    },
    asset_type: {
      type: String,
    },
    department: {
      type: String,
    },
    employee_name: {
      type: String,
    },
    //Laptop/////////////////////////////////////////////////////////////////////////////////////////////////
    processor: {
      type: String,
    },
    processor_gen: {
      type: String,
    },
    ram: {
      type: String,
    },
    ram_type: {
      type: String,
    },
    ram_slot1: {
      type: String,
    },
    ram_slot2: {
      type: String,
    },
    location: {
      type: String,
    },
    os_version: {
      type: String,
    },
    hard_disk: {
      type: String,
    },
    hard_disk_type: {
      type: String,
    },
    mouse: {
      type: String,
    },
    mouse_brand: {
      type: String,
    },
    keyboard: {
      type: String,
    },
    charger: {
      type: String,
    },
  },
  { timestamps: true }
);
const Asset = mongoose.model("Asset", asset);

module.exports = Asset;
