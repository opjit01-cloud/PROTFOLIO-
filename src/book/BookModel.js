import * as THREE from '../../vendor/three.module.js';
import {createBookPages,createPaperGrain} from '../content/PageArtwork.js';
import {PageTurn,PAGE_SIZE} from './PageTurn.js';

const W=PAGE_SIZE.width,H=PAGE_SIZE.height,THICKNESS=.22;
const leafPlan=[
  {front:'title',back:'listen',start:.305,end:.37},
  {front:'shape',back:'build',start:.425,end:.49},
  {front:'radha',back:'gym',start:.555,end:.62},
  {front:'croxy',back:'process',start:.69,end:.755},
  {front:'contact',back:'colophon',start:1,end:1}
];

function roundedBoardGeometry(width,height,depth){
  const r=.075,s=new THREE.Shape();s.moveTo(r,-height/2);s.lineTo(width-r,-height/2);s.quadraticCurveTo(width,-height/2,width,-height/2+r);s.lineTo(width,height/2-r);s.quadraticCurveTo(width,height/2,width-r,height/2);s.lineTo(r,height/2);s.quadraticCurveTo(0,height/2,0,height/2-r);s.lineTo(0,-height/2+r);s.quadraticCurveTo(0,-height/2,r,-height/2);
  const g=new THREE.ExtrudeGeometry(s,{depth,steps:1,bevelEnabled:true,bevelSegments:3,bevelThickness:.012,bevelSize:.014,curveSegments:5});g.translate(0,0,-depth/2);g.rotateX(-Math.PI/2);return g;
}
function printedPlane(texture,width,height,verticalPosition){
  const material=new THREE.MeshStandardMaterial({map:texture,roughness:.79,metalness:0,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1});
  const geometry=new THREE.PlaneGeometry(width,height,1,1);geometry.rotateX(-Math.PI/2);const mesh=new THREE.Mesh(geometry,material);mesh.position.set(W/2,verticalPosition,0);return mesh;
}

export class BookModel{
  constructor({scene,renderer}){
    this.root=new THREE.Group();this.root.name='Book';this.root.position.set(0,0,0);scene.add(this.root);this.maps=createBookPages(renderer);this.paperBump=createPaperGrain();this.coverOpen=0;this.leaves=[];
    this.#makeBlock();this.#makeSpine();this.#makeCovers();this.#makeLeaves();this.#makeEmbossing();
  }
  #makeBlock(){
    const grain=this.paperBump;const blockMat=new THREE.MeshStandardMaterial({color:0xe8e1d2,roughness:.92,bumpMap:grain,bumpScale:.007});
    const block=new THREE.Mesh(new THREE.BoxGeometry(W*2,.22,H),blockMat);block.name='Page block';block.position.set(0,-.09,0);block.castShadow=true;block.receiveShadow=true;this.root.add(block);
    const pageEdge=new THREE.MeshStandardMaterial({color:0xeee7d9,roughness:.95,bumpMap:grain,bumpScale:.003});const sheetGeo=new THREE.BoxGeometry(W*2-.055,.00145,H-.07);const count=96;this.pageEdges=new THREE.InstancedMesh(sheetGeo,pageEdge,count);this.pageEdges.name='96 individual page edges';this.pageEdges.castShadow=false;this.pageEdges.receiveShadow=true;
    const dummy=new THREE.Object3D(),color=new THREE.Color();for(let i=0;i<count;i++){const spread=i/(count-1);dummy.position.set(0,-.185+spread*.185,0);const variation=(Math.sin(i*12.9898)*.5+.5)*.055;color.setRGB(.88+variation,.85+variation,.78+variation);this.pageEdges.setColorAt(i,color);dummy.updateMatrix();this.pageEdges.setMatrixAt(i,dummy.matrix)}this.pageEdges.instanceMatrix.needsUpdate=true;this.root.add(this.pageEdges);
    // A soft, baked contact shadow grounds the whole volume without a costly full-screen blur.
    const c=document.createElement('canvas');c.width=256;c.height=256;const ctx=c.getContext('2d'),grad=ctx.createRadialGradient(128,128,18,128,128,126);grad.addColorStop(0,'rgba(0,0,0,.42)');grad.addColorStop(.58,'rgba(0,0,0,.18)');grad.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,256,256);const shadowMap=new THREE.CanvasTexture(c);const shadow=new THREE.Mesh(new THREE.PlaneGeometry(5.5,3.8),new THREE.MeshBasicMaterial({map:shadowMap,transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.set(0,-.204,0);shadow.name='Soft contact shadow';this.root.add(shadow);
  }
  #makeSpine(){
    const material=new THREE.MeshStandardMaterial({color:0x222922,roughness:.65,metalness:.05});const spine=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,H+.08,28,1),material);spine.rotation.x=Math.PI/2;spine.position.set(0,-.035,0);spine.name='Cloth-bound spine';spine.castShadow=true;spine.receiveShadow=true;this.root.add(spine);
    const bandMat=new THREE.MeshStandardMaterial({color:0x978764,roughness:.48,metalness:.38});for(const z of [-H*.43,H*.43]){const band=new THREE.Mesh(new THREE.TorusGeometry(.13,.009,6,32),bandMat);band.rotation.y=Math.PI/2;band.position.set(0,-.035,z);this.root.add(band)}
  }
  #makeCovers(){
    const leather=new THREE.MeshStandardMaterial({color:0x28342b,roughness:.64,metalness:.02,bumpMap:this.paperBump,bumpScale:.012});const edge=new THREE.MeshStandardMaterial({color:0x111713,roughness:.7});const geometry=roundedBoardGeometry(W+.06,H+.08,.13);
    const back=new THREE.Mesh(geometry,[leather,edge]);back.position.set(-W,-.035,0);back.name='Back hardcover';back.castShadow=true;back.receiveShadow=true;this.root.add(back);
    this.frontPivot=new THREE.Group();this.frontPivot.name='Hinged front cover';this.frontPivot.position.set(0,.105,0);this.root.add(this.frontPivot);
    const board=new THREE.Mesh(geometry,[leather,edge]);board.position.set(0,0,0);board.name='Front hardcover';board.castShadow=true;board.receiveShadow=true;this.frontPivot.add(board);
    const outside=this.maps.cover.front,inside=this.maps.insideCover.back;
    this.frontPivot.add(printedPlane(outside,W-.18,H-.18,.071));this.frontPivot.add(printedPlane(inside,W-.18,H-.18,-.071));
    const innerPage=new THREE.Mesh(new THREE.PlaneGeometry(W-.14,H-.14).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0xe7dfcd,roughness:.91,bumpMap:this.paperBump,bumpScale:.004}));innerPage.position.set(-W/2,.075,0);this.root.add(innerPage);
  }
  #makeLeaves(){
    const lookup=this.maps;leafPlan.forEach((plan,index)=>{
      const front=lookup[plan.front],back=lookup[plan.back];const leaf=new PageTurn({front:front.front,back:back.back||back.front,paperBump:this.paperBump,index,layer:plan});
      leaf.mesh.position.y=.062-index*.0038;leaf.mesh.userData.frontHref=front.spec.href||null;leaf.mesh.userData.backHref=back.spec.href||null;leaf.mesh.userData.frontName=front.spec.title;leaf.mesh.userData.backName=back.spec.title;this.leaves.push(leaf);this.root.add(leaf.mesh);
    });
  }
  #makeEmbossing(){
    const brass=new THREE.MeshStandardMaterial({color:0xb6a478,roughness:.4,metalness:.56});const pts=[];const inset=.15;pts.push(new THREE.Vector3(inset,.079,-H/2+inset),new THREE.Vector3(W-inset,.079,-H/2+inset),new THREE.Vector3(W-inset,.079,H/2-inset),new THREE.Vector3(inset,.079,H/2-inset));const border=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xb09e77,transparent:true,opacity:.72}));border.name='Pressed brass cover rule';this.frontPivot.add(border);
    const sigil=new THREE.Mesh(new THREE.TorusGeometry(.17,.006,5,80),brass);sigil.rotation.x=-Math.PI/2;sigil.position.set(W*.5,.083,0);this.frontPivot.add(sigil);
  }
  update(progress,time){
    const open=THREE.MathUtils.smoothstep(progress,.115,.205),close=THREE.MathUtils.smoothstep(progress,.94,.995);this.coverOpen=open;this.frontPivot.rotation.z=Math.PI*(open+close);
    this.leaves.forEach(leaf=>leaf.update(progress,time));
    this.root.rotation.y=Math.sin(progress*Math.PI*2)*.025;this.root.rotation.x=Math.sin(progress*Math.PI*3)*.012;
  }
  visibleLinkFor(leaf){return leaf.progress<.5?leaf.mesh.userData.frontHref:leaf.mesh.userData.backHref}
  dispose(){this.root.removeFromParent();this.root.traverse(o=>{o.geometry?.dispose();const materials=Array.isArray(o.material)?o.material:[o.material];materials.forEach(m=>m?.dispose())});Object.values(this.maps).forEach(pair=>{pair.front?.dispose();pair.back?.dispose()});this.paperBump.dispose()}
}
