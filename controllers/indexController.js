const { Sequelize, QueryTypes } = require("sequelize");
const sequelize = new Sequelize("portfolio", "root", "", {
  host: "localhost",
  dialect: "mysql" /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
});
const md5 = require("md5");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  viewIndex: async (req, res, next) => {
    try {
      const portfolio = await sequelize.query(
        `SELECT * FROM works w JOIN category c ON w.category=c.category_id ORDER BY works_id DESC`,
        {
          type: QueryTypes.SELECT,
        }
      );
      const category = await sequelize.query(`SELECT * FROM category`, {
        type: QueryTypes.SELECT,
      });
      res.render("home/viewHome", {
        message: "success",
        portfolio,
        category,
      });
    } catch (error) {
      console.log(error);
      res.redirect(`/`);
    }
  },
  viewDetail: async (req, res, next) => {
    try {
      const { id } = req.params;
      const detail = await sequelize.query(
        `SELECT * FROM works w JOIN category c ON w.category=c.category_id WHERE works_id = ${id}`,
        {
          type: QueryTypes.SELECT,
        }
      );
      const detailImages = await sequelize.query(
        `SELECT * FROM works_detail_images WHERE works_id = ${id}`,
        {
          type: QueryTypes.SELECT,
        }
      );
      console.log(detailImages);
      console.log(detail);
      res.render("details/viewDetails", {
        message: "success",
        detail,
        detailImages,
      });
    } catch (error) {
      console.log(error);
      res.redirect(`/`);
    }
  },
};
