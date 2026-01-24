import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  Project,
  PropertyOwner,
  ProjectDetails,
  SiteInformation,
  InsuranceInfo,
  PermitType,
  PermitApplication,
  Notification,
  ConfirmationDialog,
  ActionPrompt,
  WorkflowStage,
} from '@/types';

interface AppState {
  // Current project
  project: Project | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: string | null;

  // Navigation
  currentStage: number;
  stageHistory: number[];

  // Notifications
  notifications: Notification[];

  // Confirmation dialog
  confirmDialog: ConfirmationDialog | null;

  // Action prompts
  actionPrompts: ActionPrompt[];
  currentActionPrompt: ActionPrompt | null;

  // Database
  dbReady: boolean;

  // Actions - Project
  createProject: () => void;
  loadProject: (id: string) => Promise<void>;
  saveProject: () => Promise<void>;
  clearProject: () => void;

  // Actions - Owner
  updateOwner: (owner: Partial<PropertyOwner>) => void;

  // Actions - Project Details
  updateProjectDetails: (details: Partial<ProjectDetails>) => void;

  // Actions - Site
  updateSiteInfo: (site: Partial<SiteInformation>) => void;

  // Actions - Insurance
  updateInsurance: (insurance: Partial<InsuranceInfo>) => void;

  // Actions - Permits
  setRequiredPermits: (permits: PermitType[]) => void;
  updatePermit: (type: PermitType, data: Partial<PermitApplication>) => void;

  // Actions - Navigation
  goToStage: (stage: number) => void;
  nextStage: () => void;
  previousStage: () => void;
  canGoBack: () => boolean;
  canGoForward: () => boolean;

  // Actions - Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Actions - Confirmation
  showConfirmation: (dialog: Omit<ConfirmationDialog, 'isOpen'>) => void;
  hideConfirmation: () => void;

  // Actions - Action Prompts
  addActionPrompt: (prompt: Omit<ActionPrompt, 'id' | 'isCompleted'>) => void;
  completeActionPrompt: (id: string) => void;
  showActionPrompt: (prompt: ActionPrompt) => void;
  hideActionPrompt: () => void;

  // Actions - Database
  setDbReady: (ready: boolean) => void;
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  { id: 1, name: 'Welcome', description: 'Account setup and introduction', isComplete: false, isAccessible: true },
  { id: 2, name: 'Project Type', description: 'Select your project category', isComplete: false, isAccessible: false },
  { id: 3, name: 'Property Owner', description: 'Enter owner information', isComplete: false, isAccessible: false },
  { id: 4, name: 'Project Details', description: 'Describe your project', isComplete: false, isAccessible: false },
  { id: 5, name: 'Site Information', description: 'Upload site plans and documents', isComplete: false, isAccessible: false },
  { id: 6, name: 'Permit Applications', description: 'Complete required permits', isComplete: false, isAccessible: false },
  { id: 7, name: 'Insurance', description: 'Insurance requirements', isComplete: false, isAccessible: false },
  { id: 8, name: 'Review', description: 'Review all information', isComplete: false, isAccessible: false },
  { id: 9, name: 'Generate Documents', description: 'Create submission documents', isComplete: false, isAccessible: false },
  { id: 10, name: 'Submit & Track', description: 'Submit and track progress', isComplete: false, isAccessible: false },
];

const createEmptyProject = (): Project => ({
  id: uuidv4(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  currentStage: 1,
  owner: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'WA',
    zip: '',
    parcelNumber: '',
    isAgent: false,
  },
  details: {
    category: 'new_construction',
    improvementTypes: [],
    description: '',
    estimatedCost: 0,
    startDate: '',
    completionDate: '',
    inWater: false,
    belowHighWaterLine: false,
    withinShorelineJurisdiction: true,
    existingStructure: false,
  },
  site: {
    propertyAddress: '',
    parcelNumber: '',
    elevation: 0,
    lotSize: '',
    waterFrontage: '',
    sitePlanFiles: [],
    additionalDocuments: [],
  },
  insurance: {
    hasInsurance: false,
  },
  requiredPermits: ['cwa_license'], // CWA is always required
  permits: {
    cwa_license: {
      type: 'cwa_license',
      status: 'not_started',
      requiredFields: {},
      completedFields: {},
    },
  } as Record<PermitType, PermitApplication>,
  isComplete: false,
});

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  project: null,
  isLoading: false,
  isSaving: false,
  lastSaved: null,
  currentStage: 1,
  stageHistory: [1],
  notifications: [],
  confirmDialog: null,
  actionPrompts: [],
  currentActionPrompt: null,
  dbReady: false,

  // Project actions
  createProject: () => {
    const newProject = createEmptyProject();
    set({
      project: newProject,
      currentStage: 1,
      stageHistory: [1],
    });
  },

  loadProject: async (id: string) => {
    set({ isLoading: true });
    try {
      // Load from local database (implemented in db.ts)
      const { loadProjectFromDb } = await import('@/lib/db');
      const project = await loadProjectFromDb(id);
      if (project) {
        set({
          project,
          currentStage: project.currentStage,
          stageHistory: [project.currentStage],
          isLoading: false,
        });
      } else {
        throw new Error('Project not found');
      }
    } catch (error) {
      set({ isLoading: false });
      get().addNotification({
        type: 'error',
        title: 'Failed to load project',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        dismissible: true,
      });
    }
  },

  saveProject: async () => {
    const { project } = get();
    if (!project) return;

    set({ isSaving: true });
    try {
      const { saveProjectToDb } = await import('@/lib/db');
      await saveProjectToDb({
        ...project,
        updatedAt: new Date().toISOString(),
        currentStage: get().currentStage,
      });
      set({
        isSaving: false,
        lastSaved: new Date().toISOString(),
      });
    } catch (error) {
      set({ isSaving: false });
      get().addNotification({
        type: 'error',
        title: 'Failed to save',
        message: 'Your changes could not be saved. Please try again.',
        dismissible: true,
      });
    }
  },

  clearProject: () => {
    set({
      project: null,
      currentStage: 1,
      stageHistory: [1],
      actionPrompts: [],
      currentActionPrompt: null,
    });
  },

  // Owner actions
  updateOwner: (ownerUpdate) => {
    const { project } = get();
    if (!project) return;

    set({
      project: {
        ...project,
        owner: { ...project.owner, ...ownerUpdate },
        updatedAt: new Date().toISOString(),
      },
    });
  },

  // Project details actions
  updateProjectDetails: (detailsUpdate) => {
    const { project } = get();
    if (!project) return;

    set({
      project: {
        ...project,
        details: { ...project.details, ...detailsUpdate },
        updatedAt: new Date().toISOString(),
      },
    });
  },

  // Site info actions
  updateSiteInfo: (siteUpdate) => {
    const { project } = get();
    if (!project) return;

    set({
      project: {
        ...project,
        site: { ...project.site, ...siteUpdate },
        updatedAt: new Date().toISOString(),
      },
    });
  },

  // Insurance actions
  updateInsurance: (insuranceUpdate) => {
    const { project } = get();
    if (!project) return;

    set({
      project: {
        ...project,
        insurance: { ...project.insurance, ...insuranceUpdate },
        updatedAt: new Date().toISOString(),
      },
    });
  },

  // Permit actions
  setRequiredPermits: (permits) => {
    const { project } = get();
    if (!project) return;

    const newPermits = { ...project.permits };
    permits.forEach((type) => {
      if (!newPermits[type]) {
        newPermits[type] = {
          type,
          status: 'not_started',
          requiredFields: {},
          completedFields: {},
        };
      }
    });

    set({
      project: {
        ...project,
        requiredPermits: permits,
        permits: newPermits,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  updatePermit: (type, data) => {
    const { project } = get();
    if (!project || !project.permits[type]) return;

    set({
      project: {
        ...project,
        permits: {
          ...project.permits,
          [type]: { ...project.permits[type], ...data },
        },
        updatedAt: new Date().toISOString(),
      },
    });
  },

  // Navigation actions
  goToStage: (stage) => {
    const { stageHistory, currentStage } = get();
    if (stage === currentStage) return;

    set({
      currentStage: stage,
      stageHistory: [...stageHistory, stage],
    });
  },

  nextStage: () => {
    const { currentStage, stageHistory } = get();
    if (currentStage < WORKFLOW_STAGES.length) {
      set({
        currentStage: currentStage + 1,
        stageHistory: [...stageHistory, currentStage + 1],
      });
    }
  },

  previousStage: () => {
    const { stageHistory } = get();
    if (stageHistory.length > 1) {
      const newHistory = [...stageHistory];
      newHistory.pop();
      const previousStage = newHistory[newHistory.length - 1];
      set({
        currentStage: previousStage,
        stageHistory: newHistory,
      });
    }
  },

  canGoBack: () => {
    return get().stageHistory.length > 1;
  },

  canGoForward: () => {
    return get().currentStage < WORKFLOW_STAGES.length;
  },

  // Notification actions
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-dismiss if duration is set
    if (notification.duration) {
      setTimeout(() => {
        get().removeNotification(newNotification.id);
      }, notification.duration);
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  // Confirmation actions
  showConfirmation: (dialog) => {
    set({
      confirmDialog: { ...dialog, isOpen: true },
    });
  },

  hideConfirmation: () => {
    set({ confirmDialog: null });
  },

  // Action prompt actions
  addActionPrompt: (prompt) => {
    const newPrompt: ActionPrompt = {
      ...prompt,
      id: uuidv4(),
      isCompleted: false,
    };

    set((state) => ({
      actionPrompts: [...state.actionPrompts, newPrompt],
    }));
  },

  completeActionPrompt: (id) => {
    set((state) => ({
      actionPrompts: state.actionPrompts.map((p) =>
        p.id === id ? { ...p, isCompleted: true, completedAt: new Date().toISOString() } : p
      ),
    }));
  },

  showActionPrompt: (prompt) => {
    set({ currentActionPrompt: prompt });
  },

  hideActionPrompt: () => {
    set({ currentActionPrompt: null });
  },

  // Database actions
  setDbReady: (ready) => {
    set({ dbReady: ready });
  },
}));

export { WORKFLOW_STAGES };
export type { WorkflowStage };
