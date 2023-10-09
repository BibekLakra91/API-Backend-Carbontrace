var User = require("../../models/User");
var Licence = require("../../models/Licence");
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

const GetLicence = async (req, res) => {
  try {
    let user = await Licence.find();
    if (user) {
      return res.send({ status: 200, data: user });
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

const GetAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    if (!users || !users.length) {
      return res.status(400).json({
        message: "No Data Found",
      });
    }

    return res.status(200).json({
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error please try again later",
    });
  }
};

const GetSingleLicence = async (req, res) => {
  try {
    let user = await Licence.findOne({ _id: req.params.id });
    if (user) {
      return res.send({ status: 200, data: user });
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

const addLicence = async (req, res) => {
  try {
    if (!req.body) {
      return res.send({
        status: 500,
        message: "Note content can not be empty",
      });
    }
    var user_data = await Licence.find({
      name: req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1),
    }).exec();
    if (user_data.length > 0) {
      return res.json({
        status: 400,
        message: "Name already exit",
      });
    } else {
      // Create a User
      const Licences = new Licence({
        name: req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1),
        no_client: parseInt(req.body.no_client),
        no_collaborator: parseInt(req.body.no_collaborator),
        // no_verifier: parseInt(req.body.no_verifier),
        created_at: created_date,
        updated_at: created_date,
      });
      // Save User in the database
      await Licences.save()
        .then(async (data) => {
          return res.send({
            status: 200,
            message: "Licence added successfully",
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

const updateLicence = async (req, res) => {
  try {
    if (!req.body) {
      return res.send({
        status: 500,
        message: "Note content can not be empty",
      });
    }
    var user_data = await Licence.find({
      name: req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1),
      _id: { $ne: req.params.id },
    }).exec();
    if (user_data.length > 0) {
      return res.json({
        status: 400,
        message: "Name already exit",
      });
    } else {
      var update_data = {
        name: req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1),
        no_client: parseInt(req.body.no_client),
        no_collaborator: parseInt(req.body.no_collaborator),
        // no_verifier: parseInt(req.body.no_verifier),
        updated_at: created_date,
      };

      await Licence.updateOne({ _id: req.params.id }, update_data)
        .then(async (data) => {
          return res.send({
            data: data,
            status: 200,
            message: "Licence updated successfully",
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

module.exports = {
  GetLicence,
  GetAllUsers,
  GetSingleLicence,
  addLicence,
  updateLicence,
};
