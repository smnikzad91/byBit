const User = require('./../models/User')
const jwt = require('jsonwebtoken')




handleError = err => {
    console.log(err.message, err.code)
    let errors = { email: "", password: "" }

    //incorrect email
    if(err.message === "incorrect email"){
        errors.email = "کاربری پیدا نشد";
    }

     //incorrect password
     if(err.message === "incorrect password"){
        errors.password = "رمز عبور اشتباه است";
    }



    if(err.code === 11000){
        errors.email = 'ایمیل قبلا ثبت نام شده است'
        return errors;
    }

    if(err.message.includes('user validation failed')){
        Object.values(err.errors).forEach(({properties}) => {
            let { path, message } = properties;
            errors[path] = message;
        })
    }
    return errors;
}

createToken = (id) =>{
    return jwt.sign({ id }, 'shayannikzad.ir', { 
        expiresIn: 3 * 24 * 60 * 60
     })
}

exports.registerPost = async (req, res) => {
    let { email, password } = req.body;
    try{
        let user = await User.create({ email, password })
        let token = createToken(user._id)
        res.cookie('jwt', token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000 })
        res.json({user: user._id})
    }catch(err){
        const errors = handleError(err)
        res.json({errors})
    }

}

exports.registerGet = async (req, res) => {
    res.render('auth/register')
}

exports.loginGet = async (req, res) => {
    res.render('auth/login', { csrfToken: req.csrfToken() })
}

exports.loginPost = async (req, res) => {
    let { email, password } = req.body;
    console.log(req.cookie)
    try{
        const user = await User.login(email, password)
        let token = createToken(user._id)
        res.cookie('jwt', token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000 })
        res.status(200).json({ user: user._id })
    }catch(err){
        const errors = handleError(err)
        res.status(400).json({errors})

    }

}

exports.logoutGet = async (req, res)  => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/auth/login')
}
