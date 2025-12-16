import { useCallback, useEffect, useState } from "react";
import { getTeamTasks, type TaskTree } from "../api/tasks";
import { getErrorMessage } from "../utils/errorHandling";

export function useTeamTasks(teamId: string | undefined) {
  const [tasks, setTasks] = useState<TaskTree[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTeamTasks(teamId);
      setTasks(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    if (teamId) {
      loadTasks();
    } else {
      setTasks([]);
    }
  }, [teamId, loadTasks]);

  return {
    tasks,
    loading,
    error,
    reload: loadTasks,
  };
}


