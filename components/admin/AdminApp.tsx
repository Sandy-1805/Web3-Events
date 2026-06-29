// components/admin/AdminApp.tsx
'use client';

import { Admin, Resource } from 'react-admin';
import dataProvider from '@/lib/admin/dataProvider';
import authProvider from '@/lib/admin/authProvider';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from 'ra-language-english';

// ✅ Import des ressources
import {
  SessionList,
  SessionCreate,
  SessionEdit,
  SessionShow
} from './resources/sessions';

import {
  SpeakerList,
  SpeakerCreate,
  SpeakerEdit,
  SpeakerShow
} from './resources/speakers';

import {
  EventList,
  EventCreate,
  EventEdit,
  EventShow
} from './resources/events';

import {
  QuestionList,
  QuestionShow
} from './resources/questions';

import {
  UserList,
  UserShow
} from './resources/users';

// ✅ Créer le provider i18n pour l'anglais
const i18nProvider = polyglotI18nProvider(() => englishMessages, 'en');

export default function AdminApp() {
  return (
      <Admin
          dataProvider={dataProvider}
          authProvider={authProvider}
          i18nProvider={i18nProvider}
          requireAuth
      >
        <Resource
            name="events"
            list={EventList}
            create={EventCreate}
            edit={EventEdit}
            show={EventShow}
            recordRepresentation="title"
            icon={() => <span>📅</span>}
            options={{ label: 'Events' }}
        />

        <Resource
            name="sessions"
            list={SessionList}
            create={SessionCreate}
            edit={SessionEdit}
            show={SessionShow}
            recordRepresentation="title"
            icon={() => <span>⏰</span>}
            options={{ label: 'Sessions' }}
        />

        <Resource
            name="speakers"
            list={SpeakerList}
            create={SpeakerCreate}
            edit={SpeakerEdit}
            show={SpeakerShow}
            recordRepresentation="name"
            icon={() => <span>🎤</span>}
            options={{ label: 'Speakers' }}
        />

        <Resource
            name="questions"
            list={QuestionList}
            show={QuestionShow}
            recordRepresentation="content"
            icon={() => <span>💬</span>}
            options={{ label: 'Questions' }}
        />

        <Resource
            name="users"
            list={UserList}
            show={UserShow}
            recordRepresentation="name"
            icon={() => <span>👥</span>}
            options={{ label: 'Users' }}
        />
      </Admin>
  );
}