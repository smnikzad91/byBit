const mongoose = require('mongoose')
const { isEmail } = require('validator')
const bcrypt = require('bcrypt')
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "لطفا ایمیل را وارد کنید"],
        unique: [true],
        lowercase: true,
        validate: [isEmail, "لطفا یک آدرس ایمیل معتبر وارد کنید"]
    },
    password: {
        type: String,
        required: [true, "لطفا رمز عبور را وارد کنید"],
        minlength: [6, "حداقل طول رمز عبور 6 حرف"]
    },
}, { timestamps: true })

// fire function after doc saved to db
userSchema.post('save', function (doc, next) {
    // console.log(doc)
    next();
})

//fire function befire doc saved to db
userSchema.pre('save', async function (next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt)
    next();
})


//static method to login user
userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email })
    if(user){
        const auth = await bcrypt.compare(password, user.password)
        if(auth){
            return user;
        }
        throw Error('incorrect password')
        
    }
    throw Error('incorrect email')
}
const User = mongoose.model('user', userSchema)
module.exports = User;