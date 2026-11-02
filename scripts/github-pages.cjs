/* Optional publishing helper. Credentials stay in memory and are never printed. */
const {execFileSync}=require('node:child_process');
const repo='gokhanozbek66/zihin-atlasi';
let token;
try{
  const output=execFileSync('git',['credential','fill'],{input:'protocol=https\nhost=github.com\n\n',encoding:'utf8',env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'never'},stdio:['pipe','pipe','pipe']});
  for(const line of output.split('\n'))if(line.startsWith('password='))token=line.slice(9).trim();
}catch{}
const headers={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'zihin-atlasi-publisher'};
if(token)headers.Authorization='Bearer '+token;
async function request(path,method='GET',body){const response=await fetch('https://api.github.com'+path,{method,headers,body:body?JSON.stringify(body):undefined});const data=await response.json().catch(()=>({}));return {status:response.status,data};}
(async()=>{
  const meta=await request('/repos/'+repo);console.log(JSON.stringify({repository:repo,authenticated:!!token,status:meta.status,permissions:meta.data.permissions}));
  const current=await request('/repos/'+repo+'/pages');console.log(JSON.stringify({pagesStatus:current.status,url:current.data.html_url,buildType:current.data.build_type}));
  if(process.argv[2]==='enable'){
    if(!token||!meta.data.permissions?.admin)throw Error('GitHub Pages settings require a credential with repository admin permission.');
    const result=await request('/repos/'+repo+'/pages',current.status===404?'POST':'PUT',{build_type:'workflow'});console.log(JSON.stringify({configured:result.status===201||result.status===204||result.status===200,status:result.status,message:result.data.message,url:result.data.html_url}));if(result.status>=400)process.exitCode=1;
  }
  if(process.argv[2]==='runs'){
    const result=await request('/repos/'+repo+'/actions/workflows/pages.yml/runs?per_page=3');console.log(JSON.stringify({status:result.status,runs:result.data.workflow_runs?.map(r=>({id:r.id,status:r.status,conclusion:r.conclusion,url:r.html_url,sha:r.head_sha}))}));
  }
})().catch(()=>{console.error('GitHub request failed or required repository permission is unavailable. No credentials were printed.');process.exitCode=1;});
