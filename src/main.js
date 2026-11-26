import "./style.css";
const reel=document.querySelector("#reel"),kicker=document.querySelector("#kicker"),title=document.querySelector("#headline"),caption=document.querySelector("#caption"),cta=document.querySelector("#cta"),progress=document.querySelector("#progress"),scenes=[...document.querySelectorAll(".scene")],core=document.querySelector(".energy-core");
const data=[
{k:"ANIME LORE",a:"THE POWER",b:"WITHIN.",c:"POWER KI LIMIT LEDU",cta:"TELUGU ANIME • ANIME MONARCH"},
{k:"BEYOND THE LIMIT",a:"ONE WILL",b:"CHANGE IT ALL.",c:"NENU READY BRO",cta:"STORY • HYPE • MOTION"},
{k:"YOUR NEXT OBSESSION",a:"ENTER THE",b:"ANIMEVERSE.",c:"NEXT LEVEL VIBE",cta:"FOLLOW @ANIME.MONARCH7"}];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
window.__seekTo=function(t){t=clamp(Number(t)||0,0,6);const idx=Math.min(2,Math.floor(t/2)),local=t-idx*2,d=data[idx],enter=smooth(local/.32),leave=smooth((2-local)/.22),visible=enter*leave;
scenes.forEach((el,i)=>{el.style.opacity=i===idx?String(visible):"0";el.style.transform=i===idx? `translate3d(0,${(1-enter)*54}px,0) scale(${.96+enter*.04})`:"translate3d(0,0,0)"});
kicker.textContent=d.k;title.innerHTML=`${d.a}<br><em>${d.b}</em>`;caption.textContent=d.c;cta.textContent=d.cta;
caption.style.opacity=String(visible*smooth((local-.35)/.2));caption.style.transform=`translate3d(0,${(1-smooth((local-.35)/.2))*22}px,0)`;
cta.style.opacity=String(visible*smooth((local-.62)/.2));cta.style.transform=`translate3d(0,${(1-smooth((local-.62)/.2))*16}px,0)`;
progress.style.transform=`scaleX(${t/6})`;reel.dataset.scene=String(idx+1);core.style.transform=`rotate(${t*48}deg) scale(${.9+Math.sin(t*2.4)*.08})`;
};
// Renderer contract: exact deterministic seek at 24fps; optimized renderer.
window.__seekTo(0);
