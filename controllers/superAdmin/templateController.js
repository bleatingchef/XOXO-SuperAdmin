// const { Template } = require("../models/templateModel");
const {Template} = require ("../../models/templateModel")

// Create a new template (POST)
exports.createTemplate = async (req, res) => {
  try {
    const { title, description, buttonName } = req.body;
    const logo = req.files.logo[0].path;  // Multer stores the path
    const mainImage = req.files.mainImage[0].path;

    const newTemplate = new Template({
      logo,
      mainImage,
      title,
      description,
      buttonName
    });

    await newTemplate.save();
    res.status(201).json({ message: "Template created successfully", newTemplate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all templates (GET)
exports.getTemplates = async (req, res) => {
  try {
    const templates = await Template.find();
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single template by Title (GET)
exports.getTemplateByTitle = async (req, res) => {
  try {
    const template = await Template.findOne({ title: req.params.title });
    if (!template) return res.status(404).json({ message: "Template not found" });

    res.status(200).json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a template by Title (PUT)
exports.updateTemplateByTitle = async (req, res) => {
  try {
    const { title, description, buttonName } = req.body;
    const updatedData = { title, description, buttonName };

    if (req.files.logo) {
      updatedData.logo = req.files.logo[0].path;
    }
    if (req.files.mainImage) {
      updatedData.mainImage = req.files.mainImage[0].path;
    }

    const updatedTemplate = await Template.findOneAndUpdate(
      { title: req.params.title },
      updatedData,
      { new: true }
    );

    if (!updatedTemplate) return res.status(404).json({ message: "Template not found" });

    res.status(200).json({ message: "Template updated successfully", updatedTemplate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a template by Title (DELETE)
exports.deleteTemplateByTitle = async (req, res) => {
  try {
    const deletedTemplate = await Template.findOneAndDelete({ title: req.params.title });
    if (!deletedTemplate) return res.status(404).json({ message: "Template not found" });

    res.status(200).json({ message: "Template deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
