// components/admin/AdminApp.tsx
'use client';

import { Admin, Resource } from 'react-admin';
import { useEffect, useState } from 'react';
import dataProvider from '@/lib/admin/dataProvider';

// Ressource : Events
import { EventList, EventEdit, EventCreate, EventShow } from './ressources/events';
// Ressource : Speakers
import { SpeakerList, SpeakerEdit, SpeakerCreate, SpeakerShow } from './ressources/speakers';
// Ressource : Sessions
import { SessionList, SessionEdit, SessionCreate, SessionShow } from './ressources/sessions';
// Ressource : Questions
import { QuestionList, QuestionShow } from './ressources/questions';

const minimalAuthProvider = {
  login: () => Promise.resolve(),
  logout: () => { window.location.href = '/'; return Promise.resolve(); },
  checkAuth: () => Promise.resolve(),
  checkError: () => Promise.resolve(),
  getIdentity: () => Promise.resolve({ id: 1, fullName: 'Admin' }),
  getPermissions: () => Promise.resolve('admin'),
};

export default function AdminApp() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={minimalAuthProvider}
      title="EventSync · Administration"
    >
      <Resource
        name="events"
        options={{ label: 'Événements' }}
        list={EventList}
        edit={EventEdit}
        create={EventCreate}
        show={EventShow}
      />

      <Resource
        name="speakers"
        options={{ label: 'Intervenants' }}
        list={SpeakerList}
        edit={SpeakerEdit}
        create={SpeakerCreate}
        show={SpeakerShow}
      />

      <Resource
        name="sessions"
        options={{ label: 'Sessions' }}
        list={SessionList}
        edit={SessionEdit}
        create={SessionCreate}
        show={SessionShow}
      />

      <Resource
        name="questions"
        options={{ label: 'Questions' }}
        list={QuestionList}
        show={QuestionShow}
      />
    </Admin>
  );
}