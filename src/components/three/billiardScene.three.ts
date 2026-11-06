import * as THREE from 'three'

/**
 * Colours for the table, read from the `--scene-*` custom properties so the
 * scene re-tints with the theme instead of keeping a second palette in TS.
 */
export interface ScenePalette {
  ink: string
  accent: string
  violet: string
  cyan: string
  felt: string
  feltLine: string
  cushion: string
  rail: string
  pocket: string
  ball: string
  ballRim: string
  cue: string
  cueTip: string
  fog: string
}

export interface BilliardSceneOptions {
  palette: ScenePalette
  /** Phone-class device: fewer sphere segments, lower pixel ratio, no AA. */
  mobile: boolean
}

export interface BilliardSceneHandle {
  start(): void
  stop(): void
  resize(): void
  /** Re-reads the theme colours without rebuilding the scene. */
  setPalette(palette: ScenePalette): void
  /** 0 = hero fully in view, 1 = scrolled past it. Dollies the camera back. */
  setScroll(progress: number): void
  dispose(): void
}

// ── Table geometry (world units) ───────────────────────────
// The balls are ~40% oversized compared to a real 9ft table. Physically
// correct balls read as noise at this camera distance; oversizing them keeps
// the rack and the break legible, which is the whole point of the scene.
const TABLE_W = 3.2
const TABLE_L = 6.4
const HALF_W = TABLE_W / 2
const HALF_L = TABLE_L / 2
const BALL_R = 0.088
const CUSHION = 0.16
const CUSHION_H = 0.12
/** Ball centres never cross the cushion face. */
const PLAY_X = HALF_W - CUSHION - BALL_R
const PLAY_Z = HALF_L - CUSHION - BALL_R
const POCKET_R = BALL_R * 1.9

// ── Physics ────────────────────────────────────────────────
const FIXED_DT = 1 / 120
const MAX_STEPS = 4
const FRICTION = 0.8
const RESTITUTION = 0.94
const CUSHION_LOSS = 0.9
const MIN_SPEED = 0.05
const BREAK_SPEED = 3.4

// ── Director timing, seconds into one 25s loop ─────────────
const CYCLE = 25
const T_AIM = 3.4
const T_STRIKE = 4.6
const T_HIT = 4.78
const T_RESET = 19.4
const RESET_SHRINK = 0.45
const RESET_GROW = 0.75

const FOG_DENSITY = 0.09

const CAM_BASE = { x: 0, y: 1.75, z: 5.2 }
const LOOK_BASE = { x: 0, y: 1.05, z: -0.9 }

interface BallState {
  mesh: THREE.Mesh
  material: THREE.MeshStandardMaterial
  /** 0 for the cue ball, 1-15 for the rack. */
  number: number
  x: number
  z: number
  vx: number
  vz: number
  /** 0 while on the table, 1 once it has dropped into a pocket. */
  sink: number
  home: { x: number; z: number }
}

interface Pocket {
  x: number
  z: number
}

/**
 * Builds the procedural environment map the balls reflect.
 *
 * A glossy ball with no `envMap` renders almost black, and shipping an HDR file
 * for a hero would cost more than the whole scene. Rendering a handful of
 * emissive panels through `PMREMGenerator` gives the same iridescent sheen for
 * one-off CPU cost, in the brand colours, with no asset.
 */
function buildEnvironment(
  renderer: THREE.WebGLRenderer,
  palette: ScenePalette,
): { texture: THREE.Texture; dispose(): void } {
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = new THREE.Scene()
  // A mid dark base keeps the reflections readable in both themes: with the
  // day palette's fog colour the environment would be almost white and the
  // balls would wash out into the cloth.
  env.background = new THREE.Color(palette.rail)

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

  panel(palette.accent, 7, 3.5, 0, 5, -6)
  panel(palette.violet, 5, 3, -6, 2, 3)
  panel(palette.cyan, 5, 3, 6, 1, 2)
  // Deliberately not pure white and deliberately small: a large white source
  // lifts the whole diffuse ambient, which washes the balls out against the
  // pale cloth in the day theme.
  panel('#b9c8dd', 2, 1.3, 0, 6.5, 0)

  const target = pmrem.fromScene(env, 0.03)
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
 * Paints one ball's surface: a dark base, an accent band around the equator and
 * the numeral twice, so it reads from either side of the table.
 */
function paintBall(
  palette: ScenePalette,
  number: number,
  anisotropy: number,
): THREE.CanvasTexture | null {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = palette.ball
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Equator band: a thin ring, not a wide stripe — at this size a thick band
  // turns the rack into a row of stripes and fights the headline.
  ctx.fillStyle = palette.ballRim
  ctx.fillRect(0, 55, canvas.width, 18)

  ctx.fillStyle = palette.ball
  ctx.font = '700 26px "JetBrains Mono", ui-monospace, monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(number), 64, 65)
  ctx.fillText(String(number), 192, 65)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = anisotropy
  return texture
}

/** Fibre grain for the cloth: near-white so it multiplies the felt colour. */
function paintGrain(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 128, 128)
    for (let i = 0; i < 2600; i += 1) {
      const shade = 0.05 + Math.random() * 0.07
      ctx.fillStyle = `rgba(0, 0, 0, ${shade.toFixed(3)})`
      ctx.fillRect(Math.random() * 128, Math.random() * 128, 1.5, 1.5)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(5, 10)
  texture.anisotropy = anisotropy
  return texture
}

/** Faint holographic grid, drawn as an emissive map so it shows in both themes. */
function paintGrid(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, 64, 64)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 64, 2)
    ctx.fillRect(0, 0, 2, 64)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(8, 16)
  texture.anisotropy = anisotropy
  return texture
}

/**
 * The hero's WebGL scene: a billiard table seen from cushion height, with a
 * 25-second loop of break → settle → re-rack.
 *
 * Kept free of Vue on purpose — `HeroScene.vue` owns the lifecycle, this module
 * owns the three.js scene, which is also what keeps `three` out of the initial
 * bundle. Budget notes mirror `heroScene.three.ts`: no shadow pass, procedural
 * textures instead of assets, an fps governor that drops the pixel ratio, and
 * everything disposed on unmount including the GL context.
 */
export function createBilliardScene(
  canvas: HTMLCanvasElement,
  options: BilliardSceneOptions,
): BilliardSceneHandle {
  let palette = options.palette

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !options.mobile,
    powerPreference: 'high-performance',
  })
  renderer.setClearAlpha(0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.mobile ? 1.25 : 1.5))
  const anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4)

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(palette.fog, FOG_DENSITY)

  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 60)
  camera.position.set(CAM_BASE.x, CAM_BASE.y, CAM_BASE.z)

  /** Every geometry / material / texture, disposed in one pass on unmount. */
  const disposables: Array<{ dispose(): void }> = []
  function track<T extends { dispose(): void }>(item: T): T {
    disposables.push(item)
    return item
  }

  // ── Lights ───────────────────────────────────────────────
  // No shadow maps: the sheen comes from the environment map, so a shadow pass
  // would add a second scene render for almost no visible gain here.
  const hemisphere = new THREE.HemisphereLight(palette.accent, palette.ink, 0.95)
  scene.add(hemisphere)
  const keyLight = new THREE.DirectionalLight('#ffffff', 1.15)
  keyLight.position.set(-2.4, 5, 3)
  scene.add(keyLight)

  let environment = buildEnvironment(renderer, palette)
  scene.environment = environment.texture
  scene.environmentIntensity = 0.45

  function addMesh(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    x: number,
    y: number,
    z: number,
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(x, y, z)
    scene.add(mesh)
    return mesh
  }

  // ── Cloth ────────────────────────────────────────────────
  const grain = track(paintGrain(anisotropy))
  const grid = track(paintGrid(anisotropy))

  const feltGeometry = track(new THREE.PlaneGeometry(TABLE_W, TABLE_L))
  feltGeometry.rotateX(-Math.PI / 2)

  const feltMaterial = track(
    new THREE.MeshStandardMaterial({
      color: palette.felt,
      map: grain,
      emissiveMap: grid,
      emissive: new THREE.Color(palette.feltLine),
      emissiveIntensity: 0.14,
      roughness: 0.96,
      metalness: 0,
    }),
  )
  scene.add(new THREE.Mesh(feltGeometry, feltMaterial))

  // ── Cushions, rails and the hairline that catches the light ─
  const cushionMaterial = track(
    new THREE.MeshStandardMaterial({ color: palette.cushion, roughness: 0.82, metalness: 0.06 }),
  )
  const railMaterial = track(
    new THREE.MeshStandardMaterial({ color: palette.rail, roughness: 0.58, metalness: 0.14 }),
  )
  const glintMaterial = track(
    new THREE.MeshBasicMaterial({ color: palette.feltLine, transparent: true, opacity: 0.55 }),
  )

  const railHeight = CUSHION_H * 1.15
  const longCushion = track(new THREE.BoxGeometry(CUSHION, CUSHION_H, TABLE_L))
  const shortCushion = track(new THREE.BoxGeometry(TABLE_W - CUSHION * 2, CUSHION_H, CUSHION))
  const longRail = track(new THREE.BoxGeometry(CUSHION, railHeight, TABLE_L + CUSHION * 2))
  const shortRail = track(new THREE.BoxGeometry(TABLE_W + CUSHION * 2, railHeight, CUSHION))
  const longGlint = track(new THREE.BoxGeometry(0.012, 0.012, TABLE_L - CUSHION * 2))
  const shortGlint = track(new THREE.BoxGeometry(TABLE_W - CUSHION * 2, 0.012, 0.012))

  for (const side of [-1, 1]) {
    addMesh(longCushion, cushionMaterial, side * (HALF_W - CUSHION / 2), CUSHION_H / 2, 0)
    addMesh(longRail, railMaterial, side * (HALF_W + CUSHION / 2), railHeight / 2, 0)
    addMesh(longGlint, glintMaterial, side * (HALF_W - CUSHION), CUSHION_H, 0)

    addMesh(shortCushion, cushionMaterial, 0, CUSHION_H / 2, side * (HALF_L - CUSHION / 2))
    addMesh(shortRail, railMaterial, 0, railHeight / 2, side * (HALF_L + CUSHION / 2))
    addMesh(shortGlint, glintMaterial, 0, CUSHION_H, side * (HALF_L - CUSHION))
  }

  // ── Pockets, cut into the cushion line ───────────────────
  const pockets: Pocket[] = [
    { x: HALF_W - CUSHION, z: HALF_L - CUSHION },
    { x: -(HALF_W - CUSHION), z: HALF_L - CUSHION },
    { x: HALF_W - CUSHION, z: -(HALF_L - CUSHION) },
    { x: -(HALF_W - CUSHION), z: -(HALF_L - CUSHION) },
    { x: HALF_W - CUSHION, z: 0 },
    { x: -(HALF_W - CUSHION), z: 0 },
  ]

  const pocketGeometry = track(new THREE.CircleGeometry(POCKET_R, 18))
  pocketGeometry.rotateX(-Math.PI / 2)
  const pocketMaterial = track(new THREE.MeshBasicMaterial({ color: palette.pocket }))
  const pocketRing = track(new THREE.RingGeometry(POCKET_R, POCKET_R * 1.16, 20))
  pocketRing.rotateX(-Math.PI / 2)
  const pocketRingMaterial = track(
    new THREE.MeshBasicMaterial({ color: palette.feltLine, transparent: true, opacity: 0.3 }),
  )

  for (const pocket of pockets) {
    addMesh(pocketGeometry, pocketMaterial, pocket.x, 0.004, pocket.z)
    addMesh(pocketRing, pocketRingMaterial, pocket.x, 0.005, pocket.z)
  }

  // ── Balls ────────────────────────────────────────────────
  const sphereGeometry = track(
    new THREE.SphereGeometry(BALL_R, options.mobile ? 14 : 26, options.mobile ? 10 : 18),
  )
  const balls: BallState[] = []

  function makeBall(number: number, x: number, z: number): BallState {
    const texture = number === 0 ? null : paintBall(palette, number, anisotropy)
    if (texture) track(texture)

    const material = track(
      new THREE.MeshStandardMaterial({
        // A numbered ball carries its colour in the texture; the cue ball is a
        // solid tint, which reads as the brightest object on the table.
        color: number === 0 ? new THREE.Color(palette.ballRim) : new THREE.Color('#ffffff'),
        map: texture,
        roughness: 0.4,
        metalness: 0.15,
      }),
    )

    const mesh = new THREE.Mesh(sphereGeometry, material)
    mesh.position.set(x, BALL_R, z)
    scene.add(mesh)

    return { mesh, material, number, x, z, vx: 0, vz: 0, sink: 0, home: { x, z } }
  }

  const CUE_HOME = { x: -0.78, z: -0.25 }
  const cueBall = makeBall(0, CUE_HOME.x, CUE_HOME.z)
  balls.push(cueBall)

  // Triangle of 15, apex pointing at the cue ball, one row deeper per step.
  // Offset from the centre line: the hero column of text sits dead centre, so
  // the rack lives in the clear band down the left rail instead.
  const RACK_X = -0.95
  const APEX_Z = -1.2
  const ballGap = BALL_R * 2 + 0.002
  const rowGap = ballGap * 0.866
  let rackNumber = 1
  for (let row = 0; row < 5; row += 1) {
    for (let column = 0; column <= row; column += 1) {
      balls.push(
        makeBall(rackNumber, RACK_X + (column - row / 2) * ballGap, APEX_Z - row * rowGap),
      )
      rackNumber += 1
    }
  }

  // ── Cue stick ────────────────────────────────────────────
  // Built along +z with the tip at the group origin, so aiming the group is
  // just a rotation plus a position in front of the cue ball.
  const cueGroup = new THREE.Group()
  const cueMaterial = track(
    new THREE.MeshStandardMaterial({ color: palette.cue, roughness: 0.5, metalness: 0.16 }),
  )
  const cueTipMaterial = track(new THREE.MeshBasicMaterial({ color: palette.cueTip }))

  const shaftGeometry = track(new THREE.CylinderGeometry(0.016, 0.03, 2.6, 12))
  shaftGeometry.rotateX(-Math.PI / 2)
  shaftGeometry.translate(0, 0, 1.3)
  cueGroup.add(new THREE.Mesh(shaftGeometry, cueMaterial))

  const tipGeometry = track(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 12))
  tipGeometry.rotateX(-Math.PI / 2)
  tipGeometry.translate(0, 0, 0.01)
  cueGroup.add(new THREE.Mesh(tipGeometry, cueTipMaterial))

  scene.add(cueGroup)

  /** Unit vector from the cue ball to the apex of the rack, in the table plane. */
  const aim = new THREE.Vector2(CUE_HOME.x * -1, APEX_Z - CUE_HOME.z).normalize()
  // The stick's body points away from the ball, i.e. along -aim.
  cueGroup.rotation.y = Math.atan2(-aim.x, -aim.y)

  // ── Physics ──────────────────────────────────────────────
  // Plain 2D circles in the x/z plane. A real engine would be overkill: the
  // only thing this has to sell is "the break looks like it has weight".
  const rollAxis = new THREE.Vector3()
  let accumulator = 0

  function stepPhysics(dt: number): void {
    for (const ball of balls) {
      if (ball.sink > 0) continue

      ball.x += ball.vx * dt
      ball.z += ball.vz * dt

      const damping = Math.exp(-FRICTION * dt)
      ball.vx *= damping
      ball.vz *= damping
      if (Math.hypot(ball.vx, ball.vz) < MIN_SPEED) {
        ball.vx = 0
        ball.vz = 0
      }

      // Pockets are checked before the cushions, otherwise a ball bounces off
      // the rail that the hole is cut into instead of dropping.
      let dropped = false
      for (const pocket of pockets) {
        const dx = ball.x - pocket.x
        const dz = ball.z - pocket.z
        if (dx * dx + dz * dz < POCKET_R * POCKET_R) {
          dropped = true
          break
        }
      }
      if (dropped) {
        ball.sink = 0.0001
        ball.vx = 0
        ball.vz = 0
        continue
      }

      if (ball.x > PLAY_X) {
        ball.x = PLAY_X
        ball.vx = -Math.abs(ball.vx) * CUSHION_LOSS
      } else if (ball.x < -PLAY_X) {
        ball.x = -PLAY_X
        ball.vx = Math.abs(ball.vx) * CUSHION_LOSS
      }

      if (ball.z > PLAY_Z) {
        ball.z = PLAY_Z
        ball.vz = -Math.abs(ball.vz) * CUSHION_LOSS
      } else if (ball.z < -PLAY_Z) {
        ball.z = -PLAY_Z
        ball.vz = Math.abs(ball.vz) * CUSHION_LOSS
      }
    }

    // Ball ↔ ball: equal mass, elastic along the contact normal.
    for (let i = 0; i < balls.length; i += 1) {
      const a = balls[i]
      if (!a || a.sink > 0) continue

      for (let j = i + 1; j < balls.length; j += 1) {
        const b = balls[j]
        if (!b || b.sink > 0) continue

        const dx = b.x - a.x
        const dz = b.z - a.z
        const distance = Math.hypot(dx, dz)
        const touching = BALL_R * 2
        if (distance >= touching || distance === 0) continue

        const nx = dx / distance
        const nz = dz / distance
        const push = (touching - distance) / 2
        a.x -= nx * push
        a.z -= nz * push
        b.x += nx * push
        b.z += nz * push

        const along = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz
        if (along > 0) continue // already separating
        const impulse = (-(1 + RESTITUTION) * along) / 2
        a.vx -= impulse * nx
        a.vz -= impulse * nz
        b.vx += impulse * nx
        b.vz += impulse * nz
      }
    }
  }

  /**
   * Fixed timestep, capped at `MAX_STEPS` sub-steps per frame.
   *
   * At `BREAK_SPEED` a ball covers a full diameter in ~2 frames, so a single
   * variable-step integration would let it tunnel straight through the rack.
   */
  function advance(dt: number): void {
    accumulator += dt
    let steps = 0
    while (accumulator >= FIXED_DT && steps < MAX_STEPS) {
      stepPhysics(FIXED_DT)
      accumulator -= FIXED_DT
      steps += 1
    }
    // Never let the accumulator spiral on a slow frame.
    if (steps === MAX_STEPS) accumulator = 0
  }

  let resetting = false

  function syncBalls(dt: number): void {
    for (const ball of balls) {
      if (ball.sink > 0) {
        ball.sink = Math.min(1, ball.sink + dt * 1.7)
        ball.mesh.position.set(ball.x, BALL_R - BALL_R * 2.4 * ball.sink, ball.z)
        ball.mesh.scale.setScalar(Math.max(1 - ball.sink, 0.001))
        continue
      }

      // The re-rack animation owns scale and height during its window.
      if (resetting) continue

      ball.mesh.position.set(ball.x, BALL_R, ball.z)

      const speed = Math.hypot(ball.vx, ball.vz)
      if (speed > 0.004) {
        // Rolling without slipping: the spin axis is perpendicular to travel.
        rollAxis.set(ball.vz / speed, 0, -ball.vx / speed)
        ball.mesh.rotateOnWorldAxis(rollAxis, (speed * dt) / BALL_R)
      }
    }
  }

  // ── Director: one 25s loop of aim → break → settle → re-rack ─
  let cycleIndex = -1
  let struck = false
  let reracked = false
  let impact = 0

  function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3)
  }

  function resetBalls(): void {
    for (const ball of balls) {
      ball.x = ball.home.x
      ball.z = ball.home.z
      ball.vx = 0
      ball.vz = 0
      ball.sink = 0
      ball.mesh.quaternion.identity()
      ball.mesh.position.set(ball.home.x, BALL_R, ball.home.z)
      ball.mesh.scale.setScalar(0.001)
    }
  }

  function updateDirector(time: number): void {
    const cycle = Math.floor(time / CYCLE)
    if (cycle !== cycleIndex) {
      cycleIndex = cycle
      struck = false
      reracked = false
    }

    const t = time % CYCLE
    resetting = t >= T_RESET && t < T_RESET + RESET_SHRINK + RESET_GROW

    // Stick: waits off-table, slides in, pulls back, thrusts.
    let gap = 0.42 + Math.max(0, (T_AIM - t) * 0.12)
    if (t >= T_AIM && t < T_STRIKE) {
      gap = 0.42 + 0.62 * ((t - T_AIM) / (T_STRIKE - T_AIM))
    } else if (t >= T_STRIKE && t < T_HIT) {
      gap = 0.06 + 0.42 * (1 - (t - T_STRIKE) / (T_HIT - T_STRIKE))
    }

    cueGroup.visible = t < T_HIT
    cueGroup.position.set(
      cueBall.x + aim.x * (BALL_R + gap),
      BALL_R * 1.02,
      cueBall.z + aim.y * (BALL_R + gap),
    )

    if (!struck && t >= T_HIT) {
      struck = true
      cueBall.vx = aim.x * BREAK_SPEED
      cueBall.vz = aim.y * BREAK_SPEED
      // A little noise per ball so no two breaks look like a recording.
      for (const ball of balls) {
        ball.vx += (Math.random() - 0.5) * 0.015
        ball.vz += (Math.random() - 0.5) * 0.015
      }
    }

    // Re-rack: shrink out, snap home, grow back in.
    if (t >= T_RESET && t < T_RESET + RESET_SHRINK) {
      const k = 1 - (t - T_RESET) / RESET_SHRINK
      for (const ball of balls) {
        ball.mesh.scale.setScalar(Math.max(k, 0.001))
        ball.mesh.position.y = BALL_R - (1 - k) * BALL_R * 1.6
      }
    } else if (t >= T_RESET + RESET_SHRINK && !reracked) {
      reracked = true
      resetBalls()
    } else if (reracked && t < T_RESET + RESET_SHRINK + RESET_GROW) {
      const k = easeOutCubic((t - (T_RESET + RESET_SHRINK)) / RESET_GROW)
      for (const ball of balls) {
        ball.mesh.scale.setScalar(Math.max(k, 0.001))
      }
    }

    // A short camera punch on contact, so the break has weight.
    const sinceHit = t - T_HIT
    impact = sinceHit >= 0 && sinceHit < 0.3 ? (1 - sinceHit / 0.3) * 0.16 : 0
  }

  // ── Camera: pointer parallax, idle drift, scroll dolly ─────
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 }
  let scrollProgress = 0
  let portraitScale = 1
  /** Portrait tilts the camera up, which pushes the table towards the bottom. */
  let portraitLift = 0

  function onPointerMove(event: PointerEvent): void {
    pointer.targetX = (event.clientX / window.innerWidth) * 2 - 1
    pointer.targetY = (event.clientY / window.innerHeight) * 2 - 1
  }

  function updateCamera(time: number): void {
    const drift = Math.sin(time * 0.21) * 0.05

    camera.position.set(
      CAM_BASE.x + drift + pointer.x * 0.26,
      CAM_BASE.y + Math.sin(time * 0.17 + 1.2) * 0.02 - pointer.y * 0.06 + scrollProgress * 0.5,
      CAM_BASE.z * portraitScale * (1 + scrollProgress * 0.16) - impact,
    )
    camera.lookAt(
      LOOK_BASE.x + pointer.x * 0.12,
      LOOK_BASE.y + portraitLift + scrollProgress * 0.1,
      LOOK_BASE.z,
    )
  }

  // ── Frame loop + performance governor ─────────────────────
  const clock = new THREE.Clock()
  let raf = 0
  let frames = 0
  let elapsed = 0
  let degraded = false

  function degrade(): void {
    degraded = true
    renderer.setPixelRatio(1)
    feltMaterial.emissiveIntensity = 0
    glintMaterial.opacity = 0.22
    scene.environmentIntensity = 0.3
  }

  function frame(): void {
    raf = requestAnimationFrame(frame)

    const delta = Math.min(clock.getDelta(), 0.05)
    const time = clock.elapsedTime

    pointer.x += (pointer.targetX - pointer.x) * 0.05
    pointer.y += (pointer.targetY - pointer.y) * 0.05

    updateDirector(time)
    advance(delta)
    syncBalls(delta)
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

    // Portrait crops the long axis of the table, so widen the lens and pull the
    // camera back instead of letting the rack fall out of frame.
    const portrait = width / height < 1
    portraitScale = portrait ? 1.15 : 1
    portraitLift = portrait ? 0.26 : 0
    camera.fov = portrait ? 56 : 44
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  // ── Theme ────────────────────────────────────────────────
  /**
   * Re-tints everything in place. Called on a theme switch instead of rebuilding
   * the scene, so the loop keeps its position and nothing is re-created twice.
   */
  function setPalette(next: ScenePalette): void {
    palette = next

    scene.fog?.color.set(next.fog)
    feltMaterial.color.set(next.felt)
    feltMaterial.emissive.set(next.feltLine)
    glintMaterial.color.set(next.feltLine)
    pocketRingMaterial.color.set(next.feltLine)
    cushionMaterial.color.set(next.cushion)
    railMaterial.color.set(next.rail)
    pocketMaterial.color.set(next.pocket)
    cueMaterial.color.set(next.cue)
    cueTipMaterial.color.set(next.cueTip)
    hemisphere.color.set(next.accent)
    hemisphere.groundColor.set(next.ink)

    for (const ball of balls) {
      if (ball.number === 0) {
        ball.material.color.set(next.ballRim)
        continue
      }

      // The numeral is baked into the texture, so it has to be repainted.
      const previous = ball.material.map
      const texture = paintBall(next, ball.number, anisotropy)
      if (texture) track(texture)
      ball.material.map = texture
      ball.material.color.set('#ffffff')
      ball.material.needsUpdate = true
      previous?.dispose()
    }

    const previousEnvironment = environment
    environment = buildEnvironment(renderer, next)
    scene.environment = environment.texture
    previousEnvironment.dispose()
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
