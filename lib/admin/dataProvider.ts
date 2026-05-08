/**
 * lib/admin/dataProvider.ts
 * React Admin Data Provider — adapté pour l'API Next.js de Web3-Events
 *
 * - 'sessions' pointe vers /api/session (singulier) — seule route avec
 *   GET/POST/PUT/DELETE complets.
 * - delete() retourne params.previousData pour éviter l'erreur "data.id undefined"
 */

import {
  DataProvider,
  GetListParams,    GetListResult,
  GetOneParams,     GetOneResult,
  GetManyParams,    GetManyResult,
  GetManyReferenceParams, GetManyReferenceResult,
  CreateParams,     CreateResult,
  UpdateParams,     UpdateResult,
  DeleteParams,     DeleteResult,
  DeleteManyParams, DeleteManyResult,
  RaRecord,
} from 'react-admin';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

const RESOURCE_MAP: Record<string, string> = {
  events: '/api/events',
  speakers: '/api/speakers',
  sessions: '/api/session',
  questions: '/api/questions',
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
    try { const b = await response.clone().json(); message = b?.error ?? message; } catch { /**/ }
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

function applySort<T extends RaRecord>(data: T[], { field, order }: { field: string; order: 'ASC' | 'DESC' }): T[] {
  return [...data].sort((a, b) => {
    const av = (a as Record<string, unknown>)[field] ?? '';
    const bv = (b as Record<string, unknown>)[field] ?? '';
    return av < bv ? (order === 'ASC' ? -1 : 1) : av > bv ? (order === 'ASC' ? 1 : -1) : 0;
  });
}

function paginate<T>(data: T[], page: number, perPage: number): T[] {
  return data.slice((page - 1) * perPage, page * perPage);
}

const dataProvider: DataProvider = {

  async getList<R extends RaRecord>(resource: string, params: GetListParams): Promise<GetListResult<R>> {
    const { page, perPage } = params.pagination;
    const response = await apiFetch(getApiPath(resource));
    let data: R[] = await response.json();
    data = applyFilter(data, params.filter ?? {});
    data = applySort(data, params.sort);
    const total = data.length;
    return { data: paginate(data, page, perPage) as R[], total };
  },

  async getOne<R extends RaRecord>(resource: string, params: GetOneParams): Promise<GetOneResult<R>> {
    const response = await apiFetch(`${getApiPath(resource)}/${params.id}`);
    return { data: await response.json() };
  },

  async getMany<R extends RaRecord>(resource: string, params: GetManyParams): Promise<GetManyResult<R>> {
    const response = await apiFetch(getApiPath(resource));
    const all: R[] = await response.json();
    return { data: all.filter((item) => params.ids.includes(item.id)) };
  },

  async getManyReference<R extends RaRecord>(resource: string, params: GetManyReferenceParams): Promise<GetManyReferenceResult<R>> {
    const { page, perPage } = params.pagination;
    const filter = { ...params.filter, [params.target]: params.id };
    const response = await apiFetch(getApiPath(resource));
    let data: R[] = await response.json();
    data = applyFilter(data, filter);
    data = applySort(data, params.sort);
    const total = data.length;
    return { data: paginate(data, page, perPage) as R[], total };
  },

  async create<R extends RaRecord>(resource: string, params: CreateParams): Promise<CreateResult<R>> {
    const response = await apiFetch(getApiPath(resource), {
      method: 'POST',
      body: JSON.stringify(params.data),
    });
    return { data: await response.json() };
  },

  async update<R extends RaRecord>(resource: string, params: UpdateParams): Promise<UpdateResult<R>> {
    const response = await apiFetch(`${getApiPath(resource)}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    });
    return { data: await response.json() };
  },

  async updateMany(resource: string, params: { ids: (string | number)[]; data: Partial<RaRecord> }): Promise<{ data: (string | number)[] }> {
    await Promise.all(params.ids.map((id) =>
      apiFetch(`${getApiPath(resource)}/${id}`, { method: 'PUT', body: JSON.stringify(params.data) })
    ));
    return { data: params.ids };
  },

  async delete<R extends RaRecord>(resource: string, params: DeleteParams<R>): Promise<DeleteResult<R>> {
    await apiFetch(`${getApiPath(resource)}/${params.id}`, { method: 'DELETE' });
    // L'API renvoie { success: true }, pas l'entité.
    // On retourne previousData (fourni par React Admin) pour éviter l'erreur "data.id undefined".
    return { data: params.previousData ?? ({ id: params.id } as R) };
  },

  async deleteMany(resource: string, params: DeleteManyParams): Promise<DeleteManyResult> {
    await Promise.all(params.ids.map((id) =>
      apiFetch(`${getApiPath(resource)}/${id}`, { method: 'DELETE' })
    ));
    return { data: params.ids };
  },
};

export default dataProvider;