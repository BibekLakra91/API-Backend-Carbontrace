
var User = require("../../models/User")
var EmissionCategory = require("../../models/EmissionCategory")
var EmissionSubCategory = require("../../models/EmissionSubCategory")

var Scope = require("../../models/Scope")
var mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
var auth = require("../../settings/auth");
var md5 = require("md5");
const timestamp = require("time-stamp");
created_date = timestamp.utc("YYYY-MM-DD HH:mm:ss");
var randomstring = require("randomstring");
const ejs = require('ejs');
var Mail = require('../../utilities/mail');
var fs = require('fs');
var path = require('path');

const GetCategory= async (req,res) => {
  try{
    let data= await EmissionCategory.find();
    let Scope_data= await Scope.find();
    if(data){
    
     return res.send({status: 200,data:data,scpe:Scope_data}); 
    }
    else
    {
     return res.send({ status: 400,message:'No Data found!'});
    }
   }catch(err){
     return res.send({ status: 500,message:'Something went wrong, please try again later!'});
   }
}

const GetSubCategory= async (req,res) => {
  try{
    var total = await EmissionSubCategory.find();
    let perPage = 10;
    let page = req.query.page-1;
    let data= await EmissionSubCategory.find().populate('category').limit(perPage)
    .skip(perPage * page);
    let EmissionCategorys= await EmissionCategory.find();

    if(data){
     return res.send({status: 200,data:data,category:EmissionCategorys,total:total.length}); 
    }
    else
    {
     return res.send({ status: 400,message:'No Data found!'});
    }
   }catch(err){
     return res.send({ status: 500,message:'Something went wrong, please try again later!'});
   }
}

const GetSingleLicence= async (req,res) => {
  try{
    let user= await EmissionCategory.findOne({_id:req.params.id});
    if(user){
    
     return res.send({status: 200,data:user}); 
    }
    else
    {
     return res.send({ status: 400,message:'No Data found!'});
    }
   }catch(err){
     return res.send({ status: 500,message:'Something went wrong, please try again later!'});
   }
}

const stringUpprcase = async (str)=>{
  var splitStr = str.toString().toLowerCase().split(' ');
  for (var i = 0; i < splitStr.length; i++) {
      // You do not need to check if i is larger than splitStr length, as your for does that for you
      // Assign it back to the array
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
  }
  // Directly return the joined string
  return splitStr.join(' '); 
}

const addCategory = async (req,res)=>{
  try {
      if (!req.body) {
          return res.send({
            status: 500,
            message: "Note content can not be empty",
          });
        }
        let upprcase = await stringUpprcase(req.body.name)
        var user_data = await EmissionCategory.find({ 
          name: upprcase
        }).exec();
        if (user_data.length > 0) {
          return res.json({
            status: 400,
            message: "Category already exit!",
          });
        } else {
          const Category = new EmissionCategory({
            scope_id: req.body.scope_id,
            name: upprcase,
            created_at: created_date,
            updated_at: created_date,
          });
          // Save Category in the database
          await Category.save()
            .then(async (data) => {
                return res.send({ status: 200, message: "Category added successfully" });
            })
            .catch((err) => {
              console.log("error=========================>",err)
              return res.send({ status: 500, message: err.message });
            });
          }
  } catch (error) {
      return res.send({ status: 500, message: error.message });
  }
  
}

const addSubCategory = async (req,res)=>{
  try {
      if (!req.body) {
          return res.send({
            status: 500,
            message: "Note content can not be empty",
          });
        }
        console.log(await stringUpprcase(req.body.name));
        let upprcase = await stringUpprcase(req.body.name)
        var user_data = await EmissionSubCategory.find({ 
          name: upprcase
        }).exec();
        if (user_data.length > 0) {
          return res.json({
            status: 400,
            message: "Category already exit!",
          });
        } else {
          const SubCategory = new EmissionSubCategory({
            category: req.body.category,
            name: upprcase,
            created_at: created_date,
            updated_at: created_date,
          });
          // Save Category in the database
          await SubCategory.save()
            .then(async (data) => {
                return res.send({ status: 200, message: "Subcategory added successfully" });
            })
            .catch((err) => {
              console.log("error=========================>",err)
              return res.send({ status: 500, message: err.message });
            });
          }
  } catch (error) {
      return res.send({ status: 500, message: error.message });
  }
  
}



const updateCategory = async (req,res)=>{
  try {
      if (!req.body) {
          return res.send({
            status: 500,
            message: "Note content can not be empty",
          });
        }
        let upprcase = await stringUpprcase(req.body.name)
        var user_data = await EmissionCategory.find({ 
          name: upprcase,
          _id: { $ne: req.params.id }
        }).exec();
        if (user_data.length > 0) {
          return res.json({
            status: 400,
            message: "Category already exit1",
          });
        } else {
          var update_data = {
            name: upprcase,
            updated_at: created_date,
          };
          
          await EmissionCategory.updateOne({_id:req.params.id}, update_data)
            .then(async (data) => {
                return res.send({ data:data,status: 200, message: "Category updated successfully" });
            })
            .catch((err) => {
              console.log("error=========================>",err)
              return res.send({ status: 500, message: err.message });
            });
          }
  } catch (error) {
      return res.send({ status: 500, message: error.message });
  }
  
}



const updateSubCategory = async (req,res)=>{
  try {
      if (!req.body) {
          return res.send({
            status: 500,
            message: "Note content can not be empty",
          });
        }
        let upprcase = await stringUpprcase(req.body.name)
        var user_data = await EmissionSubCategory.find({ 
          name: upprcase,
          _id: { $ne: req.params.id }
        }).exec();
        if (user_data.length > 0) {
          return res.json({
            status: 400,
            message: "Subategory already exit1",
          });
        } else {
          var update_data = {
            name: upprcase,
            updated_at: created_date,
          };
          
          await EmissionSubCategory.updateOne({_id:req.params.id}, update_data)
            .then(async (data) => {
                return res.send({ data:data,status: 200, message: "Subcategory updated successfully" });
            })
            .catch((err) => {
              console.log("error=========================>",err)
              return res.send({ status: 500, message: err.message });
            });
          }
  } catch (error) {
      return res.send({ status: 500, message: error.message });
  }
  
}


module.exports = {
  GetCategory,
  GetSubCategory,
  addCategory,
  updateCategory,
  addSubCategory,
  updateSubCategory
  };