import type { Project } from '@/types';
import {
  checkPropertyOwnerCompletion,
  checkProjectDetailsCompletion,
  checkSiteInformationCompletion,
  checkInsuranceCompletion,
  type StageCompletionResult,
} from './validation';

// Stage IDs based on WORKFLOW_STAGES in useStore.ts
export const STAGE_IDS = {
  WELCOME: 1,
  PROJECT_TYPE: 2,
  PROPERTY_OWNER: 3,
  PROJECT_DETAILS: 4,
  SITE_INFORMATION: 5,
  PERMIT_APPLICATIONS: 6,
  INSURANCE: 7,
  REVIEW: 8,
  GENERATE_DOCS: 9,
  SUBMIT_TRACK: 10,
} as const;

export interface StageValidationResult {
  isComplete: boolean;
  canProceed: boolean;
  completionStatus?: StageCompletionResult;
  blockingMessage?: string;
  warningMessage?: string;
}

// Check if a specific stage is complete enough to proceed
export function validateStage(stageId: number, project: Project | null): StageValidationResult {
  if (!project) {
    return {
      isComplete: false,
      canProceed: false,
      blockingMessage: 'No project loaded',
    };
  }

  switch (stageId) {
    case STAGE_IDS.WELCOME:
      // Welcome stage is always complete - just informational
      return { isComplete: true, canProceed: true };

    case STAGE_IDS.PROJECT_TYPE:
      // Project type requires at least one improvement type selected
      const hasImprovementTypes = project.details.improvementTypes.length > 0;
      return {
        isComplete: hasImprovementTypes,
        canProceed: hasImprovementTypes,
        blockingMessage: hasImprovementTypes ? undefined : 'Please select at least one improvement type',
      };

    case STAGE_IDS.PROPERTY_OWNER:
      const ownerStatus = checkPropertyOwnerCompletion(project.owner);
      // Allow proceeding with core contact info
      const hasMinOwnerInfo =
        project.owner.firstName.trim() !== '' &&
        project.owner.lastName.trim() !== '' &&
        project.owner.email.trim() !== '';
      return {
        isComplete: ownerStatus.isComplete,
        canProceed: hasMinOwnerInfo,
        completionStatus: ownerStatus,
        blockingMessage: hasMinOwnerInfo ? undefined : 'Please enter at least your name and email',
        warningMessage: ownerStatus.isComplete ? undefined :
          `Missing: ${ownerStatus.missingFields.join(', ')}`,
      };

    case STAGE_IDS.PROJECT_DETAILS:
      const detailsStatus = checkProjectDetailsCompletion(project.details);
      // Allow proceeding with description at minimum
      const hasMinDetails = project.details.description.trim().length >= 10;
      return {
        isComplete: detailsStatus.isComplete,
        canProceed: hasMinDetails,
        completionStatus: detailsStatus,
        blockingMessage: hasMinDetails ? undefined : 'Please provide a project description',
        warningMessage: detailsStatus.isComplete ? undefined :
          `Missing: ${detailsStatus.missingFields.join(', ')}`,
      };

    case STAGE_IDS.SITE_INFORMATION:
      const siteStatus = checkSiteInformationCompletion(project.site);
      // Allow proceeding with property address at minimum
      const hasMinSite = project.site.propertyAddress.trim() !== '';
      return {
        isComplete: siteStatus.isComplete,
        canProceed: hasMinSite,
        completionStatus: siteStatus,
        blockingMessage: hasMinSite ? undefined : 'Please enter the property address',
        warningMessage: siteStatus.isComplete ? undefined :
          `Missing: ${siteStatus.missingFields.join(', ')}`,
      };

    case STAGE_IDS.PERMIT_APPLICATIONS:
      // Permit applications can always proceed
      return { isComplete: true, canProceed: true };

    case STAGE_IDS.INSURANCE:
      const insuranceStatus = checkInsuranceCompletion(project.insurance);
      return {
        isComplete: insuranceStatus.isComplete,
        canProceed: true, // Insurance is optional, so always allow proceeding
        completionStatus: insuranceStatus,
        warningMessage: insuranceStatus.isComplete ? undefined :
          project.insurance.hasInsurance ? `Missing: ${insuranceStatus.missingFields.join(', ')}` : undefined,
      };

    case STAGE_IDS.REVIEW:
      // Review can always proceed to generate docs
      return { isComplete: true, canProceed: true };

    case STAGE_IDS.GENERATE_DOCS:
      // Generate docs can always proceed to submit
      return { isComplete: true, canProceed: true };

    case STAGE_IDS.SUBMIT_TRACK:
      // Final stage
      return { isComplete: true, canProceed: true };

    default:
      return { isComplete: true, canProceed: true };
  }
}

// Get overall project completion status for all stages
export function getProjectCompletionStatus(project: Project | null): {
  totalStages: number;
  completedStages: number;
  stageStatuses: Record<number, StageValidationResult>;
  overallComplete: boolean;
  percentComplete: number;
} {
  const stageIds = Object.values(STAGE_IDS);
  const stageStatuses: Record<number, StageValidationResult> = {};
  let completedStages = 0;

  stageIds.forEach((stageId) => {
    const status = validateStage(stageId, project);
    stageStatuses[stageId] = status;
    if (status.isComplete) {
      completedStages++;
    }
  });

  return {
    totalStages: stageIds.length,
    completedStages,
    stageStatuses,
    overallComplete: completedStages === stageIds.length,
    percentComplete: Math.round((completedStages / stageIds.length) * 100),
  };
}

// Get list of incomplete stages with their issues
export function getIncompleteStages(project: Project | null): Array<{
  stageId: number;
  stageName: string;
  issues: string[];
}> {
  const stageNames: Record<number, string> = {
    [STAGE_IDS.WELCOME]: 'Welcome',
    [STAGE_IDS.PROJECT_TYPE]: 'Project Type',
    [STAGE_IDS.PROPERTY_OWNER]: 'Property Owner',
    [STAGE_IDS.PROJECT_DETAILS]: 'Project Details',
    [STAGE_IDS.SITE_INFORMATION]: 'Site Information',
    [STAGE_IDS.PERMIT_APPLICATIONS]: 'Permit Applications',
    [STAGE_IDS.INSURANCE]: 'Insurance',
    [STAGE_IDS.REVIEW]: 'Review',
    [STAGE_IDS.GENERATE_DOCS]: 'Generate Documents',
    [STAGE_IDS.SUBMIT_TRACK]: 'Submit & Track',
  };

  const result: Array<{ stageId: number; stageName: string; issues: string[] }> = [];

  Object.values(STAGE_IDS).forEach((stageId) => {
    const status = validateStage(stageId, project);
    if (!status.isComplete) {
      const issues: string[] = [];
      if (status.completionStatus?.missingFields) {
        issues.push(...status.completionStatus.missingFields);
      }
      if (status.blockingMessage) {
        issues.push(status.blockingMessage);
      }
      result.push({
        stageId,
        stageName: stageNames[stageId] || `Stage ${stageId}`,
        issues,
      });
    }
  });

  return result;
}
