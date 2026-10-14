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
import Level1Scene from '../scenes/Level1Scene.js'
import Level2Scene from '../scenes/Level2Scene.js'

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
    doorManager: new DoorManager(),
    keyManager: new KeyManager(),
    explosionManager: new ExplosionManager(),
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
}

export default SceneFactory
