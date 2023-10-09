var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ScopeSchema = new Schema(
  {
    name: { type: String },
    created_at: Date,
    updated_at: Date,
  },
  { collection: "scopes" }
);

var Scope = mongoose.model("Scope", ScopeSchema);

module.exports = Scope;
