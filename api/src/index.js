// const { app } = require('@azure/functions');

// app.setup({
//     enableHttpStream: true,
// });


const fetch = require('node-fetch');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    // Add CORS headers
    context.res = {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Origin": "https://happy-bay-03dd73d00.6.azurestaticapps.net",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization"
        }
    };

    // Handle OPTIONS request for CORS preflight
    if (req.method === "OPTIONS") {
        context.res.status = 204;
        return;
    }
    
    try {
        const parsedUrl = new URL(req.url);
        const url = new URL(`https://roombookingsystem-etc7bfeeg8hndfbc.eastasia-01.azurewebsites.net/${parsedUrl.pathname}${parsedUrl.search}`);

        const options = {
            method: req.method,
            headers: req.headers
        };

        options.headers.host = url.host;

        if (req.method !== 'GET') {
            options.body = req.bufferBody;
        } else if (req.bufferBody) {
            context.res = {
                status: 400,
                body: 'GET requests cannot have a body',
            };
            return;
        }

        const fetchResp = await fetch(url, options);
        const responseMessage = await fetchResp.text();

        context.res = {
            status: fetchResp.status,
            body: responseMessage,
        };
    } catch (err) {
        context.res = {
            status: 500,
            body: err.message,
        };
    }
};