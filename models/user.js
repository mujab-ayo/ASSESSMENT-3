const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true  
    },
    password: {
        type: String,
        required: true
    }   

})

userSchema.pre('save',
    async function (next) {
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
        
    }
)

userSchema.methods.isValidPassword = async function (password) {
    const compare = await bcrypt.compare(password, this.password);
    return compare;
}


module.exports = mongoose.model('User', userSchema)