const productModel = require("../model/productModel")
const imgUpload = require('../AWS/aws')
const mongoose = require('mongoose')


const { isValid,priceRegex } = require('../validator/validator')


const createProduct = async (req,res)=> {
try {
        const product = req.body
        const files = req.files

        if (Object.keys(product).length == 0) {
              return res.status(400).send({status: false,message:"for registration user data is required",});}

                const {productImage,title,description,price,currencyId,isFreeShipping,style,availableSizes,installments}=product
                
           if (files && files.length > 0) {
            let uploadedFileURL = await imgUpload(files[0]);
              productImage = uploadedFileURL;
             } else {
                 return res.status(400).send({ message: "No file found" });
             }
      if (!productImage) {
        return res.status(400).send({ status: false, message: "please provide productImage" });
     }
        if (!isValid(title)){
             return res.status(400).send({ status: false, message: "title is mandatory and should have non empty String" })
           }
        if (!isValid(description)){
             return res.status(400).send({ status: false, message: "description is mandatory and should have non empty String" })
        }
        if (!priceRegex(price)){
            return res.status(400).send({ status: false, message: "price is mandatory and in number only " })
       }
       if(currencyId !="INR"){
             return res.status(400).send({ status: false, message: "Only indian currency id allowed for example INR" })
       }
        //      if (!isValid(isFreeShipping)){
        //         return res.status(400).send({ status: false, message: "style is mandatory and should have non empty String " })
        //    }

             if (!isValid(style)){
                return res.status(400).send({ status: false, message: "style is mandatory and should have non empty String " })
           }

           if(!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizes)){
                                return res.status(400).send({ status: false, message: `please provide availavalesize ${size}` })
           }
           if(!priceRegex(installments)) {
                     return res.status(400).send({ status: false, message: "please provide installments only in numbers" })
           }
        let Existtitle = await productModel.findOne({ title: title })
       if (Existtitle) {
            return res.status(400).send({ status: false, msg: "product with this title is already registered" })
          }

          let saveData = await productModel.create(product)
              return res.status(201).send({ status: true, message: "Success", data: saveData });
          
            } catch (error) {
                return res.status(500).send({status:false,msg:error.error})
    
            }
        
       }

      module.exports=createProduct







   