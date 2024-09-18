const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
  logo: { type: String, required: true },
  mainImage: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  buttonName: { type: String, required: true }
});

const Template = mongoose.model("Template", templateSchema);

module.exports = { Template };
