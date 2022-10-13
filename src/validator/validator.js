const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
    }
  
     const isValidName =function (value){
        let name =/^[A-Z][a-z,.'-]+(?: [A-Z][a-z,.'-]+)*$/
        if(name.test(value)) return true;
         return false;
     } 
  
     const isvalidEmail =function (value){
      let email =/^[a-z0-9_]{1,}@[a-z]{3,10}[.]{1}[a-z]{3}$/
      if(email.test(value)) return true;
       return false; 
     }
     const isvalidMobile = function (value){
      let phone = /^[6-9]\d{9}$/
      if(phone.test(value)) return true;
       return false; 
     }
    const isValidPassword = function (value) {
        let password = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/
        if (password.test(value)) return true;
      };
   // const isValidImg = /([a-zA-Z0-9\s_\\.\-:])+(.png|.jpg|.gif)$/

      const pincodeValid=function (value){
        let pin =/^(\d{6})$/;
        if(pin.test(value)) return true;
        return false;
      }
  
      const keyValid = function (value) {
        if (Object.keys(value).length > 0) return true;
        return false;
      };
  
      module.exports={isValid,isValidName,isvalidEmail,isvalidMobile,isValidPassword,pincodeValid,keyValid}