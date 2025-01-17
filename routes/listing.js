const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn } = require("../middleware.js");

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(404, errMsg);
  } else {
    next();
  }
};

//index route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
  })
);

//new route

router.get(
  "/new",
  isLoggedIn,
  wrapAsync((req, res) => {
    console.log(req.user);
    res.render("./listings/new.ejs");
  })
);

//show route

router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate("reviews")
      .populate("owner");
    if (!listing) {
      req.flash("error", "listing you requested for does not exist");
      res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
  })
);

//create route

router.post(
  "/",
  validateListing,
  isLoggedIn,
  wrapAsync(async (req, res, next) => {
    const newListings = new Listing(req.body.listing);
    //add below line  when u get error
    //Cannot read properties of undefined (reading 'username')
    newListings.owner = req.user._id;
    await newListings.save();
    req.flash("success", "New Listing created");
    res.redirect("/listings");
  })
);

// //edit route

router.get(
  "/:id/edit",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    req.flash("success", "Listing edited successfully ");
    if (!listing) {
      req.flash("error", "listing you requested for does not exist");
      res.redirect("/listings");
    }

    res.render("./listings/edit.ejs", { listing });
  })
);

//update route

router.put(
  "/:id/",
  validateListing,
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing updated successfully ");

    res.redirect("/listings");
  })
);

//delete route

router.delete(
  "/:id/",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing deleted successfully");

    res.redirect("/listings");
  })
);

module.exports = router;
