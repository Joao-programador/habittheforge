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
    const existing = document.querySelector(`script[src="${THREE_CDN_URL}"]`) as HTMLScriptElement | null;
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
  const sceneControllerRef = useRef<{
    setTargetFill: (ratio: number) => void;
    triggerSplash: (intensity?: number) => void;
  } | null>(null);

  // Detecta se existe um hábito de água/hidratação para sincronizar
  const linkedWaterHabit = useMemo(() => {
    return habits.find((h) => /([aá]gua|hidrat|water|3l|litro)/i.test(h.name));
  }, [habits]);

  const isLinkedHabitDone = useMemo(() => {
    if (!linkedWaterHabit) return false;
    return isCompleted(linkedWaterHabit.id, selectedDate);
  }, [linkedWaterHabit, isCompleted, selectedDate, completions]);

  // Status biológico segundo o nível de hidratação
  const hydroStatus = useMemo(() => {
    if (percentage === 0) {
      return {
        label: "Seca Doomer",
        sub: "Células desidratadas. Injete o primeiro copo para ativar o reator.",
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

  // Inicialização da Cena Three.js (Câmara Hidro-Criogênica)
  useEffect(() => {
    let isMounted = true;
    let animationFrameId: number;
    let renderer: any = null;
    let observer: IntersectionObserver | null = null;

    ensureThreeLoaded()
      .then((THREE) => {
        if (!isMounted || !canvasContainerRef.current || !THREE) return;

        const container = canvasContainerRef.current;
        const width = container.clientWidth || 220;
        const height = container.clientHeight || 260;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
        camera.position.set(0, 0.25, 5.2);
        camera.lookAt(0, 0, 0);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        container.innerHTML = "";
        container.appendChild(renderer.domElement);

        // Grupo principal do Reator (permite inclinação 3D interativa)
        const reactorGroup = new THREE.Group();
        scene.add(reactorGroup);

        // Iluminação espacial
        const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.75);
        scene.add(ambientLight);

        const keyLight = new THREE.PointLight(0x38bdf8, 2.2, 15);
        keyLight.position.set(3, 3.5, 4);
        scene.add(keyLight);

        const rimLight = new THREE.PointLight(0xf59e0b, 1.1, 12);
        rimLight.position.set(-3, -2, 2.5);
        scene.add(rimLight);

        const vesselHeight = 2.5;
        const vesselRadius = 0.82;

        // 1. Anéis Táticos Metálicos (Topo e Base da Câmara)
        const capGeo = new THREE.CylinderGeometry(vesselRadius * 1.07, vesselRadius * 1.07, 0.14, 40);
        const capMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          metalness: 0.85,
          roughness: 0.25,
        });
        const topCap = new THREE.Mesh(capGeo, capMat);
        topCap.position.y = vesselHeight / 2 + 0.05;
        reactorGroup.add(topCap);

        const bottomCap = new THREE.Mesh(capGeo, capMat);
        bottomCap.position.y = -vesselHeight / 2 - 0.05;
        reactorGroup.add(bottomCap);

        // Anel luminoso de Base / Overdrive
        const ringGeo = new THREE.TorusGeometry(vesselRadius * 1.04, 0.025, 16, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.75 });
        const baseRing = new THREE.Mesh(ringGeo, ringMat);
        baseRing.rotation.x = Math.PI / 2;
        baseRing.position.y = -vesselHeight / 2 + 0.02;
        reactorGroup.add(baseRing);

        // 2. Cilindro Externo de Vidro Criogênico + Linhas de Graduação (25%, 50%, 75%)
        const glassGeo = new THREE.CylinderGeometry(vesselRadius, vesselRadius, vesselHeight, 40, 1, true);
        const glassMat = new THREE.MeshPhysicalMaterial({
          color: 0x93c5fd,
          transparent: true,
          opacity: 0.16,
          roughness: 0.1,
          metalness: 0.1,
          side: THREE.DoubleSide,
        });
        const glassMesh = new THREE.Mesh(glassGeo, glassMat);
        reactorGroup.add(glassMesh);

        [-0.625, 0, 0.625].forEach((markY, idx) => {
          const markGeo = new THREE.TorusGeometry(vesselRadius * 1.005, 0.008, 8, 48);
          const markMat = new THREE.MeshBasicMaterial({
            color: idx === 1 ? 0x38bdf8 : 0x64748b,
            transparent: true,
            opacity: idx === 1 ? 0.45 : 0.25,
          });
          const mark = new THREE.Mesh(markGeo, markMat);
          mark.rotation.x = Math.PI / 2;
          mark.position.y = markY;
          reactorGroup.add(mark);
        });

        // 3. Coluna de Água com Custom GLSL Wave Shader
        const liquidRadius = vesselRadius * 0.93;
        const liquidGeo = new THREE.CylinderGeometry(liquidRadius, liquidRadius, vesselHeight, 48, 28, false);
        liquidGeo.translate(0, vesselHeight / 2, 0);

        const liquidUniforms = {
          uTime: { value: 0 },
          uWaveImpulse: { value: 0.0 },
          uTiltX: { value: 0.0 },
          uTiltZ: { value: 0.0 },
          uDeepColor: { value: new THREE.Color(0x0284c7) },
          uSurfaceColor: { value: new THREE.Color(0x38bdf8) },
          uRimColor: { value: new THREE.Color(0xbae6fd) },
        };

        const liquidMat = new THREE.ShaderMaterial({
          uniforms: liquidUniforms,
          transparent: true,
          vertexShader: `
            uniform float uTime;
            uniform float uWaveImpulse;
            uniform float uTiltX;
            uniform float uTiltZ;
            varying vec3 vNormal;
            varying vec3 vPos;
            varying float vHeightRatio;

            void main() {
              vec3 pos = position;
              vHeightRatio = clamp(pos.y / 2.5, 0.0, 1.0);

              // Aplica ondas na superfície superior do cilindro de água
              if (pos.y > 0.15) {
                float amp = (0.035 + uWaveImpulse * 0.11) * pow(vHeightRatio, 1.6);
                float wave1 = sin(pos.x * 4.5 + uTime * 3.8) * cos(pos.z * 4.5 + uTime * 3.1);
                float wave2 = sin(pos.x * 8.0 - uTime * 5.2 + pos.z * 6.0) * 0.45;
                float slosh = (pos.x * uTiltZ - pos.z * uTiltX) * 0.55 * vHeightRatio;
                pos.y += (wave1 + wave2) * amp + slosh;
              }

              vPos = pos;
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 uDeepColor;
            uniform vec3 uSurfaceColor;
            uniform vec3 uRimColor;
            varying vec3 vNormal;
            varying vec3 vPos;
            varying float vHeightRatio;

            void main() {
              vec3 col = mix(uDeepColor, uSurfaceColor, vHeightRatio);
              float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.2);
              col = mix(col, uRimColor, fresnel * 0.55);

              // Brilho no menisco superior
              if (vHeightRatio > 0.94) {
                col = mix(col, uRimColor, 0.45);
              }

              gl_FragColor = vec4(col, 0.86);
            }
          `,
        });

        const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
        liquidMesh.position.y = -vesselHeight / 2;
        reactorGroup.add(liquidMesh);

        // 4. Cristal Flutuante de Aura (Octaedro que flutua no nível da água)
        const crystalGeo = new THREE.OctahedronGeometry(0.22, 0);
        const crystalMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.65,
          metalness: 0.4,
          roughness: 0.15,
          wireframe: false,
        });
        const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
        reactorGroup.add(crystalMesh);

        // 5. Sistema de Microbolhas Efervescentes (THREE.Points)
        const bubbleCount = 45;
        const bubblePositions = new Float32Array(bubbleCount * 3);
        const bubbleSpeeds = new Float32Array(bubbleCount);

        for (let i = 0; i < bubbleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * (liquidRadius * 0.8);
          bubblePositions[i * 3] = Math.cos(angle) * r;
          bubblePositions[i * 3 + 1] = Math.random() * vesselHeight;
          bubblePositions[i * 3 + 2] = Math.sin(angle) * r;
          bubbleSpeeds[i] = 0.008 + Math.random() * 0.016;
        }

        const bubbleGeo = new THREE.BufferGeometry();
        bubbleGeo.setAttribute("position", new THREE.BufferAttribute(bubblePositions, 3));
        const bubbleMat = new THREE.PointsMaterial({
          color: 0xe0f2fe,
          size: 0.055,
          transparent: true,
          opacity: 0.75,
        });
        const bubblePoints = new THREE.Points(bubbleGeo, bubbleMat);
        bubblePoints.position.y = -vesselHeight / 2;
        reactorGroup.add(bubblePoints);

        // Estado interno da animação
        let currentFill = Math.max(0.02, Math.min(1, intakeMl / Math.max(1, goalMl)));
        let targetFill = currentFill;
        let waveImpulse = 0.35;
        let pointerX = 0;
        let pointerY = 0;
        let isVisible = true;
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        sceneControllerRef.current = {
          setTargetFill: (ratio: number) => {
            targetFill = Math.max(0.02, Math.min(1, ratio));
          },
          triggerSplash: (intensity = 1.0) => {
            waveImpulse = Math.min(1.6, waveImpulse + intensity);
          },
        };

        // Eventos de ponteiro para inclinar o Reator 3D
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

        // Pausa quando fora da tela
        observer = new IntersectionObserver(
          (entries) => {
            isVisible = entries[0]?.isIntersecting ?? true;
          },
          { threshold: 0.05 }
        );
        observer.observe(container);

        // Loop de Renderização
        const animate = () => {
          animationFrameId = requestAnimationFrame(animate);
          if (!isVisible || document.hidden) return;

          const step = prefersReducedMotion ? 0.15 : 0.06;
          currentFill += (targetFill - currentFill) * step;
          waveImpulse *= 0.95;

          liquidUniforms.uTime.value += prefersReducedMotion ? 0.005 : 0.022;
          liquidUniforms.uWaveImpulse.value = waveImpulse;

          // Inclinação suave do grupo 3D
          const targetRotZ = -pointerX * 0.22;
          const targetRotX = pointerY * 0.16;
          reactorGroup.rotation.z += (targetRotZ - reactorGroup.rotation.z) * 0.08;
          reactorGroup.rotation.x += (targetRotX - reactorGroup.rotation.x) * 0.08;
          reactorGroup.rotation.y += prefersReducedMotion ? 0 : 0.003;

          liquidUniforms.uTiltZ.value = reactorGroup.rotation.z;
          liquidUniforms.uTiltX.value = reactorGroup.rotation.x;

          // Escala vertical do líquido
          liquidMesh.scale.y = Math.max(0.02, currentFill);

          // Atualiza cor conforme progresso (Overdrive dourado/ciano em 100%+)
          if (currentFill >= 0.99) {
            liquidUniforms.uSurfaceColor.value.setHex(0x22d3ee);
            liquidUniforms.uRimColor.value.setHex(0xfde68a);
            crystalMat.color.setHex(0xfbbf24);
            crystalMat.emissive.setHex(0xd97706);
            ringMat.color.setHex(0xfbbf24);
          } else {
            liquidUniforms.uSurfaceColor.value.setHex(0x38bdf8);
            liquidUniforms.uRimColor.value.setHex(0xbae6fd);
            crystalMat.color.setHex(0x38bdf8);
            crystalMat.emissive.setHex(0x0284c7);
            ringMat.color.setHex(0x0ea5e9);
          }

          // Posiciona o Cristal Flutuante exatamente no menisco da água
          const surfaceY = -vesselHeight / 2 + currentFill * vesselHeight;
          const bobbing = Math.sin(liquidUniforms.uTime.value * 2.4) * (0.04 + waveImpulse * 0.05);
          crystalMesh.position.y = Math.min(vesselHeight / 2 - 0.18, Math.max(-vesselHeight / 2 + 0.2, surfaceY + bobbing));
          crystalMesh.rotation.y += 0.02;
          crystalMesh.rotation.x += 0.01;

          // Atualiza partículas de bolhas dentro do volume preenchido
          const maxBubbleY = Math.max(0.1, currentFill * vesselHeight);
          const posAttr = bubbleGeo.getAttribute("position");
          for (let i = 0; i < bubbleCount; i++) {
            let by = posAttr.getY(i) + bubbleSpeeds[i] * (1 + waveImpulse * 2.5);
            if (by > maxBubbleY) {
              by = 0.02;
            }
            posAttr.setY(i, by);
          }
          posAttr.needsUpdate = true;
          bubbleMat.opacity = currentFill > 0.05 ? 0.75 : 0.15;

          renderer.render(scene, camera);
        };

        setWebglReady(true);
        animate();

        const onResize = () => {
          if (!container || !renderer) return;
          const w = container.clientWidth || 220;
          const h = container.clientHeight || 260;
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
      if (renderer && renderer.dispose) renderer.dispose();
    };
  }, []);

  // Sincroniza mudanças de intakeMl / goalMl com o Shader 3D
  useEffect(() => {
    const ratio = goalMl > 0 ? intakeMl / goalMl : 0;
    sceneControllerRef.current?.setTargetFill(ratio);
  }, [intakeMl, goalMl]);

  const handleInjectWater = (amount: number) => {
    const prevPct = percentage;
    addWater(amount);
    sceneControllerRef.current?.triggerSplash(amount >= 500 ? 1.3 : 0.85);

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

      {/* Painel de Calibração de Meta (Expansível) */}
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

      {/* Grid Principal: Reator 3D (Esquerda) + Telemetria e Injetores (Direita) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
        {/* Coluna do Canvas WebGL 3D (5 colunas) */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center relative">
          <div
            ref={canvasContainerRef}
            onClick={() => sceneControllerRef.current?.triggerSplash(1.1)}
            className="w-full h-[250px] rounded-2xl bg-gradient-to-b from-slate-950/90 via-slate-900/60 to-cyan-950/30 border border-cyan-500/20 flex items-center justify-center cursor-grab active:cursor-grabbing relative overflow-hidden select-none"
            title="Arraste para inclinar o reator ou clique para agitar a água"
          >
            {!webglReady && !webglError && (
              <div className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                <Waves className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>Inicializando Reator 3D...</span>
              </div>
            )}
            {webglError && (
              <div className="p-4 text-center space-y-2">
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
          {/* Placar Numérico de Alta Precisão */}
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

            {/* Barra de Progresso Auxiliar */}
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

          {/* Mensagem de Estado Biológico */}
          <p className="text-xs text-muted-foreground leading-relaxed">{hydroStatus.sub}</p>

          {/* Botões de Injeção Rápida */}
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

          {/* Controles Secundários: Corrigir (-250ml), Resetar e Vínculo com Hábito */}
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
