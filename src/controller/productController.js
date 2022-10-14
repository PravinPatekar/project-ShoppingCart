const productModel = require("../model/productModel")
const imgUpload = require('../AWS/aws')
const mongoose = require('mongoose')


const { isValid, priceRegex,strRegex } = require('../validator/validator')


const createProduct = async (req, res) => {
    try {
        const product = req.body
        const files = req.files

        if (Object.keys(product).length == 0) {
            return res.status(400).send({ status: false, message: "for registration product data is required", });
        }

        let { productImage, title, description, price, currencyId, isFreeShipping, style, availableSizes, installments } = product

        if (files && files.length > 0) {
            let uploadedFileURL = await imgUpload.uploadFile(files[0]);
            // console.log(uploadedFileURL)
            productImage = uploadedFileURL;
        } else {
            return res.status(400).send({ message: "No file found" });
        }

        if (!productImage) {
            return res.status(400).send({ status: false, message: "please provide productImage" });
        }
        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "title is mandatory and should have non empty String" })
        }
        if (!isValid(description)) {
            return res.status(400).send({ status: false, message: "description is mandatory and should have non empty String" })
        }
        if (!priceRegex(price)) {
            return res.status(400).send({ status: false, message: "price is mandatory and in number only " })
        }
        if (currencyId = "INR") {
            return res.status(400).send({ status: false, message: "Only indian currency id allowed for example INR" })
        }
        //      if (!isValid(isFreeShipping)){
        //         return res.status(400).send({ status: false, message: "style is mandatory and should have non empty String " })
        //    }

        if (!isValid(style)) {
            return res.status(400).send({ status: false, message: "style is mandatory and should have non empty String " })
        }

        if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizes)) {
            return res.status(400).send({ status: false, message: `please provide availavalesize ${size}` })
        }
        if (!priceRegex(installments)) {
            return res.status(400).send({ status: false, message: "please provide installments only in numbers" })
        }
        let Existtitle = await productModel.findOne({ title: title })
        if (Existtitle) {
            return res.status(400).send({ status: false, msg: "product with this title is already registered" })
        }
        const data = { title: title, description: description, price: price, currencyId: currencyId, isFreeShipping: isFreeShipping, style: style, availableSizes: availableSizes, installments: installments, productImage: productImage }
        let saveData = await productModel.create(data)
        return res.status(201).send({ status: true, message: "Success", data: saveData });

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })

    }

}

const getProducts = async (req, res) => {
    try {
        const productQuery = req.query;

        // Object Manupulation : In  simple words Object formatting
        const filter = { isDeleted: false };

        // Destructuring  
        const { size, name, priceGreaterThan, priceLessThan, priceSort } = productQuery;

        //size validation
        if (isValid(size)) {
            const sizeArray = size.trim().split(",").map((s) => s.trim())
            // The "$all" operator selects the documents where the value of a field is an array that contains all the specified elements.
            filter.availableSizes = { $all: sizeArray }
        };

        //product name validation
        if (name) {
            productQuery.title = name
            // product name validation => if key is present then value must not be empty
            if (!isValid(name)) { return res.status(400).send({ status: false, message: "Product name is invalid!" }) }
            // product name must be in alphabate only
            if (!strRegex(name)) { return res.status(400).send({ status: false, message: "Please enter Product name is alphabets only!" }) }
            filter.title = name.trim()
        }

        // product filter by price greatherThan the given price
        if (priceGreaterThan) filter.price = { $gt: priceGreaterThan }            // $gt : Greater Than
        // product filter by price lessThan the given price                      
        if (priceLessThan) filter.price = { $lt: priceLessThan }                //  $lt  : less Than

        // product filter by both greatherThan and lessThan price
        if (priceGreaterThan && priceLessThan) {
            filter.price = { $gte: priceGreaterThan, $lte: priceLessThan }
        }

        if (isValid(priceSort)) {
            if (!(priceSort == 1 || priceSort == -1)) {
                return res.status(400).send({ status: false, msg: "we can only sort price by value 1 or -1!" })
            }
        }
        else {
            return res.status(400).send({ status: false, msg: "enter valid priceSort of 1 or -1 to filter products!" })
        }

        //DB call => select product from DB by price filter sort the product min price to max price
        const productList = await productModel.find(filter).sort({ price: priceSort })

        // no produt found by price filter
        if (productList.length === 0) return res.status(404).send({ status: false, message: "no product found!" })

        //Successfull execution response with productDetails
        res.status(200).send({ status: true, message: 'Product list', data: productList })

    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

const getProductById = async (req, res) => {
    try {

        let productId = req.params.productId

        if (!isValid(productId)) { return res.status(400).send({ status: false, message: "productId is invalid!" }) }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send({ status: false, msg: "this  productId is not a valid Id" })
        }
        let findProduct = await productModel.findById({  _id: productId,isDeleted: false})
        // console.log(findProduct)5
        if (!findProduct) {
            return res.status(404).send({ status: false, msg: "No product found with this productId" })
        } else {
            return res.status(200).send({ status: true, msg: "success", data: findProduct })
        }

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}

const updateProduct = async function (req, res) {
    try {
        let productId = req.params.productId

        let body = req.body

        const files = req.files

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send({ status: false, msg: "this  productId is not a valid Id" })
        }

        let product = await productModel.findById(productId)

        if (!product) return res.status(404).send({ status: false, message: 'product not found' })

        if (product.isDeleted == true) return res.status(400).send({ status: false, message: `Product is deleted` })

        if (!isValid(files)) return res.status(400).send({ status: false, message: "Please Enter data to update the product" })

         const data = {}
        if (files) {
          
            if (files.length > 0) {
                data.productImage = await imgUpload.uploadFile(files[0])
            }
        }

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = body

        if (!isString(title)) return res.status(400).send({ status: false, message: "title can not be empty" })
        if (title){
          if (await productModel.findOne({ title:title })) return res.status(400).send({ status: false, message: `This title ${title} is already present please Give another Title` })
          data.title = title
        }
           
        if (!isString(description)) return res.status(400).send({ status: false, message: "description can not be empty" })
            if (description) {
            data.description = description
            }

            if (!isString(price)) return res.status(400).send({ status: false, message: "price can not be empty" })
            if (price) {
            if (! priceRegex(price)) return res.status(400).send({ status: false, message: "price should be in  valid Formate with Numbers || Decimals" })
            
            data.price = price
            }

            if (!isString(currencyId)) return res.status(400).send({ status: false, message: "currencyId can not be empty" })
            if (currencyId) {
            if (!/^INR$/.test(currencyId)) return res.status(400).send({ status: false, message: `currencyId Should be in this form 'INR' only` })
          
            data.currencyId = currencyId
            }

            if (!isString(currencyFormat)) return res.status(400).send({ status: false, message: "currencyFormat can not be empty" })
            if (currencyFormat) {
         if (!/^₹$/.test(currencyFormat)) return res.status(400).send({ status: false, message: `currencyFormat Should be in this form '₹' only` })
            
            data.currencyFormat = currencyFormat
            }

            if (!isString(isFreeShipping)) return res.status(400).send({ status: false, message: "isFreeShipping can not be empty" })
        if (isFreeShipping) {
            if (!/^(true|false)$/.test(isFreeShipping)) return res.status(400).send({ status: false, message: `isFreeShipping Should be in boolean with small letters` })
          data.isFreeShipping = isFreeShipping
        }
        if (!isString(style)) return res.status(400).send({ status: false, message: "style can not be empty" })
            if (style) {
            data.style = style
            }

            if (!isString(availableSizes)) return res.status(400).send({ status: false, message: "availableSizes can not be empty" })
            if (availableSizes) {
            availableSizes = availableSizes.toUpperCase()
            let size = availableSizes.split(',').map(x => x.trim())

            for (let i = 0; i < size.length; i++) {
                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size[i]))) return res.status(400).send({ status: false, message: `availableSizes should have only these Sizes ['S' || 'XS'  || 'M' || 'X' || 'L' || 'XXL' || 'XL']` })

            }
            data['$addToSet'] = {}
            data['$addToSet']['availableSizes'] = size

        }


        if (!isString(installments)) return res.status(400).send({ status: false, message: "installments can not be empty" })
        if (installments) {
       
       

            if (!priceRegex(installments)) return res.status(400).send({ status: false, message: "installments should have only Number" })
      
            data.installments = installments
        }

        const newProduct = await productModel.findByIdAndUpdate(productId, data, { new: true })

        return res.status(200).send({ status: true, message: "Success", data: newProduct })

    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}

const deleteProductbyId = async function (req, res) {
    try {
        const Id = req.params.productId;

        if (!mongoose.Types.ObjectId.isValid(Id)) {
            return res.status(400).send({ status: false, msg: "this  productId is not a valid Id" })
        }

        const findProductbyId = await productModel.findOne({ _id: Id, isDeleted: false })
        if (!findProductbyId) return res.status(404).send({ status: false, msg: "Product Not Found or Does Not Exist" })

        // DB Call And Update => isDeleted as false
        await productModel.findOneAndUpdate({ _id: Id, isDeleted: false },
            { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true });

        // Sucessfull delete product return responce to body 
        return res.status(200).send({ status: true, message: " Product has been deleted successfully" });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};
  
 

module.exports.createProduct = createProduct
module.exports.getProducts = getProducts
module.exports.getProductById=getProductById
module.exports.updateProduct=updateProduct
module.exports.deleteProductbyId=deleteProductbyId



