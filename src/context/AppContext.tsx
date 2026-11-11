import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserIntent,
  SkillOffering,
  SkillDesire,
  PaymentMethod,
  PaymentRecord,
  SwapProposal,
  MatchResult,
  PlatformReceivingAccounts,
  AdminAccount,
} from '../types';
import { INITIAL_COMMUNITY_USERS, INITIAL_PROPOSALS } from '../data/seedData';
import {
  isSupabaseConfigured,
  fetchProfilesFromSupabase,
  syncProfileToSupabase,
  syncPaymentToSupabase,
  syncProposalToSupabase,
  syncReceivingAccountsToSupabase,
} from '../lib/supabase';

interface AppContextType {
  currentUser: UserProfile;
  communityUsers: UserProfile[];
  proposals: SwapProposal[];
  paymentHistory: PaymentRecord[];
  receivingAccounts: PlatformReceivingAccounts;
  updateReceivingAccounts: (updates: Partial<PlatformReceivingAccounts>) => void;
  isSupabaseConnected: boolean;
  refreshSupabaseSync: () => Promise<void>;
  isUserAuthenticated: boolean;
  userLogin: (identifier: string, password?: string) => { success: boolean; error?: string };
  userSignup: (userData: {
    name: string;
    email: string;
    phone: string;
    city: string;
    password?: string;
    intent: UserIntent;
    headline?: string;
    bio?: string;
  }) => { success: boolean; error?: string };
  userLogout: () => void;
  activeTab: 'dashboard' | 'explore' | 'my-swaps' | 'wallet' | 'profile' | 'onboarding' | 'admin' | 'auth';
  setActiveTab: (tab: 'dashboard' | 'explore' | 'my-swaps' | 'wallet' | 'profile' | 'onboarding' | 'admin' | 'auth') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  adminAccount: AdminAccount | null;
  isAdminLoggedIn: boolean;
  adminRegister: (email: string, passcode: string, name?: string) => { success: boolean; error?: string };
  adminLogin: (email: string, passcode: string) => { success: boolean; error?: string };
  adminLogout: () => void;
  adminResetAccount: () => void;
  adminCancelSubscription: (userId: string) => void;
  adminApproveSubscription: (userId: string) => void;
  adminVerifyRegistration: (userId: string, isPaid: boolean) => void;
  adminToggleSuspend: (userId: string) => void;
  adminDeleteUser: (userId: string) => void;
  allRegisteredUsers: UserProfile[];
  isIntentModalOpen: boolean;
  setIsIntentModalOpen: (open: boolean) => void;
  isPremiumModalOpen: boolean;
  setIsPremiumModalOpen: (open: boolean) => void;
  isProposeModalOpen: boolean;
  setIsProposeModalOpen: (open: boolean) => void;
  proposalTargetUser: UserProfile | null;
  openProposeModalForUser: (user: UserProfile) => void;
  setIntent: (intent: UserIntent) => void;
  processPayment: (
    type: 'reg_fee' | 'premium_pass' | 'session_fee',
    amountPKR: number,
    method: PaymentMethod,
    accountIdentifier: string,
    note?: string
  ) => Promise<PaymentRecord>;
  completeOnboarding: (updates: Partial<UserProfile>) => void;
  addSkillOffered: (skill: Omit<SkillOffering, 'id'>) => void;
  removeSkillOffered: (id: string) => void;
  addSkillWanted: (skill: Omit<SkillDesire, 'id'>) => void;
  removeSkillWanted: (id: string) => void;
  sendProposal: (proposalData: Omit<SwapProposal, 'id' | 'createdAt' | 'status' | 'senderId' | 'senderName' | 'senderAvatar' | 'senderHeadline'>) => void;
  updateProposalStatus: (id: string, status: SwapProposal['status']) => void;
  isRegistrationPaymentModalOpen: boolean;
  setIsRegistrationPaymentModalOpen: (open: boolean) => void;
  verifyTransactionId: (tid: string, method: PaymentMethod) => Promise<PaymentRecord>;
  withdrawEarnings: (amountPKR: number, method: PaymentMethod, accountIdentifier: string) => Promise<boolean>;
  calculateMatch: (peer: UserProfile) => MatchResult;
  getMutualMatches: () => MatchResult[];
  resetToFreshOnboarding: () => void;
}

const DEFAULT_CURRENT_USER: UserProfile = {
  id: 'guest-user',
  name: 'Guest Member',
  username: 'guest',
  email: '',
  phone: '',
  city: 'Pakistan',
  headline: 'Peer Learner & Creator',
  bio: 'Welcome to HUNARIVO. Create an account to exchange skills, teach sessions, and connect with peers across Pakistan.',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80',
  intent: 'swap',
  isRegFeePaid: false,
  isPremiumPass: false,
  skillsOffered: [
    {
      id: 'my-s-1',
      name: 'React & TypeScript',
      category: 'Software & Web Development',
      proficiency: 'advanced',
      yearsExperience: 3,
      description: 'Component architecture, state management, modern hooks, and TypeScript patterns.',
      sessionRatePKR: 600,
    },
    {
      id: 'my-s-2',
      name: 'Python for Beginners',
      category: 'Software & Web Development',
      proficiency: 'intermediate',
      yearsExperience: 2,
      description: 'Core logic, data structures, and automation scripting.',
      sessionRatePKR: 500,
    },
  ],
  skillsWanted: [
    {
      id: 'my-w-1',
      name: 'Figma UI/UX Design',
      category: 'Design & Creative',
      currentLevel: 'beginner',
      targetLevel: 'advanced',
      priority: 'high',
      motivation: 'Design intuitive interfaces for my web and mobile software projects.',
    },
    {
      id: 'my-w-2',
      name: 'Spoken English & IELTS Prep',
      category: 'Languages & Communication',
      currentLevel: 'intermediate',
      targetLevel: 'master',
      priority: 'medium',
      motivation: 'Prepare for overseas client calls and conferences.',
    },
  ],
  weeklyHours: 4,
  preferredFormats: ['video', 'pair_programming'],
  completedSwapsCount: 5,
  rating: 4.9,
  reviewsCount: 5,
  joinedDate: 'Nov 2026',
  walletBalancePKR: 2400,
  passPaymentStatus: 'none',
  isSuspended: false,
};

const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-reg-1',
    type: 'reg_fee',
    amountPKR: 200,
    method: 'easypaisa',
    accountIdentifier: '03009876543',
    referenceId: 'EP-982341-PK',
    timestamp: '2026-11-08 14:22',
    status: 'completed',
    receiptNote: 'Hunarivo Verified Member Registration Fee',
  },
];

export const DEFAULT_RECEIVING_ACCOUNTS: PlatformReceivingAccounts = {
  easypaisaNumber: '03009876543',
  easypaisaTitle: 'HUNARIVO Official',
  jazzcashNumber: '03009876543',
  jazzcashTitle: 'HUNARIVO Official',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isSessionActive = typeof window !== 'undefined' && localStorage.getItem('hunarivo_user_session_active') === 'true';

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    if (isSessionActive) {
      const saved = localStorage.getItem('hunarivo_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return DEFAULT_CURRENT_USER;
        }
      }
    }
    return DEFAULT_CURRENT_USER;
  });

  const [communityUsers, setCommunityUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('hunarivo_community');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_COMMUNITY_USERS;
      }
    }
    return INITIAL_COMMUNITY_USERS;
  });

  const [proposals, setProposals] = useState<SwapProposal[]>(() => {
    const saved = localStorage.getItem('hunarivo_proposals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PROPOSALS;
      }
    }
    return INITIAL_PROPOSALS;
  });

  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('hunarivo_payments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PAYMENTS;
      }
    }
    return INITIAL_PAYMENTS;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'explore' | 'my-swaps' | 'wallet' | 'profile' | 'onboarding' | 'admin' | 'auth'>(
    isSessionActive ? 'dashboard' : 'auth'
  );
  const [adminAccount, setAdminAccount] = useState<AdminAccount | null>(() => {
    const saved = localStorage.getItem('hunarivo_admin_account');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('hunarivo_admin_session') === 'true';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isIntentModalOpen, setIsIntentModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);
  const [proposalTargetUser, setProposalTargetUser] = useState<UserProfile | null>(null);
  const [isRegistrationPaymentModalOpen, setIsRegistrationPaymentModalOpen] = useState(false);

  const [receivingAccounts, setReceivingAccounts] = useState<PlatformReceivingAccounts>(() => {
    const saved = localStorage.getItem('hunarivo_receiving_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_RECEIVING_ACCOUNTS;
      }
    }
    return DEFAULT_RECEIVING_ACCOUNTS;
  });

  const updateReceivingAccounts = (updates: Partial<PlatformReceivingAccounts>) => {
    setReceivingAccounts(prev => {
      const next = { ...prev, ...updates };
      syncReceivingAccountsToSupabase(next);
      return next;
    });
  };

  const [isSupabaseConnectedState, setIsSupabaseConnectedState] = useState<boolean>(isSupabaseConfigured());

  const refreshSupabaseSync = async () => {
    const configured = isSupabaseConfigured();
    setIsSupabaseConnectedState(configured);
    if (configured) {
      const remoteProfiles = await fetchProfilesFromSupabase();
      if (remoteProfiles && remoteProfiles.length > 0) {
        setCommunityUsers(prev => {
          const existingIds = new Set(remoteProfiles.map(p => p.id));
          const localOnly = prev.filter(p => !existingIds.has(p.id));
          return [...remoteProfiles, ...localOnly];
        });
      } else {
        // If database is clean and empty, seed initial community profiles & receiving accounts to Supabase
        for (const user of INITIAL_COMMUNITY_USERS) {
          syncProfileToSupabase(user);
        }
        syncReceivingAccountsToSupabase(receivingAccounts);
      }
    }
  };

  // Sync state to Supabase if configured
  useEffect(() => {
    refreshSupabaseSync();
  }, []);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('hunarivo_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('hunarivo_community', JSON.stringify(communityUsers));
  }, [communityUsers]);

  useEffect(() => {
    localStorage.setItem('hunarivo_proposals', JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem('hunarivo_payments', JSON.stringify(paymentHistory));
  }, [paymentHistory]);

  useEffect(() => {
    localStorage.setItem('hunarivo_receiving_accounts', JSON.stringify(receivingAccounts));
  }, [receivingAccounts]);

  // Sync theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setIntent = (intent: UserIntent) => {
    setCurrentUser(prev => ({ ...prev, intent }));
    setIsIntentModalOpen(false);
  };

  const openProposeModalForUser = (user: UserProfile) => {
    setProposalTargetUser(user);
    setIsProposeModalOpen(true);
  };

  const processPayment = async (
    type: 'reg_fee' | 'premium_pass' | 'session_fee',
    amountPKR: number,
    method: PaymentMethod,
    accountIdentifier: string,
    note?: string
  ): Promise<PaymentRecord> => {
    // Generate clean reference code mimicking Pakistan local payment rails (Easypaisa / JazzCash)
    const prefix = method === 'easypaisa' ? 'EP' : 'JC';
    const randCode = Math.floor(100000 + Math.random() * 900000);
    const referenceId = `${prefix}-${randCode}-PK`;

    const newRecord: PaymentRecord = {
      id: `pay-${Date.now()}`,
      type,
      amountPKR,
      method,
      accountIdentifier,
      referenceId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      receiptNote: note || (type === 'reg_fee' ? 'PKR 200 Registration Fee' : 'Hunarivo Premium Pass'),
    };

    setPaymentHistory(prev => [newRecord, ...prev]);

    if (type === 'reg_fee') {
      setCurrentUser(prev => ({ ...prev, isRegFeePaid: true }));
    } else if (type === 'premium_pass') {
      setCurrentUser(prev => ({ ...prev, isPremiumPass: true, passPaymentStatus: 'active' }));
    }

    syncPaymentToSupabase(newRecord, currentUser.id);
    return newRecord;
  };

  const verifyTransactionId = async (
    tid: string,
    method: PaymentMethod
  ): Promise<PaymentRecord> => {
    const cleanTid = tid.trim().toUpperCase();
    const prefix = method === 'easypaisa' ? 'EP' : 'JC';
    const referenceId = cleanTid.includes('-') ? cleanTid : `${prefix}-${cleanTid}-PK`;

    const newRecord: PaymentRecord = {
      id: `pay-${Date.now()}`,
      type: 'reg_fee',
      amountPKR: 200,
      method,
      accountIdentifier: `${method.toUpperCase()} Mobile Clearance`,
      referenceId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      receiptNote: 'Hunarivo Verified Member (TID Clearance)',
    };

    setPaymentHistory(prev => [newRecord, ...prev]);
    setCurrentUser(prev => ({ ...prev, isRegFeePaid: true }));
    syncPaymentToSupabase(newRecord, currentUser.id);
    return newRecord;
  };

  const completeOnboarding = (updates: Partial<UserProfile>) => {
    const updatedUser: UserProfile = {
      ...currentUser,
      ...updates,
      isRegFeePaid: true,
      joinedDate: 'Just now',
    };
    setCurrentUser(updatedUser);

    // Add or update this profile directly at the top of the community signups list
    setCommunityUsers(prev => {
      const remaining = prev.filter(u => u.id !== updatedUser.id);
      return [updatedUser, ...remaining];
    });

    syncProfileToSupabase(updatedUser);
    setActiveTab('dashboard');
  };

  const addSkillOffered = (skill: Omit<SkillOffering, 'id'>) => {
    const newSkill: SkillOffering = {
      ...skill,
      id: `s-${Date.now()}`,
    };
    setCurrentUser(prev => ({
      ...prev,
      skillsOffered: [...prev.skillsOffered, newSkill],
    }));
  };

  const removeSkillOffered = (id: string) => {
    setCurrentUser(prev => ({
      ...prev,
      skillsOffered: prev.skillsOffered.filter(s => s.id !== id),
    }));
  };

  const addSkillWanted = (skill: Omit<SkillDesire, 'id'>) => {
    const newSkill: SkillDesire = {
      ...skill,
      id: `w-${Date.now()}`,
    };
    setCurrentUser(prev => ({
      ...prev,
      skillsWanted: [...prev.skillsWanted, newSkill],
    }));
  };

  const removeSkillWanted = (id: string) => {
    setCurrentUser(prev => ({
      ...prev,
      skillsWanted: prev.skillsWanted.filter(w => w.id !== id),
    }));
  };

  const sendProposal = (
    proposalData: Omit<SwapProposal, 'id' | 'createdAt' | 'status' | 'senderId' | 'senderName' | 'senderAvatar' | 'senderHeadline'>
  ) => {
    const newProposal: SwapProposal = {
      ...proposalData,
      id: `prop-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatarUrl,
      senderHeadline: currentUser.headline,
      createdAt: 'Just now',
      status: 'pending',
    };
    setProposals(prev => [newProposal, ...prev]);
    setIsProposeModalOpen(false);
    syncProposalToSupabase(newProposal);
  };

  const updateProposalStatus = (id: string, status: SwapProposal['status']) => {
    setProposals(prev =>
      prev.map(p => {
        if (p.id === id) {
          return { ...p, status };
        }
        return p;
      })
    );

    // If accepted or completed, update stats
    if (status === 'completed') {
      setCurrentUser(prev => ({
        ...prev,
        completedSwapsCount: prev.completedSwapsCount + 1,
      }));
    }
  };

  const withdrawEarnings = async (
    amountPKR: number,
    method: PaymentMethod,
    accountIdentifier: string
  ): Promise<boolean> => {
    if (currentUser.walletBalancePKR < amountPKR) return false;

    const prefix = method === 'easypaisa' ? 'EP-W' : 'JC-W';
    const randCode = Math.floor(100000 + Math.random() * 900000);
    const referenceId = `${prefix}-${randCode}`;

    const newRecord: PaymentRecord = {
      id: `wth-${Date.now()}`,
      type: 'session_fee',
      amountPKR: amountPKR,
      method,
      accountIdentifier,
      referenceId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      receiptNote: `Withdrawal payout to ${accountIdentifier}`,
    };

    setPaymentHistory(prev => [newRecord, ...prev]);
    setCurrentUser(prev => ({
      ...prev,
      walletBalancePKR: prev.walletBalancePKR - amountPKR,
    }));

    return true;
  };

  // Two-way Mutual Matching Algorithm
  const calculateMatch = (peer: UserProfile): MatchResult => {
    const myOffered = currentUser.skillsOffered.map(s => s.name.toLowerCase());
    const myWanted = currentUser.skillsWanted.map(w => w.name.toLowerCase());

    const peerOffered = peer.skillsOffered.map(s => s.name.toLowerCase());
    const peerWanted = peer.skillsWanted.map(w => w.name.toLowerCase());

    // You offer what they want
    const youOfferTheyWant = currentUser.skillsOffered
      .filter(s => peerWanted.some(pw => pw.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(pw)))
      .map(s => s.name);

    // They offer what you want
    const theyOfferYouWant = peer.skillsOffered
      .filter(s => myWanted.some(mw => mw.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(mw)))
      .map(s => s.name);

    const isMutual = youOfferTheyWant.length > 0 && theyOfferYouWant.length > 0;

    let matchPercentage = 45; // baseline interest
    if (isMutual) {
      matchPercentage = 85 + Math.min(13, (youOfferTheyWant.length + theyOfferYouWant.length) * 4);
    } else if (theyOfferYouWant.length > 0) {
      matchPercentage = 65 + theyOfferYouWant.length * 5;
    } else if (youOfferTheyWant.length > 0) {
      matchPercentage = 60 + youOfferTheyWant.length * 5;
    }

    const synergyText = isMutual
      ? 'Perfect Reciprocal Swap — you teach what they want, and they teach what you want.'
      : theyOfferYouWant.length > 0
      ? 'Direct Mentor Match — they offer skills you are actively looking to learn.'
      : youOfferTheyWant.length > 0
      ? 'Direct Student Match — they are actively seeking skills you teach.'
      : 'Complementary Peer — discover shared learning avenues.';

    return {
      candidate: peer,
      matchPercentage,
      isMutualReciprocal: isMutual,
      youOfferTheyWant,
      theyOfferYouWant,
      proficiencySynergy: synergyText,
    };
  };

  const getMutualMatches = (): MatchResult[] => {
    return communityUsers
      .map(peer => calculateMatch(peer))
      .sort((a, b) => {
        if (a.isMutualReciprocal && !b.isMutualReciprocal) return -1;
        if (!a.isMutualReciprocal && b.isMutualReciprocal) return 1;
        return b.matchPercentage - a.matchPercentage;
      });
  };

  const resetToFreshOnboarding = () => {
    const freshUser: UserProfile = {
      ...DEFAULT_CURRENT_USER,
      name: '',
      username: '',
      phone: '',
      city: 'Karachi, Pakistan',
      headline: '',
      bio: '',
      intent: 'swap',
      isRegFeePaid: false,
      isPremiumPass: false,
      skillsOffered: [],
      skillsWanted: [],
      completedSwapsCount: 0,
      walletBalancePKR: 0,
    };
    setCurrentUser(freshUser);
    setIsIntentModalOpen(true);
    setActiveTab('onboarding');
  };

  // Dynamic Admin Account Creation (Admin creates and manages their own credentials)
  const adminRegister = (
    email: string,
    passcode: string,
    name?: string
  ): { success: boolean; error?: string } => {
    // Strictly enforce single admin account slot
    if (adminAccount) {
      return {
        success: false,
        error: 'An administrator account already exists. Only one admin account can be created on HUNARIVO.',
      };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = passcode.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid administrator email address.' };
    }
    if (cleanPass.length < 6) {
      return { success: false, error: 'Administrator password must be at least 6 characters.' };
    }

    const newAccount: AdminAccount = {
      email: cleanEmail,
      passcode: cleanPass,
      name: name?.trim() || 'Platform Administrator',
      createdAt: new Date().toLocaleDateString('en-PK', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    setAdminAccount(newAccount);
    localStorage.setItem('hunarivo_admin_account', JSON.stringify(newAccount));
    setIsAdminLoggedIn(true);
    localStorage.setItem('hunarivo_admin_session', 'true');
    return { success: true };
  };

  const adminLogin = (email: string, passcode: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = passcode.trim();

    if (!adminAccount) {
      return {
        success: false,
        error: 'No administrator account found. Please create your admin account first.',
      };
    }

    if (adminAccount.email.toLowerCase() === cleanEmail && adminAccount.passcode === cleanPass) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('hunarivo_admin_session', 'true');
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid administrator email or password. Please verify your credentials.',
    };
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('hunarivo_admin_session');
  };

  const adminResetAccount = () => {
    setAdminAccount(null);
    setIsAdminLoggedIn(false);
    localStorage.removeItem('hunarivo_admin_account');
    localStorage.removeItem('hunarivo_admin_session');
  };

  // ================= COMMUNITY USER AUTHENTICATION =================
  const [isUserAuthenticated, setIsUserAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('hunarivo_user_session_active') === 'true';
  });

  const userLogin = (identifier: string, password?: string): { success: boolean; error?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password?.trim();

    const matched = allRegisteredUsers.find(
      u =>
        u.email.toLowerCase() === cleanId ||
        u.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, '') ||
        u.username.toLowerCase() === cleanId
    );

    if (!matched) {
      return {
        success: false,
        error: 'No account found with this email, phone, or username. Please check your credentials or create a new account.',
      };
    }

    if (matched.isSuspended) {
      return {
        success: false,
        error: 'This account has been suspended by the platform administrator. Please contact support.',
      };
    }

    if (matched.password && cleanPass && matched.password !== cleanPass) {
      return {
        success: false,
        error: 'Incorrect password. Please verify and try again.',
      };
    }

    setCurrentUser(matched);
    setIsUserAuthenticated(true);
    localStorage.setItem('hunarivo_user_session_active', 'true');
    localStorage.setItem('hunarivo_logged_in_user_id', matched.id);
    return { success: true };
  };

  const userSignup = (data: {
    name: string;
    email: string;
    phone: string;
    city: string;
    password?: string;
    intent: UserIntent;
    headline?: string;
    bio?: string;
  }): { success: boolean; error?: string } => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone.trim();
    const cleanName = data.name.trim();

    if (!cleanName) {
      return { success: false, error: 'Full Name is required.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, error: 'A valid Pakistani mobile number is required (e.g. 03001234567).' };
    }

    const emailExists = allRegisteredUsers.some(u => u.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      return {
        success: false,
        error: 'An account with this email address is already registered. Please sign in instead.',
      };
    }

    const cleanUsername = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 15) + '_' + Math.floor(100 + Math.random() * 900);

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      phone: cleanPhone,
      city: data.city.trim() || 'Lahore, Pakistan',
      headline: data.headline?.trim() || `${data.intent === 'teach_revenue' ? 'Skill Instructor' : 'Community Member'}`,
      bio: data.bio?.trim() || 'Passionate about exchanging and learning skills on HUNARIVO.',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80`,
      intent: data.intent,
      isRegFeePaid: false,
      isPremiumPass: false,
      passPaymentStatus: 'none',
      isSuspended: false,
      password: data.password?.trim(),
      skillsOffered: [],
      skillsWanted: [],
      weeklyHours: 4,
      preferredFormats: ['video'],
      completedSwapsCount: 0,
      rating: 5.0,
      reviewsCount: 0,
      joinedDate: 'Recently',
      walletBalancePKR: 0,
    };

    setCommunityUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsUserAuthenticated(true);
    localStorage.setItem('hunarivo_user_session_active', 'true');
    localStorage.setItem('hunarivo_logged_in_user_id', newUser.id);
    localStorage.setItem('hunarivo_user', JSON.stringify(newUser));

    // Sync to Supabase
    syncProfileToSupabase(newUser);

    return { success: true };
  };

  const userLogout = () => {
    setIsUserAuthenticated(false);
    localStorage.removeItem('hunarivo_user_session_active');
    localStorage.removeItem('hunarivo_logged_in_user_id');
    localStorage.removeItem('hunarivo_user');
    setCurrentUser(DEFAULT_CURRENT_USER);
    setActiveTab('auth');
  };

  const adminCancelSubscription = (userId: string) => {
    if (userId === currentUser.id) {
      setCurrentUser(prev => ({
        ...prev,
        isPremiumPass: false,
        passPaymentStatus: 'none',
      }));
    }
    setCommunityUsers(prev =>
      prev.map(u =>
        u.id === userId
          ? { ...u, isPremiumPass: false, passPaymentStatus: 'none' }
          : u
      )
    );
  };

  const adminApproveSubscription = (userId: string) => {
    if (userId === currentUser.id) {
      setCurrentUser(prev => ({
        ...prev,
        isPremiumPass: true,
        passPaymentStatus: 'active',
      }));
    }
    setCommunityUsers(prev =>
      prev.map(u =>
        u.id === userId
          ? { ...u, isPremiumPass: true, passPaymentStatus: 'active' }
          : u
      )
    );
  };

  const adminVerifyRegistration = (userId: string, isPaid: boolean) => {
    if (userId === currentUser.id) {
      setCurrentUser(prev => ({ ...prev, isRegFeePaid: isPaid }));
    }
    setCommunityUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, isRegFeePaid: isPaid } : u))
    );
  };

  const adminToggleSuspend = (userId: string) => {
    if (userId === currentUser.id) {
      setCurrentUser(prev => ({ ...prev, isSuspended: !prev.isSuspended }));
    }
    setCommunityUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, isSuspended: !u.isSuspended } : u))
    );
  };

  const adminDeleteUser = (userId: string) => {
    setCommunityUsers(prev => prev.filter(u => u.id !== userId));
  };

  const allRegisteredUsers: UserProfile[] = [
    currentUser,
    ...communityUsers.filter(u => u.id !== currentUser.id),
  ];

  return (
    <AppContext.Provider
      value={{
        currentUser,
        communityUsers,
        proposals,
        paymentHistory,
        receivingAccounts,
        updateReceivingAccounts,
        isSupabaseConnected: isSupabaseConnectedState,
        refreshSupabaseSync,
        isUserAuthenticated,
        userLogin,
        userSignup,
        userLogout,
        activeTab,
        setActiveTab,
        theme,
        toggleTheme,
        isAdminLoggedIn,
        adminAccount,
        adminRegister,
        adminLogin,
        adminLogout,
        adminResetAccount,
        adminCancelSubscription,
        adminApproveSubscription,
        adminVerifyRegistration,
        adminToggleSuspend,
        adminDeleteUser,
        allRegisteredUsers,
        isIntentModalOpen,
        setIsIntentModalOpen,
        isPremiumModalOpen,
        setIsPremiumModalOpen,
        isProposeModalOpen,
        setIsProposeModalOpen,
        proposalTargetUser,
        openProposeModalForUser,
        isRegistrationPaymentModalOpen,
        setIsRegistrationPaymentModalOpen,
        verifyTransactionId,
        setIntent,
        processPayment,
        completeOnboarding,
        addSkillOffered,
        removeSkillOffered,
        addSkillWanted,
        removeSkillWanted,
        sendProposal,
        updateProposalStatus,
        withdrawEarnings,
        calculateMatch,
        getMutualMatches,
        resetToFreshOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
