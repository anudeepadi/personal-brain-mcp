"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

// ── Palette: violet nodes, purple connections ─────────────────────────
const NODE_PALETTE = [
  new THREE.Color(0xa78bfa),
  new THREE.Color(0x8b5cf6),
  new THREE.Color(0xc4b5fd),
  new THREE.Color(0xddd6fe),
  new THREE.Color(0x7c3aed),
];

const CONNECTION_PALETTE = [
  new THREE.Color(0x7c3aed),
  new THREE.Color(0x8b5cf6),
  new THREE.Color(0xa78bfa),
  new THREE.Color(0x6d28d9),
  new THREE.Color(0x5b21b6),
];

// ── GLSL helpers ──────────────────────────────────────────────────────
const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(
    i.z+vec4(0.0,i1.z,i2.z,1.0))
    +i.y+vec4(0.0,i1.y,i2.y,1.0))
    +i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const NODE_VERTEX = /* glsl */ `${NOISE_GLSL}
attribute float nodeSize;
attribute float nodeType;
attribute vec3 nodeColor;
attribute float distanceFromRoot;
uniform float uTime;
uniform vec3 uPulsePositions[3];
uniform float uPulseTimes[3];
uniform float uPulseSpeed;
uniform float uBaseNodeSize;
varying vec3 vColor;
varying float vNodeType;
varying vec3 vPosition;
varying float vPulseIntensity;
varying float vDistanceFromRoot;
varying float vGlow;

float getPulseIntensity(vec3 wp,vec3 pp,float pt){
  if(pt<0.0)return 0.0;
  float t=uTime-pt;
  if(t<0.0||t>4.0)return 0.0;
  float r=t*uPulseSpeed;
  float d=distance(wp,pp);
  return smoothstep(3.0,0.0,abs(d-r))*smoothstep(4.0,0.0,t);
}

void main(){
  vNodeType=nodeType;
  vColor=nodeColor;
  vDistanceFromRoot=distanceFromRoot;
  vec3 wp=(modelMatrix*vec4(position,1.0)).xyz;
  vPosition=wp;
  float totalP=0.0;
  for(int i=0;i<3;i++) totalP+=getPulseIntensity(wp,uPulsePositions[i],uPulseTimes[i]);
  vPulseIntensity=min(totalP,1.0);
  float breathe=sin(uTime*0.7+distanceFromRoot*0.15)*0.15+0.85;
  float baseSize=nodeSize*breathe;
  float pulseSize=baseSize*(1.0+vPulseIntensity*2.5);
  vGlow=0.5+0.5*sin(uTime*0.5+distanceFromRoot*0.2);
  vec3 mp=position;
  if(nodeType>0.5){
    float n=snoise(position*0.08+uTime*0.08);
    mp+=normal*n*0.15;
  }
  vec4 mv=modelViewMatrix*vec4(mp,1.0);
  gl_PointSize=pulseSize*uBaseNodeSize*(1000.0/-mv.z);
  gl_Position=projectionMatrix*mv;
}`;

const NODE_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform vec3 uPulseColors[3];
varying vec3 vColor;
varying float vNodeType;
varying vec3 vPosition;
varying float vPulseIntensity;
varying float vDistanceFromRoot;
varying float vGlow;

void main(){
  vec2 c=2.0*gl_PointCoord-1.0;
  float dist=length(c);
  if(dist>1.0)discard;
  float g1=1.0-smoothstep(0.0,0.5,dist);
  float g2=1.0-smoothstep(0.0,1.0,dist);
  float gs=pow(g1,1.2)+g2*0.3;
  float bc=0.9+0.1*sin(uTime*0.6+vDistanceFromRoot*0.25);
  vec3 base=vColor*bc;
  vec3 fc=base;
  if(vPulseIntensity>0.0){
    vec3 pc=mix(vec3(1.0),uPulseColors[0],0.4);
    fc=mix(base,pc,vPulseIntensity*0.8);
    fc*=(1.0+vPulseIntensity*1.2);
    gs*=(1.0+vPulseIntensity);
  }
  float cb=smoothstep(0.4,0.0,dist);
  fc+=vec3(1.0)*cb*0.3;
  float alpha=gs*(0.95-0.3*dist);
  float cd=length(vPosition-cameraPosition);
  float df=smoothstep(100.0,15.0,cd);
  if(vNodeType>0.5){fc*=1.1;alpha*=0.9;}
  fc*=(1.0+vGlow*0.1);
  gl_FragColor=vec4(fc,alpha*df);
}`;

const CONNECTION_VERTEX = /* glsl */ `${NOISE_GLSL}
attribute vec3 startPoint;
attribute vec3 endPoint;
attribute float connectionStrength;
attribute float pathIndex;
attribute vec3 connectionColor;
uniform float uTime;
uniform vec3 uPulsePositions[3];
uniform float uPulseTimes[3];
uniform float uPulseSpeed;
varying vec3 vColor;
varying float vConnectionStrength;
varying float vPulseIntensity;
varying float vPathPosition;
varying float vDistanceFromCamera;

float getPulseIntensity(vec3 wp,vec3 pp,float pt){
  if(pt<0.0)return 0.0;
  float t=uTime-pt;
  if(t<0.0||t>4.0)return 0.0;
  float r=t*uPulseSpeed;
  float d=distance(wp,pp);
  return smoothstep(3.0,0.0,abs(d-r))*smoothstep(4.0,0.0,t);
}

void main(){
  float t=position.x;
  vPathPosition=t;
  vec3 mid=mix(startPoint,endPoint,0.5);
  float po=sin(t*3.14159)*0.15;
  vec3 perp=normalize(cross(normalize(endPoint-startPoint),vec3(0.0,1.0,0.0)));
  if(length(perp)<0.1)perp=vec3(1.0,0.0,0.0);
  mid+=perp*po;
  vec3 p0=mix(startPoint,mid,t);
  vec3 p1=mix(mid,endPoint,t);
  vec3 fp=mix(p0,p1,t);
  float n=snoise(vec3(pathIndex*0.08,t*0.6,uTime*0.15));
  fp+=perp*n*0.12;
  vec3 wp=(modelMatrix*vec4(fp,1.0)).xyz;
  float totalP=0.0;
  for(int i=0;i<3;i++) totalP+=getPulseIntensity(wp,uPulsePositions[i],uPulseTimes[i]);
  vPulseIntensity=min(totalP,1.0);
  vColor=connectionColor;
  vConnectionStrength=connectionStrength;
  vDistanceFromCamera=length(wp-cameraPosition);
  gl_Position=projectionMatrix*modelViewMatrix*vec4(fp,1.0);
}`;

const CONNECTION_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform vec3 uPulseColors[3];
varying vec3 vColor;
varying float vConnectionStrength;
varying float vPulseIntensity;
varying float vPathPosition;
varying float vDistanceFromCamera;

void main(){
  float f1=sin(vPathPosition*25.0-uTime*4.0)*0.5+0.5;
  float f2=sin(vPathPosition*15.0-uTime*2.5+1.57)*0.5+0.5;
  float cf=(f1+f2*0.5)/1.5;
  vec3 base=vColor*(0.8+0.2*sin(uTime*0.6+vPathPosition*12.0));
  float fi=0.4*cf*vConnectionStrength;
  vec3 fc=base;
  if(vPulseIntensity>0.0){
    vec3 pc=mix(vec3(1.0),uPulseColors[0],0.3);
    fc=mix(base,pc*1.2,vPulseIntensity*0.7);
    fi+=vPulseIntensity*0.8;
  }
  fc*=(0.7+fi+vConnectionStrength*0.5);
  float ba=0.7*vConnectionStrength;
  float fa=cf*0.3;
  float alpha=ba+fa;
  alpha=mix(alpha,min(1.0,alpha*2.5),vPulseIntensity);
  float df=smoothstep(100.0,15.0,vDistanceFromCamera);
  gl_FragColor=vec4(fc,alpha*df);
}`;

// ── Node / Network helpers ────────────────────────────────────────────
interface NetNode {
  position: THREE.Vector3;
  connections: { node: NetNode; strength: number }[];
  level: number;
  type: number;
  size: number;
  distanceFromRoot: number;
}

function createNode(pos: THREE.Vector3, level = 0, type = 0): NetNode {
  return {
    position: pos,
    connections: [],
    level,
    type,
    size:
      type === 0
        ? THREE.MathUtils.randFloat(0.8, 1.4)
        : THREE.MathUtils.randFloat(0.5, 1.0),
    distanceFromRoot: 0,
  };
}

function addConnection(a: NetNode, b: NetNode, strength: number) {
  if (a.connections.some((c) => c.node === b)) return;
  a.connections.push({ node: b, strength });
  b.connections.push({ node: a, strength });
}

function generateCrystallineSphere(density: number) {
  const nodes: NetNode[] = [];
  const root = createNode(new THREE.Vector3(0, 0, 0), 0, 0);
  root.size = 2.0;
  nodes.push(root);

  const layers = 5;
  const gr = (1 + Math.sqrt(5)) / 2;

  for (let layer = 1; layer <= layers; layer++) {
    const radius = layer * 4;
    const count = Math.floor(layer * 12 * density);
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = (2 * Math.PI * i) / gr;
      const pos = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
      );
      const isLeaf = layer === layers || Math.random() < 0.3;
      const node = createNode(pos, layer, isLeaf ? 1 : 0);
      node.distanceFromRoot = radius;
      nodes.push(node);

      if (layer > 1) {
        const prev = nodes
          .filter((n) => n.level === layer - 1 && n !== root)
          .sort(
            (a, b) => pos.distanceTo(a.position) - pos.distanceTo(b.position),
          );
        for (let j = 0; j < Math.min(3, prev.length); j++) {
          const d = pos.distanceTo(prev[j].position);
          addConnection(node, prev[j], Math.max(0.3, 1.0 - d / (radius * 2)));
        }
      } else {
        addConnection(root, node, 0.9);
      }
    }

    const layerNodes = nodes.filter((n) => n.level === layer && n !== root);
    for (const node of layerNodes) {
      const nearby = layerNodes
        .filter((n) => n !== node)
        .sort(
          (a, b) =>
            node.position.distanceTo(a.position) -
            node.position.distanceTo(b.position),
        )
        .slice(0, 5);
      for (const nn of nearby) {
        const d = node.position.distanceTo(nn.position);
        if (d < radius * 0.8) addConnection(node, nn, 0.6);
      }
    }
  }

  const outer = nodes.filter((n) => n.level >= 3);
  for (let i = 0; i < Math.min(20, outer.length); i++) {
    const n1 = outer[Math.floor(Math.random() * outer.length)];
    const n2 = outer[Math.floor(Math.random() * outer.length)];
    if (n1 !== n2 && Math.abs(n1.level - n2.level) > 1) {
      addConnection(n1, n2, 0.4);
    }
  }

  return nodes;
}

// ── Pulse uniforms shared between node + connection materials ─────────
function makePulseUniforms() {
  return {
    uTime: { value: 0.0 },
    uPulsePositions: {
      value: [
        new THREE.Vector3(1e3, 1e3, 1e3),
        new THREE.Vector3(1e3, 1e3, 1e3),
        new THREE.Vector3(1e3, 1e3, 1e3),
      ],
    },
    uPulseTimes: { value: [-1e3, -1e3, -1e3] },
    uPulseColors: {
      value: [
        new THREE.Color(1, 1, 1),
        new THREE.Color(1, 1, 1),
        new THREE.Color(1, 1, 1),
      ],
    },
    uPulseSpeed: { value: 18.0 },
    uBaseNodeSize: { value: 0.6 },
  };
}

// ── Starfield background ──────────────────────────────────────────────
function createStarfield(): THREE.Points {
  const count = 6000;
  const positions: number[] = [];
  const colors: number[] = [];
  const sizes: number[] = [];

  for (let i = 0; i < count; i++) {
    const r = THREE.MathUtils.randFloat(50, 150);
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
    const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
    positions.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    );
    const c = Math.random();
    if (c < 0.7) colors.push(1, 1, 1);
    else if (c < 0.85) colors.push(0.7, 0.8, 1);
    else colors.push(1, 0.9, 0.8);
    sizes.push(THREE.MathUtils.randFloat(0.1, 0.3));
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float uTime;
      void main(){
        vColor=color;
        vec4 mv=modelViewMatrix*vec4(position,1.0);
        float tw=sin(uTime*2.0+position.x*100.0)*0.3+0.7;
        gl_PointSize=size*tw*(300.0/-mv.z);
        gl_Position=projectionMatrix*mv;
      }`,
    fragmentShader: `
      varying vec3 vColor;
      void main(){
        vec2 c=gl_PointCoord-0.5;
        float d=length(c);
        if(d>0.5)discard;
        float a=1.0-smoothstep(0.0,0.5,d);
        gl_FragColor=vec4(vColor,a*0.8);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geo, mat);
}

// ── Build scene meshes from node graph ────────────────────────────────
function buildMeshes(nodes: NetNode[]) {
  const nodePositions: number[] = [];
  const nodeTypes: number[] = [];
  const nodeSizes: number[] = [];
  const nodeColors: number[] = [];
  const distances: number[] = [];

  for (const node of nodes) {
    nodePositions.push(node.position.x, node.position.y, node.position.z);
    nodeTypes.push(node.type);
    nodeSizes.push(node.size);
    distances.push(node.distanceFromRoot);
    const ci = Math.min(node.level, NODE_PALETTE.length - 1);
    const col = NODE_PALETTE[ci % NODE_PALETTE.length].clone();
    col.offsetHSL(
      THREE.MathUtils.randFloatSpread(0.03),
      THREE.MathUtils.randFloatSpread(0.08),
      THREE.MathUtils.randFloatSpread(0.08),
    );
    nodeColors.push(col.r, col.g, col.b);
  }

  const nodesGeo = new THREE.BufferGeometry();
  nodesGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(nodePositions, 3),
  );
  nodesGeo.setAttribute(
    "nodeType",
    new THREE.Float32BufferAttribute(nodeTypes, 1),
  );
  nodesGeo.setAttribute(
    "nodeSize",
    new THREE.Float32BufferAttribute(nodeSizes, 1),
  );
  nodesGeo.setAttribute(
    "nodeColor",
    new THREE.Float32BufferAttribute(nodeColors, 3),
  );
  nodesGeo.setAttribute(
    "distanceFromRoot",
    new THREE.Float32BufferAttribute(distances, 1),
  );

  const nodesMat = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(makePulseUniforms()),
    vertexShader: NODE_VERTEX,
    fragmentShader: NODE_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const nodesMesh = new THREE.Points(nodesGeo, nodesMat);

  // Connections
  const connPositions: number[] = [];
  const connStarts: number[] = [];
  const connEnds: number[] = [];
  const connStrengths: number[] = [];
  const connColors: number[] = [];
  const pathIndices: number[] = [];
  const seen = new Set<string>();
  let pathIdx = 0;

  for (let ni = 0; ni < nodes.length; ni++) {
    const node = nodes[ni];
    for (const conn of node.connections) {
      const ci = nodes.indexOf(conn.node);
      if (ci === -1) continue;
      const key = `${Math.min(ni, ci)}-${Math.max(ni, ci)}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const s = node.position;
      const e = conn.node.position;
      const segs = 20;
      for (let i = 0; i < segs; i++) {
        const t = i / (segs - 1);
        connPositions.push(t, 0, 0);
        connStarts.push(s.x, s.y, s.z);
        connEnds.push(e.x, e.y, e.z);
        pathIndices.push(pathIdx);
        connStrengths.push(conn.strength);

        const lvl = Math.min(
          Math.floor((node.level + conn.node.level) / 2),
          CONNECTION_PALETTE.length - 1,
        );
        const col = CONNECTION_PALETTE[lvl % CONNECTION_PALETTE.length].clone();
        col.offsetHSL(
          THREE.MathUtils.randFloatSpread(0.03),
          THREE.MathUtils.randFloatSpread(0.08),
          THREE.MathUtils.randFloatSpread(0.08),
        );
        connColors.push(col.r, col.g, col.b);
      }
      pathIdx++;
    }
  }

  const connGeo = new THREE.BufferGeometry();
  connGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(connPositions, 3),
  );
  connGeo.setAttribute(
    "startPoint",
    new THREE.Float32BufferAttribute(connStarts, 3),
  );
  connGeo.setAttribute(
    "endPoint",
    new THREE.Float32BufferAttribute(connEnds, 3),
  );
  connGeo.setAttribute(
    "connectionStrength",
    new THREE.Float32BufferAttribute(connStrengths, 1),
  );
  connGeo.setAttribute(
    "connectionColor",
    new THREE.Float32BufferAttribute(connColors, 3),
  );
  connGeo.setAttribute(
    "pathIndex",
    new THREE.Float32BufferAttribute(pathIndices, 1),
  );

  const connMat = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(makePulseUniforms()),
    vertexShader: CONNECTION_VERTEX,
    fragmentShader: CONNECTION_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const connectionsMesh = new THREE.LineSegments(connGeo, connMat);

  // Set pulse colors
  for (let i = 0; i < 3; i++) {
    nodesMat.uniforms.uPulseColors.value[i].copy(NODE_PALETTE[i]);
    connMat.uniforms.uPulseColors.value[i].copy(CONNECTION_PALETTE[i]);
  }

  return { nodesMesh, connectionsMesh };
}

// ── Component ─────────────────────────────────────────────────────────
interface NeuralNetworkBgProps {
  readonly className?: string;
}

export function NeuralNetworkBg({ className = "" }: NeuralNetworkBgProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 768;
    const density = isMobile ? 0.5 : 1.0;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.002);

    const camera = new THREE.PerspectiveCamera(
      65,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 8, 28);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      powerPreference: "high-performance",
      alpha: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050508);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.6;
    controls.minDistance = 8;
    controls.maxDistance = 80;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;
    controls.enablePan = false;
    controls.enableZoom = false;

    // Post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      1.8,
      0.6,
      0.7,
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    // Starfield
    const starField = createStarfield();
    scene.add(starField);

    // Neural network
    const nodes = generateCrystallineSphere(density);
    const { nodesMesh, connectionsMesh } = buildMeshes(nodes);
    scene.add(nodesMesh);
    scene.add(connectionsMesh);

    // Click → pulse
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hitPoint = new THREE.Vector3();
    let pulseIdx = 0;

    function triggerPulse(clientX: number, clientY: number) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      plane.normal.copy(camera.position).normalize();
      plane.constant =
        -plane.normal.dot(camera.position) + camera.position.length() * 0.5;
      if (raycaster.ray.intersectPlane(plane, hitPoint)) {
        const t = clock.getElapsedTime();
        pulseIdx = (pulseIdx + 1) % 3;
        const nm = nodesMesh.material as THREE.ShaderMaterial;
        const cm = connectionsMesh.material as THREE.ShaderMaterial;
        nm.uniforms.uPulsePositions.value[pulseIdx].copy(hitPoint);
        nm.uniforms.uPulseTimes.value[pulseIdx] = t;
        cm.uniforms.uPulsePositions.value[pulseIdx].copy(hitPoint);
        cm.uniforms.uPulseTimes.value[pulseIdx] = t;
        const rc =
          NODE_PALETTE[Math.floor(Math.random() * NODE_PALETTE.length)];
        nm.uniforms.uPulseColors.value[pulseIdx].copy(rc);
        cm.uniforms.uPulseColors.value[pulseIdx].copy(rc);
      }
    }

    function onClick(e: MouseEvent) {
      triggerPulse(e.clientX, e.clientY);
    }
    renderer.domElement.addEventListener("click", onClick);

    // Animate
    const clock = new THREE.Clock();
    let animId = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      const nm = nodesMesh.material as THREE.ShaderMaterial;
      const cm = connectionsMesh.material as THREE.ShaderMaterial;
      nm.uniforms.uTime.value = t;
      cm.uniforms.uTime.value = t;
      nodesMesh.rotation.y = Math.sin(t * 0.04) * 0.05;
      connectionsMesh.rotation.y = Math.sin(t * 0.04) * 0.05;

      starField.rotation.y += 0.0002;
      (starField.material as THREE.ShaderMaterial).uniforms.uTime.value = t;

      controls.update();
      composer.render();
    }
    animate();

    // Resize
    function onResize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloom.resolution.set(w, h);
    }
    window.addEventListener("resize", onResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("click", onClick);
      controls.dispose();

      // Dispose meshes
      nodesMesh.geometry.dispose();
      (nodesMesh.material as THREE.ShaderMaterial).dispose();
      connectionsMesh.geometry.dispose();
      (connectionsMesh.material as THREE.ShaderMaterial).dispose();
      starField.geometry.dispose();
      (starField.material as THREE.ShaderMaterial).dispose();

      renderer.dispose();
      composer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 ${className}`}
      style={{ cursor: "crosshair" }}
    />
  );
}
