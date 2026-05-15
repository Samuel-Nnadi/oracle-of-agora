import { generateEntitySecret } from '@circle-fin/developer-controlled-wallets';

const secret = generateEntitySecret();
console.log("-----------------------------------------");
console.log("NEW ENTITY SECRET (SAVE THIS IN .env):");
console.log(secret);
console.log("-----------------------------------------");