(()=>{'use strict';
const stage=document.getElementById('playground'),canvas=document.getElementById('chaos-canvas'),slider=document.getElementById('chaos'),output=document.getElementById('chaos-value'),motion=document.getElementById('motion'),remix=document.getElementById('remix');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduce.matches,amount=reduce.matches?0:.55,time=0,last=0,visible=true,raf=0,seed=0,ready=false,gl;
let pointer=[-10000,-10000],width=1,height=1;const items=[...document.querySelectorAll('.hero-fragment')].map((el,i)=>({el,img:el.querySelector('img'),i,texture:null,angle:0,x:0,y:0,w:1,h:1}));
slider.value=Math.round(amount*100);output.value=`${slider.value}%`;
function controls(){document.body.classList.toggle('motion-paused',paused);motion.setAttribute('aria-pressed',String(paused));motion.textContent=lang==='no'?(paused?'Start bevegelse':'Sett på pause'):(paused?'Resume motion':'Pause motion')}
controls();document.addEventListener('languagechange',controls);
function request(){if(!raf&&visible&&!document.hidden)raf=requestAnimationFrame(frame)}
slider.addEventListener('input',()=>{amount=Number(slider.value)/100;output.value=`${slider.value}%`;request()});motion.addEventListener('click',()=>{paused=!paused;controls();last=0;request()});remix.addEventListener('click',()=>{seed+=2.7;time+=1.7;request()});reduce.addEventListener('change',e=>{paused=e.matches;if(paused){amount=0;slider.value=0;output.value='0%'}controls();request()});
stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();pointer=[e.clientX-r.left,e.clientY-r.top];request()},{passive:true});stage.addEventListener('pointerleave',()=>{pointer=[-10000,-10000];request()});stage.addEventListener('pointerup',e=>{if(e.pointerType==='touch'){pointer=[-10000,-10000];request()}});
document.addEventListener('visibilitychange',()=>{last=0;if(!document.hidden)request()});new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;last=0;if(visible)request()},{rootMargin:'100px'}).observe(stage);
const vertex=`
attribute vec2 aPosition;
uniform vec2 uResolution;
uniform vec4 uRect;
uniform float uAngle;
uniform mediump float uTime;
uniform mediump float uAmount;
uniform mediump float uSeed;
varying mediump vec2 vUv;
void main(){
 vUv=vec2(aPosition.x*.5+.5,.5-aPosition.y*.5);
 vec2 p=aPosition*uRect.zw*.5;
 p.x+=sin(aPosition.y*3.0+uTime*.7+uSeed)*uAmount*7.0;
 p.y+=sin(aPosition.x*4.0+uTime*.5+uSeed)*uAmount*5.0;
 float c=cos(uAngle),s=sin(uAngle);
 p=vec2(c*p.x-s*p.y,s*p.x+c*p.y)+uRect.xy;
 gl_Position=vec4(p.x/uResolution.x*2.0-1.0,1.0-p.y/uResolution.y*2.0,0,1);
}`;
const fragment=`
precision mediump float;
uniform sampler2D uImage;
uniform vec2 uCover;
uniform vec2 uPointer;
uniform mediump float uTime;
uniform mediump float uAmount;
uniform mediump float uSeed;
varying mediump vec2 vUv;
void main(){
 vec2 uv=vUv;
 float local=exp(-dot(uv-uPointer,uv-uPointer)*10.0);
 float wave=sin(uv.y*13.0+uTime*.9+uSeed)*cos(uv.x*8.0-uTime*.65);
 uv+=vec2(wave,sin(uv.x*12.0+uTime*.6+uSeed))*.013*uAmount;
 vec2 delta=uv-uPointer;
 uv+=delta*sin(length(delta)*25.0-uTime*2.0)*local*.16*uAmount;
 vec2 st=(uv-.5)*uCover+.5;
 float split=(.0015+.018*local)*uAmount;
 vec3 col=vec3(texture2D(uImage,clamp(st+vec2(split,0),.001,.999)).r,texture2D(uImage,clamp(st,.001,.999)).g,texture2D(uImage,clamp(st-vec2(split,0),.001,.999)).b);
 gl_FragColor=vec4(col,1.0);
}`;
let program,uniforms;
function compile(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
function fallback(){ready=false;stage.classList.remove('gpu-ready');canvas.style.display='none';document.getElementById('effect-hint').textContent=lang==='no'?'FOTOMODUS':'PHOTO MOTION';request()}
function setup(){try{gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false,powerPreference:'low-power'});if(!gl){fallback();return}program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const a=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);uniforms={};['uResolution','uRect','uAngle','uTime','uAmount','uSeed','uImage','uCover','uPointer'].forEach(n=>uniforms[n]=gl.getUniformLocation(program,n));gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.uniform1i(uniforms.uImage,0);
 for(const item of items){if(!item.img.naturalWidth)throw Error('Photo not available');item.texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,item.texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,item.img)}ready=true;canvas.style.display='';stage.classList.add('gpu-ready');resize();request()}catch(e){console.warn('Photo effects unavailable:',e.message);fallback()}}
function resize(){width=stage.clientWidth;height=stage.clientHeight;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);items.forEach(item=>{item.x=item.el.offsetLeft;item.y=item.el.offsetTop;item.w=item.el.offsetWidth;item.h=item.el.offsetHeight;item.angle=parseFloat(getComputedStyle(item.el).getPropertyValue('--r'))*Math.PI/180});if(ready)gl.viewport(0,0,canvas.width,canvas.height);request()}
function frame(stamp){raf=0;if(!visible||document.hidden)return;if(last&&!paused)time+=Math.min((stamp-last)/1000,.04);last=stamp;if(ready){gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);gl.uniform2f(uniforms.uResolution,width,height);gl.uniform1f(uniforms.uTime,time);gl.uniform1f(uniforms.uAmount,amount)}
 for(const item of items){const ph=item.i*1.8+seed,dx=Math.sin(time*.28+ph)*amount*20,dy=Math.cos(time*.36+ph)*amount*17,angle=item.angle+Math.sin(time*.19+ph)*amount*.07;item.el.style.transform=`translate(${dx}px,${dy}px) rotate(${angle}rad)`;if(ready){const cx=item.x+item.w/2+dx,cy=item.y+item.h/2+dy;gl.uniform4f(uniforms.uRect,cx,cy,item.w,item.h);gl.uniform1f(uniforms.uAngle,angle);gl.uniform1f(uniforms.uSeed,ph);const imgAspect=item.img.naturalWidth/item.img.naturalHeight,boxAspect=item.w/item.h;gl.uniform2f(uniforms.uCover,Math.min(boxAspect/imgAspect,1),Math.min(imgAspect/boxAspect,1));const px=pointer[0]-cx,py=pointer[1]-cy,c=Math.cos(angle),s=Math.sin(angle);gl.uniform2f(uniforms.uPointer,(c*px+s*py)/item.w+.5,.5-(-s*px+c*py)/item.h);gl.bindTexture(gl.TEXTURE_2D,item.texture);gl.drawArrays(gl.TRIANGLES,0,6)}}if(!paused&&amount>0)request()}
new ResizeObserver(resize).observe(stage);canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback()});canvas.addEventListener('webglcontextrestored',setup);
Promise.all(items.map(item=>item.img.decode())).then(setup).catch(fallback);resize();request();
})();
