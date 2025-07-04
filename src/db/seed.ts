import { db } from './index';
import {
  subjectsTable,
  subscriptionPlansTable,
  achievementsTable,
  topicsTable,
  aiContentTemplatesTable,
  aiModelConfigsTable
} from './schema';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Seed Subjects
    console.log('📚 Seeding subjects...');
    const subjects = await db.insert(subjectsTable).values([
      {
        name: 'Mathematics',
        description: 'Comprehensive mathematics curriculum covering algebra, calculus, geometry, and more',
        iconUrl: '/icons/math.svg',
        color: '#3B82F6',
        isActive: true,
      },
      {
        name: 'Physics',
        description: 'Physics concepts from mechanics to quantum physics',
        iconUrl: '/icons/physics.svg',
        color: '#EF4444',
        isActive: true,
      },
      {
        name: 'Chemistry',
        description: 'Organic, inorganic, and physical chemistry',
        iconUrl: '/icons/chemistry.svg',
        color: '#10B981',
        isActive: true,
      },
      {
        name: 'Biology',
        description: 'Life sciences including botany, zoology, and human biology',
        iconUrl: '/icons/biology.svg',
        color: '#F59E0B',
        isActive: true,
      },
      {
        name: 'Computer Science',
        description: 'Programming, algorithms, data structures, and computer systems',
        iconUrl: '/icons/computer.svg',
        color: '#8B5CF6',
        isActive: true,
      },
      {
        name: 'English',
        description: 'Literature, grammar, writing, and communication skills',
        iconUrl: '/icons/english.svg',
        color: '#EC4899',
        isActive: true,
      },
    ]).returning();

    console.log(`✅ Created ${subjects.length} subjects`);

    // Seed Topics for Mathematics
    const mathSubject = subjects.find(s => s.name === 'Mathematics');
    if (mathSubject) {
      console.log('📖 Seeding mathematics topics...');
      await db.insert(topicsTable).values([
        {
          subjectId: mathSubject.subjectId,
          name: 'Algebra',
          description: 'Linear equations, quadratic equations, polynomials',
          difficulty: 'beginner',
          orderIndex: 1,
        },
        {
          subjectId: mathSubject.subjectId,
          name: 'Calculus',
          description: 'Derivatives, integrals, limits',
          difficulty: 'advanced',
          orderIndex: 2,
        },
        {
          subjectId: mathSubject.subjectId,
          name: 'Geometry',
          description: 'Shapes, angles, area, volume',
          difficulty: 'intermediate',
          orderIndex: 3,
        },
        {
          subjectId: mathSubject.subjectId,
          name: 'Statistics',
          description: 'Probability, data analysis, distributions',
          difficulty: 'intermediate',
          orderIndex: 4,
        },
      ]);
    }

    // Seed Subscription Plans
    console.log('💰 Seeding subscription plans...');
    const plans = await db.insert(subscriptionPlansTable).values([
      {
        name: 'Free',
        description: 'Basic access to learning materials',
        price: '0.00',
        currency: 'BDT',
        billingPeriod: 'monthly',
        features: JSON.stringify([
          'Limited AI queries (10/day)',
          'Basic flashcards',
          'Community access',
          'Basic progress tracking'
        ]),
        maxQueries: 10,
        maxFileUploads: 5,
        isActive: true,
      },
      {
        name: 'Student',
        description: 'Perfect for individual students',
        price: '299.00',
        currency: 'BDT',
        billingPeriod: 'monthly',
        features: JSON.stringify([
          'Unlimited AI queries',
          'Advanced flashcards',
          'Mind maps',
          'Practice tests',
          'Progress analytics',
          'Priority support'
        ]),
        maxQueries: null, // unlimited
        maxFileUploads: 50,
        isActive: true,
      },
      {
        name: 'Premium',
        description: 'Advanced features for serious learners',
        price: '499.00',
        currency: 'BDT',
        billingPeriod: 'monthly',
        features: JSON.stringify([
          'Everything in Student plan',
          'Custom study plans',
          'Advanced analytics',
          'Group study features',
          'Offline access',
          'Expert tutoring sessions'
        ]),
        maxQueries: null,
        maxFileUploads: 200,
        isActive: true,
      },
      {
        name: 'Student Annual',
        description: 'Student plan with annual discount',
        price: '2990.00',
        currency: 'BDT',
        billingPeriod: 'yearly',
        features: JSON.stringify([
          'All Student plan features',
          '2 months free',
          'Annual progress report'
        ]),
        maxQueries: null,
        maxFileUploads: 50,
        isActive: true,
      },
    ]).returning();

    console.log(`✅ Created ${plans.length} subscription plans`);

    // Seed Achievements
    console.log('🏆 Seeding achievements...');
    const achievements = await db.insert(achievementsTable).values([
      {
        name: 'First Steps',
        description: 'Complete your first study session',
        iconUrl: '/icons/first-steps.svg',
        badgeColor: '#10B981',
        criteria: JSON.stringify({ type: 'study_sessions', count: 1 }),
        points: 10,
        isActive: true,
      },
      {
        name: 'Streak Master',
        description: 'Maintain a 7-day study streak',
        iconUrl: '/icons/streak.svg',
        badgeColor: '#F59E0B',
        criteria: JSON.stringify({ type: 'study_streak', days: 7 }),
        points: 50,
        isActive: true,
      },
      {
        name: 'Quiz Champion',
        description: 'Score 90% or higher on 5 practice tests',
        iconUrl: '/icons/quiz.svg',
        badgeColor: '#3B82F6',
        criteria: JSON.stringify({ type: 'quiz_score', score: 90, count: 5 }),
        points: 100,
        isActive: true,
      },
      {
        name: 'Flashcard Expert',
        description: 'Review 100 flashcards',
        iconUrl: '/icons/flashcard.svg',
        badgeColor: '#8B5CF6',
        criteria: JSON.stringify({ type: 'flashcards_reviewed', count: 100 }),
        points: 25,
        isActive: true,
      },
      {
        name: 'Community Helper',
        description: 'Help 10 students in community discussions',
        iconUrl: '/icons/community.svg',
        badgeColor: '#EC4899',
        criteria: JSON.stringify({ type: 'helpful_comments', count: 10 }),
        points: 75,
        isActive: true,
      },
      {
        name: 'Knowledge Seeker',
        description: 'Ask 50 questions to the AI tutor',
        iconUrl: '/icons/question.svg',
        badgeColor: '#EF4444',
        criteria: JSON.stringify({ type: 'ai_queries', count: 50 }),
        points: 30,
        isActive: true,
      },
    ]).returning();

    console.log(`✅ Created ${achievements.length} achievements`);

    // Seed AI Content Templates
    console.log('🤖 Seeding AI content templates...');
    const templates = await db.insert(aiContentTemplatesTable).values([
      {
        name: 'Basic Flashcard Generator',
        description: 'Generate flashcards for any topic with questions and answers',
        contentType: 'flashcard',
        promptTemplate: `Create {count} flashcards for the topic "{topic}" in {subject}. 
        Difficulty level: {difficulty}
        
        For each flashcard, provide:
        1. A clear, concise question
        2. A comprehensive answer
        3. A helpful hint (optional)
        4. A detailed explanation
        
        Focus on key concepts, definitions, and practical applications.
        Make questions challenging but fair for {difficulty} level students.`,
        systemPrompt: 'You are an expert educator creating high-quality flashcards. Ensure accuracy, clarity, and educational value.',
        parameters: JSON.stringify({
          count: { type: 'number', default: 10, min: 1, max: 50 },
          difficulty: { type: 'enum', values: ['beginner', 'intermediate', 'advanced'] },
          includeHints: { type: 'boolean', default: true },
          includeExplanations: { type: 'boolean', default: true }
        }),
        difficulty: 'beginner',
        isActive: true,
      },
      {
        name: 'Adaptive Study Routine',
        description: 'Create personalized study routines based on user progress and goals',
        contentType: 'routine',
        promptTemplate: `Create a personalized study routine for a {level} student studying {subjects}.
        
        Student goals: {goals}
        Available time: {timePerDay} minutes per day
        Preferred study times: {preferredTimes}
        Learning style: {learningStyle}
        Current progress: {currentProgress}
        
        Create a balanced routine that includes:
        1. Review sessions for weak areas
        2. New content learning
        3. Practice and testing
        4. Breaks and variety
        
        Adapt the routine to be challenging but achievable.`,
        systemPrompt: 'You are a learning specialist creating effective, personalized study routines.',
        parameters: JSON.stringify({
          timePerDay: { type: 'number', default: 60, min: 15, max: 480 },
          subjects: { type: 'array', required: true },
          goals: { type: 'text', required: true },
          learningStyle: { type: 'enum', values: ['visual', 'auditory', 'kinesthetic', 'mixed'] }
        }),
        difficulty: 'intermediate',
        isActive: true,
      },
      {
        name: 'Quiz Generator',
        description: 'Generate practice quizzes with multiple choice and short answer questions',
        contentType: 'quiz',
        promptTemplate: `Create a {questionCount}-question quiz on "{topic}" for {difficulty} level students.
        
        Include:
        - {mcqCount} multiple choice questions (4 options each)
        - {shortAnswerCount} short answer questions
        - Clear explanations for all answers
        - Varied question types (definition, application, analysis)
        
        Ensure questions test understanding, not just memorization.`,
        systemPrompt: 'You are creating educational assessments that fairly test student knowledge.',
        parameters: JSON.stringify({
          questionCount: { type: 'number', default: 10, min: 5, max: 50 },
          mcqCount: { type: 'number', default: 7 },
          shortAnswerCount: { type: 'number', default: 3 },
          timeLimit: { type: 'number', default: 30 }
        }),
        difficulty: 'intermediate',
        isActive: true,
      },
      {
        name: 'Concept Explanation',
        description: 'Generate detailed explanations for complex concepts',
        contentType: 'explanation',
        promptTemplate: `Explain the concept of "{concept}" in {subject} for {difficulty} level students.
        
        Structure your explanation with:
        1. Simple definition
        2. Key components or principles
        3. Real-world examples
        4. Common misconceptions
        5. Practice applications
        
        Use analogies and examples appropriate for the difficulty level.`,
        systemPrompt: 'You are an expert teacher explaining complex concepts in simple, understandable terms.',
        parameters: JSON.stringify({
          includeExamples: { type: 'boolean', default: true },
          includeAnalogies: { type: 'boolean', default: true },
          includeCommonMistakes: { type: 'boolean', default: true }
        }),
        difficulty: 'beginner',
        isActive: true,
      }
    ]).returning();

    console.log(`✅ Created ${templates.length} AI content templates`);

    // Seed AI Model Configurations
    console.log('⚙️ Seeding AI model configurations...');
    const modelConfigs = await db.insert(aiModelConfigsTable).values([
      {
        modelName: 'gpt-4',
        version: '1.0',
        contentType: 'flashcard',
        configuration: JSON.stringify({
          provider: 'openai',
          endpoint: 'https://api.openai.com/v1/chat/completions'
        }),
        prompts: JSON.stringify({
          system: 'You are an expert educator creating high-quality educational flashcards.',
          user: 'Create flashcards that are clear, accurate, and pedagogically sound.'
        }),
        parameters: JSON.stringify({
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 0.9,
          frequency_penalty: 0.1
        }),
        isActive: true,
        performanceMetrics: JSON.stringify({
          averageQuality: 0.85,
          successRate: 0.92,
          averageGenerationTime: 3500
        })
      },
      {
        modelName: 'gpt-4',
        version: '1.0',
        contentType: 'routine',
        configuration: JSON.stringify({
          provider: 'openai',
          endpoint: 'https://api.openai.com/v1/chat/completions'
        }),
        prompts: JSON.stringify({
          system: 'You are a learning specialist creating personalized, effective study routines.',
          user: 'Create study routines that are realistic, balanced, and adapted to individual needs.'
        }),
        parameters: JSON.stringify({
          temperature: 0.8,
          max_tokens: 3000,
          top_p: 0.9,
          frequency_penalty: 0.2
        }),
        isActive: true,
        performanceMetrics: JSON.stringify({
          averageQuality: 0.88,
          successRate: 0.89,
          averageGenerationTime: 4200
        })
      }
    ]).returning();

    console.log(`✅ Created ${modelConfigs.length} AI model configurations`);

    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seed }; 