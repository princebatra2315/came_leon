var express = require('express');
var mongoose = require('mongoose');
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var randtoken = require('rand-token');
const randomword = require ( 'randomword' );
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })) 

mongoose.connect('mongodb://cameleon:cameleon1@ds251112.mlab.com:51112/cameleon', { useNewUrlParser: true })

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error: '));

//Show that our db is succesfully Connected
db.once('open', function(){
console.log("Connected to Mongo Lab: ");
})

//Schema Setup
var CodeSchema = mongoose.Schema({
    token_id: String,
    hits: Number,
    lat: Number,
    lng: Number,
    radius: Number,
    f_date: String,
    CouponCode: String
});

var Code = mongoose.model('codecollections', CodeSchema);

app.route('/api/v1/:tokenKey/:count/:lati/:longi/:radi/:date/:type1/generate')
   .get(function(req, res) 
   {
   	  var token_idOfCode = req.params.tokenKey;
      var hitsOfCode = req.params.count;
      var latOfCode = req.params.lati;
      var lngOfCode = req.params.longi;
      var radiusOfCode = req.params.radi;
      var dateOfCode = req.params.date;
      var typeOfCode = req.params.type1;
      if(typeOfCode == 1)
      {
      	var genCode = generatecode1();
      }
      else if(typeOfCode == 2)
      {
      	var genCode = generatecode2();
      }
      else if(typeOfCode == 3)
      {
      	var genCode = generatecode3();
      }
      else if(typeOfCode ==4)
      {
      	var genCode = generatecode4();
      }
      var newCode = new Code({token_id: token_idOfCode,hits: hitsOfCode,lat: latOfCode,lng: lngOfCode,f_date: dateOfCode,CouponCode: genCode,radius: radiusOfCode});
      newCode.save(function(err,result){
      	if(err)
      		console.log(err);
      	else
      		console.log("saved");
      });
      res.send(newCode);       
});

var rad = function(x) {
  return x * Math.PI / 180;
};
 var getDistance = function(p1lat, p1lng, p2lat, p2lng) {
   // returns the distance in meter
   var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(p2lat - p1lat);
  var dLong = rad(p2lng - p1lng);
  // console.log(dLat);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1lat)) * Math.cos(rad(p2lat)) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
};
app.route('/api/v1/:Coupon/:lati/:longi/:date/validate')
   .get(function(req, res) 
    {
    	var Coupon = req.params.Coupon;
    	var lati = req.params.lati;
    	var longi = req.params.longi;
    	var date = req.params.date;
     	Code.find({CouponCode: Coupon}).then(function(data){
     	       
     	    if(data.length > 0){
            
            var dis = getDistance(data[0].lat,data[0].lng,lati,longi);
            if(dis <= data[0].radius)
            {
                 if( data[0].hits > 0)
                 {
                 	 var myquery = { CouponCode: Coupon };
                     var newvalues = {$set: { hits: data[0].hits-1 } };
                     
                     Code.updateOne(myquery, newvalues, function(err, res) {
                     
                     if (err) throw err;
                     else
                     	console.log("No error");
						});
                 	res.send({status: "success"});

                 }
                 else
                 	res.send({status: "failure",error: "No. of hits are finished" });
            }
            else
            {            	
            	res.send({status: "failure",error: "Distance is more" });
            }
        }
            else
            {            	
            	res.send({status: "failure",error: "Coupon Not Found" });
            }
     	});
    }); 
var generatecode1 = function() {
	var gencode = randtoken.generate(2)+'-'+randtoken.generate(2)+'-'+randtoken.generate(2);
	gencode = gencode.toUpperCase();
	return gencode;
}
var generatecode2 = function() {
	var gencode = randtoken.generate(3)+'-'+randtoken.generate(3)+'-'+randtoken.generate(3);
	gencode = gencode.toUpperCase();
	return gencode;
}
var generatecode3 = function() {
	var gencode = randtoken.generate(2)+'-'+randtoken.generate(2)+'-'+randtoken.generate(3)+'-'+randtoken.generate(3);
	gencode = gencode.toUpperCase();
	return gencode;
}
var generatecode4 = function() {
    var gencode = randomword ( 9 );
    gencode = gencode.toUpperCase();
	return gencode;
}
app.get('/',function(req,res){
	res.send("Token Bases API");
})

app.get('/*',function(req,res){
	res.send({status: "failure",error: "Wrong URL" });
})

var port = process.env.PORT || 3000
app.listen(port, function() {
    console.log("App is running on port " + port);
});