const tagController = require("../controllers/tag.controller");

const express = require("express");
const router = express.Router();

router.post("", tagController.addTag);
router.get("", tagController.getTags);
router.put("", tagController.updateTag);
router.delete("/:id", tagController.deleteTag);



module.exports = router;
