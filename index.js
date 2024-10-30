import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
import session from "express-session";

dotenv.config();


const app=express();//server app
const appserver=process.env.PORT||3000; //server port
export const dircName= dirname(fileURLToPath(import.meta.url)); //project directory
const apipage=await import(pathToFileURL(dircName+"/functions/apifunctions.js"));

//==================Middlewares==================
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(dircName+"/public"));

//=================Session configuration============
app.use(session({
    secret:process.env['auth-token'],
    resave:false,
    saveUninitialized:false,
    cookie:{
        secure:false,
        maxAge:0.15*60*60*100,
    }
}));
app.use((req,res,next)=>{
if(req.session){
    maxAge:0.15*60*60*100
}
next();
})

export const isAuthenticated=(req,res,next)=>{
    if(req.session && req.session.user){
        return next();
    }else{
        res.status(401).redirect('/login');
        console.log("please log in not authorized");
    }
}


//=========================

//===================
app.get('/getISS',async(req,res)=>{
    })
    


//landingPage
app.get("/",isAuthenticated,async(req,res)=>{
 
    const data = await apipage.getapiResponse("https://api.wheretheiss.at/v1/satellites/25544"); // Await the response
    const affr= await apipage.getapiResponse("https://www.affirmations.dev/");
         res.render(dircName + "/views/mainpages/index.ejs", { apiData: data, affrimation:affr }); // Pass data to your view if needed

});


//about page route
app.get("/about",(req,res)=>{
     res.render(dircName + "/views/mainpages/about.ejs");
})


//contact page route
app.get("/contact",(req,res)=>{
    res.render(dircName + "/views/mainpages/contactpage.ejs");
})

//api docs page route
app.get("/api-docs",(req,res)=>{
    res.render(dircName + "/views/mainpages/apidocs.ejs");
})

//billing page route
app.get("/billing/:id",(req,res)=>{
    const selectedplan=req.params.id;
    res.render(dircName + "/views/mainpages/billing.ejs",{
        plan:selectedplan,
    });
})

//billing page route
app.get("/paymentbroker/:selectedplan",(req,res)=>{
    const selectedplan=req.params.id;
    res.send(`  <h1>This should go to the payment broker page to carry out the transaction for the ${selectedplan}.</h1>
        <a href="/home" style="text-decoration: none; color: blue;">Home</a>`);
});



/paymentbroker/



//Home route
app.get("/home",(req,res)=>{
    res.redirect("/");
})


//==================================Server=====================
//Listener for appserver
app.listen(appserver,()=>{
console.log("listening on server "+appserver);
})