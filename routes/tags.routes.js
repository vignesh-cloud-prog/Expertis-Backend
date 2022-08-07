const tagController = require("../controllers/tag.controller");

const express = require("express");
const router = express.Router();

router.post("", tagController.createTag);
router.get("", tagController.getTags);
router.patch("", tagController.updateTag);
router.delete("/:id", tagController.deleteTag);

module.exports = router;
