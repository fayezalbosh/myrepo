//These commnds are sent to HD
const HD_RQ = {

  OpenForExit: 'a',     //release locks for person to exit.
  OpenForEnter: 'b',     //release the locks for persons to enter .
  PernamentOpen: 'c',     //Permanently open locks.used in  Permanent Open mode. Employees are free.
  NormalMode: 'd',     //Normal mode. Used to open the door only using own barcode.

};
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
  GetMode: 's',
  Alive: 't'
};
const SrverResponces = {
  NACK_Idle: 0,
  ACK_Idle: 1,
  NACK_active: 2,
  ACK_active: 3,
}
//Create object for each employee to store his parameters:hisbarcode,
// how much time he went out of the hall,
//time stamp for last time  he went out,timestamp for last time he returned,
//and total time spent out of the hall.
class EmployeeStatus {
  constructor(barcode) {
    this.barcode = barcode;   //the employee's barcode.
    //this.Counter=0; 
    this.out_stamps = []; //store get out time stamps.
    this.in_stamps = [];  //store get in time stamps.            
    this.TimeStamp_Out = 0;   //time stamp for last time  he went out.
    this.TimeStamp_In = 0; //timestamp for last time he returned.
    this.TolatTimeSpentOut = 0;      //total time spent out of the hall.
    this.IsOutside = true;//need impelmentation.
    this.Times = 0;//count how much time he went out of the hall.
  }
  SetTimeStamp_out() {
    this.TimeStamp_Out = Date.now();
    this.Times++;
    this.out_stamps.push(Date.now());
  }
  UpdateTotalTime() {

    this.in_stamps.push(Date.now());
    this.TimeStamp_In = Date.now();

    if (this.Times != 0)
      this.TolatTimeSpentOut += Math.round((this.TimeStamp_In - this.TimeStamp_Out) / 1000);
      
    this.TimeStamp_Out = this.TimeStamp_In;


  }
}
module.exports = { HD_RQ, HD_RS, SrverResponces, EmployeeStatus }