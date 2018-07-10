var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var MiddleWare = require("../middleware");
var NodeGeocoder = require("node-geocoder");

var options = {
  provider: "google",
  httpAdapter: "https",
  apiKey:  process.env.GEOCODER_API_KEY,
  formatter: null
};

var geocoder = NodeGeocoder(options);

// INDEX - show all campgrounds
router.get("/", function(req, res){
    Campground.find({}, function(err, allcampgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allcampgrounds, page: "campgrounds"});
        }
    });
});

//CREATE - add new campground to DB
router.post("/", MiddleWare.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var cost = req.body.cost;
  var url = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, cost: cost, image: url, description: desc, author: author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            res.redirect("back");
        } else {
            //redirect back to campgrounds page
            req.flash("success", "Created campground: " + newlyCreated.name);
            res.redirect("/campgrounds");
        }
    });
  });
});

// NEW - show form to create new campground
router.get("/new", MiddleWare.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

// SHOW - shows more info on individual campgrounds
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            //render show template for foundCampground
            res.render("campgrounds/show", {campground:foundCampground});
        }
    });
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", MiddleWare.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});
    
// UPDATE CAMPGROUND ROUTE
router.put("/:id", MiddleWare.checkCampgroundOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", MiddleWare.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err, foundCampground){
       if(err){
           res.redirect("back");
       } else {
            req.flash("error", foundCampground.name + " deleted");
            res.redirect("/campgrounds");
       }
    });
});

module.exports = router;