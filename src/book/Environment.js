import * as THREE from '../../vendor/three.module.js';

export function createEnvironment({scene,touch}){
  scene.background=new THREE.Color(0x100e0b);scene.fog=new THREE.FogExp2(0x100e0b,.027);
  const hemisphere=new THREE.HemisphereLight(0xd8d1bf,0x1e1b17,1.35);hemisphere.name='Soft room fill';scene.add(hemisphere);
  const key=new THREE.DirectionalLight(0xffe5b8,3.05);key.position.set(-3.4,7.2,4.5);key.name='Warm overhead key';key.castShadow=true;key.shadow.mapSize.set(touch?768:1280,touch?768:1280);key.shadow.camera.left=-4.7;key.shadow.camera.right=4.7;key.shadow.camera.top=4.4;key.shadow.camera.bottom=-4.4;key.shadow.camera.near=.5;key.shadow.camera.far=18;key.shadow.bias=-.00022;key.shadow.normalBias=.035;key.shadow.radius=3;scene.add(key);scene.add(key.target);
  const fill=new THREE.DirectionalLight(0xc5d0ce,.82);fill.position.set(4.8,4.6,-3.8);fill.name='Quiet page fill';scene.add(fill);
  const rim=new THREE.PointLight(0xb78348,32,9,2);rim.position.set(-2.8,2.6,-1.8);rim.name='Amber leather rim';scene.add(rim);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshStandardMaterial({color:0x151310,roughness:.96,metalness:.02}));floor.rotation.x=-Math.PI/2;floor.position.y=-.205;floor.receiveShadow=true;floor.name='Matte studio floor';scene.add(floor);

  const count=touch?16:36,points=new Float32Array(count*3),base=[];let seed=43921;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};for(let i=0;i<count;i++){const x=(rnd()-.5)*5.6,y=.05+rnd()*2.7,z=(rnd()-.5)*3.9;base.push([x,y,z,rnd()*6.28]);points[i*3]=x;points[i*3+1]=y;points[i*3+2]=z}
  const dustGeometry=new THREE.BufferGeometry();dustGeometry.setAttribute('position',new THREE.BufferAttribute(points,3));const dustMaterial=new THREE.PointsMaterial({color:0xd4c3a0,size:touch ? .022 : .026,transparent:true,opacity:.29,depthWrite:false,sizeAttenuation:true});const dust=new THREE.Points(dustGeometry,dustMaterial);dust.name='Sparse studio dust';scene.add(dust);
  function update(time,progress){for(let i=0;i<count;i++){const [x,y,z,phase]=base[i];points[i*3]=x+Math.sin(time*.19+phase)*.055;points[i*3+1]=y+Math.sin(time*.31+phase)*.04;points[i*3+2]=z+Math.cos(time*.17+phase)*.045}dustGeometry.attributes.position.needsUpdate=true;dust.visible=progress>.06&&progress<.96;key.intensity=3.0+Math.sin(progress*Math.PI)*.32;rim.intensity=25+Math.sin(progress*Math.PI)*12}
  function setTheme(light){scene.background.set(light?0xd9d4c7:0x100e0b);scene.fog.color.set(light?0xd9d4c7:0x100e0b);scene.fog.density=light ? .018 : .027;hemisphere.intensity=light?1.55:1.35;floor.material.color.set(light?0x8d887b:0x151310);floor.material.needsUpdate=true}
  return{update,setTheme,lights:{key,fill,rim,hemisphere},dust,dispose(){dustGeometry.dispose();dustMaterial.dispose();floor.geometry.dispose();floor.material.dispose()}};
}
