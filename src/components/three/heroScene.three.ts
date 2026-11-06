import * as THREE from 'three'

export interface HeroSceneOptions {
  /** CSS colour for the main body of the object (--accent). */
  accent: string
  /** CSS colour for the outer shell (--violet). */
  violet: string
  /** Phone-class device: fewer particles, lower pixel ratio, no AA. */
  mobile: boolean
}

export interface HeroSceneHandle {
  start(): void
  stop(): void
  resize(): void
  /** Re-reads the theme colours without rebuilding the scene. */
  setColors(accent: string, violet: string): void
  dispose(): void
}

/**
 * The hero's WebGL object: a particle shell around a wireframe icosahedron,
 * lit additively so it reads as light rather than geometry.
 *
 * Kept free of Vue on purpose — HeroScene.vue owns the lifecycle, this module
 * owns the three.js scene, which is also what keeps `three` out of the initial
 * bundle (`HeroScene.vue` imports it dynamically).
 *
 * Budget notes:
 * - particle count and DPR drop on phones,
 * - an fps governor halves the particles if frames get slow,
 * - everything is disposed on unmount, including the GL context.
 */
export function createHeroScene(
  canvas: HTMLCanvasElement,
  options: HeroSceneOptions,
): HeroSceneHandle {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !options.mobile,
    powerPreference: 'high-performance',
  })
  renderer.setClearAlpha(0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.mobile ? 1.25 : 1.5))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
  camera.position.set(0, 0, 5.4)

  const accent = new THREE.Color(options.accent)
  const violet = new THREE.Color(options.violet)

  const group = new THREE.Group()
  scene.add(group)

  // ── Particle shell (hollow, slightly squashed sphere) ────
  const count = options.mobile ? 320 : 900
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count; i += 1) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const radius = 1.85 + Math.random() * 0.9

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.cos(phi) * 0.7
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
  }

  const particleGeometry = new THREE.BufferGeometry()
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const particleMaterial = new THREE.PointsMaterial({
    color: accent,
    size: 0.026,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const particles = new THREE.Points(particleGeometry, particleMaterial)
  group.add(particles)

  // ── Wireframe core ──────────────────────────────────────
  const coreGeometry = new THREE.IcosahedronGeometry(1.32, 1)
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: accent,
    wireframe: true,
    transparent: true,
    opacity: 0.17,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const core = new THREE.Mesh(coreGeometry, coreMaterial)
  group.add(core)

  // ── Outer halo shell ────────────────────────────────────
  const haloGeometry = new THREE.IcosahedronGeometry(1.74, 2)
  const haloMaterial = new THREE.MeshBasicMaterial({
    color: violet,
    wireframe: true,
    transparent: true,
    opacity: 0.07,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const halo = new THREE.Mesh(haloGeometry, haloMaterial)
  group.add(halo)

  // ── Orbit ring ──────────────────────────────────────────
  const ringGeometry = new THREE.TorusGeometry(2.18, 0.0045, 8, 96)
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: accent,
    transparent: true,
    opacity: 0.38,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const ring = new THREE.Mesh(ringGeometry, ringMaterial)
  ring.rotation.x = Math.PI * 0.42
  group.add(ring)

  // ── Pointer parallax ────────────────────────────────────
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 }

  function onPointerMove(event: PointerEvent) {
    pointer.targetX = (event.clientX / window.innerWidth) * 2 - 1
    pointer.targetY = (event.clientY / window.innerHeight) * 2 - 1
  }

  // ── Frame loop + performance governor ───────────────────
  const clock = new THREE.Clock()
  let raf = 0
  let frames = 0
  let elapsed = 0
  let degraded = false

  function degrade() {
    degraded = true
    renderer.setPixelRatio(1)
    particleGeometry.setDrawRange(0, Math.floor(count / 2))
    coreMaterial.opacity = 0.12
    haloMaterial.opacity = 0.05
  }

  function frame() {
    raf = requestAnimationFrame(frame)

    const delta = Math.min(clock.getDelta(), 0.05)
    const time = clock.elapsedTime

    pointer.x += (pointer.targetX - pointer.x) * 0.045
    pointer.y += (pointer.targetY - pointer.y) * 0.045

    group.rotation.y = time * 0.06 + pointer.x * 0.34
    group.rotation.x = Math.sin(time * 0.18) * 0.08 - pointer.y * 0.2
    group.position.y = Math.sin(time * 0.35) * 0.06

    core.rotation.y = -time * 0.14
    core.rotation.z = time * 0.05
    halo.rotation.y = time * 0.085
    ring.rotation.z = time * 0.1

    if (!degraded && delta > 0) {
      frames += 1
      elapsed += delta
      if (frames === 90) {
        if (elapsed / frames > 0.022) degrade()
        frames = 0
        elapsed = 0
      }
    }

    renderer.render(scene, camera)
  }

  function resize() {
    const width = canvas.clientWidth || 1
    const height = canvas.clientHeight || 1

    renderer.setSize(width, height, false)
    camera.aspect = width / height
    // Tall phones need the camera further back or the shell clips.
    camera.position.z = width / height < 1 ? 6.8 : 5.4
    camera.updateProjectionMatrix()
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  resize()

  return {
    start() {
      if (raf) return
      clock.start()
      frame()
    },
    stop() {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      clock.stop()
    },
    resize,
    setColors(nextAccent, nextViolet) {
      accent.set(nextAccent)
      violet.set(nextViolet)
      particleMaterial.color.copy(accent)
      coreMaterial.color.copy(accent)
      ringMaterial.color.copy(accent)
      haloMaterial.color.copy(violet)
    },
    dispose() {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      window.removeEventListener('pointermove', onPointerMove)

      particleGeometry.dispose()
      particleMaterial.dispose()
      coreGeometry.dispose()
      coreMaterial.dispose()
      haloGeometry.dispose()
      haloMaterial.dispose()
      ringGeometry.dispose()
      ringMaterial.dispose()

      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}
