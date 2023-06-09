const blogModel=require('../modules/bloggModel')
const authorModel=require('../modules/authorModel');
const {isValidObjectId}=require('mongoose');


//-------------------------------------------------------------------------------------------------------------------------------

const createBlog=async (req,res)=>{
 try{
    
    const blogObject={};
    
  
        // title
    if(!req.body.title) return res.status(400).send({status:false,message:'title is a mendatory field'});
    req.body.title=req.body.title.trim();
    if(req.body.title=='')  return res.status(400).send({status:false,message:'title cannot be empty'});
    blogObject.title=req.body.title;

    // body
    if(!req.body.body) return res.status(400).send({status:false,message:'body is a mendatory field'});
    req.body.body=req.body.body.trim();
    if(req.body.body=='')  return res.status(400).send({status:false,message:'body cannot be empty'});
    blogObject.body=req.body.body;

    // tags
    if(req.body.tags) blogObject.tags=req.body.tags;

    //category
      if(!req.body.category) return res.status(400).send({status:false,message:'category is a mendatory field'});
      req.body.category=req.body.category.trim();
      if(req.body.category=='')  return res.status(400).send({status:false,message:'category cannot be empty'});
      blogObject.category=req.body.category;

      // isPublished
      if(req.body.isPublished)
      {
      if(typeof req.body.isPublished != 'boolean') return res.status(400).send({status:false,message:'isPublished should be boolean only'});
      blogObject.isPublished=req.body.isPublished

      }

    // authorId
    if(!req.body.authorId) return res.status(400).send({status:false,message:'authorId is a mendatory field'});
    req.body.authorId=req.body.authorId.trim();
    if(req.body.authorId=='')  return res.status(400).send({status:false,message:'authorId cannot be empty'});
    // verification of authorId
    if(!isValidObjectId(req.body.authorId)) return res.status(400).send({status:false,message:"Incorrect authorID"});
    //  const authorID=await authorModel.findById(req.body.authorId);
    // if(!authorID) return res.status(404).send({status:false,message:"no author found with this authorID"});
    if(req.token!=req.body.authorId) return res.status(400).send({status:false,message:"Invalid user"});
    blogObject.authorId=req.body.authorId

    const createdData=await blogModel.create(blogObject)
    return res.status(201).send({status:true,data:createdData})
    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }

};

//------------------------------------------------------------------------------------------------------------------------------------------

const getBlogs = async function(req,res){
    try {
        let blogObject = { isDeleted: false, isPublished: true }
        const {authorId,category,tags,subcategory} = req.query

        if (authorId) {
            if (!isValidObjectId(authorId)) {
                return res.status(400).send({ status: false, message: "Enter valid authorId" })
            } else {
                blogObject.authorId = authorId
            }
        }


        if (category) {
            blogObject.category = category
        }

        if (tags) {
            blogObject.tags = tags
        }
        if (subcategory) {
            blogObject.subcategory = subcategory
        }

        let data = await blogModel.find(blogObject);
        if(data.length==0) return res.status(404).send({status:false,message:"No such data"});
        return res.status(200).send({status:true, data:data})
        }
        catch (error) {
    return res.status(500).send({status:false, message:error.message})
}};

//--------------------------------------------------------------------------------------------------------------------------------

const updateBlog = async function(req, res) {

    try {

        let updateBlogObject = { isPublished: true, publishedAt: Date.now()}
        const blogId = req.params.blogId
        if(!isValidObjectId(blogId)) return res.status(400).send({ status: false, message: "Enter valid blogId" }) 
        
        const { title, body, tags, subcategory } = req.body
        
        if (Object.keys(req.body).length === 0) {
            return res.status(400).send({ status: false, message: "Please enter details" })
        }

        let blogData = await blogModel.findOne({ _id: blogId});

        if(!blogData) return res.status(404).send({ status: false, message:"Blog not found"})

        if (blogData.isDeleted == true) return res.status(404).send({ status: false, message: "Blog is deleted" })

        if (title) {
            updateBlogObject.title = title
        }
        if (body) {
            updateBlogObject.body = body
        }
        if(tags){
            let result=[]
           
             if(Array.isArray(tags)){
                for(let i=0;i<tags.length;i++)
                {
                    if(typeof tags[i]!=="string")
                    {
                        return res.status(400).send({status: false, message:"invalid data passed in tags"})
                    }
                }
              result=[...tags]
            }
              else if(typeof tags==="string")
             {
                result.push(tags)
             }
            else{
               return res.status(400).send({status:false,message:"Invalid data pass "})
           }
       let updatedTag=[...blogData.tags,...result]
         updateBlogObject.tags=updatedTag;
}

if(subcategory){
    let result=[]
    if(Array.isArray(subcategory))
    {
        for(let i=0;i<subcategory.length;i++)
        {
            if(typeof subcategory[i]!=="string")
            {
                return res.status(400).send({status: false, message:"invalid data passed in subcategory"})
            }
        }
        
        result=[...subcategory]
    }
   else if(typeof subcategory==="string")
    {result.push(subcategory)}   
    else
    {
        return res.status(404).send({status: false, message:"invalid data passed in subcategory"})
    }
    
    let updatedSubcategory=[...blogData.subcategory,...result]
    updateBlogObject.subcategory=updatedSubcategory;

}
      let result = await blogModel.findOneAndUpdate({ _id: blogId }, updateBlogObject, { new: true })
      return res.status(200).send({ status: true, data: result })
            
    }
     catch (error) {
        return res.status(500).send({ status: false, message: error.message})
}
};

//-------------------------------------------------------------------------------------------------------------------------------------------------

const deletById=async function(req,res){
    try{    
    let blogid=req.params.blogId;
     if(!isValidObjectId(blogid)) return res.status(400).send({ status: false, message: "Enter valid authorId" })//-----added    

    let blogData= await blogModel.findById(blogid);
    if(!blogData) return res.status(404).send({status: false, message:"Blogg not found"})

    if(blogData.isDeleted) return res.status(404).send({status: false, message:"no such id"})

    await blogModel.findOneAndUpdate({_id:blogid},{isDeleted:true,deletedAt:Date.now()})
    
    return res.status(200).send({status: false, message:"blogg is deleted"})
     
} catch(error){
    return res.status(500).send({satus:false,message:error.message})

}};

//-----------------------------------------------------------------------------------------------------------------------------------------------------------------

const deleteQuery = async function(req, res) {
     
    const { category, authorId, isPublished, tags, subCategory } = req.query

    if (!category && !authorId && !isPublished && !tags && !subCategory) {
        return res.status(400).send({ status: false, message: "Kindly enter some data" })
    }
    if(authorId){   
    if(!isValidObjectId(authorId)) return res.status(400).send({ status: false, message: "Enter valid authorId" })

    
    let authorLoggedIn = req.token
    if (authorId != authorLoggedIn) return res.status(403).send({ status: false, message: 'Access is Denied' })
}
    let check=await blogModel.find({authorId:req.token,...req.query,isDeleted:false})

    if(check.length==0) return res.status(404).send({status: false, message:"no such blog"})
  
     await blogModel.updateMany({authorId:req.token,...req.query,isDeleted:false}, 
    { isDeleted: true, deletedAt: Date.now(), new: true })
    return res.status(200).send({ status: true, data:`${check.length} data deleted`})
}

module.exports={createBlog,getBlogs,updateBlog,deletById,deleteQuery}
