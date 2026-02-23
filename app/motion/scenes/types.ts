import type { DesignColors } from '../useDesignTokenColors'

export interface SceneContext {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  colors: DesignColors
  width: number
  height: number
  density: number
}

export interface SceneModule {
  init(ctx: SceneContext): void
  update(ctx: SceneContext, delta: number): void
  draw(ctx: SceneContext): void
  destroy(): void
  onMouseMove?: (x: number, y: number) => void
  onClick?: (x: number, y: number) => void
}
