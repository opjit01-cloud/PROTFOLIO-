import * as THREE from '../../vendor/three.module.js';

const WIDTH=1.72,HEIGHT=2.42,SEG_X=40,SEG_Z=32;
function flexMaterial(front,back,paperBump){
  const material=new THREE.MeshStandardMaterial({map:front,roughness:.88,metalness:0,bumpMap:paperBump,bumpScale:.004,side:THREE.DoubleSide});
  material.onBeforeCompile=shader=>{
    shader.uniforms.pageBackMap={value:back};
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_pars_fragment>','#include <map_pars_fragment>\nuniform sampler2D pageBackMap;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
      vec4 sampledPage = gl_FrontFacing ? texture2D( map, vMapUv ) : texture2D( pageBackMap, vMapUv );
      diffuseColor *= sampledPage;
      #endif`);
  };
  material.customProgramCacheKey=()=> 'folio-front-and-back-texture-v1';
  return material;
}

export class PageTurn{
  constructor({front,back,paperBump,layer,index,href=null}){
    this.index=index;this.href=href;this.start=layer.start;this.end=layer.end;this.progress=0;this.lastProgress=-1;
    const geometry=new THREE.PlaneGeometry(WIDTH,HEIGHT,SEG_X,SEG_Z);
    geometry.translate(WIDTH/2,0,0);geometry.rotateX(-Math.PI/2);
    const pos=geometry.attributes.position;this.rest=new Float32Array(pos.array.length);
    for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),u=x/WIDTH,v=(z+HEIGHT/2)/HEIGHT;const arch=.026*Math.sin(Math.PI*u)+.014*Math.pow(Math.abs(v-.5)*2,2);pos.setY(i,arch);this.rest[i*3]=x;this.rest[i*3+1]=arch;this.rest[i*3+2]=z}
    pos.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();
    this.geometry=geometry;this.mesh=new THREE.Mesh(geometry,flexMaterial(front,back,paperBump));this.mesh.name=`folio-${index+1}`;this.mesh.castShadow=true;this.mesh.receiveShadow=true;this.mesh.frustumCulled=false;this.mesh.userData.pageTurn=this;
  }
  update(exactProgress,time){
    const t=this.end<=this.start?0:THREE.MathUtils.smoothstep(exactProgress,this.start,this.end);this.progress=t;
    const changed=Math.abs(t-this.lastProgress)>.00035;this.mesh.visible=true;
    this.mesh.position.set(0,.062-this.index*.0038-(t>.5?(t-.5)*.009:0),0);
    this.mesh.rotation.z=0;
    if(changed){
      const theta=Math.PI*(t-.012*Math.sin(Math.PI*2*t));
      const sn=Math.sin(theta),cs=Math.cos(theta),curl=Math.sin(theta),pos=this.geometry.attributes.position;
      for(let i=0;i<pos.count;i++){
        const k=i*3,x0=this.rest[k],y0=this.rest[k+1],z0=this.rest[k+2],u=x0/WIDTH,v=(z0+HEIGHT/2)/HEIGHT;
        const bow=curl*(.11*Math.sin(Math.PI*u)+.13*u*u*(.3+.7*v));
        const flutter=(t>0&&t<1?Math.sin(time*5.2+v*4+this.index)*.008*Math.sin(Math.PI*t):0);
        const x=x0*cs-(y0+bow+flutter)*sn;
        const y=x0*sn+(y0+bow+flutter)*cs;
        const z=z0+curl*.055*Math.sin(Math.PI*u)*Math.sin(Math.PI*v)+.018*curl*u*u*(v-.5);
        pos.setXYZ(i,x,y,z);
      }
      pos.needsUpdate=true;this.geometry.computeVertexNormals();this.geometry.computeBoundingSphere();this.lastProgress=t;
    }
  }
  dispose(){this.geometry.dispose();this.mesh.material.dispose()}
}

export const PAGE_SIZE={width:WIDTH,height:HEIGHT};
