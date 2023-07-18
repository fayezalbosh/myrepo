//Include the serial port library
//const Serialport = require("serialport");
const Serialport = require('serialport').SerialPort;
var events = require('events');
var hd = require("c:\\Apps\\AirShower_constants.js");
var DB = require("./database.js");
const { time, timeStamp } = require('console');
// //Define the serial communication between the program and barcode scanners,
// //and the hardware (Arduino)
//Serial port for accessig the hardware.
// const ArduinoPort = new Serialport('com7', { baudRate: 9600 });
// const OutPort = new Serialport('COM13', { baudRate: 9600 });
// //Barcode scanner fixed outside th hall.
// const InPort = new Serialport('com14', { baudRate: 9600 });


const ArduinoPort = new Serialport({ path: "com13", baudRate: 9600 });

//const ArduinoPort = new Serialport("com7", { baudRate: 9600 });
const OutPort = new Serialport({ path: "com12", baudRate: 9600 });
//Barcode scanner fixed outside th hall.
const InPort = new Serialport({ path: "com11", baudRate: 9600 });
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
var EmployeesMap = new Map();


const yy = new Date().getFullYear();
const mm = new Date().getMonth() + 1;
const dd = new Date().getDate();
const NOW = yy + '-' + mm + '-' + dd;
var fs = require('fs');
fs.writeFile('AirShowerlog.txt', NOW, function (err) {
  if (err) throw err;
});
function Append(msg){
  let d = new Date();
fs.appendFile('AirShowerlog.txt',d.toLocaleTimeString()+":  "+msg, function (err) {
  if (err) throw err;
});  
}
function SendMessage(message) {
  console.log(message);
  AirShower.emit("NewMessage", message);
}
SendMessage(NOW);
Append("Getting data from DB")
DB.getDataFromDB(NOW);
EmployeesMap = DB.myMap;
setTimeout(() => {
  Append("Empting Database")  
  DB.DeleteOld();
}, 2000);
// //Outport scanner detects a barcode
OutPort.on('data', function (data) {
  //Idle mode ,can't register
  if (AirShower.mode != hd.HD_RQ.PernamentOpen) {
    let barcode = Number(data);
    if (barcode < 9999) {
      //Check whether this is a new barcode or it is regestered before.  
      if (!EmployeesMap.has(barcode)) {
        if (barcode != 2082)//Command barcode, not un employee barcode
        {
          EmployeesMap.set(barcode, new hd.EmployeeStatus(barcode));//Register a new barcode      
          DB.InsertRecord(EmployeesMap.get(barcode));
        }

      }
      AirShower.emit('Out_req', [barcode, OutPort.path]);
    }
    else SendMessage("Invalid barcode scanned:" + barcode)
  }

});
/**********************************************************/
//Inport scanner detects a barcode
InPort.on('data', function (data) {
  //Idle mode ,can't register
  if (AirShower.mode != hd.HD_RQ.PernamentOpen) {
    let barcode = Number(data);
    if (barcode < 9999) {
      //Check whether this is a new barcode or it is regestered before.  
      if (!EmployeesMap.has(barcode)) {
        if (barcode != 2082)//Command barcode, not un employee barcode
        {
          EmployeesMap.set(barcode, new hd.EmployeeStatus(barcode));//Register a new barcode
          DB.InsertRecord(EmployeesMap.get(barcode));
        }

      }
      AirShower.emit('In_req', [barcode, InPort.path]);//InPort.path()
    }
    else SendMessage("Invalid barcode scanned:" + barcode)
  }

});
/**********************************************************/
//Response from hardware.
var alivecount=0;
ArduinoPort.on('data', function (data) {

  //SendMessage('Data:', data.length,"   ",data[0],"  ",(hd.HD_RS.ExitCompleted),"  ",Number(data)); 
  //SendMessage('Data:', data.length);    
  switch (String.fromCharCode(data[0])) {
    case (hd.HD_RS.ExitCompleted):
      AirShower.IsBusy = false;
      SendMessage('HD:' + ActualEmployee + '  Exit Completed.');
      break;
    case (hd.HD_RS.ExitFail):
      SendMessage('HD:' + ActualEmployee + '  Exit Fail.');
      break;
    case (hd.HD_RS.EntringCompleted):
      AirShower.IsBusy = false;
      SendMessage('HD:' + ActualEmployee + '  Entring Completed.', '  ', (EmployeesMap.get(ActualEmployee)).TolatTimeSpentOut);
      break;
    case (hd.HD_RS.EntringFail):
      SendMessage('HD:' + ActualEmployee + '  Entring Fail.');
      break;
    case hd.HD_RS.OutDoorLocked:
      SendMessage('HD:OutDoor is locked');
      break;
    case hd.HD_RS.OutDoorUnLocked:
      clearTimeout(HD_Rsp_Timeout);
      SendMessage('HD:OutDoor is unlocked');
      break;
    case hd.HD_RQ.NormalMode:
      clearTimeout(HD_Rsp_Timeout);
      SendMessage('HD:The Airshower enters the active mode');
      break;
    case hd.HD_RQ.PernamentOpen:
      clearTimeout(HD_Rsp_Timeout);
      SendMessage('HD:The Airshower enters the permanent mode');
      break;
    case hd.HD_RS.GetMode:
      HD_Send(AirShower.mode);
      AirShower.IsBusy = false;
      break;
    case hd.HD_RS.Alive:
      alivecount++;
      if(alivecount%3==0)
      console.log('alive');
      break;
    default:
      SendMessage('HD::' + String.fromCharCode(data[0]));
  }
});
/**********************************************************/

function HD_Send(ValueToSend) {
  function Func() {
    ArduinoPort.write(ValueToSend);
    HD_Rsp_Timeout = setTimeout(Func, 1000);//Continue sending until response comes from the arduino
  }
  Func();
}
//Sign all employees out
// this function is called when switching to idel mode.
// In this mode no scanned barcode will be registered.
function OutsideAll() {
  var x = 0;
  EmployeesMap.forEach((value, key) => {

    SendMessage('Out_req:' + key + '. Accepted request');
    ActualEmployee = key;
    value.SetTimeStamp_out();
    value.IsOutside = true;
    DB.UpdateRecord(value)
    //DB.insertEpmStatusInDB(value);
    SendMessage(++x);
  });
}
function Switch_Active() {
  if (AirShower.mode == hd.HD_RQ.NormalMode) {
    SendMessage('Already in active mode');
  }
  else {
    AirShower.mode = hd.HD_RQ.NormalMode;
    SendMessage('Switching to active mode.');
    HD_Send(hd.HD_RQ.NormalMode);
  }
}
function Switch_Idle() {
  if (AirShower.mode == hd.HD_RQ.PernamentOpen) {
    SendMessage('Already in idle mode');
  }
  else {
    AirShower.IsBusy = false;
    AirShower.mode = hd.HD_RQ.PernamentOpen;
    SendMessage('Switching to idle mode.');
    HD_Send(hd.HD_RQ.PernamentOpen);
    OutsideAll();
  }
}
/**********************************************************/
//some body's asking for going out of the hall usig his own barcode
//AirShower.on('Out_req', function (barcode) {
AirShower.on('Out_req', function (arg) {
  let barcode = arg[0];
  switch (barcode) {
    case 2082://Exit active mode Command barcode And enter the idle mode.
      //Switch_Idle();
      break;
    default:
      if (AirShower.mode == hd.HD_RQ.NormalMode) {
        {

          SendMessage('Out_req:' + arg[1] + "  " + barcode + '. Accepted request');
          if (ActualEmployee != barcode) {
            ActualEmployee = barcode;
            (EmployeesMap.get(ActualEmployee)).SetTimeStamp_out();

            (EmployeesMap.get(ActualEmployee)).IsOutside = true;
            DB.UpdateRecord(EmployeesMap.get(ActualEmployee));
          }

          if (!AirShower.IsBusy) {
            AirShower.IsBusy = true;
            HD_Send(hd.HD_RQ.OpenForExit);
          }
          else {
            SendMessage('Out_req:' + barcode + ' Refused. AirShower\'s busy.');
          }
        }

      }
      else {
        SendMessage('Out_req: idle mode.');
      }
  }
}
);
/**********************************************************/
//some body's asking for getting inside the hall usig his own barcode
//AirShower.on('In_req', function (barcode) {
AirShower.on('In_req', function (arg) {
  let barcode = arg[0];
  switch (barcode) {
    case 2082://Exit idle mode Command barcode,And enter the active mode.
      //Switch_Active();
      break;
    default:
      if (AirShower.mode == hd.HD_RQ.NormalMode) {

        {

          SendMessage('In_reqqq:' + arg[1] + "  " + barcode + '. Accepted request');
          if (ActualEmployee != barcode) {
            ActualEmployee = barcode;
            (EmployeesMap.get(ActualEmployee)).IsOutside = false;
            (EmployeesMap.get(ActualEmployee)).UpdateTotalTime();
            DB.UpdateRecord(EmployeesMap.get(barcode));
          }


          if (!AirShower.IsBusy) {
            AirShower.IsBusy = true;
            HD_Send(hd.HD_RQ.OpenForEnter);
          }
        else {
          SendMessage('In_req:' + barcode + ' Refused. AirShower\'s busy.');
        }          
        }

      }
      else {
        SendMessage('In_req: idle mode.');
      }
  }
}
);
AirShower.on('In_req_dummy', function (arg) {
  let barcode = arg[0];
  switch (barcode) {
    case 2082://Exit idle mode Command barcode,And enter the active mode.
      //Switch_Active();
      break;
    default:
      SendMessage('In_req_dummy:' + barcode + '. Accepted request');
      (EmployeesMap.get(barcode)).IsOutside = false;
      (EmployeesMap.get(barcode)).UpdateTotalTime();
      DB.UpdateRecord(EmployeesMap.get(barcode));

  }
}
  // AirShower.on('In_req_dummy', function (barcode) {
  //   switch (barcode) {
  //     case 2082://Exit idle mode Command barcode,And enter the active mode.
  //       //Switch_Active();
  //       break;
  //     default:
  //       SendMessage('In_req_dummy:' + barcode + '. Accepted request');
  //       (EmployeesMap.get(barcode)).IsOutside = false;
  //       (EmployeesMap.get(barcode)).UpdateTotalTime();
  //       DB.UpdateRecord(EmployeesMap.get(barcode));

  //   }
  // }
);
//AirShower.on('Out_req_dummy', function (barcode) {
AirShower.on('Out_req_dummy', function (arg) {
  let barcode = arg[0];
  switch (barcode) {
    case 2082://Exit active mode Command barcode And enter the idle mode.
      //Switch_Idle();
      break;
    default:
      //if (AirShower.mode == hd.HD_RQ.NormalMode)
      {
        {
          SendMessage('Out_req_dummy:' + arg[1] + "  " + barcode + '. Accepted request');
          (EmployeesMap.get(barcode)).SetTimeStamp_out();
          (EmployeesMap.get(barcode)).IsOutside = true;
          DB.UpdateRecord(EmployeesMap.get(barcode));
        }

      }

  }
}
);
module.exports = { EmployeesMap, AirShower, Switch_Idle, OutsideAll, Switch_Active, SendMessage };