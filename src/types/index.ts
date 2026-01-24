// Project Types
export type ProjectCategory = 'new_construction' | 'modification';

export type ImprovementType =
  | 'dock'
  | 'pier'
  | 'float'
  | 'boat_lift'
  | 'boat_ramp'
  | 'boathouse'
  | 'bulkhead'
  | 'mooring_pile'
  | 'swim_float'
  | 'other';

export type PermitType =
  | 'cwa_license'
  | 'shoreline_exemption'
  | 'shoreline_substantial'
  | 'shoreline_conditional'
  | 'shoreline_variance'
  | 'building_permit'
  | 'hpa'
  | 'section_10'
  | 'section_404'
  | 'water_quality_401';

export interface PropertyOwner {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  parcelNumber: string;
  isAgent: boolean;
  agentAuthorization?: string;
}

export interface ProjectDetails {
  category: ProjectCategory;
  improvementTypes: ImprovementType[];
  description: string;
  estimatedCost: number;
  startDate: string;
  completionDate: string;
  inWater: boolean;
  belowHighWaterLine: boolean;
  withinShorelineJurisdiction: boolean;
  existingStructure: boolean;
  existingStructureDescription?: string;
}

export interface SiteInformation {
  propertyAddress: string;
  lakeAddress?: string;
  parcelNumber: string;
  elevation: number;
  lotSize: string;
  waterFrontage: string;
  sitePlanFiles: UploadedFile[];
  additionalDocuments: UploadedFile[];
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64
  uploadedAt: string;
  preview?: string;
}

export interface InsuranceInfo {
  hasInsurance: boolean;
  provider?: string;
  policyNumber?: string;
  effectiveDate?: string;
  expirationDate?: string;
  coverageAmount?: number;
  additionalInsuredAdded?: boolean;
  certificateFile?: UploadedFile;
}

export interface PermitApplication {
  type: PermitType;
  status: 'not_started' | 'in_progress' | 'ready' | 'submitted' | 'approved' | 'denied';
  requiredFields: Record<string, unknown>;
  completedFields: Record<string, unknown>;
  generatedDocument?: string;
  submittedAt?: string;
  submissionMethod?: string;
  confirmationNumber?: string;
  notes?: string;
}

export interface Project {
  id: string;
  createdAt: string;
  updatedAt: string;
  currentStage: number;
  owner: PropertyOwner;
  details: ProjectDetails;
  site: SiteInformation;
  insurance: InsuranceInfo;
  requiredPermits: PermitType[];
  permits: Record<PermitType, PermitApplication>;
  isComplete: boolean;
}

// Workflow Stage Types
export interface WorkflowStage {
  id: number;
  name: string;
  description: string;
  isComplete: boolean;
  isAccessible: boolean;
}

// Agency Contact Types
export interface AgencyContact {
  name: string;
  department?: string;
  contactName?: string;
  email: string;
  phone: string;
  fax?: string;
  address?: string;
  mailingAddress?: string;
  website?: string;
  portalUrl?: string;
  submissionMethod: 'email' | 'online' | 'mail' | 'in_person';
  hours?: string;
}

// Notification Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  details?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible: boolean;
  duration?: number; // ms, undefined = persistent
  createdAt: string;
}

// Confirmation Dialog Types
export interface ConfirmationDialog {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant: 'warning' | 'danger' | 'info';
}

// Action Prompt Types
export interface ActionPrompt {
  id: string;
  type: 'download' | 'email' | 'submit' | 'upload' | 'call';
  title: string;
  instructions: string[];
  agency: string;
  contactInfo?: AgencyContact;
  documentName?: string;
  documentData?: string;
  isCompleted: boolean;
  completedAt?: string;
}

// ============================================
// 2D CAD Drawing Types
// ============================================

export type DrawingToolType =
  | 'select'
  | 'pan'
  // Basic shapes
  | 'rectangle'
  | 'circle'
  | 'ellipse'
  | 'line'
  | 'triangle'
  // Polynomial/Curves
  | 'polyline'
  | 'polygon'
  | 'arc'
  | 'curve' // Bezier curve
  | 'spline'
  // Advanced
  | 'dimension'
  | 'text'
  | 'image'
  | 'freehand';

export type DrawingLayerType =
  | 'property_boundary'
  | 'existing_structures'
  | 'proposed_improvements'
  | 'dimensions'
  | 'annotations'
  | 'aerial_imagery';

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStyle {
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  fillColor: string;
  fillOpacity: number;
  fontSize?: number;
  fontFamily?: string;
}

export interface DrawingObject {
  id: string;
  type: DrawingToolType;
  layer: DrawingLayerType;
  points: DrawingPoint[];
  style: DrawingStyle;
  label?: string;
  dimensions?: {
    width?: number;
    height?: number;
    length?: number;
    radius?: number;
    unit: 'feet' | 'inches' | 'meters';
  };
  rotation: number;
  locked: boolean;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
  // Fabric.js serialized object
  fabricData?: string;
}

export interface DrawingLayer {
  id: DrawingLayerType;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  order: number;
}

export interface DrawingGrid {
  enabled: boolean;
  size: number; // pixels
  snapToGrid: boolean;
  color: string;
  opacity: number;
}

export interface DrawingScale {
  pixelsPerFoot: number;
  displayUnit: 'feet' | 'inches' | 'meters';
  scaleRatio: string; // e.g., "1 inch = 10 feet"
}

export interface SitePlanDrawing {
  id: string;
  name: string;
  description?: string;
  canvasWidth: number;
  canvasHeight: number;
  scale: DrawingScale;
  grid: DrawingGrid;
  layers: DrawingLayer[];
  objects: DrawingObject[];
  backgroundImage?: string; // base64 aerial image
  parcelData?: ParcelData;
  createdAt: string;
  updatedAt: string;
  // Full Fabric.js canvas JSON for complete restoration
  fabricCanvasJson?: string;
  // Exported image for documents
  exportedImage?: string; // base64 PNG
}

export interface ParcelData {
  parcelNumber: string;
  ownerName?: string;
  address?: string;
  acreage?: number;
  boundaryCoordinates?: DrawingPoint[];
  fetchedAt: string;
  source: 'pierce_county' | 'wa_state' | 'manual';
}

// Drawing History for Undo/Redo
export interface DrawingHistoryEntry {
  timestamp: string;
  action: 'add' | 'modify' | 'delete' | 'bulk';
  objectIds: string[];
  previousState?: string; // JSON
  newState?: string; // JSON
}

export interface DrawingState {
  currentDrawing: SitePlanDrawing | null;
  savedDrawings: SitePlanDrawing[];
  activeTool: DrawingToolType;
  activeLayer: DrawingLayerType;
  activeStyle: DrawingStyle;
  selectedObjectIds: string[];
  history: DrawingHistoryEntry[];
  historyIndex: number;
  clipboard: DrawingObject[];
  isModified: boolean;
}
