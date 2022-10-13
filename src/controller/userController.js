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
         const encyptPassword = await bcrypt.hash(password, 10)

        let existEmail = await userModel.findOne({ email: email })
        if (existEmail) {
            return res.status(400).send({ status: false, msg: "User with this email is already registered" })
        }

        let existphone = await userModel.findOne({ phone: phone })
        if (existphone) {
            return res.status(400).send({ status: false, msg: "User with this phone number is already registered" })
        }

        const addressParse = JSON.parse(address)

        if (address) {
            const addressParse = JSON.parse(address)
            // console.log(address)

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
                password:encyptPassword,
                address:addressParse
            }

        }, { new: true })
        return res.status(200).send({ status: true, message: "user data", data: updatedUser })


    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }

}

// const updateUserProfile = async function (req, res) {
//     try {
//       const userId = req.params.userId;
//       let address;
//       if (req.body.address) {
//         address = JSON.parse(req.body.address);
//       }

//       let requestBody = req.body;

//       // const requestBody = req.body

//       if (!validator.isValidBody(req.body) && !req.files) {
//         return res
//           .status(400)
//           .send({ status: false, message: "ERROR! : request body is empty" });
//       }

//       let { fname, lname, phone, email, password, profileImage } = requestBody;

//       if (fname) {
//         let isName = /^[A-Za-z ]*$/;

//         if (!validator.isValid(fname)) {
//              return res
//              .status(400)
//             .send({ status: false, message: "please enter name" });
//         }
//         if (!isName.test(fname)) {
//           return res
//             .status(422)
//             .send({ status: false, message: "enter valid name" });
//         }
//       }

//       if (lname) {
//         let isName = /^[A-Za-z ]*$/;

//         if (!validator.isValid(lname)) {
//           return res
//             .status(400)
//             .send({ status: false, message: "please enter name" });
//         }
//         if (!isName.test(lname)) {
//           return res
//             .status(422)
//             .send({ status: false, message: "enter valid name" });
//         }
//       }

//       if (phone) {
//         if (!validator.isValid(phone)) {
//           return res
//             .status(400)
//             .send({ status: false, message: "enter valid phone" });
//         }

//         if (!validator.isValidPhone(phone)) {
//           return res.status(422).send({
//             status: false,
//             message: "Invaid Number:please enter 10 digit Indian Phone numbers ",
//           });
//         }

//         const isPhoneAlreadyUsed = await userModel.findOne({
//           phone,
//           isDeleted: false,
//         });

//         if (isPhoneAlreadyUsed) {
//           return res.status(409).send({
//             status: false,
//             message: `${phone} this phone number is already used so please put valid input`,
//           });
//         }
//       }

//       if (email) {
//         if (!validator.isValid(email)) {
//           return res.status(400).send({
//             status: false,
//             message: "email is not present in input request",
//           });
//         }
//         if (!validatEmail.isEmail(email)) {
//           return res
//             .status(400)
//             .send({ status: false, msg: "BAD REQUEST email is invalid " });
//         }

//         if (!/^[^A-Z]*$/.test(email)) {
//           return res.status(400).send({
//             status: false,
//             msg: "BAD REQUEST please provied valid email which do not contain any Capital letter ",
//           });
//         }

//         const isEmailAlreadyUsed = await userModel.findOne({
//           email,
//           isDeleted: false,
//         });

//         if (isEmailAlreadyUsed) {
//           return res.status(409).send({
//             status: false,
//             message: `${email} is already used so please put valid input`,
//           });
//         }
//       }

//       if (password) {
//         if (!validator.isValid(password)) {
//           return res
//             .status(400)
//             .send({ status: false, message: "enter valid password" });
//         }
//         if (!validator.isValidPassword(password)) {
//           return res.status(400).send({
//             status: false,
//             msg: "Please enter Minimum eight characters password, at least one uppercase letter, one lowercase letter, one number and one special character",
//           });
//         }

//         const salt = await bcrypt.genSalt(10); // idealy minimum 8 rounds required here we use 10 rounds
//         const hashPassword = await bcrypt.hash(password, salt);
//         requestBody.password = hashPassword;
//       }

//       let uploadedFileURL;

//       let files = req.files; // file is the array

//       if (files && files.length > 0) {
//         uploadedFileURL = await uploadFile(files[0]);

//         if (uploadedFileURL) {
//           req.body.profileImage = uploadedFileURL;
//         } else {
//           return res.status(400).send({
//             status: false,
//             message: "error uploadedFileURL is not present",
//           });
//         }
//       }

//       if (address) {
//         console.log(address);

//         const isAddressExists = await userModel.findOne({
//           _id: userId,
//           isDeleted: false,
//         });

//         if (!isAddressExists) {
//           return res.status(404).send({
//             status: false,
//             message: `user with this ID: ${userId} is not found`,
//           });
//         }

//         let updateAddress = isAddressExists.address;
//         console.log(updateAddress);

//         console.log(address, typeof address);

//         if (address.shipping) {
//           if (address.shipping.street) {
//             if (!validator.isValid(address.shipping.street)) {
//               return res.status(400).send({
//                 status: false,
//                 message: "enter valid shipping street address",
//               });
//             }
//             updateAddress.shipping.street = address.shipping.street;
//           }

//           if (address.shipping.pincode) {
//             if (!validator.isValid(address.shipping.pincode)) {
//               return res.status(400).send({
//                 status: false,
//                 message: "enter valid shipping pincode address",
//               });
//             }

//             if (!/^[1-9]{1}[0-9]{5}$/.test(address.shipping.pincode)) {
//               return res.status(422).send({
//                 status: false,
//                 message: `${address.shipping.pincode}enter valid shipping picode of 6 digit and which do not start with 0`,
//               });
//             }

//             updateAddress.shipping.pincode = address.shipping.pincode;
//           }

//           if (address.shipping.city) {
//             if (!validator.isValid(address.shipping.city)) {
//               return res.status(400).send({
//                 status: false,
//                 message: "enter valid shipping city address",
//               });
//             }

//             updateAddress.shipping.city = address.shipping.city;
//           }
//         }

//         if (address.billing) {
//           if (address.billing.street) {
//             if (!validator.isValid(address.billing.street)) {
//               return res.status(400).send({
//                 status: false,
//                 message: "enter valid billing street address",
//               });
//             }

//             updateAddress.billing.street = address.billing.street;
//           }

//           if (address.billing.pincode) {
//             if (!validator.isValid(address.billing.pincode)) {
//               return res.status(400).send({
//                 status: false,
//                 message: "enter valid billing pincodeaddress",
//               });
//             }

//             if (!/^[1-9]{1}[0-9]{5}$/.test(address.billing.pincode)) {
//               return res.status(422).send({
//                 status: false,
//                 message: `${address.billing.pincode}enter valid billing picode of 6 digit and which do not start with 0`,
//               });
//             }

//             updateAddress.billing.pincode = address.billing.pincode;
//           }

//           if (address.billing.city) {
//             if (!validator.isValid(address.billing.city)) {
//               return res.status(400).send({
//                 status: false,
//                 message: "enter valid billing city address",
//               });
//             }

//             updateAddress.billing.city = address.billing.city;
//           }
//         }

//         req.body.address = updateAddress;
//       }

//       const update = req.body;

//       const updatedData = await userModel.findOneAndUpdate(
//         { _id: userId },
//         update,
//         { new: true }
//       );
//       if (updatedData) {
//         return res
//           .status(200)
//           .send({ status: true, msg: "user profile updated", data: updatedData });
//       } else {
//         return res
//           .status(400)
//           .send({ status: false, msg: "userid does not exist" });
//       }
//     } catch (error) {
//       return res.status(500).send({ status: false, message: error.message });
//     }
//   };
module.exports.createUser = createUser;
module.exports.loginUser = loginUser;
module.exports.getUser = getUser;
module.exports.updateUserProfile = updateUserProfile;
















