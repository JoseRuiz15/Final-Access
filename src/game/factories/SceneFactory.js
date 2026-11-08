import PhysicsService from '../services/PhysicsService.js'
import InputService from '../services/InputService.js'
import PiniaGameRepository from '../repositories/PiniaGameRepository.js'
import AnimationRegistry from '../builders/AnimationRegistry.js'
import AssetLoader from '../builders/AssetLoader.js'
import ParallaxBuilder from '../builders/ParallaxBuilder.js'
import MapBuilder from '../builders/MapBuilder.js'
import TutorialUI from '../builders/TutorialUI.js'
import CollisionSetup from '../builders/CollisionSetup.js'
import DoorManager from '../managers/DoorManager.js'
import KeyManager from '../managers/KeyManager.js'
import ExplosionManager from '../managers/ExplosionManager.js'
import MovingPlatformManager from '../managers/MovingPlatformManager.js'
import Level1Scene from '../scenes/Level1Scene.js'
import Level2Scene from '../scenes/Level2Scene.js'
import Level3Scene from '../scenes/Level3Scene.js'
import Level4Scene from '../scenes/Level4Scene.js'
import Level5Scene from '../scenes/Level5Scene.js'
import Level6Scene from '../scenes/Level6Scene.js'
import MultiplayerLevel6Scene from '../scenes/MultiplayerLevel6Scene.js'

function createDependencies() {
  return {
    physicsService: new PhysicsService(),
    inputService: new InputService(),
    gameRepository: new PiniaGameRepository(),
    animationRegistry: new AnimationRegistry(),
    assetLoader: AssetLoader,
    parallaxBuilder: ParallaxBuilder,
    mapBuilder: MapBuilder,
    tutorialUI: TutorialUI,
    collisionSetup: CollisionSetup,
    doorManager: new DoorManager({ doorLayerName: 'DoorObject' }),
    keyManager: new KeyManager(),
    explosionManager: new ExplosionManager(),
    movingPlatformManager: new MovingPlatformManager(),
  }
}

export class SceneFactory {
  static createLevel1Scene() {
    const deps = createDependencies()
    const scene = new Level1Scene(deps)
    return scene
  }

  static createLevel2Scene() {
    const deps = createDependencies()
    const scene = new Level2Scene(deps)
    return scene
  }

  static createLevel3Scene() {
    const deps = createDependencies()
    const scene = new Level3Scene(deps)
    return scene
  }

  static createLevel4Scene() {
    const deps = createDependencies()
    const scene = new Level4Scene(deps)
    return scene
  }

  static createLevel5Scene() {
    const deps = createDependencies()
    const scene = new Level5Scene(deps)
    return scene
  }

  static createLevel6Scene() {
    const deps = createDependencies()
    const scene = new Level6Scene(deps)
    return scene
  }

  static createMultiplayerLevel6Scene(multiplayerStore) {
    const deps = createDependencies()
    return new MultiplayerLevel6Scene(deps, multiplayerStore)
  }
}

export default SceneFactory
