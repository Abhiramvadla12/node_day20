function otp(n=4){
    let otp =''
    for(i=0;i<n;i++){
        let y = Math.floor(Math.random()*10);
        otp += y;

    }
    return otp
}
module.exports = otp;