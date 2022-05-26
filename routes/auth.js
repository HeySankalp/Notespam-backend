const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');


const JWT_SECRET = '$ankalp$achan';

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//--------ROUTE 1---------POST req with user body param (authentication not required)---------------------SIGN UP
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//validating data entered
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid mail').isEmail(),
    body('password', 'password must of five characters').isLength({ min: 5 })
], async (req, res) => {
    let success = false;
 
    //------------------------if didn't validated properly, return bad request with errors---------------------
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        return res.json({success, "errors": errors.array() });
    }

    //-------------------------------Check whether s user exists already---------------------------------------
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.json({success, "error": "sorry user with this email already exist" })
        }
        //------------------------------Hashing password and adding salt to it---------------------------------
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt)

        //-------------------------------------wait until user creates-----------------------------------------
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        });

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET)

        // .then(user => res.json(user))
        // .catch(err=> console.log(err))
        res.json({success: true, authtoken })

        //-------------------------show error message if any other error occured--------------------------------   
    } catch (error) {
        console.log(error.message);
        res.status(500).send("entenal server error");
    }
})
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//-------ROUTE 2-------POST req login in the user in db (authentication not required) ---------------------LOGIN
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
router.post('/login', [
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'password can not be blank').exists()                
], async (req, res) => {
    let success = false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({ errors: errors.array() });
    }

    const { email, password } = req.body
    try {
        let user = await User.findOne({ email })
        if (!user) {
            success = false;
            return res.json({success, "error": "please try again with with correct details" })
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            success = false;
            return res.json({ success, "error": "please try again with with correct details"})
        }
        const data = {
            user: {
                id : user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken })


    } catch (error) {
        console.log(error.message);
        res.status(500).send("entenal server error");
    }
});

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//--------------ROUTE 3--------------get logged in user details using POST---------------------------------LOGIN
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.post('/getuser', fetchuser, async (req, res) => {
try {
    let userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
} catch (error) {
    console.log(error.message);
    res.status(500).send("entenal server error");
}
});


module.exports = router 