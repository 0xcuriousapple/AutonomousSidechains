var express = require("express");
var router = express.Router();
global.pubsubmain;
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("v-index", { title: "Autonomous Sidechains" });
});

module.exports = router;
