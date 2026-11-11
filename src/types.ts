export type UserIntent = 'swap' | 'learn' | 'teach_revenue';

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'master';

export type ExchangeFormat = 'video' | 'async' | 'pair_programming';

export interface SkillOffering {
  id: string;
  name: string;
  category: string;
  proficiency: ProficiencyLevel;
  yearsExperience: number;
  description: string;
  sessionRatePKR?: number; // Optional hourly/session fee for 'teach_revenue' mode
}

export interface SkillDesire {
  id: string;
  name: string;
  category: string;
  currentLevel: 'none' | 'beginner' | 'intermediate';
  targetLevel: ProficiencyLevel;
  priority: 'high' | 'medium' | 'exploratory';
  motivation?: string;
}

export type PaymentMethod = 'easypaisa' | 'jazzcash';

export interface PaymentRecord {
  id: string;
  type: 'reg_fee' | 'premium_pass' | 'session_fee';
  amountPKR: number;
  method: PaymentMethod;
  accountIdentifier: string; // Mobile number (Easypaisa / JazzCash)
  referenceId: string;
  timestamp: string;
  status: 'completed' | 'pending';
  receiptNote?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  city: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  intent: UserIntent;
  isRegFeePaid: boolean;
  isPremiumPass: boolean;
  skillsOffered: SkillOffering[];
  skillsWanted: SkillDesire[];
  weeklyHours: number;
  preferredFormats: ExchangeFormat[];
  completedSwapsCount: number;
  rating: number;
  reviewsCount: number;
  joinedDate: string;
  walletBalancePKR: number;
  passPaymentStatus?: 'active' | 'pending' | 'none';
  isSuspended?: boolean;
  password?: string;
}

export interface SwapProposal {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderHeadline: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  offeredSkill: string;
  offeredProficiency: ProficiencyLevel;
  requestedSkill: string;
  requestedProficiency: ProficiencyLevel;
  proposedSessions: number;
  sessionDurationMinutes: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  message: string;
  createdAt: string;
  scheduledTime?: string;
  isPaidSession?: boolean;
  sessionFeePKR?: number;
}

export interface MatchResult {
  candidate: UserProfile;
  matchPercentage: number;
  isMutualReciprocal: boolean;
  youOfferTheyWant: string[];
  theyOfferYouWant: string[];
  proficiencySynergy: string;
}

export interface PlatformReceivingAccounts {
  easypaisaNumber: string;
  easypaisaTitle: string;
  jazzcashNumber: string;
  jazzcashTitle: string;
}

export interface AdminAccount {
  email: string;
  passcode: string;
  name?: string;
  createdAt: string;
}
