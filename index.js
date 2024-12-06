const express = require('express');
const session = require('express-session'); // Import express-session
const cors = require('cors'); // Import cors
const app = express();
const pool = require("./dbpool.js");


app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));

app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// routes
// root route
app.get('/', (req, res) =>{
  res.render('index');
});


app.post("/login", async function(req, res){
  let userName = req.body.userName;
  let password = req.body.password;

  try {
    let check = `SELECT userId, userName, password FROM users WHERE userName = ? AND password = ?`;
    let params = [userName, password];
    let rows = await executeSQL(check, params);

    //console.log("User check result:", rows);

    if (rows.length > 0) {
      let sql = `SELECT * FROM location WHERE userId = ?`;
      let params = [rows[0].userId];
      let rows2 = await executeSQL(sql, params);

     // console.log("Location query result:", rows2);
      req.session.userId = rows[0].userId;
      const defaultFeatures = {
        Humidity: false,
        Wind: false,
        Pressure: false,
        Visibility: false,
        Sunrise: false,
        Sunset: false,
        Description: false,
        Cloudiness: false,
        Fahrenheit: true,
        Celsius: false
      };

      res.render("weatherView", {
        message: "Login Successful!",
        userId: rows[0].userId,
        locations: rows2,
        features: defaultFeatures,
        zipCode: ''
      });
    } else {
      res.render('index', {"message": "Login Failed! Invalid Username or Password"});
    }
  } catch (error) {
    console.error("Error executing login:", error);
    res.render('index', {"message": "An error occurred. Please try again."});
  }
});

// get account creation route
app.get("/account/create", (req, res) =>{
  res.render("createAccount");
});

// post account creation route
app.post("/account/create", async function(req, res){
  let userName = req.body.userName;
  let password = req.body.password;
  let check = `SELECT * FROM users WHERE userName = ?`;
  let params = [userName];
  let rows = await executeSQL(check, params);
  if(rows.length >= 1){
    res.render("createAccount", {"message": "Username taken!"});
   // console.log(rows);
    return;
  }else{
    //console.log("Username not taken");
  if(userName.length < 4){
    res.render("createAccount", {"message": "Username must be 4 characters or more"});
    return;
  }
  if(userName.length > 20){
    res.render("createAccount", {"message": "Username must be 20 or less characters"});
    return;
  }
  if(password.length < 6){
    res.render("createAccount", {"message": "Password must be 7 characters or more"});
    return;
  }
  if(password.length > 20){
    res.render("createAccount", {"message": "Password must be 20 or less characters"});
    return;
  }
  if(!/[A-Z]/.test(password)){
    res.render("createAccount", {"message": "Password must contain an uppercase letter"});
    return;
  }
  if (!/[a-z]/.test(password)){
    res.render("createAccount", {"message": "Password must contain a lowercase letter"});
    return;
  }
  if (!/[0-9]/.test(password)) {
    res.render("createAccount", {"message": "Password must contain a number"});
    return;
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    res.render("createAccount", {"message": "Password must contain a special character"});
    return;
  }

    try {
      sql = `INSERT INTO users (userName, password) VALUES (?, ?)`;
      params = [userName, password];
      await executeSQL(sql, params);
      //console.log("Rendering index.ejs with message: Account created!");
      res.render('index', {"message": "Account created!"});
    } catch (error) {
      console.error("Error creating account:", error);
      res.render("createAccount", {"message": "An error occurred while creating the account."});
    }
  }
  });

// get update account route
app.get("/account/update", async (req, res) =>{
  let userId = req.session.userId;
  let sql = `SELECT userId, userName, password FROM users WHERE userId = ?`;
  let params = [userId];
  let rows = await executeSQL(sql, params);
 // console.log(rows);
  res.render("updateAccount", { "userInfo": rows, locations: await getLocations(userId)});
});

// post update account route
app.post("/account/update", async function(req, res){
  let userId = req.session.userId;
  const { locationId } = req.body;
  let userName = req.body.userName;
  let password = req.body.password;
  //console.log(userId);
  //console.log(userName);
  //console.log(paswword);

  //Check if username exits for someone else
  let sql = `SELECT userId FROM users WHERE userName = ? AND userId != ?`;
  let params = [userName, userId];
  let rows = await executeSQL(sql, params);
  if (rows.length > 0) {
    res.render("updateAccount", {"userInfo": rows, "message": "Username already exists"});
    return;
  }
  if(userName.length < 4){
        let sql = `SELECT u.userId, u.userName as userName, u.password as password, l.zip, l.locationId as locationId FROM users u LEFT JOIN location l on u.userId = l.userId
        WHERE l.userId = ${userId}`;
          let rows = await executeSQL(sql);
         // console.log(rows);
    res.render("updateAccount", {"userInfo": rows, "message": "Username must be 4 characters or more"});
    return;
  }
  if(userName.length > 20){
        let sql = `SELECT u.userId, u.userName as userName, u.password as password, l.zip, l.locationId as locationId FROM users u LEFT JOIN location l on u.userId = l.userId
        WHERE l.userId = ${userId}`;
          let rows = await executeSQL(sql);
         // console.log(rows);
    res.render("updateAccount", {"userInfo": rows, "message": "Username must be 20 or less characters"});
    return;
  }
  if(password.length < 6){
        let sql = `SELECT u.userId, u.userName, u.password, l.zip FROM users u LEFT JOIN location l on u.userId = l.userId
        WHERE l.userId = ${userId}`;
          let rows = await executeSQL(sql);
        //  console.log(rows);
    res.render("updateAccount", {"userInfo": rows, "message": "Password must be 7 characters or more"});
    return;
  }
  if(password.length > 20){
        let sql = `SELECT u.userId, u.userName, u.password, l.zip FROM users u LEFT JOIN location l on u.userId = l.userId
        WHERE l.userId = ${userId}`;
          let rows = await executeSQL(sql);
        //  console.log(rows);
    res.render("updateAccount", {"userInfo": rows, "message": "Password must be 20 or less characters"});
    return;
  }
  if(!/[A-Z]/.test(password)){
        let sql = `SELECT u.userId, u.userName, u.password, l.zip FROM users u LEFT JOIN location l on u.userId = l.userId
        WHERE l.userId = ${userId}`;
          let rows = await executeSQL(sql);
        //  console.log(rows);
    res.render("updateAccount", {"userInfo": rows, "message": "Password must contain an uppercase letter"});
    return;
  }
  if (!/[a-z]/.test(password)){
        let sql = `SELECT u.userId, u.userName, u.password, l.zip FROM users u LEFT JOIN location l on u.userId = l.userId
        WHERE l.userId = ${userId}`;
          let rows = await executeSQL(sql);
       //   console.log(rows);
    res.render("updateAccount", {"userInfo": rows, "message": "Password must contain a lowercase letter"});
    return;
  }
  if (!/[0-9]/.test(password)) {
        let sql = `SELECT u.userId, u.userName, u.password, l.zip FROM users u LEFT JOIN location l on u.userId = l.userId
        WHERE l.userId = ${userId}`;
          let rows = await executeSQL(sql);
        //  console.log(rows);
    res.render("updateAccount", {"userInfo": rows, "message": "Password must contain a number"});
    return;
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        let sql = `SELECT u.userId, u.userName, u.password, l.zip FROM users u LEFT JOIN location l on u.userId = l.userId
        WHERE l.userId = ${userId}`;
          let rows = await executeSQL(sql);
        //  console.log(rows);
    res.render("updateAccount", {"userInfo": rows, "message": "Password must contain a special character"});
    return;
  }
 

  //Update user info
  sql = `UPDATE users SET userName = ?, password = ? WHERE userId = ?`;
  params = [userName, password, userId];
  rows = await executeSQL(sql, params);

  //if Zip code is not empty, delete that zipcode
  //console.log("locationIDDDD: "  +locationId);
  if (locationId != '') {
    try {
      sql = `DELETE FROM favorites WHERE locationId = ?`;
      params = [locationId];
      await executeSQL(sql, params);

    sql = `DELETE FROM location WHERE locationId = ? AND userId = ?`;
    params = [locationId, userId];
    await executeSQL(sql, params);
    } catch (error) {
      res.status(500).send("Error deleting location");
    }
  } else {
    console.log("No location ID provided");
  }

  
  // sql = `UPDATE location SET zip = ? WHERE userId = ?`;
  // params = [req.body.zip, req.body.userId];
  // rows = await executeSQL(sql, params);

//  userId = req.body.userId;
  sql = `SELECT * FROM users WHERE userId =  ${userId}`;
  rows = await executeSQL(sql);

  sql = `SELECT * FROM location WHERE userId =  ${userId}`;
  rows = await executeSQL(sql);
 // console.log(rows);
  res.render("index", { "userInfo": rows, "message" : "Account Updated!" });
});

// post switch location route
app.post("/location/switch", async function(req, res){
    const userId = req.session.userId;
    const { locationId } = req.body;  // Get the locationId from the request body

    try {
      // Get the zip code and features for the selected location
      let sql = `SELECT l.zip, f.Humidity, f.Wind, f.Pressure, f.Visibility, f.Sunrise, f.Sunset, f.Description, f.Cloudiness, f.Fahrenheit, f.Celsius
                 FROM location l
                 JOIN favorites f ON l.locationId = f.locationId
                 WHERE l.locationId = ? AND l.userId = ?`;
      let params = [locationId, userId];
      let rows = await executeSQL(sql, params);

      if (rows.length > 0) {
        const location = rows[0];

        // Prepare the features object based on the database response
        const features = {
          Humidity: location.Humidity === 'Yes' ? 'Yes' : 'No',
          Wind: location.Wind === 'Yes' ? 'Yes' : 'No',
          Pressure: location.Pressure === 'Yes' ? 'Yes' : 'No',
          Visibility: location.Visibility === 'Yes' ? 'Yes' : 'No',
          Sunrise: location.Sunrise === 'Yes' ? 'Yes' : 'No',
          Sunset: location.Sunset === 'Yes' ? 'Yes' : 'No',
          Description: location.Description === 'Yes' ? 'Yes' : 'No',
          Cloudiness: location.Cloudiness === 'Yes' ? 'Yes' : 'No',
          Fahrenheit: location.Fahrenheit === 'Yes' ? 'Yes' : 'No',
          Celsius: location.Celsius === 'Yes' ? 'Yes' : 'No'
        };

        

        res.render("weatherView", {
          message: "Favorite location loaded!",
          zipCode: location.zip,
          features: features,
          locations: await getLocations(userId)
        });
      } else {
        res.status(404).send('Location not found');
      }
    } catch (error) {
      console.error("Error loading favorite location:", error);
      res.status(500).send('Error loading favorite location');
    }
  });

  async function getLocations(userId) {
    let sql = `SELECT * FROM location WHERE userId = ?`;
    let params = [userId];
    return await executeSQL(sql, params);
  }

//post add favorite location route
app.post("/location/new", async function(req, res) {
  const userId = req.session.userId;
  const zipCode = req.body.zipCode;
  const features = req.body.features; // Handle as an array or a string

  // Debug logging
  //console.log('Received zipCode:', zipCode);
  //console.log('Received features:', features);

  // Validate input
  if (!zipCode || !features) {
    return res.status(400).render("weatherView", { 
      message: "Invalid input.", 
      locations: await getLocations(userId),
      features: {} 
    });
  }

  try {
    let sql = `SELECT locationId FROM location WHERE zip = ? AND userId = ?`;
    let params = [zipCode, userId];
    let rows = await executeSQL(sql, params);

    let locationId;
    if (rows.length > 0) {
      return res.status(400).render("weatherView", { 
        message: "Zip code already exists.", 
        zipCode: '',
        locations: await getLocations(userId),
        features: {} 
      });
    } else {
      sql = `INSERT INTO location (zip, userId) VALUES (?, ?)`;
      params = [zipCode, userId];
      const result = await executeSQL(sql, params);
      locationId = result.insertId;
    }

    // Convert the features to an array if it's a string
    const selectedFeatures = Array.isArray(features) ? features : [features];

    // Store user's selected features in the favorites table
    const featuresToSave = {
      Humidity: selectedFeatures.includes("Humidity") ? 'Yes' : 'No',
      Wind: selectedFeatures.includes("Wind") ? 'Yes' : 'No',
      Pressure: selectedFeatures.includes("Pressure") ? 'Yes' : 'No',
      Visibility: selectedFeatures.includes("Visibility") ? 'Yes' : 'No',
      Sunrise: selectedFeatures.includes("Sunrise") ? 'Yes' : 'No',
      Sunset: selectedFeatures.includes("Sunset") ? 'Yes' : 'No',
      Description: selectedFeatures.includes("Description") ? 'Yes' : 'No',
      Cloudiness: selectedFeatures.includes("Cloudiness") ? 'Yes' : 'No',
      Fahrenheit: selectedFeatures.includes("F") ? 'Yes' : 'No',
      Celsius: selectedFeatures.includes("C") ? 'Yes' : 'No', 
      locationId: locationId
    };

    sql = `INSERT INTO favorites (Humidity, Wind, Pressure, Visibility, Sunrise, Sunset, Description, Cloudiness, Fahrenheit, Celsius, locationId) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    params = [
      featuresToSave.Humidity,
      featuresToSave.Wind,
      featuresToSave.Pressure,
      featuresToSave.Visibility,
      featuresToSave.Sunrise,
      featuresToSave.Sunset,
      featuresToSave.Description,
      featuresToSave.Cloudiness,
      featuresToSave.Fahrenheit,
      featuresToSave.Celsius,
      featuresToSave.locationId
    ];
    await executeSQL(sql, params);

    // Retrieve updated locations and features for rendering
    const locations = await getLocations(userId);

    res.render("weatherView", { 
      message: "Settings saved successfully!", 
      locations: locations,
      features: featuresToSave,
      zipCode: ''
    });

  } catch (error) {
    console.error("Error saving location and settings:", error);
    res.status(500).render("weatherView", { 
      message: "An error occurred while saving settings.", 
      locations: await getLocations(userId),
      features: {}
    });
  }
});

// app.post("/fetchWeather", async (req, res) => {
//   const zipCode = req.body.zipCode;
//   const userId = req.session.userId;
// });


// Function to execute SQL queries
async function executeSQL(sql, params) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}

// Starts server :)
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
