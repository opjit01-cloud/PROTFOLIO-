import * as THREE from '../../vendor/three.module.js';

export class QualityManager{
  constructor(canvas){
    this.touch=matchMedia('(pointer: coarse)').matches||innerWidth<700;this.mobile=innerWidth<700;
    this.renderer=new THREE.WebGLRenderer({canvas,alpha:false,antialias:!this.touch,powerPreference:this.touch?'default':'high-performance',stencil:false,depth:true});
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.08;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.dpr=Math.min(devicePixelRatio||1,this.touch?1.15:1.4);this.renderer.setPixelRatio(this.dpr);this.renderer.setSize(innerWidth,innerHeight,false);
    this.samples=0;this.total=0;this.window=0;this.degraded=false;
  }
  resize(width,height){this.mobile=width<700;this.renderer.setSize(width,height,false);const next=Math.min(devicePixelRatio||1,this.touch?1.15:1.4,this.degraded?1.05:99);if(Math.abs(next-this.dpr)>.04){this.dpr=next;this.renderer.setPixelRatio(next);this.renderer.setSize(width,height,false)}}
  sample(delta,keyLight){this.total+=delta;this.samples++;if(this.total<1.5)return false;const average=this.total/this.samples;this.total=0;this.samples=0;if(average>.022&&!this.degraded){this.degraded=true;this.dpr=Math.min(this.dpr,1.05);this.renderer.setPixelRatio(this.dpr);this.renderer.shadowMap.enabled=false;keyLight.castShadow=false;return true}return false}
  dispose(){this.renderer.dispose();this.renderer.forceContextLoss()}
}
