const { chromium } = require('playwright');
const fs=require('fs'); const { execSync } = require('child_process');
(async()=>{
 const [w,h,name]=[+process.argv[2],+process.argv[3],process.argv[4]]; const FPS=60, T=5.8;
 const dir=`/tmp/vr/frames_${name}`; fs.rmSync(dir,{recursive:true,force:true}); fs.mkdirSync(dir,{recursive:true});
 const b = await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p = await b.newPage({viewport:{width:w,height:h}});
 await p.goto(`http://localhost:8765/index.html?w=${w}&h=${h}`); await p.waitForFunction(()=>window.ready,null,{timeout:60000});
 console.log(name, JSON.stringify(await p.evaluate(()=>window.meta)));
 const n=Math.round(T*FPS);
 for(let i=0;i<=n;i++){ await p.evaluate(t=>window.setT(t), i/FPS); await p.screenshot({path:`${dir}/${String(i).padStart(4,'0')}.png`}); if(i%60===0) console.log(name,i,'/',n); }
 await b.close();
 execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i ${dir}/%04d.png -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart -an /tmp/vr/room-${name}.mp4`);
 console.log('ok',name,fs.statSync(`/tmp/vr/room-${name}.mp4`).size);
})();
