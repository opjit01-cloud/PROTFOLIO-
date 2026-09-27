import * as THREE from '../../vendor/three.module.js';

const projectWindows=[
  {start:.43,end:.555,href:'https://newradhaswami.pages.dev/'},
  {start:.555,end:.62,href:'https://indiagym.vercel.app/'},
  {start:.62,end:.69,href:'https://croxy.pages.dev/'}
];
export class BookInteraction{
  constructor({canvas,book,camera,onPointer}){this.canvas=canvas;this.book=book;this.camera=camera;this.onPointer=onPointer;this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();this.enabled=true;this.lastHref=null;this.handleMove=e=>this.move(e);this.handleClick=e=>this.click(e);canvas.addEventListener('pointermove',this.handleMove,{passive:true});canvas.addEventListener('click',this.handleClick)}
  setProgress(p){this.progress=p;this.enabled=p>.39&&p<.9}
  move(event){this.pointer.set((event.clientX/innerWidth)*2-1,-(event.clientY/innerHeight)*2+1);this.onPointer((event.clientX/innerWidth-.5)*2,(event.clientY/innerHeight-.5)*2);const href=this.hitHref();if(href!==this.lastHref){this.lastHref=href;this.canvas.style.cursor=href?'pointer':'default'}}
  hitHref(){if(!this.enabled)return null;this.raycaster.setFromCamera(this.pointer,this.camera);const meshes=this.book.leaves.map(page=>page.mesh);for(const hit of this.raycaster.intersectObjects(meshes,false)){const page=hit.object.userData.pageTurn;const href=page?.progress<.5?hit.object.userData.frontHref:hit.object.userData.backHref;if(href)return href}return null}
  click(event){this.pointer.set((event.clientX/innerWidth)*2-1,-(event.clientY/innerHeight)*2+1);const href=this.hitHref();if(href)window.open(href,'_blank','noopener,noreferrer')}
  projectFor(p){return projectWindows.find(item=>p>=item.start&&p<item.end)?.href||null}
  dispose(){this.canvas.removeEventListener('pointermove',this.handleMove);this.canvas.removeEventListener('click',this.handleClick);this.canvas.style.cursor='default'}
}
