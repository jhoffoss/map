const express = require('express');
const router = express.Router();
const sha1 = require('sha1');
const session = require('express-session');
const mongo = require('mongodb');
const monk = require('monk');
const db = monk('localhost:27017/nodetest1');
const bodyParser = require('body-parser');

router.use(session({secret: 'llama'}));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));

var sess;

/* GET home page. */
router.get('/', function(req, res, next) {
	sess=req.session;

	if(sess.email) {
		res.redirect('map');
	} else {
		res.render('index');
	}

});

router.get('/index', function(req, res, next) {
	res.redirect('./');
});

/* GET Userlist page. */
router.get('/searchlist', function(req, res) {
	var db = req.db;
	var collection = db.get('searchcollection');
	collection.find({},{},function(e,docs){
		res.render('searchlist', {
			"searchlist" : docs
		});
	});
});

router.get('/success', function(req, res) {
	res.render('success', {
		sid : docs.sid
	});
});

/* GET New User page. */
router.get('/login', function(req, res) {
	sess = req.session;
	sess.email=req.body.email;
	res.end('done');
	/*
	if (!req.query.username || !req.query.password) {
		res.render('login', {
			title: 'Login to a Search'
		});
	} else if(req.query.username == "amy" || req.query.password == "amyspassword") {
		req.session.user = "amy";
		req.session.admin = true;
		res.send("login success!");
	}*/
});

// Login endpoint
router.get('/admin',function(req,res){
	sess = req.session;
	if(sess.email) {
		res.write('<h1>Hello '+sess.email+'</h1>');
		res.end('<a href="+">Logout</a>');
	} else {
		res.write('<h1>Please login first.</h1>');
		res.end('<a href="+">Login</a>');
	}
});

// Logout endpoint
router.get('/logout',function(req,res) {
	req.session.destroy(function (err) {
		if (err) {
			console.log(err);
		} else {
			res.redirect('/');
		}
	});
});

// Get content endpoint
router.get('/content', function (req, res) {
	res.send("You can only see this after you've logged in.");
});

/* GET home page. */
router.get('/map', function(req, res, next) {
	res.render('index');
});


/* POST to login */
router.post('/map', function(req, res) {

	// Set our internal DB variable
	var db = req.db;

	// Get our form values. These rely on the "name" attributes
	var sid = req.body.sid;
	var password = sha1(req.body.password)+sid;

	// Set our collection
	var collection = db.get('searchcollection');

	collection.findOne({"sid": sid},function (err, doc) {
		if (err) {
			// If it failed, return error
			res.redirect('index');
		}
		if (doc) {
			if (doc.tpass == password) {
				res.render('map', { role: "Logged in as a Team Leader", sinfo: doc})
			}
			else if (doc.apass == password) {
				res.render('map', { role: "Logged in as an Administrator", sinfo: doc})
			}
			else {
				res.render('map', { role: "Logged in as a Standard User", sinfo: doc})
			}
		}
		else {
			// Else forward to success page
			res.render('index', { error: "Sorry, that's an invalid Search ID."});
		}
	});

});


/* GET New User page. */
router.get('/register', function(req, res) {
	res.render('register', { title: 'Register a New Search' });
})

/* POST to Add User Service */
router.post('/register', function(req, res) {

	// Set our internal DB variable
	var db = req.db;

	// Get our form values. These rely on the "name" attributes
	var sid = req.body.sid;
	var sName = req.body.sname;
	var tPass = sha1(req.body.tpassword)+sid;
	var rawPass = req.body.apassword;
	var aPass = sha1(req.body.apassword)+sid;
	var email = req.body.email;

	// Set our collection
	var collection = db.get('searchcollection');

	// Submit to the DB
	collection.insert({
		"sid" : sid,
		"sname" : sName,
		"tpass" : tPass,
		"apass" : aPass,
		"email" : email
	}, function (err, doc) {
		if (err) {
			// If it failed, return error
			res.send("There was a problem adding the information to the database.");
		}
		else {
			// And forward to success page
			res.render('success',{
				sid: sid,
				apass: aPass,
				rawpassword: rawPass
			});
		}
	});
});

module.exports = router;
