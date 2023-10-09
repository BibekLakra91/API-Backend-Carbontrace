var mongoose = require("mongoose");
var Schema = mongoose.Schema;
class reportClass {
  static register(payload) {
    return this(payload).save();
  }
}

var ReportErrorSchema = new Schema(
  {
    facility_id: { type: String },
    scope_id: { type: String },
    category: { type: String },
    sub_category: { type: String },
    name: { type: String },
    created_by: { type: String },
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
    error: [
      {
        messageType: { type: String },
        messageText: { type: String },
      },
    ],
    subdomain: { type: String },
    ar4: { type: Number },
    ar5: { type: Number },
    unit: { type: String },
    created_at: Date,
    updated_at: Date,
  },
  { collection: "report_errors" }
);

ReportErrorSchema.loadClass(reportClass);
var ReportError = mongoose.model("ReportError", ReportErrorSchema);

module.exports = ReportError;
