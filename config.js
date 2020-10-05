module.exports = {
    mongoUrl : process.env.MONGO_URL + '/conFusion',
    secretKey: process.env.JWT_SECRET,
    expiration: 3600
    
}