import * as THREE from '../vendor/three.module.js';
import {BookModel} from './book/BookModel.js';
import {CameraRig} from './book/CameraRig.js';
import {createEnvironment} from './book/Environment.js';
import {BookInteraction} from './book/BookInteraction.js';
import {QualityManager} from './book/QualityManager.js';
import {ScrollDirector} from './book/ScrollDirector.js';

const canvas=document.getElementById('book-canvas'),loader=document.getElementById('opening'),body=document.body,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const themeButton=document.getElementById('theme-toggle'),label=document.getElementById('chapter-label'),indexLabel=document.getElementById('chapter-index'),folioCount=document.getElementById('folio-count'),meter=document.getElementById('scroll-meter-fill'),openingCue=document.getElementById('opening-cue'),contactAction=document.getElementById('contact-action');
let renderer=null,book=null,environment=null,interaction=null,director=null,raf=0,loaderTimer=0,disposed=false;

function revealFallback(){document.documentElement.classList.add('is-fallback');body.classList.add('is-fallback');loader?.classList.add('is-gone');if(loaderTimer)clearTimeout(loaderTimer)}
function setTheme(theme){document.documentElement.dataset.theme=theme;const light=theme==='light';themeButton.innerHTML=light?'◐ <span>DARK</span>':'◐ <span>LIGHT</span>';themeButton.setAttribute('aria-label',`Switch to ${light?'dark':'light'} theme`);try{localStorage.setItem('jeet-theme',theme)}catch{}environment?.setTheme(light)}
try{const saved=localStorage.getItem('jeet-theme');if(saved==='light'||saved==='dark')document.documentElement.dataset.theme=saved}catch{}
themeButton.addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='light'?'dark':'light'));

if(reduced){revealFallback()}
else{
  (async()=>{
    try{
      await document.fonts?.ready;
      director=new ScrollDirector();const touch=matchMedia('(pointer: coarse)').matches||innerWidth<700;
      const quality=new QualityManager(canvas);renderer=quality.renderer;
      const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,0.1,90);camera.up.set(0,0,-1);
      environment=createEnvironment({scene,touch});book=new BookModel({scene,renderer});const cameraRig=new CameraRig(camera);cameraRig.resize(innerWidth,innerHeight);
      environment.setTheme(document.documentElement.dataset.theme==='light');
      interaction=new BookInteraction({canvas,book,camera,onPointer:(x,y)=>cameraRig.setPointer(x,y)});
      canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();revealFallback();stop()},{once:true});
      renderer.compile(scene,camera);
      let previous=performance.now(),shownChapter=-1;
      function paint(now){
        if(disposed||document.hidden)return;
        raf=requestAnimationFrame(paint);
        const delta=Math.min((now-previous)/1000,.05);previous=now;const progress=director.advance(delta);
        cameraRig.update(progress,delta,now/1000,Math.abs(director.target-director.current)<.001);
        book.update(progress,now/1000);environment.update(now/1000,progress);interaction.setProgress(progress);
        const chapter=director.getChapter(progress);if(chapter!==shownChapter){shownChapter=chapter;indexLabel.textContent=String(chapter).padStart(2,'0');label.textContent=director.getLabel(progress);folioCount.innerHTML=`${String(Math.min(6,Math.max(1,Math.floor(progress*6)+1))).padStart(2,'0')}&nbsp; / &nbsp;06`}
        meter.style.width=`${(progress*100).toFixed(2)}%`;openingCue.style.opacity=progress<.095?'1':'0';contactAction.classList.toggle('is-visible',progress>=.855&&progress<.985);contactAction.setAttribute('aria-hidden',String(!(progress>=.855&&progress<.985)));
        renderer.render(scene,camera);quality.sample(delta,environment.lights.key);
      }
      function start(){if(!raf&&!document.hidden&&!disposed){previous=performance.now();raf=requestAnimationFrame(paint)}}
      function stop(){if(raf){cancelAnimationFrame(raf);raf=0}}
      const resize=()=>{quality.resize(innerWidth,innerHeight);cameraRig.resize(innerWidth,innerHeight);director.measure()};window.addEventListener('resize',resize,{passive:true});
      document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start()});
      window.addEventListener('pagehide',()=>{disposed=true;stop();interaction.dispose();director.dispose();book.dispose();environment.dispose();quality.dispose();window.removeEventListener('resize',resize)},{once:true});
      renderer.render(scene,camera);start();loader.classList.add('is-gone');loaderTimer=window.setTimeout(()=>loader.remove(),950);
    }catch(error){console.error('The book scene could not start; showing the reading view.',error);revealFallback()}
  })();
}
