const isLogin = (req, res, next) => {
  // console.log(req.session);
  if (req.session.user == null || req.session.user == undefined) {
    req.flash("alertMessage", "Sesi Anda Telah Habis Silahkan Login Kembali !!");
    req.flash("alertStatus", "danger");
    res.redirect(`/admin/signin`);
  } else {
    next();
  }
};

module.exports = isLogin;
