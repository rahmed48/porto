// var express = require("express");
// var router = express.Router();
const router = require("express").Router();
const indexController = require("../controllers/indexController");
const adminController = require("../controllers/adminController");
const { upload, uploadMultiple } = require("../middlewares/multer");
const auth = require("../middlewares/auth");

/* GET home page. */
// router.get(`/`, function (req, res) {
//   res.redirect("/");
// });
router.get(`/`, indexController.viewIndex);
router.get(`/:id`, indexController.viewDetail);

router.get(`/admin`, adminController.admin);
router.get(`/admin/signin`, adminController.viewSignin);
router.post("/admin/signin", adminController.actionSignin);
router.use(auth);
router.get("/admin/logout", adminController.actionLogout);

router.get("/admin/works", adminController.viewWorks);
router.post("/admin/works", upload, adminController.addWorks);

router.get("/admin/works/:id/edit", adminController.editWorks);
router.post("/admin/works/:id", adminController.deleteWorks);

router.post("/admin/editDetail", upload, adminController.editDetail);
router.post("/admin/detailImages", upload, adminController.postDetailImages);

module.exports = router;
