/**
 * dataProvider.ts
 * React Admin Data Provider — adapté pour l'API Next.js de Web3-Events
 *
 * Compatible avec : events, speakers, sessions, questions
 * Méthode d'auth : cookie HTTP-only (géré automatiquement par le browser)
 *
 * Installation :
 *   npm install react-admin
 *
 * Usage dans App.tsx :
 *   import dataProvider from './dataProvider';
 *   <Admin dataProvider={dataProvider}>...</Admin>
 */

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

// ─── Configuration ────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * Mapping des ressources React Admin → routes API Next.js
 * Ajouter ici chaque nouvelle ressource.
 */
const RESOURCE_MAP: Record<string, string> = {
  events:    '/api/events',
  speakers:  '/api/speakers',
  sessions:  '/api/session',
  questions: '/api/questions',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getApiPath(resource: string): string {
  const path = RESOURCE_MAP[resource];
  if (!path) throw new Error(`[dataProvider] Ressource inconnue : "${resource}"`);
  return `${API_BASE_URL}${path}`;
}

/**
 * fetch avec credentials (cookies) inclus automatiquement.
 * Lance une erreur lisible si la réponse HTTP n'est pas 2xx.
 */
async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // envoie le cookie JWT httpOnly
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.clone().json();
      message = body?.error ?? message;
    } catch {
      // réponse non-JSON, on garde le message générique
    }
    throw new Error(message);
  }

  return response;
}

// ─── Filtrage / Tri / Pagination côté client ──────────────────────────────────
// L'API Next.js de ce projet ne supporte pas encore les query params
// pour paginer/trier/filtrer. On le fait côté client le temps d'une migration.
// TODO : ajouter ?_page=&_perPage=&_sort=&_order=&q= côté API pour de meilleures perfs.

function applyFilter<T extends RaRecord>(
  data: T[],
  filter: Record<string, unknown>
): T[] {
  if (!filter || Object.keys(filter).length === 0) return data;

  return data.filter((item) =>
    Object.entries(filter).every(([key, value]) => {
      if (value === undefined || value === null || value === '') return true;
      const itemValue = (item as Record<string, unknown>)[key];
      if (typeof value === 'string') {
        return String(itemValue ?? '').toLowerCase().includes(value.toLowerCase());
      }
      return itemValue === value;
    })
  );
}

function applySort<T extends RaRecord>(
  data: T[],
  sort: { field: string; order: 'ASC' | 'DESC' }
): T[] {
  const { field, order } = sort;
  return [...data].sort((a, b) => {
    const aVal = (a as Record<string, unknown>)[field] ?? '';
    const bVal = (b as Record<string, unknown>)[field] ?? '';
    if (aVal < bVal) return order === 'ASC' ? -1 : 1;
    if (aVal > bVal) return order === 'ASC' ? 1 : -1;
    return 0;
  });
}

function applyPagination<T>(
  data: T[],
  page: number,
  perPage: number
): T[] {
  const start = (page - 1) * perPage;
  return data.slice(start, start + perPage);
}

// ─── Data Provider ────────────────────────────────────────────────────────────

const dataProvider: DataProvider = {

  /**
   * GET /api/{resource}
   * Récupère une liste avec filtre, tri et pagination (client-side).
   */
  async getList<RecordType extends RaRecord>(
    resource: string,
    params: GetListParams
  ): Promise<GetListResult<RecordType>> {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const filter = params.filter ?? {};

    const response = await apiFetch(getApiPath(resource));
    let data: RecordType[] = await response.json();

    data = applyFilter(data, filter);
    data = applySort(data, { field, order });

    const total = data.length;
    data = applyPagination(data, page, perPage) as RecordType[];

    return { data, total };
  },

  /**
   * GET /api/{resource}/{id}
   */
  async getOne<RecordType extends RaRecord>(
    resource: string,
    params: GetOneParams
  ): Promise<GetOneResult<RecordType>> {
    const response = await apiFetch(`${getApiPath(resource)}/${params.id}`);
    const data: RecordType = await response.json();
    return { data };
  },

  /**
   * GET /api/{resource} puis filtre par IDs.
   * Utilisé par React Admin pour les champs de référence (<ReferenceField>).
   */
  async getMany<RecordType extends RaRecord>(
    resource: string,
    params: GetManyParams
  ): Promise<GetManyResult<RecordType>> {
    const response = await apiFetch(getApiPath(resource));
    const all: RecordType[] = await response.json();
    const data = all.filter((item) => params.ids.includes(item.id));
    return { data };
  },

  /**
   * Équivalent getList filtré par une clé de relation.
   * Ex : sessions d'un event donné.
   */
  async getManyReference<RecordType extends RaRecord>(
    resource: string,
    params: GetManyReferenceParams
  ): Promise<GetManyReferenceResult<RecordType>> {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const filter = { ...params.filter, [params.target]: params.id };

    const response = await apiFetch(getApiPath(resource));
    let data: RecordType[] = await response.json();

    data = applyFilter(data, filter);
    data = applySort(data, { field, order });

    const total = data.length;
    data = applyPagination(data, page, perPage) as RecordType[];

    return { data, total };
  },

  /**
   * POST /api/{resource}
   */
  async create<RecordType extends RaRecord>(
    resource: string,
    params: CreateParams
  ): Promise<CreateResult<RecordType>> {
    const response = await apiFetch(getApiPath(resource), {
      method: 'POST',
      body: JSON.stringify(params.data),
    });
    const data: RecordType = await response.json();
    return { data };
  },

  /**
   * PUT /api/{resource}/{id}
   */
  async update<RecordType extends RaRecord>(
    resource: string,
    params: UpdateParams
  ): Promise<UpdateResult<RecordType>> {
    const response = await apiFetch(`${getApiPath(resource)}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    });
    const data: RecordType = await response.json();
    return { data };
  },

  /**
   * Mise à jour multiple — implémentation naïve (requêtes séquentielles).
   * L'API n'a pas de route PATCH bulk, on boucle sur chaque ID.
   */
  async updateMany(
    resource: string,
    params: { ids: (string | number)[]; data: Partial<RaRecord> }
  ): Promise<{ data: (string | number)[] }> {
    await Promise.all(
      params.ids.map((id) =>
        apiFetch(`${getApiPath(resource)}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(params.data),
        })
      )
    );
    return { data: params.ids };
  },

  /**
   * DELETE /api/{resource}/{id}
   */
  async delete<RecordType extends RaRecord>(
    resource: string,
    params: DeleteParams<RecordType>
  ): Promise<DeleteResult<RecordType>> {
    const response = await apiFetch(`${getApiPath(resource)}/${params.id}`, {
      method: 'DELETE',
    });

    // Certaines routes renvoient {} ou { success: true }, pas l'entité supprimée
    let data: RecordType;
    try {
      data = await response.json();
    } catch {
      data = { id: params.id } as RecordType;
    }

    // React Admin exige que data.id soit défini
    if (!data?.id) data = { ...data, id: params.id } as RecordType;

    return { data };
  },

  /**
   * Suppression multiple — boucle séquentielle.
   */
  async deleteMany(
    resource: string,
    params: DeleteManyParams
  ): Promise<DeleteManyResult> {
    await Promise.all(
      params.ids.map((id) =>
        apiFetch(`${getApiPath(resource)}/${id}`, { method: 'DELETE' })
      )
    );
    return { data: params.ids };
  },
};

export default dataProvider;