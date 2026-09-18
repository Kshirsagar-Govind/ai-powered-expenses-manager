import bcrypt from "bcrypt";

async function HashPass(pass: String) {

    console.log(bcrypt.hash(pass, 10))

}
await HashPass("Test@123");