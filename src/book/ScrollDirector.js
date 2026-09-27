const chapters=[
  {at:0,label:'THE COVER'},
  {at:.185,label:'TITLE PAGE'},
  {at:.31,label:'THE FIRST QUESTION'},
  {at:.425,label:'NEW RADHA SWAMI'},
  {at:.555,label:'INDIA GYM'},
  {at:.62,label:'CROXY'},
  {at:.755,label:'THE WORKING PAGE'},
  {at:.855,label:'THE LAST PAGE'}
];
export class ScrollDirector{
  constructor(){this.target=0;this.current=0;this.direction=1;this.lastTarget=0;this.max=1;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.resize=()=>this.measure();this.scroll=()=>this.read();this.measure();this.read();window.addEventListener('scroll',this.scroll,{passive:true});window.addEventListener('resize',this.resize,{passive:true});this.breaks=[.305,.425,.555,.69];this.onChapter=()=>{}}
  measure(){this.max=Math.max(1,document.documentElement.scrollHeight-innerHeight)}
  read(){const y=window.scrollY||document.documentElement.scrollTop;this.target=Math.max(0,Math.min(1,y/this.max));if(this.target!==this.lastTarget){this.direction=this.target>this.lastTarget?1:-1;this.lastTarget=this.target}}
  advance(delta){if(this.reduced){this.current=this.target}else{const a=1-Math.exp(-Math.min(delta,.05)*9.5);this.current+=(this.target-this.current)*a;if(Math.abs(this.target-this.current)<.00012)this.current=this.target}return this.current}
  getChapter(p){let i=0;while(i<chapters.length-1&&p>=chapters[i+1].at)i++;return i}
  getLabel(p){return chapters[this.getChapter(p)].label}
  jumpTo(progress){window.scrollTo({top:progress*this.max,behavior:this.reduced?'auto':'smooth'})}
  dispose(){window.removeEventListener('scroll',this.scroll);window.removeEventListener('resize',this.resize)}
}
