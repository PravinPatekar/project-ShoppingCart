const userModel = require("../model/userModel")
const imgUpload = require('../AWS/aws')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")



const { isValid,isValidName,isvalidEmail,isvalidMobile,isValidPassword, pincodeValid, keyValid } = require('../validator/validator')


////////////////////////// CREATE USER API /////////////////////////

const createUser = async function (req, res) {
    try {
        const data = req.body
        const files = req.files

        const { fname, lname, email, profileImage, phone, password, address } = data

        if (!isValid(fname)) return res.status(400).send({ status: false, message: "fname is mandatory and should have non empty String" })

        if (!isValidName(fname)) {
            return res.status(400).send({ status: false, message: "Please Provide fname in valid formate and Should Starts with Capital Letter" })
        }
        if (!isValid(lname)) return res.status(400).send({ status: false, message: "lname is mandatory and should have non empty String" })

        if (!isValidName(lname)) {
            return res.status(400).send({ status: false, message: "Please Provide lname in valid formate and Should Starts with Capital Letter" })
        }
        if (!isValid(email)) return res.status(400).send({ status: false, message: "email is mandatory and should have non empty String" })

        if (!isvalidEmail(email)) {
            return res.status(400).send({ status: false, message: "email should be in  valid Formate" })
        }
        if (await userModel.findOne({ email }))
            return res.status(400).send({ status: false, message: "This email is already Registered Please give another Email" })

        if (!keyValid(files))
            return res.status(400).send({ status: false, message: "profile Image is Mandatory" })

        //if(!isValidImg.test(profileImage)) return res.status(400).send({status:false,message:"profile Image should be valid with this extensions .png|.jpg|.gif"})

        if (!isValid(phone)) return res.status(400).send({ status: false, message: "Phone is mandatory and should have non empty Number" })

        if (!isvalidMobile(phone)) {
            return res.status(400).send({ status: false, message: "please provide Valid phone Number with 10 digits starts with 6||7||8||9" })
        }
        if (await userModel.findOne({ phone }))
            return res.status(400).send({ status: false, message: "This Phone is already Registered Please give another Phone" })

        if (!isValid(password)) return res.status(400).send({ status: false, message: "Password is mandatory and should have non empty String" })

        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "please provide Valid password with 1st letter should be Capital letter and contains spcial character with Min length 8 and Max length 15" })
        }
        if (!isValid(address)) return res.status(400).send({ status: false, message: "Address is mandatory" })


        const addressParse = JSON.parse(address)  //  convert Object
        //  console.log(addressParse)


        if (addressParse.shipping) {
            if (!keyValid(addressParse.shipping)) return res.status(400).send({ status: false, message: "Please provide address for Shipping" })

            if (!isValid(addressParse.shipping.street)) return res.status(400).send({ status: false, message: "Street is mandatory and should have non empty String in Shipping" })

            if (!isValid(addressParse.shipping.city)) return res.status(400).send({ status: false, message: "city is mandatory and should have non empty String in Shipping" })

            if (!isValid(addressParse.shipping.pincode)) return res.status(400).send({ status: false, message: "pincode is mandatory and should have non empty String in Shipping" })

            if (!pincodeValid(addressParse.shipping.pincode)) return res.status(400).send({ status: false, message: "Please provide valid Pincode with  6 number in Shipping" })
        } else {
            return res.status(400).send({ status: false, message: "Please provide address for Shipping" })
        }

        if (addressParse.billing) {
            if (!keyValid(addressParse.billing)) return res.status(400).send({ status: false, message: "Please provide address for billing" })

            if (!isValid(addressParse.billing.street)) return res.status(400).send({ status: false, message: "Street is mandatory and should have non empty String in billing" })

            if (!isValid(addressParse.billing.city)) return res.status(400).send({ status: false, message: "city is mandatory and should have non empty String in billing" })

            if (!isValid(addressParse.billing.pincode)) return res.status(400).send({ status: false, message: "pincode is mandatory and should have non empty String in billing" })

            if (!pincodeValid(addressParse.billing.pincode)) return res.status(400).send({ status: false, message: "Please provide valid Pincode with  6 number in billing" })

        } else {
            return res.status(400).send({ status: false, message: "Please provide address for billing" })
        }
        let profileImage1 = await imgUpload.uploadFile(files[0])

        const encyptPassword = await bcrypt.hash(password, 10)


        let obj = {
            fname, lname, email, phone, profileImage: profileImage1, password: encyptPassword, address: addressParse
        }

        const newUser = await userModel.create(obj)

        return res.status(201).send({ status: true, message: "User created successfully", data: newUser })

    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}


//////////////////////////login///////////////////////////
const loginUser =
    async function (req, res) {
        try {
            let data = req.body
            const { email, password } = data
            //=====================Checking the validation=====================//
            if (!keyValid(data)) return res.status(400).send({ status: false, msg: "Email and Password Required !" })

            //=====================Validation of EmailID=====================//
            if (!email) return res.status(400).send({ status: false, msg: "email is required" })


            //=====================Validation of Password=====================//
            if (!password) return res.status(400).send({ status: false, msg: "password is required" })

            //===================== Checking User exsistance using Email and password=====================//
            const user = await userModel.findOne({ email: email })
            if (!user) return res.status(400).send({ status: false, msg: "Email is Invalid Please try again !!" })

            const verifyPassword = await bcrypt.compare(password, user.password)


            if (!verifyPassword) return res.status(400).send({ status: false, msg: "Password is Invalid Please try again !!" })


            //===================== Creating Token Using JWT =====================//
            const token = jwt.sign({
                userId: user._id.toString()
            }, "project5group62", { expiresIn: '25h' })

            res.setHeader("x-api-key", token)

            let obj = {
                userId: user._id,
                token: token
            }

            res.status(200).send({ status: true, message: "User login successfull", data: obj })
        } catch (error) {
            return res.status(500).send({ status: false, message: error.message })
        }
    }



////////////////////////////////////////////Get API//////////////////////////////////////

const getUser = async function (req, res) {
    try {
        const userId = req.params.userId;
        //   const body = req.body;
        

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "this  UserId is not a valid Id" })
        }

        if (!(isValid(userId) && isValid(userId))) {
            return res.status(400).send({ status: false, msg: "userId is not valid" });
        }
        //   if (validator.isValid(body)) {
        // return res.status(400).send({ status: false, msg: "body should not be empty" });
        //   }

        const userData = await userModel.findById({ _id: userId });
        if (userData) {
            return res.status(200).send({ status: true, msg: "user profile details", data: userData });
        } else {
            return res.status(404).send({ status: false, msg: "userid does not exist" });
        }
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
};

//////////////////////////////////////// PUT API////////////////////////////////////////
updateUserProfile = async (req, res) => {
    try {
        let UserId = req.params.userId

        const { fname, lname, email, profileImage, phone, password, address } = req.body

        if (Object.keys(req.body).length == 0)
            return res.status(400).send({ status: false, msg: "Please Enter user Details For Updating" })
        // if (!UserId) {
        //     return res.status(400).send({ status: false, msg: "UserId must be present" })
        // }

        if (!mongoose.Types.ObjectId.isValid(UserId)) {
            return res.status(400).send({ status: false, msg: "this  UserId is not a valid Id" })
        }

        
        
        let findUserId = await userModel.findById(UserId)
        if (!findUserId) {
            return res.status(404).send({ status: false, msg: "no user found with this UserId" })
        }
         if(fname){
        if (!isValid(fname)) {
                   return res.status(400).send({ status: false, msg: "Please enter a valid fname" }) }
        if (!isValidName(fname)) {
            return res.status(400).send({ status: false, message: "Please Provide fname in valid formate and Should Starts with Capital Letter" })
        }
     }
         if(lname){
        if (!isValid(lname)){
             return res.status(400).send({ status: false, msg: "Please enter a valid lname" })}
        if (!isValidName(lname)){
            return res.status(400).send({ status: false, message: "Please Provide lname in valid formate and Should Starts with Capital Letter" })
         }
        }
         if(email){
        if (!isValid(email)){
             return res.status(400).send({ status: false, msg: "Please enter a valid email" })}
        if (!isvalidEmail(email)) {
            return res.status(400).send({ status: false, msg: "Please Enter valid Email" })
        }
     }

    //  if(profileImage){
        //  if (!isValid(profileImage)){ return res.status(400).send({ status: false, msg: "Please enter a valid profileImage" })}
        //  if (!keyValid(files)){
        //  return res.status(400).send({ status: false, message: "profile Image is Mandatory" })}

    //  }
    //  let profileImage1 = await imgUpload.uploadFile(files[0])

        if(phone){
        if (!isValid(phone)){
               return res.status(400).send({ status: false, msg: "Please enter a valid phone" })}
        if (!isvalidMobile(phone)) {
            return res.status(400).send({ status: false, msg: "Please Enter valid phone Number" })
        }
    }
   

        if(password){
        if (!isValid(password)) {
            return res.status(400).send({ status: false, msg: "Please enter a valid password" })}
        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, msg: "please Enter valid Password and it's length should be 8-15" })
        }
    }
        //  const encyptPassword = await bcrypt.hash(password, 10)

        let existEmail = await userModel.findOne({ email: email })
        if (existEmail) {
            return res.status(400).send({ status: false, msg: "User with this email is already registered" })
        }

        let existphone = await userModel.findOne({ phone: phone })
        if (existphone) {
            return res.status(400).send({ status: false, msg: "User with this phone number is already registered" })
        }

        // const addressParse = JSON.parse(address)

        if (address) {
            const addressParse = JSON.parse(address)
            console.log(address)

            if (addressParse.shipping) {
                if (!keyValid(addressParse.shipping)) return res.status(400).send({ status: false, message: "Please provide address for Shipping" })

                if (!isValid(addressParse.shipping.street)) return res.status(400).send({ status: false, message: "Street is mandatory and should have non empty String in Shipping" })
                
                if (!isValid(addressParse.shipping.city)) return res.status(400).send({ status: false, message: "city is mandatory and should have non empty String in Shipping" })
            
                if (!isValid(addressParse.shipping.pincode)) return res.status(400).send({ status: false, message: "pincode is mandatory and should have non empty String in Shipping" })
                
                if (!pincodeValid(addressParse.shipping.pincode)) return res.status(400).send({ status: false, message: "Please provide valid Pincode with  6 number in Shipping" })
             }else {
                return res.status(400).send({ status: false, message: "Please provide address for Shipping" })
            }
        

            if (addressParse.billing) {
                if (!keyValid(addressParse.billing)) return res.status(400).send({ status: false, message: "Please provide address for billing" })

                if (!isValid(addressParse.billing.street)) return res.status(400).send({ status: false, message: "Street is mandatory and should have non empty String in billing" })
                
                if (!isValid(addressParse.billing.city)) return res.status(400).send({ status: false, message: "city is mandatory and should have non empty String in billing" })
                
                if (!isValid(addressParse.billing.pincode)) return res.status(400).send({ status: false, message: "pincode is mandatory and should have non empty String in billing" })
                
                if (!pincodeValid(addressParse.billing.pincode)) return res.status(400).send({ status: false, message: "Please provide valid Pincode with  6 number in billing" })


            }else {
                return res.status(400).send({ status: false, message: "Please provide address for Shipping" })
            }

        }
    

        let updatedUser = await userModel.findOneAndUpdate({ _id: UserId }, {
            $set: {
                fname:fname,
                lname:lname,
                email:email,
                profileImage:profileImage,
                phone:phone,
                password:password,
                address:address
            }

        }, { new: true })
        return res.status(200).send({ status: true, message: "user data", data: updatedUser })


    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }

}


module.exports.createUser = createUser;
module.exports.loginUser = loginUser;
module.exports.getUser = getUser;
module.exports.updateUserProfile = updateUserProfile;
















