import { useState } from "react";

export const usePollingControl = () => {
  const [pollingEnabled, setPollingEnabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePollingError = (error: Error) => {
    console.error("Polling error:", error);
    setErrorMessage(error.message);
  };

  const togglePolling = () => {
    setPollingEnabled(!pollingEnabled);
    if (!pollingEnabled) {
      setErrorMessage(null);
    }
  };

  return {
    pollingEnabled,
    errorMessage,
    handlePollingError,
    togglePolling,
  };
};