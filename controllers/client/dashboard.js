const timestamp = require("time-stamp");
created_date = timestamp.utc("YYYY-MM-DD HH:mm:ss");
const Facility = require("../../models/Facility");
const Report = require("../../models/Report");
const Scope = require("../../models/Scope");
const User = require("../../models/User");

const getDashBoardData = async (req, res) => {
  try {
    const subdomain = req.decoded.subdomain;
    const totalUsers = await User.countDocuments({ subdomain });
    const totalFacility = await Facility.countDocuments({ subdomain });
    const totalReports = await Report.countDocuments({ subdomain });

    return res.send({
      status: 200,
      data: {
        users: totalUsers,
        facility: totalFacility,
        reports: totalReports,
      },
      message: "Successful",
    });
  } catch (err) {
    return res.send({
      status: 500,
      message: "Something went wrong, please try again later!",
      error: err.message,
    });
  }
};

const getLastMonthReportsOfScopes = async (req,res)=>{
  try {
    let d = new Date();
    d.setMonth(d.getMonth() - 1); //1 month ago
    // {date:{$gte:d}}
    const scopeOne = await Scope.findOne({name:"Scope 1"})
    const scopeTwo = await Scope.findOne({name:"Scope 2"})
    const scopeThree = await Scope.findOne({name:"Scope 3"})
    const scopeOneData = await Report.find({"scope_id": {"$in":scopeOne?._id}})
    const scopeTwoData = await Report.find({"scope_id": {"$in":scopeTwo?._id}})
    const scopeThreeData = await Report.find({"scope_id": {"$in":scopeThree?._id}})

    let reportsOfScopes = [
      {
        scope:"scope 1",
        report:scopeOneData,
        noOfReports:scopeOneData.length
      },
      {
        scope:"scope 2",
        report:scopeTwoData,
        noOfReports:scopeTwoData.length
      },
      {
        scope:"scope 3",
        report:scopeThreeData,
        noOfReports:scopeThreeData.length
      },
    ]

    return res.json({
      status: 200,
      data: reportsOfScopes,
      message: "Successful",
    });
  }catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Something went wrong, please try again later!",
      error: error.message,
    });
  }
}
const getTopFiveRecordsOfLastMonth = async (req,res)=>{
  try {
    let d = new Date();
    d.setMonth(d.getMonth() - 1); //1 month ago

    const topRecords = await Report.find({date:{$gte:d}}).sort( {equivalent:-1}).limit(5)

    return res.json({
      status: 200,
      data: topRecords,
      message: "Successful",
    });
  }catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Something went wrong, please try again later!",
      error: error.message,
    });
  }
}

const GetReportData = async (req, res) => {
  try {
    let startDate = new Date(req.query.startDate);

    let endDate = new Date(req.query.endDate);


    let reportData = await Report.find({
      subdomain: req.decoded.subdomain,
      date: { $gte: startDate, $lte: endDate },
    });


    return res.json({
      status: 200,
      data: reportData,
      message: "Successful",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Something went wrong, please try again later!",
      error: error.message,
    });
  }
};

module.exports = {
  getDashBoardData,
  GetReportData,
  getLastMonthReportsOfScopes,
  getTopFiveRecordsOfLastMonth
};
