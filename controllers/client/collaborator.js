
var User = require("../../models/User")
var Licence = require("../../models/Licence")
var Category = require("../../models/Category")
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


const GetCollaborator= async (req,res) => {
  try{
    let token= req.headers.authorization;
    var decoded = jwt.verify(token, auth.jwtSecret);
    let user= await User.find({_id: { $ne: decoded.id },role:3,subdomain:decoded.subdomain}).select("-password");
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

const GetSingleCollaborator= async (req,res) => {
  try{
    let user= await User.findOne({_id:req.params.id}).select("-password");
    
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


const addCollaborator = async (req,res)=>{
  try {
    let token= req.headers.authorization;
    var decoded = jwt.verify(token, auth.jwtSecret);
      if (!req.body) {
          return res.send({
            status: 500,
            message: "Note content can not be empty",
          });
        }
        var subdomain_data = await User.find({ 
          subdomain: req.body.subdomain.toLowerCase(),
          role:3
        }).exec();

        var Limit_data = await User.findOne({
          _id: decoded.id
        }).populate('licence_type').exec();

        if(Limit_data && Limit_data._id && Limit_data.licence_type.no_collaborator <= subdomain_data.length) 
        {
          return res.json({
            status: 400,
            message: "Your add team member limit is over!",
          });
        }
        else
        {
          var user_data = await User.find({ 
            email: req.body.email.toLowerCase()
          }).exec();

          if (user_data.length > 0) {
            return res.json({
              status: 400,
              message: "Email already exit!",
            });
          } else {

            let string = randomstring.generate(8);
            let password = string.toLowerCase();

            // Create a User
            const Users = new User({
              subdomain: req.body.subdomain,
              first_name: req.body.first_name,
              last_name: req.body.last_name,
              phone: req.body.phone,
              email: req.body.email.toLowerCase(),
              created_by: decoded.id,
              role: 3,
              status: 0,
              password: md5(password),
              profile_img: "user.png",
              created_at: created_date,
              updated_at: created_date,
            });
            // Save User in the database
            await Users.save()
              .then(async (data) => {
                let templatePath  = path.join('./mail_template/');
                var compiled = ejs.compile(fs.readFileSync(path.resolve(templatePath + 'mail.html'),"utf8"));
                var html = compiled({
                    email: req.body.email.toLowerCase(),
                    password: password,
                    site_url: `https://${req.body.subdomain}.${process.env.FRONT_BASE_URL}`,
                })
                Mail.sendMailer({email:req.body.email.toLowerCase(),body:html,subject:'Collaborator Registration successfully'}); 
                  return res.send({ status: 200, message: "User added successfully" });
              })
              .catch((err) => {
                console.log("error=========================>",err)
                return res.send({ status: 500, message: err.message });
              });
          }
        }      
  } catch (error) {
      return res.send({ status: 500, message: error.message });
  }
}


const updateCollaborator = async (req,res)=>{
  try {
      if (!req.body) {
          return res.send({
            status: 500,
            message: "Note content can not be empty",
          });
        }
       
        
          var update_data = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            phone: req.body.phone,
            updated_at: created_date,
          };
          
          await User.updateOne({_id:req.params.id}, update_data)
            .then(async (data) => {
                return res.send({ data:data,status: 200, message: "Profile updated successfully" });
            })
            .catch((err) => {
              console.log("error=========================>",err)
              return res.send({ status: 500, message: err.message });
            });
          
  } catch (error) {
      return res.send({ status: 500, message: error.message });
  }
}


const LimitCheck= async (req,res) => {
  try{
    let token= req.headers.authorization;
    var decoded = jwt.verify(token, auth.jwtSecret);

    
    var Limit_data = await User.findOne({ 
      _id: decoded.id
    }).populate('licence_type').exec();
    var subdomain_data = await User.find({ 
      subdomain: Limit_data.subdomain.toLowerCase(),
      role:3
    }).exec();

    var message = '';
    console.log();
    if(Limit_data && Limit_data._id && Limit_data.licence_type.no_collaborator <= subdomain_data.length) 
    {
        message = "Your add team member limit is over!";
    }
    return res.send({status: 200,message}); 

   }catch(err){
     return res.send({ status: 500,message:'Something went wrong, please try again later!',error:err.message});
   }
}


module.exports = {
  GetCollaborator,
  GetSingleCollaborator,
  addCollaborator,
  updateCollaborator,
  LimitCheck
  };