import { CarBrand, Question } from '../types/game';
import { carBrands } from '../data/carData';

/**
 * Returns brands available at the given score.
 * Score 0-4: Tier 1 only
 * Score 5-9: Tier 1 + 2
 * Score 10+: All tiers
 */
export function getAvailableBrands(score: number): CarBrand[] {
  if (score >= 10) return carBrands;
  if (score >= 5) return carBrands.filter(b => b.tier <= 2);
  return carBrands.filter(b => b.tier === 1);
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
 * Picks a random brand, selects a correct model, and fills
 * 3 distractor models from other brands.
 *
 * Because model names are globally unique across all brands
 * (enforced by carData integrity tests), distractors are
 * guaranteed to be unambiguous.
 */
export function generateQuestion(score: number): Question {
  const available = getAvailableBrands(score);

  // Pick a random brand
  const brandIndex = Math.floor(Math.random() * available.length);
  const brand = available[brandIndex];

  // Pick a correct model from this brand
  const correctModel = brand.models[Math.floor(Math.random() * brand.models.length)];

  // Collect distractor models from other brands
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
