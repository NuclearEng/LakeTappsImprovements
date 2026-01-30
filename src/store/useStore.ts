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
  WorkflowType,
  SolarPermitType,
  ADUPermitType,
  AgentInfo,
  ContractorInfo,
  EnvironmentalScreening,
  PreFlightChecklist,
  // Drawing types
  DrawingState,
  DrawingToolType,
  DrawingLayerType,
  DrawingStyle,
  DrawingObject,
  DrawingHistoryEntry,
  SitePlanDrawing,
  DrawingScale,
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

  // Actions - Workflow Type
  setWorkflowType: (type: WorkflowType) => void;

  // Actions - Owner
  updateOwner: (owner: Partial<PropertyOwner>) => void;

  // Actions - Project Details
  updateProjectDetails: (details: Partial<ProjectDetails>) => void;

  // Actions - Site
  updateSiteInfo: (site: Partial<SiteInformation>) => void;

  // Actions - Insurance
  updateInsurance: (insurance: Partial<InsuranceInfo>) => void;

  // Actions - Agent/Contractor/Environmental/PreFlight
  updateAgent: (agent: Partial<AgentInfo>) => void;
  updateContractor: (contractor: Partial<ContractorInfo>) => void;
  updateEnvironmental: (environmental: Partial<EnvironmentalScreening>) => void;
  updatePreFlightChecklist: (checklist: Partial<PreFlightChecklist>) => void;

  // Actions - Permits
  setRequiredPermits: (permits: PermitType[]) => void;
  setSolarPermits: (permits: SolarPermitType[]) => void;
  setADUPermits: (permits: ADUPermitType[]) => void;
  updatePermit: (type: string, data: Partial<PermitApplication>) => void;

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

  // Drawing state
  drawingState: DrawingState;

  // Actions - Drawing
  initializeDrawing: (drawing: SitePlanDrawing) => void;
  saveDrawing: (drawing: SitePlanDrawing) => void;
  deleteDrawing: (id: string) => void;
  setActiveTool: (tool: DrawingToolType) => void;
  setActiveLayer: (layer: DrawingLayerType) => void;
  setActiveStyle: (style: DrawingStyle) => void;
  setSelectedObjects: (ids: string[]) => void;
  updateDrawingObjects: (objects: DrawingObject[]) => void;
  addToDrawingHistory: (entry: DrawingHistoryEntry) => void;
  undoDrawing: () => void;
  redoDrawing: () => void;
  updateDrawingScale: (scale: DrawingScale) => void;
  clearDrawingClipboard: () => void;
  copyToClipboard: (objects: DrawingObject[]) => void;
  pasteFromClipboard: () => DrawingObject[];
  pushCanvasSnapshot: (json: string) => void;
  getSnapshotForUndo: () => string | null;
  getSnapshotForRedo: () => string | null;
}

// Legacy stages (for backwards compatibility)
const WORKFLOW_STAGES: WorkflowStage[] = [
  { id: 1, name: 'Welcome', description: 'Account setup and introduction', isComplete: false, isAccessible: true },
  { id: 2, name: 'Project Type', description: 'Select your project category', isComplete: false, isAccessible: false },
  { id: 3, name: 'Owner Info', description: 'Enter owner information', isComplete: false, isAccessible: false },
  { id: 4, name: 'Details', description: 'Describe your project', isComplete: false, isAccessible: false },
  { id: 5, name: 'Site Info', description: 'Property location and site plans', isComplete: false, isAccessible: false },
  { id: 6, name: 'Agent/Contractor', description: 'Agent and contractor information', isComplete: false, isAccessible: false },
  { id: 7, name: 'Permits', description: 'Review required permits', isComplete: false, isAccessible: false },
  { id: 8, name: 'Insurance', description: 'Insurance requirements', isComplete: false, isAccessible: false },
  { id: 9, name: 'Review', description: 'Review all information', isComplete: false, isAccessible: false },
  { id: 10, name: 'Generate', description: 'Create submission documents', isComplete: false, isAccessible: false },
  { id: 11, name: 'Complete', description: 'Submit and track progress', isComplete: false, isAccessible: false },
];

// Workflow-specific stages
export const getWorkflowStages = (workflowType: WorkflowType): WorkflowStage[] => {
  const commonStages: WorkflowStage[] = [
    { id: 1, name: 'Welcome', description: 'Select workflow type', isComplete: false, isAccessible: true },
    { id: 2, name: 'Project Type', description: 'Select your project category', isComplete: false, isAccessible: false },
  ];

  const workflowSpecificStages: Record<WorkflowType, WorkflowStage[]> = {
    waterfront: [
      { id: 3, name: 'Owner Info', description: 'Enter owner information', isComplete: false, isAccessible: false },
      { id: 4, name: 'Details', description: 'Project details', isComplete: false, isAccessible: false },
      { id: 5, name: 'Site Info', description: 'Property location and site plans', isComplete: false, isAccessible: false },
      { id: 6, name: 'Agent/Contractor', description: 'Agent and contractor information', isComplete: false, isAccessible: false },
      { id: 7, name: 'Permits', description: 'Required permits', isComplete: false, isAccessible: false },
      { id: 8, name: 'Insurance', description: 'Insurance requirements', isComplete: false, isAccessible: false },
      { id: 9, name: 'Review', description: 'Review all information', isComplete: false, isAccessible: false },
      { id: 10, name: 'Generate', description: 'Generate documents', isComplete: false, isAccessible: false },
      { id: 11, name: 'Complete', description: 'Review and submit', isComplete: false, isAccessible: false },
    ],
    solar: [
      { id: 3, name: 'Owner Info', description: 'Enter owner information', isComplete: false, isAccessible: false },
      { id: 4, name: 'Details', description: 'System specifications', isComplete: false, isAccessible: false },
      { id: 5, name: 'Site Info', description: 'Property location and site plans', isComplete: false, isAccessible: false },
      { id: 6, name: 'Agent/Contractor', description: 'Agent and contractor information', isComplete: false, isAccessible: false },
      { id: 7, name: 'Permits', description: 'Required permits', isComplete: false, isAccessible: false },
      { id: 8, name: 'Insurance', description: 'Insurance requirements', isComplete: false, isAccessible: false },
      { id: 9, name: 'Review', description: 'Review all information', isComplete: false, isAccessible: false },
      { id: 10, name: 'Generate', description: 'Generate documents', isComplete: false, isAccessible: false },
      { id: 11, name: 'Complete', description: 'Review and submit', isComplete: false, isAccessible: false },
    ],
    adu: [
      { id: 3, name: 'Owner Info', description: 'Enter owner information', isComplete: false, isAccessible: false },
      { id: 4, name: 'Details', description: 'ADU specifications', isComplete: false, isAccessible: false },
      { id: 5, name: 'Site Info', description: 'Property location and site plans', isComplete: false, isAccessible: false },
      { id: 6, name: 'Agent/Contractor', description: 'Agent and contractor information', isComplete: false, isAccessible: false },
      { id: 7, name: 'Permits', description: 'Required permits', isComplete: false, isAccessible: false },
      { id: 8, name: 'Insurance', description: 'Insurance requirements', isComplete: false, isAccessible: false },
      { id: 9, name: 'Review', description: 'Review all information', isComplete: false, isAccessible: false },
      { id: 10, name: 'Generate', description: 'Generate documents', isComplete: false, isAccessible: false },
      { id: 11, name: 'Complete', description: 'Review and submit', isComplete: false, isAccessible: false },
    ],
  };

  return [...commonStages, ...workflowSpecificStages[workflowType]];
};

const createEmptyProject = (): Project => ({
  id: uuidv4(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  currentStage: 1,
  workflowType: 'waterfront', // Default workflow type
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
    ownershipType: 'individual',
    coOwners: [],
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
  requiredPermits: [], // Set based on workflow type
  solarPermits: [],
  aduPermits: [],
  permits: {} as Record<string, PermitApplication>,
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

  // Workflow type actions
  setWorkflowType: (type: WorkflowType) => {
    const { project } = get();
    if (!project) return;

    // Set default permits based on workflow type
    let requiredPermits: PermitType[] = [];
    let solarPermits: SolarPermitType[] = [];
    let aduPermits: ADUPermitType[] = [];

    if (type === 'waterfront') {
      requiredPermits = ['cwa_license'];
    } else if (type === 'solar') {
      solarPermits = ['solar_building_permit', 'lni_electrical_permit'];
    } else if (type === 'adu') {
      aduPermits = ['adu_building_permit', 'planning_approval'];
    }

    set({
      project: {
        ...project,
        workflowType: type,
        requiredPermits,
        solarPermits,
        aduPermits,
        updatedAt: new Date().toISOString(),
      },
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

  // Agent actions
  updateAgent: (agentUpdate) => {
    const { project } = get();
    if (!project) return;

    set({
      project: {
        ...project,
        agent: { ...(project.agent || { name: '', company: '', address: '', phone: '', email: '', authorizationScope: [] }), ...agentUpdate },
        updatedAt: new Date().toISOString(),
      },
    });
  },

  // Contractor actions
  updateContractor: (contractorUpdate) => {
    const { project } = get();
    if (!project) return;

    set({
      project: {
        ...project,
        contractor: { ...(project.contractor || { name: '', waLicenseNumber: '', businessAddress: '', phone: '', email: '' }), ...contractorUpdate },
        updatedAt: new Date().toISOString(),
      },
    });
  },

  // Environmental actions
  updateEnvironmental: (envUpdate) => {
    const { project } = get();
    if (!project) return;

    set({
      project: {
        ...project,
        environmental: { ...(project.environmental || { nearWetlands: false, vegetationRemoval: false, groundDisturbance: false, nearFishSpawning: false, notes: '' }), ...envUpdate },
        updatedAt: new Date().toISOString(),
      },
    });
  },

  // Pre-flight checklist actions
  updatePreFlightChecklist: (checklistUpdate) => {
    const { project } = get();
    if (!project) return;

    set({
      project: {
        ...project,
        preFlightChecklist: { ...(project.preFlightChecklist || { infoAccurate: false, understandPreConstruction: false, annualInsurance: false, submitAsInstructed: false, processingTimesUnderstood: false }), ...checklistUpdate },
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

  setSolarPermits: (permits: SolarPermitType[]) => {
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
        solarPermits: permits,
        permits: newPermits,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  setADUPermits: (permits: ADUPermitType[]) => {
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
        aduPermits: permits,
        permits: newPermits,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  updatePermit: (type: string, data) => {
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

  // Drawing state
  drawingState: {
    currentDrawing: null,
    savedDrawings: [],
    activeTool: 'select',
    activeLayer: 'proposed_improvements',
    activeStyle: {
      strokeColor: '#000000',
      strokeWidth: 2,
      strokeStyle: 'solid',
      fillColor: 'transparent',
      fillOpacity: 0.3,
    },
    selectedObjectIds: [],
    history: [],
    historyIndex: -1,
    clipboard: [],
    isModified: false,
    canvasSnapshots: [],
    snapshotIndex: -1,
  },

  // Drawing actions
  initializeDrawing: (drawing) => {
    set((state) => ({
      drawingState: {
        ...state.drawingState,
        currentDrawing: drawing,
        isModified: false,
        history: [],
        historyIndex: -1,
        canvasSnapshots: [],
        snapshotIndex: -1,
      },
    }));
  },

  saveDrawing: (drawing) => {
    set((state) => {
      const existingIndex = state.drawingState.savedDrawings.findIndex(
        (d) => d.id === drawing.id
      );
      const updatedDrawings =
        existingIndex >= 0
          ? state.drawingState.savedDrawings.map((d, i) =>
              i === existingIndex ? drawing : d
            )
          : [...state.drawingState.savedDrawings, drawing];

      return {
        drawingState: {
          ...state.drawingState,
          currentDrawing: drawing,
          savedDrawings: updatedDrawings,
          isModified: false,
        },
      };
    });
  },

  deleteDrawing: (id) => {
    set((state) => ({
      drawingState: {
        ...state.drawingState,
        savedDrawings: state.drawingState.savedDrawings.filter((d) => d.id !== id),
        currentDrawing:
          state.drawingState.currentDrawing?.id === id
            ? null
            : state.drawingState.currentDrawing,
      },
    }));
  },

  setActiveTool: (tool) => {
    set((state) => ({
      drawingState: {
        ...state.drawingState,
        activeTool: tool,
      },
    }));
  },

  setActiveLayer: (layer) => {
    set((state) => ({
      drawingState: {
        ...state.drawingState,
        activeLayer: layer,
      },
    }));
  },

  setActiveStyle: (style) => {
    set((state) => ({
      drawingState: {
        ...state.drawingState,
        activeStyle: style,
      },
    }));
  },

  setSelectedObjects: (ids) => {
    set((state) => ({
      drawingState: {
        ...state.drawingState,
        selectedObjectIds: ids,
      },
    }));
  },

  updateDrawingObjects: (newObjects) => {
    set((state) => {
      const existing = state.drawingState.currentDrawing?.objects || [];
      const merged = [...existing];
      for (const obj of newObjects) {
        const idx = merged.findIndex(o => o.id === obj.id);
        if (idx >= 0) merged[idx] = obj;
        else merged.push(obj);
      }
      return {
        drawingState: {
          ...state.drawingState,
          currentDrawing: state.drawingState.currentDrawing
            ? {
                ...state.drawingState.currentDrawing,
                objects: merged,
                updatedAt: new Date().toISOString(),
              }
            : null,
          isModified: true,
        },
      };
    });
  },

  addToDrawingHistory: (entry) => {
    set((state) => {
      const newHistory = state.drawingState.history.slice(
        0,
        state.drawingState.historyIndex + 1
      );
      newHistory.push(entry);
      // Keep last 50 history entries
      const trimmedHistory = newHistory.slice(-50);

      return {
        drawingState: {
          ...state.drawingState,
          history: trimmedHistory,
          historyIndex: trimmedHistory.length - 1,
        },
      };
    });
  },

  undoDrawing: () => {
    set((state) => {
      if (state.drawingState.historyIndex < 0) return state;
      return {
        drawingState: {
          ...state.drawingState,
          historyIndex: state.drawingState.historyIndex - 1,
        },
      };
    });
  },

  redoDrawing: () => {
    set((state) => {
      if (state.drawingState.historyIndex >= state.drawingState.history.length - 1)
        return state;
      return {
        drawingState: {
          ...state.drawingState,
          historyIndex: state.drawingState.historyIndex + 1,
        },
      };
    });
  },

  updateDrawingScale: (scale) => {
    set((state) => ({
      drawingState: {
        ...state.drawingState,
        currentDrawing: state.drawingState.currentDrawing
          ? {
              ...state.drawingState.currentDrawing,
              scale,
              updatedAt: new Date().toISOString(),
            }
          : null,
      },
    }));
  },

  clearDrawingClipboard: () => {
    set((state) => ({
      drawingState: {
        ...state.drawingState,
        clipboard: [],
      },
    }));
  },

  copyToClipboard: (objects) => {
    set((state) => ({
      drawingState: {
        ...state.drawingState,
        clipboard: objects,
      },
    }));
  },

  pasteFromClipboard: () => {
    const { drawingState } = get();
    return drawingState.clipboard.map((obj) => ({
      ...obj,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  },

  pushCanvasSnapshot: (json: string) => {
    set((state) => {
      const { canvasSnapshots, snapshotIndex } = state.drawingState;
      // Truncate forward history on new action
      const truncated = canvasSnapshots.slice(0, snapshotIndex + 1);
      truncated.push(json);
      // Cap at 50 snapshots
      const capped = truncated.length > 50 ? truncated.slice(truncated.length - 50) : truncated;
      return {
        drawingState: {
          ...state.drawingState,
          canvasSnapshots: capped,
          snapshotIndex: capped.length - 1,
        },
      };
    });
  },

  getSnapshotForUndo: () => {
    const { drawingState } = get();
    const { canvasSnapshots, snapshotIndex } = drawingState;
    if (snapshotIndex <= 0) return null;
    const newIndex = snapshotIndex - 1;
    set((state) => ({
      drawingState: {
        ...state.drawingState,
        snapshotIndex: newIndex,
      },
    }));
    return canvasSnapshots[newIndex];
  },

  getSnapshotForRedo: () => {
    const { drawingState } = get();
    const { canvasSnapshots, snapshotIndex } = drawingState;
    if (snapshotIndex >= canvasSnapshots.length - 1) return null;
    const newIndex = snapshotIndex + 1;
    set((state) => ({
      drawingState: {
        ...state.drawingState,
        snapshotIndex: newIndex,
      },
    }));
    return canvasSnapshots[newIndex];
  },
}));

export { WORKFLOW_STAGES };
export type { WorkflowStage };
