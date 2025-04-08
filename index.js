const express = require('express');
const installRouter = require('./routes/install');
const { router: tokenRouter } = require('./routes/token');
const apiRouter = require('./routes/api');
const config = require('./config');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// route
app.use('/install', installRouter);
app.use('/token', tokenRouter);
app.use('/api', apiRouter);

//  xac thuc oauth
app.get('/', async (req, res) => {
    const { code } = req.query;
    if (code) {
        try {
            const axios = require('axios');
            const response = await axios.get(`https://${config.bitrixDomain}/oauth/token/`, {
                params: {
                    client_id: config.clientId,
                    client_secret: config.clientSecret,
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: config.redirectUri
                }
            });

            const tokens = {
                access_token: response.data.access_token,
                expires: Math.floor(Date.now() / 1000) + response.data.expires_in,
                refresh_token: response.data.refresh_token,
                domain: response.data.domain,
                member_id: response.data.member_id
            };

            // save token
            const fs = require('fs');
            fs.writeFileSync('tokens.json', JSON.stringify(tokens, null, 2));
            res.send('Xác thực thành công');
        } catch (error) {
            res.status(error.response?.status || 500).send(`error: ${error.message}`);
        }
    } else {
        const authUrl = `https://${config.bitrixDomain}/oauth/authorize/?client_id=${config.clientId}&response_type=code&redirect_uri=${encodeURIComponent(config.redirectUri)}`;
        res.redirect(authUrl);
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`${port}`));