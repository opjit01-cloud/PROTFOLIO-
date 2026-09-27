export class ScrollDirector{
  constructor(){this.target=0;this.current=0;this.direction=1;this.lastTarget=0;this.max=1;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.sections=[...document.querySelectorAll('.chapter[data-chapter]')];this.stops=[];this.resize=()=>this.measure();this.scroll=()=>this.read();this.measure();this.read();window.addEventListener('scroll',this.scroll,{passive:true});window.addEventListener('resize',this.resize,{passive:true})}
  measure(){this.max=Math.max(1,document.documentElement.scrollHeight-innerHeight);this.stops=this.sections.map(section=>Math.max(0,Math.min(1,(section.offsetTop+Math.min(section.offsetHeight*.45,innerHeight*.7)-innerHeight*.5)/this.max)))}
  read(){const y=window.scrollY||document.documentElement.scrollTop;this.target=Math.max(0,Math.min(1,y/this.max));if(this.target!==this.lastTarget){this.direction=this.target>this.lastTarget?1:-1;this.lastTarget=this.target}}
  advance(delta){if(this.reduced){this.current=this.target}else{const a=1-Math.exp(-Math.min(delta,.05)*14);this.current+=(this.target-this.current)*a;if(Math.abs(this.target-this.current)<.00012)this.current=this.target}return this.current}
  getChapter(p){let i=0;while(i<this.stops.length-1&&p>=this.stops[i+1])i++;return Math.min(i,Math.max(0,this.sections.length-1))}
  getLabel(p){return this.sections[this.getChapter(p)]?.dataset.chapter||'The opening'}
  jumpTo(progress){window.scrollTo({top:progress*this.max,behavior:this.reduced?'auto':'smooth'})}
  dispose(){window.removeEventListener('scroll',this.scroll);window.removeEventListener('resize',this.resize)}
}
