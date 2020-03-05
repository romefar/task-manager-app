const validator = require('validator');
const mongoose = require('mongoose');

const User = mongoose.model('User', {
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
    }
});

module.exports = User;  