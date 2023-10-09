var mongoose = require("mongoose");
var Schema = mongoose.Schema;
class emissionClass {
  static register(payload) {
    return this(payload).save();
  }
}
var emissionSchema = new Schema(
  {
    scope_id: { type: Schema.Types.ObjectId, ref: "Scope" },
    category: { type: Schema.Types.ObjectId, ref: "EmissionCategory" },
    sub_category: { type: Schema.Types.ObjectId, ref: "EmissionSubCategory" },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String },
    heat_content: { type: String },
    co2_factor: { type: Number },
    co2_unit: { type: String },
    ch4_factor: { type: Number },
    ch4_unit: { type: String },
    n2o_factor: { type: Number },
    n2o_unit: { type: String },
    biogenic: { type: Number },
    biofuel: { type: String },
    formula: { type: String },
    gas: { type: String },
    chemical_name: { type: String },
    subdomain: { type: String, default: null },
    ar4: { type: Number },
    ar5: { type: Number },
    unit: { type: String },
    created_at: Date,
    updated_at: Date,
  },
  { collection: "emission_factors" }
);
emissionSchema.loadClass(emissionClass);

var Emission = mongoose.model("Emission", emissionSchema);

module.exports = Emission;
