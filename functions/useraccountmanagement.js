import { name } from "ejs";

const indexpage=await import(pathToFileURL(dircName+"index.js"));
const userdatabase=[];

var newuserid;


function newuserdetails(req,res){
const email= req.body.email;
const name=req.body.username;
const password=req.body.password;
const confirm_password= req.body.confirm_password;
}

function adduserinuserdb(){
  let useraddedtodb=false;
    try{
    userdata={
        id: userdatabase.length,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
    }
    userdatabase.push(userdata);
    useraddedtodb=true;
    newuserid=userdata.id;
    return useraddedtodb;
}catch(error){
useraddedtodb=false;
console.log(error);
return useraddedtodb;
}
}

function generateuserauthkey(){
    var uniquekey=Math.floor(Math.random()*1000);
    return uniquekey
}

function assignauthkeytouser(id){
let authkeyassigned=false;
    userdatabase.forEach(element => {
try{
        if(element.id==id){
element.authkey=generateuserauthkey();
authkeyassigned=true;
return authkeyassigned;
}
    }catch(error){
console.log("Coulnd't assign auth key to user"+error);
return authkeyassigned;
    }    
});
}

function createaccount(){
    //get user entered details
    //verify userdetails
    if(newuserdetails.password==newuserdetails.confirm_password){
        //store the user in db
       if(adduserinuserdb()){
        //createauthkey
        

       }

    }

    // store it in db.
    // generate a api token
    //set session variables.
    //display account creted message
    // respond status 200
}