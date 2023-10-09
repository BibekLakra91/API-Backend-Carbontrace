const jwt = require("jsonwebtoken");
var User = require("../models/User");

module.exports.verifyToken = async (req, res, next) => {
  var token = req.body.token || req.query.token || req.headers["token"];
  // decode token
  if (token) {
    try {
      isTokenValid = await User.findOne({
        token: token.split(" ")[1],
      });
      if (isTokenValid) {
        jwt.verify(token.split(" ")[1], "vnrvjrekrke", function (err, decoded) {
          if (err) {
            console.log("error", err);
            return res.send({
              success: false,
              message: "Unauthorized user!",
              status: 401,
            });
          } else {
            // if everything is good, save to request for use in other routes
            req.decoded = decoded;
            next();
          }
        });
      }
      else{
          throw new Error("Invalid token/ Session expired")
      }
    } catch (error) {
      console.log("token error ====> ", error.message);
      res.send({
        success: false,
        message: error.message,
        status: 401,
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "No token provided.",
      status: 400,
    });
  }
};
