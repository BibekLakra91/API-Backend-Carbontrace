var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CategorySchema = new Schema(
  {
    name: { type: String },
    created_at: Date,
    updated_at: Date,
  },
  { collection: "categories" }
);

var Category = mongoose.model("Category", CategorySchema);

module.exports = Category;
