const express = require("express");
require("../db/mongoose"); //just to make sure mongoose runs and connect to database

const User = require("../models/user");
const auth = require("../middleware/auth");
const upload = require("../avatar/upload");
const sharp=require('sharp');
const { sendWelcomeEmail, sendCancelEmail } = require("../emails/account");

const router = new express.Router();

router.post("/users", async (req, res) => {
  //create a new user here
  // console.log(req.body)
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeEmail(user.email,user.name)
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    console.log(e)
    res.status(400).send(e);
  }
}); //use post for resource creation

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

router.post("/users/me/avatar", auth,
upload.single("avatar"),
  async (req, res) => {
    const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/users/me/avatar", auth, async (req, res) => {

   req.user.avatar=undefined
   await req.user.save()
  res.send()
  }
);

router.get("/users/:id/avatar", async (req,res)=>{
try{
const user=await User.findById(req.params.id)
if(!user|| !user.avatar ){
throw new Error()
}
res.set('Content-type','image/png')
res.send(user.avatar)
}
catch(e){
  res.status(404).send()
}
} )

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdate = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdate.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: "invalid updates" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    //instead of use findbyid directly, we update using traditional way
    //to make sure schema.pre runs correctly
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);
    // if (!user) {
    //   return res.status(404).send();
    // }
    sendCancelEmail(req.user.email,req.user.name)
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
