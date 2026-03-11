// src/database/seeds/seed.ts
/**
 * Seed script — creates initial data for the application.
 * Run with: npm run seed
 *
 * Creates:
 * 1. Admin user (from ADMIN_LOGIN + ADMIN_PASSWORD env vars)
 * 2. 8 service packages
 * 3. Default site_settings for all reserved keys
 * 4. 4 placeholder team members
 * 5. 3 initial reviews
 * 6. 3 initial FAQ items
 * 7. 3 portfolio cases
 */

// if (process.env.NODE_ENV === 'production') {
//   console.error('ERROR: seed cannot be run in production environment');
//   process.exit(1);
// }

import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { join } from 'path';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Application } from '../../applications/entities/application.entity';
import { FaqItem } from '../../faq/entities/faq-item.entity';
import { Package } from '../../packages/entities/package.entity';
import { PortfolioCase } from '../../portfolio/entities/portfolio-case.entity';
import { Review } from '../../reviews/entities/review.entity';
import { RESERVED_SETTING_KEYS, SiteSetting } from '../../settings/entities/site-setting.entity';
import { TeamMember } from '../../team/entities/team-member.entity';
import { User, UserRole } from '../../users/entities/user.entity';

dotenv.config({ path: join(__dirname, '../../../.env') });

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Application, Package, PortfolioCase, TeamMember, SiteSetting, FaqItem, Review],
  synchronize: false,
  dropSchema: false,
  logging: false,
});

// ──────────────────────────────────────────────
// PACKAGES DATA
// ──────────────────────────────────────────────

const PACKAGES_DATA = [
  {
    name: 'Полная организация',
    shortDescription: 'Мы берём на себя всё — от концепции до последнего танца.',
    fullDescription:
      'Полный цикл организации свадьбы: разработка концепции, подбор площадки, поставщиков, координация в день свадьбы. Вы просто наслаждаетесь праздником.',
    price: 'от 150 000 руб.',
    sortOrder: 1,
  },
  {
    name: 'Координация дня',
    shortDescription: 'Ваш личный менеджер в день свадьбы.',
    fullDescription:
      'Координатор берёт на себя управление всеми процессами непосредственно в день свадьбы: встреча гостей, работа с подрядчиками, тайминг, решение форс-мажоров.',
    price: 'от 35 000 руб.',
    sortOrder: 2,
  },
  {
    name: 'Распорядитель',
    shortDescription: 'Чёткий тайминг и порядок на вашей свадьбе.',
    fullDescription:
      'Распорядитель следит за соблюдением тайминга, координирует гостей и персонал площадки, обеспечивает бесперебойный ход мероприятия.',
    price: 'от 25 000 руб.',
    sortOrder: 3,
  },
  {
    name: 'Выездная церемония',
    shortDescription: 'Организация трогательной церемонии под открытым небом.',
    fullDescription:
      'Разработка сценария, оформление зоны, подбор регистратора, техническое обеспечение — всё для идеальной выездной церемонии.',
    price: 'от 40 000 руб.',
    sortOrder: 4,
  },
  {
    name: 'Аудит организации',
    shortDescription: 'Проверим вашу подготовку и закроем все пробелы.',
    fullDescription:
      'Анализ заключённых договоров с подрядчиками, тайминга, бюджета и концепции. Получите профессиональный взгляд со стороны и рекомендации по улучшению.',
    price: 'от 15 000 руб.',
    sortOrder: 5,
  },
  {
    name: 'Куратор',
    shortDescription: 'Ваш личный советник на всём пути подготовки.',
    fullDescription:
      'Куратор сопровождает вас на протяжении всей подготовки: консультации, помощь в выборе подрядчиков, контроль выполнения задач.',
    price: 'от 50 000 руб.',
    sortOrder: 6,
  },
  {
    name: 'Консультация',
    shortDescription: 'Один час с экспертом — ответы на все ваши вопросы.',
    fullDescription:
      'Индивидуальная консультация по любым аспектам подготовки к свадьбе: концепция, бюджет, подрядчики, тайминг. Онлайн или офлайн.',
    price: 'от 5 000 руб.',
    sortOrder: 7,
  },
  {
    name: 'Стилист',
    shortDescription: 'Образ невесты, который запомнят навсегда.',
    fullDescription:
      'Подбор стиля, сопровождение на примерках, образ в день свадьбы. Работаем с ведущими стилистами и визажистами города.',
    price: 'по запросу',
    sortOrder: 8,
  },
];

// ──────────────────────────────────────────────
// DEFAULT SETTINGS
// ──────────────────────────────────────────────

const DEFAULT_SETTINGS: Record<string, string> = {
  stat_weddings_count: '150',
  stat_years_experience: '7',
  stat_team_size: '8',
  stat_rating: '5.0',
  phone: '+7 (999) 000-00-00',
  instagram_url: 'https://instagram.com/karpenko.wedding',
  vk_url: 'https://vk.com/karpenko_wedding',
  telegram_url: 'https://t.me/karpenko_wedding',
  countdown_next_wedding_date: '2025-09-15T18:00:00Z',
  countdown_total_weddings: '150',
};

// ──────────────────────────────────────────────
// TEAM MEMBERS
// ──────────────────────────────────────────────

const TEAM_MEMBERS_DATA = [
  {
    name: 'Екатерина Карпенко',
    description: 'Основатель & ведущий организатор',
    photoUrl: 'http://localhost:3000/images/wedding-planners/wedding-planner-ekaterina.jpg',
    sortOrder: 1,
  },
  {
    name: 'Александра',
    description: 'Организатор',
    photoUrl: 'http://localhost:3000/images/wedding-planners/wedding-planner-alexandra.jpg',
    sortOrder: 2,
  },
  {
    name: 'Алина',
    description: 'Организатор',
    photoUrl: 'http://localhost:3000/images/wedding-planners/wedding-planner-alina.jpg',
    sortOrder: 3,
  },
  {
    name: 'Мария',
    description: 'Координатор',
    photoUrl: 'http://localhost:3000/images/wedding-planners/wedding-planner-maria.jpg',
    sortOrder: 4,
  },
];

// ──────────────────────────────────────────────
// REVIEWS DATA
// ──────────────────────────────────────────────

const REVIEWS_DATA = [
  {
    text: 'Ну вы прямо настоящие свадебные феечки 🧚‍♀️',
    sortOrder: 1,
    isActive: true,
  },
  {
    text: 'Даже не представляю, как бы мы справлялись со всем в этот день без вас 🙂',
    sortOrder: 2,
    isActive: true,
  },
  {
    text: 'Безгранично благодарим за помощь и поддержку на протяжении всей подготовки ❤️',
    sortOrder: 3,
    isActive: true,
  },
];

// ──────────────────────────────────────────────
// FAQ DATA
// ──────────────────────────────────────────────

const FAQ_DATA = [
  {
    question: 'За сколько времени нужно обращаться к организатору?',
    answer: 'Рекомендуем начать планирование за 9–12 месяцев до свадьбы. Для полной организации — чем раньше, тем лучше.',
    sortOrder: 1,
    isActive: true,
  },
  {
    question: 'Работаете ли вы за пределами города?',
    answer: 'Да, мы организуем свадьбы по всей России и за рубежом. Выезд оговаривается индивидуально.',
    sortOrder: 2,
    isActive: true,
  },
  {
    question: 'Что входит в координацию дня?',
    answer: 'Координатор присутствует весь день, управляет всеми подрядчиками, следит за таймингом и решает любые вопросы.',
    sortOrder: 3,
    isActive: true,
  },
];

// ──────────────────────────────────────────────
// PORTFOLIO DATA
// ──────────────────────────────────────────────
// photoUrl points to frontend public assets (http://localhost:3000/images/...)
// Replace with /uploads/<uuid>.jpg after uploading via admin panel in production.

const PORTFOLIO_DATA = [
  {
    title: 'Свадьба Фа и Кирилла',
    photoUrl: 'http://localhost:3000/images/wedding-days/wedding-day-2024-fa-kirill.jpg',
    description: 'Камерная свадьба в загородном доме с живой музыкой и авторской флористикой в стиле "сад-огород".',
    sortOrder: 1,
  },
  {
    title: 'Свадьба Игоря и Анастасии',
    photoUrl: 'http://localhost:3000/images/wedding-days/wedding-day-2025-igor-anastasiya.jpg',
    description: 'Роскошное торжество в банкетном зале с кастомным декором в лилово-золотой палитре.',
    sortOrder: 2,
  },
  {
    title: 'Свадьба Юлии и Артёма',
    photoUrl: 'http://localhost:3000/images/wedding-days/wedding-day-2025-yulia-artem.jpg',
    description: 'Выездная церемония на берегу озера с чаепитием вместо фуршета.',
    sortOrder: 3,
  },
];

// ──────────────────────────────────────────────
// SEED RUNNER
// ──────────────────────────────────────────────

async function seed(): Promise<void> {
  console.log('Connecting to database...');
  await dataSource.initialize();
  console.log('Connected.');

  // 1. Admin user
  const adminLogin = process.env.ADMIN_LOGIN ?? 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'changeme123';

  const userRepository = dataSource.getRepository(User);
  const existingAdmin = await userRepository.findOne({ where: { login: adminLogin } });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const admin = userRepository.create({
      login: adminLogin,
      passwordHash,
      name: 'Администратор',
      role: UserRole.ADMIN,
    });
    await userRepository.save(admin);
    console.log(`✓ Admin user created: ${adminLogin}`);
  } else {
    console.log(`- Admin user already exists: ${adminLogin}`);
  }

  // 2. Packages
  const packageRepository = dataSource.getRepository(Package);
  const existingCount = await packageRepository.count();
  if (existingCount === 0) {
    for (const pkg of PACKAGES_DATA) {
      await packageRepository.save(packageRepository.create(pkg));
      console.log(`✓ Package created: ${pkg.name}`);
    }
  } else {
    console.log(`- Packages already exist (${existingCount}), skipping`);
  }

  // 3. Site settings
  const settingsRepository = dataSource.getRepository(SiteSetting);
  for (const key of RESERVED_SETTING_KEYS) {
    const existing = await settingsRepository.findOne({ where: { key } });
    if (!existing) {
      const value = DEFAULT_SETTINGS[key] ?? '';
      await settingsRepository.save(settingsRepository.create({ key, value }));
      console.log(`✓ Setting created: ${key}`);
    } else {
      console.log(`- Setting already exists: ${key}`);
    }
  }

  // 4. Team members
  const teamRepository = dataSource.getRepository(TeamMember);
  const teamCount = await teamRepository.count();
  if (teamCount === 0) {
    for (const member of TEAM_MEMBERS_DATA) {
      await teamRepository.save(teamRepository.create(member));
      console.log(`✓ Team member created: ${member.name}`);
    }
  } else {
    console.log(`- Team members already exist (${teamCount} total)`);
  }

  // 5. Reviews
  const reviewsRepository = dataSource.getRepository(Review);
  const reviewsCount = await reviewsRepository.count();
  if (reviewsCount === 0) {
    for (const review of REVIEWS_DATA) {
      await reviewsRepository.save(reviewsRepository.create(review));
      console.log(`✓ Review created: sort_order=${review.sortOrder}`);
    }
  } else {
    console.log(`- Reviews already exist (${reviewsCount} total)`);
  }

  // 6. FAQ items
  const faqRepository = dataSource.getRepository(FaqItem);
  const faqCount = await faqRepository.count();
  if (faqCount === 0) {
    for (const item of FAQ_DATA) {
      await faqRepository.save(faqRepository.create(item));
      console.log(`✓ FAQ item created: sort_order=${item.sortOrder}`);
    }
  } else {
    console.log(`- FAQ items already exist (${faqCount} total)`);
  }

  // 7. Portfolio cases
  const portfolioRepository = dataSource.getRepository(PortfolioCase);
  const portfolioCount = await portfolioRepository.count();
  if (portfolioCount === 0) {
    for (const item of PORTFOLIO_DATA) {
      await portfolioRepository.save(portfolioRepository.create(item));
      console.log(`✓ Portfolio case created: sort_order=${item.sortOrder}`);
    }
  } else {
    console.log(`- Portfolio cases already exist (${portfolioCount} total)`);
  }

  await dataSource.destroy();
  console.log('\nSeed completed successfully.');
}

seed().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
