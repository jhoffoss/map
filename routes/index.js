const express = require('express');
const router = express.Router();
const sha1 = require('sha1');
const session = require('express-session');
const mongo = require('mongodb');
const monk = require('monk');
const dbadd = "localhost:27017/map"
const db = monk(dbadd);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const crypto = require('crypto');
const mime = require('mime');

router.use(cookieParser());

/* GET home page. */
router.get('/', function(req, res, next) {

	if(req.cookies.sinfo) {
		var db = req.db;
		var collection = db.get('searchcollection');

		collection.findOne({"sid": req.cookies.sinfo.sid},function (err, doc) {
			if (doc) {
				res.redirect('map');
			}
			else {
				res.redirect('logout');
			}
		})
	} else {
		res.render('index');
	}
});

router.get('/index', function(req, res, next) {
	res.redirect('./');
});

router.get('/success', function(req, res) {
	res.render('success', {
		sid : docs.sid
	});
});

/* GET New User page. */
router.get('/login', function(req, res) {

	if(!req.cookies.sinfo) {
		res.render('login', {
			title: 'Login to a Search'
		});
	} else {
		res.redirect('./');
	}
});


/* GET home page. */
router.get('/map', function(req, res, next) {

	var db = req.db;	// allows use of a db
	var collection = db.get('searchcollection');   //assigned our db to var

	if(req.cookies.sinfo) { // checks for cookies
		collection.findOne({"sid": req.cookies.sinfo.sid},function (err, doc) {
			if (req.cookies.sinfo.role == 2) {
				res.render('map', {roleTitle: "You are logged in as the Coordinator.", sinfo:doc, role:2,
					mapData: {
						groundData: JSON.stringify(doc.mapData.groundLayer),
						airData: JSON.stringify(doc.mapData.airLayer),
						waterData: JSON.stringify(doc.mapData.waterLayer),
						evidenceData: JSON.stringify(doc.mapData.evidenceLayer)
					}});
			}
			else if (req.cookies.sinfo.role == 1) {
				res.render('map', {roleTitle: "You are logged in as a Team Leader.", sinfo:doc, role:1,
					mapData: {
						groundData: JSON.stringify(doc.mapData.groundLayer),
						airData: JSON.stringify(doc.mapData.airLayer),
						waterData: JSON.stringify(doc.mapData.waterLayer),
						evidenceData: JSON.stringify(doc.mapData.evidenceLayer)
					}});
			}
			else {
				console.log(req.cookies.sinfo.role);
				res.render('map', {roleTitle: "You are logged in as a Volunteer.", sinfo:doc, role:0,
					mapData: {
						groundData: JSON.stringify(doc.mapData.groundLayer),
						airData: JSON.stringify(doc.mapData.airLayer),
						waterData: JSON.stringify(doc.mapData.waterLayer),
						evidenceData: JSON.stringify(doc.mapData.evidenceLayer)
					}});
			}
		})
	} else {
		res.render('index', { error: "You need to login with a valid Search ID to view the map. (999)"});
	}
});


/* POST to login */
router.post('/map', function(req, res) {

	var db = req.db;
	var sid = req.body.sid;
	console.log("DA PASS: " + req.body.password);
	if((req.body.password).length > 2) {
		var passLower = req.body.password;
		var password = sha1(passLower.toLowerCase()) + sid;
	} else {
		var password = sha1("Here there be monsters");
	}
	console.log(password);
	var collection = db.get('searchcollection');

	collection.findOne({"sid": sid},function (err, doc) {
		if (err) {
			// If it failed, return error
			res.redirect('index');
		}
		if (doc) {
			if (doc.teamPass == password) {
				console.log("Team Login");
				res.cookie('sinfo', {sid:sid, role:1});
				console.log(req.cookies.sinfo);
				res.render('map', {roleTitle: "You are logged in as a Team Leader.", sinfo:doc, role:1,
					mapData: {
						groundData: JSON.stringify(doc.mapData.groundLayer),
						airData: JSON.stringify(doc.mapData.airLayer),
						waterData: JSON.stringify(doc.mapData.waterLayer),
						evidenceData: JSON.stringify(doc.mapData.evidenceLayer)
					}});
			}
			else if (doc.coordPass == password) {
				console.log("Coordinator Login");
				res.cookie('sinfo', {sid:sid, role:2});
				console.log(req.cookies.sinfo);
				res.render('map', { roleTitle: "You are logged in as the Coordinator", sinfo: doc, role:2,
					mapData: {
						groundData: JSON.stringify(doc.mapData.groundLayer),
						airData: JSON.stringify(doc.mapData.airLayer),
						waterData: JSON.stringify(doc.mapData.waterLayer),
						evidenceData: JSON.stringify(doc.mapData.evidenceLayer)
				}});
			}
			else {
				console.log("Volunteer Login");
				res.cookie('sinfo', {sid:sid, role:0});
				console.log(sid + " " + doc);
				res.render('map', { roleTitle: "You are logged in as a Volunteer.", sinfo: doc, role:0,
					mapData: {
						groundData: JSON.stringify(doc.mapData.groundLayer),
						airData: JSON.stringify(doc.mapData.airLayer),
						waterData: JSON.stringify(doc.mapData.waterLayer),
						evidenceData: JSON.stringify(doc.mapData.evidenceLayer)
				}});
			}
		}
		else {
			// Else forward to success page
			res.render('index', { error: "Sorry, that's an invalid Search ID."});
		}
	});

});


///////////////////////////////// REGISTER A SEARCH //////////////////////////////////////////////////////

/* GET New User page. */
router.get('/register', function(req, res) {
	res.clearCookie('sinfo');
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
	var timestamp = new Date().getTime();
	// Set our collection
	var collection = db.get('searchcollection');

	res.cookie('sinfo', {sid:sid, role:2});

	// Submit to the DB
	collection.insert({
		"sid" : sid,
		"teamPass" : tPass,
		"coordPass" : aPass,
		"email" : email,
		"searchName" : sName,
		"profile" : {
			"victimName": null,
			"lastKnownLocation": null,
			"lastSeenWearing": null,
			"city" : null,
			"stateLost" : null,
			"vehicle": {
				"make": null,
				"model": null,
				"year": null,
				"color": null,
				"details": null
			},
			"physicalDescription": {
				"age": null,
				"gender": null,
				"height": null,
				"weight": null,
				"hair": null,
				"eyes": null,
				"extra": null
			},
			"imageURL": null,
			"state": {
				"found": "NOT",
				"active": "ACTIVE",
				"dateCreated": timestamp
			}
		},
		"mapData" : {
			"centerpoint": {
				"lat": 44.8298,
				"long": -93.3317,
				"zoom": 14
			},
			"airLayer": {
				"type": "FeatureCollection",
				"name": "polygons",
				"features":
					[   ]
			},
			"groundLayer": {
				"type": "FeatureCollection",
				"name": "polygons",
				"features":
					[   ]
				},
			"waterLayer": {
				"type": "FeatureCollection",
				"name": "polygons",
				"features":
					[   ]
			},
			"evidenceLayer": {
				"type": "FeatureCollection",
				"name": "polygons",
				"features":
					[   ]
			}
		}
	}, function (err, doc) {
		if (err) {
			// If it failed, return error
			res.send("There was a problem adding the information to the database.");
		}
		else {
			res.render('success',{
				sinfo: doc,
				coordPass: aPass,
				rawpassword: rawPass
			});
		}
	});
});

//////////////////////////////////////////// DISPLAY PROFILE /////////////////////////////////////////////

router.get('/profile', function(req, res) {
		var db = req.db;
		var sid = req.cookies.sinfo.sid;
		var collection = db.get('searchcollection');
		var role = req.cookies.sinfo.role;

		collection.findOne({"sid": req.cookies.sinfo.sid}, function (err, doc) {
			if (err) {
				res.render('index', {error: "There seems to be some sort of error. (0020)"});
			}
			else {
				console.log("Found the search.");
				res.render('profile', {title: 'Search Profile', sinfo:doc, role:role});
			}
		});
});


//////////////////////////////////  CREATE PROFILE  /////////////////////////////////////////////////


router.get('/createprofile', function(req, res) {
	if(req.cookies.sinfo) {
		res.render('createprofile', { title: 'Create a Search Profile' });
	} else {
		res.render('index', { error: "You need to login with a valid Search ID to view the map. (111)"});
	}
});

// Populating the Profile
router.post('/createprofile', function(req, res) {
	if(req.cookies.sinfo) {
		var db = req.db;
		var sid = req.cookies.sinfo.sid;
		var collection = db.get('searchcollection');

		collection.findOne({"sid": req.cookies.sinfo.sid},function (err, doc) {
			if(err) {
				res.render('index', {error: "There seems to be some sort of error. (0030)"});
			}
			else {
				collection.update(
					{"sid": sid},
					{$set: {
						"sid" : doc.sid,
						"teamPass" : doc.teamPass,
						"coordPass" : doc.coordPass,
						"email" : doc.email,
						"searchName" : doc.searchName,
						"profile" : {
							"name" : req.body.pname,
							"lastKnownLocation" : req.body.lkl,
							"lastSeenWearing" : req.body.lsw,
							"city" : req.body.city,
							"stateLost" : req.body.stateLost,
							"vehicle" : {
								"make": req.body.vmake,
								"model": req.body.vmodel,
								"year": req.body.vyear,
								"color": req.body.vcolor,
								"details":req.body.vdetails
							},
							"physicalDescription" : {
								"age": req.body.page,
								"gender": req.body.pgender,
								"height": req.body.pheight,
								"weight": req.body.pweight,
								"hair": req.body.phair,
								"eyes": req.body.peye,
								"extra": req.body.pdetails
							},
							"imageURL": 'images/upload/placeholder.png',
							"state": doc.profile.state
						},
						"mapData" : doc.mapData
					}}),
					function (err, doc) {
						if (err) {
							// If it failed, return error
							console.log(err);
							res.send("There was a problem adding the information to the database.");
						}
						else {
							res.render('map',{
								sinfo: doc,
								roleTitle: "You are logged in as the Coordinator."
							});
						}
					};
				collection.findOne({"sid": req.cookies.sinfo.sid},function (err, doc) {
					res.redirect('map');
				});
			}
		})
	} else {
		res.render('index', { error: "You need to login with a valid Search ID to view the map. (888)"});
	}

});

//////////////////////////////////  UPDATE PROFILE  /////////////////////////////////////////////////


router.get('/updateprofile', function(req, res) {

	if(req.cookies.sinfo && req.cookies.sinfo.role == 2) {
		var db = req.db;
		var sid = req.cookies.sinfo.sid;
		var collection = db.get('searchcollection');

		collection.findOne({"sid": req.cookies.sinfo.sid}, function (err, doc) {
			if (err) {
				res.render('index', {error: "There seems to be some sort of error. (0025)"});
			}
			else {
				res.render('updateprofile', { title: 'Update your Search Profile', sinfo:doc, role:2});
			}
		});
	} else {
		res.redirect('/logout');
	}});


// Populating the Profile
router.post('/updateprofile', function(req, res) {

	// Set our internal DB variable
	// Get our form values. These rely on the "name" attributes

	if(req.cookies.sinfo && req.cookies.sinfo.role == 2) {
		var db = req.db;
		var sid = req.cookies.sinfo.sid;
		var collection = db.get('searchcollection');

		collection.findOne({"sid": req.cookies.sinfo.sid},function (err, doc) {
			if(err) {
				res.render('index', {error: "There seems to be some sort of error. (0035)"});
			}
			else {

				// Submit to the DB
				collection.update(
					{"sid": sid},
					{$set: {
					"sid" : doc.sid,
					"teamPass" : doc.teamPass,
					"coordPass" : doc.coordPass,
					"email" : doc.email,
					"searchName" : doc.searchName,
					"city" : req.body.city,
					"stateLost" : req.body.stateLost,
					"profile" : {
						"name" : req.body.pname,
						"lastKnownLocation" : req.body.lkl,
						"lastSeenWearing" : req.body.lsw,
						"vehicle" : {
							"make": req.body.vmake,
							"model": req.body.vmodel,
							"year": req.body.vyear,
							"color": req.body.vcolor,
							"details":req.body.vdetails
						},
						"physicalDescription" : {
							"age": req.body.page,
							"gender": req.body.pgender,
							"height": req.body.pheight,
							"weight": req.body.pweight,
							"hair": req.body.phair,
							"eyes": req.body.peye,
							"extra": req.body.pdetails
						},
						"imageURL": doc.profile.imageURL,
						"state": {
							"found": req.body.found,
							"active": req.body.active,
							"dateCreated": doc.profile.state.dateCreated
						}
						},
					"mapData" : doc.mapData
					}}),
					function (err, doc) {
						if (err) {
							// If it failed, return error
							console.log(err);
							res.send("There was a problem adding the information to the database.");
						}
						else {
							res.render('map',{
								sinfo: doc,
								roleTitle: "You are logged in as the Coordinator.",
								role: 2
							});
						}
					};
				collection.findOne({"sid": req.cookies.sinfo.sid},function (err, doc) {
					res.redirect('map');
				});
			}
		})
	} else {
		res.render('index', { error: "You need to login with a valid Search ID to view the map. (777)"});
	}

});


router.get('/survival', function(req, res) {
	res.render('survival');
});


// Logout endpoint
router.get('/logout',function(req,res) {
	if(req.cookies.sinfo){res.clearCookie('sinfo');}
	res.redirect('/');
});

/////////////////////////////////////////////////// UPLOADING //////////////////////////////////////////////

var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, './public/images/upload/');
	},
	filename: function (req, file, cb) {
		crypto.pseudoRandomBytes(16, function (err, raw) {
			var filename2 = 'avatar' + '-' + req.cookies.sinfo.sid + '.' + mime.extension(file.mimetype)
			cb(null, filename2);
		});
	}
});

var upload = multer({storage: storage});

router.get('/upload', function(req, res) {
	if(req.cookies.sinfo.role == 2) {
		res.render('upload', {role: 2});
	} else {
		res.redirect('/logout');
	}});



router.post('/upload', upload.single('image'), function(req,res,next) {

	if(req.cookies.sinfo) {

		if(req.file) {
			var db = req.db;
			var sid = req.cookies.sinfo.sid;
			var collection = db.get('searchcollection');

			collection.findOne({"sid": sid}, function (err, doc) {
				if (err) {
					res.render('index', {error: "There seems to be some sort of error. (0035)"});
				}
				else {
					var filepath = '/images/upload/' + req.file.filename;
					collection.update({"sid": sid}, {
						$set: {
							"profile.imageURL": filepath
						}
					});
					console.log('Got request from server!');
					console.log('File: ', req.file);
				}

			})
		} else {
				res.redirect('map');
		}

	res.redirect('map');
	// Add upload overlay box to profile image, use db.dot.path.update.shit to only updatt imageURL.
	} else {
		res.redirect('/logout');
	}});



///////////////////////// BIND TO MAP  ////////////////////////////////////

router.post('/addtomap', function(req, res) {

	if (req.cookies.sinfo.role == 2 || req.cookies.sinfo.role == 1) {
		var db = req.db;
		var sid = req.cookies.sinfo.sid;
		var collection = db.get('searchcollection');
		var type = req.body.type;

		var newShape = JSON.parse((req.body.dbShape).replace(/&quot;/g, '"'));


		collection.findOne({"sid": req.cookies.sinfo.sid},function (err, doc) {
			if(err) {
				console.log(err);
				res.render('index', {error: "There seems to be some sort of error. (0035)"});
			}
			else {
				var details = (req.body.details).replace(/\n/g, ' |n| ').replace(/\r/g, ' |r| ').replace(/\t/g, ' |t| ').replace(/\"/g,'\'\'');
				if(type == "ground"){
					newShape.properties["miscDetails"] = details;
					newShape.properties["teamName"] = req.body.teamName;
					newShape.properties["dateTime"] = req.body.dateTime;
					newShape.properties["id"] = req.body.uid;
					collection.update({"sid": sid},{$push: {
						"mapData.groundLayer.features": newShape
					}});
					res.redirect('map');

				} else if(type == "air"){
					newShape.properties["miscDetails"] = details;
					newShape.properties["teamName"] = req.body.teamName;
					newShape.properties["dateTime"] = req.body.dateTime;
					newShape.properties["id"] = req.body.uid;
					collection.update({"sid": sid},{$push: {
						"mapData.airLayer.features": newShape
					}});
					res.redirect('map');

				} else if(type == "water"){
					newShape.properties["miscDetails"] = details;
					newShape.properties["teamName"] = req.body.teamName;
					newShape.properties["dateTime"] = req.body.dateTime;
					newShape.properties["id"] = req.body.uid;
					collection.update({"sid": sid},{$push: {
						"mapData.waterLayer.features": newShape
					}});
					res.redirect('map');

				} else {
					newShape.properties["evDetails"] = details;
					newShape.properties["teamName"] = req.body.teamName;
					newShape.properties["imageURL"] = req.body.imageURL;
					newShape.properties["dateTime"] = req.body.dateTime;
					newShape.properties["evType"] = req.body.evType;
					newShape.properties["id"] = req.body.uid;
					newShape.properties["icon"] = {
						iconUrl: "/images/icons/add-evidence-large.png",
							iconSize: [30, 30], // size of the icon
							iconAnchor: [14, 25], // point of the icon which will correspond to marker's location
							popupAnchor: [-10, -20], // point from which the popup should open relative to the iconAnchor
							className: "dot"
					};
					collection.update({"sid": sid},{$push: {
						"mapData.evidenceLayer.features": newShape
					}});

					res.redirect('map');
					//res.render('editevidence', {uid : req.body.uid});
						//render(editevidence,{uid: req.body.uid, role:2, title: "Edit Evidence"});

				}
			}
		});
	} else {
		res.redirect('/logout');
	}});



router.get('/editevidence', function(req, res) {
	if (req.cookies.sinfo.role == 2 && req.query.uid) {
		res.render('editevidence', {uid: req.query.uid, role: 2, title: "Edit Evidence"});
	} else {
		res.send("UID and/or Cookie Error");
	}
});

router.post('/editevidence', function(req, res) {

	if (req.cookies.sinfo.role == 2) {
		var db = req.db;
		var sid = req.cookies.sinfo.sid;
		var collection = db.get('searchcollection');
		var uid = req.body.uid;

		collection.findOne({"mapData.evidenceLayer.features.properties.id": uid}, function (err, doc) {
			if (err) {
				console.log(err);
				res.render('index', {error: "There seems to be some sort of error. (0035)"});
			}
			else {
				console.log(doc);
				collection.update({"mapData.evidenceLayer.features.properties.id": uid},
					{$set: {
						"mapData.evidenceLayer.features.$.properties": {
							id: uid,
							teamName: req.body.teamName,
                            evDetails: req.body.evDetails,
                            dateTime: req.body.dateTime,
							evType: req.body.evType,
							imageURL: req.body.imageURL,
							icon: {
								iconUrl: "/images/icons/add-evidence-large.png",
								iconSize: [30, 30], // size of the icon
								iconAnchor: [-25, -25], // point of the icon which will correspond to marker's location
								popupAnchor: [-10, -20], // point from which the popup should open relative to the iconAnchor
								className: "dot"
							}
						}
					}},function (err, doc) {
						if(err){
							console.log(err);
						} else {
							console.log(doc);
						}
					}
				);
			}
		});
		console.log("withPhoto: " + req.body.withPhoto);
		console.log("withoutPhoto: " + req.body.withoutPhoto);
		if(req.body.withoutPhoto == undefined) {
			res.redirect('/addEvidenceImage?uid='+req.body.uid);
		} else {
			res.redirect('map');
		}




	} else {
		res.render('index', {error: "There seems to be some sort of error. (1035)"});
	}
});

router.get('/addEvidenceImage', function(req, res) {
	if (req.cookies.sinfo.role == 2 || req.cookies.sinfo.role == 1) {
		res.render('addEvidenceImage', {uid: req.query.uid, role: req.cookies.sinfo.role, title: "Add Photo of Evidence"});
	} else {
		res.redirect('logout');
	}
});



var evStorage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, './public/images/upload/');
	},
	filename: function (req, file, cb) {
		crypto.pseudoRandomBytes(16, function (err, raw) {
			var filename2 = 'evidence' + '-' + req.cookies.sinfo.sid + Date.now() + '.' + mime.extension(file.mimetype)
			cb(null, filename2);
		});
	}
});

var evUpload = multer({storage: evStorage});

router.post('/addEvidenceImage', evUpload.single('evimage'), function(req,res,next) {
	if(req.cookies.sinfo.role == 2 || req.cookies.sinfo.role == 1) {
		var db = req.db;
		var sid = req.cookies.sinfo.sid;
		var collection = db.get('searchcollection');
		var uid = req.body.uid;

		collection.findOne({"mapData.evidenceLayer.features.properties.id": uid}, function (err, doc) {
			if(err) {
				res.render('index', {error: "There seems to be some sort of error. (0035)"});
			}
			else {
				console.log(doc);
				var filepath2 = '/images/upload/' + req.file.filename;
				console.log("Filepath: " + filepath2);
				collection.update(
					{"mapData.evidenceLayer.features.properties.id": uid},
					{$set: {
						"mapData.evidenceLayer.features.$.properties.imageURL":filepath2
					}});
			}
		});
		res.redirect('map');
	} else {
		res.redirect('logout');
	}});

router.get('/deleteById', function(req, res) {

	if(req.cookies.sinfo.role == 2 || req.cookies.sinfo.role == 1) {
		var db = req.db;
		var sid = req.cookies.sinfo.sid;
		var collection = db.get('searchcollection');
		var uid = req.query.uid;

		collection.findOne({"sid": sid}, function (err, doc) {
			if(err) {
				res.render('index', {error: "There seems to be some sort of error. (0035)"});
			}
			else {
				collection.update({"mapData.evidenceLayer.features.properties.id": uid},
					{
						$set : {
							"mapData.evidenceLayer.features.$" : {
								hide:true
							}
						}
					}, function(err,doc){
						if(err){
							console.log(err)
						}else{
							console.log("doc: " + doc)
						}
					}, false )

				collection.update({"mapData.groundLayer.features.properties.id": uid},
					{
						$set : {
							"mapData.groundLayer.features.$" : {
								hide:true
							}
						}
					}, function(err,doc){
						if(err){
							console.log(err)
						}else{
							console.log("doc: " + doc)
						}
					}, false )

				collection.update({"mapData.waterLayer.features.properties.id": uid},
					{
						$set : {
							"mapData.waterLayer.features.$" : {
								hide:true
							}
						}
					}, function(err,doc){
						if(err){
							console.log(err)
						}else{
							console.log("doc: " + doc)
						}
					}, false )

				collection.update({"mapData.airLayer.features.properties.id": uid},
					{
						$set : {
							"mapData.airLayer.features.$" : {
								hide:true
							}
						}
					}, function(err,doc){
						if(err){
							console.log(err)
						}else{
							console.log("doc: " + doc)
						}
					}, false )


			}
		});

		res.redirect('map');

	} else {
		res.redirect('logout');
	}});

module.exports = router;
