const express = require('express');
require('dotenv').config();

const { v4: uuidv4 } = require('uuid');

const axios = require('axios');
const sign = require('jsonwebtoken').sign

const access_key = process.env.UPBIT_OPEN_API_ACCESS_KEY
const secret_key = process.env.UPBIT_OPEN_API_SECRET_KEY
const server_url = process.env.UPBIT_OPEN_API_SERVER_URL




const app = express();
const port = 3000;

app.get('/',(req,res)=>{

    console.log(access_key,'access_key');
    console.log(secret_key,'secret_key');
    const payload = {
        access_key: access_key,
        nonce: uuidv4(),
        query_hash_alg: "HS256"
    }

    const token = sign(payload, secret_key)

    const options = {
        method: "GET",
        url: "https://api.upbit.com/v1/accounts",
        // url: server_url + "/v1/accounts",
        headers: {accept: 'application/json',Authorization: `Bearer ${token}`},
        // headers: {accept: 'application/json'}
    }

    axios
        .request(options)
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            // console.error(error);
            console.log(error.response);
        });

    res.send(`${access_key} ${secret_key}`);
})

app.listen(port,()=>{
   console.log(`Server Start https://localhost:${port}`);
});
