'use client';

/**
 * components/admin/AdminApp.tsx
 *
 * Point d'entrée React Admin — assemble toutes les ressources
 * avec leurs vues personnalisées (List, Edit, Create, Show).
 *
 * Plus de ListGuesser / EditGuesser : chaque ressource a ses propres
 * composants adaptés aux champs réels de l'API.
 */

import { Admin, Resource } from 'react-admin';
import dataProvider from '@/lib/admin/dataProvider';
import authProvider from '@/lib/admin/authProvider';

// Ressource : Events
import { EventList, EventEdit, EventCreate, EventShow } from './ressources/events';
// Ressource : Speakers
import { SpeakerList, SpeakerEdit, SpeakerCreate, SpeakerShow } from './ressources/speakers';
// Ressource : Sessions
import { SessionList, SessionEdit, SessionCreate, SessionShow } from './ressources/sessions';
// Ressource : Questions (lecture + suppression uniquement, pas d'édition)
import { QuestionList, QuestionShow } from './ressources/questions';

export default function AdminApp() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      title="Web3-Events · Administration"
    >
      {/**
       * Events — CRUD complet
       * API : GET/POST /api/events | GET/PUT/DELETE /api/events/[id]
       */}
      <Resource
        name="events"
        options={{ label: 'Événements' }}
        list={EventList}
        edit={EventEdit}
        create={EventCreate}
        show={EventShow}
      />

      {/**
       * Speakers — CRUD complet
       * API : GET/POST /api/speakers | GET/PUT/DELETE /api/speakers/[id]
       */}
      <Resource
        name="speakers"
        options={{ label: 'Intervenants' }}
        list={SpeakerList}
        edit={SpeakerEdit}
        create={SpeakerCreate}
        show={SpeakerShow}
      />

      {/**
       * Sessions — CRUD complet
       * API : GET/POST /api/session | GET/PUT/DELETE /api/session/[id]
       * Note : route singulier /api/session (voir dataProvider RESOURCE_MAP)
       */}
      <Resource
        name="sessions"
        options={{ label: 'Sessions' }}
        list={SessionList}
        edit={SessionEdit}
        create={SessionCreate}
        show={SessionShow}
      />

      {/**
       * Questions — lecture + suppression uniquement
       * API : GET /api/questions | GET/DELETE /api/questions/[id]
       * Pas de PUT → pas de formulaire d'édition exposé.
       */}
      <Resource
        name="questions"
        options={{ label: 'Questions' }}
        list={QuestionList}
        show={QuestionShow}
      />
    </Admin>
  );
}