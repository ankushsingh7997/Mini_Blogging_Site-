const express=require('express')
const bodyParser=require('body-parser')
const route=require('./route/route')
const {default:mongoose}=require('mongoose')
const app=express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}));


mongoose.connect("mongodb+srv://Vishanksingh:7997@cluster0.ga4iiwd.mongodb.net/miniblogging", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )



app.use('/',route)
app.listen(3000,function(){
    console.log('express is running on port 3000')
});
