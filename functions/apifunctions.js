import axios from "axios";
import { error } from "console";
import { application, response } from "express";


//get api req
export async function getapiResponse(url){
    var res;
    try {
        const response = await axios.get(url); // Wait for the promise to resolve
        res= response.data; // Return the data from the response
    } catch (error) {
        console.error('Error fetching data:', error); // Log the error
        throw error; // Rethrow the error to be handled by the caller
    }
return res;
};


//get basic Authorization api req

export async function getbasicAuthapi(url){
var username=process.env.myusername;
var password=process.env.password;
var basicAuth="Basic "+btoa(username +':'+ password);
console.log(basicAuth+" This is 64bit encoded")

try{
const response= await axios.get(url,{
headers:{Authorization: basicAuth}
});
console.log(response);
}catch(error){
console.log(error);
}
}


//post token auth api req
export async function postTokenAuthapi(url,token,data) {
const toke="Bearer "+process.env['auth-token'];

try{
const response=await axios.post(url,data,{
    headers:{Authorization:toke,
        'Content-Type':'application/json'
    }
})
console.log(response);
}catch(error){
    console.log(error);
}
}