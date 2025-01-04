const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOveride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/expressError.js");
const { listingSchema } = require("./schema.js");
const app = express();
port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOveride("_method"));
app.use(express.json());
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// main()
//   .then((res) => {
//     console.log("connected to db");
//   })
//   .catch((err) => {
//     console.log(err);
//   });
const MONGO =
  "mongodb+srv://nadimkhan:877hKGb1uL45LKhm@cluster0.nvurw.mongodb.net/wanderlust?";
//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then((res) => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(MONGO);
}

//homepage
app.get("/", (req, res) => {
  res.redirect("/listings");
});

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    throw new ExpressError(404, error);
  } else {
    next();
  }
};
//index route
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
  })
);

//new route

app.get(
  "/listings/new",
  wrapAsync((req, res) => {
    res.render("./listings/new.ejs");
  })
);

//show route

app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
  })
);

//create route

app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res, next) => {
    const newListings = new Listing(req.body.listing);
    await newListings.save();
    res.redirect("/listings");
  })
);

// //edit route

app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", { listing });
  })
);

//update route

app.put(
  "/listings/:id/",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect("/listings");
  })
);

//delete route

app.delete(
  "/listings/:id/",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  })
);

//middlewares for custom error handling

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  // res.status(statusCode).send(message);
  res.render("error.ejs", { message });
});
app.listen(port, () => {
  console.log("server is running on port", port);
});
