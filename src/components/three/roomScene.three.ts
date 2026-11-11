import * as THREE from 'three'

// ── Shaders ────────────────────────────────────────────────
// The shaft is three crossed boxes, not a raymarched volume: at this scale the
// eye only needs soft edges, a little noise and a mullion pattern to read it as
// light moving through dusty air.
const BEAM_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const BEAM_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;

  void main() {
    // Soft edges across the width, fades in and out along the length.
    float across = 1.0 - smoothstep(0.1, 0.5, abs(vUv.x - 0.5));
    float along = smoothstep(0.0, 0.2, vUv.y) * (1.0 - smoothstep(0.7, 1.0, vUv.y));
    // Mullions: the shaft is cut into parallel slabs, the way light falls
    // through a window frame. This is what stops it reading as a grey ribbon.
    float mullion = 0.5 + 0.5 * smoothstep(0.28, 0.72, abs(fract(vUv.x * 4.0) * 2.0 - 1.0));
    float breathe = 0.86 + 0.14 * sin(uTime * 0.45 + vUv.y * 5.0);
    gl_FragColor = vec4(uColor, across * along * mullion * breathe * uIntensity);
  }
`

const PATCH_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const PATCH_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;
  uniform float uVertical;
  varying vec2 vUv;

  void main() {
    float fade = 0.15;
    float edgeX = smoothstep(0.0, fade, vUv.x) * smoothstep(1.0, 1.0 - fade, vUv.x);
    float edgeY = smoothstep(0.0, fade, vUv.y) * smoothstep(1.0, 1.0 - fade, vUv.y);
    // Which axis the bars run across: along the floor, across the wall.
    float axis = mix(vUv.y, vUv.x, uVertical);
    // 0 in the gaps, 1 in the shadow — a base value above zero would dim the
    // whole surface and flatten it instead of banding it.
    float bars = smoothstep(0.3, 0.72, abs(fract(axis * 4.0 + 0.5) * 2.0 - 1.0));
    float wobble = 0.94 + 0.06 * sin(uTime * 0.3 + vUv.x * 9.0);
    gl_FragColor = vec4(uColor, edgeX * edgeY * bars * wobble * uIntensity);
  }
`

/**
 * Colours for the room, read from the `--room-*` custom properties so the scene
 * re-tints with the theme instead of keeping a second palette in TypeScript.
 */
export interface RoomPalette {
  ink: string
  wall: string
  floor: string
  beam: string
  dust: string
  fog: string
  bronze: string
  /** What a shadow looks like on these surfaces — dark in both themes. */
  shadow: string
}

export interface RoomSceneOptions {
  palette: RoomPalette
  /** Phone-class device: fewer dust motes, lower pixel ratio, no AA. */
  mobile: boolean
}

export interface RoomSceneHandle {
  start(): void
  stop(): void
  resize(): void
  setPalette(palette: RoomPalette): void
  /** 0 = hero fully in view, 1 = scrolled past it. */
  setScroll(progress: number): void
  dispose(): void
}

// ── Room geometry (world units) ────────────────────────────
const FLOOR_Y = -1.7
const WALL_Z = -4.2
const CAM_BASE = { x: 0, y: 0.9, z: 4.6 }
const LOOK_BASE = { x: 0, y: 0.25, z: -2.4 }

/** The shaft of light, as a segment in world space. */
const BEAM_FROM = new THREE.Vector3(-7.2, 5.2, 1.4)
const BEAM_TO = new THREE.Vector3(3.6, FLOOR_Y, -1.9)

const DUST_DRIFT = 0.06
const FOG_DENSITY = 0.052

/** 0..1 relative luminance of a hex colour — used to rebalance the additive
 *  layers, which read very differently on a dark wall than on a plaster one. */
function luminance(hex: string): number {
  const color = new THREE.Color(hex)
  return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b
}

/** Plaster: soft blotches over fine grain. Used as a bump + colour multiplier. */
function paintPlaster(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 256, 256)

    // Large, soft trowel marks.
    for (let i = 0; i < 90; i += 1) {
      const radius = 18 + Math.random() * 46
      const gradient = ctx.createRadialGradient(
        Math.random() * 256,
        Math.random() * 256,
        0,
        Math.random() * 256,
        Math.random() * 256,
        radius,
      )
      const shade = Math.random() > 0.5 ? 0 : 255
      gradient.addColorStop(0, `rgba(${shade}, ${shade}, ${shade}, 0.05)`)
      gradient.addColorStop(1, `rgba(${shade}, ${shade}, ${shade}, 0)`)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 256, 256)
    }

    // Fine grit, so the raking light has something to catch.
    for (let i = 0; i < 9000; i += 1) {
      const shade = Math.random() > 0.5 ? 255 : 0
      ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, 0.06)`
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 4)
  texture.anisotropy = anisotropy
  return texture
}

/** A soft round sprite for the dust motes — generated, never shipped. */
function paintDustSprite(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')

  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.35, 'rgba(255,255,255,0.55)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
  }

  return new THREE.CanvasTexture(canvas)
}

/**
 * Environment for the sheen on the floor and the wall.
 *
 * One warm panel standing in for the window, everything else near-black. This
 * is what stops the PBR materials from reading as flat paint.
 */
function buildEnvironment(
  renderer: THREE.WebGLRenderer,
  palette: RoomPalette,
): { texture: THREE.Texture; dispose(): void } {
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = new THREE.Scene()
  env.background = new THREE.Color(palette.fog)

  const parts: Array<{ dispose(): void }> = []
  const panel = (color: string, w: number, h: number, x: number, y: number, z: number): void => {
    const geometry = new THREE.PlaneGeometry(w, h)
    const material = new THREE.MeshBasicMaterial({ color })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(x, y, z)
    mesh.lookAt(0, 0, 0)
    env.add(mesh)
    parts.push(geometry, material)
  }

  panel(palette.beam, 5, 3, -3, 4, 2)
  panel(palette.bronze, 2.5, 2.5, 4, 1, 3)

  const target = pmrem.fromScene(env, 0.04)
  pmrem.dispose()
  for (const part of parts) part.dispose()

  return {
    texture: target.texture,
    dispose() {
      target.dispose()
    },
  }
}
/**
 * The hero's WebGL stage: a dark room with one shaft of light, dust in the air
 * and the portrait's light falling on the wall behind it.
 *
 * Everything here is procedural — no model, no texture, no HDRI. Realism comes
 * from the lighting, not from the geometry: the only "objects" are two planes
 * and three additive boxes, and the eye reads them as a lit room because the
 * falloff, the fog, the mullion pattern and the dust all agree with each other.
 *
 * Kept free of Vue on purpose — `RoomStage.vue` owns the lifecycle, this module
 * owns the three.js scene, which keeps `three` in its own lazy chunk.
 */
export function createRoomScene(
  canvas: HTMLCanvasElement,
  options: RoomSceneOptions,
): RoomSceneHandle {
  let palette = options.palette

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !options.mobile,
    powerPreference: 'high-performance',
  })
  renderer.setClearAlpha(0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.mobile ? 1.25 : 1.5))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  const anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4)

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(palette.fog, FOG_DENSITY)

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60)
  camera.position.set(CAM_BASE.x, CAM_BASE.y, CAM_BASE.z)

  const disposables: Array<{ dispose(): void }> = []
  function track<T extends { dispose(): void }>(item: T): T {
    disposables.push(item)
    return item
  }

  // ── Lights ───────────────────────────────────────────────
  // No shadow pass: there is nothing in the room to cast one. The illusion comes
  // from the painted patch on the floor plus the light direction on the wall.
  const keyLight = new THREE.DirectionalLight(palette.beam, 3.2)
  keyLight.position.copy(BEAM_FROM)
  keyLight.target.position.copy(BEAM_TO)
  scene.add(keyLight.target, keyLight)

  const bounceLight = new THREE.HemisphereLight(palette.wall, palette.ink, 0.85)
  scene.add(bounceLight)

  const warmLight = new THREE.PointLight(palette.bronze, 1.4, 16, 2)
  warmLight.position.set(3.4, 1.6, 1.8)
  scene.add(warmLight)

  let environment = buildEnvironment(renderer, palette)
  scene.environment = environment.texture
  scene.environmentIntensity = 0.6

  // ── Surfaces ─────────────────────────────────────────────
  const wallTexture = track(paintPlaster(anisotropy))
  wallTexture.repeat.set(6, 4)

  const floorTexture = track(paintPlaster(anisotropy))
  floorTexture.repeat.set(8, 6)

  const wallMaterial = track(
    new THREE.MeshStandardMaterial({
      color: palette.wall,
      map: wallTexture,
      bumpMap: wallTexture,
      bumpScale: 0.9,
      roughness: 0.96,
      metalness: 0,
    }),
  )
  const floorMaterial = track(
    new THREE.MeshStandardMaterial({
      color: palette.floor,
      map: floorTexture,
      bumpMap: floorTexture,
      bumpScale: 0.5,
      roughness: 0.62,
      metalness: 0.12,
    }),
  )

  const wallGeometry = track(new THREE.PlaneGeometry(34, 18))
  const wall = new THREE.Mesh(wallGeometry, wallMaterial)
  wall.position.set(0, 1.8, WALL_Z)
  scene.add(wall)

  const floorGeometry = track(new THREE.PlaneGeometry(34, 24))
  floorGeometry.rotateX(-Math.PI / 2)
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.position.set(0, FLOOR_Y, -1)
  scene.add(floor)

  // ── The shaft ────────────────────────────────────────────
  // Three boxes along the same segment, different aspect ratios, added together:
  // the overlap is brighter than the edges, which is what gives it a core.
  const beamDirection = new THREE.Vector3().subVectors(BEAM_TO, BEAM_FROM)
  const beamLength = beamDirection.length()
  const beamUnit = beamDirection.clone().normalize()
  const beamQuaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    beamUnit,
  )

  // Two planes crossed at 90° along the beam axis, per layer. A box would put
  // every face at the edge of the falloff — i.e. fully transparent — so the
  // volume has to be built from quads the camera can look through.
  const beamGeometryFlat = track(new THREE.PlaneGeometry(1, 1))
  beamGeometryFlat.rotateX(-Math.PI / 2)
  beamGeometryFlat.translate(0, 0, 0.5)

  const beamGeometryTall = track(new THREE.PlaneGeometry(1, 1))
  beamGeometryTall.rotateX(-Math.PI / 2)
  beamGeometryTall.rotateZ(Math.PI / 2)
  beamGeometryTall.translate(0, 0, 0.5)

  const beamLayers = [
    { width: 5.2, height: 3.2, intensity: 0.14 },
    { width: 2.6, height: 6.4, intensity: 0.08 },
    { width: 7.4, height: 1.6, intensity: 0.06 },
  ]

  const beamMaterials: THREE.ShaderMaterial[] = []
  const beamMeshes: THREE.Mesh[] = []
  for (const layer of beamLayers) {
    const material = track(
      new THREE.ShaderMaterial({
        vertexShader: BEAM_VERTEX,
        fragmentShader: BEAM_FRAGMENT,
        uniforms: {
          uColor: { value: new THREE.Color(palette.beam) },
          uTime: { value: 0 },
          uIntensity: { value: layer.intensity },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    )
    beamMaterials.push(material)

    for (const [geometry, width, height] of [
      [beamGeometryFlat, layer.width, layer.height],
      [beamGeometryTall, layer.height, layer.width],
    ] as const) {
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.copy(BEAM_FROM)
      mesh.quaternion.copy(beamQuaternion)
      mesh.scale.set(width, height, beamLength)
      mesh.frustumCulled = false
      scene.add(mesh)
      beamMeshes.push(mesh)
    }
  }

  // Where the shaft lands: a painted pool of striped light on the floor. Cheaper
  // and more controllable than projecting the beam through the floor material.
  const patchGeometry = track(new THREE.PlaneGeometry(11, 8))
  patchGeometry.rotateX(-Math.PI / 2)

  const patchMaterial = track(
    new THREE.ShaderMaterial({
      vertexShader: PATCH_VERTEX,
      fragmentShader: PATCH_FRAGMENT,
      uniforms: {
        uColor: { value: new THREE.Color(palette.beam) },
        uTime: { value: 0 },
        uIntensity: { value: 0.16 },
        uVertical: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )

  const patch = new THREE.Mesh(patchGeometry, patchMaterial)
  patch.position.set(BEAM_TO.x - 0.6, FLOOR_Y + 0.02, BEAM_TO.z + 0.4)
  patch.rotation.y = -0.28
  scene.add(patch)

  // The day theme shows the same window pattern as *shadow* on the wall instead
  // of light in the air. In a bright room the eye reads what blocks the light,
  // not the light itself — this is what keeps the stage legible with the
  // shutters open. Both materials are driven by the same shader.
  const wallShadowMaterial = track(
    new THREE.ShaderMaterial({
      vertexShader: PATCH_VERTEX,
      fragmentShader: PATCH_FRAGMENT,
      uniforms: {
        uColor: { value: new THREE.Color(palette.ink) },
        uTime: { value: 0 },
        uIntensity: { value: 0 },
        uVertical: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    }),
  )

  const wallShadowGeometry = track(new THREE.PlaneGeometry(13, 7.5))
  const wallShadow = new THREE.Mesh(wallShadowGeometry, wallShadowMaterial)
  wallShadow.position.set(0.8, 2.2, WALL_Z + 0.04)
  wallShadow.rotation.z = -0.12
  scene.add(wallShadow)

  // ── Dust ─────────────────────────────────────────────────
  // Motes are seeded *inside* the beam volume, so there is never dust in the
  // dark corners — that detail is what makes the air read as lit.
  const dustCount = options.mobile ? 140 : 460
  const dustPositions = new Float32Array(dustCount * 3)
  const dustPhases = new Float32Array(dustCount)
  const dustSpeeds = new Float32Array(dustCount)

  const beamSide = new THREE.Vector3().crossVectors(beamUnit, new THREE.Vector3(0, 1, 0)).normalize()
  const beamUp = new THREE.Vector3().crossVectors(beamSide, beamUnit).normalize()

  for (let i = 0; i < dustCount; i += 1) {
    const t = Math.random()
    // Averaging three randoms clumps the motes towards the axis of the shaft.
    const radius = ((Math.random() + Math.random() + Math.random()) / 3 - 0.5) * 3.4
    const angle = Math.random() * Math.PI * 2

    const point = BEAM_FROM.clone()
      .addScaledVector(beamUnit, beamLength * t)
      .addScaledVector(beamSide, Math.cos(angle) * radius)
      .addScaledVector(beamUp, Math.sin(angle) * radius)

    dustPositions[i * 3] = point.x
    dustPositions[i * 3 + 1] = point.y
    dustPositions[i * 3 + 2] = point.z
    dustPhases[i] = Math.random() * Math.PI * 2
    dustSpeeds[i] = 0.4 + Math.random() * 0.9
  }

  const dustGeometry = track(new THREE.BufferGeometry())
  const dustAttribute = new THREE.BufferAttribute(dustPositions, 3)
  dustGeometry.setAttribute('position', dustAttribute)

  const dustSprite = track(paintDustSprite())
  const dustMaterial = track(
    new THREE.PointsMaterial({
      color: new THREE.Color(palette.dust),
      size: 0.055,
      map: dustSprite,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    }),
  )
  const dustPoints = new THREE.Points(dustGeometry, dustMaterial)
  scene.add(dustPoints)

  /**
   * Rebalances the additive layers for the current theme.
   *
   * A shaft of light is the entire picture on a near-black wall and meaningless
   * on a plaster one, so the intensities follow the wall's luminance instead of
   * being fixed numbers that only work in one theme. Called at boot as well as
   * on a theme switch — a visitor who loads the site in the day theme must not
   * get the night intensities.
   */
  function applyTuning(next: RoomPalette): void {
    // 0 = night gallery, 1 = plaster daylight. Derived from the wall colour so a
    // new theme only has to set `--room-wall`.
    const night = luminance(next.wall)
    const t = Math.min(Math.max((night - 0.02) / 0.4, 0), 1)
    const day = t > 0.5

    // Night: light hanging in the air. Day: the shadow the window throws on the
    // wall. The two are mutually exclusive — an additive beam on plaster just
    // burns the wall white, which is exactly why the light theme used to look
    // flat.
    const lift = THREE.MathUtils.lerp(1, 0, t)
    beamMaterials.forEach((material, index) => {
      const uniform = material.uniforms.uIntensity
      if (uniform) uniform.value = (beamLayers[index]?.intensity ?? 0.1) * lift
    })
    dustMaterial.opacity = 0.55 * lift

    // The floor pool carries the same idea: a glow at night, a shadow by day.
    // `--room-shadow` exists because `--ink` is the *light* colour in the day
    // theme — painting a shadow with it made the shadow lighter than the wall.
    patchMaterial.blending = day ? THREE.NormalBlending : THREE.AdditiveBlending
    const patchColor = patchMaterial.uniforms.uColor
    if (patchColor) patchColor.value.set(day ? next.shadow : next.beam)
    const patchIntensity = patchMaterial.uniforms.uIntensity
    if (patchIntensity) patchIntensity.value = day ? 0.3 : 0.16

    const wallColor = wallShadowMaterial.uniforms.uColor
    if (wallColor) wallColor.value.set(next.shadow)
    const wallIntensity = wallShadowMaterial.uniforms.uIntensity
    if (wallIntensity) wallIntensity.value = day ? 0.5 : 0

    // Anything that ends up at ~zero alpha must not be drawn at all. Without
    // this the day theme kept paying for six full-screen additive quads plus the
    // dust every single frame while showing none of them — which is exactly why
    // the light theme felt heavy while the scene looked static.
    const beamsOn = lift > 0.02
    for (const mesh of beamMeshes) mesh.visible = beamsOn
    dustPoints.visible = beamsOn
    wallShadow.visible = day

    // Exposure: the night room needs a strong key to carve the wall, the day
    // room blows out if it keeps the same one.
    keyLight.intensity = THREE.MathUtils.lerp(3.4, 1.15, t)
    bounceLight.intensity = THREE.MathUtils.lerp(0.85, 0.5, t)
    warmLight.intensity = THREE.MathUtils.lerp(1.4, 0.3, t)
    scene.environmentIntensity = THREE.MathUtils.lerp(0.6, 0.45, t)
  }

  applyTuning(palette)

  // ── Camera ───────────────────────────────────────────────
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 }
  let scrollProgress = 0
  let portraitScale = 1
  let portraitLift = 0.12

  function onPointerMove(event: PointerEvent): void {
    pointer.targetX = (event.clientX / window.innerWidth) * 2 - 1
    pointer.targetY = (event.clientY / window.innerHeight) * 2 - 1
  }

  function updateCamera(time: number): void {
    // A slow drift so the room breathes; far too small to notice as motion,
    // big enough that the frame never looks like a static screenshot.
    const drift = Math.sin(time * 0.11) * 0.07

    camera.position.set(
      CAM_BASE.x + drift + pointer.x * 0.22,
      CAM_BASE.y - pointer.y * 0.07 + scrollProgress * 0.45,
      CAM_BASE.z * portraitScale * (1 + scrollProgress * 0.22),
    )
    camera.lookAt(
      LOOK_BASE.x + pointer.x * 0.1,
      LOOK_BASE.y + portraitLift + scrollProgress * 0.1,
      LOOK_BASE.z,
    )
  }

  function updateDust(time: number, delta: number): void {
    const array = dustAttribute.array as Float32Array

    for (let i = 0; i < dustCount; i += 1) {
      const index = i * 3
      // Rises slowly, sways a little, wraps back to the bottom of the shaft.
      array[index + 1] = (array[index + 1] ?? 0) + (dustSpeeds[i] ?? 0.6) * DUST_DRIFT * delta
      array[index] = (array[index] ?? 0) + Math.sin(time * 0.4 + (dustPhases[i] ?? 0)) * 0.0018
      if ((array[index + 1] ?? 0) > 5.4) array[index + 1] = -1.4
    }

    dustAttribute.needsUpdate = true
  }

  // ── Frame loop + performance governor ────────────────────
  const clock = new THREE.Clock()
  let raf = 0
  let frames = 0
  let elapsed = 0
  let degraded = false

  function degrade(): void {
    degraded = true
    renderer.setPixelRatio(1)
    dustMaterial.opacity = 0.28
    scene.environmentIntensity = 0.3
  }

  function frame(): void {
    raf = requestAnimationFrame(frame)

    const delta = Math.min(clock.getDelta(), 0.05)
    const time = clock.elapsedTime

    pointer.x += (pointer.targetX - pointer.x) * 0.05
    pointer.y += (pointer.targetY - pointer.y) * 0.05

    // The shaft and the dust are only animated while they are drawn.
    if (beamMeshes[0]?.visible) {
      for (const material of beamMaterials) {
        const uniform = material.uniforms.uTime
        if (uniform) uniform.value = time
      }
      updateDust(time, delta)
    }

    const patchTime = patchMaterial.uniforms.uTime
    if (patchTime) patchTime.value = time

    if (wallShadow.visible) {
      const wallTime = wallShadowMaterial.uniforms.uTime
      if (wallTime) wallTime.value = time
    }
    updateCamera(time)

    if (!degraded && delta > 0) {
      frames += 1
      elapsed += delta
      if (frames === 90) {
        if (elapsed / frames > 0.024) degrade()
        frames = 0
        elapsed = 0
      }
    }

    renderer.render(scene, camera)
  }

  function resize(): void {
    const width = canvas.clientWidth || 1
    const height = canvas.clientHeight || 1

    renderer.setSize(width, height, false)

    // Portrait crops the room's width, so widen the lens and lift the horizon.
    const portrait = width / height < 1
    portraitScale = portrait ? 1.25 : 1
    portraitLift = portrait ? 0.34 : 0.12
    camera.fov = portrait ? 52 : 38
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  // ── Theme ────────────────────────────────────────────────
  function setPalette(next: RoomPalette): void {
    palette = next

    scene.fog?.color.set(next.fog)
    wallMaterial.color.set(next.wall)
    floorMaterial.color.set(next.floor)
    keyLight.color.set(next.beam)
    bounceLight.color.set(next.wall)
    bounceLight.groundColor.set(next.ink)
    warmLight.color.set(next.bronze)
    dustMaterial.color.set(next.dust)

    for (const material of beamMaterials) {
      const uniform = material.uniforms.uColor
      if (uniform) uniform.value.set(next.beam)
    }
    const patchColor = patchMaterial.uniforms.uColor
    if (patchColor) patchColor.value.set(next.beam)

    // Additive light is the whole picture on a near-black wall and meaningless
    // on a plaster one, so the intensity follows the wall's luminance. In the
    // day theme the shaft is effectively off and the room itself is the light.
    applyTuning(next)

    const previous = environment
    environment = buildEnvironment(renderer, next)
    scene.environment = environment.texture
    previous.dispose()
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
    setPalette,
    setScroll(progress: number) {
      scrollProgress = Math.min(Math.max(progress, 0), 1)
    },
    dispose() {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      window.removeEventListener('pointermove', onPointerMove)

      environment.dispose()
      for (const item of disposables) item.dispose()

      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}

