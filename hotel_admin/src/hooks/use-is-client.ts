import { useEffect, useState } from "react";

// Trả về true sau khi component hydrate trên client để tránh lệch UI.

export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  return isClient;
}
