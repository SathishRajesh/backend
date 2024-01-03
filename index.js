const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const app = express();
const jwt = require("jsonwebtoken");
app.use(bodyParser.json({ type: "application/json" }));

app.use(cors());

mongoose
  .connect(
    "mongodb+srv://Sathish:Sathish07@cluster0.siyanpc.mongodb.net/sample"
  )
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));

const schema = mongoose.Schema;
const userSchema = new schema({
  firstname: { type: String },
  lastname: { type: String },
  email: { type: String },
  gender: { type: String },
  active: { type: Boolean },
  age: { type: String },
  password: { type: String },
  role: { type: String },
});

const userInput = new schema({
  formname: { type: String },
  submittedForm: { type: Array },
  username: { type: String },
  date: { type: String },
  submittedData: { type: Array },
});

const UserForm = mongoose.model("form", userInput);
const UserModel = mongoose.model("user", userSchema);

const midleWare = (req, res, next) => {
  const authorizationHeader = req.headers.authorization
    ? req.headers.authorization     
    : req.headers.token;

  console.log(req.headers, "jhkgtjgkgj");
  if (authorizationHeader) {
    const token = authorizationHeader.split(" ")[1];
    console.log(token, "llll");
    try {
      const decoded = jwt.verify(token, "secret");

      res.header({ Authorization: "Bearer" + decoded });

      next();
    } catch (err) {
      console.log(err);
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
  } else {
    return res
      .status(401)
      .send({ message: `Authentication error. Token required.` });
  }
};   
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ message: "Required field missing" });
    const data = await UserModel.findOne({ email: email }).lean();

    if (!data) return res.status(400).json({ message: "inalid email" });
    try {
      const check = await bcrypt.compare(password, data.password);
      if (!check) return res.status(400).json({ message: "inalid password" });
      const token = jwt.sign(data, "secret");
      return res
        .status(200)
        .send({ message: "Data inserted", token: token, data: data });
    } catch (err) {
      console.log(err);
    }
  } catch (error) {
    console.log(error);
    return res.status(501).send({ message: "inalid password" });
  }
});

app.get("/get", async (_, res) => {
  try {
    const data = await UserModel.find();
    return res.status(200).send({ message: "The message success", data });
  } catch (error) {
    return res.status(500).send({ message: "The server error " });
  }
});

app.post("/post-number", midleWare, async (req, res) => {
  console.log(req.body, "ggggggg");
  try {
    const { firstname, lastname, email, gender, active, age, password, role } =
      req.body;

    if (
      !email ||
      !firstname ||
      !lastname ||
      !gender ||
      !active ||
      !age ||
      !password ||
      !role
    )
      return res.status(402).json({ message: "Required field missing" });
    const encryptpass = await bcrypt.hash(password, 10);

    const userMail = await UserModel.findOne({ email });
    if (userMail)
      return res.status(402).send({ message: "This email already exits" });
    const emailCheck = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailCheck.test(email))
      return res.status(403).json({ message: "Invalid Email" });

    console.log(role, "iiiiii");
    const userData = new UserModel({
      firstname,
      lastname,
      email,
      gender,
      active,
      age,
      password: encryptpass,
      role,
    });
    await userData.save();

    return res.status(200).send({ message: "data is inserted" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "The server error " });
  }
});

app.patch("/update/:id", midleWare, async (req, res) => {
  console.log(res.body, "f");
  try {
    const { id = "" } = req.params;
    if (!id) return res.status(400).json({ message: "Required field missing" });
    const { firstname, lastname, email, gender, active, age, password, role } =
      req.body || {};

    if (
      !email ||
      !firstname ||
      !lastname ||
      !gender ||
      active.length === 0 ||
      !age ||
      !password ||
      !role
    )
      return res.status(406).json({ message: "Required field missing" });

    const userData = await UserModel.findById(id);
    if (!userData) return res.status(400).json({ message: "Invaild ID" });
    userData.firstname = firstname;
    userData.lastname = lastname;
    userData.email = email;
    userData.gender = gender;
    (userData.active = active),
      (userData.age = age),
      (userData.password = password),
      (userData.role = role);
    await userData.save();
    const data = await UserModel.find();
    return res.status(200).send({ message: "Data updated", data: data });
  } catch (error) {
    return res.status(500).send({ message: "The server error " });
  }
});

app.delete("/delete/:id", midleWare, async (req, res) => {
  try {
    const { id = "" } = req.params;
    console.log(id);
    if (!id) return res.status(400).json({ message: "Required field missing" });
    await UserModel.findByIdAndDelete(id);
    const data = await UserModel.find();
    return res.status(200).send({
      message: "deleted the data",
      data: data,
    });
  } catch (error) {
    return res.status(500).send({ message: "The server error " });
  }
});

app.get("/get-formdata", async (_, res) => {
  try {
    const data = await UserForm.find();
    return res.status(200).send({ message: "data fetched successfully", data });
  } catch (error) {
    return res.status(500).send({ message: "server error " });
  }
});

app.post("/post-formdata", async (req, res) => {
  try {
    const { formname, submittedForm, username, date } = req.body || {};

    // console.log(formname);
    // console.log(submittedForm);
    // console.log(username);
    // console.log(date);

    if (!formname || !submittedForm || !username || !date)
      return res.status(400).send({ message: "Required data  missing" });
    const userData = new UserForm({ formname, submittedForm, username, date });
    await userData.save();
    return res.status(200).send({ message: "data inserted successfully" });
  } catch (error) {
    console.log(error, "hi");
    return res.status(500).send({ message: "server error data2" });
  }
});

app.patch("/patch-formdata/:id", midleWare, async (req, res) => {
  try {
    const { id = "" } = req.params;
    console.log(id, "111111");

    console.log(req, "hi");
    if (!id) return res.status(403).json({ message: "reqired data missing" });
    const { submittedForm, username, date } = req.body || {};

    // console.log(formname);
    console.log(req.body);
    console.log(username);
    console.log(date);
    const submitted = Object.values(submittedForm);

    // const userData = new UserForm({submittedForm, username, date });
    // userData.submittedForm=submitted;
    // userData.username;
    // userData.date;

    // await userData.save();
    const userData = await UserForm.findById(id);
    if (!userData) return res.status(400).json({ message: "Invaild ID" });
    userData.username = username;
    userData.submittedForm = submitted;
    userData.date = date;

    await userData.save();
    const data = await UserForm.find();

    return res
      .status(200)
      .json({ message: "data inserted successfully", data: data });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "server error data1" });
  }
});

app.patch("/patch-submittedForm/:id", async (req, res) => {
  try {
    const { id = "" } = req.params;
    console.log(id);
    console.log(req.body, "value");
    if (!id) return res.status(401).json({ message: "reqired data missing"});
    const { submittedData, username, date } = req.body || {};
    console.log(submittedData);
    console.log("rty");
    if (!submittedData)
      return res.status(407).json({ message: "Required data is missing"});
    const userData = await UserForm.findById(id);
     console.log(userData, "rty");
    if (!userData) return res.status(400).json({ message: "invalid ID" });
   
    userData.submittedData.push({
      username: username,
      date: date,
      submittedData:submittedData,
    });

    await userData.save();
    const update = await UserForm.find();

    return res
      .status(200)
      .json({ message: "data inserted successfully", data: userData });
  } catch (error)
  {
    console.log(error, "error");
    return res.status(500).send({ message: "server error data" });
  }
});

app.delete("/delete-formdata/:id", midleWare, async (req, res) => {
  try {
    const { id = "" } = req.params;

    if (!id) return res.status(400).json({ message: "Required field missing" });
    await UserForm.findByIdAndDelete(id);
    const data = await UserForm.find();

    return res.status(200).send({
      message: "deleted the data",
      data: data,
    });
  } catch (error) {
    return res.status(500).send({ message: "The server error " });
  }
});

app.listen(5000, () => {
  console.log("Running at port 5000");
});
