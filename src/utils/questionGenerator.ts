import { CarBrand, DifficultyTier, Question } from '../types/game';
import { carBrands } from '../data/carData';

/**
 * Determines the tier for a given score using cyclic assignment:
 * Scores 0-9: Tier 1, 10-19: Tier 2, 20-29: Tier 3, 30-39: Tier 1, ...
 */
export function getTierForScore(score: number): DifficultyTier {
  const cycle = Math.floor(score / 10) % 3;
  return (cycle + 1) as DifficultyTier;
}

/**
 * Returns brands from the tier that matches the given score's cycle position.
 */
export function getBrandsForScore(score: number): CarBrand[] {
  const tier = getTierForScore(score);
  return carBrands.filter(b => b.tier === tier);
}

/**
 * Shuffles an array using Fisher-Yates. Returns a new array.
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates a trivia question for the given score level.
 * Picks a random brand from the current tier, selects a correct model,
 * and fills 3 distractor models from other brands in the same tier.
 */
export function generateQuestion(score: number): Question {
  const available = getBrandsForScore(score);

  // Pick a random brand
  const brandIndex = Math.floor(Math.random() * available.length);
  const brand = available[brandIndex];

  // Pick a correct model from this brand
  const correctModel = brand.models[Math.floor(Math.random() * brand.models.length)];

  // Collect distractor models from other brands in the same tier
  const otherBrands = available.filter(b => b.name !== brand.name);
  const allOtherModels = otherBrands.flatMap(b => b.models);
  const shuffledOtherModels = shuffle(allOtherModels);

  // Pick 3 unique distractors
  const distractors: string[] = [];
  const used = new Set<string>([correctModel]);
  for (const model of shuffledOtherModels) {
    if (!used.has(model) && distractors.length < 3) {
      distractors.push(model);
      used.add(model);
    }
  }

  // Combine and shuffle options
  const options = shuffle([correctModel, ...distractors]);

  return { brand, correctModel, options };
}
