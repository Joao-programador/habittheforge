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
const GLTF_LOADER_URL = "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js";
const GIGACHAD_GLB_PATH = "/models/gigachad_vessel.glb";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (existing) {
      if ((existing as any).__loaded) return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      (script as any).__loaded = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function ensureThreeAndGLTFLoaded(): Promise<any> {
  if (typeof window === "undefined") throw new Error("SSR");
  if (!window.THREE) {
    await loadScript(THREE_CDN_URL);
  }
  if (!window.THREE.GLTFLoader) {
    await loadScript(GLTF_LOADER_URL);
  }
  return window.THREE;
}

function createBubbleTexture(THREE: any) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
  grad.addColorStop(0.0, "rgba(255, 255, 255, 0.05)");
  grad.addColorStop(0.55, "rgba(186, 230, 253, 0.25)");
  grad.addColorStop(0.85, "rgba(224, 242, 254, 0.85)");
  grad.addColorStop(1.0, "rgba(255, 255, 255, 0.0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(32, 32, 30, 0, Math.PI * 2);
  ctx.fill();

  const spec = ctx.createRadialGradient(22, 20, 0, 22, 20, 7);
  spec.addColorStop(0.0, "rgba(255, 255, 255, 0.98)");
  spec.addColorStop(1.0, "rgba(255, 255, 255, 0.0)");
  ctx.fillStyle = spec;
  ctx.beginPath();
  ctx.arc(22, 20, 7, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
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
        sub: "Corpo desidratado. Injete o primeiro copo para iniciar a ascensão celular.",
        badgeClass: "bg-zinc-800/80 text-zinc-300 border-zinc-700",
      };
    }
    if (percentage < 50) {
      return {
        label: "Ignição Muscular",
        sub: "Fluxo subindo pelos membros inferiores e core. Mantenha a cadência.",
        badgeClass: "bg-sky-500/15 text-sky-300 border-sky-500/30",
      };
    }
    if (percentage < 100) {
      return {
        label: "Pressão GigaChad",
        sub: "Peitoral e ombros energizados. Falta pouco para blindar a meta.",
        badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-400/40",
      };
    }
    return {
      label: "GigaChad · #Hydrated",
      sub: "100% da meta atingida. Hidratação máxima do topo do crânio aos pés.",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-400/50",
    };
  }, [percentage]);

  useEffect(() => {
    let isMounted = true;
    let animationFrameId: number;
    let renderer: any = null;
    let observer: IntersectionObserver | null = null;

    ensureThreeAndGLTFLoaded()
      .then((THREE) => {
        if (!isMounted || !canvasContainerRef.current || !canvasMountRef.current || !THREE) return;

        const container = canvasContainerRef.current;
        const mount = canvasMountRef.current;
        const width = mount.clientWidth || container.clientWidth || 220;
        const height = mount.clientHeight || container.clientHeight || 270;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
        camera.position.set(0, 0.05, 4.85);
        camera.lookAt(0, 0, 0);

        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        renderer.outputEncoding = THREE.sRGBEncoding;

        // Limpa com segurança nós filhos anteriores para evitar duplicações
        while (mount.firstChild) {
          mount.removeChild(mount.firstChild);
        }
        mount.appendChild(renderer.domElement);

        const reactorGroup = new THREE.Group();
        scene.add(reactorGroup);

        // Iluminação dramática de estúdio anatômico
        const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.75);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 2.3);
        keyLight.position.set(-3, 5, 4);
        scene.add(keyLight);

        const rimLight = new THREE.PointLight(0x38bdf8, 3.8, 12);
        rimLight.position.set(3, 1.5, -2.5);
        scene.add(rimLight);

        const fillLight = new THREE.PointLight(0x0284c7, 1.6, 8);
        fillLight.position.set(0, -1.8, 2);
        scene.add(fillLight);

        const modelHeight = 2.45;
        const baseOffsetY = -modelHeight / 2;

        // Pedestal Tático Metálico com Anel Emissivo sob os pés do GigaChad
        const pedestalGeo = new THREE.CylinderGeometry(0.72, 0.80, 0.12, 48);
        const pedestalMat = new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          metalness: 0.9,
          roughness: 0.22,
        });
        const pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMat);
        pedestalMesh.position.y = baseOffsetY - 0.06;
        reactorGroup.add(pedestalMesh);

        const ringGeo = new THREE.TorusGeometry(0.70, 0.018, 16, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.9,
        });
        const baseRing = new THREE.Mesh(ringGeo, ringMat);
        baseRing.rotation.x = Math.PI / 2;
        baseRing.position.y = baseOffsetY + 0.005;
        reactorGroup.add(baseRing);

        // Uniforms compartilhados entre Casca de Vidro Raio-X e Volume de Água Muscular
        const sharedUniforms = {
          uTime: { value: 0 },
          uFillRatio: { value: Math.max(0.02, Math.min(1, intakeMl / Math.max(1, goalMl))) },
          uWaveImpulse: { value: 0.25 },
          uTiltX: { value: 0.0 },
          uTiltZ: { value: 0.0 },
          uModelHeight: { value: modelHeight },
          uDeepColor: { value: new THREE.Color(0x032b44) },
          uShallowColor: { value: new THREE.Color(0x0284c7) },
          uScatterColor: { value: new THREE.Color(0x38bdf8) },
          uMeniscusColor: { value: new THREE.Color(0xe0f2fe) },
          uGlassColor: { value: new THREE.Color(0x94a3b8) },
        };

        // -------------------------------------------------------------
        // SHADER 1: CASCA EXTERNA DE VIDRO BOROSSILICATO & RAIO-X ANATÔMICO
        // -------------------------------------------------------------
        const xRayGlassMat = new THREE.ShaderMaterial({
          uniforms: sharedUniforms,
          transparent: true,
          depthWrite: false,
          side: THREE.FrontSide,
          vertexShader: `
            attribute vec4 color;
            varying vec3 vNormal;
            varying vec3 vViewPos;
            varying vec3 vLocalPos;
            varying vec4 vAnatomy;

            void main() {
              vLocalPos = position;
              vAnatomy = color;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              vViewPos = -mvPosition.xyz;
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            uniform float uFillRatio;
            uniform float uModelHeight;
            uniform vec3 uGlassColor;
            uniform vec3 uScatterColor;

            varying vec3 vNormal;
            varying vec3 vViewPos;
            varying vec3 vLocalPos;
            varying vec4 vAnatomy;

            void main() {
              vec3 N = normalize(vNormal);
              vec3 V = normalize(vViewPos);
              float NoV = clamp(dot(N, V), 0.0, 1.0);

              // Fresnel de vidro esculpido + relevo muscular gravado em vAnatomy.r
              float fresnel = pow(1.0 - NoV, 2.6);
              float muscleDefinition = clamp(vAnatomy.r, 0.0, 1.0);

              // Iluminação especular de estúdio sobre a musculatura de vidro
              vec3 L1 = normalize(vec3(-0.6, 0.8, 0.7));
              vec3 H1 = normalize(L1 + V);
              float spec = pow(max(dot(N, H1), 0.0), 64.0) * (0.4 + 0.6 * muscleDefinition);

              vec3 col = mix(vec3(0.08, 0.13, 0.22), uGlassColor, muscleDefinition * 0.65 + fresnel * 0.5);
              col += vec3(0.85, 0.95, 1.0) * spec * 0.75;
              col += uScatterColor * fresnel * 0.35;

              // Acima da água o vidro fica mais visível (Raio-X seco); abaixo da água é uma película fina
              float hNorm = clamp(vLocalPos.y / uModelHeight, 0.0, 1.0);
              float isAboveWater = smoothstep(uFillRatio - 0.02, uFillRatio + 0.02, hNorm);
              float alpha = mix(0.18 + fresnel * 0.28, 0.26 + fresnel * 0.42 + (1.0 - muscleDefinition) * 0.15, isAboveWater);

              gl_FragColor = vec4(col, clamp(alpha, 0.08, 0.78));
            }
          `,
        });

        // -------------------------------------------------------------
        // SHADER 2: VOLUME MUSCULAR DE ÁGUA (CLIPPING + ONDAS + MENISCO)
        // -------------------------------------------------------------
        const muscleLiquidMat = new THREE.ShaderMaterial({
          uniforms: sharedUniforms,
          transparent: true,
          side: THREE.DoubleSide,
          vertexShader: `
            attribute vec4 color;
            varying vec3 vNormal;
            varying vec3 vViewPos;
            varying vec3 vLocalPos;
            varying vec4 vAnatomy;

            void main() {
              vec3 displaced = position - normal * 0.003;
              vLocalPos = displaced;
              vAnatomy = color;
              vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
              vViewPos = -mvPosition.xyz;
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            uniform float uTime;
            uniform float uFillRatio;
            uniform float uWaveImpulse;
            uniform float uTiltX;
            uniform float uTiltZ;
            uniform float uModelHeight;
            uniform vec3 uDeepColor;
            uniform vec3 uShallowColor;
            uniform vec3 uScatterColor;
            uniform vec3 uMeniscusColor;

            varying vec3 vNormal;
            varying vec3 vViewPos;
            varying vec3 vLocalPos;
            varying vec4 vAnatomy;

            float causticsPattern(vec3 p, float t) {
              vec2 uv = p.xy * 4.5;
              float c1 = sin(uv.x * 2.6 + t * 2.2 + cos(uv.y * 2.9 - t * 1.7));
              float c2 = cos(uv.y * 3.2 - t * 1.9 + sin(uv.x * 2.4 + t * 2.5));
              return pow(clamp(1.0 - abs(c1 + c2) * 0.45, 0.0, 1.0), 3.2);
            }

            void main() {
              float amp = 0.015 + uWaveImpulse * 0.055;
              float wave = sin(vLocalPos.x * 6.5 + uTime * 3.8) * cos(vLocalPos.z * 6.5 + uTime * 3.1) * amp
                         + sin(vLocalPos.x * 11.0 - uTime * 5.2 + vLocalPos.z * 8.0) * 0.35 * amp;
              float slosh = (vLocalPos.x * uTiltZ - vLocalPos.z * uTiltX) * 0.45;

              float waterSurfaceY = uFillRatio * uModelHeight + wave + slosh;

              if (vLocalPos.y > waterSurfaceY) discard;

              vec3 V = normalize(vViewPos);
              vec3 N = normalize(gl_FrontFacing ? vNormal : vec3(0.0, 1.0, 0.0));
              float NoV = clamp(dot(N, V), 0.0, 1.0);

              float fresnel = 0.04 + 0.96 * pow(1.0 - NoV, 3.5);
              float muscleRelief = clamp(vAnatomy.r, 0.0, 1.0);
              float hRatio = clamp(vLocalPos.y / max(0.05, waterSurfaceY), 0.0, 1.0);

              // Absorção volumétrica + Destaque muscular com iluminação interna
              vec3 waterCol = mix(uDeepColor, uShallowColor, hRatio * 0.75 + muscleRelief * 0.35);
              waterCol += uScatterColor * pow(muscleRelief, 1.8) * 0.52;

              float caustics = causticsPattern(vLocalPos, uTime);
              waterCol += uScatterColor * caustics * 0.24;

              vec3 L = normalize(vec3(-0.5, 0.8, 0.7));
              vec3 H = normalize(L + V);
              float spec = pow(max(dot(N, H), 0.0), 72.0);
              waterCol += vec3(1.0) * spec * 0.7;

              float distToSurface = waterSurfaceY - vLocalPos.y;
              float meniscusBand = smoothstep(0.042, 0.0, distToSurface);

              if (!gl_FrontFacing) {
                waterCol = mix(uShallowColor, uMeniscusColor, 0.55 + 0.35 * caustics);
              } else {
                waterCol = mix(waterCol, uMeniscusColor, meniscusBand * 0.92);
              }

              float alpha = clamp(0.82 + fresnel * 0.14 + meniscusBand * 0.18, 0.0, 0.98);
              gl_FragColor = vec4(waterCol, alpha);
            }
          `,
        });

        // Carregar Modelo GLB do GigaChad
        const loader = new THREE.GLTFLoader();
        loader.load(
          GIGACHAD_GLB_PATH,
          (gltf: any) => {
            if (!isMounted) return;
            const root = gltf.scene;
            let bodyGeometry: any = null;

            root.traverse((child: any) => {
              if (child.isMesh && child.geometry) {
                bodyGeometry = child.geometry.clone();
              }
            });

            if (bodyGeometry) {
              bodyGeometry.computeBoundingBox();
              const bbox = bodyGeometry.boundingBox;
              const sizeY = Math.max(0.01, bbox.max.y - bbox.min.y);
              const scaleFactor = modelHeight / sizeY;

              const centerX = (bbox.min.x + bbox.max.x) * 0.5;
              const centerZ = (bbox.min.z + bbox.max.z) * 0.5;
              bodyGeometry.translate(-centerX, -bbox.min.y, -centerZ);
              bodyGeometry.scale(scaleFactor, scaleFactor, scaleFactor);
              bodyGeometry.computeVertexNormals();

              // Camada 1: Volume Muscular de Água (renderOrder 2)
              const liquidBodyMesh = new THREE.Mesh(bodyGeometry, muscleLiquidMat);
              liquidBodyMesh.position.y = baseOffsetY;
              liquidBodyMesh.renderOrder = 2;
              reactorGroup.add(liquidBodyMesh);

              // Camada 2: Casca Externa de Vidro Borossilicato Raio-X (renderOrder 4)
              const glassBodyMesh = new THREE.Mesh(bodyGeometry, xRayGlassMat);
              glassBodyMesh.position.y = baseOffsetY;
              glassBodyMesh.renderOrder = 4;
              reactorGroup.add(glassBodyMesh);
            }
          },
          undefined,
          (err: any) => {
            console.error("Erro ao carregar gigachad_vessel.glb:", err);
          }
        );

        // Microbolhas subindo pelo interior do corpo do GigaChad
        const bubbleCount = 48;
        const bubblePositions = new Float32Array(bubbleCount * 3);
        const bubbleSpeeds = new Float32Array(bubbleCount);
        const bubblePhases = new Float32Array(bubbleCount);

        for (let i = 0; i < bubbleCount; i++) {
          bubblePositions[i * 3] = (Math.random() - 0.5) * 0.36;
          bubblePositions[i * 3 + 1] = Math.random() * modelHeight;
          bubblePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.16;
          bubbleSpeeds[i] = 0.005 + Math.random() * 0.011;
          bubblePhases[i] = Math.random() * Math.PI * 2;
        }

        const bubbleGeo = new THREE.BufferGeometry();
        bubbleGeo.setAttribute("position", new THREE.BufferAttribute(bubblePositions, 3));
        const bubbleMat = new THREE.PointsMaterial({
          map: createBubbleTexture(THREE),
          color: 0xe0f2fe,
          size: 0.075,
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const bubblePoints = new THREE.Points(bubbleGeo, bubbleMat);
        bubblePoints.position.y = baseOffsetY;
        bubblePoints.renderOrder = 3;
        reactorGroup.add(bubblePoints);

        // Estado de animação e rotação lenta automática 360° (sem mouse)
        let currentFill = Math.max(0.02, Math.min(1, intakeMl / Math.max(1, goalMl)));
        let targetFill = currentFill;
        let waveImpulse = 0.25;
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
          sharedUniforms.uTime.value += dt;
          sharedUniforms.uFillRatio.value = currentFill;
          sharedUniforms.uWaveImpulse.value = waveImpulse;

          // Escultura 100% estática na vista frontal
          reactorGroup.rotation.set(0, 0, 0);

          sharedUniforms.uTiltZ.value = 0.0;
          sharedUniforms.uTiltX.value = 0.0;

          // Modo Overdrive 100% (Aura Ciano + Ouro)
          if (currentFill >= 0.99) {
            sharedUniforms.uShallowColor.value.setHex(0x0891b2);
            sharedUniforms.uScatterColor.value.setHex(0x22d3ee);
            sharedUniforms.uMeniscusColor.value.setHex(0xfef08a);
            baseRing.material.color.setHex(0xfbbf24);
          } else {
            sharedUniforms.uShallowColor.value.setHex(0x0284c7);
            sharedUniforms.uScatterColor.value.setHex(0x38bdf8);
            sharedUniforms.uMeniscusColor.value.setHex(0xe0f2fe);
            baseRing.material.color.setHex(0x38bdf8);
          }

          // Atualiza bolhas dentro do volume preenchido do corpo
          const maxBubbleY = Math.max(0.08, currentFill * modelHeight - 0.04);
          const posAttr = bubbleGeo.getAttribute("position");
          const t = sharedUniforms.uTime.value;

          for (let i = 0; i < bubbleCount; i++) {
            let by = posAttr.getY(i) + bubbleSpeeds[i] * (1 + waveImpulse * 2.2);
            if (by > maxBubbleY) {
              by = 0.05;
            }
            const wobbleX = Math.sin(t * 2.8 + bubblePhases[i] + by * 3.5) * 0.14;
            const wobbleZ = Math.cos(t * 2.4 + bubblePhases[i]) * 0.06;
            posAttr.setXYZ(i, wobbleX, by, wobbleZ);
          }
          posAttr.needsUpdate = true;
          bubbleMat.opacity = currentFill > 0.05 ? 0.85 : 0.12;

          renderer.render(scene, camera);
        };

        setWebglReady(true);
        animate();

        const onResize = () => {
          if (!container || !mount || !renderer) return;
          const w = mount.clientWidth || container.clientWidth || 220;
          const h = mount.clientHeight || container.clientHeight || 270;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener("resize", onResize);

        return () => {
          window.removeEventListener("resize", onResize);
        };
      })
      .catch((err) => {
        console.error("Falha ao inicializar WebGL:", err);
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
        toast.success("META HIDRÁULICA ATINGIDA! GigaChad #Hydrated desbloqueado.");
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
              <h2 className="font-display text-lg tracking-tight">Hidratação Anatômica</h2>
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
        {/* Coluna da Escultura 3D GigaChad (5 colunas) */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center relative">
          <div
            ref={canvasContainerRef}
            translate="no"
            className="notranslate w-full h-[270px] bg-transparent flex items-center justify-center relative overflow-hidden select-none pointer-events-none"
          >
            {/* Montagem isolada do Canvas WebGL */}
            <div ref={canvasMountRef} className="absolute inset-0 w-full h-full pointer-events-none" />

            {/* Overlay de carregamento mantido fixo no DOM para imunidade total contra erros de tradução */}
            <div
              className={cn(
                "text-xs font-mono text-muted-foreground flex items-center gap-2 relative z-10 pointer-events-none transition-opacity duration-300",
                webglReady || webglError ? "opacity-0 pointer-events-none" : "opacity-100"
              )}
            >
              <Waves className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Carregando Anatomia 3D...</span>
            </div>

            {/* Fallback 2D caso o WebGL falhe */}
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
