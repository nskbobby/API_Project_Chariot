import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
import session from "express-session";
import { stat } from "fs";


dotenv.config();

const app = express(); //server app
const appserver = process.env.PORT || 3000; //server port
export const dircName = dirname(fileURLToPath(import.meta.url)); //project directory
const apipage = await import(
  pathToFileURL(dircName + "/functions/apifunctions.js")
);
const useraccountmanager =  import(
    pathToFileURL(dircName + "/functions/useraccountmanagement.js")
  );


//==================Middlewares==================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(dircName + "/public"));

//=================Session configuration============
app.use(
  session({
    secret: process.env["auth-token"],
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 0.15 * 60 * 60 * 100,
    },
  })
);
app.use((req, res, next) => {
  if (req.session) {
    maxAge: 0.15 * 60 * 60 * 100;
  }
  next();
});

export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.status(401).redirect("/login");
    console.log("please log in not authorized");
  }
};

//======================post routes===================
//This is when user log into the website
app.post("/login",async(req,res)=>{
   const accountmanager=await useraccountmanager;
   try{
   const loginmanagerresponse= await accountmanager.login(req,res);
   console.log(loginmanagerresponse);
   
   // Respond to the client based on the reply
           if (loginmanagerresponse.success) {
            res.redirect(`/logincontrol/login?message=${encodeURIComponent(loginmanagerresponse.message)}`); // Send success response
        } else {
            res.redirect(`/logincontrol/login?message=${encodeURIComponent(loginmanagerresponse.error)}`); // Send error response with status
        }

}catch(error){
    console.error("Error while logging in: ", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
}
});

//this is triggered when trying to create an account
app.post("/signup",async(req,res)=>{
    const accountmanager=await useraccountmanager;
     try {
        const signupmanager = await accountmanager.createAccount(req, res); // Await the promise
              // Respond to the client based on the reply
        if (signupmanager.success) {
            res.redirect(`/logincontrol/login?message=${encodeURIComponent(signupmanager.message)}`); // Send success response
        } else {
            res.redirect(`/logincontrol/signup?message=${encodeURIComponent(signupmanager.error)}`); // Send error response with status
        }
    } catch (error) {
        console.error("Error creating account:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }

 });

 //This is when user clicks forgot password
 app.post("/forgotpassword",async(req,res)=>{
    const accountmanager= await useraccountmanager;
    try{
      const passwordresetresponse=await accountmanager.passwordreset(req);
      if(passwordresetresponse.success){
        res.redirect(`/logincontrol/forgotpassword?message=${encodeURIComponent(passwordresetresponse.message)}`);//send success response
      }else{
        res.redirect(`/logincontrol/forgotpassword?message=${encodeURIComponent(passwordresetresponse.error)}`);//send error response
      }
    }catch(error){
console.log("Internal server error"+error);
res.status(500).json({success:false, error:"internal server error"});
    }
 })


//======================get routes===================
//landingPage
app.get("/" /*,isAuthenticated*/, async (req, res) => {
  const data = await apipage.getapiResponse(
    "https://api.wheretheiss.at/v1/satellites/25544"
  ); // Await the response
  const affr = await apipage.getapiResponse("https://www.affirmations.dev/");
  res.render(dircName + "/views/mainpages/index.ejs", {
    apiData: data,
    affrimation: affr,
  }); // Pass data to your view if needed
});

//login and signup
app.get("/logincontrol/:request",(req,res)=>{
const request=req.params.request;
const message=req.query.message || null;
res.render(dircName + "/views/mainpages/login.ejs", {
    request:request,
    message:message
});
});


//accountoptions
app.get("/accounticon/:selection", (req, res) => {
    const message=req.params.message||"undefined";
  const selection = req.params.selection;
  if(req.session.user){
    res.render(dircName + "/views/mainpages/account.ejs", {
                selection: selection,
                message: message,
               });
  }else{
      res.render(dircName + "/views/mainpages/login.ejs",{
        request:"login",
        message:message
      });
    }
});

//about page route
app.get("/about", (req, res) => {
  res.render(dircName + "/views/mainpages/about.ejs");
});

//contact page route
app.get("/contact", (req, res) => {
  res.render(dircName + "/views/mainpages/contactpage.ejs");
});

//api docs page route
app.get("/api-docs", (req, res) => {
  res.render(dircName + "/views/mainpages/apidocs.ejs");
});

//billing page route
app.get("/billing/:id", (req, res) => {
  const selectedplan = req.params.id;
  res.render(dircName + "/views/mainpages/billing.ejs", {
    plan: selectedplan,
  });
});

//billing page route
app.get("/paymentbroker/:selectedplan", (req, res) => {
  const selectedplan = req.params.id;
  res.send(`  <h1>This should go to the payment broker page to carry out the transaction for the ${selectedplan}.</h1>
        <a href="/home" style="text-decoration: none; color: blue;">Home</a>`);
});


//Home route
app.get("/home", (req, res) => {
  res.redirect("/");
});

//==================================Server=====================
//Listener for appserver
app.listen(appserver, () => {
  console.log("listening on server " + appserver);
});
