require('dotenv').config();
module.exports = {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    bitrixDomain: process.env.BITRIX_DOMAIN,
    redirectUri: process.env.REDIRECT_URI,
};