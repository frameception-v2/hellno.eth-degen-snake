import { useEffect, useState } from "react";
import { getFrameMessage } from "@farcaster/frame-sdk";

type User = {
  fid?: string;
};

type Context = {
  user?: User;
};

export function useFrameSDK() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context>({});

  useEffect(() => {
    // Simple initialization check
    setIsSDKLoaded(true);
    
    // Initialize empty context
    setContext({ user: { fid: undefined } });
  }, []);

  return {
    isSDKLoaded,
    context
  };
}
