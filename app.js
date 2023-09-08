const express = require('express');
require('dotenv').config();

const { v4: uuidv4 } = require('uuid');

const axios = require('axios');
const sign = require('jsonwebtoken').sign


const {SocketIOClient, io } = require("socket.io-client");
const fs = require('fs');

const jsonFile = fs.readFileSync('./geolocation_staffs.json', 'utf8');
const tempStaff = JSON.parse(jsonFile);
// const staffJson = tempStaff.slice(0,2500);
const staffJson = tempStaff;

const app = express();
const port = 3333;

const tempSocketList = {};

let intervalCd = 0;

const initWebSocket = async () => {
    console.log('initWebSocket');

    staffJson.forEach((item,index)=>{

        const ioSocket = io(
            // `${SOCKET_ADDRESS}`,
            'https://socket.orange-play.co.kr',
            // 'http://172.30.1.38:4000',
            {
                transports: ['websocket'],
                query: {
                    usrCd:item._id['$oid'],
                    type:'staff',
                    festivalIdx:8
                },

            }
        )
        ioSocket.on("connect", () => {
            // console.log(ioSocket.id,index);
        });

        ioSocket.on("workingStatus", (obj) => {
            // console.log(obj,'workingStatus');
            tempSocketList[item._id['$oid']]['workingHistoryCd']=obj.data.workingHistoryCd
        });

        ioSocket.on('disconnect',(reason)=>{
            console.log(reason);
        });

        tempSocketList[item._id['$oid']]={socket:ioSocket};

    })


}

const getRandomCoords =  () => {
    const numCoordinates = 1;
    const centerLat = 37.526362213;
    const centerLng = 127.028476085;
    const radius = 3; // in kilometers

    const coordinates = [];

    for (let i = 0; i < numCoordinates; i++) {
        // Convert radius from kilometers to degrees
        const radiusInDegrees = radius / 111.32;

        const u = Math.random();
        const v = Math.random();
        const w = radiusInDegrees * Math.sqrt(u);
        const t = 2 * Math.PI * v;
        const x = w * Math.cos(t);
        const y = w * Math.sin(t);

        // Adjust the x-coordinate for the desired center of the circle
        const newLng = x / Math.cos(centerLat);

        const foundLng = centerLng + newLng;
        const foundLat = centerLat + y;

        coordinates.push({ lat: foundLat, lng: foundLng });
    }

    return coordinates;
}


app.get('/socketOn',async (req,res)=>{


    console.log('socket');
    // const socketClient = io("http://172.30.1.38:4000");
    await initWebSocket();
    console.log(tempSocketList,'tempSocketListtempSocketList');
    res.send(`socket socket`);
})

app.get('/trackingOn',async (req,res)=>{

    staffJson.forEach((item)=>{
        // console.log();
        tempSocketList[item._id['$oid']].socket.emit('tracking-on',{
            usrCd: item._id['$oid'],
            status: 1,
            timestamp: new Date().getTime(),
            festivalIdx: 8,
        });
    })
    res.send(`socket socket`);
})

app.get('/trackingOff',async (req,res)=>{

    staffJson.forEach((item)=>{
        // console.log();
        tempSocketList[item._id['$oid']].socket.emit('tracking-off',{
            usrCd: item._id['$oid'],
            status: 0,
            timestamp: new Date().getTime(),
            festivalIdx: 8,
            workingHistoryCd:tempSocketList[item._id['$oid']].workingHistoryCd
        });
    })
    res.send(`socket socket`);
})

app.get('/tracking',async (req,res)=>{

    intervalCd = setInterval(()=>{
        staffJson.forEach((item)=>{
            const rdCoords = getRandomCoords();
            tempSocketList[item._id['$oid']].socket.emit('tracking',{
                coords:{
                    latitude:rdCoords[0].lat,
                    longitude:rdCoords[0].lng
                },
                usrCd: item._id['$oid'],
                timestamp: new Date().getTime(),
                festivalIdx: 8,
                workingHistoryCd:tempSocketList[item._id['$oid']].workingHistoryCd
            });
        })
    },10000);

    res.send(`socket socket`);
})

app.get('/trackingStop',async (req,res)=>{

    clearInterval(intervalCd);

    res.send(`socket socket`);
})

app.get('/socketOff',async (req,res)=>{

    console.log(tempSocketList,'tempSocketListtempSocketList');
    staffJson.forEach((item)=>{
        // console.log();
        tempSocketList[item._id['$oid']].socket.close();
    })
    res.send(`socket socket`);
})

app.listen(port,()=>{
   console.log(`Server Start https://localhost:${port}`);
});
