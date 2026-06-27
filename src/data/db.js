import Dexie from "dexie";

export const db = new Dexie("TextileTrackerDB");

db.version(5).stores({
  entries:
    "++id,date,month,week,challanNo,workerName,sheetNo,rollNo,jobType,pcs,rate,amount",

  fabEntries:
    "++id,date,month,week,grinNo,sheetNo,rollNo,party,invoice,category,quality,meter,rate,value,returnMeter,pcsCut,average",

  workers: "++id,name",

  jobs: "++id,name"
});

// Version 6
db.version(6).stores({
  entries:
    "++id,date,month,week,challanNo,workerName,sheetNo,rollNo,jobType,pcs,rate,amount",

  fabEntries:
    "++id,date,month,week,grinNo,sheetNo,rollNo,party,invoice,category,quality,meter,rate,value,returnMeter,pcsCut,average",

  workers: "++id,name",

  jobs: "++id,name",

  workerPayments:
    "++id,[workerName+week],workerName,week"
});

db.version(10).stores({
  entries:
    "++id,date,month,week,challanNo,workerName,sheetNo,rollNo,jobType,pcs,rate,amount",

  fabEntries:
    "++id,date,month,week,grinNo,sheetNo,rollNo,party,invoice,category,quality,meter,rate,value,returnMeter,pcsCut,average",

  workers: "++id,name",

  jobs: "++id,name",

  workerPayments:
  "++id,[workerName+week],workerName,week,balance",

cashEntries:
"++id,voucherNo,date,month,week,type,category,name,bankName,amount,narration,chequeNo,balance,source,referenceId",

 cashCategories:
"++id,name",

cashBanks:
"++id,name",
});

db.version(11).stores({
  entries:
    "++id,date,month,week,challanNo,workerName,sheetNo,rollNo,jobType,pcs,rate,amount",

  fabEntries:
    "++id,date,month,week,grinNo,sheetNo,rollNo,party,invoice,category,quality,meter,rate,value,returnMeter,pcsCut,average",

  workers: "++id,name",

  jobs: "++id,name",

  workerPayments:
    "++id,[workerName+week],workerName,week,balance,month",

  cashEntries:
    "++id,voucherNo,date,month,week,type,category,name,bankName,amount,narration,chequeNo,balance,source,referenceId",

  cashCategories: "++id,name",

  cashBanks: "++id,name",

  fabricReturns:
    "++id,voucherNo,date,month,party,category,quality,debitNo,rollNo",

  cuttingVouchers:
    "++id,date,month,week,rollNo,grinNo,category,party,pattern,sheetNo",
});
db.version(12).stores({
  entries:
    "++id,date,month,week,challanNo,workerName,sheetNo,rollNo,jobType,pcs,rate,amount",

  fabEntries:
    "++id,date,month,week,grinNo,sheetNo,rollNo,party,invoice,category,quality,meter,rate,value,average",

  workers: "++id,name",

  jobs: "++id,name",

  workerPayments:
    "++id,[workerName+week],workerName,week,balance,month",

  cashEntries:
    "++id,voucherNo,date,month,week,type,category,name,bankName,amount,narration,chequeNo,balance,source,referenceId",

  cashCategories:
    "++id,name",

  cashBanks:
    "++id,name",

  fabricReturns:
    "++id,voucherNo,date,month,party,category,quality,debitNo,rollNo",

 cuttingVouchers:
"++id,date,month,week,rollNo,grinNo,category,party,pattern,articleNo,sheetNo",
});
db.version(13).stores({
  entries:
    "++id,date,month,week,challanNo,workerName,sheetNo,rollNo,articleNo,pattern,jobType,pcs,rate,amount",

  fabEntries:
    "++id,date,month,week,grinNo,sheetNo,rollNo,party,invoice,category,quality,meter,rate,value,average",

  workers: "++id,name",

  jobs: "++id,name",

  workerPayments:
    "++id,[workerName+week],workerName,week,balance,month",

  cashEntries:
    "++id,voucherNo,date,month,week,type,category,name,bankName,amount,narration,chequeNo,balance,source,referenceId",

  cashCategories:
    "++id,name",

  cashBanks:
    "++id,name",

  fabricReturns:
    "++id,voucherNo,date,month,party,category,quality,debitNo,rollNo",

  cuttingVouchers:
    "++id,date,month,week,rollNo,grinNo,category,party,pattern,articleNo,sheetNo",
});