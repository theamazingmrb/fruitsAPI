/* Require modules
--------------------------------------------------------------- */
const express = require("express");
const router = express.Router();
const jwt = require("jwt-simple");
const config = require("../jwt.config.js");

/* Require the db connection, and models
--------------------------------------------------------------- */
const db = require("../models");

const authMiddleware = (req, res, next) => {
    // Check if the 'Authorization' header is present and has the token
    const token = req.headers.authorization;
    console.log(req.headers)
    if (token) {
      console.log(token, config.jwtSecret)
        try {
            // Decode the token using the secret key and add the decoded payload to the request object
            const decodedToken = jwt.decode(token, config.jwtSecret);
            console.log(decodedToken, 'decodedToken ////////////')
            req.user = decodedToken;
            next();
        } catch (err) {
            // Return an error if the token is invalid
            res.status(401).json({err});
        }
    } else {
        // Return an error if the 'Authorization' header is missing or has the wrong format
        res.status(401).json({ message: 'Missing or invalid Authorization header' });
    }
};

// INDEX - Returns all fruits as JSON
router.get("/", (req, res) => {
  db.Fruit.find({})
    .then((fruits) => res.json(fruits))
    .catch((err) => res.json({ error: err.message }));
});

// First Way) Add middleware above all routes that need it
// Applies to all routes below this line
router.use(authMiddleware)


//Second Way add it directly to specific routes
// CREATE - Adds a new fruit and returns the created fruit as JSON
router.post("/", authMiddleware, (req, res) => {
  if(req.body.readyToEat === "on") req.body.readyToEat = true;
  else req.body.readyToEat = false;
  console.log(req.body);

  // req.body.user = req.user._id
  console.log(req.user)
  db.Fruit.create({...req.body, user: req.user.id})
    .then((fruit) => res.json(fruit))
    .catch((err) => res.json({ error: err.message }));
});

// SHOW - Returns a single fruit by ID as JSON
router.get("/:id", (req, res) => {
  db.Fruit.findById(req.params.id)
    .then((fruit) => {
      if (!fruit) res.status(404).json({ error: "Fruit not found" });
      else res.json(fruit);
    })
    .catch((err) => res.json({ error: err.message }));
});

// UPDATE - Updates a specific fruit and returns the updated fruit as JSON
router.put("/:id", (req, res) => {
  if(req.body.readyToEat === "on") req.body.readyToEat = true;
  else req.body.readyToEat = false;

  db.Fruit.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((fruit) => res.json(fruit))
    .catch((err) => res.json({ error: err.message }));
});

// DELETE - Deletes a specific fruit and returns a success message
router.delete("/:id", async (req, res) => {
  const fruit = await db.Fruit.findById(req.params.id)

  if(!fruit) return res.status(404).json({ error: "Fruit not found" });

  if(fruit?.user?.toString() === req.user.id.toString()){
    await db.Fruit.findByIdAndDelete(req.params.id)
    res.json({ message: "Fruit successfully deleted" })
  }else{
    res.status(401).json({ message: "Unauthorized" });
  }
});

module.exports = router;
