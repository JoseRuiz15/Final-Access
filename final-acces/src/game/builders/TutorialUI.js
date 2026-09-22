export default class TutorialUI {
  static create(scene, tutorialImages) {
    const elements = {}

    tutorialImages.forEach(({ key, x, y, scale = 1 }) => {
      const img = scene.add.image(x, y, key)
      img.setScale(scale)
      elements[key] = img
    })

    TutorialUI.hideAll(elements)
    return elements
  }

  static hideAll(elements) {
    Object.values(elements).forEach((el) => el.setVisible(false))
  }

  static show(elements, key) {
    TutorialUI.hideAll(elements)
    if (elements[key]) elements[key].setVisible(true)
  }
}
