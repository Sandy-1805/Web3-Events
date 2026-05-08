'use client';

import { Admin, Resource, ListGuesser, EditGuesser, ShowGuesser } from 'react-admin';
import dataProvider from '@/lib/admin/dataProvider';
import authProvider from '@/lib/admin/authProvider';

export default function AdminApp() {
  return (
    <Admin dataProvider={dataProvider} authProvider={authProvider} title="Web3-Events · Administration">
      <Resource name="events" options={{ label: 'Événements' }} list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
      <Resource name="speakers" options={{ label: 'Intervenants' }} list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
      <Resource name="sessions" options={{ label: 'Sessions' }} list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
      <Resource name="questions" options={{ label: 'Questions' }} list={ListGuesser} edit={EditGuesser} />
    </Admin>
  );
}
