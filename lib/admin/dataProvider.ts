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

const RESOURCE_MAP: Record<string, string> = {
  events: '/api/events',
  speakers: '/api/speakers',
  sessions: '/api/session',
  questions: '/api/questions',
};

async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.clone().json();
      message = body?.error ?? message;
    } catch {}
    throw new Error(message);
  }
  return response;
}

// ✅ DATA PROVIDER COMPLET
const dataProvider: DataProvider = {
  async getList<RecordType extends RaRecord>(
    resource: string,
    params: GetListParams
  ): Promise<GetListResult<RecordType>> {
    const { page = 1, perPage = 10 } = params.pagination || {};
    const { field = 'id', order = 'ASC' } = params.sort || {};
    const filter = params.filter ?? {};

    const response = await apiFetch(`${API_BASE_URL}${RESOURCE_MAP[resource]}`);
    let data: RecordType[] = await response.json();

    if (Object.keys(filter).length > 0) {
      data = data.filter((item) =>
        Object.entries(filter).every(([key, value]) => {
          if (!value) return true;
          const itemValue = (item as any)[key];
          if (typeof value === 'string') {
            return String(itemValue ?? '').toLowerCase().includes(value.toLowerCase());
          }
          return itemValue === value;
        })
      );
    }

    data = [...data].sort((a, b) => {
      const aVal = (a as any)[field] ?? '';
      const bVal = (b as any)[field] ?? '';
      if (aVal < bVal) return order === 'ASC' ? -1 : 1;
      if (aVal > bVal) return order === 'ASC' ? 1 : -1;
      return 0;
    });

    const total = data.length;
    const start = (page - 1) * perPage;
    data = data.slice(start, start + perPage) as RecordType[];

    return { data, total };
  },

  async getOne<RecordType extends RaRecord>(
    resource: string,
    params: GetOneParams
  ): Promise<GetOneResult<RecordType>> {
    const response = await apiFetch(`${API_BASE_URL}${RESOURCE_MAP[resource]}/${params.id}`);
    const data = await response.json();
    return { data };
  },

  async getMany<RecordType extends RaRecord>(
    resource: string,
    params: GetManyParams
  ): Promise<GetManyResult<RecordType>> {
    const response = await apiFetch(`${API_BASE_URL}${RESOURCE_MAP[resource]}`);
    const all: RecordType[] = await response.json();
    const data = all.filter((item) => params.ids.includes((item as any).id));
    return { data };
  },

  async getManyReference<RecordType extends RaRecord>(
    resource: string,
    params: GetManyReferenceParams
  ): Promise<GetManyReferenceResult<RecordType>> {
    const { page = 1, perPage = 10 } = params.pagination;
    const { field = 'id', order = 'ASC' } = params.sort;
    const filter = { ...params.filter, [params.target]: params.id };

    const response = await apiFetch(`${API_BASE_URL}${RESOURCE_MAP[resource]}`);
    let data: RecordType[] = await response.json();

    if (Object.keys(filter).length > 0) {
      data = data.filter((item) =>
        Object.entries(filter).every(([key, value]) => {
          if (!value) return true;
          const itemValue = (item as any)[key];
          if (typeof value === 'string') {
            return String(itemValue ?? '').toLowerCase().includes(value.toLowerCase());
          }
          return itemValue === value;
        })
      );
    }

    data = [...data].sort((a, b) => {
      const aVal = (a as any)[field] ?? '';
      const bVal = (b as any)[field] ?? '';
      if (aVal < bVal) return order === 'ASC' ? -1 : 1;
      if (aVal > bVal) return order === 'ASC' ? 1 : -1;
      return 0;
    });

    const total = data.length;
    const start = (page - 1) * perPage;
    data = data.slice(start, start + perPage) as RecordType[];

    return { data, total };
  },

  async create<RecordType extends RaRecord>(
    resource: string,
    params: CreateParams
  ): Promise<CreateResult<RecordType>> {
    const response = await apiFetch(`${API_BASE_URL}${RESOURCE_MAP[resource]}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    });
    const data = await response.json();
    return { data };
  },

  async update<RecordType extends RaRecord>(
    resource: string,
    params: UpdateParams
  ): Promise<UpdateResult<RecordType>> {
    const response = await apiFetch(`${API_BASE_URL}${RESOURCE_MAP[resource]}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    });
    const data = await response.json();
    return { data };
  },

  async updateMany(
    resource: string,
    params: { ids: (string | number)[]; data: any }
  ): Promise<{ data: (string | number)[] }> {
    await Promise.all(
      params.ids.map((id) =>
        apiFetch(`${API_BASE_URL}${RESOURCE_MAP[resource]}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(params.data),
        })
      )
    );
    return { data: params.ids };
  },

  async delete<RecordType extends RaRecord>(
    resource: string,
    params: DeleteParams
  ): Promise<DeleteResult<RecordType>> {
    await apiFetch(`${API_BASE_URL}${RESOURCE_MAP[resource]}/${params.id}`, {
      method: 'DELETE',
    });
    return { data: { id: params.id } as RecordType };
  },

  async deleteMany(
    resource: string,
    params: DeleteManyParams
  ): Promise<DeleteManyResult> {
    await Promise.all(
      params.ids.map((id) =>
        apiFetch(`${API_BASE_URL}${RESOURCE_MAP[resource]}/${id}`, {
          method: 'DELETE',
        })
      )
    );
    return { data: params.ids };
  },
};

export default dataProvider;