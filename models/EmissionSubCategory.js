var mongoose = require("mongoose");
var Schema = mongoose.Schema;

class emissionSubCategoryClass {
  static register(payload) {
    return this(payload).save();
  }
}

var EmissionSubCategorySchema = new Schema(
  {
    category: { type: Schema.Types.ObjectId, ref: "EmissionCategory" },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String },
    subdomain: { type: String, default: null },
    created_at: Date,
    updated_at: Date,
  },
  { collection: "emission_sub_categories" }
);

EmissionSubCategorySchema.loadClass(emissionSubCategoryClass);

var EmissionSubCategory = mongoose.model(
  "EmissionSubCategory",
  EmissionSubCategorySchema
);

module.exports = EmissionSubCategory;
