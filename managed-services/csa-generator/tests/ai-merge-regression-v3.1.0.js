/* Node regression test for CSA AI merge safeguards. */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const elements = {};
function element(id) {
  if (!elements[id]) elements[id] = {
    id, value:'', checked:id === 'useAiAssist', disabled:false, hidden:false, style:{}, className:'', textContent:'', innerHTML:'', files:[], open:false,
    classList:{toggle(){},add(){},remove(){},contains(){return false}}, addEventListener(){}, scrollIntoView(){}, appendChild(){}, querySelectorAll(){return[]}
  };
  return elements[id];
}
global.document = {getElementById:element, body:{classList:{toggle(){},contains(){return false}},appendChild(){}}, createElement:t=>element('created_'+t)};
global.window = {document, parent:null, addEventListener(){}, setInterval(){}, setTimeout, clearTimeout, URL:{createObjectURL(){return'blob:'},revokeObjectURL(){}}, CSADocx:{loadTemplateBytes:async()=>new Uint8Array([1]),generateDocxBlob:async()=>new Blob(['x'])}};
window.parent = window;
global.URL = window.URL;
global.Blob = Blob;

require(path.join(__dirname, '..', 'parser.js'));
global.CSAParser = window.CSAParser;
require(path.join(__dirname, '..', 'app.js'));

const source = `Tickets
#113491
Customer Company Name
GABC_PENSHOPPE
Customer Location Address
G/F SM BUTUAN LAPU-LAPU POB. (BRGY. 8), BUTUAN CITY AGUSAN DEL NORTE
Ticket Category*
Request
Issue Category*
Hardware
Issue Description
Hardware Provisioning
Serial Number
-
Schedule: November 03, 2026 (Tuesday)
Time: 09:00 AM
Reply All
#113491
Hi AMTI Team,
Please do the following for Penshoppe SM Butuan
Ram Upgrade and Preventive Maintenance
Fix Octopos Wiring / Cable Management
Clean/Wipe Down the Computer Peripherals (Monitor, Customer Display, POS Printer and etc.
Check the condition of the peripherals
Replaced damaged cables (Lan Cable)
Store Name: Penshoppe SM Butuan
Serial #: 4CE9361N10
Address: Stall # :G/F SM BUTUAN LAPU-LAPU POB. (BRGY. 8), BUTUAN CITY AGUSAN DEL NORTE
Kindly bring the following tools for this activity.
USB Flash Drive
Crimper
RJ45
Cable Tie`;

const brokenDraft = {
  ticket_number:'113491', company_name:'PENSHOPPE', store_name:'', contact_name:'', mobile_number:'',
  visit_schedule:'November 3, 2026', created_date:'November 4, 2026', location_address:'Penshoppe SM Butuan', location_source:'ticket',
  ticket_category:'Request', issue_category:'Hardware', issue_description:'Hardware Provisioning', serial_number:'',
  engineer_tasks:['Hi AMTI Team, Please do the following for Penshoppe SM Butuan Ram Upgrade and Preventive Maintenance Fix Octopos Wiring / Cable Management Clean/Wipe Down the Computer Peripherals ...']
};
const ai = {
  ticket_number:'113491', company_name:'Penshoppe SM Butuan', contact_name:'', mobile_number:'', visit_schedule:'November 3, 2026 9:00 AM',
  location_address:'G/F SM BUTUAN LAPU-LAPU POB. (BRGY. 8), BUTUAN CITY AGUSAN DEL NORTE', ticket_category:'Request', issue_category:'Hardware', issue_description:'Hardware Provisioning', serial_number:'4CE9361N10',
  engineer_tasks:['Ram Upgrade and Preventive Maintenance','Fix Octopos Wiring / Cable Management','USB Flash Drive','Crimper','Clean/Wipe Down the Computer Peripherals (Monitor, Customer Display, POS Printer and etc.','Check the condition of the peripherals','Replaced damaged cables (Lan Cable)'],
  evidence:{company_name:'Store Name: Penshoppe SM Butuan',visit_schedule:'Schedule: November 03, 2026 (Tuesday) Time: 09:00 AM',location_address:'Address: Stall # :G/F SM BUTUAN LAPU-LAPU POB. (BRGY. 8), BUTUAN CITY AGUSAN DEL NORTE',serial_number:'Serial #: 4CE9361N10',engineer_tasks:'Ram Upgrade and Preventive Maintenance Fix Octopos Wiring / Cable Management Clean/Wipe Down the Computer Peripherals (Monitor, Customer Display, POS Printer and etc. Check the condition of the peripherals Replaced damaged cables (Lan Cable)'}
};
const result = window.CSAAppTest.mergeAi(source, brokenDraft, ai);
assert.equal(result.company_name, 'Penshoppe SM Butuan');
assert.equal(result.visit_schedule, 'November 3, 2026 9:00 AM');
assert.equal(result.serial_number, '4CE9361N10');
assert.equal(result.location_address, 'G/F SM BUTUAN LAPU-LAPU POB. (BRGY. 8), BUTUAN CITY AGUSAN DEL NORTE');
assert.deepEqual(result.engineer_tasks, [
  'Ram Upgrade and Preventive Maintenance',
  'Fix Octopos Wiring / Cable Management',
  'Clean/Wipe Down the Computer Peripherals (Monitor, Customer Display, POS Printer and etc.',
  'Check the condition of the peripherals',
  'Replaced damaged cables (Lan Cable)'
]);
console.log('CSA AI merge regression v3.1.0: PASS');
