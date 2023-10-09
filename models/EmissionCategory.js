var mongoose = require("mongoose");
var Schema = mongoose.Schema;

class emissionCategoryClass {
  static register(payload) {
    return this(payload).save();
  }
}

var EmissionCategorySchema = new Schema(
  {
    scope_id: { type: Schema.Types.ObjectId, ref: "Scope" },
    name: { type: String },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    subdomain: { type: String, default: null },
    created_at: Date,
    updated_at: Date,
  },
  { collection: "emission_categories" }
);

EmissionCategorySchema.loadClass(emissionCategoryClass);

const EmissionCategory = mongoose.model(
  "EmissionCategory",
  EmissionCategorySchema
);

module.exports = EmissionCategory;
