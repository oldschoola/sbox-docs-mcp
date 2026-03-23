import MiniSearch from 'minisearch'
import { fetchPage } from '../lib/fetcher.js'

export interface ApiSearchResult {
  name: string
  fullName: string
  summary: string
}

interface ApiEntry {
  id: string
  name: string
  fullName: string
  summary: string
  content: string
}

// Common API types to seed the index
const KNOWN_API_TYPES: { name: string; fullName: string; summary: string }[] = [
  { name: 'Component', fullName: 'Sandbox.Component', summary: 'Base class for all components attached to GameObjects' },
  { name: 'GameObject', fullName: 'Sandbox.GameObject', summary: 'An object in the scene with transform, components, and hierarchy' },
  { name: 'Scene', fullName: 'Sandbox.Scene', summary: 'A scene containing GameObjects' },
  { name: 'Model', fullName: 'Sandbox.Model', summary: 'A 3D model asset' },
  { name: 'Material', fullName: 'Sandbox.Material', summary: 'A material for rendering' },
  { name: 'Texture', fullName: 'Sandbox.Texture', summary: 'A texture asset' },
  { name: 'Sound', fullName: 'Sandbox.Sound', summary: 'A sound asset' },
  { name: 'Prefab', fullName: 'Sandbox.Prefab', summary: 'A prefab asset - a template for GameObject hierarchies' },
  { name: 'MeshComponent', fullName: 'Sandbox.MeshComponent', summary: 'Renders a mesh' },
  { name: 'ModelRenderer', fullName: 'Sandbox.ModelRenderer', summary: 'Renders a model with materials' },
  { name: 'SkinnedModelRenderer', fullName: 'Sandbox.SkinnedModelRenderer', summary: 'Renders a skinned/animated model' },
  { name: 'CameraComponent', fullName: 'Sandbox.CameraComponent', summary: 'Camera for rendering the scene' },
  { name: 'Light', fullName: 'Sandbox.Light', summary: 'Base light component' },
  { name: 'PointLight', fullName: 'Sandbox.PointLight', summary: 'A point light source' },
  { name: 'SpotLight', fullName: 'Sandbox.SpotLight', summary: 'A spot light source' },
  { name: 'DirectionalLight', fullName: 'Sandbox.DirectionalLight', summary: 'A directional (sun) light' },
  { name: 'AmbientLight', fullName: 'Sandbox.AmbientLight', summary: 'Ambient lighting for the scene' },
  { name: 'Collider', fullName: 'Sandbox.Collider', summary: 'Base collider component for physics' },
  { name: 'BoxCollider', fullName: 'Sandbox.BoxCollider', summary: 'Box-shaped collider' },
  { name: 'SphereCollider', fullName: 'Sandbox.SphereCollider', summary: 'Sphere-shaped collider' },
  { name: 'CapsuleCollider', fullName: 'Sandbox.CapsuleCollider', summary: 'Capsule-shaped collider' },
  { name: 'MeshCollider', fullName: 'Sandbox.MeshCollider', summary: 'Collider from a mesh' },
  { name: 'Rigidbody', fullName: 'Sandbox.Rigidbody', summary: 'Physics rigid body simulation' },
  { name: 'CharacterController', fullName: 'Sandbox.CharacterController', summary: 'Character movement controller' },
  { name: 'PlayerController', fullName: 'Sandbox.PlayerController', summary: 'Player input and camera controller' },
  { name: 'ParticleEffect', fullName: 'Sandbox.ParticleEffect', summary: 'Particle system effect' },
  { name: 'ParticleEmitter', fullName: 'Sandbox.ParticleEmitter', summary: 'Emits particles' },
  { name: 'NavMeshAgent', fullName: 'Sandbox.NavMeshAgent', summary: 'Navigation mesh pathfinding agent' },
  { name: 'SoundBoxComponent', fullName: 'Sandbox.SoundBoxComponent', summary: 'Plays a sound in 3D space' },
  { name: 'SoundPointComponent', fullName: 'Sandbox.SoundPointComponent', summary: 'Point sound source' },
  { name: 'Decal', fullName: 'Sandbox.Decal', summary: 'Projects a decal onto surfaces' },
  { name: 'Prop', fullName: 'Sandbox.Prop', summary: 'A physics prop that can be interacted with' },
  { name: 'SpawnPoint', fullName: 'Sandbox.SpawnPoint', summary: 'Player spawn point' },
  { name: 'PostProcess', fullName: 'Sandbox.PostProcess', summary: 'Base post processing effect' },
  { name: 'Bloom', fullName: 'Sandbox.Bloom', summary: 'Bloom post process effect' },
  { name: 'ColorAdjustments', fullName: 'Sandbox.ColorAdjustments', summary: 'Color adjustments post process' },
  { name: 'ScreenSpaceReflections', fullName: 'Sandbox.ScreenSpaceReflections', summary: 'SSR post process effect' },
  { name: 'Joint', fullName: 'Sandbox.Joint', summary: 'Base physics joint constraint' },
  { name: 'HingeJoint', fullName: 'Sandbox.HingeJoint', summary: 'Hinge/rotational joint constraint' },
  { name: 'FixedJoint', fullName: 'Sandbox.FixedJoint', summary: 'Fixed joint constraint' },
  { name: 'SpringJoint', fullName: 'Sandbox.SpringJoint', summary: 'Spring joint constraint' },
  { name: 'SliderJoint', fullName: 'Sandbox.SliderJoint', summary: 'Slider/prismatic joint constraint' },
  { name: 'BallJoint', fullName: 'Sandbox.BallJoint', summary: 'Ball-and-socket joint constraint' },
  { name: 'WheelJoint', fullName: 'Sandbox.WheelJoint', summary: 'Wheel joint constraint for vehicles' },
  { name: 'WorldPanel', fullName: 'Sandbox.WorldPanel', summary: 'A panel rendered in world space' },
  { name: 'ScreenPanel', fullName: 'Sandbox.ScreenPanel', summary: 'A panel rendered in screen space' },
  { name: 'PanelComponent', fullName: 'Sandbox.PanelComponent', summary: 'Base UI panel component' },
  { name: 'MapInstance', fullName: 'Sandbox.MapInstance', summary: 'Instances a map into the scene' },
  { name: 'Terrain', fullName: 'Sandbox.Terrain', summary: 'Terrain component for landscapes' },
  { name: 'VerletRope', fullName: 'Sandbox.VerletRope', summary: 'Rope simulation using verlet integration' },
  { name: 'NetworkHelper', fullName: 'Sandbox.NetworkHelper', summary: 'Helper for networking GameObjects' },
  { name: 'SceneInformation', fullName: 'Sandbox.SceneInformation', summary: 'Provides scene-level information' },
  { name: 'LineRenderer', fullName: 'Sandbox.LineRenderer', summary: 'Renders lines in 3D space' },
  { name: 'TextRenderer', fullName: 'Sandbox.TextRenderer', summary: 'Renders text in 3D space' },
  { name: 'SpriteRenderer', fullName: 'Sandbox.SpriteRenderer', summary: 'Renders a sprite/billboard' },
  { name: 'Dresser', fullName: 'Sandbox.Dresser', summary: 'Applies clothing items to models' },
  { name: 'LipSync', fullName: 'Sandbox.LipSync', summary: 'Lip sync animation from audio' },
  { name: 'BeamEffect', fullName: 'Sandbox.BeamEffect', summary: 'Renders a beam effect' },
  { name: 'TrailRenderer', fullName: 'Sandbox.TrailRenderer', summary: 'Renders a trail behind a moving object' },
  { name: 'Input', fullName: 'Sandbox.Input', summary: 'Global input system for reading keyboard, mouse, and controller' },
  { name: 'Time', fullName: 'Sandbox.Time', summary: 'Time and delta time information' },
  { name: 'Vector3', fullName: 'Sandbox.Vector3', summary: '3D vector type' },
  { name: 'Rotation', fullName: 'Sandbox.Rotation', summary: 'Rotation type (quaternion)' },
  { name: 'Transform', fullName: 'Sandbox.Transform', summary: 'Position, rotation, and scale combined' },
  { name: 'Network', fullName: 'Sandbox.Network', summary: 'Networking system' },
]

export class SearchApiIndex {
  private minisearch: MiniSearch<ApiEntry> | null = null
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    this.minisearch = new MiniSearch<ApiEntry>({
      fields: ['name', 'fullName', 'summary', 'content'],
      storeFields: ['name', 'fullName', 'summary'],
      searchOptions: {
        boost: { name: 5, fullName: 3, summary: 1 },
        prefix: true,
        fuzzy: 0.3,
      },
    })

    const docs: ApiEntry[] = KNOWN_API_TYPES.map((t) => ({
      id: t.fullName,
      name: t.name,
      fullName: t.fullName,
      summary: t.summary,
      content: `${t.name} ${t.summary}`,
    }))

    this.minisearch.addAll(docs)
    this.initialized = true
  }

  search(query: string, limit = 10): ApiSearchResult[] {
    if (!this.minisearch) return []

    const results = this.minisearch.search(query, {
      boost: { name: 5, fullName: 3, summary: 1 },
    })

    return results.slice(0, limit).map((r) => ({
      name: r.name,
      fullName: r.fullName,
      summary: r.summary,
    }))
  }
}
