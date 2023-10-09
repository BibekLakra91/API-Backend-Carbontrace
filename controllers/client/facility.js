var User = require("../../models/User");
var Egrid = require("../../models/Egrid");
var Facility = require("../../models/Facility");
var Emission = require("../../models/Emission");
var mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
var auth = require("../../settings/auth");
var md5 = require("md5");
const timestamp = require("time-stamp");
created_date = timestamp.utc("YYYY-MM-DD HH:mm:ss");
var randomstring = require("randomstring");
const ejs = require("ejs");
var Mail = require("../../utilities/mail");
var fs = require("fs");
var path = require("path");
const csv = require("csv-parser");

const GetFacility = async (req, res) => {
  try {
    let token = req.headers.authorization;
    var decoded = jwt.verify(token, auth.jwtSecret);
    var total = await Facility.find({ subdomain: decoded.subdomain });
    let perPage = parseInt(req.query.perpage);
    let page = req.query.page - 1;
    let facility = await Facility.find({ subdomain: decoded.subdomain })
      .limit(perPage)
      .skip(perPage * page);
    if (facility) {
      return res.send({ status: 200, data: facility, total: total.length });
    } else {
      return res.send({ status: 400, message: "No Data found!" });
    }
  } catch (err) {
    return res.send({
      status: 500,
      message: "Something went wrong, please try again later!",
    });
  }
};

const GetEgridData = async (req, res) => {
  try {
    let egrid = await Egrid.aggregate([
      {
        $group: {
          _id: "$region",
        },
      },
    ]);

    if (egrid) {
      return res.send({ status: 200, data: egrid });
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

const GetSingleEgrid = async (req, res) => {
  try {
    let egrid = await Egrid.aggregate([
      {
        $match: { region: req.params.id },
      },
      {
        $set: {
          id: "$_id",
          name: "$zip",
        },
      },
      {
        $project: {
          id: "$id",
          name: "$name",
          _id: 0,
        },
      },
    ]);

    if (egrid) {
      return res.send({ status: 200, data: egrid });
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

const GetSingleFacility = async (req, res) => {
  try {
    let facility = await Facility.findOne({ _id: req.params.id }).select(
      "-password"
    );

    if (facility) {
      return res.send({ status: 200, data: facility });
    } else {
      return res.send({ status: 400, message: "No Data found!" });
    }
  } catch (err) {
    return res.send({
      status: 500,
      message: "Something went wrong, please try again later!",
    });
  }
};

const addFacility = async (req, res) => {
  try {
    let token = req.headers.authorization;
    var decoded = jwt.verify(token, auth.jwtSecret);
    if (!req.body) {
      return res.send({
        status: 500,
        message: "Note content can not be empty",
      });
    }

    var facilty_data = await Facility.find({
      facility_id: req.body.facility_id,
    }).exec();

    if (facilty_data.length > 0) {
      return res.json({
        status: 400,
        message: "Facility id already exit!",
      });
    } else {
      var egrid_data = await Egrid.find({
        region: req.body.grid_region.toUpperCase(),
      }).exec();
      if (egrid_data.length == 0) {
        const Egrids = new Egrid({
          city: null,
          state:  null,
          country:  null,
          zip: req.body.zip,
          region: req.body.grid_region.toUpperCase(),
          created_at: created_date,
          updated_at: created_date,
        });
      await Egrids.save()

      }
      // Create a User
      const Facilitys = new Facility({
        subdomain: req.body.subdomain,
        info: req.body.info,
        city: req.body.city ? req.body.city : null,
        state: req.body.state ? req.body.state : null,
        country: req.body.country ? req.body.country : null,
        zip: req.body.zip,
        facility_id: req.body.facility_id,
        grid_region: req.body.grid_region.toUpperCase(),
        created_by: decoded.id,
        created_at: created_date,
        updated_at: created_date,
      });
      // Save User in the database
      await Facilitys.save()
        .then(async (data) => {
          return res.send({
            status: 200,
            message: "Facility added successfully",
          });
        })
        .catch((err) => {
          console.log("error=========================>", err);
          return res.send({ status: 500, message: err.message });
        });
    }
  } catch (error) {
    return res.send({ status: 500, message: error.message });
  }
};

const updateFacility = async (req, res) => {
  try {
    if (!req.body) {
      return res.send({
        status: 500,
        message: "Note content can not be empty",
      });
    }

    var facilty_data = await Facility.find({
      facility_id: req.body.facility_id,
      _id: { $ne: req.params.id },
    }).exec();

    if (facilty_data.length > 0) {
      return res.json({
        status: 400,
        message: "Facility id already exit!",
      });
    } else {
      var update_data = {
        info: req.body.info,
        city: req.body.city ? req.body.city : null,
        state: req.body.state ? req.body.state : null,
        country: req.body.country ? req.body.country : null,
        zip: req.body.zip,
        facility_id: req.body.facility_id,
        grid_region: req.body.grid_region,
        updated_at: created_date,
      };

      await Facility.updateOne({ _id: req.params.id }, update_data)
        .then(async (data) => {
          return res.send({
            data: data,
            status: 200,
            message: "Facility updated successfully",
          });
        })
        .catch((err) => {
          console.log("error=========================>", err);
          return res.send({ status: 500, message: err.message });
        });
    }
  } catch (error) {
    return res.send({ status: 500, message: error.message });
  }
};

const csvUpload = async (req, res) => {
  let regEmail =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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

      fs.createReadStream(process.env.GET_URL + req.file.filename)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          console.log(results);
          var array = [];
          let resolvedAllergy = await Promise.all(
            results.map(async (item) => {
              if (item.region && item.zip) {
                var user_data = await Egrid.find({
                  zip: item.zip,
                }).exec();
                if (user_data.length == 0) {
                  var data = await Egrid.register({
                    zip: item.zip,
                    region: item.region,
                    city: null,
                    state: null,
                    country: null,
                    created_at: created_date,
                    updated_at: created_date,
                  });
                }
              }
            })
          );

          return res.json({
            status: 200,
            data: array,

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

const csvUploadEmission = async (req, res) => {
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

      fs.createReadStream(process.env.GET_URL + req.file.filename)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          console.log(results);
          var array = [];
          let resolvedAllergy = await Promise.all(
            results.map(async (item) => {
              // var user_data = await Emission.find({
              //   name: item.name
              // }).exec();
              // if(user_data.length == 0)
              // {

              var data = await Emission.register({
                scope_id: item.scope_id ? item.scope_id : null,
                category: item.category ? item.category : null,
                sub_category: item.sub_category ? item.sub_category : null,
                name: item.name ? item.name : null,
                heat_content: item.heat_content ? item.heat_content : null,
                co2_factor: item.co2_factor ? item.co2_factor : null,
                ch4_factor: item.ch4_factor ? item.ch4_factor : null,
                n2o_factor: item.n2o_factor ? item.n2o_factor : null,
                biogenic: item.biogenic ? item.biogenic : null,
                ar4: item.ar4 ? item.ar4 : null,
                ar5: item.ar5 ? item.ar5 : null,
                unit: item.unit ? item.unit : null,
                chemical_name: item.chemical_name ? item.chemical_name : null,
                formula: item.formula ? item.formula : null,
                gas: item.gas ? item.gas : null,
                biofuel: item.biofuel ? item.biofuel : null,
                created_at: created_date,
                updated_at: created_date,
              });
              // }
            })
          );

          return res.json({
            status: 200,
            data: array,

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

module.exports = {
  GetFacility,
  GetSingleEgrid,
  GetSingleFacility,
  addFacility,
  updateFacility,
  GetEgridData,
  csvUpload,
  csvUploadEmission,
};
