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
const uniqid = require('uniqid');


const GetClient= async (req,res) => {
  try{
    let token= req.headers.authorization;
    var decoded = jwt.verify(token, auth.jwtSecret);
    let user= await User.find({_id: { $ne: decoded.id },created_by: decoded.id,role:2}).select("-password").populate('licence_type');
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

const GetSingleClient= async (req,res) => {
  try{
    let user= await User.findOne({_id:req.params.id}).select("-password");
    let licence= await Licence.find();
    let category= await Category.find();
    if(user){
    
     return res.send({status: 200,data:user,licence:licence,category:category}); 
    }
    else
    {
     return res.send({ status: 400,message:'No Data found!'});
    }
   }catch(err){
     return res.send({ status: 500,message:'Something went wrong, please try again later!'});
   }
}

const loginClient= async (req,res) => {
  try{
    // let templatePath  = path.join('./mail_template/');
    // var compiled = ejs.compile(fs.readFileSync(path.resolve(templatePath + 'mail.html'),"utf8"));
    // var html = compiled({
    //     email: req.body.email.toLowerCase(),
    //     password: req.body.password,
    //     site_url: "abc.com",
    // })
    // var response = Mail.sendMailer({email:req.body.email.toLowerCase(),body:html,subject:'Client Registration successfully'});
    //  return res.send({status: 200,data:response}); 

    let user= await User.findOne({email: req.body.email.toLowerCase(),password:md5(req.body.password),subdomain:req.body.subdomain,$or: [ { role: 2 }, { role:3 } ]});
    if(user){
     let response={
        id:user._id,
        first_name:user.first_name,
        last_name:user.last_name,
        licence_type:user.licence_type,
        subdomain:user.subdomain,
        category:user.category,
        company:user.company,
        bio:user.bio,
        // no_facility:user.no_facility,
        email:user.email,
        profile_img:user.profile_img,
        role:user.role,
        status:user.status,
        jwt:jwt.sign({ id: user._id,subdomain: user.subdomain,role:user.role}, auth.jwtSecret, { expiresIn: '24h' })
     };
     return res.send({status: 200,data:response}); 
    }
    else
    {
     return res.send({ status: 400,message:'Either email or password wrong'});
    }
   }catch(err){
     return res.send({ status: 500,message:'Something went wrong, please try again later!'});
   }
}


const addClientData= async (req,res) => {
  try{
    let token= req.headers.authorization;
    var decoded = jwt.verify(token, auth.jwtSecret);

    var message = '';
    
    var Limit_data = await User.findOne({ 
      _id: decoded.id
    }).populate('licence_type').exec();
    if(Limit_data.subdomain)
    {
    var subdomain_data = await User.find({ 
      subdomain: Limit_data.subdomain.toLowerCase(),
      role:2
    }).exec();
    if(Limit_data && Limit_data._id && Limit_data.licence_type.no_client <= subdomain_data.length) 
    {
        message = "";
    }
  }

    
    let licence= await Licence.find();
    let category= await Category.find();
    
    return res.send({status: 200,licence:licence,category:category,message}); 
    
    
   }catch(err){
     return res.send({ status: 500,message:'Something went wrong, please try again later!',error:err.message});
   }
}



const GetTeam= async (req,res) => {
  try{
    let token= req.headers.authorization;
    var decoded = jwt.verify(token, auth.jwtSecret);
    let user= await User.find({_id: { $ne: decoded.id },subdomain:decoded.subdomain,$or: [ { role: 2 }, { role:3 }, { role:4 } ]}).select("-password").populate('licence_type');
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

const addTeam = async (req,res)=>{
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
          role:2
        }).exec();
        var subdomain_data_col = await User.find({ 
          subdomain: req.body.subdomain.toLowerCase(),
          role:3
        }).exec();
        // var subdomain_data_verifier = await User.find({ 
        //   subdomain: req.body.subdomain.toLowerCase(),
        //   role:4
        // }).exec();

        var Limit_data = await User.findOne({ 
          _id: decoded.id
        }).populate('licence_type').exec();

        if(Limit_data && Limit_data._id && Limit_data.licence_type.no_client <= subdomain_data.length && req.body.role == "2") 
        {
          return res.json({
            status: 400,
            message: "Your add limit is over for admin!",
          });
        }
        else if (Limit_data && Limit_data._id && Limit_data.licence_type.no_collaborator <= subdomain_data_col.length && req.body.role == "3"){
          return res.json({
            status: 400,
            message: "Your add limit is over for collaborator!",
          });
        }
        // else if (Limit_data && Limit_data._id && Limit_data.licence_type.no_verifier <= subdomain_data_verifier.length && req.body.role == "4"){
        //   return res.json({
        //     status: 400,
        //     message: "Your add limit is over for Verifier!",
        //   });
        // }
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
              licence_type: req.body.licence_type,
              subdomain: req.body.subdomain,
              first_name: req.body.first_name,
              last_name: req.body.last_name,
              email: req.body.email.toLowerCase(),
              phone: req.body.phone,
              category: req.body.category,
              company: req.body.company,
              bio: req.body.bio,
              created_by: decoded.id,
              // no_facility: parseInt(req.body.no_facility),
              role: parseInt(req.body.role),
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
                    name: req.body.first_name+' '+req.body.last_name,
                    email: req.body.email.toLowerCase(),
                    password: password,
                    site_url: `https://${req.body.subdomain}.${process.env.FRONT_BASE_URL}`,
                })
                Mail.sendMailer({email:req.body.email.toLowerCase(),body:html,subject:'Team Registration successfully'}); 
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
//Controller for signup
const addClient = async (req,res)=>{
  try {
      if (!req.body) {
          return res.send({
            status: 500,
            message: "Note content can not be empty",
          });
        }
        var user_data = await User.find({ 
          email: req.body.email.toLowerCase()
        }).exec();

        var subdomain_data = await User.find({ 
          subdomain: req.body.subdomain.toLowerCase()
        }).exec();
        
        if (subdomain_data.length > 0) {
          return res.json({
            status: 400,
            message: "Subdomain already exit!",
          });
        } 
        else if (user_data.length > 0) {
          return res.json({
            status: 400,
            message: "Email already exit!",
          });
        } else {
          let token= req.headers.authorization;
          var decoded = jwt.verify(token, auth.jwtSecret);

          let string = randomstring.generate(8);
          let password = string.toLowerCase();

          // Create a User
          const Users = new User({
            licence_type: req.body.licence_type,
            subdomain: req.body.subdomain,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email.toLowerCase(),
            phone: req.body.phone,
            category: req.body.category,
            company: req.body.company,
            bio: req.body.bio,
            created_by: decoded.id,
            // no_facility: parseInt(req.body.no_facility),
            role: 2,
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
                  name: req.body.first_name+' '+req.body.last_name,
                  email: req.body.email.toLowerCase(),
                  password: password,
                  site_url: `https://${req.body.subdomain}.${process.env.FRONT_BASE_URL}`,
              })
              Mail.sendMailer({email:req.body.email.toLowerCase(),body:html,subject:'Client Registration successfully'}); 
                return res.send({ status: 200, message: "User added successfully" });
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

const updateTeam = async (req,res)=>{
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
            category: req.body.category,
            company: req.body.company,
            bio: req.body.bio,
            // no_facility: parseInt(req.body.no_facility),
            updated_at: created_date,
          };
          
          await User.updateOne({_id:req.params.id}, update_data)
            .then(async (data) => {
                return res.send({ data:data,status: 200, message: "Client updated successfully" });
            })
            .catch((err) => {
              console.log("error=========================>",err)
              return res.send({ status: 500, message: err.message });
            });
          
  } catch (error) {
      return res.send({ status: 500, message: error.message });
  }
}

//Controller for signup
const updateClient = async (req,res)=>{
  try {
      if (!req.body) {
          return res.send({
            status: 500,
            message: "Note content can not be empty",
          });
        }
       
        
          var update_data = {
            licence_type: req.body.licence_type,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            phone: req.body.phone,
            category: req.body.category,
            company: req.body.company,
            bio: req.body.bio,
            // no_facility: parseInt(req.body.no_facility),
            updated_at: created_date,
          };

          var update_many = {
            licence_type: req.body.licence_type,
            category: req.body.category,
            company: req.body.company,
            bio: req.body.bio,
            // no_facility: parseInt(req.body.no_facility),
            updated_at: created_date,
          };
          
          
          await User.updateOne({_id:req.params.id}, update_data)
            .then(async (data) => {
              await User.updateMany({subdomain:req.body.subdomain}, update_many)
                return res.send({ data:data,status: 200, message: "Client updated successfully" });
            })
            .catch((err) => {
              console.log("error=========================>",err)
              return res.send({ status: 500, message: err.message });
            });
          
  } catch (error) {
      return res.send({ status: 500, message: error.message });
  }
}

const uploadImage = async (req,res,next)=>{

  var update_data = {
    profile_img: req.files[0].filename,
  };
  
  await User.updateOne({_id:req.params.id}, update_data)
    .then(async (data) => {
      return res.json({
        status: 200,
        data: req.files,
      
        message: 'Image uploaded sucessfully'
      
      })
    })
    .catch((err) => {
      console.log("error=========================>",err)
      return res.send({ status: 500, message: err.message });
    });


}


const changepassword = async (req,res)=>{
  try {
      if (!req.body) {
          return res.send({
            status: 500,
            message: "Note content can not be empty",
          });
        }
        let user= await User.findOne({_id:req.params.id,password:md5(req.body.current_password)});
        if(user){
            var update_data = {
              password: md5(req.body.new_password),
              updated_at: created_date,
            };
            
            await User.updateOne({_id:req.params.id}, update_data)
              .then(async (data) => {
                  return res.send({ data:data,status: 200, message: "Password changed successfully" });
              })
              .catch((err) => {
                console.log("error=========================>",err)
                return res.send({ status: 500, message: err.message });
              });
        } else {
         
            return res.json({
              status: 400,
              message: "Current password you have entered is incorrect!",
            });
        }
  } catch (error) {
      return res.send({ status: 500, message: error.message });
  }
}


const ForgotPassword = async (req,res)=>{
  try {
      if (!req.body) {
          return res.send({
            status: 500,
            message: "Note content can not be empty",
          });
        }
       
        let hash = uniqid();
        var update_data = {
          pw_token: hash,
          updated_at: created_date,
        };
        await User.updateOne({email: req.body.email}, update_data)
            .then(async (data) => {
        let user_data= await User.findOne({email: req.body.email});

                let templatePath  = path.join('./mail_template/');
                var compiled = ejs.compile(fs.readFileSync(path.resolve(templatePath + 'resetPassword.html'),"utf8"));
                var html = compiled({
                    email: req.body.email.toLowerCase(),
                    name: user_data.first_name+' '+user_data.last_name,
                    site_url: user_data.role == 1?process.env.ADMIN_BASE_URL+'/reset/'+user_data._id+'/'+hash:''+user_data.subdomain+'.'+process.env.FRONT_BASE_URL+'/reset/'+user_data._id+'/'+hash,
                })
                Mail.sendMailer({email:req.body.email.toLowerCase(),body:html,subject:'Forget Password'}); 
                return res.send({ data:data,status: 200, message: "Please check email!" });
            })
            .catch((err) => {
              console.log("error=========================>",err)
              return res.send({ status: 500, message: err.message });
            });
          
  } catch (error) {
      return res.send({ status: 500, message: error.message });
  }
}


const ResetPassword = async (req,res)=>{
  try {
      if (!req.body) {
          return res.send({
            status: 500,
            message: "Note content can not be empty",
          });
        }
        var update_data = {
          password:  md5(req.body.new_password),
          pw_token: "",
          updated_at: created_date,
        };
        let user_data= await User.findOne({_id: req.body.user_id});

          await User.updateOne({_id: req.body.user_id,pw_token:req.body.pw_token}, update_data)
            .then(async (data) => {
                if(user_data && user_data.pw_token)
                {
                  return res.send({ data:data,status: 200, message: "Password reset successfully" });
                }
                else
                {
                  return res.send({ data:data,status: 400, message: "Link has been expired!" });
                }
            })
            .catch((err) => {
           
              return res.send({ status: 500, message: err.message });
            });
          
  } catch (error) {
      return res.send({ status: 500, message: error.message });
  }
}


module.exports = {
  loginClient,
  addClient,
  addTeam,
  addClientData,
  GetClient,
  GetSingleClient,
  updateClient,
  updateTeam,
  uploadImage,
  GetTeam,
  changepassword,
  ForgotPassword,
  ResetPassword
  };