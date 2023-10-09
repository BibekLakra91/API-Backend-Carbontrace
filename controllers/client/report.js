var mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
var auth = require("../../settings/auth");
var md5 = require("md5");
const timestamp = require("time-stamp");
let created_date = timestamp.utc("YYYY-MM-DD HH:mm:ss");
var Facility = require("../../models/Facility");
var Report = require("../../models/Report");
var Emission = require("../../models/Emission");
const ReportError = require("../../models/ReportError");
var Scope = require("../../models/Scope");
var EmissionCategory = require("../../models/EmissionCategory");
var EmissionSubCategory = require("../../models/EmissionSubCategory");
const ejs = require("ejs");
var Mail = require("../../utilities/mail");
var fs = require("fs");
var path = require("path");
var fastcsv = require("fast-csv");
const csv = require("csv-parser");
var moment = require("moment");
let ses = require('node-ses')
//const sgMail = require('@sendgrid/mail');
//Controller for signup
const addReport = async (req, res) => {
  try {
    if (!req.body) {
      return res.send({
        status: 500,
        message: "Note content can not be empty",
      });
    }
    let ch4 = await Emission.findOne({
      formula: "CH4",
    }).exec();
    let n2o = await Emission.findOne({
      formula: "N2O",
    }).exec();

    var Emission_data = [];
    let upprcase = await stringUpprcase(req.body.name);

    if (req.body.custom_factor == "Yes") {
      Emission_data = await Emission.find({
        name: upprcase,
      }).exec();
    }
    if (Emission_data.length > 0) {
      return res.json({
        status: 400,
        message: "Fuel/Name already exit",
      });
    } else {
      let token = req.headers.authorization;
      var decoded = jwt.verify(token, auth.jwtSecret);
      if (req.body.custom_factor == "Yes") {
        let upprcase1 = await stringUpprcase(req.body.sub_category);

        var Emission_data1 = await EmissionSubCategory.find({
          name: upprcase1,
        }).exec();
        if (Emission_data1.length > 0) {
          return res.json({
            status: 400,
            message: "Subcategory already exit",
          });
        } else {
          const EmissionSubCategorys = new EmissionSubCategory({
            created_by: decoded.id,
            category: req.body.category,
            name: upprcase1,
            subdomain: req.decoded.subdomain,
            created_at: created_date,
            updated_at: created_date,
          });
          let sub_data = await EmissionSubCategorys.save();
          req.body.sub_category = sub_data._id;

          const Emissions = new Emission({
            created_by: decoded.id,
            scope_id: req.body.scope_id ? req.body.scope_id : null,
            category: req.body.category ? req.body.category : null,
            sub_category: req.body.sub_category ? req.body.sub_category : null,
            name: upprcase,
            heat_content: req.body.heat_content ? req.body.heat_content : null,
            co2_factor: req.body.co2_factor ? req.body.co2_factor : null,
            ch4_factor: req.body.ch4_factor ? req.body.ch4_factor : null,
            n2o_factor: req.body.n2o_factor ? req.body.n2o_factor : null,
            co2_unit: req.body.co2_unit ? req.body.co2_unit : null,
            ch4_unit: req.body.ch4_unit ? req.body.ch4_unit : null,
            n2o_unit: req.body.n2o_unit ? req.body.n2o_unit : null,
            biogenic: req.body.biogenic ? req.body.biogenic : null,
            ar4: req.body.ar4 ? req.body.ar4 : null,
            ar5: req.body.ar5 ? req.body.ar5 : null,
            unit: req.body.unit ? req.body.unit : null,
            chemical_name: req.body.chemical_name
              ? req.body.chemical_name
              : null,
            formula: req.body.formula ? req.body.formula : null,
            gas: req.body.gas ? req.body.gas : null,
            verifier: req.body.verifier
              ? req.body.verifier
              : null,
            verifier_name: req.body.verifier_name
              ? req.body.verifier_name
              : null,
            verifier_email: req.body.verifier_email
              ? req.body.verifier_email
              : null,
            status: req.body.verifier == "Yes" ? 0 : 1,
            biofuel: req.body.biofuel ? req.body.biofuel : null,
            subdomain: req.decoded.subdomain,
            created_at: created_date,
            updated_at: created_date,
          });
          // Save User in the database
          let emi_data = await Emissions.save();
          req.body.name = emi_data._id;
        }
      }

      req.body.heat_content = req.body.heat_content ? req.body.heat_content : 1;
      req.body.co2_factor = req.body.co2_factor ? req.body.co2_factor : 1;
      req.body.ch4_factor = req.body.ch4_factor ? req.body.ch4_factor : 1;
      req.body.n2o_factor = req.body.n2o_factor ? req.body.n2o_factor : 1;
      let co2_result = parseFloat(
        req.body.quantity * req.body.co2_factor * req.body.heat_content
      );
      if (req.body.co2_unit == "Gm") {
        co2_result = co2_result / 1000;
      }
      let ch4_result = parseFloat(
        req.body.quantity *
          req.body.ch4_factor *
          req.body.heat_content *
          ch4.ar4
      );
      if (req.body.ch4_unit == "Gm") {
        ch4_result = ch4_result / 1000;
      }
      let n2o_result = parseFloat(
        req.body.quantity *
          req.body.n2o_factor *
          req.body.heat_content *
          n2o.ar4
      );
      if (req.body.n2o_unit == "Gm") {
        n2o_result = n2o_result / 1000;
      }
      var total_equivalent = co2_result + ch4_result + n2o_result;

      // Create a User
      const Reports = new Report({
        created_by: decoded.id,
        scope_id: req.body.scope_id ? req.body.scope_id : null,
        category: req.body.category ? req.body.category : null,
        sub_category: req.body.sub_category ? req.body.sub_category : null,
        name: req.body.name ? req.body.name : null,
        heat_content: req.body.heat_content ? req.body.heat_content : null,
        co2_factor: req.body.co2_factor ? req.body.co2_factor : null,
        ch4_factor: req.body.ch4_factor ? req.body.ch4_factor : null,
        n2o_factor: req.body.n2o_factor ? req.body.n2o_factor : null,
        co2_unit: req.body.co2_unit ? req.body.co2_unit : null,
        ch4_unit: req.body.ch4_unit ? req.body.ch4_unit : null,
        n2o_unit: req.body.n2o_unit ? req.body.n2o_unit : null,
        biogenic: req.body.biogenic ? req.body.biogenic : null,
        ar4: req.body.ar4 ? req.body.ar4 : null,
        ar5: req.body.ar5 ? req.body.ar5 : null,
        unit: req.body.unit ? req.body.unit : null,
        chemical_name: req.body.chemical_name ? req.body.chemical_name : null,
        formula: req.body.formula ? req.body.formula : null,
        gas: req.body.gas ? req.body.gas : null,
        biofuel: req.body.biofuel ? req.body.biofuel : null,
        facility_id: req.body.facility_id,
        subdomain: req.decoded.subdomain,
        custom_factor: req.body.custom_factor,
        verifier: req.body.verifier
              ? req.body.verifier
              : null,
        verifier_name: req.body.verifier_name ? req.body.verifier_name : null,
        verifier_email: req.body.verifier_email
          ? req.body.verifier_email.toLowerCase()
          : null,
        status: req.body.verifier == "Yes" ? 0 : 1,
        quantity: req.body.quantity,
        equivalent: total_equivalent,
        date: req.body.date,
        date_string: req.body.date,
        created_at: created_date,
        updated_at: created_date,
      });
      // Save User in the database
      await Reports.save()
        .then(async (data) => {
          if (req.body.verifier == "Yes") {
            let reportData = await Report.findOne({ _id: data._id })
              .populate("category")
              .populate("sub_category")
              .populate("fuel")
              .populate("scope_id")
              .populate("facility_id")
              .populate("name");
            if (reportData) {
              let templatePath = path.join("./mail_template/");
              var compiled = ejs.compile(
                fs.readFileSync(
                  path.resolve(templatePath + "report.html"),
                  "utf8"
                )
              );
              var html = compiled({
                verifier_name: req.body.verifier_name,
                email: req.body.verifier_email.toLowerCase(),
                facility_id:
                  reportData.facility_id && reportData.facility_id.facility_id
                    ? reportData.facility_id.facility_id
                    : "Empty",
                scope_id:
                  reportData.scope_id && reportData.scope_id.name
                    ? reportData.scope_id.name
                    : "Empty",
                category:
                  reportData.category && reportData.category.name
                    ? reportData.category.name
                    : "Empty",
                sub_category:
                  reportData.sub_category && reportData.sub_category.name
                    ? reportData.sub_category.name
                    : "Empty",
                name:
                  reportData.name && reportData.name.name
                    ? reportData.name.name
                    : "Empty",
                heat_content: req.body.heat_content
                  ? req.body.heat_content
                  : "Empty",
                co2_factor: req.body.co2_factor ? req.body.co2_factor : "Empty",
                ch4_factor: req.body.ch4_factor ? req.body.ch4_factor : "Empty",
                n2o_factor: req.body.n2o_factor ? req.body.n2o_factor : "Empty",
                co2_unit: req.body.co2_unit ? req.body.co2_unit : "Empty",
                ch4_unit: req.body.ch4_unit ? req.body.ch4_unit : "Empty",
                n2o_unit: req.body.n2o_unit ? req.body.n2o_unit : "Empty",
                biogenic: req.body.biogenic ? req.body.biogenic : "Empty",
                ar4: req.body.ar4 ? req.body.ar4 : "Empty",
                ar5: req.body.ar5 ? req.body.ar5 : "Empty",
                unit: req.body.unit ? req.body.unit : "Empty",
                chemical_name: req.body.chemical_name
                  ? req.body.chemical_name
                  : "Empty",
                formula: req.body.formula ? req.body.formula : "Empty",
                gas: req.body.gas ? req.body.gas : "Empty",
                biofuel: req.body.biofuel ? req.body.biofuel : "Empty",
                quantity: req.body.quantity,
                equivalent: total_equivalent,
                accept_site_url: `${process.env.BASE_URL}/client/verification?id=${reportData._id}&status=1`,
                reject_site_url: `${process.env.BASE_URL}/client/verification?id=${reportData._id}&status=2`,
              });
              Mail.sendMailer({
                email: req.body.verifier_email.toLowerCase(),
                name:req.body.verifier_name,
                body: html,
                subject: "CO2 Report Verification",
              });
            }
          }

          return res.send({
            status: 200,
            message: "CO2 Report added successfully",
          });
        })
        .catch((err) => {
          console.log("error=========================>", err);
          return res.send({ status: 500, message: err.message });
        });
    }
  } catch (error) {
    return res.send({
      status: 500,
      message: "Something went wrong, please try again later!",
      error: error.message,
    });
  }
};

const GetAddReportData = async (req, res) => {
  try {
    let token = req.headers.authorization;
    let decoded = jwt.verify(token, auth.jwtSecret);
    let Emissions = await Emission.aggregate([
      {
        $match: { unit: { $ne: null } },
      },
      {
        $group: {
          _id: "$unit",
        },
      },
    ]);

    var Scopes = await Scope.find();
    var FacilityData = await Facility.find({ subdomain: decoded.subdomain });

    return res.send({
      status: 200,
      data: Emissions,
      scopes: Scopes,
      facility: FacilityData,
    });
  } catch (err) {
    return res.send({
      status: 500,
      message: "Something went wrong, please try again later!",
      error: err.message,
    });
  }
};

const GetScopeCategoryData = async (req, res) => {
  try {
    if (!req.query.id) {
      return res.send({ status: 200, data: [] });
    } else {
      var EmissionCategorys = await EmissionCategory.find({
        scope_id: req.query.id,
        name: { $ne: "Refrigerants" },
      });
      if (EmissionCategorys) {
        return res.send({ status: 200, data: EmissionCategorys });
      } else {
        return res.send({ status: 200, data: [] });
      }
    }
  } catch (err) {
    return res.send({
      status: 500,
      message: "Something went wrong, please try again later!",
      error: err.message,
    });
  }
};

const GetSubCategoryData = async (req, res) => {
  try {
    if (!req.query.id) {
      return res.send({ status: 200, data: [] });
    } else {
      var EmissionSubCategorys = await EmissionSubCategory.find({
        category: req.query.id,
      });
      var EmissionData = await Emission.find({ category: req.query.id });
      if (EmissionSubCategorys || EmissionData) {
        return res.send({
          status: 200,
          data: EmissionSubCategorys,
          EmissionData: EmissionData,
        });
      } else {
        return res.send({ status: 200, data: [] });
      }
    }
  } catch (err) {
    return res.send({
      status: 500,
      message: "Something went wrong, please try again later!",
      error: err.message,
    });
  }
};

const GetFuelData = async (req, res) => {
  try {
    if (!req.query.id) {
      return res.send({ status: 200, data: [] });
    } else {
      var EmissionCategorys = await Emission.find({
        sub_category: req.query.id,
      });
      if (EmissionCategorys) {
        return res.send({ status: 200, data: EmissionCategorys });
      } else {
        return res.send({ status: 200, data: [] });
      }
    }
  } catch (err) {
    return res.send({
      status: 500,
      message: "Something went wrong, please try again later!",
      error: err.message,
    });
  }
};

const GetEmissionData = async (req, res) => {
  try {
    if (!req.query.id) {
      return res.send({ status: 200, data: [] });
    } else {
      var EmissionCategorys = await Emission.findOne({ _id: req.query.id });
      if (EmissionCategorys) {
        return res.send({ status: 200, data: EmissionCategorys });
      } else {
        return res.send({ status: 200, data: [] });
      }
    }
  } catch (err) {
    return res.send({
      status: 500,
      message: "Something went wrong, please try again later!",
      error: err.message,
    });
  }
};

const GetReportData = async (req, res) => {
  try {
    var total = await Report.find();
    let perPage = parseInt(req.query.perpage);
    let page = req.query.page - 1;
    var Reports = await Report.find({ subdomain: req.decoded.subdomain })
      .populate("category")
      .populate("fuel")
      .populate("scope_id")
      .populate("facility_id")
      .populate("name")
      .limit(perPage)
      .skip(perPage * page)
      .sort({
        _id: "-1",
      });
    return res.send({ status: 200, data: Reports, total: total.length });
  } catch (err) {
    return res.send({
      status: 500,
      message: "Something went wrong, please try again later!",
      error: err.message,
    });
  }
};

const GetErrorReportData = async (req, res) => {
  try {
    var total = await ReportError.find();
    let perPage = parseInt(req.query.perpage);

    let page = req.query.page - 1;
    var Reports = await ReportError.find({ subdomain: req.decoded.subdomain })
      .limit(perPage)
      .skip(perPage * page)
      .sort({
        _id: "-1",
      });

    return res.send({ status: 200, data: Reports, total: total.length });
  } catch (err) {
    return res.send({
      status: 500,
      message: "Something went wrong, please try again later!",
      error: err.message,
    });
  }
};

const GetSingleReport = async (req, res) => {
  try {
    let Reports = await Report.findOne({ _id: req.params.id });
    let Emissions = await Emission.find({ category: Reports.category });
    let EmissionCategorys = await EmissionCategory.find({
      scope_id: Reports.scope_id,
    });
    let EmissionSubCategorys = await EmissionSubCategory.find({
      category: Reports.category,
    });

    if (Reports) {
      return res.send({
        status: 200,
        data: Reports,
        category: EmissionCategorys,
        emissions: Emissions,
        subcategory: EmissionSubCategorys,
      });
    } else {
      return res.send({ status: 400, message: "No Data found!" });
    }
  } catch (err) {
    return res.send({
      status: 500,
      message: "Something went wrong, please try again later!",
      error: err.message,
    });
  }
};

const VerifcationReport = async (req, res) => {
  try {
    // res.render('verification/index',{message:message});
    var r_data = await Report.find({
      _id: req.query.id,
      status: 0,
    }).exec();

    if (r_data.length > 0) {
      var update_data = {
        status: req.query.status,
        updated_at: created_date,
        approved_at: created_date,
      };

      await Report.updateOne({ _id: req.query.id }, update_data)
        .then(async (data) => {
          return res.send("Thanks for the Co2 report Verification!");
        })
        .catch((err) => {
          return res.send("Something went wrong, please try again later!");
        });
    } else {
      return res.send("Verification on this Co2 report already done!");
    }
  } catch (err) {
    return res.send("Something went wrong, please try again later!");
  }
};

const updateReport = async (req, res) => {
  try {
    if (!req.body) {
      return res.send({
        status: 500,
        message: "Note content can not be empty",
      });
    }
    let ch4 = await Emission.findOne({
      formula: "CH4",
    }).exec();
    let n2o = await Emission.findOne({
      formula: "N2O",
    }).exec();
    req.body.heat_content = req.body.heat_content ? req.body.heat_content : 1;
    req.body.co2_factor = req.body.co2_factor ? req.body.co2_factor : 1;
    req.body.ch4_factor = req.body.ch4_factor ? req.body.ch4_factor : 1;
    req.body.n2o_factor = req.body.n2o_factor ? req.body.n2o_factor : 1;
    let co2_result = parseFloat(
      req.body.quantity * req.body.co2_factor * req.body.heat_content
    );
    if (req.body.co2_unit == "Gm") {
      co2_result = co2_result / 1000;
    }
    let ch4_result = parseFloat(
      req.body.quantity * req.body.ch4_factor * req.body.heat_content * ch4.ar4
    );
    if (req.body.ch4_unit == "Gm") {
      ch4_result = ch4_result / 1000;
    }
    let n2o_result = parseFloat(
      req.body.quantity * req.body.n2o_factor * req.body.heat_content * n2o.ar4
    );
    if (req.body.n2o_unit == "Gm") {
      n2o_result = n2o_result / 1000;
    }
    var total_equivalent = co2_result + ch4_result + n2o_result;

    var update_data = {
      name: req.body.name ? req.body.name : null,
      heat_content: req.body.heat_content ? req.body.heat_content : null,
      co2_factor: req.body.co2_factor ? req.body.co2_factor : null,
      ch4_factor: req.body.ch4_factor ? req.body.ch4_factor : null,
      n2o_factor: req.body.n2o_factor ? req.body.n2o_factor : null,
      co2_unit: req.body.co2_unit ? req.body.co2_unit : null,
      ch4_unit: req.body.ch4_unit ? req.body.ch4_unit : null,
      n2o_unit: req.body.n2o_unit ? req.body.n2o_unit : null,
      biogenic: req.body.biogenic ? req.body.biogenic : null,
      ar4: req.body.ar4 ? req.body.ar4 : null,
      ar5: req.body.ar5 ? req.body.ar5 : null,
      unit: req.body.unit ? req.body.unit : null,
      chemical_name: req.body.chemical_name ? req.body.chemical_name : null,
      formula: req.body.formula ? req.body.formula : null,
      gas: req.body.gas ? req.body.gas : null,
      biofuel: req.body.biofuel ? req.body.biofuel : null,
      facility_id: req.body.facility_id,
      subdomain: req.decoded.subdomain,
      quantity: req.body.quantity,
      equivalent: total_equivalent,
      verifier: req.body.verifier
              ? req.body.verifier
              : null,
      verifier_email:req.body.verifier_email,
      verifier_name:req.body.verifier_name,
      date: req.body.date,
      date_string: req.body.date,
      updated_at: created_date,
    };

    let oldReport = await Report.findOne({_id:req.params.id})
    let old_verifier_email = "";
    if(oldReport){
      if(oldReport.verifier_email !== null && oldReport.verifier_email !== req.body.verifier_email){
        console.log("Old and Current email is different")
        old_verifier_email = oldReport.verifier_email
      }else{

      }
    }else{

    }
    await Report.updateOne({ _id: req.params.id }, update_data)
      .then(async (data) => {
        let reportData = await Report.findOne({ _id: req.params.id })
            .populate("category")
            .populate("sub_category")
            .populate("fuel")
            .populate("scope_id")
            .populate("facility_id")
            .populate("name");
        if(reportData && old_verifier_email !== ""){
          let templatePath = path.join("./mail_template/");
          var compiled = ejs.compile(
              fs.readFileSync(
                  path.resolve(templatePath + "report.html"),
                  "utf8"
              )
          );
          var html = compiled({
            verifier_name: req.body.verifier_name,
            email: req.body.verifier_email.toLowerCase(),
            facility_id:
                reportData.facility_id && reportData.facility_id.facility_id
                    ? reportData.facility_id.facility_id
                    : "Empty",
            scope_id:
                reportData.scope_id && reportData.scope_id.name
                    ? reportData.scope_id.name
                    : "Empty",
            category:
                reportData.category && reportData.category.name
                    ? reportData.category.name
                    : "Empty",
            sub_category:
                reportData.sub_category && reportData.sub_category.name
                    ? reportData.sub_category.name
                    : "Empty",
            name:
                reportData.name && reportData.name.name
                    ? reportData.name.name
                    : "Empty",
            heat_content: req.body.heat_content
                ? req.body.heat_content
                : "Empty",
            co2_factor: req.body.co2_factor ? req.body.co2_factor : "Empty",
            ch4_factor: req.body.ch4_factor ? req.body.ch4_factor : "Empty",
            n2o_factor: req.body.n2o_factor ? req.body.n2o_factor : "Empty",
            co2_unit: req.body.co2_unit ? req.body.co2_unit : "Empty",
            ch4_unit: req.body.ch4_unit ? req.body.ch4_unit : "Empty",
            n2o_unit: req.body.n2o_unit ? req.body.n2o_unit : "Empty",
            biogenic: req.body.biogenic ? req.body.biogenic : "Empty",
            ar4: req.body.ar4 ? req.body.ar4 : "Empty",
            ar5: req.body.ar5 ? req.body.ar5 : "Empty",
            unit: req.body.unit ? req.body.unit : "Empty",
            chemical_name: req.body.chemical_name
                ? req.body.chemical_name
                : "Empty",
            formula: req.body.formula ? req.body.formula : "Empty",
            gas: req.body.gas ? req.body.gas : "Empty",
            biofuel: req.body.biofuel ? req.body.biofuel : "Empty",
            quantity: req.body.quantity,
            equivalent: total_equivalent,
            accept_site_url: `${process.env.BASE_URL}/client/verification?id=${reportData._id}&status=1`,
            reject_site_url: `${process.env.BASE_URL}/client/verification?id=${reportData._id}&status=2`,
          });
          Mail.sendMailer({
            email: req.body.verifier_email.toLowerCase(),
            body: html,
            subject: "Co2 Report Verification",
          });
        }
        return res.send({
          data: data,
          status: 200,
          message: "Report updated successfully",
        });
      })
      .catch((err) => {
        console.log("error=========================>", err);
        return res.send({
          status: 400,
          message: "Something went wrong, please try again later!",
          error: err.message,
        });
      });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Something went wrong, please try again later!",
      error: err.message,
    });
  }
};

const stringUpprcase = async (str) => {
  console.log(str.toString().toLowerCase().split(" "), "hellooooooooo");
  var splitStr = str.toLowerCase().split(" ");
  for (var i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  // Directly return the joined string
  return splitStr.join(" ");
};

const csvUploadReport = async (req, res) => {
  try {
  
    // var user_data = await Egrid.find({
    // }).sort({zip: 1}).exec();
    // return res.json({
    //   status: 200,
    //   data: user_data,

    //   message: "Users added successfully",
    // });
    if (
      typeof req.file == "undefined" &&
      typeof req.fileValidationError == "undefined"
    ) {
      return res.json({
        status: 400,
        message: "Please select file!",
      });
    } else {
      const results = [];
      const dir = path.join(
        __dirname,
        "..",
        "..",
        "uploads",
        req.file.filename
      );

      await ReportError.deleteMany();

      fs.createReadStream(dir)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          var array = [];
          let resolvedAllergy = await Promise.all(
            results.map(async (item) => {
              // var user_data = await Emission.find({
              //   name: item.name
              // }).exec();
              const errors = [];
              // console.log("item", item);
              console.log(item["co2_factor"],'hellooooooooooooooooooooooooooooo');
              let scopeExist = null;
              let message = null;
              if (item["Scope Id"]) {
                let sco = await stringUpprcase(item["Scope Id"]);
                scopeExist = await Scope.findOne({
                  name: sco,
                });

                // scope = scopeExist ? scopeExist : new Scope({
                //   name:item["Scope Id"],
                //   created_at: created_date,
                // updated_at: created_date,
                // })

                if (!scopeExist) {
                  errors.push({
                    messageType: "Not Matched",
                    messageText: "Scope Id does not match",
                  });
                }
              } else {
                errors.push({
                  messageType: "Incomplete",
                  messageText: "Scope is required!",
                });
              }
              let facilityExist = null;
              if (item["Facility id"]) {
                facilityExist = await Facility.findOne({
                  facility_id: item["Facility id"],
                });
                if (!facilityExist) {
                  errors.push({
                    messageType: "Not Matched",
                    messageText: "Facility Id does not match",
                  });
                }
              } else {
                errors.push({
                  messageType: "Incomplete",
                  messageText: "Facility id is required",
                });
              }

              let categoryExist = null;

              if (item["Category"]) {
                const cat = await stringUpprcase(item["Category"]);
                categoryExist = await EmissionCategory.findOne({
                  name: cat,
                });

                if (!categoryExist) {
                  if (!scopeExist) {
                  } else {
                    let category = {
                      scope_id: scopeExist._id,
                      name: cat,
                      created_at: created_date,
                      updated_at: created_date,
                    };
                    category = await EmissionCategory.register(category);
                  }
                }
              } else {
                errors.push({
                  messageType: "Incomplete",
                  messageText: "category is required",
                });
              }
              let subCategoryExist = null;

              if (item["Sub Category"]) {
                const sub = await stringUpprcase(item["Sub Category"]);
                subCategoryExist = await EmissionSubCategory.findOne({
                  name: sub,
                });
                if (!subCategoryExist) {
                  if (!categoryExist) {
                  } else {
                    let subCategory = {
                      category: categoryExist._id,
                      name: sub,
                      created_at: created_date,
                      updated_at: created_date,
                    };
                    subCategory = await EmissionSubCategory.register(
                      subCategory
                    );
                  }
                }
              }

              if (!item["Quantity"]) {
                errors.push({
                  messageType: "Not Found",
                  messageText: "Quantity is not given",
                });
              }

              if (!item["Date"]) {
                errors.push({
                  messageType: "Not Given",
                  messageText: "Date is not given",
                });
              }

              let fuelExist = null;

              if (item["Fuel/Name"]) {
                let fuel = await stringUpprcase(item["Fuel/Name"]);
                fuelExist = await Emission.findOne({
                  name: fuel,
                });
                if (!fuelExist) {
                  if (!categoryExist || !scopeExist) {
                  } else {
                    let emission = {
                      scope_id: scopeExist._id,
                      category: categoryExist._id,
                      sub_category: subCategoryExist
                        ? subCategoryExist._id
                        : null,
                      name: fuel,
                      heat_content: item["Heat Content"]
                        ? item["Heat Content"]
                        : null,
                      co2_factor: item["Co2 Factor"]
                        ? item["Co2 Factor"]
                        : null,
                      ch4_factor: item["Ch4 Factor"]
                        ? item["Ch4 Factor"]
                        : null,
                      n2o_factor: item["N2o Factor"]
                        ? item["N2o Factor"]
                        : null,
                      biogenic: item["Biogenic"] ? item["Biogenic"] : null,
                      ar4: item["Ar4"] ? item["Ar4"] : null,
                      ar5: item["Ar5"] ? item["Ar5"] : null,
                      unit: item["Unit"] ? item["Unit"] : null,
                      chemical_name: item["Chemical Name"]
                        ? item["Chemical Name"]
                        : null,
                      formula: item["Formula"] ? item["Formula"] : null,
                      gas: item["Gas"] ? item["Gas"] : null,
                      biofuel: item["Biofuel"] ? item["Biofuel"] : null,
                      created_at: created_date,
                      updated_at: created_date,
                      created_by: req.decoded ? req.decoded.id : null,
                      subdomain: req.decoded ? req.decoded.subdomain : null,
                      co2_unit: item["Co2 Unit"] ? item["Co2 Unit"] : null,
                      ch4_unit: item["Ch4 Unit"] ? item["Ch4 Unit"] : null,
                      n2o_unit: item["N2o Unit"] ? item["N2o Unit"] : null,
                    };
                    fuelExist = await Emission.register(emission);
                  }
                }
              } else {
                errors.push({
                  messageType: "Incomplete",
                  messageText: "Fuel/Name is required",
                });
              }

              let fieldsToCheck = {};
              if (scopeExist)
                fieldsToCheck = {
                  ...fieldsToCheck,
                  scope_id: scopeExist._id.toString(),
                };
              if (facilityExist)
                fieldsToCheck = {
                  ...fieldsToCheck,
                  facility_id: facilityExist._id.toString(),
                };
              if (categoryExist)
                fieldsToCheck = {
                  ...fieldsToCheck,
                  category: categoryExist._id.toString(),
                };
              if (fuelExist)
                fieldsToCheck = {
                  ...fieldsToCheck,
                  name: fuelExist._id.toString(),
                };

              if (item["Date"]) {
                const date =
                  moment(new Date(item["Date"])).format("YYYY-MM-DD") +
                  "T00:00:00.000+00:00";
                console.log("date ", date);
                fieldsToCheck = {
                  ...fieldsToCheck,
                  date: date,
                };
              }

              console.log("fieldssssssssssssssssss ", fieldsToCheck);

              const isDuplicate = await Report.find(fieldsToCheck);

              if (isDuplicate && isDuplicate.length) {
                errors.push({
                  messageType: "Already Found",
                  messageText: "Report already exist",
                });
              }

              if (errors && errors.length) {
                // console.log("errorrs ", errors);
                let error = {
                  facility_id: item["Facility id"] ? item["Facility id"] : null,
                  scope_id: item["Scope Id"] ? item["Scope Id"] : null,
                  category: item["Category"] ? item["Category"] : null,
                  sub_category: item["Sub Category"]
                    ? item["Sub Category"]
                    : null,
                  name: item["Fuel/Name"] ? item["Fuel/Name"] : null,
                  created_by: req.decoded ? req.decoded.id : null,
                  quantity: item["Quantity"] ? item["Quantity"] : null,
                  equivalent: item["Co2 Equivalent"]
                    ? item["Co2 Equivalent"]
                    : null,
                  date_string: item["Date"]
                    ? moment(new Date(item["Date"])).format("YYYY-MM-DD")
                    : null,
                  date: item["Date"]
                    ? moment(new Date(item["Date"])).format("YYYY-MM-DD")
                    : null,
                  heat_content: item["Heat Content"]
                    ? item["Heat Content"]
                    : null,
                  custom_factor: "Yes",
                  co2_factor: item["Co2 Factor"] ? item["Co2 Factor"] : null,
                  co2_unit: item["Co2 Unit"] ? item["Co2 Unit"] : null,
                  ch4_factor: item["Ch4 Factor"] ? item["Ch4 Factor"] : null,
                  ch4_unit: item["Ch4 Unit"] ? item["Ch4 Unit"] : null,
                  n2o_factor: item["N2o Factor"] ? item["N2o Factor"] : null,
                  n2o_unit: item["N2o Unit"] ? item["N2o Unit"] : null,
                  biogenic: item["Biogenic"] ? item["Biogenic"] : null,
                  biofuel: item["Biofuel"] ? item["Biofuel"] : null,
                  formula: item["Formula"] ? item["Formula"] : null,
                  gas: item["Gas"] ? item["Gas"] : null,
                  chemical_name: item["Chemical Name"]
                    ? item["Chemical Name"]
                    : null,

                  error: errors,
                  subdomain: req.decoded ? req.decoded.subdomain : null,
                  ar4: item["Ar4"] ? item["Ar4"] : null,
                  ar5: item["Ar5"] ? item["Ar5"] : null,
                  unit: item["Unit"] ? item["Unit"] : null,
                  created_at: created_date,
                  updated_at: created_date,
                };

                const errorReport = await ReportError.register(error);
                return { isError: true, data: errorReport };
              } else {
                // if(user_data.length == 0)
                // {
                  let ch4 = await Emission.findOne({
                    formula: "CH4",
                  }).exec();
                  let n2o = await Emission.findOne({
                    formula: "N2O",
                  }).exec();
                  item["Heat Content"] = item["Heat Content"]  ? item["Heat Content"] : 1;
                  item["Co2 Factor"] = item["Co2 Factor"] ? item["Co2 Factor"] : 1;
                  item["Ch4 Factor"] = item["Ch4 Factor"] ? item["Ch4 Factor"] : 1;
                  item["N2o Factor"] = item["N2o Factor"] ? item["N2o Factor"] : 1;
                  let co2_result = parseFloat(
                  item["Quantity"] * item["Co2 Factor"] * item["Heat Content"]
                  );
                  if (item["Co2 Unit"] == "Gm") {
                  co2_result = co2_result / 1000;
                  }
                  let ch4_result = parseFloat(
                  item["Quantity"] *
                      item["Ch4 Factor"] *
                      item["Heat Content"] *
                      ch4.ar4
                  );
                  if (item["Ch4 Unit"] == "Gm") {
                  ch4_result = ch4_result / 1000;
                  }
                  let n2o_result = parseFloat(
                  item["Quantity"] *
                      item["N2o Factor"] *
                      item["Heat Content"] *
                      n2o.ar4
                  );
                  if (item["N2o Unit"] == "Gm") {
                  n2o_result = n2o_result / 1000;
                  }
                  var total_equivalent = co2_result + ch4_result + n2o_result;
                const data = await Report.register({
                  scope_id: scopeExist ? scopeExist._id : null,
                  category: categoryExist ? categoryExist._id : null,
                  sub_category: subCategoryExist ? subCategoryExist._id : null,
                  name: fuelExist ? fuelExist._id : null,
                  heat_content: fuelExist ? fuelExist.heat_content : null,
                  co2_factor: fuelExist ? fuelExist.co2_factor : null,
                  ch4_factor: fuelExist ? fuelExist.ch4_factor : null,
                  n2o_factor: fuelExist ? fuelExist.n2o_factor : null,
                  biogenic: fuelExist ? fuelExist.biogenic : null,
                  ar4: fuelExist ? fuelExist.ar4 : null,
                  ar5: fuelExist ? fuelExist.ar5 : null,
                  unit: fuelExist ? fuelExist.unit : null,
                  chemical_name: fuelExist ? fuelExist.chemical_name : null,
                  formula: fuelExist ? fuelExist.formula : null,
                  gas: fuelExist ? fuelExist.gas : null,
                  biofuel: fuelExist ? fuelExist.biofuel : null,
                  created_at: created_date,
                  updated_at: created_date,

                  facility_id: facilityExist ? facilityExist._id : null,

                  created_by: req.decoded ? req.decoded._id : null,
                  quantity: item["Quantity"] ? item["Quantity"] : null,
                  equivalent: total_equivalent
                    ? total_equivalent
                    : null,
                  date_string: moment(new Date(item["Date"])).format(
                    "YYYY-MM-DD"
                  ),
                  date: moment(new Date(item["Date"])).format("YYYY-MM-DD"),

                  custom_factor: "Yes",

                  co2_unit: fuelExist ? fuelExist.co2_unit : null,

                  ch4_unit: fuelExist ? fuelExist.ch4_unit : null,

                  n2o_unit: fuelExist ? fuelExist.n2o_unit : null,

                  verifier: null,
                  verifier_name: null,
                  verifier_email: null,
                  subdomain: req.decoded ? req.decoded.subdomain : null,
                  status: 1,
                });
                // }
                return { isError: false, data: data };
              }
            })
          );

          console.log("allergyyyyyyyyyyyyyy", resolvedAllergy);

          return res.json({
            status: 200,
            data: resolvedAllergy,

            message: "Users added successfully",
          });
        });
    }
  } catch (err) {
    return res.json({
      status: 500,
      message: err.message,
    });
  }
};

const exportSummaryReportOfLastFiveYear = async (req,res)=>{
  try{
    const scopeOne = await Scope.findOne({name:"Scope 1"})
    const scopeTwo = await Scope.findOne({name:"Scope 2"})
    const scopeThree = await Scope.findOne({name:"Scope 3"});
    let returnYear = (year)=>{
      let x = new Date(year, 0, 1);
      let xPlusOne = new Date(year+1, 0, 1);
      let xPlusTwo = new Date(year+2, 0, 1);
      let xPlusThree = new Date(year+3, 0, 1);
      let xPlusFour = new Date(year+4, 0, 1);
      let xPlusFive = new Date(year+5, 0, 1);

      let startYear = moment(x).format("YYYY-MM-DD"); // 15
      let startYearPlusOne = moment(xPlusOne).format("YYYY-MM-DD"); //16
      let startYearPlusTwo = moment(xPlusTwo).format("YYYY-MM-DD");//17
      let startYearPlusThree = moment(xPlusThree).format("YYYY-MM-DD");//18
      let startYearPlusFour = moment(xPlusFour).format("YYYY-MM-DD");//19
      let startYearPlusFive = moment(xPlusFive).format("YYYY-MM-DD");//20

      return {
        startYear,
        startYearPlusOne,
        startYearPlusTwo,
        startYearPlusThree,
        startYearPlusFour,
        startYearPlusFive
      }
    }
    const {
      startYear,
      startYearPlusFive
    } = returnYear(new Date().getFullYear()-4)

    const returnAvgEquivalent = (reports)=>{
      if(reports.length===0){
        return 0
      }else{
        let totalEquivalent = 0
        for (const report of reports) {
          console.log(report.equivalent,'sdadasdassssssssssssssssssssssssssss')
          totalEquivalent += parseFloat(report.equivalent);
        }
        let data_co2 = parseFloat(totalEquivalent / reports.length)
        console.log(data_co2,'ddddddddddddddddddddddddddddddddddddddd');
        if(data_co2 > 0)
        {
          return data_co2;
        }
        else
        {
          return 0;
        }
        
      }
    }

    let makeClusterYearWise = (reports)=>{
      let fifthYear = new Date().getFullYear();
      let reportsInFirstYear = reports.filter((report)=>{
        let reportCreateYear = new Date(report.created_at).getFullYear();
        return reportCreateYear === (fifthYear - 4)
      });

      let avgEmissionInFirstYear = returnAvgEquivalent(reportsInFirstYear);

      let reportsIn2ndYear = reports.filter((report)=>{
        let reportCreateYear = new Date(report.created_at).getFullYear();
        return reportCreateYear ===  (fifthYear - 3)
      });

      let avgEmissionIn2ndYear = returnAvgEquivalent(reportsIn2ndYear);

      let reportsIn3rdYear = reports.filter((report)=>{
        let reportCreateYear = new Date(report.created_at).getFullYear();
        return reportCreateYear === (fifthYear - 2)
      });

      let avgEmissionIn3rdYear = returnAvgEquivalent(reportsIn3rdYear);

      let reportsIn4thYear = reports.filter((report)=>{
        let reportCreateYear = new Date(report.created_at).getFullYear();
        return reportCreateYear === (fifthYear - 1)
      });

      let avgEmissionIn4thYear = returnAvgEquivalent(reportsIn4thYear);

      let reportsIn5thYear = reports.filter((report)=>{
        let reportCreateYear = new Date(report.created_at).getFullYear();
        return reportCreateYear === fifthYear
      });

      let avgEmissionIn5thYear = returnAvgEquivalent(reportsIn5thYear);

      return {
        avgEmissionInFirstYear,
        avgEmissionIn2ndYear,
        avgEmissionIn3rdYear,
        avgEmissionIn4thYear,
        avgEmissionIn5thYear
      }
    }

    const allCategories = await EmissionCategory.find({})

    let scopeOneDataByCategory = [];
    for (const category of allCategories) {
      const scopeOneData = await Report.find({
        "scope_id": {"$in":scopeOne?._id},
        date_string: { $gte: startYear, $lt: startYearPlusFive },
        category:category._id
      })
      const obj = {
        scope:"Scope 1",
        category:category,
      }
      if(scopeOneData.length!==0){
        const {
          avgEmissionInFirstYear,
          avgEmissionIn2ndYear,
          avgEmissionIn3rdYear,
          avgEmissionIn4thYear,
          avgEmissionIn5thYear
        } = makeClusterYearWise(scopeOneData);
        scopeOneDataByCategory.push({...obj,avgEmissionInFirstYear,avgEmissionIn2ndYear,avgEmissionIn3rdYear,avgEmissionIn4thYear,avgEmissionIn5thYear})
      }
    }
    let scopeTwoDataByCategory = [];
    for (const category of allCategories) {
      const scopeTwoData = await Report.find({
        "scope_id": {"$in":scopeTwo?._id},
        date_string: { $gte: startYear, $lt: startYearPlusFive },
        category:category._id
      })
      const obj = {
        scope:"Scope 2",
        category:category,
      }
      if(scopeTwoData.length!==0){
        const {
          avgEmissionInFirstYear,
          avgEmissionIn2ndYear,
          avgEmissionIn3rdYear,
          avgEmissionIn4thYear,
          avgEmissionIn5thYear
        } = makeClusterYearWise(scopeTwoData);
        scopeTwoDataByCategory.push({...obj,avgEmissionInFirstYear,avgEmissionIn2ndYear,avgEmissionIn3rdYear,avgEmissionIn4thYear,avgEmissionIn5thYear})
      }
    }
    let scopeThreeDataByCategory = [];
    for (const category of allCategories) {
      const scopeThreeData = await Report.find({
        "scope_id": {"$in":scopeThree?._id},
        date_string: { $gte: startYear, $lt: startYearPlusFive },
        category:category._id
      })
      const obj = {
        scope:"Scope 3",
        category:category,
      }
      if(scopeThreeData.length!==0){
        const {
          avgEmissionInFirstYear,
          avgEmissionIn2ndYear,
          avgEmissionIn3rdYear,
          avgEmissionIn4thYear,
          avgEmissionIn5thYear
        } = makeClusterYearWise(scopeThreeData);
        scopeThreeDataByCategory.push({...obj,avgEmissionInFirstYear,avgEmissionIn2ndYear,avgEmissionIn3rdYear,avgEmissionIn4thYear,avgEmissionIn5thYear})
      }
    }
    // scope, activity type, 2018, 2019, 2020, 2021, 2022, 2023
    let fifthYear = new Date().getFullYear();
    let mainData = [
      {
        scope:"scope",
        "activity type":"Activity type",
        avgEmissionInFirstYear:`${fifthYear-4}`,
        avgEmissionIn2ndYear:`${fifthYear-3}`,
        avgEmissionIn3rdYear:`${fifthYear-2}`,
        avgEmissionIn4thYear:`${fifthYear-1}`,
        avgEmissionIn5thYear:`${fifthYear}`
      }
    ]

    let putEmptySpaces = (arr)=>{
      for (let i = 0; i < 2; i++) {
        arr.push({
          scope:"",
          "activity type":"",
          avgEmissionInFirstYear:"",
          avgEmissionIn2ndYear:"",
          avgEmissionIn3rdYear:"",
          avgEmissionIn4thYear:"",
          avgEmissionIn5thYear:""
        })
      }
    }
    await scopeOneDataByCategory.forEach((val,index)=>{
      if(index===0){
        mainData.push({
          scope:val.scope,
          "activity type":val.category.name,
          avgEmissionInFirstYear:val.avgEmissionInFirstYear,
          avgEmissionIn2ndYear:val.avgEmissionIn2ndYear,
          avgEmissionIn3rdYear:val.avgEmissionIn3rdYear,
          avgEmissionIn4thYear:val.avgEmissionIn4thYear,
          avgEmissionIn5thYear:val.avgEmissionIn5thYear,
        })
      }else{
        mainData.push({
          scope:"",
          "activity type":val.category.name,
          avgEmissionInFirstYear:val.avgEmissionInFirstYear,
          avgEmissionIn2ndYear:val.avgEmissionIn2ndYear,
          avgEmissionIn3rdYear:val.avgEmissionIn3rdYear,
          avgEmissionIn4thYear:val.avgEmissionIn4thYear,
          avgEmissionIn5thYear:val.avgEmissionIn5thYear,
        })
      }
    })
    putEmptySpaces(mainData)

    await scopeTwoDataByCategory.forEach((val,index)=>{
      if(index===0){
        mainData.push({
          scope:val.scope,
          "activity type":val.category.name,
          avgEmissionInFirstYear:val.avgEmissionInFirstYear,
          avgEmissionIn2ndYear:val.avgEmissionIn2ndYear,
          avgEmissionIn3rdYear:val.avgEmissionIn3rdYear,
          avgEmissionIn4thYear:val.avgEmissionIn4thYear,
          avgEmissionIn5thYear:val.avgEmissionIn5thYear,
        })
      }else{
        mainData.push({
          scope:"",
          "activity type":val.category.name,
          avgEmissionInFirstYear:val.avgEmissionInFirstYear,
          avgEmissionIn2ndYear:val.avgEmissionIn2ndYear,
          avgEmissionIn3rdYear:val.avgEmissionIn3rdYear,
          avgEmissionIn4thYear:val.avgEmissionIn4thYear,
          avgEmissionIn5thYear:val.avgEmissionIn5thYear,
        })
      }
    })
    putEmptySpaces(mainData)

    await scopeThreeDataByCategory.forEach((val,index)=>{
      if(index===0){
        mainData.push({
          scope:val.scope,
          "activity type":val.category.name,
          avgEmissionInFirstYear:val.avgEmissionInFirstYear,
          avgEmissionIn2ndYear:val.avgEmissionIn2ndYear,
          avgEmissionIn3rdYear:val.avgEmissionIn3rdYear,
          avgEmissionIn4thYear:val.avgEmissionIn4thYear,
          avgEmissionIn5thYear:val.avgEmissionIn5thYear,
        })
      }else{
        mainData.push({
          scope:"",
          "activity type":val.category.name,
          avgEmissionInFirstYear:val.avgEmissionInFirstYear,
          avgEmissionIn2ndYear:val.avgEmissionIn2ndYear,
          avgEmissionIn3rdYear:val.avgEmissionIn3rdYear,
          avgEmissionIn4thYear:val.avgEmissionIn4thYear,
          avgEmissionIn5thYear:val.avgEmissionIn5thYear,
        })
      }
    })

    const dir = path.join(__dirname, "..", "..", "uploads", "dataOfLastFiveYear.csv");
    // console.log("dirrrrrrrrrrrrrr", dir);
    var ws = fs.createWriteStream(dir);
    fastcsv
        .write(mainData, { hearders: true })
        .on("finish", function () {
          return res.json({
            status: 200,
            data: process.env.BASE_URL + "/uploads/dataOfLastFiveYear.csv",
            message: "Report Exported successfully",
            report: mainData,
          });
        })
        .pipe(ws);
  }catch (error) {
    res.status(200).json({
      res:"success",
      data:error.message
    })
  }
}

const exportSummaryReport = async (req,res)=>{
    try{
        let startDate = moment(req.query.startDate).format("YYYY-MM-DD");
        let endDate = moment(req.query.endDate).format("YYYY-MM-DD");

        const scopeOne = await Scope.findOne({name:"Scope 1"})
        const scopeTwo = await Scope.findOne({name:"Scope 2"})
        const scopeThree = await Scope.findOne({name:"Scope 3"})
        const scopeOneData = await Report.find({
            "scope_id": {"$in":scopeOne?._id},
            date_string: { $gte: startDate, $lt: endDate },
        })
            .populate("category")
            .populate("sub_category")
            .populate("fuel")
            .populate("scope_id")
            .populate("facility_id")
            .populate("name");
        const scopeTwoData = await Report.find({
            "scope_id": {"$in":scopeTwo?._id},
            date_string: { $gte: startDate, $lt: endDate },
        })
            .populate("category")
            .populate("sub_category")
            .populate("fuel")
            .populate("scope_id")
            .populate("facility_id")
            .populate("name");
        const scopeThreeData = await Report.find({
            "scope_id": {"$in":scopeThree?._id},
            date_string: { $gte: startDate, $lt: endDate },
        })
            .populate("category")
            .populate("sub_category")
            .populate("fuel")
            .populate("scope_id")
            .populate("facility_id")
            .populate("name");

        let pushEmptySpaces = (arr)=>{
            for (let i = 0; i < 2; i++) {
                arr.push({
                    "Facility Id":"",
                    "Scope Id":  "",
                    Category: "",
                    "Sub Category": "",
                    "Fuel/Name": "",
                    "Heat Content": "",
                    "Co2 Factor": "",
                    "Co2 Unit": "",
                    "Ch4 Factor": "",
                    "Ch4 Unit": "",
                    "N2o Factor": "",
                    "N2o Unit": "",
                    Biogenic: "",
                    Ar4: "",
                    Ar5:"",
                    Unit:"",
                    "Chemical Name": "",
                    Formula:"",
                    Gas: "",
                    Biofuel: "",
                    Quantity: "",
                    "Co2 Equivalent":"",
                    Date: "",
                });
            }
        }
        let userArray = [
            {
                "Facility Id": "Facility id",
                "Scope Id": "Scope Id",
                Category: "Category",
                "Sub Category": "Sub Category",
                "Fuel/Name": "Fuel/Name",
                "Heat Content": "Heat Content",
                "Co2 Factor": "Co2 Factor",
                "Co2 Unit": "Co2 Unit",
                "Ch4 Factor": "Ch4 Factor",
                "Ch4 Unit": "Ch4 Unit",
                "N2o Factor": "N2o Factor",
                "N2o Unit": "N2o Unit",
                Biogenic: "Biogenic",
                Ar4: "Ar4",
                Ar5: "Ar5",
                Unit: "Unit",
                "Chemical Name": "Chemical Name",
                Formula: "Formula",
                Gas: "Gas",
                Biofuel: "Biofuel",
                Quantity: "Quantity",
                "Co2 Equivalent": "Co2 Equivalent",
                Date: "Date",
            },
        ];

        await scopeOneData.forEach(function (val, index) {
            userArray.push({
                "Facility Id":
                    val.facility_id && val.facility_id.facility_id
                        ? val.facility_id.facility_id
                        : "",
                "Scope Id": val.scope_id && val.scope_id.name ? val.scope_id.name : "",
                Category: val.category && val.category.name ? val.category.name : "",
                "Sub Category":
                    val.sub_category && val.sub_category.name
                        ? val.sub_category.name
                        : "",
                "Fuel/Name": val.name && val.name.name ? val.name.name : "",
                "Heat Content": val.heat_content ? val.heat_content : "",
                "Co2 Factor": val.co2_factor ? val.co2_factor : "",
                "Co2 Unit": val.co2_unit ? val.co2_unit : "",
                "Ch4 Factor": val.ch4_factor ? val.ch4_factor : "",
                "Ch4 Unit": val.ch4_unit ? val.ch4_unit : "",
                "N2o Factor": val.n2o_factor ? val.n2o_factor : "",
                "N2o Unit": val.n2o_unit ? val.n2o_unit : "",
                Biogenic: val.biogenic ? val.biogenic : "",
                Ar4: val.ar4 ? val.ar4 : "",
                Ar5: val.ar5 ? val.ar5 : "",
                Unit: val.unit ? val.unit : "",
                "Chemical Name": val.chemical_name ? val.chemical_name : "",
                Formula: val.formula ? val.formula : "",
                Gas: val.gas ? val.gas : "",
                Biofuel: val.biofuel ? val.biofuel : "",
                Quantity: val.quantity,
                "Co2 Equivalent": val.equivalent,
                Date: moment(new Date(val.date)).format("MM-DD-YYYY"),
            });
        });
        await pushEmptySpaces(userArray);
        await scopeTwoData.forEach(function (val, index) {
            userArray.push({
                "Facility Id":
                    val.facility_id && val.facility_id.facility_id
                        ? val.facility_id.facility_id
                        : "",
                "Scope Id": val.scope_id && val.scope_id.name ? val.scope_id.name : "",
                Category: val.category && val.category.name ? val.category.name : "",
                "Sub Category":
                    val.sub_category && val.sub_category.name
                        ? val.sub_category.name
                        : "",
                "Fuel/Name": val.name && val.name.name ? val.name.name : "",
                "Heat Content": val.heat_content ? val.heat_content : "",
                "Co2 Factor": val.co2_factor ? val.co2_factor : "",
                "Co2 Unit": val.co2_unit ? val.co2_unit : "",
                "Ch4 Factor": val.ch4_factor ? val.ch4_factor : "",
                "Ch4 Unit": val.ch4_unit ? val.ch4_unit : "",
                "N2o Factor": val.n2o_factor ? val.n2o_factor : "",
                "N2o Unit": val.n2o_unit ? val.n2o_unit : "",
                Biogenic: val.biogenic ? val.biogenic : "",
                Ar4: val.ar4 ? val.ar4 : "",
                Ar5: val.ar5 ? val.ar5 : "",
                Unit: val.unit ? val.unit : "",
                "Chemical Name": val.chemical_name ? val.chemical_name : "",
                Formula: val.formula ? val.formula : "",
                Gas: val.gas ? val.gas : "",
                Biofuel: val.biofuel ? val.biofuel : "",
                Quantity: val.quantity,
                "Co2 Equivalent": val.equivalent,
                Date: moment(new Date(val.date)).format("MM-DD-YYYY"),
            });
        });
        await pushEmptySpaces(userArray);
        await scopeThreeData.forEach(function (val, index) {
            userArray.push({
                "Facility Id":
                    val.facility_id && val.facility_id.facility_id
                        ? val.facility_id.facility_id
                        : "",
                "Scope Id": val.scope_id && val.scope_id.name ? val.scope_id.name : "",
                Category: val.category && val.category.name ? val.category.name : "",
                "Sub Category":
                    val.sub_category && val.sub_category.name
                        ? val.sub_category.name
                        : "",
                "Fuel/Name": val.name && val.name.name ? val.name.name : "",
                "Heat Content": val.heat_content ? val.heat_content : "",
                "Co2 Factor": val.co2_factor ? val.co2_factor : "",
                "Co2 Unit": val.co2_unit ? val.co2_unit : "",
                "Ch4 Factor": val.ch4_factor ? val.ch4_factor : "",
                "Ch4 Unit": val.ch4_unit ? val.ch4_unit : "",
                "N2o Factor": val.n2o_factor ? val.n2o_factor : "",
                "N2o Unit": val.n2o_unit ? val.n2o_unit : "",
                Biogenic: val.biogenic ? val.biogenic : "",
                Ar4: val.ar4 ? val.ar4 : "",
                Ar5: val.ar5 ? val.ar5 : "",
                Unit: val.unit ? val.unit : "",
                "Chemical Name": val.chemical_name ? val.chemical_name : "",
                Formula: val.formula ? val.formula : "",
                Gas: val.gas ? val.gas : "",
                Biofuel: val.biofuel ? val.biofuel : "",
                Quantity: val.quantity,
                "Co2 Equivalent": val.equivalent,
                Date: moment(new Date(val.date)).format("MM-DD-YYYY"),
            });
        });

        const dir = path.join(__dirname, "..", "..", "uploads", "data.csv");
        // console.log("dirrrrrrrrrrrrrr", dir);
        var ws = fs.createWriteStream(dir);
        fastcsv
            .write(userArray, { hearders: true })
            .on("finish", function () {
                return res.json({
                    status: 200,
                    data: process.env.BASE_URL + "/uploads/data.csv",
                    message: "Report Exported successfully",
                    report: [...scopeOneData,...scopeTwoData,...scopeThreeData],
                });
            })
            .pipe(ws);
    }catch (error) {
        return res.json({
            status: 500,
            message: "Something went wrong!",
            err: error.message,
        });
    }
}

const csvExport = async (req, res) => {
  try {

    let startDate = moment(req.query.startDate).format("YYYY-MM-DD");
    // "T00:00:00.000+00:00";
    let endDate = moment(req.query.endDate).format("YYYY-MM-DD");
    // "T00:00:00.000+00:00";

    // console.log(startDate, endDate, "dateeeeeeeee");

    let reportData = await Report.find({
      subdomain: req.decoded.subdomain,
      date_string: { $gte: startDate, $lt: endDate },
    })
      .populate("category")
      .populate("sub_category")
      .populate("fuel")
      .populate("scope_id")
      .populate("facility_id")
      .populate("name");

    var user_array = [
      {
        "Facility Id": "Facility id",
        "Scope Id": "Scope Id",
        Category: "Category",
        "Sub Category": "Sub Category",
        "Fuel/Name": "Fuel/Name",
        "Heat Content": "Heat Content",
        "Co2 Factor": "Co2 Factor",
        "Co2 Unit": "Co2 Unit",
        "Ch4 Factor": "Ch4 Factor",
        "Ch4 Unit": "Ch4 Unit",
        "N2o Factor": "N2o Factor",
        "N2o Unit": "N2o Unit",
        Biogenic: "Biogenic",
        Ar4: "Ar4",
        Ar5: "Ar5",
        Unit: "Unit",
        "Chemical Name": "Chemical Name",
        Formula: "Formula",
        Gas: "Gas",
        Biofuel: "Biofuel",
        Quantity: "Quantity",
        "Co2 Equivalent": "Co2 Equivalent",
        Date: "Date",
      },
    ];
    await reportData.forEach(function (val, index) {
      user_array.push({
        "Facility Id":
          val.facility_id && val.facility_id.facility_id
            ? val.facility_id.facility_id
            : "",
        "Scope Id": val.scope_id && val.scope_id.name ? val.scope_id.name : "",
        Category: val.category && val.category.name ? val.category.name : "",
        "Sub Category":
          val.sub_category && val.sub_category.name
            ? val.sub_category.name
            : "",
        "Fuel/Name": val.name && val.name.name ? val.name.name : "",
        "Heat Content": val.heat_content ? val.heat_content : "",
        "Co2 Factor": val.co2_factor ? val.co2_factor : "",
        "Co2 Unit": val.co2_unit ? val.co2_unit : "",
        "Ch4 Factor": val.ch4_factor ? val.ch4_factor : "",
        "Ch4 Unit": val.ch4_unit ? val.ch4_unit : "",
        "N2o Factor": val.n2o_factor ? val.n2o_factor : "",
        "N2o Unit": val.n2o_unit ? val.n2o_unit : "",
        Biogenic: val.biogenic ? val.biogenic : "",
        Ar4: val.ar4 ? val.ar4 : "",
        Ar5: val.ar5 ? val.ar5 : "",
        Unit: val.unit ? val.unit : "",
        "Chemical Name": val.chemical_name ? val.chemical_name : "",
        Formula: val.formula ? val.formula : "",
        Gas: val.gas ? val.gas : "",
        Biofuel: val.biofuel ? val.biofuel : "",
        Quantity: val.quantity,
        "Co2 Equivalent": val.equivalent,
        Date: moment(new Date(val.date)).format("MM-DD-YYYY"),
      });
    });

    const dir = path.join(__dirname, "..", "..", "uploads", "data.csv");
    // console.log("dirrrrrrrrrrrrrr", dir);
    var ws = fs.createWriteStream(dir);
    fastcsv
      .write(user_array, { hearders: true })
      .on("finish", function () {
        return res.json({
          status: 200,
          data: process.env.BASE_URL + "/uploads/data.csv",
          message: "Report Exported successfully",
          report: reportData,
        });
      })
      .pipe(ws);
  } catch (err) {
    return res.json({
      status: 500,
      message: "Something went wrong!",
      err: err.message,
    });
  }
};

const csvErrorExport = async (req, res) => {
  try {
    // startDate += "T00:00:00.000+00:00";
    // endDate += "T00:00:00.000+00:00";
    // console.log(startDate, endDate, "dateeeeeeeee");

    let reportData = await ReportError.find({
      subdomain: req.decoded.subdomain,
    });

    var user_array = [
      {
        "Facility Id": "Facility id",
        "Scope Id": "Scope Id",
        Category: "Category",
        "Sub Category": "Sub Category",
        "Fuel/Name": "Fuel/Name",
        "Heat Content": "Heat Content",
        "Co2 Factor": "Co2 Factor",
        "Co2 Unit": "Co2 Unit",
        "Ch4 Factor": "Ch4 Factor",
        "Ch4 Unit": "Ch4 Unit",
        "N2o Factor": "N2o Factor",
        "N2o Unit": "N2o Unit",
        Biogenic: "Biogenic",
        Ar4: "Ar4",
        Ar5: "Ar5",
        Unit: "Unit",
        "Chemical Name": "Chemical Name",
        Formula: "Formula",
        Gas: "Gas",
        Biofuel: "Biofuel",
        Quantity: "Quantity",
        "Co2 Equivalent": "Co2 Equivalent",
        Date: "Date",
        error: "Error",
      },
    ];
    await reportData.forEach(function (val, index) {
      user_array.push({
        "Facility Id":
          val.facility_id && val.facility_id ? val.facility_id : "",
        "Scope Id": val.scope_id && val.scope_id ? val.scope_id : "",
        Category: val.category && val.category ? val.category : "",
        "Sub Category":
          val.sub_category && val.sub_category ? val.sub_category : "",
        "Fuel/Name": val.name ? val.name : "",
        "Heat Content": val.heat_content ? val.heat_content : "",
        "Co2 Factor": val.co2_factor ? val.co2_factor : "",
        "Co2 Unit": val.co2_unit ? val.co2_unit : "",
        "Ch4 Factor": val.ch4_factor ? val.ch4_factor : "",
        "Ch4 Unit": val.ch4_unit ? val.ch4_unit : "",
        "N2o Factor": val.n2o_factor ? val.n2o_factor : "",
        "N2o Unit": val.n2o_unit ? val.n2o_unit : "",
        Biogenic: val.biogenic ? val.biogenic : "",
        Ar4: val.ar4 ? val.ar4 : "",
        Ar5: val.ar5 ? val.ar5 : "",
        Unit: val.unit ? val.unit : "",
        "Chemical Name": val.chemical_name ? val.chemical_name : "",
        Formula: val.formula ? val.formula : "",
        Gas: val.gas ? val.gas : "",
        Biofuel: val.biofuel ? val.biofuel : "",
        Quantity: val.quantity,

        "Co2 Equivalent": val.equivalent,
        Date: moment(new Date(val.date)).format("MM-DD-YYYY"),
        error: val.error.map((v) => v.messageText).join(","),
      });
    });

    const dir = path.join(__dirname, "..", "..", "uploads", "errorReport.csv");
    // console.log("dirrrrrrrrrrrrrr", dir);
    var ws = fs.createWriteStream(dir);
    fastcsv
      .write(user_array, { hearders: true })
      .on("finish", function () {
        console.log("arrrrrrrr ", user_array);
        return res.json({
          status: 200,
          data: process.env.BASE_URL + "/uploads/errorReport.csv",
          message: "Report Exported successfully",
          report: user_array,
        });
      })
      .pipe(ws);
  } catch (err) {
    return res.json({
      status: 500,
      message: "Something went wrong!",
      err: err.message,
    });
  }
};

module.exports = {
  GetFuelData,
  addReport,
  GetAddReportData,
  GetReportData,
  GetErrorReportData,
  GetSingleReport,
  GetScopeCategoryData,
  GetSubCategoryData,
  updateReport,
  GetEmissionData,
  VerifcationReport,
  csvUploadReport,
  csvErrorExport,
  csvExport,
    exportSummaryReport,exportSummaryReportOfLastFiveYear
};
