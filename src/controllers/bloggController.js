const blogModel=require('../modules/bloggModel')
const authorModel=require('../modules/authorModel');
const {isValidObjectId}=require('mongoose');


//-------------------------------------------------------------------------------------------------------------------------------

const createBlog=async (req,res)=>{
 try{
    if(!req.body.title||!req.body.category||!req.body.body||!req.body.authorId) return res.status(400).send({Error:" Please enter require key- title,category,body,authorId"})
    
    if(!isValidObjectId(req.body.authorId)) return res.status(404).send({error:"ID Incorrect"});

    const authorID=await authorModel.findById(req.body.authorId);

    if(!authorID) return res.status(404).send({error:"invalid author id"});

    req.body.title=req.body.title.trim();

    req.body.body=req.body.body.trim();

    const create=await blogModel.create(req.body)
    res.status(201).send({status:true,msg:create})
    }catch(error){
        return res.status(500).send({status:false,error:error.message})
    }

};

//------------------------------------------------------------------------------------------------------------------------------------------

const getBlogs = async function(req,res){
    try {
        let result = { isDeleted: false, isPublished: true }
        const {authorId,category,tags,subcategory} = req.query

        if (authorId) {
            if (!isValidObjectId(authorId)) {
                return res.status(400).send({ status: false, msg: "Enter valid authorId" })
            } else {
                result.authorId = authorId
            }
        }

        if (category) {
            result.category = category
        }

        if (tags) {
            result.tags = tags
        }
        if (subcategory) {
            result.subcategory = subcategory
        }

        let data = await blogModel.find(result);
        if(data.length==0) return res.status(404).send("No such data");
        return res.status(200).send({status:true, data:data})
        }
        catch (error) {
    return res.status(500).send({status:false, error:error.message})
}};

//--------------------------------------------------------------------------------------------------------------------------------

const updateBlog = async function(req, res) {

    try {

        let final = { isPublished: true, publishedAt: Date.now()}
        const data = req.params.blogId
        if(!isValidObjectId(data)) return res.status(400).send({ status: false, msg: "Enter valid authorId" }) // ----added
        
        const { title, body, tags, subcategory } = req.body
        
        if (Object.keys(req.body).length === 0) {
            return res.status(400).send({ status: false, msg: "Please enter details" })
        }

        let blogData = await blogModel.findOne({ _id: data});

        if(!blogData) return res.status(404).send({ status:false, msg:"Blog not found"})

        if (blogData.isDeleted == true) return res.status(404).send({ status: false, msg: "Blog is deleted" })

        if (title) {
            final.title = title
        }
        if (body) {
            final.body = body
        }
        if(tags){
            let result=[]
           
             if(Array.isArray(tags)){
                for(let i=0;i<tags.length;i++)
                {
                    if(typeof tags[i]!=="string")
                    {
                        return res.status(404).send({result:"invalid data passed in tags"})
                    }
                }
              result=[...tags]}
              else if(typeof tags==="string")

             {result.push(tags)}
            else{
               return res.status(400).send({status:false,error:"Invalid data pass "})
           }
       let updatedTag=[...blogData.tags,...result]
         final.tags=updatedTag;
}

if(subcategory){
    let result=[]
    if(Array.isArray(subcategory))
    {
        for(let i=0;i<subcategory.length;i++)
        {
            if(typeof subcategory[i]!=="string")
            {
                return res.status(404).send({result:"invalid data passed in subcategory"})
            }
        }
        console.log(subcategory)
        result=[...subcategory]
    }
   else if(typeof subcategory==="string")
    {result.push(subcategory)}   
    else
    {
        
       return res.status(404).send({result:"invalid data passed in subcategory"})
    }

let updatedSubcategory=[...blogData.subcategory,...result]
final.subcategory=updatedSubcategory;
}
            
        let result = await blogModel.findOneAndUpdate({ _id: data }, final, { new: true })
        return res.status(200).send({ status: true, data: result })
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message})
}
};

//-------------------------------------------------------------------------------------------------------------------------------------------------

const deletById=async function(req,res){
    try{    
    let blogid=req.params.blogId;
     if(!isValidObjectId(blogid)) return res.status(400).send({ status: false, msg: "Enter valid authorId" })//-----added    

    let id= await blogModel.findById(blogid);
    if(!id) return res.status(404).send("Blogg not found")

    if(id.isDeleted==true) return res.status(404).send("no such id")

    let blogDeleted=await blogModel.findOneAndUpdate({_id:id},{isDeleted:true,deletedAt:Date.now()},{new:true})
    
    return res.status(200).send("blogg is deleted")
     
} catch(error){
    res.status(500).send({satus:false,msg:error.message})

}};

//-----------------------------------------------------------------------------------------------------------------------------------------------------------------

const deleteQuery = async function(req, res) {
     
    const { category, authorId, isPublished, tags, subCategory } = req.query

    if (!(category || authorId || isPublished || tags || subCategory)) {
        return res.status(400).send({ status: false, msg: "Kindly enter any value" })
    }
    if(authorId){   
    if(!isValidObjectId(authorId)) return res.status(400).send({ status: false, msg: "Enter valid authorId" })

    
    let authorLoggedIn = req.token
    if (authorId != authorLoggedIn) return res.status(403).send({ status: false, msg: 'Access is Denied' })
}
    let check=await blogModel.find({authorId:req.token,...req.query,isDeleted:false})

    if(check.length==0) return res.status(404).send({error:"no such blog"})
    let a=req.query.category

    const update = await blogModel.updateMany({authorId:req.token,...req.query,isDeleted:false}, 
    { isDeleted: true, deletedAt: Date.now(), new: true })
    return res.status(200).send({ status: true, data:`${check.length} data deleted`})
}

module.exports={createBlog,getBlogs,updateBlog,deletById,deleteQuery}
