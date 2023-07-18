////////////////////***********///////////////////////
//insert Employee Status Object into database in table "employee-status"//
//////////////////////////////////////////////////////////////////////////
var events = require('events');
var mysql = require("mysql");
var ul = require("./AirShower_constants.js");
var DB_Events = new events.EventEmitter();
//creating a connection to the database.
var myMap = new Map();
var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  database: "s",
  //password: "123456"
});
con.connect(function (err) {
  if (err) throw err;
});
//Update existed record
function UpdateRecord(x)
{
  const out_stamps_x = x.out_stamps.toString();
  const in_stamps_x = x.in_stamps.toString();
  con.query("call UpdateRecord(?,?,?,?,?,?,?,?)", [x.TimeStamp_Out,x.TimeStamp_In,x.TolatTimeSpentOut,x.IsOutside, x.Times,out_stamps_x, in_stamps_x,x.barcode], function (err, result) {
    if (err) {
        console.log("err:", err);
    } else {
     //   console.log("results:", result[0][0].barcode);
    }

  });
  DB_Events.emit("NewRecorded");
  
}
function DeleteOld()
{
  con.query("call DeleteOld()", [], function (err, result) {
    if (err) {
        console.log("err:", err);
    } else {
     //   console.log("results:", result[0][0].barcode);
    }

  });
  DB_Events.emit("NewRecorded");
  
}
//insert not existed record
function InsertRecord(x)
{
  const out_stamps_x = x.out_stamps.toString();
  const in_stamps_x = x.in_stamps.toString();
  con.query("call InsertRecord(?,?,?,?,?,?,?,?)", [x.TimeStamp_Out,x. TimeStamp_In,x. TolatTimeSpentOut,x. IsOutside, x.Times,out_stamps_x, in_stamps_x,x. barcode], function (err, result) {
    if (err) {
        console.log("err:", err);
    } else {
     //   console.log("results:", result[0][0].barcode);
    }

  });
  DB_Events.emit("NewRecorded");  
}
function insertEpmStatusInDB(myEmployee) {
  var temp_employee = new ul.EmployeeStatus();
  temp_employee = myEmployee;

  barcodeX = temp_employee.barcode;
  IsOutsideX = temp_employee.IsOutside;
  TimeStamp_OutX = temp_employee.TimeStamp_Out;
  TimeStamp_InX = temp_employee.TimeStamp_In;
  TimesX = temp_employee.Times;
  TolatTimeSpentOutX = temp_employee.TolatTimeSpentOut;
  const out_stamps_x = temp_employee.out_stamps.toString();
  const in_stamps_x = temp_employee.in_stamps.toString();

  const insert_queryx = 'INSERT INTO `employee-status`\
     (`barcode`, `Timestamp_Out`, `Timestamp_In`, \
     `Total_Time_Spent_Out`, `Is_Outside`, `Times`,\
     `out_stamps`,`in_stamps`, `date`) \
     VALUES (?,?,?,?,?,?,?,?,current_timestamp())';

  const check_queryx = "SELECT * FROM `employee-status` WHERE barcode= (?) AND date =CURDATE() "

  {
    //console.log("Connected!");
    con.query(check_queryx, [barcodeX], function (err, result, fields) {
      if (err) throw err;
      let resultx = Object.values(JSON.parse(JSON.stringify(result)));
      resultx.forEach((v, k) => {// console.log(v); 
      });

      if (resultx.length >= 1) {
        const update_queryx = "UPDATE `employee-status` SET Timestamp_Out= (?),Timestamp_In= (?),\
   Total_Time_Spent_Out= (?),Is_Outside= (?),Times= (?), out_stamps= (?),in_stamps= (?) \
    WHERE  barcode= (?) AND date =CURDATE()"
        con.query(update_queryx,
          [TimeStamp_OutX, TimeStamp_InX, TolatTimeSpentOutX, IsOutsideX, TimesX, out_stamps_x, in_stamps_x, barcodeX]
          , function (err, result, fields) {
            if (err) throw err;
          })
      }
      else {
        con.query(insert_queryx,
          [barcodeX, TimeStamp_OutX,
            TimeStamp_InX, TolatTimeSpentOutX,
            IsOutsideX, TimesX, out_stamps_x, in_stamps_x]
          , function (err, result, fields) {
            if (err) throw err;
          });
      }
    });
  }
}
//////////////////*** RETRIEVE DATA FROM DATABASE ***\\\\\\\\\\\\\\\\\\
// function to retriver data from database in definite date..parissing it ..add it into object ..and store it in MAP..
function getDataFromDB(date) {
  {
    con.query("SELECT * FROM `employee-status`WHERE date=(?)  ", [date], function (err, result, fields) {
      if (err) throw err;
      for (let e in result) {
        var x = new ul.EmployeeStatus(0);
        var resultX = JSON.stringify(result[e]);
        var resultXObj = JSON.parse(resultX);
        x.barcode = resultXObj.barcode;
        x.TimeStamp_Out = resultXObj.Timestamp_Out
        x.TimeStamp_In = resultXObj.Timestamp_In
        x.TolatTimeSpentOut = resultXObj.Total_Time_Spent_Out
        x.IsOutside = resultXObj.Is_Outside
        x.Times = resultXObj.Times
        x.out_stamps = resultXObj.out_stamps.split(",").map(Number); // convert to array  
        x.in_stamps = resultXObj.in_stamps.split(",").map(Number);

        myMap.set(x.barcode, x);
      }
      DB_Events.emit("MapReady", myMap);
    }
    );
  }
}
// var barcode = 1057;
// con.query("call BarcodeCheck(?)", [barcode], function (err, result) {
//   if (err) {
//       console.log("err:", err);
//   } else {
//       console.log("results:", result[0][0].barcode);
//   }

// });
// function insertEpmStatusInDB(){};
// function getDataFromDB(){};
// function UpdateRecord(){};
// function InsertRecord(){};
// var DB_Events;
// var myMap=new Map();;
module.exports = { insertEpmStatusInDB, getDataFromDB,UpdateRecord,InsertRecord, DB_Events, myMap,DeleteOld };
    //////////////////////////////////// * * * ////////////////////////////////////////