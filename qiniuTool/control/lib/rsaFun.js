/**
 * Created by weijianli on 15/12/11.
 */
'use strict';

var fs = require('fs')
    , ursa = require('ursa')
    , crt
    , key
    , msg
    ;

key = ursa.createPrivateKey(fs.readFileSync('./rsa/rsa-server.key'));
crt = ursa.createPublicKey(fs.readFileSync('./rsa/rsa-server.pub'));

console.log('我准备编码了');
msg = crt.encrypt("lalalalaalala", 'utf8', 'base64');
console.log('encrypted', msg, '\n');

console.log('Decrypt with Private');
msg = key.decrypt(msg, 'base64', 'utf8');
console.log('decrypted', msg, '\n');

//console.log('############################################');
//console.log('Reverse Public -> Private, Private -> Public');
//console.log('############################################\n');
//console.log('Encrypt with Private (called public)');
//msg = key.privateEncrypt("Everything is going to be 200 OK", 'utf8', 'base64');
//console.log('encrypted', msg, '\n');
//
//console.log('Decrypt with Public (called private)');
//msg = crt.publicDecrypt(msg, 'base64', 'utf8');
//console.log('decrypted', msg, '\n');

function encode(str){
    return crt.encrypt(str,'utf8','base64');
}
function decode(str){
    return key.decrypt(str,'base64','utf8');
}

module.exports={
    encode:encode,
    decode:decode
};