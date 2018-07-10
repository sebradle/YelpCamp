var Comment = require("../models/comment");
var Campground = require("../models/campground");

var middlewareObj = {};

middlewareObj.isLoggedIn = function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to continue");
    res.redirect("/login");
}

middlewareObj.checkCampgroundOwnership = function checkCampgroundOwnership(req, res, next){
    if(req.isAuthenticated()){
        // redirect
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err || !foundCampground){
                req.flash("error", "Campground not found");
                res.redirect("back");
            } 
            else {
                // does user own the campground
                if(foundCampground.author.id.equals(req.user.id) || req.user.isAdmin){
                    next();
                } 
                else {
                    req.flash("error", "You don't have proper permission to do that ");
                    res.redirect("back");
                }
            }
        });
    } 
    // redirect
    else { 
        req.flash("error", "You need to be logged in to continue");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function checkCommentOwnership(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err  || !foundComment){
                req.flash("error", "Comment not found");
                res.redirect("back");
           } else {
               if(foundComment.author.id.equals(req.user._id)  || req.user.isAdmin){
                   next();
               } else {
                    req.flash("error", "You don't have proper permission to do that ");
                    res.redirect("back");
               }
           }
        });
    } else {
        req.flash("error", "You need to be logged in to continue");
        res.redirect("back");
    }
}

module.exports = middlewareObj;