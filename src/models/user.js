const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Task = require('./task');

const userSchema = new mongoose.Schema({
    name : { 
        type : String,
        required : true,
        trim : true
    },
    age : {
        type : Number,
        validate(value) { 
            if(value < 0) throw new Error('Age must be a positive number.');
            return true;
        },
        default : 0
    },
    email : {
        type : String,
        required : true,
        trim : true,
        unique : true,
        lowercase : true,
        validate(value) { 
            if(!validator.isEmail(value)) throw new Error('Email is invalid.');
            return true;
        }
    },
    password : { 
        type : String,
        trim : true,
        required : true,
        validate(value) { 
            if(value.length <= 6) throw new Error('Password is too short.');
            if(value.toLowerCase().includes('password')) throw new Error('Password cannot contain itself.');
        }
    },
    tokens : [{
        token : { 
            type : String,
            required : true
        }
    }]
}, { 
    timestamps : true
});

userSchema.virtual('tasks', { 
    ref : "Task",
    localField : '_id',
    foreignField : 'owner'
});

userSchema.methods.generateAuthToken = async function () {
    const user = this;

    const token = jwt.sign({ _id : user._id.toString() }, 'mySrcretKey');

    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    return userObject; // return raw object
}

userSchema.statics.fundByCredintials = async (email, password) => {
    const user = await User.findOne({ email });

    if(!user) throw new Error('Unable to login');

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) throw new Error('Unable to login');

    return user;
};  

// hash the plain text
userSchema.pre('save', async function (next) {
    const user =  this;
    
    if(user.isModified('password')) { 
        user.password = await bcrypt.hash(user.password, 8);
    }
    
    next();
});

userSchema.pre('remove', async function (next) { 
    const user = this;
    
    await Task.deleteMany({ owner: user._id });

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;  