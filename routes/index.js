var express = require("express");
var router = express.Router();
var passport = require("passport");

var User = require("../models/user");
var Campground = require("../models/campground");

// ROOT Route
router.get("/", function(req, res){
    res.render("landing");
});

// ========================================
// AUTH ROUTES
// ========================================

// show register form
router.get("/register", function(req, res){
    res.render("register", {page: 'register'});
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User(
        {
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            avatar: req.body.avatar
        });
        
    if(req.body.adminCode === "secretcode123"){
        newUser.isAdmin = true;
    }
    
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        } 
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Yelp Camp " + req.body.username);
            res.redirect("/campgrounds");
        });
    });
});

// show login form
router.get("/login", function(req, res){
    res.render("login", {page: 'login'});
});

//handle login logic
router.post(   "/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
        failureFlash: true
    }), 
    function(req, res){
    });

// logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "You have been logged out.");
    res.redirect("/campgrounds");
});

// USERS PROFILES
router.get("/users/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err || !foundUser){
            req.flash("error", "User not found");
            res.redirect("/");
        } else {
            Campground.find().where("author.id").equals(foundUser._id).exec(function(err, usersCampgrounds){
                if(err || !usersCampgrounds){
                    req.flash("error", "Something went wrong");
                    res.redirect(("/"));
                }
                res.render("users/show", {user: foundUser, campgrounds: usersCampgrounds});
            });
        }
    });
});

module.exports = router;