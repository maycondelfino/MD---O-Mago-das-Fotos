// types.js

// Export dummy objects for types to prevent runtime errors if imports are still present in other files
export const Tool = {};
export const HistoryState = {};
export const ColorBalanceValue = {};
export const ColorBalance = {};
export const ToneCurvePoint = {};
export const ToneCurvesState = {};

// JSDoc definitions below for documentation purposes (ignored by runtime)
/**
 * @typedef {object} Tool
 * @property {string} id
 * @property {string} module
 * @property {string} icon
 * @property {string} name
 * @property {string} description
 * @property {string} promptSuggestion
 * @property {boolean} [isGenerator]
 * @property {boolean} [disabled]
 * @property {boolean} [isManualControl]
 * @property {{ name: string; prompt: string }[]} [predefinedStyles]
 * @property {boolean} [oneClick]
 * @property {string[]} [promptExamples]
 */

/**
 * @typedef {object} ColorBalanceValue
 * @property {string} color
 * @property {number} intensity
 */

/**
 * @typedef {object} ColorBalance
 * @property {ColorBalanceValue} shadows
 * @property {ColorBalanceValue} midtones
 * @property {ColorBalanceValue} highlights
 */

/**
 * @typedef {object} ToneCurvePoint
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {object} ToneCurvesState
 * @property {ToneCurvePoint[]} rgb
 * @property {ToneCurvePoint[]} r
 * @property {ToneCurvePoint[]} g
 * @property {ToneCurvePoint[]} b
 */

/**
 * @typedef {object} HistoryState
 * @property {string} imageUrl
 * @property {number} width
 * @property {number} height
 * @property {string} actionName
 * @property {string} thumbnailUrl
 * @property {number} contrast
 * @property {number} brightness
 * @property {number} saturation
 * @property {number} lightness
 * @property {number} sepia
 * @property {number} hue
 * @property {number} vintage
 * @property {number} shadows
 * @property {number} highlights
 * @property {ColorBalance} colorBalance
 * @property {string} gradientStartColor
 * @property {string} gradientEndColor
 * @property {number} gradientIntensity
 * @property {number} contour
 * @property {string | null} [selectionMask]
 * @property {string} frameColor
 * @property {number} frameThickness
 * @property {number} framePadding
 * @property {number} vignetteIntensity
 * @property {number} vignetteSize
 * @property {ToneCurvesState} toneCurves
 * @property {string} duotoneColor1
 * @property {string} duotoneColor2
 * @property {number} duotoneIntensity
 * @property {string} backgroundColor
 * @property {number} sharpness
 * @property {'edge' | 'clarity'} sharpnessMode
 * @property {string} [originalPrompt]
 * @property {'good' | 'bad' | null} [feedback]
 * @property {number} nightModeIntensity
 * @property {number} beautySkinSmoothing
 * @property {number} beautyWrinkles
 * @property {number} beautyDarkCircles
 * @property {number} beautyLipColor
 * @property {number} beautyFillBeard
 * @property {number} beautyFillEyebrows
 * @property {string} beautyHairColor
 * @property {number} ageChange
 * @property {number} weightChange
 */