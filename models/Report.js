var mongoose = require("mongoose");
var Schema = mongoose.Schema;
class reportClass {
  static register(payload) {
    return this(payload).save();
  }
}

var ReportSchema = new Schema(
  {
    facility_id: { type: Schema.Types.ObjectId, ref: "Facility" },
    scope_id: { type: Schema.Types.ObjectId, ref: "Scope" },
    category: { type: Schema.Types.ObjectId, ref: "EmissionCategory" },
    sub_category: { type: Schema.Types.ObjectId, ref: "EmissionSubCategory" },
    name: { type: Schema.Types.ObjectId, ref: "Emission" },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    quantity: { type: Number },
    equivalent: { type: Number },
    date_string: { type: String },
    date: { type: Date },
    heat_content: { type: String },
    custom_factor: { type: String },
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
    verifier: { type: String },
    verifier_name: { type: String },
    verifier_email: { type: String },
    subdomain: { type: String, default: null },
    status: { type: Number, default: 0 },
    ar4: { type: Number },
    ar5: { type: Number },
    unit: { type: String },
    created_at: Date,
    approved_at: Date,
    updated_at: Date,
  },
  { collection: "reports" }
);

ReportSchema.loadClass(reportClass);
var Report = mongoose.model("Report", ReportSchema);

module.exports = Report;
