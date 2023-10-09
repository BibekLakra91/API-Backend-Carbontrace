var mongoose = require('mongoose');
// mongoose.connect('mongodb://root:rootpassword@localhost:27017/greenhouse?authSource=admin&w=1',{
// 	useNewUrlParser: true,
// 	useUnifiedTopology: true
// });
mongoose.connect('mongodb+srv://admin:46aGXBw6j5yeptS1@carbontrace.ipbgwnx.mongodb.net/greenhouse',{
	useNewUrlParser: true,
	useUnifiedTopology: true
});
mongoose.set('debug', true);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
	console.log("Connection Successful!");
});