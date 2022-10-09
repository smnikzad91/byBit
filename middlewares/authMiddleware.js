const jwt = require('jsonwebtoken');
const User = require('./../models/User')


const requireAuth = async (req, res, next) => {
    const token = req.cookies.jwt;

    if(token){
        jwt.verify(token, 'shayannikzad.ir', async (err, decodedToken) => {
            if(err){
                console.log(err.message)
                res.redirect('/auth/login')
            }else{
               let { id } = decodedToken
               let user = await User.findById(id).select(['email', '-_id']);
               console.log(`Req from ${user.email}`)
                next();
            }
        })
    }else {
        res.redirect('/auth/login')
    }
}

const checkUser =  (req, res, next) => {
    const token = req.cookies.jwt;

    if(token){
        jwt.verify(token, 'shayannikzad.ir', async (err, decodedToken) => {
            if(err){
                console.log(err.message)
                res.locals.user = null;
                next();
            }else{
                // console.log(decodedToken)
                let user = await User.findById(decodedToken.id)
                res.locals.user = user;
                next();
            }
        })
    }else {
        res.locals.user = null;
        next();
    }
}


module.exports = { requireAuth, checkUser }