const isMock = false
function p(e){return Object.entries(e).filter(([,a])=>!!a).map(([a,t])=>`${a}=${t}`).join("&")}function d(e){return Object.fromEntries(Array.from(e.searchParams.entries()).filter(([,a])=>!!a))}function m(e){let a=e.toString();if(a.length<5)return a;if(a.length<9){let r=a.slice(0,-3),n=r.length,i=r[n-1]==="0"?"":`.${r[n-1]}`;return`${r.slice(0,n-1)}${i}\u4E07`}let t=a.slice(0,-7),o=t.length,s=t[o-1]==="0"?"":`.${t[o-1]}`;return`${t.slice(0,o-1)}${s}\u4EBF`}function c(e){return Response.json(e,{status:e.code})}var v={1:"anime",2:"game",3:"book"},R={1:"want",2:"doing",3:"done"};function h(e,a){let{subjectType:t="1",collectionType:o="0",pageNumber:s=1,pageSize:r=10}=e,n=a[v[t]];if(!n)return b(r);let i;if(o!=="0"){let l=n[R[o]];if(!l||!l.length)return b(r);i=l}else{let l=Object.values(n).flat();if(!l.length)return b(r);i=l}return c({code:200,message:"ok",data:{list:i.slice((s-1)*r,s*r),pageNumber:s,pageSize:r,total:i.length,totalPages:Math.ceil(i.length/r)}})}function b(e){return c({code:200,message:"ok",data:{list:[],pageNumber:1,pageSize:e,total:0,totalPages:1}})}async function y(e,a){let{collectionType:t="0",uid:o,pageNumber:s="1",pageSize:r="10"}=e,n=o??a?.BILIBILI;if(!n)return c({code:400,message:"uid is required",data:{}});let i=p({type:1,follow_status:t,pn:s,ps:r,vmid:n}),l=await fetch(`https://api.bilibili.com/x/space/bangumi/follow/list?${i}`),u=await l.json();return!l.ok||u?.code!==0?c({code:502,message:u.message,data:{}}):c({code:200,message:"ok",data:x(u.data)})}function x(e){return{list:e?.list?.map(t=>{let o=[{label:t?.new_ep?.index_show},{label:"\u8BC4\u5206",value:t?.rating?.score},{label:"\u64AD\u653E\u91CF",value:t?.stat?.view&&m(t.stat.view)},{label:"\u8FFD\u756A\u6570",value:t?.stat?.follow&&m(t.stat.follow)},{label:"\u6295\u5E01\u6570",value:t?.stat?.coin&&m(t.stat.coin)},{label:"\u5F39\u5E55\u6570",value:t?.stat?.danmaku&&m(t.stat.danmaku)}];return{nameCN:t.title,summary:t.summary,cover:t.cover,url:t.url,labels:o.filter(s=>s.label)}})??[],pageNumber:e.pn,pageSize:e.ps,total:e.total,totalPages:Math.ceil(e.total/e.ps)}}var N={1:"2",2:"4",3:"1"},w={0:null,1:"1",2:"3",3:"2"};async function S(e,a){let{subjectType:t="1",uid:o,collectionType:s="0",pageNumber:r=1,pageSize:n=10}=e,i=o??a?.BGM;if(!i)return c({code:400,message:"uid is required",data:{}});let l=p({subject_type:N[t],type:w[s],limit:n,offset:(Number(r)-1)*Number(n)}),u=await fetch(`https://api.bgm.tv/v0/users/${i}/collections?${l}`,{headers:{"User-Agent":"yixiaojiu/bilibili-bangumi-component (https://github.com/yixiaojiu/bilibili-bangumi-component)"}}),f=await u.json();return u.ok?c({code:200,message:"ok",data:T(f,{pageNumber:Number(r),pageSize:Number(n)})}):c({code:502,message:f.description,data:{}})}function T(e,a){return{list:e?.data?.map(o=>{let s=o?.subject,r=[{label:s?.eps&&`${s.eps}\u8BDD`},{label:"\u8BC4\u5206",value:s?.score},{label:"\u6392\u540D",value:s?.rank},{label:"\u65F6\u95F4",value:s?.date}];return{name:s?.name,nameCN:s?.name_cn,summary:s?.short_summary,cover:s?.images?.large,url:s?.id?`https://bgm.tv/subject/${s?.id}`:"https://bgm.tv/",labels:r.filter(n=>"value"in n?n.value:n.label)}})??[],...a,total:e.total,totalPages:Math.ceil(e.total/a.pageSize)}}function j(e){let{pageNumber:a=1,pageSize:t=10}=e;return{...e,pageNumber:Number(a),pageSize:Number(t)}}function g(e){return e.headers.set("Access-Control-Allow-Origin","*"),e.headers.set("Access-Control-Max-Age","86400"),e}var F={async fetch(e,a){let t=new URL(e.url),o=j(d(t)),s={};try{s=customData}catch{}return t.pathname.endsWith("bilibili")?g(await y(o,a)):t.pathname.endsWith("bgm")?g(await S(o,a)):t.pathname.endsWith("custom")?g(h(o,s)):Response.json({code:404,message:"not found",data:{}},{status:404})}};export{F as default};
