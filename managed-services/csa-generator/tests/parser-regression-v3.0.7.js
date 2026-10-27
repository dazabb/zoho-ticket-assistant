global.window = global;
const fs = require('fs');
eval(fs.readFileSync(require('path').join(__dirname, '..', 'parser.js'), 'utf8'));

const cases = [
  {
    id: '110510',
    text: `Reply All\n#110510\nCustomer Company Name\nGABC_PENSHOPPE\nCustomer Location Address\nPenshoppe SM City GENSAN\nTicket Category*\nRequest\nIssue Category*\nHardware\nIssue Description\nApplication Support\nSerial Number\n4CE9361N16\nAs advised by Sir Francis, we can now proceed with the onsite support activity on October 26, 2026 (Monday) 9:00am\nPlease do the following for Penshoppe SM City GENSAN\nRam Upgrade and Preventive Maintenance\nFix Octopos Wiring / Cable Management\nStore Name: Penshoppe SM City GENSAN\nSerial #: 4CE9361N16\nAddress: Stall # : # 155a and 156a SM City Gensan Cor Santiago Blvd and San Miguel St General Santos City`,
    expect: d => d.company_name === 'Penshoppe SM City GENSAN' && /155a and 156a/i.test(d.location_address) && d.location_address !== d.company_name
  },
  {
    id: '110510 knowledge fallback',
    text: `Reply All\n#110510\nCustomer Company Name\nGABC_PENSHOPPE\nCustomer Location Address\nPenshoppe SM City GENSAN\nStore Name: Penshoppe SM City GENSAN\nTicket Category*\nRequest\nIssue Category*\nHardware\nIssue Description\nApplication Support\nSerial Number\n4CE9361N16`,
    expect: d => d.location_source === 'knowledge' && /155A and 156A/.test(d.location_address)
  },
  {
    id: '92228',
    text: `Reply All\n#92228\nCustomer Company Name\nGABC_OXYGEN\nCustomer Location Address\nVisayas\nTicket Category*\nRequest\nIssue Category*\nHardware\nIssue Description\nSet up 1 set of POS\nCable Management\nSerial Number\n-\nAs advised by Sir Francis, we can now proceed with the onsite support activity on October 27, 2026 (Tuesday) 9:00am\nPlease do the following for X122- Oxygen -BTQ SM Seaside City Cebu\nSet up 1 set of POS\nCable Management\nStore Name: X122- Oxygen -BTQ SM Seaside City Cebu\nAddress: 2039 – 2040 2nd Level, SM Seaside Cebu, South Road Properties, Cebu City`,
    expect: d => d.location_address.includes('2039 – 2040') && d.engineer_tasks[0] === 'Set up 1 set of POS' && d.engineer_tasks[1] === 'Cable Management'
  }
];

let failed = 0;
for (const tc of cases) {
  const d = CSAParser.extractTicketData(tc.text);
  const ok = Boolean(tc.expect(d));
  console.log(`${ok ? 'PASS' : 'FAIL'} ${tc.id}`);
  if (!ok) { failed++; console.log(JSON.stringify(d, null, 2)); }
}
if (failed) process.exit(1);
