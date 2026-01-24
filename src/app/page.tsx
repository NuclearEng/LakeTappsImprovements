'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { initDb } from '@/lib/db';
import MainLayout from '@/components/layout/MainLayout';
import WorkflowContainer from '@/components/workflow/WorkflowContainer';
import LoadingScreen from '@/components/ui/LoadingScreen';
import NotificationContainer from '@/components/ui/NotificationContainer';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import ActionPromptModal from '@/components/ui/ActionPromptModal';

export default function Home() {
  const [isInitializing, setIsInitializing] = useState(true);
  const { setDbReady, dbReady, createProject, project } = useStore();

  useEffect(() => {
    async function initialize() {
      try {
        await initDb();
        setDbReady(true);

        // Create a new project if none exists
        if (!project) {
          createProject();
        }
      } catch (error) {
        console.error('Failed to initialize database:', error);
      } finally {
        setIsInitializing(false);
      }
    }

    initialize();
  }, [setDbReady, createProject, project]);

  if (isInitializing || !dbReady) {
    return <LoadingScreen message="Initializing application..." />;
  }

  return (
    <MainLayout>
      <WorkflowContainer />
      <NotificationContainer />
      <ConfirmationDialog />
      <ActionPromptModal />
    </MainLayout>
  );
}
