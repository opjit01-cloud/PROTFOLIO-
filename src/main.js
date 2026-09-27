import * as THREE from '../vendor/three.module.js';
import {BookModel} from './book/BookModel.js';
import {CameraRig} from './book/CameraRig.js';
import {createEnvironment} from './book/Environment.js';
import {QualityManager} from './book/QualityManager.js';
import {ScrollDirector} from './book/ScrollDirector.js';

const root=document.documentElement,body=document.body,canvas=document.getElementById('book-canvas');
const loader=document.getElementById('opening'),themeButton=document.getElementById('theme-toggle');
const menu=document.querySelector('.menu-button'),nav=document.getElementById('nav'),paper=document.getElementById('paper-card');
const markerNumber=document.getElementById('chapter-number'),markerName=document.getElementById('chapter-name');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer,book,environment,director,cameraRig,quality,raf=0,disposed=false,loaderTimer=0;

try{const saved=localStorage.getItem('jeet-theme');if(saved==='light'||saved==='dark')root.dataset.theme=saved}catch{}
function setTheme(){const light=root.dataset.theme==='light';themeButton.textContent=light?'Dark mode ◐':'Light mode ◐';themeButton.setAttribute('aria-label',`Switch to ${light?'dark':'light'} theme`);document.querySelector('meta[name="theme-color"]').content=light?'#efeee7':'#10110f';environment?.setTheme(light)}
setTheme();themeButton.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='light'?'dark':'light';try{localStorage.setItem('jeet-theme',root.dataset.theme)}catch{}setTheme()});

menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'CLOSE':'MENU'});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='MENU'}));

if(paper){let held=false;const fold=()=>{held=true;paper.classList.add('is-folded');paper.setAttribute('aria-pressed','true')};const unfold=()=>{held=false;paper.classList.remove('is-folded');paper.setAttribute('aria-pressed','false')};paper.addEventListener('pointerdown',event=>{if(event.button===0){if(event.pointerType!=='touch')event.preventDefault();paper.setPointerCapture(event.pointerId);fold()}});paper.addEventListener('pointerup',unfold);paper.addEventListener('pointercancel',unfold);paper.addEventListener('lostpointercapture',unfold);paper.addEventListener('keydown',event=>{if((event.key===' '||event.key==='Enter')&&!held){event.preventDefault();fold()}});paper.addEventListener('keyup',event=>{if(event.key===' '||event.key==='Enter')unfold()});paper.addEventListener('blur',unfold)}

const revealItems=[...document.querySelectorAll('.chapter-heading,.story-step,.note-copy,.paper-card,.contact-content')];
if('IntersectionObserver'in window&&!reduced){const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}}),{threshold:.12});revealItems.forEach(element=>{element.classList.add('reveal');revealObserver.observe(element)})}else revealItems.forEach(element=>element.classList.add('visible'));
const steps=[...document.querySelectorAll('.story-step')];if('IntersectionObserver'in window&&!reduced){const stepObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)steps.forEach(step=>step.classList.toggle('active',step===entry.target))}),{rootMargin:'-36% 0px -36% 0px'});steps.forEach(step=>stepObserver.observe(step))}

function fallback(){root.classList.add('is-fallback');body.classList.add('is-fallback');loader?.classList.add('is-gone');if(loaderTimer)clearTimeout(loaderTimer)}
let pointerX=0,pointerY=0,targetX=0,targetY=0;
window.addEventListener('pointermove',event=>{if(reduced||matchMedia('(pointer: coarse)').matches)return;targetX=(event.clientX/innerWidth-.5)*2;targetY=(event.clientY/innerHeight-.5)*2},{passive:true});

(async()=>{
  try{
    await document.fonts?.ready;
    director=new ScrollDirector();const touch=matchMedia('(pointer: coarse)').matches||innerWidth<700;
    quality=new QualityManager(canvas);renderer=quality.renderer;
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,90);camera.up.set(0,0,-1);
    environment=createEnvironment({scene,touch});book=new BookModel({scene,renderer});cameraRig=new CameraRig(camera);cameraRig.resize(innerWidth,innerHeight);
    environment.setTheme(root.dataset.theme==='light');renderer.compile(scene,camera);
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();stop();fallback()},{once:true});
    let previous=performance.now(),chapter=-1;
    function paint(now){if(disposed||document.hidden)return;raf=requestAnimationFrame(paint);const delta=Math.min((now-previous)/1000,.05);previous=now;const progress=director.advance(delta),sceneTime=reduced?0:now/1000;pointerX+=(targetX-pointerX)*(1-Math.exp(-delta*7));pointerY+=(targetY-pointerY)*(1-Math.exp(-delta*7));cameraRig.setPointer(pointerX,pointerY);cameraRig.update(progress,delta,sceneTime,!reduced&&Math.abs(director.target-director.current)<.001);book.update(progress,sceneTime);environment.update(sceneTime,progress);const next=director.getChapter(progress);if(next!==chapter){chapter=next;markerNumber.textContent=String(next+1).padStart(2,'0');markerName.textContent=director.getLabel(progress)}renderer.render(scene,camera);quality.sample(delta,environment.lights.key)}
    function start(){if(!raf&&!document.hidden&&!disposed){previous=performance.now();raf=requestAnimationFrame(paint)}}
    function stop(){if(raf){cancelAnimationFrame(raf);raf=0}}
    const resize=()=>{quality.resize(innerWidth,innerHeight);cameraRig.resize(innerWidth,innerHeight);director.measure()};window.addEventListener('resize',resize,{passive:true});
    document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
    window.addEventListener('pagehide',()=>{disposed=true;stop();director.dispose();book.dispose();environment.dispose();quality.dispose();window.removeEventListener('resize',resize)},{once:true});
    renderer.render(scene,camera);start();loader.classList.add('is-gone');loaderTimer=window.setTimeout(()=>loader.remove(),900);
  }catch(error){console.error('3D book unavailable; the full portfolio remains usable.',error);fallback()}
})();
