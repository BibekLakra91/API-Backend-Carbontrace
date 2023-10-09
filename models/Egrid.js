var mongoose = require("mongoose");
var Schema = mongoose.Schema;
class EgridClass {
  static register(payload) {
    return this(payload).save();
  }
}
var EgridSchema = new Schema(
  {
    region: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zip: { type: String },
    created_at: Date,
    updated_at: Date,
  },
  { collection: "egrids" }
);
EgridSchema.loadClass(EgridClass);

var Egrid = mongoose.model("Egrid", EgridSchema);

module.exports = Egrid;
