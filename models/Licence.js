var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var licenceSchema = new Schema(
  {
    name: { type: String },
    no_client: Number,
    no_collaborator: Number,
    no_verifier: Number,
    created_at: Date,
    updated_at: Date,
  },
  { collection: "licences" }
);

var Licence = mongoose.model("Licence", licenceSchema);

module.exports = Licence;
