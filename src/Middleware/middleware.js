const jwt = require("jsonwebtoken");
const blogModel = require("../modules/bloggModel")
const validator = require("validator")

const idcheck = function(value) {
    let a = validator.isMongoId(value)
    if (!a) {
        return true
    } else return false
}

const auth = function(req, res, next) {

    try {
       
        let token = req.headers["x-api-key"]

        if (!token) { return res.status(401).send({ status: false, msg: "Token must be present in request headers" }) }
  
        jwt.verify(token, "californium-blog",function(err, decodedToken){ 
            
            if(err) return res.status(401).send({ status: false, msg: "Token is Incorrect" })
            req.token = decodedToken.authorId
    
            next()
            
        })
        

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}



const authorisation = async function(req, res, next) {

    try {
      
        //let token = req.headers["x-api-key"]
        const blogId = req.params.blogId
        if(idcheck(req.params.blogId)) return res.status(404).send({status:false,msg:"ID Incorrect"});
        const blog = await blogModel.findById(blogId).select({ authorId: 1, _id: 0 })
         if (blog == null) {
            
             return res.status(404).send({ status: false, msg: "Blog document doesn't exist.." })
         }

        const authorId = blog.authorId.toString()
        //const decodedToken = jwt.verify(token, "californium-blog")
        if (authorId != req.token) {
            return res.status(403).send({ status: false, msg: 'Access is Denied' })
        }
        
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
    next()
}

module.exports.auth = auth
module.exports.authorisation = authorisation
