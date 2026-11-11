import { useEffect, useRef, useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Droplets,
  Plus,
  Minus,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  CheckCircle2,
  Waves,
} from "lucide-react";
import { useWaterData } from "@/hooks/useWaterData";
import { useHabitsData } from "@/hooks/useHabitsData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

declare global {
  interface Window {
    THREE?: any;
  }
}

const THREE_CDN_URL = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";

function ensureThreeLoaded(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject();
  if (window.THREE) return Promise.resolve(window.THREE);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${THREE_CDN_URL}"]`
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(window.THREE));
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = THREE_CDN_URL;
    script.async = true;
    script.onload = () => resolve(window.THREE);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Gera textura radial realista para microbolhas esféricas (evita pontos quadrados)
function createBubbleTexture(THREE: any) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  // Corpo esférico translúcido com borda refrativa
  const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
  grad.addColorStop(0.0, "rgba(255, 255, 255, 0.05)");
  grad.addColorStop(0.55, "rgba(186, 230, 253, 0.22)");
  grad.addColorStop(0.85, "rgba(224, 242, 254, 0.75)");
  grad.addColorStop(1.0, "rgba(255, 255, 255, 0.0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(32, 32, 30, 0, Math.PI * 2);
  ctx.fill();

  // Ponto especular de luz na bolha
  const spec = ctx.createRadialGradient(22, 20, 0, 22, 20, 7);
  spec.addColorStop(0.0, "rgba(255, 255, 255, 0.95)");
  spec.addColorStop(1.0, "rgba(255, 255, 255, 0.0)");
  ctx.fillStyle = spec;
  ctx.beginPath();
  ctx.arc(22, 20, 7, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Gera serigrafia técnica de graduação volumétrica no vidro
function createScaleTexture(THREE: any) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, 512, 512);
  ctx.strokeStyle = "rgba(226, 232, 240, 0.42)";
  ctx.fillStyle = "rgba(226, 232, 240, 0.55)";
  ctx.font = "600 14px 'JetBrains Mono', monospace";
  ctx.textAlign = "left";

  const totalTicks = 20;
  for (let i = 1; i < totalTicks; i++) {
    const y = 512 - (i / totalTicks) * 512;
    const isMajor = i % 5 === 0;
    const tickW = isMajor ? 28 : 12;

    ctx.lineWidth = isMajor ? 2.2 : 1.2;
    ctx.beginPath();
    ctx.moveTo(230 - tickW / 2, y);
    ctx.lineTo(230 + tickW / 2, y);
    ctx.stroke();

    if (isMajor) {
      const pct = Math.round((i / totalTicks) * 100);
      ctx.fillText(`${pct}%`, 250, y + 4);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

// Cria um Environment Map HDR procedural de estúdio para reflexos reais no vidro e metal
function createStudioEnvMap(THREE: any, renderer: any) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x050811);

  // Softbox principal esquerdo (branco frio intenso para o reflexo vertical do vidro)
  const softbox1 = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 28),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
  );
  softbox1.position.set(-11, 2, 9);
  softbox1.lookAt(0, 0, 0);
  envScene.add(softbox1);

  // Softbox secundário direito (azul ciano suave)
  const softbox2 = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 24),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
  );
  softbox2.position.set(12, 0, 7);
  softbox2.lookAt(0, 0, 0);
  envScene.add(softbox2);

  // Rim light traseiro quente
  const rimStrip = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 22),
    new THREE.MeshBasicMaterial({ color: 0xe0f2fe, side: THREE.DoubleSide })
  );
  rimStrip.position.set(-5, 6, -10);
  rimStrip.lookAt(0, 0, 0);
  envScene.add(rimStrip);

  // Luz de teto difusa
  const topLight = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 18),
    new THREE.MeshBasicMaterial({ color: 0x94a3b8, side: THREE.DoubleSide })
  );
  topLight.position.set(0, 14, 0);
  topLight.lookAt(0, 0, 0);
  envScene.add(topLight);

  const envMap = pmremGenerator.fromScene(envScene, 0.035).texture;
  pmremGenerator.dispose();
  return envMap;
}

interface Props {
  selectedDate?: Date;
}

export function DailyWaterCard({ selectedDate = new Date() }: Props) {
  const { intakeMl, goalMl, logs, percentage, addWater, setGoalMl, resetDay } =
    useWaterData(selectedDate);
  const { habits, completions, isCompleted, toggleCompletion } = useHabitsData();

  const [showGoalConfig, setShowGoalConfig] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const [webglError, setWebglError] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const sceneControllerRef = useRef<{
    setTargetFill: (ratio: number) => void;
    triggerSplash: (intensity?: number) => void;
  } | null>(null);

  const linkedWaterHabit = useMemo(() => {
    return habits.find((h) => /([aá]gua|hidrat|water|3l|litro)/i.test(h.name));
  }, [habits]);

  const isLinkedHabitDone = useMemo(() => {
    if (!linkedWaterHabit) return false;
    return isCompleted(linkedWaterHabit.id, selectedDate);
  }, [linkedWaterHabit, isCompleted, selectedDate, completions]);

  const hydroStatus = useMemo(() => {
    if (percentage === 0) {
      return {
        label: "Seca Doomer",
        sub: "Células desidratadas. Injete o primeiro copo para ativar a câmara.",
        badgeClass: "bg-zinc-800/80 text-zinc-300 border-zinc-700",
      };
    }
    if (percentage < 50) {
      return {
        label: "Ignição Hidráulica",
        sub: "Fluxo iniciado. Mantenha a cadência para blindar a sinapse.",
        badgeClass: "bg-sky-500/15 text-sky-300 border-sky-500/30",
      };
    }
    if (percentage < 100) {
      return {
        label: "Pressão Estável",
        sub: "Foco operacional elevado. Falta pouco para a meta diária.",
        badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-400/40",
      };
    }
    return {
      label: "Aura Líquida · #Hydrated",
      sub: "100% da meta atingida. Volume celular e clareza mental no topo.",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-400/50",
    };
  }, [percentage]);

  // Inicialização da Cena PBR Realista em Three.js
  useEffect(() => {
    let isMounted = true;
    let animationFrameId: number;
    let renderer: any = null;
    let observer: IntersectionObserver | null = null;

    ensureThreeLoaded()
      .then((THREE) => {
        if (!isMounted || !canvasContainerRef.current || !canvasMountRef.current || !THREE) return;

        const container = canvasContainerRef.current;
        const mount = canvasMountRef.current;
        const width = mount.clientWidth || container.clientWidth || 220;
        const height = mount.clientHeight || container.clientHeight || 260;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
        camera.position.set(0, 0.12, 5.35);
        camera.lookAt(0, 0, 0);

        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.physicallyCorrectLights = true;

        mount.appendChild(renderer.domElement);

        // Aplica Environment Map HDR Procedural na cena inteira
        const envMap = createStudioEnvMap(THREE, renderer);
        scene.environment = envMap;

        const reactorGroup = new THREE.Group();
        scene.add(reactorGroup);

        // Iluminação física de estúdio
        const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.6);
        scene.add(ambientLight);

        const mainSpot = new THREE.DirectionalLight(0xffffff, 2.8);
        mainSpot.position.set(-4, 6, 5);
        scene.add(mainSpot);

        const cyanRim = new THREE.PointLight(0x0ea5e9, 6.5, 12, 2);
        cyanRim.position.set(3.2, -1.0, 3.0);
        scene.add(cyanRim);

        const bottomGlowLight = new THREE.PointLight(0x0284c7, 5.0, 6, 2);
        bottomGlowLight.position.set(0, -1.35, 0);
        reactorGroup.add(bottomGlowLight);

        const vesselHeight = 2.45;
        const vesselRadius = 0.82;

        // -------------------------------------------------------------
        // 1. HARDWARE USINADO (Tampas de Titânio Escovado + O-Rings)
        // -------------------------------------------------------------
        const metalMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          metalness: 0.92,
          roughness: 0.22,
          envMap,
          envMapIntensity: 1.4,
        });

        const chromeAccentMat = new THREE.MeshStandardMaterial({
          color: 0x64748b,
          metalness: 0.98,
          roughness: 0.12,
          envMap,
          envMapIntensity: 1.8,
        });

        const rubberSealMat = new THREE.MeshStandardMaterial({
          color: 0x090d16,
          metalness: 0.05,
          roughness: 0.85,
        });

        // Base CNC Multi-Step
        const bottomBaseMain = new THREE.Mesh(
          new THREE.CylinderGeometry(vesselRadius * 1.06, vesselRadius * 1.03, 0.18, 64),
          metalMat
        );
        bottomBaseMain.position.y = -vesselHeight / 2 - 0.08;
        reactorGroup.add(bottomBaseMain);

        const bottomBevel = new THREE.Mesh(
          new THREE.CylinderGeometry(vesselRadius * 1.01, vesselRadius * 1.06, 0.04, 64),
          chromeAccentMat
        );
        bottomBevel.position.y = -vesselHeight / 2 + 0.02;
        reactorGroup.add(bottomBevel);

        // O-Ring de vedação inferior
        const bottomORing = new THREE.Mesh(
          new THREE.TorusGeometry(vesselRadius * 0.98, 0.022, 16, 64),
          rubberSealMat
        );
        bottomORing.rotation.x = Math.PI / 2;
        bottomORing.position.y = -vesselHeight / 2 + 0.04;
        reactorGroup.add(bottomORing);

        // Difusor Óptico Emissivo Interno (ilumina a água por baixo)
        const diffuserMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.85,
        });
        const diffuserDisk = new THREE.Mesh(
          new THREE.CylinderGeometry(vesselRadius * 0.78, vesselRadius * 0.78, 0.02, 48),
          diffuserMat
        );
        diffuserDisk.position.y = -vesselHeight / 2 + 0.015;
        reactorGroup.add(diffuserDisk);

        // Tampa Superior CNC Multi-Step
        const topCapMain = new THREE.Mesh(
          new THREE.CylinderGeometry(vesselRadius * 1.02, vesselRadius * 1.06, 0.15, 64),
          metalMat
        );
        topCapMain.position.y = vesselHeight / 2 + 0.07;
        reactorGroup.add(topCapMain);

        const topCapCrown = new THREE.Mesh(
          new THREE.CylinderGeometry(vesselRadius * 0.68, vesselRadius * 0.74, 0.09, 48),
          chromeAccentMat
        );
        topCapCrown.position.y = vesselHeight / 2 + 0.18;
        reactorGroup.add(topCapCrown);

        const topORing = new THREE.Mesh(
          new THREE.TorusGeometry(vesselRadius * 0.98, 0.022, 16, 64),
          rubberSealMat
        );
        topORing.rotation.x = Math.PI / 2;
        topORing.position.y = vesselHeight / 2 - 0.02;
        reactorGroup.add(topORing);

        // -------------------------------------------------------------
        // 2. COLUNA DE ÁGUA REALISTA (PBR Shader: Beer-Lambert + Menisco + Normais Analíticas)
        // -------------------------------------------------------------
        const liquidRadius = vesselRadius * 0.945;
        const liquidGeo = new THREE.CylinderGeometry(
          liquidRadius,
          liquidRadius,
          vesselHeight,
          64,
          48,
          false
        );
        liquidGeo.translate(0, vesselHeight / 2, 0);

        const liquidUniforms = {
          uTime: { value: 0 },
          uFillRatio: { value: 0.5 },
          uWaveImpulse: { value: 0.0 },
          uTiltX: { value: 0.0 },
          uTiltZ: { value: 0.0 },
          uDeepColor: { value: new THREE.Color(0x032b44) },
          uShallowColor: { value: new THREE.Color(0x0284c7) },
          uScatterColor: { value: new THREE.Color(0x38bdf8) },
          uMeniscusColor: { value: new THREE.Color(0xe0f2fe) },
        };

        const liquidMat = new THREE.ShaderMaterial({
          uniforms: liquidUniforms,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
          vertexShader: `
            uniform float uTime;
            uniform float uFillRatio;
            uniform float uWaveImpulse;
            uniform float uTiltX;
            uniform float uTiltZ;

            varying vec3 vWorldPos;
            varying vec3 vViewPos;
            varying vec3 vNormal;
            varying vec3 vLocalPos;
            varying float vHeightNorm;
            varying float vRadialDist;

            // Calcula a elevação das ondas + inclinação + menisco capilar e retorna (altura, dH/dx, dH/dz)
            vec3 computeSurfaceWave(vec2 p, float strength) {
              float amp = (0.016 + uWaveImpulse * 0.075) * strength;

              float ph1 = p.x * 4.2 + p.y * 1.5 + uTime * 3.6;
              float ph2 = p.y * 4.8 - p.x * 2.1 - uTime * 2.9;
              float ph3 = (p.x * 7.5 + p.y * 7.5) + uTime * 5.4;

              float w1 = sin(ph1);
              float w2 = cos(ph2) * 0.7;
              float w3 = sin(ph3) * 0.28 * (0.4 + uWaveImpulse);

              // Derivadas analíticas para normais reais na superfície da água
              float dWdx = (4.2 * cos(ph1) + 2.1 * sin(ph2) * 0.7 + 7.5 * cos(ph3) * 0.28) * amp;
              float dWdz = (1.5 * cos(ph1) - 4.8 * sin(ph2) * 0.7 + 7.5 * cos(ph3) * 0.28) * amp;

              // Compensação gravitacional ao inclinar o cilindro
              float tiltOffset = (p.x * uTiltZ - p.y * uTiltX) * 0.48 * strength;
              dWdx += uTiltZ * 0.48 * strength;
              dWdz -= uTiltX * 0.48 * strength;

              // Menisco côncavo por tensão superficial perto da parede do vidro
              float rNorm = clamp(length(p) / 0.775, 0.0, 1.0);
              float meniscus = pow(rNorm, 5.0) * 0.038 * strength;
              if (rNorm > 0.001) {
                vec2 rDir = normalize(p);
                float dMdr = 5.0 * pow(rNorm, 4.0) * (0.038 / 0.775) * strength;
                dWdx += rDir.x * dMdr;
                dWdz += rDir.y * dMdr;
              }

              float h = (w1 + w2 + w3) * amp + tiltOffset + meniscus;
              return vec3(h, dWdx, dWdz);
            }

            void main() {
              vec3 pos = position;
              vHeightNorm = clamp(pos.y / 2.45, 0.0, 1.0);
              vRadialDist = clamp(length(pos.xz) / 0.775, 0.0, 1.0);

              // Escala vertical pelo preenchimento real (evita distorcer o menisco)
              float fillHeight = max(0.04, uFillRatio) * 2.45;
              pos.y = vHeightNorm * fillHeight;

              float surfaceInfluence = smoothstep(0.15, 1.0, vHeightNorm);
              vec3 wave = computeSurfaceWave(pos.xz, surfaceInfluence);
              pos.y += wave.x;

              // Reconstrói a normal física na tampa superior e nas laterais
              vec3 localNormal = normal;
              if (normal.y > 0.5) {
                localNormal = normalize(vec3(-wave.y, 1.0, -wave.z));
              } else if (normal.y > -0.5) {
                localNormal = normalize(vec3(normal.x, -wave.y * 0.25, normal.z));
              }

              vLocalPos = pos;
              vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
              vWorldPos = worldPosition.xyz;
              vec4 mvPosition = viewMatrix * worldPosition;
              vViewPos = -mvPosition.xyz;
              vNormal = normalize(normalMatrix * localNormal);

              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            uniform float uTime;
            uniform float uFillRatio;
            uniform float uWaveImpulse;
            uniform vec3 uDeepColor;
            uniform vec3 uShallowColor;
            uniform vec3 uScatterColor;
            uniform vec3 uMeniscusColor;

            varying vec3 vWorldPos;
            varying vec3 vViewPos;
            varying vec3 vNormal;
            varying vec3 vLocalPos;
            varying float vHeightNorm;
            varying float vRadialDist;

            // Padrão de cáusticas ópticas dentro do fluido
            float causticsPattern(vec3 p, float t) {
              vec2 uv = p.xz * 3.8;
              float c1 = sin(uv.x * 2.4 + t * 2.1 + cos(uv.y * 2.7 - t * 1.6));
              float c2 = cos(uv.y * 3.1 - t * 1.8 + sin(uv.x * 2.2 + t * 2.4));
              float v = abs(c1 + c2);
              return pow(clamp(1.0 - v * 0.45, 0.0, 1.0), 3.5);
            }

            void main() {
              vec3 N = normalize(gl_FrontFacing ? vNormal : -vNormal);
              vec3 V = normalize(vViewPos);

              // Schlick Fresnel físico da água (IOR ~1.333 => F0 = 0.02)
              float NoV = clamp(dot(N, V), 0.0, 1.0);
              float fresnel = 0.02 + 0.98 * pow(1.0 - NoV, 4.2);

              // Absorção de Beer-Lambert (mais denso no centro/fundo, mais translúcido na superfície)
              float opticalDepth = (1.0 - vHeightNorm * 0.75) * (1.15 - vRadialDist * 0.35);
              vec3 waterCol = mix(uShallowColor, uDeepColor, clamp(opticalDepth, 0.0, 1.0));

              // Subsurface Scattering (luz do difusor na base e bordas iluminadas)
              float bottomGlow = exp(-vHeightNorm * 3.2) * 0.55;
              float edgeScatter = pow(1.0 - NoV, 2.2) * 0.48;
              waterCol += uScatterColor * (bottomGlow + edgeScatter);

              // Cáusticas dinâmicas mais visíveis na superfície e perto da base iluminada
              float caustics = causticsPattern(vLocalPos, uTime);
              waterCol += uScatterColor * caustics * (0.18 + 0.25 * vHeightNorm);

              // Iluminação especular dupla (Softbox de estúdio + Rim Light)
              vec3 L1 = normalize(vec3(-0.6, 0.75, 0.8));
              vec3 H1 = normalize(L1 + V);
              float spec1 = pow(max(dot(N, H1), 0.0), 96.0);

              vec3 L2 = normalize(vec3(0.7, 0.3, 0.6));
              vec3 H2 = normalize(L2 + V);
              float spec2 = pow(max(dot(N, H2), 0.0), 48.0);

              // Reflexo de ambiente simulado no topo do líquido
              vec3 R = reflect(-V, N);
              float skyGrad = smoothstep(-0.2, 0.9, R.y);
              vec3 envReflection = mix(uDeepColor, vec3(0.88, 0.96, 1.0), skyGrad);

              vec3 finalColor = mix(waterCol, envReflection, fresnel * 0.55);
              finalColor += vec3(1.0) * spec1 * 0.9 + uScatterColor * spec2 * 0.45;

              // Filete luminoso do Menisco (tensão superficial na parede do cilindro)
              float meniscusBand = smoothstep(0.965, 0.998, vHeightNorm) * smoothstep(0.72, 0.99, vRadialDist);
              finalColor = mix(finalColor, uMeniscusColor, meniscusBand * 0.88);

              // Topo da água ligeiramente mais reflexivo e opaco nas bordas
              float alpha = clamp(0.74 + fresnel * 0.22 + meniscusBand * 0.2, 0.0, 0.96);

              gl_FragColor = vec4(finalColor, alpha);
            }
          `,
        });

        const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
        liquidMesh.position.y = -vesselHeight / 2;
        liquidMesh.renderOrder = 2;
        reactorGroup.add(liquidMesh);

        // -------------------------------------------------------------
        // 3. MICROBOLHAS ESFÉRICAS DE AERAÇÃO (Com Textura Radial Esférica)
        // -------------------------------------------------------------
        const bubbleCount = 55;
        const bubblePositions = new Float32Array(bubbleCount * 3);
        const bubbleSpeeds = new Float32Array(bubbleCount);
        const bubblePhases = new Float32Array(bubbleCount);
        const bubbleBaseR = new Float32Array(bubbleCount);

        for (let i = 0; i < bubbleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.pow(Math.random(), 0.7) * (liquidRadius * 0.85);
          bubblePositions[i * 3] = Math.cos(angle) * r;
          bubblePositions[i * 3 + 1] = Math.random() * vesselHeight;
          bubblePositions[i * 3 + 2] = Math.sin(angle) * r;
          bubbleSpeeds[i] = 0.004 + Math.random() * 0.011;
          bubblePhases[i] = Math.random() * Math.PI * 2;
          bubbleBaseR[i] = r;
        }

        const bubbleGeo = new THREE.BufferGeometry();
        bubbleGeo.setAttribute("position", new THREE.BufferAttribute(bubblePositions, 3));

        const bubbleTexture = createBubbleTexture(THREE);
        const bubbleMat = new THREE.PointsMaterial({
          map: bubbleTexture,
          color: 0xe0f2fe,
          size: 0.09,
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });

        const bubblePoints = new THREE.Points(bubbleGeo, bubbleMat);
        bubblePoints.position.y = -vesselHeight / 2;
        bubblePoints.renderOrder = 3;
        reactorGroup.add(bubblePoints);

        // -------------------------------------------------------------
        // 4. VIDRO BOROSSILICATO DE PAREDE DUPLA + SERIGRAFIA A LASER
        // -------------------------------------------------------------
        // Parede interna sutil
        const innerGlassGeo = new THREE.CylinderGeometry(
          vesselRadius * 0.96,
          vesselRadius * 0.96,
          vesselHeight,
          64,
          1,
          true
        );
        const innerGlassMat = new THREE.MeshPhysicalMaterial({
          color: 0xe0f2fe,
          transparent: true,
          opacity: 0.07,
          roughness: 0.05,
          metalness: 0.0,
          envMap,
          envMapIntensity: 0.9,
          side: THREE.BackSide,
          depthWrite: false,
        });
        const innerGlassMesh = new THREE.Mesh(innerGlassGeo, innerGlassMat);
        innerGlassMesh.renderOrder = 1;
        reactorGroup.add(innerGlassMesh);

        // Parede externa com Fresnel e reflexos de estúdio (Softbox Streaks)
        const outerGlassGeo = new THREE.CylinderGeometry(
          vesselRadius,
          vesselRadius,
          vesselHeight,
          64,
          1,
          true
        );
        const outerGlassMat = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.18,
          roughness: 0.04,
          metalness: 0.05,
          reflectivity: 1.0,
          clearcoat: 1.0,
          clearcoatRoughness: 0.03,
          envMap,
          envMapIntensity: 2.2,
          side: THREE.FrontSide,
          depthWrite: false,
        });
        const outerGlassMesh = new THREE.Mesh(outerGlassGeo, outerGlassMat);
        outerGlassMesh.renderOrder = 4;
        reactorGroup.add(outerGlassMesh);

        // Escala volumétrica gravada a laser na superfície frontal do vidro
        const scaleTexture = createScaleTexture(THREE);
        const scaleGeo = new THREE.CylinderGeometry(
          vesselRadius * 1.002,
          vesselRadius * 1.002,
          vesselHeight * 0.88,
          64,
          1,
          true,
          -Math.PI * 0.35,
          Math.PI * 0.7
        );
        const scaleMat = new THREE.MeshBasicMaterial({
          map: scaleTexture,
          transparent: true,
          opacity: 0.75,
          depthWrite: false,
        });
        const scaleMesh = new THREE.Mesh(scaleGeo, scaleMat);
        scaleMesh.renderOrder = 5;
        reactorGroup.add(scaleMesh);

        // -------------------------------------------------------------
        // 5. ANIMAÇÃO E INTERAÇÃO FÍSICA (Inércia + Gravidade)
        // -------------------------------------------------------------
        let currentFill = Math.max(0.02, Math.min(1, intakeMl / Math.max(1, goalMl)));
        let targetFill = currentFill;
        let waveImpulse = 0.25;
        let pointerX = 0;
        let pointerY = 0;
        let isVisible = true;
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        sceneControllerRef.current = {
          setTargetFill: (ratio: number) => {
            targetFill = Math.max(0.02, Math.min(1, ratio));
          },
          triggerSplash: (intensity = 1.0) => {
            waveImpulse = Math.min(1.8, waveImpulse + intensity);
          },
        };

        const onPointerMove = (e: PointerEvent) => {
          const rect = container.getBoundingClientRect();
          const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
          pointerX = Math.max(-1, Math.min(1, nx));
          pointerY = Math.max(-1, Math.min(1, ny));
        };

        const onPointerLeave = () => {
          pointerX = 0;
          pointerY = 0;
        };

        container.addEventListener("pointermove", onPointerMove);
        container.addEventListener("pointerleave", onPointerLeave);

        observer = new IntersectionObserver(
          (entries) => {
            isVisible = entries[0]?.isIntersecting ?? true;
          },
          { threshold: 0.05 }
        );
        observer.observe(container);

        const animate = () => {
          animationFrameId = requestAnimationFrame(animate);
          if (!isVisible || document.hidden) return;

          const step = prefersReducedMotion ? 0.15 : 0.055;
          currentFill += (targetFill - currentFill) * step;
          waveImpulse *= 0.96;

          const dt = prefersReducedMotion ? 0.005 : 0.018;
          liquidUniforms.uTime.value += dt;
          liquidUniforms.uFillRatio.value = currentFill;
          liquidUniforms.uWaveImpulse.value = waveImpulse;

          // Inclinação com inércia física
          const targetRotZ = -pointerX * 0.2;
          const targetRotX = pointerY * 0.14;
          const prevRotZ = reactorGroup.rotation.z;
          reactorGroup.rotation.z += (targetRotZ - reactorGroup.rotation.z) * 0.075;
          reactorGroup.rotation.x += (targetRotX - reactorGroup.rotation.x) * 0.075;

          // Movimento angular do cilindro gera turbulência real no líquido
          const angularVel = Math.abs(reactorGroup.rotation.z - prevRotZ);
          waveImpulse = Math.min(1.8, waveImpulse + angularVel * 3.5);

          liquidUniforms.uTiltZ.value = reactorGroup.rotation.z;
          liquidUniforms.uTiltX.value = reactorGroup.rotation.x;

          // Transição cromática sutil e realista em 100% (Bioluminescência Ciano/Turquesa)
          if (currentFill >= 0.99) {
            liquidUniforms.uShallowColor.value.setHex(0x0891b2);
            liquidUniforms.uScatterColor.value.setHex(0x22d3ee);
            liquidUniforms.uMeniscusColor.value.setHex(0xfef08a);
            diffuserMat.color.setHex(0x22d3ee);
            bottomGlowLight.color.setHex(0x06b6d4);
          } else {
            liquidUniforms.uShallowColor.value.setHex(0x0284c7);
            liquidUniforms.uScatterColor.value.setHex(0x38bdf8);
            liquidUniforms.uMeniscusColor.value.setHex(0xe0f2fe);
            diffuserMat.color.setHex(0x38bdf8);
            bottomGlowLight.color.setHex(0x0284c7);
          }

          // Atualização helicoidal das microbolhas dentro da coluna de água
          const maxBubbleY = Math.max(0.08, currentFill * vesselHeight - 0.05);
          const posAttr = bubbleGeo.getAttribute("position");
          const t = liquidUniforms.uTime.value;

          for (let i = 0; i < bubbleCount; i++) {
            let by = posAttr.getY(i) + bubbleSpeeds[i] * (1 + waveImpulse * 2.2);
            if (by > maxBubbleY) {
              by = 0.02;
            }
            const wobble = Math.sin(t * 3.0 + bubblePhases[i] + by * 4.0) * 0.018;
            const angle = bubblePhases[i] + t * 0.35;
            const r = Math.min(liquidRadius * 0.85, bubbleBaseR[i]);

            posAttr.setXYZ(i, Math.cos(angle) * r + wobble, by, Math.sin(angle) * r + wobble);
          }
          posAttr.needsUpdate = true;
          bubbleMat.opacity = currentFill > 0.05 ? 0.82 : 0.12;

          renderer.render(scene, camera);
        };

        setWebglReady(true);
        animate();

        const onResize = () => {
          if (!container || !mount || !renderer) return;
          const w = mount.clientWidth || container.clientWidth || 220;
          const h = mount.clientHeight || container.clientHeight || 260;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener("resize", onResize);

        return () => {
          window.removeEventListener("resize", onResize);
          container.removeEventListener("pointermove", onPointerMove);
          container.removeEventListener("pointerleave", onPointerLeave);
        };
      })
      .catch(() => {
        if (isMounted) setWebglError(true);
      });

    return () => {
      isMounted = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (observer) observer.disconnect();
      if (renderer) {
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        if (renderer.dispose) renderer.dispose();
      }
    };
  }, []);

  useEffect(() => {
    const ratio = goalMl > 0 ? intakeMl / goalMl : 0;
    sceneControllerRef.current?.setTargetFill(ratio);
  }, [intakeMl, goalMl]);

  const handleInjectWater = (amount: number) => {
    const prevPct = percentage;
    addWater(amount);
    sceneControllerRef.current?.triggerSplash(amount >= 500 ? 1.35 : 0.85);

    const nextIntake = Math.max(0, intakeMl + amount);
    const nextPct = goalMl > 0 ? Math.round((nextIntake / goalMl) * 100) : 0;

    if (amount > 0) {
      if (prevPct < 100 && nextPct >= 100) {
        toast.success("META HIDRÁULICA ATINGIDA! #Hydrated desbloqueado.");
        if (linkedWaterHabit && !isLinkedHabitDone) {
          toggleCompletion(linkedWaterHabit.id, selectedDate);
          toast.success(`Hábito "${linkedWaterHabit.name}" marcado automaticamente!`);
        }
      } else {
        toast.success(`+${amount} ml injetados no sistema.`);
      }
    }
  };

  const remainingMl = Math.max(0, goalMl - intakeMl);

  return (
    <div className="surface-card p-5 sm:p-6 flex flex-col justify-between space-y-5 relative overflow-hidden">
      {/* Header do Card */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg tracking-tight">Reator de Hidratação</h2>
              <span
                className={cn(
                  "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold",
                  hydroStatus.badgeClass
                )}
              >
                {hydroStatus.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground capitalize">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowGoalConfig((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/40 text-muted-foreground hover:text-foreground transition-colors cursor-pointer min-h-[36px]"
            title="Calibrar meta diária de água"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Meta: {(goalMl / 1000).toFixed(2).replace(/\.?0+$/, "")}L</span>
          </button>
        </div>
      </div>

      {/* Painel de Calibração de Meta */}
      {showGoalConfig && (
        <div className="p-3.5 rounded-xl bg-secondary/40 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs">
            <span className="font-mono font-semibold text-cyan-300 block">
              CALIBRAR META DIÁRIA DE HIDRATAÇÃO
            </span>
            <span className="text-muted-foreground text-[11px]">
              Ajuste conforme seu peso corporal e intensidade de treino (2.0L a 5.0L).
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {[2000, 2500, 3000, 3500, 4000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setGoalMl(preset);
                  setShowGoalConfig(false);
                  toast.success(`Meta calibrada para ${preset} ml.`);
                }}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-mono border transition-all cursor-pointer min-h-[34px]",
                  goalMl === preset
                    ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
                    : "bg-surface hover:bg-secondary text-muted-foreground border-border/50"
                )}
              >
                {(preset / 1000).toFixed(1)}L
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid Principal */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
        {/* Coluna do Canvas WebGL 3D (5 colunas) */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center relative">
          <div
            ref={canvasContainerRef}
            onClick={() => sceneControllerRef.current?.triggerSplash(1.1)}
            className="w-full h-[250px] rounded-2xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/90 via-slate-950 to-black border border-cyan-500/20 flex items-center justify-center cursor-grab active:cursor-grabbing relative overflow-hidden select-none shadow-inner"
            title="Arraste para inclinar o reator ou clique para agitar a água"
          >
            <div ref={canvasMountRef} className="absolute inset-0 w-full h-full" />

            {!webglReady && !webglError && (
              <div className="text-xs font-mono text-muted-foreground flex items-center gap-2 relative z-10 pointer-events-none">
                <Waves className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>Inicializando Câmara PBR...</span>
              </div>
            )}
            {webglError && (
              <div className="p-4 text-center space-y-2 relative z-10">
                <Droplets className="w-8 h-8 text-cyan-400 mx-auto" />
                <div className="font-mono text-lg font-bold text-cyan-300">{percentage}%</div>
                <p className="text-[11px] text-muted-foreground">
                  Modo de contingência 2D ativo ({intakeMl} / {goalMl} ml).
                </p>
              </div>
            )}
          </div>

          <span className="text-[10px] font-mono text-muted-foreground mt-1.5 text-center">
            Interaja com o mouse no cilindro 3D para inclinar o fluido
          </span>
        </div>

        {/* Coluna de Telemetria + Ações Táticas (7 colunas) */}
        <div className="sm:col-span-7 flex flex-col justify-between space-y-4">
          <div className="p-4 rounded-xl bg-surface border border-border/40 space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <span className="font-display text-2xl sm:text-3xl tracking-tight text-foreground">
                  {intakeMl}
                </span>
                <span className="font-mono text-xs text-muted-foreground ml-1.5">
                  / {goalMl} ml
                </span>
              </div>
              <span
                className={cn(
                  "font-mono text-base font-bold",
                  percentage >= 100 ? "text-amber-400" : "text-cyan-400"
                )}
              >
                {percentage}%
              </span>
            </div>

            <div className="w-full bg-secondary/60 rounded-full h-2 overflow-hidden border border-border/30">
              <div
                className={cn(
                  "h-full transition-all duration-500 rounded-full",
                  percentage >= 100
                    ? "bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-400"
                    : "bg-gradient-to-r from-sky-600 to-cyan-400"
                )}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-0.5">
              <span>
                {remainingMl > 0
                  ? `Faltam ${remainingMl} ml para blindar o dia`
                  : `Superávit de +${intakeMl - goalMl} ml atingido`}
              </span>
              {logs.length > 0 && <span>Último: {logs[0].timestamp}</span>}
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">{hydroStatus.sub}</p>

          <div className="grid grid-cols-3 gap-2.5">
            <Button
              type="button"
              onClick={() => handleInjectWater(250)}
              className="h-11 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-mono text-xs flex flex-col items-center justify-center gap-0.5 cursor-pointer"
            >
              <span className="font-bold flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> 250 ml
              </span>
              <span className="text-[10px] opacity-75">Copo</span>
            </Button>

            <Button
              type="button"
              onClick={() => handleInjectWater(500)}
              className="h-11 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 font-mono text-xs flex flex-col items-center justify-center gap-0.5 cursor-pointer"
            >
              <span className="font-bold flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> 500 ml
              </span>
              <span className="text-[10px] opacity-80">Garrafa</span>
            </Button>

            <Button
              type="button"
              onClick={() => handleInjectWater(750)}
              className="h-11 bg-sky-500/25 hover:bg-sky-500/35 text-white border border-sky-400/50 font-mono text-xs flex flex-col items-center justify-center gap-0.5 cursor-pointer"
            >
              <span className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> 750 ml
              </span>
              <span className="text-[10px] opacity-85">Shaker</span>
            </Button>
          </div>

          <div className="pt-2 border-t border-border/30 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleInjectWater(-250)}
                disabled={intakeMl === 0}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-40 font-mono text-[11px] transition-colors cursor-pointer"
                title="Remover 250 ml"
              >
                <Minus className="w-3 h-3" /> 250 ml
              </button>

              {intakeMl > 0 && (
                <button
                  type="button"
                  onClick={resetDay}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary/40 hover:bg-destructive/20 text-muted-foreground hover:text-destructive font-mono text-[11px] transition-colors cursor-pointer"
                  title="Zerar registros deste dia"
                >
                  <RotateCcw className="w-3 h-3" /> Zerar
                </button>
              )}
            </div>

            {linkedWaterHabit ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-md border",
                  isLinkedHabitDone
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-secondary/50 text-muted-foreground border-border/40"
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  Vínculo: {linkedWaterHabit.name} ({isLinkedHabitDone ? "Feito" : "Auto 100%"})
                </span>
              </span>
            ) : (
              <span className="text-[11px] font-mono text-muted-foreground">
                {logs.length} dose{logs.length !== 1 ? "s" : ""} registrada{logs.length !== 1 ? "s" : ""} hoje
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
