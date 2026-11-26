import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir, access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const root=process.cwd(), output=resolve(root,process.env.OUTPUT_FILE||"out/reel.mp4");
const fps=24,width=1080,height=1920,duration=Number(process.env.DURATION||6),frames=Math.round(duration*fps);
const vo=process.env.VO_FILE?resolve(root,process.env.VO_FILE):"";
const sfx=(process.env.SFX_FILES||"").split(",").map(x=>x.trim()).filter(Boolean).map(x=>resolve(root,x));
if(!Number.isFinite(duration)||duration<=0) throw new Error("DURATION must be positive");
await mkdir(dirname(output),{recursive:true});
const server=spawn("npm",["run","dev","--","--host","127.0.0.1","--port","4173","--strictPort"],{stdio:["ignore","pipe","pipe"]});
let serverLog=""; server.stdout.on("data",d=>serverLog+=d); server.stderr.on("data",d=>serverLog+=d);
async function ready(){for(let i=0;i<80;i++){try{if((await fetch("http://127.0.0.1:4173")).ok)return}catch{} if(server.exitCode!==null)throw Error(serverLog); await sleep(250)}throw Error("Vite did not start: "+serverLog)}
let browser,encoder;
try{
  for(const file of [vo,...sfx].filter(Boolean))await access(file);
  await ready();
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,colorScheme:"dark"});
  const pageErrors=[]; page.on("pageerror",e=>pageErrors.push(e.message));
  await page.goto("http://127.0.0.1:4173",{waitUntil:"networkidle"});
  await page.evaluate(()=>document.fonts.ready);
  const info=await page.evaluate(()=>({w:innerWidth,h:innerHeight,seek:typeof window.__seekTo==="function"}));
  if(info.w!==width||info.h!==height||!info.seek)throw Error("Expected 1080x1920 with __seekTo(t); got "+JSON.stringify(info));
  const args=["-hide_banner","-loglevel","error","-y","-f","image2pipe","-vcodec","png","-framerate",String(fps),"-i","pipe:0"];
  const audio=[...(vo?[{path:vo,gain:"1"}]:[]),...sfx.map(path=>({path,gain:"0.75"}))];
  for(const a of audio)args.push("-i",a.path);
  if(audio.length){
    const filters=[],labels=[];
    audio.forEach((a,i)=>{const label="aud"+i;filters.push(`[${i+1}:a]aresample=48000,volume=${a.gain},apad[${label}]`);labels.push(`[${label}]`)});
    filters.push(`${labels.join("")}amix=inputs=${audio.length}:duration=longest:dropout_transition=0,atrim=0:${duration},asetpts=PTS-STARTPTS[aout]`);
    args.push("-filter_complex",filters.join(";"),"-map","0:v:0","-map","[aout]","-c:a","aac","-b:a","192k");
  }else args.push("-map","0:v:0","-an");
  args.push("-t",String(duration),"-vf","scale=1080:1920:flags=lanczos,setsar=1","-r",String(fps),"-c:v","libx264","-preset","medium","-crf","18","-pix_fmt","yuv420p","-movflags","+faststart",output);
  encoder=spawn("ffmpeg",args,{stdio:["pipe","ignore","pipe"]});let log="";encoder.stderr.on("data",d=>log+=d);
  const exit=new Promise((ok,bad)=>{encoder.once("error",bad);encoder.once("close",c=>c===0?ok():bad(Error("FFmpeg exit "+c+": "+log)))});
  for(let frame=0;frame<frames;frame++){
    await page.evaluate(t=>window.__seekTo(t),frame/fps);
    const png=await page.screenshot({type:"png",animations:"disabled"});
    if(!encoder.stdin.write(png))await new Promise(r=>encoder.stdin.once("drain",r));
    if(frame%24===0)console.log("Frame "+(frame+1)+"/"+frames);
  }
  encoder.stdin.end();await exit;
  if(pageErrors.length)throw Error("Browser errors: "+pageErrors.join("; "));
  await browser.close();browser=undefined;
  const probe=spawn("ffprobe",["-v","error","-select_streams","v:0","-show_entries","stream=codec_name,width,height,r_frame_rate,pix_fmt","-of","json",output],{stdio:["ignore","pipe","inherit"]});
  let raw="";probe.stdout.on("data",d=>raw+=d);
  const code=await new Promise((ok,bad)=>{probe.once("error",bad);probe.once("close",ok)});
  if(code!==0)throw Error("ffprobe failed");
  const v=JSON.parse(raw).streams?.[0];
  if(!v||v.codec_name!=="h264"||v.width!==width||v.height!==height||v.r_frame_rate!=="24/1"||v.pix_fmt!=="yuv420p")throw Error("Output validation failed: "+raw);
  console.log("Verified "+output+": 1080x1920 H.264 yuv420p 24fps, "+frames+" frames.");
}finally{
  if(browser)await browser.close().catch(()=>{});
  if(encoder&&encoder.exitCode===null){encoder.stdin.destroy();encoder.kill("SIGTERM")}
  if(server.exitCode===null)server.kill("SIGTERM");
}
