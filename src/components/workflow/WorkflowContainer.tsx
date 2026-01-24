'use client';

import { useStore } from '@/store/useStore';
import WelcomeStage from './stages/WelcomeStage';
import ProjectTypeStage from './stages/ProjectTypeStage';
import PropertyOwnerStage from './stages/PropertyOwnerStage';
import ProjectDetailsStage from './stages/ProjectDetailsStage';
import SiteInfoStage from './stages/SiteInfoStage';
import PermitApplicationsStage from './stages/PermitApplicationsStage';
import InsuranceStage from './stages/InsuranceStage';
import ReviewStage from './stages/ReviewStage';
import GenerateDocsStage from './stages/GenerateDocsStage';
import SubmitTrackStage from './stages/SubmitTrackStage';

export default function WorkflowContainer() {
  const { currentStage } = useStore();

  const renderStage = () => {
    switch (currentStage) {
      case 1:
        return <WelcomeStage />;
      case 2:
        return <ProjectTypeStage />;
      case 3:
        return <PropertyOwnerStage />;
      case 4:
        return <ProjectDetailsStage />;
      case 5:
        return <SiteInfoStage />;
      case 6:
        return <PermitApplicationsStage />;
      case 7:
        return <InsuranceStage />;
      case 8:
        return <ReviewStage />;
      case 9:
        return <GenerateDocsStage />;
      case 10:
        return <SubmitTrackStage />;
      default:
        return <WelcomeStage />;
    }
  };

  return (
    <div className="pb-24">
      {renderStage()}
    </div>
  );
}
