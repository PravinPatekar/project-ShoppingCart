const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required:true,
      trim: true
    },

    lname: {
      type: String,
      required:true,

      trim: true
    },

    email: {
      type: String,
    
      unique: true,
    },

    profileImage: {
      type: String,
      
    }, // s3 link

    phone: {
      type: String,
      unique: true,
      trim: true
    },

    password: {
      type: String,
      trim: true,
    }, // encrypted password

    address: {
      shipping: {
        street: {
          type: String,
        
          trim: true,
        },

        city: {
          type: String,
        
          trim: true,
        },

        pincode: {
          type: Number,
        
          trim: true,
        },
      },

      billing: {
        street: {
          type: String,
          
          trim: true,
        },

        city: {
          type: String,
    
          trim: true,
        },

        pincode: {
          type: Number,
        
          trim: true,
        },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
