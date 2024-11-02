import { fileURLToPath, pathToFileURL } from "url";
import { name } from "ejs";
import { error } from "console";
import { dirname } from "path";

const dircName=dirname(fileURLToPath(import.meta.url));
const indexPage = await import(pathToFileURL(dircName + "/../index.js"));
const userDatabase = [];

//USERSERVICE
 export class UserService {
    constructor() {
        this.userCount = 0; // To keep track of user IDs
    }

    newUserDetails(req) {
        const { email, username, password, confirm_password } = req.body;
        return { email, username, password, confirm_password };
    }

    userExists(email, username) {
        return userDatabase.some(user => user.email === email || user.username === username);
    }

    validatePassword(password) {
        const minLength = 8;
        const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/; // Adjust the special characters as needed
        const numberPattern = /\d/; // Matches any digit
    
        if (password.length < minLength) {
            return { valid: false, error: "Password must be at least 8 characters long." };
        }
        if (!specialCharPattern.test(password)) {
            return { valid: false, error: "Password must contain at least one special character." };
        }
        if (!numberPattern.test(password)) {
            return { valid: false, error: "Password must contain at least one number." };
        }
    
        return { valid: true };
    }


    addUserInDb(userDetails) {

        if (this.userExists(userDetails.email, userDetails.username)) {
            return { success: false, error: "User with this email or username already exists." };
        }

        if(!this.validatePassword(userDetails.password).valid){
            return {success:false, error:this.validatePassword(userDetails.password).error}
        }

        if (userDetails.password === userDetails.confirm_password) {
            const userData = {
                id: this.userCount++,
                email: userDetails.email,
                username: userDetails.username,
                password: userDetails.password,
                authKey:'none',
                plan: 'none', // Initial plan is 'none'
            };
            userDatabase.push(userData);
            return { success: true, userId: userData.id };
        } else {
            return { success: false, error: "Passwords do not match." };
        }
    }


    finduser(key){

        var userfound=false;
        var userdetails={};
    
        userDatabase.forEach(user => {
            if(user.username==key || user.email==key|| user.id==key){
             userfound=true;
             userdetails=user;   
            }
        });
    
        if(userfound){
            return { 
                userdetails:userdetails,
                success: true,
            }
        }else{
        return{
            success:false,
            error:"Couldn't find user"
        }
    }
    }
    


    deleteUserInDb(userid){
      try{
        const initialLength = userDatabase.length;
        // Use filter to create a new array without the user to delete
        userDatabase = userDatabase.filter(user => user.id !== userId);

        // Check if a user was actually deleted
        return { success: userDatabase.length < initialLength,
            message: 'User deleted successfully'
        }
    }catch(error){
        return { success: userDatabase.length < initialLength,
            message: 'Could not delete user'
        }
    }
    }

}









//AUTHKEY SERVICE
export class AuthKeyService {
    constructor() {
        this.authKeys = new Set(); // Use Set for efficient key checks
    }

    generateKey() {
        return Math.floor(Math.random() * 1000);
    }

    isKeyAssigned(key) {
        return this.authKeys.has(key);
    }

    assignKeyToUser(user) {
        let newKey;
        do {
            newKey = this.generateKey();
        } while (this.isKeyAssigned(newKey));

        user.authKey = newKey;
        this.authKeys.add(newKey);
        return { success: true, authKey: newKey };
    }

    getUserAuthKey(id){
        userDatabase.forEach(user => {
            if(user.id==id){
                return {
                    success:true, 
                    authkey: user.authKey,
                     username: user.username,
                      email: user.email
                    }
            }
        });

        return {
            success:false, 
            message:`couldn't get authkey of user id ${id} `
            }
    }

}


//APIMANAGEMENTSERVICE
 export class ApiAccessManagement {
    constructor() {
        this.plans = ['none','starter', 'growth', 'pro', 'enterprise'];
    }

    setUserPlan(user, plan) {
        if (this.plans.includes(plan)) {
            user.plan = plan;
            return { success: true };
        } else {
            return { success: false, error: "Invalid plan selected." };
        }
    }

    canAccessApi(user) {
        switch (user.plan) {
            case 'starter':
                return "Access to basic features.";
            case 'growth':
                return "Access to intermediate features.";
            case 'pro':
                return "Access to advanced features.";
            case 'enterprise':
                return "Access to all features.";
            default:
                return "No access. Please subscribe to a plan.";
        }
    }
}


//PASSWORD SERVICE
export class PasswordManager{

    sendresetlink(email){
        //use api mailhcimp or something to send user an reset link
        if(email){
            return{ success:true, message:"email sent" }
        }
        return{ success:false,error:"coldn't send email" }
    }


}

/********************************************ALL FUNCTIONS*********************************/

//CREATE N LOGIN FUNCTIONS

// This function would be called when a user tries to create an account.

export async function createAccount(req, res) {
    const userService = new UserService();
    const authKeyService = new AuthKeyService();
    const apiAccessManagement = new ApiAccessManagement();
     var inprogressid;
     let createstatus=false;

    const userDetails = userService.newUserDetails(req);
    const addUserResponse = userService.addUserInDb(userDetails);

    if (!addUserResponse.success) {
        return {status:400, success: false, error: addUserResponse.error };
    }

    const userId = addUserResponse.userId;
    const user = userDatabase.find(user => user.id === userId);

    const authKeyResponse = authKeyService.assignKeyToUser(user);

    if (!authKeyResponse.success) {
        return {status:500, success: false, error: "Failed to assign auth key." };
    }

    // Set user's plan (none initially)
    const planResponse = apiAccessManagement.setUserPlan(user, 'none');

    if (!planResponse.success) {
        return {status:400, success: false, error: planResponse.error };
    }

     inprogressid=user.id;
    return {
        status:200,
        success: true,
        message: "User created successfully.",
        userId: user.id,
        authKey: user.authKey,
        plan: user.plan,
        apiAccess: apiAccessManagement.canAccessApi(user)
    };
if(createstatus=false){
    userService.deleteUserInDb(userId);
}
}

// delete an user
export async function deleteUser(id){
    const userservice= new UserService();
    const deleteuserstatus= userservice.deleteUserInDb(id);
    
    if(!deleteuserstatus){
        return {status:400,message:`couldn't delete user`};
    }else{
        return {
            status:200,
            success:true,
            message:`user with id ${id} has been deleted`
        }
    }
}



//This function would trigger when user tries to login
export async function login(req,res){
const userservice = new UserService();

const userfound=userservice.finduser(req.body.username);
if(!userfound.success){
    return {status:400,success:false,error:userfound.error};
}

const userdetailsfound=userfound.userdetails;

if(req.body.password===userdetailsfound.password.trim()){
    req.session.user={
        userid:userdetailsfound.id
    }

    process.env.userid=userdetailsfound.id;
    process.env['auth-token']=userdetailsfound.authKey;

    return {status:200,success:true}

}else{

    return { status:500, success:false, error:"Incorrect Password"}
}
}


export async function passwordreset(req) {
    const userservice= new UserService();
    const passwordmanager=new PasswordManager();
    const useremail= req.body.email;
    
    const userfound=userservice.finduser(useremail);
    
    
    if(!userfound.success){
        return {status:400,success:false,error:userfound.error};
    }

    
    const sendlinkcall=passwordmanager.sendresetlink(useremail);
    
    if(!sendlinkcall.success){
        return {status:400 ,success:false, error:sendlinkcall.error}
    }

    return{
        status:200,
        success:true,
        message:'password reset link has been sent to your email'
    }

    
}