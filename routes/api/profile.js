const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load Profile Model
const Profile = require("../../models/Profile");
// Load User Model
const User = require("../../models/User");

// @Route GET api/profile/test
// @desc test profile route
// @access Public
router.get("/test", (req, res) =>
  res.json({
    message: "Profile works"
  })
);

// @Route GET api/profile
// @desc get current user profile
// @access Public
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          errors.noprofile = "there is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @Route POST api/profile
// @desc Create or Edit user profile
// @access private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Get fields
    const profileFields = {};
    profileFields.user = req.user.id;

    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.gethubusername)
      profileFields.gethubusername = req.body.gethubusername;
    if (typeof req.body.skills !== "undefined") {
      // Skills split into array
      profileFields.skills = req.body.skills.splilt(",");
    }
    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        // if profile found it means where here to update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        // this means create new
        // Check if handle exixsts
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            //ifit finds a profile with the same handle
            errors.handle = "that handle already exists";
            res.status(400).json(errors);
          }
          //Save profile
          new Profile(profileFields)
            .save()
            .then(profile => res.json({ profile }));
        });
      }
    });
  }
);

module.exports = router;
