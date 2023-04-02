const jwt = require("jsonwebtoken");
const validator=require("validator")
const author=require("../modules/authorModel");

const createAuthor=async function(req,res){
  try {
    let data=req.body;
   
    // if(!data.fname||!data.lname||!data.title||!data.email||!data.password) return res.status(400).send({status:false,message:"please fill all the fields"})
// first name setup
    if(!data.fname) return res.status(400).send({status:false,message:"first name is a mendatory field"})
    let fname=data.fname.trim().split(" ").join("")
    data.fname=fname;
    if(!validator.isAlpha(data.fname))  return res.status(400).send({status:false,message:"invalid first name"})


// last name setup
    if(!data.lname) return res.status(400).send({status:false,message:"last name is a mendatory field"})
    let lname=data.lname.trim().split(" ").join("")
    data.lname=lname;
    if(!validator.isAlpha(data.lname))  return res.status(400).send({status:false,message:"invalid last name"})

// title setup
     if(!data.title) return res.status(400).send({status:false,message:"title is a mendatory field"})
    if ( data.title != "Mr" && data.title != "Mrs" &&  data.title != "Miss") {
            return res.status(400).send({ status: false, message: "Invalid Title - The title should be in [Mr / Mrs / Miss]" })
        }

// email setup
    if(!data.email) return res.status(400).send({status:false,message:"email is a mendatory field"})
    data.email=data.email.trim();
    if(data.email=='') return res.status(400).send({status:false,message:"email cannot be empty"})
     if(!(validator.isEmail(!data.email))) return res.status(400).send({status:false,message:"please put a valid email"})
     data.email=data.email.toLowerCase();
     
// password setup

if(!data.password) return res.status(400).send({status:false,message:"password is a mendatory field"})
     if (!validator.isStrongPassword(data.password)) {
      return res.status(400).send({ status: false, message: "Kindly use atleast one uppercase alphabets, numbers and special characters for strong password." })
}
let checkEmail=await author.findOne({email:data.email})
if(checkEmail) return res.status(400).send({status:false,message:"email already exists"})
     
     let setData=await author.create(data);
    return res.status(201).send({status:true,data:setData});
}catch(error){
   return  res.status(500).send({status:false,message:error.message})
}
}

const login = async(req, res) => {
  try {
      let email = req.body.email.toLowerCase()
      let password = req.body.password

      if (!email) {
          return res.status(400).send({ status: false, message: "Please Enter email id" })
      }
      email=email.trim()

      if (!password) {
        return res.status(400).send({ status: false, message: "Please provide password" })
    }
      password=password.trim()
      if(password=='') return res.status(400).send({status:false,message:'password cannot be empty'})


      let checkUser = await author.findOne({ email: email }).select({ email: 1, password: 1 })

      if (!checkUser) {
          return res.status(400).send({ status: false, message: "Email Id and password are not matched" })
      }
      // Generate token

      let token = jwt.sign({ authorId: checkUser._id.toString(), batch: "californium"}, //payload
          "californium-blog" //secret key
      );
      res.setHeader("x-api-key", token)
     return res.status(201).send({ status: true, data: token })

  } catch (error) {
      return res.status(500).send({ status: false, message: error.message })
  }
}


module.exports={createAuthor,login};
