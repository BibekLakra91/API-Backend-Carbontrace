const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin/user')
const knowledgeController = require('../controllers/admin/knowledge')
const CategoryController = require('../controllers/admin/Category')
const authentication= require('../middlewares/verify')
// const multer = require("multer");
const DIR = "./files/";
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, DIR);
//       console.log(DIR, "in the dir");
//     },
//     filename: (req, file, cb) => {
//       const fileName = file.originalname.toLowerCase().split(" ").join("-");
//       cb(null, uuidv4() + "-" + fileName);
//     },
//   });
  
//   var upload = multer({
//     storage: storage,
//     fileFilter: (req, file, cb) => {
//       cb(null, true);
//     },
//   });


router.post('/login',
    adminController.loginAdmin
);

router.post('/add-user',
    adminController.addUser
);

router.post('/add-knowledge',authentication,
    knowledgeController.addknowledge
);

router.get('/get-add-knowledge',authentication,
    knowledgeController.GetAddKnowledgeData
);

router.get('/get-category/:id',authentication,
    knowledgeController.GetCategoryData
);

router.get('/get-subcategory/:id',authentication,
    knowledgeController.GetSubCategoryData
);
router.get('/get-knowledge',authentication,
    knowledgeController.GetKnowledgeData
);
router.get('/get-single-knowledge/:id',authentication,
    knowledgeController.GetSingleKnowledge
);


router.post('/update-knowledge/:id',authentication,
knowledgeController.updateKnowledge
);


/********************Emission category Routes************************ */


router.get('/get-category',authentication,
CategoryController.GetCategory
);

router.post('/add-category',authentication,
CategoryController.addCategory
);

router.post('/update-category/:id',authentication,
CategoryController.updateCategory
);
/********************Emission category Routes************************ */


router.get('/get-subcategory',authentication,
CategoryController.GetSubCategory
);
router.post('/add-subcategory',authentication,
CategoryController.addSubCategory
);
router.post('/update-subcategory/:id',authentication,
CategoryController.updateSubCategory
);

module.exports = router;