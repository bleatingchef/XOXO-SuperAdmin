const express = require("express");
const router = express.Router();
// const upload = require("../middlewares/uploadMiddleware.js");
const upload = require ("../middlewares/uploadMiddleware.js")
const templateController = require("../controllers/superAdmin/templateController.js")

// POST - Create a new template
router.post(
  "/create",
  upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'mainImage', maxCount: 1 }]),
  templateController.createTemplate
);

// GET - Fetch all templates
router.get("/getall", templateController.getTemplates);

// GET - Fetch a single template by Title
router.get("/getsingle/:title", templateController.getTemplateByTitle);

// PUT - Update a template by Title
router.put(
  "/update/:title",
  upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'mainImage', maxCount: 1 }]),
  templateController.updateTemplateByTitle
);

// DELETE - Remove a template by Title
router.delete("/delete/:title", templateController.deleteTemplateByTitle);

module.exports = router;
