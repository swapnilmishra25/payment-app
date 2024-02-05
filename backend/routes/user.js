const express = require("express");
const zod = require("zod");
const {User, Account} = require('../db');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require("../config");
const {authMiddleware} = require('../middlewares');

const router = express.Router();



const signupSchema = zod.object({
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string(),
})



router.post("/signup", async (req,res)=>{
    const {success} = signupSchema.safeParse(req.body);

    if(!success){
        return res.status(411).json({
	        message: "Email already taken / Incorrect inputs"})
    }

    const existingUser = await User.findOne({
            username: req.body.username
    })

    if(existingUser){
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    })
    
    const userId = user._id;

    await Account.create({
        userId,
        balance: 1 + Math.random()*10000
    })

    const token = jwt.sign({
        userId},
        JWT_SECRET);

    res.json({
        message: "User created successfully",
        token: token,
    })
})


const signinSchema = zod.object({
    username: zod.string().email(),
    password: zod.string(),
})

    router.post("/signin", (req,res)=>{

        const {sucess} = signinSchema.safeParse(req.body);
        if(!sucess){
            res.status(411).json(
                {
	message: "Error while logging in"
}
        )
        }

        const user = User.findOne({
            username: req.body.username,
            password: req.body.password,
        });

        if(user){
            const token = jwt.sign({
                userId: user._id,
            }, JWT_SECRET);

            res.json({
                token: token
            })
            return;
        }

        res.status(411).json({
            message: "Error while logging in"
        })

    })    

    const updateBody = zod.object({
        password: zod.string().optional(),
        firstName: zod.string().optional(),
        lastName: zod.string().optional(),
    })

    router.put("/", authMiddleware, async (req,res)=>{
        const {sucess} = updateBody.safeParse(req.body);
        if(!sucess){
            res.status(411).json({
                message: "Error while updating information"
            })
        }

        await User.updateOne(req.body, {
            _id : req.userId
        })

        res.json({
            message: "Updated sucessfully"
        })
    })

    router.get('/bulk', async (req,res)=>{
        const fliteredString = req.query.filter||"";
        const users = await User.find({
            $or: [{
                firstName: {
                    "$regex": fliteredString
                }
            }, {
                lastName: {
                    "$regex": fliteredString,
                }
            }]
        })

        res.json({
            user: users.map(user=>({
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                _id: user._id
            }))
        })

    })




module.exports = router;
