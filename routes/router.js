const express = require("express");
const router = new express.Router();
const userdb = require("../models/userSchema");
var bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const keysecret = "THISISTEST";

// email config

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hemant@hexabells.com",
    pass: "knoawwubavlsftsx",
  },
});

// for user registration

router.post("/register", async (req, res) => {
  const { fname, jobTitle, phone, email, password, cpassword } = req.body;

  if (!fname || !jobTitle || !phone || !email || !password || !cpassword) {
    res.status(422).json({ error: "fill all the details" });
  }

  try {
    const preuser = await userdb.findOne({ email: email });

    if (preuser) {
      res.status(422).json({ error: "This Email is Already Exist" });
    } else if (password !== cpassword) {
      res
        .status(422)
        .json({ error: "Password and Confirm Password Not Match" });
    } else {
      const finalUser = new userdb({
        jobTitle,
        phone,
        fname,
        email,
        password,
        cpassword,
      });

      // here password hasing

      const storeData = await finalUser.save();

      // console.log(storeData);
      res.status(201).json({ status: 201, storeData });
    }
  } catch (error) {
    res.status(422).json(error);
    console.log("catch block error");
  }
});
// admin Login=========================================

// Define default admin credentials
const ADMIN_EMAIL = "admin";
const ADMIN_PASSWORD = "password123";

// Admin Login
// router.post('/admin/login', async (req, res) => {
//   try {
//     // Check admin credentials
//     const validUsername = req.body.username === ADMIN_USERNAME;
//     const validPassword = await bcrypt.compare(req.body.password, await bcrypt.hash(ADMIN_PASSWORD, 10));
//     if (!validUsername || !validPassword) {
//       return res.status(401).json({ message: 'Invalid admin credentials' });
//     }

//     // Create and sign a JWT token
//     const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET);
//     res.header('auth-token', token).json({ message: 'Admin logged in', token });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
// user Login==================================

// router.post("/login", async (req, res) => {
//   // console.log(req.body);

//   const { email, password } = req.body;

//   if (!email || !password) {
//     res.status(422).json({ error: "fill all the details" });
//   }
//   const validUsername = email === ADMIN_EMAIL;
//   const validPassword = await bcrypt.compare(
//     password,
//     await bcrypt.hash(ADMIN_PASSWORD, 10)
//   );
//   var command = 0
//   if(validUsername && validPassword){
//     command = 1
//   }

//   try {
//     // console.log('comming0')
//     if(command){
//       // Create and sign a JWT token
//       // console.log('comming1')
//       const token = jwt.sign({ isAdmin: true }, keysecret);
//       const result = {
//         command,
//         token,
//       };
//       console.log({ status: 201,message: "Admin logged in",result })
//       res.status(201).json({ status: 201,message: "Admin logged in",result });
//       // res.header("auth-token", token).json({ message: "Admin logged in", token,command:command });
//     }else{
//       const userValid = await userdb.findOne({ email: email });

//       if (userValid) {
//         const isMatch = await bcrypt.compare(password, userValid.password);

//         if (!isMatch) {
//           res.status(422).json({ error: "invalid details" });
//         } else {
//           // token generate
//           const token = await userValid.generateAuthtoken();

//           // cookiegenerate
//           res.cookie("usercookie", token, {
//             expires: new Date(Date.now() + 9000000),
//             httpOnly: true,
//           });

//           const result = {
//             userValid,
//             token,
//           };
//           res.status(201).json({ status: 201, result,command:command });
//         }
//       } else {
//         res.status(401).json({ status: 401, message: "invalid details" });
//       }
//     }
//   } catch (error) {
//     res.status(401).json({ status: 401, error });
//     console.log("catch block");
//   }
// });
router.post("/login", async (req, res) => {
  // console.log(req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    res.status(422).json({ error: "fill all the details" });
  }

  try {
    const userValid = await userdb.findOne({ email: email });

    if (userValid) {
      const isMatch = await bcrypt.compare(password, userValid.password);

      if (!isMatch) {
        res.status(422).json({ error: "invalid details" });
      } else {
        // token generate
        const token = await userValid.generateAuthtoken();

        // cookiegenerate
        res.cookie("usercookie", token, {
          expires: new Date(Date.now() + 9000000),
          httpOnly: true,
        });

        const result = {
          userValid,
          token,
        };
        res.status(201).json({ status: 201, result });
      }
    } else {
      res.status(401).json({ status: 401, message: "invalid details" });
    }
  } catch (error) {
    res.status(401).json({ status: 401, error });
    console.log("catch block");
  }
});

// user valid
router.get("/validuser", authenticate, async (req, res) => {
  try {
    const ValidUserOne = await userdb.findOne({ _id: req.userId });
    res.status(201).json({ status: 201, ValidUserOne });
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});

// user logout

router.get("/logout", authenticate, async (req, res) => {
  try {
    req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
      return curelem.token !== req.token;
    });

    res.clearCookie("usercookie", { path: "/" });

    req.rootUser.save();

    res.status(201).json({ status: 201 });
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});

// send email Link For reset Password
router.post("/sendpasswordlink", async (req, res) => {
  console.log(req.body);

  const { email } = req.body;

  if (!email) {
    res.status(401).json({ status: 401, message: "Enter Your Email" });
  }

  try {
    const userfind = await userdb.findOne({ email: email });

    // token generate for reset password
    const token = jwt.sign({ _id: userfind._id }, keysecret, {
      expiresIn: "120s",
    });

    const setusertoken = await userdb.findByIdAndUpdate(
      { _id: userfind._id },
      { verifytoken: token },
      { new: true }
    );

    if (setusertoken) {
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Sending Email For password Reset",
        text: `This Link Valid For 2 MINUTES http://localhost:3000/forgotpassword/${userfind.id}/${setusertoken.verifytoken}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("error", error);
          res.status(401).json({ status: 401, message: "email not send" });
        } else {
          console.log("Email sent", info.response);
          res
            .status(201)
            .json({ status: 201, message: "Email sent Succsfully" });
        }
      });
    }
  } catch (error) {
    res.status(401).json({ status: 401, message: "invalid user" });
  }
});

// verify user for forgot password time
router.get("/forgotpassword/:id/:token", async (req, res) => {
  const { id, token } = req.params;

  try {
    const validuser = await userdb.findOne({ _id: id, verifytoken: token });

    const verifyToken = jwt.verify(token, keysecret);

    console.log(verifyToken);

    if (validuser && verifyToken._id) {
      res.status(201).json({ status: 201, validuser });
    } else {
      res.status(401).json({ status: 401, message: "user not exist" });
    }
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});

// change password

router.post("/:id/:token", async (req, res) => {
  const { id, token } = req.params;

  const { password } = req.body;

  try {
    const validuser = await userdb.findOne({ _id: id, verifytoken: token });

    const verifyToken = jwt.verify(token, keysecret);

    if (validuser && verifyToken._id) {
      const newpassword = await bcrypt.hash(password, 12);

      const setnewuserpass = await userdb.findByIdAndUpdate(
        { _id: id },
        { password: newpassword }
      );

      setnewuserpass.save();
      res.status(201).json({ status: 201, setnewuserpass });
    } else {
      res.status(401).json({ status: 401, message: "user not exist" });
    }
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});

//=========================================================================//
// Add Department
//========================================================================//
// Create a new contact
const Department = require("../models/Department");
router.post("/department", async (req, res) => {
  try {
    const existingUser = await Department.findOne({
      department: req.body.department,
    });

    if (existingUser) {
      return res.status(409).send({ message: "department already exists" });
    }

    const user = new Department(req.body);
    await user.save();

    res.status(201).send(user);
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

// Get all contacts for a user
router.get("/department", async (req, res) => {
  try {
    const contacts = await Department.find();
    return res.json(contacts);
  } catch (error) {
    // console.error(error);
    return res.status(500).send("Server error");
  }
});

router.get("/department/:id", async (req, res) => {
  try {
    // console.log(req.params);
    const { id } = req.params;

    const dept = await Department.findById({ _id: id });
    // console.log(dept);
    res.status(201).json(dept);
  } catch (error) {
    res.status(422).json(error);
  }
});

router.patch("/department/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const updtDpt = await Department.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    // console.log(updateduser)
    res.status(201).json(updtDpt);
  } catch (error) {
    res.status(422).json(error);
  }
});

router.delete("/department/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletDpt = await Department.findByIdAndDelete({ _id: id });
    // console.log(deletDpt);
    res.status(201).json(deletDpt);
  } catch (error) {
    res.status(422).json(error);
  }
});

//=========================================================================//
// Add Category
//========================================================================//
// Create a new contact
const Category = require("../models/Category");
router.post("/category", async (req, res) => {
  try {
    const { category } = req.body;
    const exist = await Category.findOne({ category });
    if (exist) {
      return res.status(409).send({ message: "Category already exists" });
    }
    const ctg = new Category({ category });
    await ctg.save();
    res.status(201).json(ctg);
  } catch (error) {
    // console.error(error);
    return res.status(500).send("Server error");
  }
});

// Get all contacts for a user
router.get("/category", async (req, res) => {
  try {
    const ctg = await Category.find();
    return res.json(ctg);
  } catch (error) {
    // console.error(error);
    return res.status(500).send("Server error");
  }
});

router.get("/category/:id", async (req, res) => {
  try {
    // console.log(req.params);
    const { id } = req.params;

    const ctg = await Category.findById({ _id: id });
    // console.log(dept);
    res.status(201).json(ctg);
  } catch (error) {
    res.status(422).json(error);
  }
});

router.patch("/category/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const ctg = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    // console.log(updateduser)
    res.status(201).json(ctg);
  } catch (error) {
    res.status(422).json(error);
  }
});

router.delete("/category/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const ctg = await Category.findByIdAndDelete({ _id: id });
    // console.log(deletDpt);
    res.status(201).json(ctg);
  } catch (error) {
    res.status(422).json(error);
  }
});

//=====================================================
//Company Details
//=====================================================
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uuid = uuidv4();
    const filename = `${uuid}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

const Company = require("../models/Company");
router.post("/company", upload.single("file"), async (req, res) => {
  try {
    const path = req.file.path;
    const mimetype = req.file.mimetype;
    const {
      company,
      country,
      address,
      city,
      state,
      postal_code,
      timezone,
      curruncy_symbol,
      date,
      financial_year,
    } = req.body;

    const exist = await Company.findOne({ company });
    if (exist) {
      return res.status(409).send({ message: "Category already exists" });
    }

    const cmp = new Company({
      company,
      country,
      address,
      city,
      state,
      postal_code,
      timezone,
      curruncy_symbol,
      date,
      financial_year,
      path,
      mimetype,
    });
    await cmp.save();
    res.status(201).json(cmp);
  } catch (error) {
    // console.error(error);
    return res.status(500).send("Server error");
  }
});

router.get("/company", async (req, res) => {
  try {
    const cmp = await Company.find();
    return res.json(cmp);
  } catch (error) {
    // console.error(error);
    return res.status(500).send("Server error");
  }
});

//preview company image

router.get("/company/:id", async (req, res) => {
  try {
    const file = await Company.findById(req.params.id);
    res.sendFile(path.resolve(file.path));
  } catch (err) {
    res.status(400).json({ message: "Failed to get file" });
  }
});

//=========================================================================//
// Add Employee Details
//========================================================================//
// Create a new contact
const Employee = require("../models/Employee");
router.post("/employee", async (req, res) => {
  try {
    const { name, email, site, location, department } = req.body;
    const exist = await Employee.findOne({ email });
    if (exist) {
      return res.status(409).send({ message: "employee already exists" });
    }
    const emp = new Employee({ name, email, site, location, department });
    await emp.save();
    res.status(201).json(emp);
  } catch (error) {
    // console.error(error);
    return res.status(500).send("Server error");
  }
});

// Get all contacts for a user
router.get("/employee", async (req, res) => {
  try {
    const emp = await Employee.find();
    return res.json(emp);
  } catch (error) {
    // console.error(error);
    return res.status(500).send("Server error");
  }
});

router.get("/employee/:id", async (req, res) => {
  try {
    // console.log(req.params);
    const { id } = req.params;

    const emp = await Employee.findById({ _id: id });
    // console.log(dept);
    res.status(201).json(emp);
  } catch (error) {
    res.status(422).json(error);
  }
});

router.patch("/employee/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const emp = await Employee.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    // console.log(updateduser)
    res.status(201).json(emp);
  } catch (error) {
    res.status(422).json(error);
  }
});

router.delete("/employee/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const emp = await Employee.findByIdAndDelete({ _id: id });
    // console.log(deletDpt);
    res.status(201).json(emp);
  } catch (error) {
    res.status(422).json(error);
  }
});

//===============================================assets==============================================//

const Asset = require("../models/Asset");

router.post("/asset", upload.single("file"), async (req, res) => {
  try {
    const path = req.file.path;
    const mimetype = req.file.mimetype;
    const {
      checkOut,
      checkIn,
      disposed,
      assetId,
      purchased_from,
      purchased_date,
      description,
      serial_no,
      employee_code,
      brand,
      organization,
      cost,
      asset_type,
      department,
      employee_name,

      processor,
      processor_gen,
      ram,
      ram_type,
      ram_slot1,
      ram_slot2,
      location,
      os_version,
      hard_disk,
      hard_disk_type,
      owner,
      mouse,
      mouse_brand,
      keyboard,
      charger,
    } = req.body;

    const exist = await Asset.findOne({ assetId });
    if (exist) {
      return res.status(409).send({ message: "Asset id already exists" });
    }

    const asset = new Asset({
      checkOut,
      checkIn,
      disposed,
      path,
      mimetype,
      assetId,
      purchased_from,
      purchased_date,
      description,
      serial_no,
      employee_code,
      brand,
      organization,
      cost,
      asset_type,
      department,
      employee_name,

      processor,
      processor_gen,
      ram,
      ram_type,
      ram_slot1,
      ram_slot2,
      location,
      os_version,
      hard_disk,
      hard_disk_type,
      owner,
      mouse,
      mouse_brand,
      keyboard,
      charger,
    });
    await asset.save();
    res.status(201).json(asset);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

//asset preview
router.get("/asset-brand/:id", async (req, res) => {
  try {
    const file = await Asset.findById(req.params.id);
    res.sendFile(path.resolve(file.path));
  } catch (err) {
    res.status(400).json({ message: "Failed to get file" });
  }
});

// Get all assets for a user
router.get("/asset", async (req, res) => {
  try {
    const asset = await Asset.find();
    return res.json(asset);
  } catch (error) {
    // console.error(error);
    return res.status(500).send("Server error");
  }
});

router.get("/asset/:id", async (req, res) => {
  try {
    // console.log(req.params);
    const { id } = req.params;

    const asset = await Asset.findById({ _id: id });
    // console.log(dept);
    res.status(201).json(asset);
  } catch (error) {
    res.status(422).json(error);
  }
});

router.patch("/asset/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await Asset.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    // console.log(updateduser)
    res.status(201).json(asset);
  } catch (error) {
    res.status(422).json(error);
  }
});

router.delete("/asset/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await Asset.findByIdAndDelete({ _id: id });
    // console.log(deletDpt);
    res.status(201).json(asset);
  } catch (error) {
    res.status(422).json(error);
  }
});
const DisposedAsset = require("../models/DisposedAsset");

router.delete("/asset-data/:id", async (req, res) => {
  try {
    const originalData = await Asset.findByIdAndUpdate(
      { _id: req.params.id },
      { disposed: 1 }
    );

    // create an instance of the new data
    const newData = new DisposedAsset({
      checkOut: originalData.checkOut,
      checkIn: originalData.checkIn,
      disposed: originalData.disposed,
      path: originalData.path,
      mimetype: originalData.mimetype,
      assetId: originalData.assetId,
      purchased_from: originalData.purchased_from,
      purchased_date: originalData.purchased_date,
      description: originalData.description,
      serial_no: originalData.serial_no,
      employee_code: originalData.employee_code,
      brand: originalData.brand,
      organization: originalData.organization,
      cost: originalData.cost,
      asset_type: originalData.asset_type,
      department: originalData.department,
      employee_name: originalData.employee_name,

      processor: originalData.processor,
      processor_gen: originalData.processor_gen,
      ram: originalData.ram,
      ram_type: originalData.ram_type,
      ram_slot1: originalData.ram_slot1,
      ram_slot2: originalData.ram_slot2,
      location: originalData.location,
      os_version: originalData.os_version,
      hard_disk: originalData.hard_disk,
      hard_disk_type: originalData.hard_disk_type,
      owner: originalData.owner,
      mouse: originalData.mouse,
      mouse_brand: originalData.mouse_brand,
      keyboard: originalData.keyboard,
      charger: originalData.charger,
    });

    // save the new data to the other table
    const saveData = await newData.save();

    res
      .status(200)
      .json({ message: "Data deleted and saved to other table.", saveData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error." });
  }
});
// Get all disposed assets for a user
router.get("/asset-data", async (req, res) => {
  try {
    const disposeAsset = await DisposedAsset.find();
    return res.json(disposeAsset);
  } catch (error) {
    return res.status(500).send("Server error");
  }
});

router.get("/asset-data/:id", async (req, res) => {
  try {
    // console.log(req.params);
    const { id } = req.params;

    const asset = await DisposedAsset.findById({ _id: id });
    // console.log(dept);
    res.status(201).json(asset);
  } catch (error) {
    res.status(422).json(error);
  }
});

//asset preview
router.get("/asset-brand-data/:id", async (req, res) => {
  try {
    const file = await DisposedAsset.findById(req.params.id);
    res.sendFile(path.resolve(file.path));
  } catch (err) {
    res.status(400).json({ message: "Failed to get file" });
  }
});

router.patch("/disposed-asset/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await DisposedAsset.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    // console.log(updateduser)
    res.status(201).json(asset);
  } catch (error) {
    res.status(422).json(error);
  }
});

module.exports = router;

// 2 way connection
// 12345 ---> e#@$hagsjd
// e#@$hagsjd -->  12345

// hashing compare
// 1 way connection
// 1234 ->> e#@$hagsjd
// 1234->> (e#@$hagsjd,e#@$hagsjd)=> true
