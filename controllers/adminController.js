const { Sequelize, QueryTypes } = require("sequelize");
const sequelize = new Sequelize("portfolio", "root", "", {
  host: "localhost",
  dialect: "mysql" /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
});
const md5 = require("md5");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  viewSignin: async (req, res) => {
    try {
      // console.log(req.session);
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };
      if (req.session.user == null || req.session.user == undefined) {
        res.render("admin/index", {
          alert,
          title: "Signin",
        });
      } else {
        res.redirect(`/admin/signin`);
      }
    } catch (error) {
      console.log("erornya :", error);
      res.redirect(`/admin/signin`);
    }
  },

  actionSignin: async (req, res) => {
    try {
      // console.log(req.session);
      const { username, password } = req.body;
      const user = await sequelize.query(
        `SELECT * FROM user WHERE username = '${username}'`,
        {
          type: QueryTypes.SELECT,
        }
      );
      if (user.length > 0) {
        const isPasswordMatch = md5(password) == user[0].password;
        if (!isPasswordMatch) {
          req.flash("alertMessage", "Password yang anda masukan tidak cocok!!");
          req.flash("alertStatus", "danger");
          res.redirect(`/admin/signin`);
        } else {
          req.session.user = {
            nama: user[0].nama_user,
            level: user[0].level,
          };
          res.redirect(`/admin/profile`);
        }
      } else {
        req.flash("alertMessage", "User yang anda masukan tidak ada!!");
        req.flash("alertStatus", "danger");
        res.redirect(`/admin/signin`);
      }
    } catch (error) {
      console.log("erornya :", error);
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect(`/admin/signin`);
    }
  },

  actionLogout: async (req, res) => {
    try {
      req.session.destroy();
      res.redirect(`/admin/signin`);
    } catch (error) {
      console.log("erornya :", error);
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect(`/admin/signin`);
    }
  },

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  viewWorks: async (req, res) => {
    try {
      const works = await sequelize.query(
        `SELECT * FROM works w
        JOIN category c ON w.category=c.category_id
        ORDER BY works_id DESC`,
        {
          type: QueryTypes.SELECT,
        }
      );
      const category = await sequelize.query(`SELECT * FROM category`, {
        type: QueryTypes.SELECT,
      });
      res.render("admin/works/base", {
        title: "Works",
        users: req.session.user,
        works,
        category,
      });
    } catch (error) {
      console.log("erornya :", error);
      res.redirect(`/admin/signin`);
    }
  },

  addWorks: async (req, res) => {
    try {
      const { works_name, category, works_date, client, url, desc } = req.body;
      await sequelize.query(
        `INSERT INTO works (works_name, images, category, works_date, client, works_url, works_desc) VALUES ('${works_name}','${req.file.filename}', ${category}, '${works_date}', '${client}', '${url}', '${desc}')`,
        {
          type: QueryTypes.INSERT,
        }
      );
      res.redirect(`/admin/works`);
    } catch (error) {
      console.log("erornya :", error);
      res.redirect(`/admin/signin`);
    }
  },

  editWorks: async (req, res) => {
    try {
      const detail = await sequelize.query(
        `SELECT * FROM works WHERE works_id = ${req.params.id}`,
        {
          type: QueryTypes.SELECT,
        }
      );
      const detailImages = await sequelize.query(
        `SELECT * FROM works_detail_images WHERE works_id = ${req.params.id}`,
        {
          type: QueryTypes.SELECT,
        }
      );
      const category = await sequelize.query(`SELECT * FROM category`, {
        type: QueryTypes.SELECT,
      });
      res.render("admin/works/detail/base", {
        title: "Detail Works",
        users: req.session.user,
        detail,
        detailImages,
        category,
      });
    } catch (error) {
      console.log("erornya :", error);
      res.redirect(`/admin/signin`);
    }
  },

  deleteWorks: async (req, res) => {
    try {
      await sequelize.query(
        `DELETE FROM works WHERE works_id = '${req.params.id}'`,
        {
          type: QueryTypes.DELETE,
        }
      );
      res.redirect(`/admin/works`);
    } catch (error) {
      console.log("erornya :", error);
      res.redirect(`/admin/signin`);
    }
  },

  postDetailImages: async (req, res) => {
    try {
      const { worksID } = req.body;

      await sequelize.query(
        `INSERT INTO works_detail_images (works_id, images_url) VALUES ('${worksID}', '${req.file.filename}')`,
        {
          type: QueryTypes.INSERT,
        }
      );

      const detail = await sequelize.query(
        `SELECT * FROM works WHERE works_id = ${worksID}`,
        {
          type: QueryTypes.SELECT,
        }
      );
      const detailImages = await sequelize.query(
        `SELECT * FROM works_detail_images WHERE works_id = ${worksID}`,
        {
          type: QueryTypes.SELECT,
        }
      );

      res.render("admin/works/detail/list-detail", {
        title: "Detail Works",
        users: req.session.user,
        detail,
        detailImages,
      });
    } catch (error) {
      console.log("erornya :", error);
      res.redirect(`/admin/signin`);
    }
  },

  deleteDetailImages: async (req, res) => {
    try {
      const { works, id } = req.params;
      const detailGambarnya = await sequelize.query(
        `SELECT * FROM works_detail_images WHERE detail_id = ${id}`,
        { type: QueryTypes.SELECT }
      );
      const images = detailGambarnya[0].images_url;
      await sequelize.query(
        `DELETE FROM works_detail_images WHERE detail_id = ${id}`,
        { type: QueryTypes.DELETE }
      );
      fs.unlinkSync(path.join(__dirname, `../public/images/${images}`));
      // fs.unlink(path.join(`../images/${images}`));

      const detailImages = await sequelize.query(
        `SELECT * FROM works_detail_images WHERE works_id = ${works}`,
        { type: QueryTypes.SELECT }
      );
      const detail = await sequelize.query(
        `SELECT * FROM works WHERE works_id = ${works}`,
        {
          type: QueryTypes.SELECT,
        }
      );
      res.render("admin/works/detail/list-detail", {
        title: "Detail Works",
        users: req.session.user,
        detail,
        detailImages,
      });
      res.redirect(`/admin/works/${works}`);
    } catch (error) {
      console.log("erornya :", error);
    }
  },

  editDetail: async (req, res) => {
    try {
      const { works_id, works_name, category, works_date, client, url, desc } =
        req.body;
      if (req.file == undefined) {
        await sequelize.query(
          `UPDATE works SET works_name = '${works_name}', category = ${category}, works_date = '${works_date}', client = '${client}', works_url = '${url}', works_desc = '${desc}' WHERE works_id = ${works_id}`,
          {
            type: QueryTypes.UPDATE,
          }
        );
      } else {
        const detail = await sequelize.query(
          `SELECT * FROM works WHERE works_id = ${works_id}`,
          {
            type: QueryTypes.SELECT,
          }
        );
        fs.unlinkSync(
          path.join(__dirname, `../public/images/${detail[0].images}`)
        );
        await sequelize.query(
          `UPDATE works SET works_name = '${works_name}', category = ${category}, works_date = '${works_date}', client = '${client}', works_url = '${url}', works_desc = '${desc}', images = '${req.file.filename}' WHERE works_id = ${works_id}`,
          {
            type: QueryTypes.UPDATE,
          }
        );
      }
      res.redirect(`/admin/works`);
    } catch (error) {
      console.log("erornya :", error);
      res.redirect(`/admin/signin`);
    }
  },

  viewProfile: async (req, res) => {
    try {
      const profile = await sequelize.query(`SELECT * FROM profile`, {
        type: QueryTypes.SELECT,
      });
      res.render("admin/profile/base", {
        title: "Profile",
        users: req.session.user,
        profile,
      });
    } catch (error) {
      console.log("erornya :", error);
      res.redirect(`/admin/signin`);
    }
  },
  editProfile: async (req, res) => {
    try {
      const {
        name,
        birthday,
        email,
        phone,
        city,
        about,
        hobies,
        twitter,
        facebook,
        instagram,
        linkedin,
        github,
      } = req.body;
      await sequelize.query(
        `UPDATE profile SET name = "${name}", birthday = "${birthday}", email = "${email}", phone = "${phone}", city = "${city}", about = "${about}", hobies = "${hobies}", twitter = "${twitter}", facebook="${facebook}", instagram = "${instagram}", linkedin = "${linkedin}", github = "${github}"`,
        {
          type: QueryTypes.UPDATE,
        }
      );
      if (req.files.resume !== undefined) {
        await sequelize.query(
          `UPDATE profile SET resume_file = "${req.files.resume[0].filename}"`,
          {
            type: QueryTypes.UPDATE,
          }
        );
      }
      if (req.files.profileimg !== undefined) {
        await sequelize.query(
          `UPDATE profile SET profile_images = "${req.files.profileimg[0].filename}"`,
          {
            type: QueryTypes.UPDATE,
          }
        );
      }
      if (req.files.aboutimg !== undefined) {
        await sequelize.query(
          `UPDATE profile SET about_images = "${req.files.aboutimg[0].filename}"`,
          {
            type: QueryTypes.UPDATE,
          }
        );
      }
      res.redirect(`/admin/profile`);
    } catch (error) {
      console.log("erornya :", error);
      res.redirect(`/admin/signin`);
    }
  },

  viewResume: async (req, res) => {
    try {
      res.render("admin/resume/base", {
        title: "Resume",
        users: req.session.user,
      });
    } catch (error) {
      console.log("erornya :", error);
      res.redirect(`/admin/signin`);
    }
  },
};

//       res.redirect(`/admin/works/edit/${worksID}`);
//     } catch (error) {
//       console.log("erornya :", error);
//     }
//   },
// };
