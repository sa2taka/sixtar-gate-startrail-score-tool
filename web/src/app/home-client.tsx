"use client";

import { PollingManager } from "@/components/polling/polling-manager";
import { Header } from "@/components/home/header";
import { PollingControlPanel } from "@/components/home/polling-control-panel";
import { FeatureCards } from "@/components/home/feature-cards";
import { usePollingControl } from "@/hooks/use-polling-control";

interface HomeClientProps {
  initialLastDate: string | null;
}

export function HomeClient({ initialLastDate }: HomeClientProps) {
  const pollingControl = usePollingControl();

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-8 items-center sm:items-start">
          <Header />
          
          <PollingControlPanel
            pollingEnabled={pollingControl.pollingEnabled}
            onTogglePolling={pollingControl.togglePolling}
            errorMessage={pollingControl.errorMessage}
          />

          <FeatureCards />
        </div>
      </main>

      <PollingManager
        enabled={pollingControl.pollingEnabled}
        onError={pollingControl.handlePollingError}
        initialLastDate={initialLastDate}
      />
    </div>
  );
}