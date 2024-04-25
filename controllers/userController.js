const router = require('express').Router()
const db = require('../models')
const bcrypt = require('bcrypt');
const jwt = require('jwt-simple');
const config = require('../jwt.config.js');

// 1) New User form
router.get('/new', (req, res) => {
    res.render('users/newUser', {currentUser: req.session.currentUser})
})
// 2) Post route to create user and sign in ( we made and send a token) 
router.post('/signup', async (req, res) => {
    // 1) hash the password
    console.log(req.body)
    req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
    // 2) create the user
    const newUser = await db.User.create(req.body) // req.body has form data to create new user
    console.log(newUser)
    const token = jwt.encode({id: newUser._id}, config.jwtSecret)
    res.json({
        token, 
        user: newUser, 
        message: 'User created'
    })
})  

router.post('/login', async (req, res) => {
    // find the user that is trying to log in
    const foundUser = await db.User.findOne({username: req.body.username}) // req.body has form data to create new user
    console.log(req.body)
    console.log(foundUser)
    // if we have a user lests checks their password using bcrypt
    if(foundUser){
        // this should return true (password correct) or false (password incorrect) 
        const validPass = await bcrypt.compare(req.body.password, foundUser.password)
        if(validPass){
            // exp we can set the experation of the token for so long in miliseconds
            const token = jwt.encode({id: foundUser._id}, config.jwtSecret)
            console.log('Here is the token Billie ------>', token)
            res.json({
                token, 
                user: foundUser, 
                message: 'User logged it'
            })
        }else{
            res.json({message: 'Password incorrect'})
        }
    // if we dont have a user lets tell them
    } else{
        res.json({message: 'User not found'})
    }
})  

module.exports = router