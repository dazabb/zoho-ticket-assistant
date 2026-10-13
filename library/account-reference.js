/* Historical account mappings UI; no raw ticket contents are stored here. */
(() => {
  "use strict";
  const dialog=document.getElementById('accountReferenceDialog');
  const btn=document.getElementById('openAccountReferenceBtn');
  const close=document.getElementById('closeAccountReferenceBtn');
  const input=document.getElementById('accountReferenceSearch');
  const rows=document.getElementById('accountReferenceRows');
  const history=window.MAUAccountHistory;
  if (!dialog||!btn||!close||!input||!rows||!history) return;
  function make(tag,className,text){
    const el=document.createElement(tag);if(className)el.className=className;
    if(text!==undefined)el.textContent=String(text);return el;
  }
  function render(){
    const query=history.norm(input.value);
    const results=history.records.filter(r=>{
      if(!query)return true;
      return [r.customer,r.subject,r.account,...r.aliases,...r.subjectAliases].some(v=>history.norm(v).includes(query));
    });
    rows.replaceChildren();
    if(!results.length){rows.append(make('div','account-reference-empty','No matches. Check the source ticket or verify the account manually.'));return;}
    results.forEach(r=>{
      const item=make('div','account-reference-row');
      const heading=make('div','account-reference-row-header');
      heading.append(make('strong','',r.customer));
      heading.append(make('span','account-reference-count',r.count+' ticket'+(r.count===1?'':'s')));
      item.append(heading);
      const subject=make('div','account-reference-field');subject.append(make('span','','Subject label'),make('strong','',r.subject));item.append(subject);
      const account=make('div','account-reference-field');account.append(make('span','','Zoho Account Name'),make('strong',r.accountVerified?'account-reference-verified':'account-reference-review',r.accountVerified?r.account:'Verify in Zoho Desk'));item.append(account);
      if(r.notes)item.append(make('small','account-reference-row-note',r.notes));
      const copy=make('button','account-reference-copy','Copy subject prefix');copy.type='button';
      copy.addEventListener('click',async()=>{
        const value='SANDZ-MSDCO-'+r.subject+'-';
        try { await navigator.clipboard.writeText(value);copy.textContent='Copied'; }
        catch(e){copy.textContent='Select prefix manually: '+value;}
      });
      item.append(copy);rows.append(item);
    });
  }
  btn.addEventListener('click',()=>{input.value='';render();dialog.showModal();input.focus();});
  close.addEventListener('click',()=>dialog.close());
  input.addEventListener('input',render);
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
})();
