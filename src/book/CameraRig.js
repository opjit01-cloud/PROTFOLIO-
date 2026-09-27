import * as THREE from '../../vendor/three.module.js';

const positions=[
  [0.55,8.1,6.8],[1.35,6.3,5.1],[1.05,4.65,3.55],[.42,3.85,2.4],
  [-.26,3.5,.9],[.28,3.35,-.45],[-.34,3.28,.62],[.3,3.4,-.78],
  [-.18,3.58,.42],[.18,4.45,2.65],[.15,7.6,6.6]
];
const targets=[
  [.55,0,0],[.65,0,0],[.35,0,0],[.2,0,-.1],
  [-.04,0,-.12],[.52,0,-.18],[.48,0,.12],[.51,0,-.16],
  [.45,0,.08],[.18,0,0],[0,0,0]
];
function curve(points){return new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'catmullrom',.12)}

export class CameraRig{
  constructor(camera){this.camera=camera;this.positionPath=curve(positions);this.targetPath=curve(targets);this.lookTarget=new THREE.Vector3();this.position=new THREE.Vector3();this.mouseX=0;this.mouseY=0;this.idle=0;camera.up.set(0,0,-1)}
  setPointer(x,y){this.mouseX=x;this.mouseY=y}
  update(progress,delta,time,idle=true){
    this.positionPath.getPoint(progress,this.position);this.targetPath.getPoint(progress,this.lookTarget);
    const damping=1-Math.exp(-Math.min(delta,.05)*12);
    if(idle){this.idle+=delta;this.position.x+=Math.sin(time*.22)*.012;this.position.z+=Math.cos(time*.19)*.009}else this.idle=0;
    this.camera.position.lerp(this.position,damping);
    this.lookTarget.x+=this.mouseX*.075;this.lookTarget.z+=this.mouseY*.055;
    this.camera.lookAt(this.lookTarget);
  }
  resize(width,height){this.camera.aspect=width/height;this.camera.fov=width<680?47:42;this.camera.updateProjectionMatrix()}
}
