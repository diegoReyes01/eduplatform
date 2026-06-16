import { useState, useCallback } from "react";

export interface SceneInfo {
  titulo: string;
  descripcion: string;
  propiedades?: Record<string, string>;
}

export function use3DScene() {
  const [info, setInfo] = useState<SceneInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const showInfo = useCallback((data: SceneInfo) => {
    setInfo(data);
  }, []);

  const hideInfo = useCallback(() => {
    setInfo(null);
  }, []);

  const startLoading = useCallback(() => setLoading(true), []);
  const stopLoading = useCallback(() => setLoading(false), []);

  return { info, loading, showInfo, hideInfo, startLoading, stopLoading };
}