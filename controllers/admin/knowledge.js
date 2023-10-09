var mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
var auth = require("../../settings/auth");
var md5 = require("md5");
const timestamp = require("time-stamp");
created_date = timestamp.utc("YYYY-MM-DD HH:mm:ss");
var Emission = require("../../models/Emission")
var Scope = require("../../models/Scope")
var EmissionCategory = require("../../models/EmissionCategory")
var EmissionSubCategory = require("../../models/EmissionSubCategory")


//Controller for signup
const addknowledge = async (req,res)=>{
  try {
      if (!req.body) {
          return res.send({
            status: 500,
            message: "Note content can not be empty",
          });
        }
        var Emission_data = await Emission.find({
          name: req.body.name
        }).exec();
        if (Emission_data.length > 0) {
          return res.json({
            status: 400,
            message: "Name already exit",
          });
        } else {
          let token= req.headers.authorization;
          var decoded = jwt.verify(token, auth.jwtSecret);
          // Create a User
          const Emissions = new Emission({
            created_by: decoded.id,
            scope_id: (req.body.scope_id)?req.body.scope_id:null,
            category: (req.body.category)?req.body.category:null,
            sub_category: (req.body.sub_category)?req.body.sub_category:null,
            name: (req.body.name)?req.body.name:null,
            heat_content: (req.body.heat_content)?req.body.heat_content:null,
            co2_factor: (req.body.co2_factor)?req.body.co2_factor:null,
            co2_unit: (req.body.co2_unit)?req.body.co2_unit:null,
            ch4_factor: (req.body.ch4_factor)?req.body.ch4_factor:null,
            ch4_unit: (req.body.ch4_unit)?req.body.ch4_unit:null,
            n2o_factor: (req.body.n2o_factor)?req.body.n2o_factor:null,
            n2o_unit: (req.body.n2o_unit)?req.body.n2o_unit:null,
            biogenic: (req.body.biogenic)?req.body.biogenic:null,
            ar4: (req.body.ar4)?req.body.ar4:null,
            ar5: (req.body.ar5)?req.body.ar5:null,
            unit: (req.body.unit)?req.body.unit:null,
            chemical_name: (req.body.chemical_name)?req.body.chemical_name:null,
            formula: (req.body.formula)?req.body.formula:null,
            gas: (req.body.gas)?req.body.gas:null,
            biofuel: (req.body.biofuel)?req.body.biofuel:null,
            created_at: created_date,
            updated_at: created_date
          });
          // Save User in the database
          await Emissions.save()
            .then(async (data) => {
                return res.send({ status: 200, message: "Data added successfully" });
            })
            .catch((err) => {
              console.log("error=========================>",err)
              return res.send({ status: 500, message: err.message });
            });
        }     
  } catch (error) {
      return res.send({ status: 500,message:'Something went wrong, please try again later!',error:err.message });
  }
}


const GetAddKnowledgeData= async (req,res) => {
  try{
    let Emissions= await Emission.aggregate([
      {
        $match: { "unit":  { $ne: null }}
      },
      {
        $group: {
           _id : "$unit",
        }
      }
    ]);

    var Scopes = await Scope.find();

     return res.send({status: 200,data:Emissions,scopes:Scopes}); 

   }catch(err){
     return res.send({ status: 500,message:'Something went wrong, please try again later!',error:err.message});
   }
}



const GetCategoryData= async (req,res) => {
  try{
    var EmissionCategorys = await EmissionCategory.find({scope_id:req.params.id});

     return res.send({status: 200,data:EmissionCategorys}); 

   }catch(err){
     return res.send({ status: 500,message:'Something went wrong, please try again later!',error:err.message});
   }
}

const GetSubCategoryData= async (req,res) => {
  try{
    var EmissionSubCategorys = await EmissionSubCategory.find({category:req.params.id});

     return res.send({status: 200,data:EmissionSubCategorys}); 

   }catch(err){
     return res.send({ status: 500,message:'Something went wrong, please try again later!',error:err.message});
   }
}

const GetKnowledgeData= async (req,res) => {
  try{
    var total = await Emission.find({subdomain: null});
    let perPage = 10;
    let page = req.query.page-1;
    var Emissions = await Emission.find({subdomain: null}).populate('category').populate('sub_category').populate('scope_id').limit(perPage)
    .skip(perPage * page).sort({
      _id: '-1'
  });
     return res.send({status: 200,data:Emissions,total:total.length}); 
   }catch(err){
     return res.send({ status: 500,message:'Something went wrong, please try again later!',error:err.message});
   }
}
const GetSingleKnowledge= async (req,res) => {
  try{
    let Emissions= await Emission.findOne({_id:req.params.id});
    let EmissionCategorys= await EmissionCategory.find({scope_id:Emissions.scope_id});
    let EmissionSubCategorys= await EmissionSubCategory.find({category:Emissions.category});
    
    if(Emissions){
    
     return res.send({status: 200,data:Emissions,category:EmissionCategorys,subcategory:EmissionSubCategorys}); 
    }
    else
    {
     return res.send({ status: 400,message:'No Data found!'});
    }
   }catch(err){
     return res.send({ status: 500,message:'Something went wrong, please try again later!'});
   }
}


const updateKnowledge = async (req,res)=>{
  try {
      if (!req.body) {
          return res.send({
            status: 500,
            message: "Note content can not be empty",
          });
        }
       
        
          var update_data = {
            sub_category: (req.body.sub_category)?req.body.sub_category:null,
            name: (req.body.name)?req.body.name:null,
            heat_content: (req.body.heat_content)?req.body.heat_content:null,
            co2_factor: (req.body.co2_factor)?req.body.co2_factor:null,
            co2_unit: (req.body.co2_unit)?req.body.co2_unit:null,
            ch4_factor: (req.body.ch4_factor)?req.body.ch4_factor:null,
            ch4_unit: (req.body.ch4_unit)?req.body.ch4_unit:null,
            n2o_factor: (req.body.n2o_factor)?req.body.n2o_factor:null,
            n2o_unit: (req.body.n2o_unit)?req.body.n2o_unit:null,
            biogenic: (req.body.biogenic)?req.body.biogenic:null,
            ar4: (req.body.ar4)?req.body.ar4:null,
            ar5: (req.body.ar5)?req.body.ar5:null,
            unit: (req.body.unit)?req.body.unit:null,
            chemical_name: (req.body.chemical_name)?req.body.chemical_name:null,
            formula: (req.body.formula)?req.body.formula:null,
            gas: (req.body.gas)?req.body.gas:null,
            biofuel: (req.body.biofuel)?req.body.biofuel:null,
            updated_at: created_date,
          };
          
          await Emission.updateOne({_id:req.params.id}, update_data)
            .then(async (data) => {
                return res.send({ data:data,status: 200, message: "Data updated successfully" });
            })
            .catch((err) => {
              console.log("error=========================>",err)
              return res.send({ status: 500, message: err.message });
            });
          
  } catch (error) {
      return res.send({ status: 500, message: error.message });
  }
}

module.exports = {
  addknowledge,
  GetAddKnowledgeData,
  GetKnowledgeData,
  GetSingleKnowledge,
  GetCategoryData,
  GetSubCategoryData,
  updateKnowledge
  };