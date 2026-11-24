// const MAX_CONCURRENT = 6;
// const MAX_CONCURRENT = 6;
// const STALE_MS = 60_000;
import { getDashboardStats } from "../api/dashboard";
import { getTickets } from "../api/tickets";
import { getProjects } from "../api/project";
import { getStatuses } from "../api/statuses";
import { getPriorities } from "../api/priorities";
import { getEmployees } from "../api/employees";
import { clearAxiosGetCache } from "../api/axiosInstance";
import { tokenStorage } from "../utils/tokenStorage";

/** Max parallel requests (HTTP/2 handles many at once). */
const MAX_CONCURRENT = 6;
/** Reuse successful responses across dashboard/tickets/projects navigations. */
const STALE_MS = 60_000;

const entries = {
  dashboard: createEntry(),
  tickets: createEntry(),
  projects: createEntry(),
  statuses: createEntry(),
  priorities: createEntry(),
  employees: createEntry(),
};

let activeCount = 0;
const queue = [];

function createEntry() {
  return {
    data: null,
    promise: null,
    updatedAt: 0,
    token: null,
  };
}

function currentToken() {
  return tokenStorage.getAccessToken() || "";
}

function unwrapList(response, keys = []) {
  if (Array.isArray(response)) return response;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
  }

  if (Array.isArray(response?.data)) return response.data;

  for (const key of keys) {
    if (Array.isArray(response?.data?.[key])) return response.data[key];
  }

  return [];
}

function unwrapDash(response) {
  return response?.data?.data ?? response?.data ?? response;
}

function schedule(task, { priority = false } = {}) {
  return new Promise((resolve, reject) => {
    const job = { task, resolve, reject };
    if (priority) queue.unshift(job);
    else queue.push(job);
    pump();
  });
}

function pump() {
  while (activeCount < MAX_CONCURRENT && queue.length > 0) {
    const job = queue.shift();
    activeCount += 1;

    Promise.resolve()
      .then(job.task)
      .then(job.resolve, job.reject)
      .finally(() => {
        activeCount -= 1;
        pump();
      });
  }
}

function isFresh(entry) {
  return (
    entry.data != null &&
    entry.token === currentToken() &&
    Date.now() - entry.updatedAt < STALE_MS
  );
}

async function loadEntry(key, fetcher, { force = false, priority = false } = {}) {
  const entry = entries[key];
  const token = currentToken();

  if (entry.token && entry.token !== token) {
    entry.data = null;
    entry.promise = null;
    entry.updatedAt = 0;
  }

  if (!force && isFresh(entry)) {
    return entry.data;
  }

  if (!force && entry.promise) {
    return entry.promise;
  }

  entry.token = token;
  entry.promise = schedule(fetcher, { priority })
    .then((data) => {
      entry.data = data;
      entry.updatedAt = Date.now();
      entry.promise = null;
      return data;
    })
    .catch((error) => {
      entry.promise = null;
      throw error;
    });

  return entry.promise;
}

export const workspaceStore = {
  loadDashboard(options = {}) {
    return loadEntry(
      "dashboard",
      async () => unwrapDash(await getDashboardStats()),
      { ...options, priority: true }
    );
  },

  loadTickets(options = {}) {
    return loadEntry(
      "tickets",
      async () => unwrapList(await getTickets(), ["tickets"]),
      { ...options, priority: options.priority ?? true }
    );
  },

  loadProjects(options = {}) {
    return loadEntry(
      "projects",
      async () => unwrapList(await getProjects(), ["projects"]),
      options
    );
  },

  loadStatuses(options = {}) {
    return loadEntry(
      "statuses",
      async () => unwrapList(await getStatuses(), ["statuses"]),
      options
    );
  },

  loadPriorities(options = {}) {
    return loadEntry(
      "priorities",
      async () => unwrapList(await getPriorities(), ["priorities"]),
      options
    );
  },

  loadEmployees(options = {}) {
    return loadEntry(
      "employees",
      async () => unwrapList(await getEmployees(), ["employees"]),
      options
    );
  },

  /** Warm shared lookups without blocking the critical path. */
  prefetchLookups() {
    const role = String(
      tokenStorage.getUser()?.role ??
        tokenStorage.getUser()?.user_role ??
        ""
    )
      .trim()
      .toUpperCase();

    if (role !== "ADMIN") return;

    void this.loadStatuses();
    void this.loadPriorities();
    void this.loadProjects();
    void this.loadEmployees();
  },

  invalidate(keys = null) {
    const list = keys || Object.keys(entries);
    for (const key of list) {
      const entry = entries[key];
      if (!entry) continue;
      entry.data = null;
      entry.promise = null;
      entry.updatedAt = 0;
    }
  },

  clear() {
    this.invalidate();
    for (const entry of Object.values(entries)) {
      entry.token = null;
    }
    clearAxiosGetCache();
  },
};