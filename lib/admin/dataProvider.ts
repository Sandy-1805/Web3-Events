// lib/admin/dataProvider.ts
import {
  DataProvider,
  GetListParams,
  GetListResult,
  GetOneParams,
  GetOneResult,
  GetManyParams,
  GetManyResult,
  GetManyReferenceParams,
  GetManyReferenceResult,
  CreateParams,
  CreateResult,
  UpdateParams,
  UpdateResult,
  DeleteParams,
  DeleteResult,
  DeleteManyParams,
  DeleteManyResult,
  RaRecord,
} from 'react-admin';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

// ✅ CORRECTION : sessions → /api/session (singulier)
const RESOURCE_MAP: Record<string, string> = {
  events: '/api/events',
  speakers: '/api/speakers',
  sessions: '/api/session',     // ✅ Singulier comme votre route
  questions: '/api/questions',
  users: '/api/users',
};

function getApiPath(resource: string): string {
  const path = RESOURCE_MAP[resource];
  if (!path) throw new Error(`[dataProvider] Ressource inconnue : "${resource}"`);
  return `${API_BASE_URL}${path}`;
}

async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const b = await response.clone().json();
      message = b?.error ?? message;
    } catch {
      // Ignorer
    }
    throw new Error(message);
  }
  return response;
}

function applyFilter<T extends RaRecord>(data: T[], filter: Record<string, unknown>): T[] {
  if (!filter || Object.keys(filter).length === 0) return data;
  return data.filter((item) =>
      Object.entries(filter).every(([key, value]) => {
        if (value === undefined || value === null || value === '') return true;
        const v = (item as Record<string, unknown>)[key];
        return typeof value === 'string'
            ? String(v ?? '').toLowerCase().includes(value.toLowerCase())
            : v === value;
      })
  );
}

function applySort<T extends RaRecord>(
    data: T[],
    sort: { field: string; order: 'ASC' | 'DESC' } | undefined
): T[] {
  if (!sort) return data;
  return [...data].sort((a, b) => {
    const av = (a as Record<string, unknown>)[sort.field] ?? '';
    const bv = (b as Record<string, unknown>)[sort.field] ?? '';
    return av < bv ? (sort.order === 'ASC' ? -1 : 1) : av > bv ? (sort.order === 'ASC' ? 1 : -1) : 0;
  });
}

function applyPagination<T>(data: T[], pagination: { page: number; perPage: number } | undefined): T[] {
  if (!pagination) return data;
  const { page, perPage } = pagination;
  return data.slice((page - 1) * perPage, page * perPage);
}

const dataProvider: DataProvider = {
  async getList<R extends RaRecord>(resource: string, params: GetListParams): Promise<GetListResult<R>> {
    const response = await apiFetch(getApiPath(resource));
    let data: R[] = await response.json();

    // ✅ Pour les sessions, récupérer les speakers associés
    if (resource === 'sessions') {
      const sessionsWithSpeakers = await Promise.all(
          data.map(async (session: any) => {
            try {
              const speakersRes = await apiFetch(`/api/session-speakers?sessionId=${session.id}`);
              const speakers = await speakersRes.json();
              return { ...session, speakers };
            } catch {
              return { ...session, speakers: [] };
            }
          })
      );
      data = sessionsWithSpeakers as R[];
    }

    data = applyFilter(data, params.filter ?? {});
    data = applySort(data, params.sort);

    const total = data.length;
    const paginatedData = applyPagination(data, params.pagination);

    return { data: paginatedData as R[], total };
  },

  async getOne<R extends RaRecord>(resource: string, params: GetOneParams): Promise<GetOneResult<R>> {
    const response = await apiFetch(`${getApiPath(resource)}/${params.id}`);
    const data = await response.json();

    // ✅ Pour les sessions, récupérer les speakers associés
    if (resource === 'sessions') {
      try {
        const speakersRes = await apiFetch(`/api/session-speakers?sessionId=${data.id}`);
        const speakers = await speakersRes.json();
        return { data: { ...data, speakers } };
      } catch {
        return { data: { ...data, speakers: [] } };
      }
    }

    return { data };
  },

  async getMany<R extends RaRecord>(resource: string, params: GetManyParams): Promise<GetManyResult<R>> {
    const response = await apiFetch(getApiPath(resource));
    const all: R[] = await response.json();
    return { data: all.filter((item) => params.ids.includes(item.id)) };
  },

  async getManyReference<R extends RaRecord>(
      resource: string,
      params: GetManyReferenceParams
  ): Promise<GetManyReferenceResult<R>> {
    const filter = { ...params.filter, [params.target]: params.id };
    const response = await apiFetch(getApiPath(resource));
    let data: R[] = await response.json();
    data = applyFilter(data, filter);
    data = applySort(data, params.sort);

    const total = data.length;
    const paginatedData = applyPagination(data, params.pagination);

    return { data: paginatedData as R[], total };
  },

  async create<R extends RaRecord>(resource: string, params: CreateParams): Promise<CreateResult<R>> {
    // ✅ Si c'est une session avec des speakers à assigner
    if (resource === 'sessions' && params.data.speakerIds) {
      const speakerIds = params.data.speakerIds;
      const sessionData = { ...params.data };
      delete sessionData.speakerIds;

      const response = await apiFetch(getApiPath(resource), {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });
      const session = await response.json();

      for (const speakerId of speakerIds) {
        await apiFetch('/api/session-speakers', {
          method: 'POST',
          body: JSON.stringify({ sessionId: session.id, speakerId }),
        });
      }

      try {
        const speakersRes = await apiFetch(`/api/session-speakers?sessionId=${session.id}`);
        const speakers = await speakersRes.json();
        return { data: { ...session, speakers } };
      } catch {
        return { data: { ...session, speakers: [] } };
      }
    }

    const response = await apiFetch(getApiPath(resource), {
      method: 'POST',
      body: JSON.stringify(params.data),
    });
    return { data: await response.json() };
  },

  async update<R extends RaRecord>(resource: string, params: UpdateParams): Promise<UpdateResult<R>> {
    // ✅ Si c'est une session avec des speakers à assigner
    if (resource === 'sessions' && params.data.speakerIds) {
      const speakerIds = params.data.speakerIds;
      const sessionData = { ...params.data };
      delete sessionData.speakerIds;

      const response = await apiFetch(`${getApiPath(resource)}/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify(sessionData),
      });
      const session = await response.json();

      await apiFetch(`/api/session-speakers?sessionId=${params.id}`, {
        method: 'DELETE',
      });

      for (const speakerId of speakerIds) {
        await apiFetch('/api/session-speakers', {
          method: 'POST',
          body: JSON.stringify({ sessionId: params.id, speakerId }),
        });
      }

      try {
        const speakersRes = await apiFetch(`/api/session-speakers?sessionId=${session.id}`);
        const speakers = await speakersRes.json();
        return { data: { ...session, speakers } };
      } catch {
        return { data: { ...session, speakers: [] } };
      }
    }

    const response = await apiFetch(`${getApiPath(resource)}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    });
    return { data: await response.json() };
  },

  async updateMany(resource: string, params: { ids: (string | number)[]; data: Partial<RaRecord> }): Promise<{ data: (string | number)[] }> {
    await Promise.all(
        params.ids.map((id) =>
            apiFetch(`${getApiPath(resource)}/${id}`, { method: 'PUT', body: JSON.stringify(params.data) })
        )
    );
    return { data: params.ids };
  },

  async delete<R extends RaRecord>(resource: string, params: DeleteParams<R>): Promise<DeleteResult<R>> {
    await apiFetch(`${getApiPath(resource)}/${params.id}`, { method: 'DELETE' });
    return { data: params.previousData ?? ({ id: params.id } as R) };
  },

  async deleteMany(resource: string, params: DeleteManyParams): Promise<DeleteManyResult> {
    await Promise.all(
        params.ids.map((id) => apiFetch(`${getApiPath(resource)}/${id}`, { method: 'DELETE' }))
    );
    return { data: params.ids };
  },
};

export default dataProvider;