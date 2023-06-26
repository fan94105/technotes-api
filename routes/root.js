const express = require("express")
const router = express.Router()
const path = require("path")

// 響應 index.html 檔案
router.get("^/$|/index(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"))
})

module.exports = router
