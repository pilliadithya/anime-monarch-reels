import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir, access, mkdtemp, rm } from "node:fs/promises";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { createServer } from "vite";

const root=process.cwd(), output=resolve(root,process.env.OUTPUT_FILE||"out/reel.mp4");
const fps=24,width=1080,height=1920,duration=Number(process.env.DURATION||6),frames=Math.round(duration*fps);
const vo=process.env.VO_FILE?resolve(root,process.env.VO_FILE):"";
const sfx=(process.env.SFX_FILES||"").split(",").map(x=>x.trim()).filter(Boolean).map(x=>resolve(root,x));
if(!Number.isFinite(duration)||duration!==6)throw new Error("This starter timeline is exactly 6 seconds; update the timeline before changing DURATION.");
await mkdir(dirname(output),{recursive:true});
const frameDir=await mkdtemp(join(tmpdir(),"anime-monarch-frames-"));
let browser,viteServer;
try{
  for(const file of [vo,...sfx].filter(Boolean))await access(file);
  viteServer=await createServer({logLevel:"error",server:{host:"127.0.0.1",port:4173,strictPort:true}});
  await viteServer.listen();
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,colorScheme:"dark"});
  const pageErrors=[];page.on("pageerror",e=>pageErrors.push(e.message));
  await page.goto("http://127.0.0.1:4173",{waitUntil:"networkidle"});
  await page.evaluate(()=>document.fonts.ready);
  const info=await page.evaluate(()=>({w:innerWidth,h:innerHeight,seek:typeof window.__seekTo==="function"}));
  if(info.w!==width||info.h!==height||!info.seek)throw Error("Expected 1080x1920 with __seekTo(t); got "+JSON.stringify(info));
  const boxes=await page.evaluate(()=>[...document.querySelectorAll(".brand,.scene h1,.caption,#cta")].map(el=>{const r=el.getBoundingClientRect();return {item:el.className||el.id,top:r.top,bottom:r.bottom}}));
  const unsafe=boxes.filter(b=>b.top<250||b.bottom>1500);
  if(unsafe.length)throw Error("Reels safe-zone violation: "+JSON.stringify(unsafe));
  for(let frame=0;frame<frames;frame++){
    await page.evaluate(t=>window.__seekTo(t),frame/fps);
    const path=join(frameDir,`frame-${String(frame).padStart(4,"0")}.jpg`);
    await page.screenshot({path,type:"jpeg",quality:92,animations:"disabled"});
    if(frame%12===0)console.log("Captured "+(frame+1)+"/"+frames+" exact frames");
  }
  if(pageErrors.length)throw Error("Browser errors: "+pageErrors.join("; "));
  await browser.close();browser=undefined;

  const args=["-hide_banner","-loglevel","error","-y","-framerate",String(fps),"-start_number","0","-i",join(frameDir,"frame-%04d.jpg")];
  const audio=[...(vo?[{path:vo,gain:"1"}]:[]),...sfx.map(path=>({path,gain:"0.75"}))];
  for(const a of audio)args.push("-i",a.path);
  if(audio.length){
    const filters=[],labels=[];
    audio.forEach((a,i)=>{const label="aud"+i;filters.push(`[${i+1}:a]aresample=48000,volume=${a.gain},apad[${label}]`);labels.push(`[${label}]`)});
    filters.push(`${labels.join("")}amix=inputs=${audio.length}:duration=longest:dropout_transition=0,atrim=0:${duration},asetpts=PTS-STARTPTS[aout]`);
    args.push("-filter_complex",filters.join(";"),"-map","0:v:0","-map","[aout]","-c:a","aac","-b:a","192k");
  }else args.push("-map","0:v:0","-an");
  args.push("-t",String(duration),"-vf","format=yuv420p,setsar=1","-r",String(fps),"-c:v","libx264","-preset","ultrafast","-crf","18","-pix_fmt","yuv420p","-color_range","tv","-movflags","+faststart",output);
  const encoder=spawn("ffmpeg",args,{stdio:["ignore","ignore","pipe"]});let log="";encoder.stderr.on("data",d=>log+=d);
  await new Promise((ok,bad)=>{encoder.once("error",bad);encoder.once("close",code=>code===0?ok():bad(Error("FFmpeg exit "+code+": "+log)))});
  const probe=spawn("ffprobe",["-v","error","-select_streams","v:0","-show_entries","stream=codec_name,width,height,r_frame_rate,pix_fmt,nb_frames","-of","json",output],{stdio:["ignore","pipe","inherit"]});
  let raw="";probe.stdout.on("data",d=>raw+=d);
  const code=await new Promise((ok,bad)=>{probe.once("error",bad);probe.once("close",ok)});
  if(code!==0)throw Error("ffprobe failed");
  const v=JSON.parse(raw).streams?.[0];
  if(!v||v.codec_name!=="h264"||v.width!==width||v.height!==height||v.r_frame_rate!=="24/1"||v.pix_fmt!=="yuv420p"||Number(v.nb_frames)!==frames)throw Error("Output validation failed: "+raw);
  console.log("Verified "+output+": 1080x1920 H.264 yuv420p 24fps, "+frames+" frames.");
}finally{
  if(browser)await browser.close().catch(()=>{});
  if(viteServer)await viteServer.close().catch(()=>{});
  await rm(frameDir,{recursive:true,force:true}).catch(()=>{});
}
