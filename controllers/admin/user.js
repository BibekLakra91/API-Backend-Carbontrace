
var User = require("../../models/User")
var mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
var auth = require("../../settings/auth");
var md5 = require("md5");
const timestamp = require("time-stamp");
created_date = timestamp.utc("YYYY-MM-DD HH:mm:ss");


const loginAdmin= async (req,res) => {
  try{
    let email = "admin@gmail.com";
    let password = md5("password");
    let user1 = await User.findOne({email: email});
    let users = await User.find();
    let user= await User.findOne({email: req.body.email.toLowerCase(),password:md5(req.body.password),role:1});
    // user = {
    //   id: {
    //       $oid:"6116572a4416b39fb423f6f8"
    //   },
    //   first_name:"Super",
    //   last_name:"Admin",
    //   email:"admin@gmail.com",
    //   profile_img:"user.png",
    //   status:0,
    //   jwt:jwt.sign({ id:"6116572a4416b39fb423f6f8",role:1}, auth.jwtSecret)
    // }
    if(user){
     let response={
        id:user._id,
        first_name:user.first_name,
        last_name:user.last_name,
        email:user.email,
        profile_img:user.profile_img,
        status:user.status,
        jwt:jwt.sign({ id: user._id,role:user.role}, auth.jwtSecret)
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


//Controller for signup
const addUser = async (req,res)=>{
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
        if (user_data.length > 0) {
          return res.json({
            status: 400,
            message: "Email already exit",
          });
        } else {
          console.log(req.body);
          // Create a User
          const Users = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email.toLowerCase(),
            role: parseInt(req.body.role),
            status: 0,
            password: md5(req.body.password),
            profile_img: "user.png",
            created_at: created_date,
            updated_at: created_date,
          });
          // Save User in the database
          await Users.save()
            .then(async (data) => {
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


module.exports = {
  loginAdmin,
  addUser
  };