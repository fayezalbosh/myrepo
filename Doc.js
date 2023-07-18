var express = require('express');
var fs = require('fs');
var events = require('events');
var app = express();
const http = require("http");
var cookieParser = require('cookie-parser');
var crypto = require('crypto');
const { execFile } = require('child_process');
const child = execFile("C:\\xampp\\xamppControl.exe", [], (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
    console.log(stdout);
  });
//var OldServer= require('C:\\Apps\\AirShower_machine.js');
setTimeout(() => {
   var  OldServer = require('C:\\Apps\\AirShower_machine.js');
     //var OldServer = require('C:\\hellotestC2\\Cookies\\machine.js');
var hd = require("C:\\Apps\\AirShower_constants.js");
const SyncReq = new events.EventEmitter();
//import { EmployeesMap } from "'C:\\hellotestC2\\Cookies\\machine.js';
app.use(cookieParser());
app.get('/', function (req, res) {
    // res.sendFile('C:\\hellotestC2\\Cookies\\index.html');
res.sendFile('C:\\Apps\\index.html');
});

app.get('/Idle', function (req, res) {
    {
        res.send((hd.SrverResponces.ACK_Idle).toString());
        OldServer.Switch_Idle();
        console.log("switched to Idle mode")
    }
});
app.get('/active', function (req, res) {
    {
        res.send((hd.SrverResponces.ACK_active).toString());
        OldServer.Switch_Active();
    }
});
// AirShower.emit('Out_req', [barcode,OutPort.path]);
OldServer.AirShower.on('Out_req', function (arg) {
    const Send_Out_req = new Promise((resolve, reject) => {
        var data = "";
        http.get("http://192.168.1.140:3210/Out_req?id=" + arg[0]+"&port=OutRequest", (tres) => {
            tres.on("data", chunk => {
                data += chunk;
            });
            tres.on("end", () => {
                resolve(data);
            });
        })
            .on("error", err => {
                console.log("Error: " + err.message);
            });

    });   
    Send_Out_req.then((tdata) => {console.log(tdata)}); 
})
// AirShower.emit('Out_req', [barcode,OutPort.path]);
OldServer.AirShower.on('In_req', function (arg) {
    const Send_In_req = new Promise((resolve, reject) => {
        var data = "";
        //http.get("http://192.168.1.140:3210/In_req?id=" + arg, (tres) =>         
        http.get("http://192.168.1.140:3210/In_req?id=" + arg[0]+"&port=InRequest", (tres)=>
        {
            tres.on("data", chunk => {
                data += chunk;
            });
            tres.on("end", () => {
                resolve(data);
            });
        })
            .on("error", err => {
                console.log("Error: " + err.message);
            });

    });   
    Send_In_req.then((tdata) => {console.log(tdata)}); 
})
app.post("/GetReport", function (req, res) {
    var barcode = req.query.barcode;
    /***********************************  Promise  ********************************/
    const InThePast = new Promise((resolve, reject) => {
        var data = "";
        http.get("http://192.168.1.140:3210/HellowWorld?id=" + barcode, (tres) => {
            tres.on("data", chunk => {
                data += chunk;
            });
            tres.on("end", () => {
                resolve(data);
            });
        })
            .on("error", err => {
                console.log("Error: " + err.message);
            });

    });
    /****************************************************************************** */
    var txt = [];
    var obj = OldServer.EmployeesMap.get(Number(barcode));

    txt.push(obj.out_stamps.length.toString());
    console.log(obj.out_stamps.length.toString());
    txt.push(obj.in_stamps.length.toString());
    console.log(obj.in_stamps.length.toString());

    //res.send(value.barcode.toString());
    if (obj.out_stamps.length)
        for (var i = 0; i < obj.out_stamps.length; i++)
            txt.push(obj.out_stamps[i].toString());
    if (obj.in_stamps.length)
        for (var i = 0; i < obj.in_stamps.length; i++)
            txt.push(obj.in_stamps[i].toString());

    InThePast.then((tdata) => {
        txt.push(tdata);
        res.send(txt.toString());
        res.end();
    });

});
app.post("/GetData", function (req, res) {
    var obj = [];

    OldServer.EmployeesMap.forEach(function (value, key) {
        //1-make request for the full name :function getName(key)
        //2- push the full name insted of the key

        obj.push(key);
        obj.push(value.Times);
        obj.push(value.TolatTimeSpentOut);
        if (value.IsOutside)
            obj.push("Outside");
        else
            obj.push(" ");
    })
    res.send(obj.toString());
});
app.post('/login', function (req, res) {

    var username = req.query.username;
    var password = req.query.password;
    if (username == "a" && password == "a") {
        res.cookie("seerid", crypto.randomUUID(), { maxAge: 60000, httpOnly: false, path: "/" })
    }

    else {
        //Loged = false;
        console.log("ggggggggggg");
        res.clearCookie("seerid");
    }
    res.end();
})
app.get('/status', function (req, res) {
    if (OldServer.AirShower.mode == hd.HD_RQ.PernamentOpen)
        res.send((hd.SrverResponces.ACK_Idle).toString());
    else
        res.send((hd.SrverResponces.ACK_active).toString());
});
app.get('/GetIn/:barcode', function (req, res) {
    const barcode = Number(req.params.barcode)
    if (!OldServer.EmployeesMap.has((barcode))) {
        OldServer.EmployeesMap.set(barcode, new hd.EmployeeStatus(barcode));//Register a new barcode
    }
    OldServer.AirShower.emit('In_req_dummy', barcode);
});
app.get('/GetOut/:barcode', function (req, res) {
    const barcode = Number(req.params.barcode)
    if (!OldServer.EmployeesMap.has((barcode))) {
        OldServer.EmployeesMap.set(barcode, new hd.EmployeeStatus(barcode));//Register a new barcode
    }
    OldServer.AirShower.emit('Out_req_dummy', barcode);
});

app.listen(3000, (err) => {
    if (err) throw err;
    console.log('server running on port 3000');
});


const { WebSocketServer, WebSocket } = require('ws');
const EventEmitter = require('events');

const sockserver = new WebSocketServer({ port: 453 })
sockserver.on('connection', ws => {
    console.log('New client connected!')
    ws.send('connection established')
    ws.on('close', () => {
        console.log('Client has disconnected!')
    })
    ws.onerror = function () {
        console.log('websocket error')
    }

})
OldServer.AirShower.on("NewMessage", (message) => {
    sockserver.clients.forEach(client => {
        console.log(sockserver.clients.size)
        //console.log(`distributing message: ${message}`)
        client.send(`${message}`)
    });
});

OldServer.AirShower.on("NewRecorded", () => {
    sockserver.clients.forEach(client => {
        console.log(sockserver.clients.size)
        //console.log(`distributing message: ${message}`)
        client.send(`NewRecorded`)
    });
});
}, 3000);

