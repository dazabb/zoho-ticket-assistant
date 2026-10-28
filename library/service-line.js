/* Resolve the service line from the provided customer/project database FIRST.
 * Existing Zoho subjects and historical ticket counts may contain errors.
 * Do not turn Incident into MS or Request into SI: these are separate axes.
 */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.MAUServiceLine=api;})(typeof window!=='undefined'?window:(typeof globalThis!=='undefined'?globalThis:null),function(){
'use strict';
const HISTORY_COUNTS={"east-west-bank":{"MS":691,"SI":0},"bcda":{"MS":376,"SI":0},"radius-telecoms-inc.":{"MS":333,"SI":0},"monde-nissin":{"MS":314,"SI":0},"bpi-tokyo-century-(bpitc)":{"MS":108,"SI":0},"national-reinsurance-corporation-of-the-philippines":{"MS":85,"SI":0},"pascual-laboratories,-inc.":{"MS":44,"SI":0},"gma-network-inc.":{"MS":40,"SI":0},"oona":{"MS":34,"SI":0},"bpi":{"MS":26,"SI":0},"department-of-energy":{"MS":20,"SI":2},"angeles-electric":{"MS":19,"SI":0},"dswd":{"MS":14,"SI":0},"orix":{"MS":13,"SI":0},"cebu-air,-inc.":{"MS":12,"SI":0},"honda":{"MS":11,"SI":0},"chinabank":{"MS":4,"SI":0},"okada-manila":{"MS":0,"SI":3},"philippine-stock-exchange":{"MS":3,"SI":0},"watson":{"MS":3,"SI":0},"amdocs-philippines,-inc.":{"MS":0,"SI":2},"first-sumiden-circuits,-inc.":{"MS":1,"SI":1},"jg-summit":{"MS":0,"SI":2},"amti":{"MS":1,"SI":0},"bureau-of-the-treasury":{"MS":1,"SI":0},"card-bank":{"MS":0,"SI":0},"col":{"MS":0,"SI":1},"dbp":{"MS":1,"SI":0},"honda-parts-manufacturing-corporation":{"MS":1,"SI":0},"out-of-scope---bpi":{"MS":1,"SI":0},"philhealth":{"MS":1,"SI":0},"philippine-veterans-affairs-office":{"MS":0,"SI":1},"rtvm":{"MS":0,"SI":1},"smart":{"MS":1,"SI":0},"sunlife":{"MS":0,"SI":1},"travellers-international-hotel-group-inc":{"MS":0,"SI":1},"uas":{"MS":1,"SI":0},"unionbank-twilio":{"MS":1,"SI":0},"wilcon-depot-inc.":{"MS":0,"SI":1}};
const PREFIX={MS:'SANDZ-MSDCO',SI:'SANDZ-SI'};
function findHistory(source,accountHint){
 const hist=typeof MAUAccountHistory!=='undefined'?MAUAccountHistory:(typeof globalThis!=='undefined'?globalThis.MAUAccountHistory:null);
 if(!hist)return null;
 if(accountHint){let r=hist.findByCompany(accountHint.customer||accountHint.account||'');if(r)return r;}
 const raw=String(source||'');
 const company=raw.match(/(?:^|\n)\s*Customer Company Name\s*:\s*([^\r\n]+)/i);
 const account=raw.match(/(?:^|\n)\s*Account Name\s*:\s*([^\r\n]+)/i);
 for(const v of [company?.[1],account?.[1]]){
  const item=v&&hist.findByCompany(String(v).replace(/\s*[-–]\s*Sandz\s*$/i,'').trim());
  if(item)return item;
 }
 const subj=raw.match(/(?:^|\n)\s*Subject\s*:\s*(SANDZ[-–](?:MSDCO|SI)[-–][^\r\n]+)/i);
 if(subj)return hist.findBySubject(subj[1])?.record||null;
 if(raw.length<1200){const found=hist.findBySubject(raw);if(found)return found.record;}
 return null;
}
function resolve(source,accountHint,typedDecision){
 const text=String(source||'');
 const known=findHistory(text,accountHint);
 const values=known?HISTORY_COUNTS[known.id]:null;
 // Database row outranks existing ticket Solutions and the prefix on its Subject.
 // A mixed-service account requires a product/project match: no newest-row guess.
 if(typedDecision && (typedDecision.profileType==='single'||typedDecision.profileType==='mixed-row-match')
    && /^(?:MS|SI)$/.test(typedDecision.classification||'')) {
   return {type:typedDecision.classification,
     reason:typedDecision.profileType==='single'?'Single-service customer in SI/MS database':'Matching project in SI/MS database',
     customer:typedDecision.customer||known?.customer||'',confidence:'database'};
 }
 const explicit=text.match(/(?:^|\n)\s*Solutions\s*:\s*(MS|SI)\b/im);
 if(typedDecision?.profileType==='mixed-fallback') {
   return {type:'',reason:'Multiple service types in database; select the matching project',customer:typedDecision.customer||known?.customer||'',confidence:'mixed'};
 }
 if(explicit)return {type:explicit[1].toUpperCase(),reason:'Current ticket Solutions (database unavailable)',customer:known?.customer||'',confidence:'explicit'};
 if(values){
  const a=values.MS||0,b=values.SI||0;
  // Strong 2026 precedent: three or more consistently classified tickets.
  if(a>=3&&b===0)return {type:'MS',reason:`${a} MSDCO subjects in 2026`,customer:known.customer,confidence:'history'};
  if(b>=2&&a===0)return {type:'SI',reason:`${b} SI subjects in 2026`,customer:known.customer,confidence:'history'};
  if(a&&b)return {type:'',reason:'Both MS and SI history; confirm the service/project',customer:known.customer,confidence:'mixed'};
 }
 if(typedDecision?.profileType==='single'&&typedDecision.classification){
  return {type:typedDecision.classification,reason:'Single-service project profile',customer:known?.customer||'',confidence:'project'};
 }
 return {type:'',reason:'Service line unconfirmed',customer:known?.customer||'',confidence:'unconfirmed'};
}
function enforceSubject(subject,type){
 const raw=String(subject||'');if(!type||!PREFIX[type])return raw;
 return raw.replace(/^\s*SANDZ[-–](?:MSCDCO|MSDCO|SI)[-–]/i,PREFIX[type]+'-');
}
return {resolve,enforceSubject,PREFIX,HISTORY_COUNTS};
});
