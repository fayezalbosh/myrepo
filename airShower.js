//Include the serial port library
const Serialport = require("serialport");
//const Readline = require("@serialport/parser-readline");
/********************/
var events = require('events');
/*AirShower: This */
var AirShower = new events.EventEmitter();

/********************/

//Define requests and responces commands to speek with HD:

//These commnds are sent to HD
const HD_RQ = {

  OpenForExit: 'a',     //release locks for person to exit.
  OpenForEnter: 'b',     //release the locks for persons to enter .
  PernamentOpen: 'c',     //Permanently open locks.used in  Permanent Open mode. Employees are free.
  NormalMode: 'd',     //Normal mode. Used to open the door only using own barcode.

};

//These commands come from HD 
const HD_RS = {

  ExitCompleted: 'e', //OpenForExit request  succeded.
  EntringCompleted: 'f', //OpenForEnter request  succeded.
  ExitTimeOut: 'g', //Time out occured,Exit fails becaue of the peson.  
  EnteringTimeOut: 'h', //Time out occured,Entring fails becaue of the peson. 
  PernamentOpen: 'c',     //Permanently open  locks.
  PermanentClose: 'q',     //Permanently close  locks.
  OutDoorOpened: 'i',     //Some one opened the outdoor
  OutDoorClosed: 'j',     //the outdoor closes
  InDoorOpened: 'k',     //Some one opened the InDoor
  InDoorClosed: 'l',     //the InDoor closes
  OutDoorLocked: 'm',   //The OutDoor is locked
  OutDoorUnLocked: 'n',   //The OutDoor is unlocked
  ExitFail: 'o',   	//OpenForExit request  fail.
  EntringFail: 'p', 		//OpenForEnter request  fail.  
  GetMode:'s', 
};
var HD_Rsp_Timeout;
/*AirShowerBusy :This flag is set when the air shower is waiting for the employee to enter 
  or exit.it will be reset when entring or exiting is complete.*/
  AirShower.AirShowerBusy = true;//At startup,stay busy until getmode  request received from HD.
  AirShower.mode = HD_RQ.NormalMode;//'Normal'
  //AirShower.mode = HD_RQ.PernamentOpen;
/********************/
//Create object for each employee to store his parameters:hisbarcode,
// how much time he went out of the hall,
//time stamp for last time  he went out,timestamp for last time he returned,
//and total time spent out of the hall.
class EmployeeStatus {
  constructor(barcode) {
    this.barcode = barcode;   //the employee's barcode.
    //this.Counter=0; 
    this.out_stamps=[]; //store get out time stamps.
    this.in_stamps=[];  //store get in time stamps.            
    this.TimeStamp_Out = 0;   //time stamp for last time  he went out.
    this.TimeStamp_In = 0; //timestamp for last time he returned.
    this.TolatTimeSpentOut = 0;      //total time spent out of the hall.
    this.IsOutside = true;//need impelmentation.
    this.Times = 0;//count how much time he went out of the hall.
  }
  SetTimeStamp_out() {
    this.TimeStamp_Out = Date.now();
    this.Times++;
    this.out_stamps[this.out_stamps.length]=this.TimeStamp_Out ;
  }
  UpdateTotalTime() {
    this.TimeStamp_In = Date.now();
    if (this.Times != 0)
    {
      this.TolatTimeSpentOut += Math.round((this.TimeStamp_In - this.TimeStamp_Out) / 1000);
      this.TimeStamp_Out=this.TimeStamp_In;
    }

  }

}
var ActualEmployee = 0000;//This is the actual employee asking for exit or get in.
/********************/
//map for workers to determine who inside and outside
const EmployeesMap = new Map();
// EmployeesMap.set(1000, new EmployeeStatus(1000));
// EmployeesMap.set(1001, new EmployeeStatus(1001));
// EmployeesMap.set(1002, new EmployeeStatus(1002));
/********************/
//Create the server
var http = require('http');
var url = require('url');
http.createServer(function (req, res) {
  var q = url.parse(req.url, true);
  res.writeHead(200, { 'Content-Type': 'text/html' });
  let text = "lkljk";
  let obj = new EmployeeStatus();
  //res.write('<body onload="m()">                              ');  
  res.write('<head>                              ');
  res.write('<style>                             ');
  res.write('table {                             ');
  res.write('  font-family: arial, sans-serif;   ');
  res.write('  border-collapse: collapse;        ');
  res.write('  width: 100%;                      ');
  res.write('}                                   ');
  res.write('                                    ');
  res.write('td, th {                            ');
  res.write('  border: 1px solid #dddddd;        ');
  res.write('  text-align: left;                 ');
  res.write('  padding: 8px;                     ');
  res.write('}                                   ');
  res.write('                                    ');
  res.write('tr:nth-child(even) {                ');
  res.write('  background-color: #dddddd;        ');
  res.write('}                                   ');
  res.write('</style>                            ');
  res.write('</head>                             ');
  switch(AirShower.mode)
  {
    case HD_RQ.NormalMode:
      res.write('DoorStatus: '+'NormalMode'        ); 
    break;
    case HD_RQ.PernamentOpen:
      res.write('DoorStatus: '+'Idle mode'        ); 
    break;    
  }

  res.write('<br></br>'  );  //need implemnt.
  res.write('Total count outside: '   );  //need implemnt.
  res.write('<table><tr>');
  res.write('<th>Employee</th>');
  res.write('<th>Times</th>');
  res.write('<th>TotaTime (SEC)</th>');
  res.write('<th>Status</th>');  
  res.write('</tr><tr>');

  EmployeesMap.forEach(function (value, key) {
    obj = EmployeesMap.get(key);
    switch (obj.barcode)
    {
    case 1808:
      res.write('<td>' + obj.barcode +'(Task)'+ '</td>');
    break;
    case 2028:
      res.write('<td>' + obj.barcode +'(Task)'+ '</td>');
    break;
    default:
      res.write('<td>' + obj.barcode + '</td>');    
    break;
    }
    res.write('<td>' + obj.Times + '</td>');
    res.write('<td>' + obj.TolatTimeSpentOut + '</td>');
    if(obj.IsOutside)
    res.write('<td>' + 'outside' + '</td>');  
    res.write('</tr><tr>');

  });
  res.write('</tr></table>');   
  return res.end();
}).listen(8080);

// /********************/
// //Define the serial communication between the program and barcode scanners,
// //and the hardware (Arduino)
//Barcode scanner fixed inside the hall.
const OutPort = new Serialport('COM12', { baudRate: 9600 });
//Barcode scanner fixed outside th hall.
const InPort = new Serialport('com15', { baudRate: 9600 });
//Serial port for accessig the hardware.
const ArduinoPort = new Serialport('com14', { baudRate: 9600 });

// /********************/
// //Outport scanner detects a barcode
OutPort.on('data', function (data) {
  let barcode = Number(data);
  //Check whether this is a new barcode or it is regestered before.  
  if (!EmployeesMap.has(barcode)) {
    if(barcode!=2082)//Command barcode, not un employee barcode
    EmployeesMap.set(barcode, new EmployeeStatus(barcode));//Register a new barcode
  }
  AirShower.emit('Out_req', barcode);
});
/********************/
//Inport scanner detects a barcode
InPort.on('data', function (data) {
  let barcode = Number(data);
  //Check whether this is a new barcode or it is regestered before.  
  if (!EmployeesMap.has(barcode)) {
    if(barcode!=2082)//Command barcode, not un employee barcode
    EmployeesMap.set(barcode, new EmployeeStatus(barcode));//Register a new barcode
  }
  AirShower.emit('In_req', barcode);
});
/********************/
//Response from hardware.
ArduinoPort.on('data', function (data) {

  //console.log('Data:', data.length,"   ",data[0],"  ",(HD_RS.ExitCompleted),"  ",Number(data)); 
  //console.log('Data:', data.length);    
  switch (String.fromCharCode(data[0])) {
    case (HD_RS.ExitCompleted):
      clearTimeout(HD_Rsp_Timeout);
      (EmployeesMap.get(ActualEmployee)).IsOutside=true;
      AirShower.AirShowerBusy = false;
      console.log('HD:', ActualEmployee, '  Exit Completed.');
      break;
    case (HD_RS.ExitFail):
      //AirShower.AirShowerBusy=false;
      console.log('HD:', ActualEmployee, '  Exit Fail.');
      break;
    case (HD_RS.EntringCompleted):
      clearTimeout(HD_Rsp_Timeout);
      (EmployeesMap.get(ActualEmployee)).UpdateTotalTime();
      (EmployeesMap.get(ActualEmployee)).IsOutside=false;
      AirShower.AirShowerBusy = false;
      console.log('HD:', ActualEmployee, '  Entring Completed.', '  ', (EmployeesMap.get(ActualEmployee)).TolatTimeSpentOut);
      break;
    case (HD_RS.EntringFail):
      //AirShower.AirShowerBusy=false;
      console.log('HD:', ActualEmployee, '  Entring Fail.');
      break;
    case HD_RS.OutDoorLocked:
      console.log('HD:OutDoor is locked');
    break;
    case HD_RS.OutDoorUnLocked:
      console.log('HD:OutDoor is unlocked');
      break;
    case HD_RS.OutDoorClosed:
      console.log('HD:', ActualEmployee, ' The employee has closed the door');
      break;
    case HD_RS.OutDoorOpened:
      console.log('HD:', ActualEmployee, ' The employee has opened the door');
      break;
    case HD_RQ.NormalMode:
      clearTimeout(HD_Rsp_Timeout);
      console.log('HD:The Airshower enters the normal mode');
      break;
    case HD_RQ.PernamentOpen:
      clearTimeout(HD_Rsp_Timeout);
      console.log('HD:The Airshower enters the permanent mode');
      break;
    case HD_RS.GetMode:
      HD_Send(AirShower.mode);
      AirShower.AirShowerBusy=false;
    break;
    default:
      console.log('HD::', String.fromCharCode(data[0]));
  }
});
/********************/
function HD_Send(ValueToSend)
{
  ArduinoPort.write(ValueToSend); 
  //HD_Rsp_Timeout=setTimeout(HD_Send,500,ValueToSend);
         
}

/********************/
//some body's asking for going out of the hall usig his own barcode
AirShower.on('Out_req', function (barcode) {
  switch (barcode) {
    case 2082://Exit normal mode Command barcode.
      //And enter the permanent open mode.
      if (AirShower.mode == HD_RQ.PernamentOpen) {
        console.log('Already in Permanent open mode');
      }
      else {
        AirShower.AirShowerBusy = false;
        AirShower.mode = HD_RQ.PernamentOpen;
        console.log('Switching to Permanent open mode.');
        HD_Send(HD_RQ.PernamentOpen);
      }
      break;
    default:
      if (AirShower.mode == HD_RQ.NormalMode) {
        if (!AirShower.AirShowerBusy) {

          AirShower.AirShowerBusy = true;
          console.log('Out_req:', barcode, '. Accepted request');
          console.log('Waiting for ', barcode, ' to get out the hall....');
          // if((barcode==1808)||(barcode==2028))
          // ActualEmployee=2028;
          // else
          ActualEmployee = barcode;
          (EmployeesMap.get(ActualEmployee)).SetTimeStamp_out();
          HD_Send(HD_RQ.OpenForExit);
          //HD_Rsp_Timeout=setTimeout(Resend,300,HD_RQ.OpenForExit);
        }
        else {
          console.log('Out_req:', barcode, ' Refused. AirShower\'s busy.');
        }
      }
      else {
        console.log('Out_req: Permanent Open Mode.');
        console.log('Please enter 2082 barcode to switch to normal mode.');
      }
  }
}
);
/********************/
//some body's asking for getting inside the hall usig his own barcode
AirShower.on('In_req', function (barcode) {
  switch (barcode) {
    case 2082://Exit Permanent Open mode Command barcode.
      //And enter the normal mode.
      if (AirShower.mode == HD_RQ.NormalMode) {
        console.log('Already in normal mode');
      }
      else {
        //AirShower.AirShowerBusy = false;
        AirShower.mode = HD_RQ.NormalMode;
        console.log('Switching to normal mode.');
        HD_Send(HD_RQ.NormalMode);
      }
      break;
    default:
      if (AirShower.mode == HD_RQ.NormalMode) {
        if (!AirShower.AirShowerBusy) {
          AirShower.AirShowerBusy = true;
          console.log('In_req:', barcode, '. Accepted request');
          console.log('Waiting for ', barcode, ' to get in the hall....');
          // if((barcode==1808)||(barcode==2028))
          // ActualEmployee=2028;
          // else
          ActualEmployee = barcode;
          HD_Send(HD_RQ.OpenForEnter);
          //HD_Rsp_Timeout=setTimeout(Resend,300,HD_RQ.OpenForEnter);
        }
        else {
          console.log('In_req:', barcode, ' Refused. AirShower\'s busy.');
        }
      }
      else {
        console.log('In_req: Permanent Open Mode.');
        console.log('Please go out the hall and enter 2082 barcode to switch to normal mode.');
      }
  }
}
);