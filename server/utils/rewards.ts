/**
 * Reward point calculation for manuscript reviews.
 *
 * Rules:
 * - Rating 5 & charCount >= 500 => 1,000 Points
 * - Rating 5 & charCount < 500 => 800 Points
 * - Rating 4 & charCount >= 300 => 500 Points
 * - Rating 4 & charCount < 300 => 300 Points
 * - Rating 3 & charCount >= 200 => 200 Points
 * - Rating 3 & charCount < 200 => 100 Points
 * - Rating 1 or 2 => 0 Points
 */
export function calculateReviewPoints(rating: number, charCount: number): {
  points: number
  tierName: string
  nextTierHint?: string
} {
  const cleanRating = Math.max(1, Math.min(5, Math.round(rating)))

  if (cleanRating === 5) {
    if (charCount >= 500) {
      return {
        points: 1000,
        tierName: 'Ulasan Sangat Lengkap (Bintang 5)'
      }
    }
    const diff = 500 - charCount
    return {
      points: 800,
      tierName: 'Ulasan Ringkas (Bintang 5)',
      nextTierHint: `Tulis ${diff} karakter lagi untuk mendapatkan bonus maksimal 1.000 Poin!`
    }
  }

  if (cleanRating === 4) {
    if (charCount >= 300) {
      return {
        points: 500,
        tierName: 'Ulasan Detail (Bintang 4)'
      }
    }
    const diff = 300 - charCount
    return {
      points: 300,
      tierName: 'Ulasan Standar (Bintang 4)',
      nextTierHint: `Tulis ${diff} karakter lagi untuk mendapatkan bonus 500 Poin!`
    }
  }

  if (cleanRating === 3) {
    if (charCount >= 200) {
      return {
        points: 200,
        tierName: 'Ulasan Cukup (Bintang 3)'
      }
    }
    return {
      points: 100,
      tierName: 'Ulasan Ringkas (Bintang 3)'
    }
  }

  return {
    points: 0,
    tierName: 'Masukan & Saran Konstruktif'
  }
}
