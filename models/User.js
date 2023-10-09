var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema(
  {
    licence_type: { type: Schema.Types.ObjectId, ref: "Licence" },
    subdomain: { type: String },
    email: { type: String },
    first_name: { type: String },
    last_name: { type: String },
    password: { type: String },
    phone: { type: String },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    password: { type: String },
    company: { type: String },
    bio: { type: String },
    no_facility: Number,
    role: Number,
    status: { type: Number, default: 0 },
    token: { type: String },
    pw_token: { type: String },
    profile_img: { type: String, default: "user.png" },
    created_at: Date,
    updated_at: Date,
  },
  { collection: "users" }
);

var User = mongoose.model("User", userSchema);

module.exports = User;
