//Include the serial port library
const Serialport = require("serialport");
var events = require('events');
var hd = require("./AirShower_constants");
var DB = require("./database.js");
const { emit } = require("process");
// //Define the serial communication between the program and barcode scanners,
// //and the hardware (Arduino)
//Serial port for accessig the hardware.
// var ArduinoPort// = new Serialport('com15', { baudRate: 9600 });
// var OutPort// = new Serialport('COM17', { baudRate: 9600 });
// //Barcode scanner fixed outside th hall.
// var InPort// = new Serialport('com13', { baudRate: 9600 });

// /**********************************************************/
//const Readline = require("@serialport/parser-readline");
/**********************************************************/

/*AirShower: This */
var AirShower = new events.EventEmitter();

//DB.insertEpmStatusInDB()
/**********************************************************/
var HD_Rsp_Timeout;
/*IsBusy :This flag is set when the air shower is waiting for the employee to enter 
  or exit.it will be reset when entring or exiting is complete.*/
AirShower.IsBusy = true;//At startup,stay busy until getmode  request received from HD.
AirShower.mode = hd.HD_RQ.NormalMode;//'Normal'
//AirShower.mode = hd.HD_RQ.PernamentOpen;
/**********************************************************/

var ActualEmployee = 0000;//This is the actual employee asking for exit or get in.
/**********************************************************/
//map for workers to determine who inside and outside
EmployeesMap = new Map();

//EmployeesMap.set(0,new hd.EmployeeStatus())

const yy = new Date().getFullYear();
const mm = new Date().getMonth() + 1;
const dd = new Date().getDate();
const NOW = yy + '-' + mm + '-' + dd;
const ArduinoPort = new Serialport('com15', { baudRate: 9600 });
console.log(NOW);
DB.getDataFromDB(NOW);
    console.log("Waiting for data to b ready.....");
DB.DB_Events.on("MapReady",StartMachine);
function StartMachine(map){
    console.log("Data is restored...!!!");

    const OutPort = new Serialport('COM17', { baudRate: 9600 });
    //Barcode scanner fixed outside th hall.
    const InPort = new Serialport('com13', { baudRate: 9600 });
    Object.assign(EmployeesMap,map);
    console.log(EmployeesMap.size)    
    EmployeesMap =map;
    //DB.myMap;
    console.log(EmployeesMap.size)
    console.log(map.size)
    console.log(DB.myMap.size)   
    console.log(DB.myMap.get(2119).Times)     
    // //Outport scanner detects a barcode
    OutPort.on('data', function (data) {
      //Idle mode ,can't register
      if(AirShower.mode!=hd.HD_RQ.PernamentOpen)
      {
        let barcode = Number(data);
        //Check whether this is a new barcode or it is regestered before.  
        if (!EmployeesMap.has(barcode)) {
          if (barcode != 2082)//Command barcode, not un employee barcode
          {
            EmployeesMap.set(barcode, new hd.EmployeeStatus(barcode));//Register a new barcode      
            //DB.insertEpmStatusInDB(EmployeesMap.get(barcode));
          }
    
        }
        AirShower.emit('Out_req', barcode);    
      }
    
    });
    /**********************************************************/
    //Inport scanner detects a barcode
    InPort.on('data', function (data) {
        //console.log(EmployeesMap.size)
        //Idle mode ,can't register
        if(AirShower.mode!=hd.HD_RQ.PernamentOpen){
          let barcode = Number(data);
          //Check whether this is a new barcode or it is regestered before.  
          if (!EmployeesMap.has(barcode)) {
            if (barcode != 2082)//Command barcode, not un employee barcode
            {
              EmployeesMap.set(barcode, new hd.EmployeeStatus(barcode));//Register a new barcode
              //DB.insertEpmStatusInDB(EmployeesMap.get(barcode));        
            }
    
          }
          AirShower.emit('In_req', barcode);      
        }
    
    });
    /**********************************************************/
    //Response from hardware.
    ArduinoPort.on('data', function (data) {
    
      //console.log('Data:', data.length,"   ",data[0],"  ",(hd.HD_RS.ExitCompleted),"  ",Number(data)); 
      //console.log('Data:', data.length);    
      switch (String.fromCharCode(data[0])) {
        case (hd.HD_RS.ExitCompleted):
          AirShower.IsBusy = false;
          console.log('HD:', ActualEmployee, '  Exit Completed.');
          break;
        case (hd.HD_RS.ExitFail):
          console.log('HD:', ActualEmployee, '  Exit Fail.');
          break;
        case (hd.HD_RS.EntringCompleted):
          AirShower.IsBusy = false;
          console.log('HD:', ActualEmployee, '  Entring Completed.', '  ', (EmployeesMap.get(ActualEmployee)).TolatTimeSpentOut);
          break;
        case (hd.HD_RS.EntringFail):
          console.log('HD:', ActualEmployee, '  Entring Fail.');
          break;
        case hd.HD_RS.OutDoorLocked:
          console.log('HD:OutDoor is locked');
          break;
        case hd.HD_RS.OutDoorUnLocked:
          clearTimeout(HD_Rsp_Timeout);
          console.log('HD:OutDoor is unlocked');
          break;
        case hd.HD_RQ.NormalMode:
          clearTimeout(HD_Rsp_Timeout);
          console.log('HD:The Airshower enters the active mode');
          break;
        case hd.HD_RQ.PernamentOpen:
          clearTimeout(HD_Rsp_Timeout);
          console.log('HD:The Airshower enters the permanent mode');
          break;
        case hd.HD_RS.GetMode:
          HD_Send(AirShower.mode);
          AirShower.IsBusy = false;
          break;
        case hd.HD_RS.Alive:
          console.log('alive');
          break;
        default:
          console.log('HD::', String.fromCharCode(data[0]));
      }
    });    

}

/**********************************************************/

function HD_Send(ValueToSend) {
    //console.log(EmployeesMap.size)
  function Func() {
    ArduinoPort.write(ValueToSend);
    HD_Rsp_Timeout = setTimeout(Func, 1000);//Continue sending until response comes from the arduino
  }
  Func();
}
//Sign all employees out
// this function is called when switching to idel mode.
// In this mode no scanned barcode will be registered.
function OutsideAll()
{
  var x=0;
EmployeesMap.forEach((value,key)=>
{

  console.log('Out_req:', key, '. Accepted request');
  ActualEmployee = key;
  value.SetTimeStamp_out();
  value.IsOutside = true;
  DB.insertEpmStatusInDB(value);
  console.log(++x);
});
}
function Switch_Active() {
  if (AirShower.mode == hd.HD_RQ.NormalMode) {
    console.log('Already in active mode');
  }
  else {
    AirShower.mode = hd.HD_RQ.NormalMode;
    console.log('Switching to active mode.');
    HD_Send(hd.HD_RQ.NormalMode);
  }
}
function Switch_Idle() {
  if (AirShower.mode == hd.HD_RQ.PernamentOpen) {
    console.log('Already in idle mode');
  }
  else {
    AirShower.IsBusy = false;
    AirShower.mode = hd.HD_RQ.PernamentOpen;
    console.log('Switching to idle mode.');
    HD_Send(hd.HD_RQ.PernamentOpen);
    OutsideAll();
  }
}
/**********************************************************/
//some body's asking for going out of the hall usig his own barcode
AirShower.on('Out_req', function (barcode) {
  switch (barcode) {
    case 2082://Exit active mode Command barcode And enter the idle mode.
      //Switch_Idle();
      break;
    default:
      if (AirShower.mode == hd.HD_RQ.NormalMode) {
        if (!AirShower.IsBusy) {
          AirShower.IsBusy = true;
          console.log('Out_req:', barcode, '. Accepted request');
          ActualEmployee = barcode;
          (EmployeesMap.get(ActualEmployee)).SetTimeStamp_out();
          HD_Send(hd.HD_RQ.OpenForExit);
          (EmployeesMap.get(ActualEmployee)).IsOutside = true;
          DB.insertEpmStatusInDB(EmployeesMap.get(ActualEmployee));
        }
        else {
          console.log('Out_req:', barcode, ' Refused. AirShower\'s busy.');
        }
      }
      else {
        console.log('Out_req: idle mode.');
      }
  }
}
);
/**********************************************************/
//some body's asking for getting inside the hall usig his own barcode
AirShower.on('In_req', function (barcode) {
  switch (barcode) {
    case 2082://Exit idle mode Command barcode,And enter the active mode.
      Switch_Active();
      break;
    default:
      if (AirShower.mode == hd.HD_RQ.NormalMode) {
        if (!AirShower.IsBusy) {
          AirShower.IsBusy = true;
          console.log('In_req:', barcode, '. Accepted request');
          ActualEmployee = barcode;
          HD_Send(hd.HD_RQ.OpenForEnter);
          (EmployeesMap.get(ActualEmployee)).IsOutside = false;
          (EmployeesMap.get(ActualEmployee)).UpdateTotalTime();
          DB.insertEpmStatusInDB(EmployeesMap.get(barcode));
          //HD_Rsp_Timeout=setTimeout(Resend,300,hd.HD_RQ.OpenForEnter);
        }
        else {
          console.log('In_req:', barcode, ' Refused. AirShower\'s busy.');
        }
      }
      else {
        console.log('In_req: idle mode.');
      }
  }
}
);

/******************************/ 
var express = require('express');
var fs = require('fs');
var app = express();
var cookieParser = require('cookie-parser');
var crypto = require('crypto');

app.use(cookieParser());
app.get('/', function (req, res) {
    res.sendFile('C:\\hellotestC2\\Cookies\\index.html');
});
// app.get("/GetIn/:userId", (req, res) => {
//     // Access userId via: req.params.userId
//     // Access bookId via: req.params.bookId
//     res.send(req.params);
//   });
// app.get("/GetOut/:userId", (req, res) => {
//     // Access userId via: req.params.userId
//     // Access bookId via: req.params.bookId
//     res.send(req.params);
//   });  
app.get('/Idle', function (req, res) {
    {
        res.send((hd.SrverResponces.ACK_Idle).toString());
        Switch_Idle();
        console.log("switched to Idle mode")
    }
});
app.get('/active', function (req, res) {
    {
        res.send((hd.SrverResponces.ACK_active).toString());
        Switch_Active();
    }
});
app.post("/GetReport", function (req, res) {
    var barcode = req.query.barcode;
    console.log(Number(barcode));

    var obj = EmployeesMap.get(Number(barcode));
    var txt = [];
    txt.push(obj.out_stamps.length.toString());
    txt.push(obj.in_stamps.length.toString());
    //res.send(value.barcode.toString());
    if (obj.out_stamps.length)
        for (var i = 0; i < obj.out_stamps.length; i++)
        {
            txt.push(obj.out_stamps[i].toString());
            console.log(i+" :"+obj.out_stamps[i].toString())          
        }
        console.log("***************************");

    if (obj.in_stamps.length)
        for (var i = 0; i < obj.in_stamps.length; i++)
        {
            txt.push(obj.in_stamps[i].toString());   
            console.log(i+" :"+obj.in_stamps[i].toString())                   
        }

    res.send(txt.toString());
});
app.post("/GetData", function (req, res) {
    var obj = [];
    EmployeesMap.forEach(function (value, key) {
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
    if (AirShower.mode == hd.HD_RQ.PernamentOpen)
        res.send((hd.SrverResponces.ACK_Idle).toString());
    else
        res.send((hd.SrverResponces.ACK_active).toString());
});

app.listen(3000, (err) => {
    if (err) throw err;
    console.log('server running on port 3000');
});



/************************** */

module.exports= {EmployeesMap,AirShower,Switch_Idle,OutsideAll,Switch_Active};