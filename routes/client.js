const express = require("express");
const router = express.Router();

const clientController = require("../controllers/client/user");
const dashboardController = require("../controllers/client/dashboard");
const collaboratorController = require("../controllers/client/collaborator");
const facilityController = require("../controllers/client/facility");
const licenceController = require("../controllers/client/licence");
const ReportController = require("../controllers/client/report");
const authentication = require("../middlewares/verify");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const DIR = "./uploads/";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
    console.log(DIR, "in the dir");
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, uuidv4() + "-" + fileName);
  },
});

var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

/*********************  DashBoard *****************/

router.get("/dashboard", authentication, dashboardController.getDashBoardData);
router.get("/dashboard/getReportsOfScopes",authentication, dashboardController.getLastMonthReportsOfScopes);
router.get("/dashboard/getTopFiveRecordsOfLastMonth",authentication, dashboardController.getTopFiveRecordsOfLastMonth);
router.get(
  "/dashboard/report-data",
  authentication,
  dashboardController.GetReportData
);

/*********************************************** */

/********************Client and Team Routes************************ */

router.post("/login", clientController.loginClient);
router.post("/forgot", clientController.ForgotPassword);
router.post("/reset", clientController.ResetPassword);

router.get("/client-add-data", authentication, clientController.addClientData);
router.post("/add-user", authentication, clientController.addClient);
router.post("/add-team", authentication, clientController.addTeam);
router.get("/get-team", authentication, clientController.GetTeam);
router.get("/get-client", authentication, clientController.GetClient);
router.get(
  "/single-client/:id",
  authentication,
  clientController.GetSingleClient
);
router.post(
  "/update-client/:id",
  authentication,
  clientController.updateClient
);
router.post("/update-team/:id", authentication, clientController.updateTeam);
router.post(
  "/upload-images/:id",
  upload.array("image", 5),
  authentication,
  clientController.uploadImage
);

router.post(
  "/change-password/:id",
  authentication,
  clientController.changepassword
);

/********************Licence Routes************************ */

router.post("/add-licence", authentication, licenceController.addLicence);
router.get("/licence", authentication, licenceController.GetLicence);
router.get(
  "/single-licence/:id",
  authentication,
  licenceController.GetSingleLicence
);
router.post(
  "/update-licence/:id",
  authentication,
  licenceController.updateLicence
);

/************ Users Route **************/

router.get("/users", licenceController.GetAllUsers);

/**************************************/

/********************Collaborator Routes************************ */

router.post(
  "/add-collaborator",
  authentication,
  collaboratorController.addCollaborator
);
router.get(
  "/collaborator",
  authentication,
  collaboratorController.GetCollaborator
);
router.get(
  "/single-collaborator/:id",
  authentication,
  collaboratorController.GetSingleCollaborator
);
router.post(
  "/update-collaborator/:id",
  authentication,
  collaboratorController.updateCollaborator
);

router.get("/limit-check/", authentication, collaboratorController.LimitCheck);

/********************Facility Routes************************ */

router.get("/facility", authentication, facilityController.GetFacility);

router.get("/egrid-data", authentication, facilityController.GetEgridData);

router.get(
  "/single-egrid-data/:id",
  authentication,
  facilityController.GetSingleEgrid
);

router.post("/add-facility", authentication, facilityController.addFacility);

router.get(
  "/single-facility/:id",
  authentication,
  facilityController.GetSingleFacility
);

router.post(
  "/update-facility/:id",
  authentication,
  facilityController.updateFacility
);

router.post(
  "/upload-csv",
  upload.single("image"),
  facilityController.csvUpload
);

router.post(
  "/upload-csv-emission",
  upload.single("image"),
  facilityController.csvUploadEmission
);

/********************Report Routes************************ */

router.get(
  "/add-reportdata",
  authentication,
  ReportController.GetAddReportData
);

router.get(
  "/scope-category",
  authentication,
  ReportController.GetScopeCategoryData
);

router.get("/fuel-data", authentication, ReportController.GetFuelData);

router.get(
  "/subcategory-data",
  authentication,
  ReportController.GetSubCategoryData
);
router.get("/emission-data", authentication, ReportController.GetEmissionData);
router.post("/add-report", authentication, ReportController.addReport);

router.get("/report", authentication, ReportController.GetReportData);
router.get(
  "/error-report",
  authentication,
  ReportController.GetErrorReportData
);
router.get(
  "/single-report/:id",
  authentication,
  ReportController.GetSingleReport
);
router.post(
  "/update-report/:id",
  authentication,
  ReportController.updateReport
);

router.get("/verification", ReportController.VerifcationReport);

router.post("/export-csv",authentication, ReportController.csvExport);
router.post("/summary-export-csv", ReportController.exportSummaryReportOfLastFiveYear);
router.get("/summary-export-test", ReportController.exportSummaryReport);
router.post(
  "/export-error-csv",
  authentication,
  ReportController.csvErrorExport
);

router.post(
  "/upload-csv-Report",
  authentication,
  upload.single("image"),
  ReportController.csvUploadReport
);

module.exports = router;
