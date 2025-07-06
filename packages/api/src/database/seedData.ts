/**
 * Comprehensive Database Seeding System
 * Generates realistic user profiles, test results, and application data
 */

import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

// User skill level definitions
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'professional';

export interface UserSeedData {
  email: string;
  displayName: string;
  skillLevel: SkillLevel;
  preferredMode: 'time' | 'words' | 'quote';
  joinDate: Date;
  totalTests: number;
  averageWPM: number;
  bestWPM: number;
  averageAccuracy: number;
  preferredLanguage: string;
  timezone: string;
  isActive: boolean;
}

export interface TestResultSeedData {
  wpm: number;
  accuracy: number;
  rawWpm: number;
  consistency: number;
  mode: string;
  duration?: number;
  wordCount?: number;
  difficulty: string;
  textSource: string;
  timestamp: Date;
  totalChars: number;
  correctChars: number;
  incorrectChars: number;
  errorRate: number;
}

/**
 * Skill level configurations for realistic progression
 */
export const SKILL_CONFIGS = {
  beginner: {
    wpmRange: [15, 35],
    accuracyRange: [85, 95],
    consistencyRange: [70, 85],
    testFrequency: [1, 3], // tests per week
    improvementRate: 0.15, // 15% improvement potential
    preferredModes: ['time', 'words'],
    difficulties: ['Normal'],
    wordLists: ['english1k'],
    sessionLength: [5, 15], // minutes
  },
  intermediate: {
    wpmRange: [30, 55],
    accuracyRange: [90, 97],
    consistencyRange: [80, 90],
    testFrequency: [3, 7],
    improvementRate: 0.12,
    preferredModes: ['time', 'words'],
    difficulties: ['Normal', 'Expert'],
    wordLists: ['english1k', 'english10k'],
    sessionLength: [10, 30],
  },
  advanced: {
    wpmRange: [50, 85],
    accuracyRange: [94, 98.5],
    consistencyRange: [85, 95],
    testFrequency: [5, 12],
    improvementRate: 0.08,
    preferredModes: ['time', 'words', 'quote'],
    difficulties: ['Normal', 'Expert', 'Master'],
    wordLists: ['english1k', 'english10k', 'javascript', 'python'],
    sessionLength: [15, 45],
  },
  expert: {
    wpmRange: [80, 120],
    accuracyRange: [96, 99.2],
    consistencyRange: [90, 98],
    testFrequency: [8, 15],
    improvementRate: 0.05,
    preferredModes: ['time', 'words', 'quote'],
    difficulties: ['Expert', 'Master'],
    wordLists: ['english10k', 'javascript', 'python'],
    sessionLength: [20, 60],
  },
  professional: {
    wpmRange: [100, 150],
    accuracyRange: [98, 99.8],
    consistencyRange: [95, 99],
    testFrequency: [10, 20],
    improvementRate: 0.02,
    preferredModes: ['time', 'quote'],
    difficulties: ['Master'],
    wordLists: ['english10k', 'javascript', 'python'],
    sessionLength: [30, 90],
  },
};

/**
 * Generate realistic user personas with varied backgrounds
 */
export const generateUserPersonas = (count: number): UserSeedData[] => {
  const users: UserSeedData[] = [];
  
  // Define user persona distributions
  const skillDistribution = {
    beginner: 0.3,      // 30% beginners
    intermediate: 0.35, // 35% intermediate
    advanced: 0.25,     // 25% advanced
    expert: 0.08,       // 8% expert
    professional: 0.02  // 2% professional
  };

  for (let i = 0; i < count; i++) {
    const skillLevel = selectSkillLevel(skillDistribution);
    const config = SKILL_CONFIGS[skillLevel];
    
    const joinDate = faker.date.between({ 
      from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      to: new Date()
    });
    
    const daysSinceJoin = Math.floor((Date.now() - joinDate.getTime()) / (24 * 60 * 60 * 1000));
    const weeksActive = Math.min(daysSinceJoin / 7, 52);
    
    const testFrequency = faker.number.int({ 
      min: config.testFrequency[0], 
      max: config.testFrequency[1] 
    });
    
    const totalTests = Math.floor(weeksActive * testFrequency * faker.number.float({ min: 0.7, max: 1.3 }));
    
    const baseWpm = faker.number.int({ min: config.wpmRange[0], max: config.wpmRange[1] });
    const improvementFactor = Math.min(totalTests * config.improvementRate / 100, 0.4);
    const currentWpm = Math.floor(baseWpm * (1 + improvementFactor));
    
    const accuracy = faker.number.float({ 
      min: config.accuracyRange[0], 
      max: config.accuracyRange[1],
      fractionDigits: 1
    });

    users.push({
      email: faker.internet.email().toLowerCase(),
      displayName: faker.person.fullName(),
      skillLevel,
      preferredMode: faker.helpers.arrayElement(config.preferredModes) as 'time' | 'words',
      joinDate,
      totalTests,
      averageWPM: currentWpm,
      bestWPM: Math.floor(currentWpm * faker.number.float({ min: 1.1, max: 1.4 })),
      averageAccuracy: accuracy,
      preferredLanguage: faker.helpers.weightedArrayElement([
        { weight: 70, value: 'en' },
        { weight: 10, value: 'es' },
        { weight: 8, value: 'fr' },
        { weight: 5, value: 'de' },
        { weight: 4, value: 'pt' },
        { weight: 3, value: 'it' }
      ]),
      timezone: faker.location.timeZone(),
      isActive: faker.helpers.weightedArrayElement([
        { weight: 80, value: true },
        { weight: 20, value: false }
      ])
    });
  }

  return users;
};

/**
 * Generate realistic test results showing skill progression
 */
export const generateTestResults = (
  user: UserSeedData,
  timeSpanDays: number = 90
): TestResultSeedData[] => {
  const results: TestResultSeedData[] = [];
  const config = SKILL_CONFIGS[user.skillLevel];
  
  const startDate = new Date(user.joinDate);
  const endDate = new Date(Math.min(
    user.joinDate.getTime() + timeSpanDays * 24 * 60 * 60 * 1000,
    Date.now()
  ));
  
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  const testsPerWeek = faker.number.int({ min: config.testFrequency[0], max: config.testFrequency[1] });
  const totalTests = Math.floor((totalDays / 7) * testsPerWeek);
  
  // Generate skill progression curve
  const startingWpm = config.wpmRange[0];
  const targetWpm = user.averageWPM;
  
  for (let i = 0; i < totalTests; i++) {
    const progress = i / Math.max(totalTests - 1, 1);
    const sessionVariation = faker.number.float({ min: 0.85, max: 1.15 });
    
    // Skill progression with realistic variations
    const progressWpm = startingWpm + (targetWpm - startingWpm) * Math.pow(progress, 0.7);
    const wpm = Math.floor(progressWpm * sessionVariation);
    
    // Accuracy tends to be more stable but can vary with speed
    const baseAccuracy = faker.number.float({ 
      min: config.accuracyRange[0], 
      max: config.accuracyRange[1],
      fractionDigits: 1
    });
    const speedAccuracyPenalty = Math.max(0, (wpm - config.wpmRange[0]) * 0.1);
    const accuracy = Math.max(
      config.accuracyRange[0], 
      baseAccuracy - speedAccuracyPenalty + faker.number.float({ min: -2, max: 2 })
    );
    
    // Generate test timestamp with realistic patterns
    const dayProgress = progress * totalDays;
    const testDay = Math.floor(dayProgress);
    
    // Add some clustering of tests (users often do multiple tests in a session)
    const isClusteredSession = faker.datatype.boolean({ probability: 0.3 });
    const baseTime = startDate.getTime() + testDay * 24 * 60 * 60 * 1000;
    
    let testTime: Date;
    if (isClusteredSession && i > 0) {
      // Cluster within 1 hour of previous test
      const prevResult = results[i - 1];
      testTime = new Date(prevResult.timestamp.getTime() + faker.number.int({ min: 2, max: 60 }) * 60 * 1000);
    } else {
      // Random time during typical usage hours (9 AM - 11 PM)
      const hourOffset = faker.number.int({ min: 9, max: 23 }) * 60 * 60 * 1000;
      const minuteOffset = faker.number.int({ min: 0, max: 59 }) * 60 * 1000;
      testTime = new Date(baseTime + hourOffset + minuteOffset);
    }
    
    // Ensure test time doesn't exceed current time
    if (testTime.getTime() > Date.now()) {
      testTime = new Date(Date.now() - faker.number.int({ min: 1, max: 24 }) * 60 * 60 * 1000);
    }
    
    const mode = faker.helpers.arrayElement(config.preferredModes);
    const difficulty = faker.helpers.arrayElement(config.difficulties);
    const textSource = faker.helpers.arrayElement(config.wordLists);
    
    const rawWpm = Math.floor(wpm * faker.number.float({ min: 1.05, max: 1.25 }));
    const consistency = faker.number.float({ 
      min: config.consistencyRange[0], 
      max: config.consistencyRange[1],
      fractionDigits: 1
    });
    
    // Calculate character metrics
    const timeMinutes = mode === 'time' ? faker.number.int({ min: 1, max: 5 }) : 
                       faker.number.float({ min: 0.5, max: 3 });
    const totalChars = Math.floor(wpm * 5 * timeMinutes); // ~5 chars per word
    const correctChars = Math.floor(totalChars * (accuracy / 100));
    const incorrectChars = totalChars - correctChars;
    
    results.push({
      wpm: wpm,
      accuracy: Number(accuracy.toFixed(1)),
      rawWpm,
      consistency: Number(consistency.toFixed(1)),
      mode,
      duration: mode === 'time' ? faker.helpers.arrayElement([15, 30, 60, 120]) : undefined,
      wordCount: mode === 'words' ? faker.helpers.arrayElement([10, 25, 50, 100]) : undefined,
      difficulty,
      textSource,
      timestamp: testTime,
      totalChars,
      correctChars,
      incorrectChars,
      errorRate: Number(((incorrectChars / timeMinutes) || 0).toFixed(1))
    });
  }
  
  return results.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

/**
 * Generate user settings based on skill level and preferences
 */
export const generateUserSettings = (user: UserSeedData) => {
  const themes = ['slate', 'dark', 'light', 'cyberpunk', 'neon', 'nature', 'sunset'];
  const caretStyles = ['line', 'block', 'underline'];
  
  // Advanced users tend to prefer specific settings
  const isAdvanced = ['advanced', 'expert', 'professional'].includes(user.skillLevel);
  
  return {
    theme: isAdvanced ? 
      faker.helpers.weightedArrayElement([
        { weight: 30, value: 'dark' },
        { weight: 25, value: 'cyberpunk' },
        { weight: 20, value: 'slate' },
        { weight: 15, value: 'neon' },
        { weight: 10, value: faker.helpers.arrayElement(themes) }
      ]) :
      faker.helpers.arrayElement(themes),
    
    caretStyle: faker.helpers.arrayElement(caretStyles),
    
    paceCaretWpm: isAdvanced ? user.averageWPM - faker.number.int({ min: 5, max: 15 }) : 0,
    
    fontSize: faker.helpers.weightedArrayElement([
      { weight: 10, value: 14 },
      { weight: 40, value: 16 },
      { weight: 30, value: 18 },
      { weight: 15, value: 20 },
      { weight: 5, value: 24 }
    ]),
    
    soundEnabled: faker.datatype.boolean({ probability: 0.3 }),
    keyboardSound: faker.helpers.arrayElement(['none', 'click', 'typewriter', 'mechanical']),
    showWpmLive: faker.datatype.boolean({ probability: 0.8 }),
    showProgress: faker.datatype.boolean({ probability: 0.9 }),
    
    blindMode: isAdvanced ? faker.datatype.boolean({ probability: 0.2 }) : false,
    punctuationPreference: faker.helpers.weightedArrayElement([
      { weight: 40, value: 'sometimes' },
      { weight: 30, value: 'never' },
      { weight: 30, value: 'always' }
    ]),
    numbersPreference: faker.helpers.weightedArrayElement([
      { weight: 50, value: 'sometimes' },
      { weight: 35, value: 'never' },
      { weight: 15, value: 'always' }
    ]),
    
    profilePublic: faker.datatype.boolean({ probability: 0.4 }),
    shareResults: faker.datatype.boolean({ probability: 0.7 })
  };
};

/**
 * Generate achievement data for gamification
 */
export const generateAchievements = () => {
  return [
    // Speed achievements
    {
      name: 'Speed Demon',
      description: 'Reach 100 WPM in a single test',
      icon: '⚡',
      category: 'speed',
      condition: JSON.stringify({ wpm: { gte: 100 } }),
      points: 50
    },
    {
      name: 'Lightning Fingers',
      description: 'Reach 150 WPM in a single test',
      icon: '⚡',
      category: 'speed', 
      condition: JSON.stringify({ wpm: { gte: 150 } }),
      points: 100
    },
    
    // Accuracy achievements
    {
      name: 'Perfectionist',
      description: 'Achieve 100% accuracy in a test',
      icon: '🎯',
      category: 'accuracy',
      condition: JSON.stringify({ accuracy: { gte: 100 } }),
      points: 30
    },
    {
      name: 'Precision Master',
      description: 'Maintain 98%+ accuracy over 50 tests',
      icon: '🎯',
      category: 'accuracy',
      condition: JSON.stringify({ avgAccuracy: { gte: 98 }, testCount: { gte: 50 } }),
      points: 75
    },
    
    // Consistency achievements
    {
      name: 'Steady Hands',
      description: 'Achieve 95%+ consistency in 10 consecutive tests',
      icon: '🤝',
      category: 'consistency',
      condition: JSON.stringify({ consistency: { gte: 95 }, consecutive: 10 }),
      points: 40
    },
    
    // Milestone achievements
    {
      name: 'Getting Started',
      description: 'Complete your first typing test',
      icon: '🌟',
      category: 'milestone',
      condition: JSON.stringify({ testCount: { gte: 1 } }),
      points: 10
    },
    {
      name: 'Dedicated Typist',
      description: 'Complete 100 typing tests',
      icon: '💪',
      category: 'milestone',
      condition: JSON.stringify({ testCount: { gte: 100 } }),
      points: 50
    },
    {
      name: 'Marathon Typist',
      description: 'Complete 1000 typing tests',
      icon: '🏆',
      category: 'milestone',
      condition: JSON.stringify({ testCount: { gte: 1000 } }),
      points: 200
    }
  ];
};

/**
 * Helper function to select skill level based on distribution
 */
function selectSkillLevel(distribution: Record<SkillLevel, number>): SkillLevel {
  const random = Math.random();
  let cumulative = 0;
  
  for (const [level, weight] of Object.entries(distribution)) {
    cumulative += weight;
    if (random <= cumulative) {
      return level as SkillLevel;
    }
  }
  
  return 'intermediate'; // fallback
}

/**
 * Generate word list statistics
 */
export const generateWordListStats = () => {
  return [
    {
      listName: 'english1k',
      totalWords: 1000,
      avgDifficulty: 2.5,
      usage: faker.number.int({ min: 5000, max: 15000 }),
      lastUsed: faker.date.recent({ days: 1 })
    },
    {
      listName: 'english10k',
      totalWords: 10000,
      avgDifficulty: 4.2,
      usage: faker.number.int({ min: 2000, max: 8000 }),
      lastUsed: faker.date.recent({ days: 2 })
    },
    {
      listName: 'javascript',
      totalWords: 1500,
      avgDifficulty: 6.8,
      usage: faker.number.int({ min: 500, max: 2000 }),
      lastUsed: faker.date.recent({ days: 3 })
    },
    {
      listName: 'python',
      totalWords: 1200,
      avgDifficulty: 6.5,
      usage: faker.number.int({ min: 400, max: 1800 }),
      lastUsed: faker.date.recent({ days: 5 })
    }
  ];
};

/**
 * Generate daily statistics for analytics
 */
export const generateDailyStats = (days: number = 365) => {
  const stats = [];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    
    // Weekend patterns (lower usage)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseMultiplier = isWeekend ? 0.6 : 1.0;
    
    // Seasonal patterns (growth over time)
    const growthFactor = 1 + (i / days) * 0.5;
    
    stats.push({
      date,
      totalUsers: Math.floor(faker.number.int({ min: 50, max: 200 }) * baseMultiplier * growthFactor),
      totalTests: Math.floor(faker.number.int({ min: 200, max: 800 }) * baseMultiplier * growthFactor),
      avgWpm: faker.number.float({ min: 45, max: 65, fractionDigits: 1 }),
      avgAccuracy: faker.number.float({ min: 92, max: 97, fractionDigits: 1 }),
      newUsers: Math.floor(faker.number.int({ min: 2, max: 15 }) * baseMultiplier * growthFactor)
    });
  }
  
  return stats;
};