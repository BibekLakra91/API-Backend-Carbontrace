var mongoose = require("mongoose");
var Schema = mongoose.Schema;

class facilityClass {
  static register(payload) {
    return this(payload).save();
  }
}

var FacilitySchema = new Schema(
  {
    subdomain: { type: String },
    info: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    grid_region: { type: String },
    zip: { type: String },
    facility_id: { type: Number },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    created_at: Date,
    updated_at: Date,
  },
  { collection: "facilities" }
);

FacilitySchema.loadClass(facilityClass);

var Facility = mongoose.model("Facility", FacilitySchema);

module.exports = Facility;
