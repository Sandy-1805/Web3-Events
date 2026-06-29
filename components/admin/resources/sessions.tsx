/**
 * components/admin/resources/sessions.tsx
 *
 * Vues React Admin pour la ressource "sessions"
 * Regroupe : List, Create, Edit, Show
 */

import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  EditButton,
  DeleteButton,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  DateTimeInput,
  Show,
  SimpleShowLayout,
  SearchInput,
  required,
  minLength,
  minValue,
  ArrayField,
  SingleFieldList,
  ChipField,
  ReferenceArrayInput,
  SelectArrayInput,
  Toolbar,
  SaveButton,
  useNotify,
  useRedirect,
} from 'react-admin';
import { Box, Typography, Divider } from '@mui/material';

// ─── FILTRES ──────────────────────────────────────────────────────────────────
const sessionFilters = [
  <SearchInput source="q" alwaysOn placeholder="Rechercher une session..." />,
];

// ─── TOOLBARS PERSONNALISÉES ────────────────────────────────────────────────
const SessionEditToolbar = () => (
    <Toolbar>
      <SaveButton />
      <DeleteButton />
    </Toolbar>
);

const SessionCreateToolbar = () => (
    <Toolbar>
      <SaveButton />
    </Toolbar>
);

// ─── LIST ─────────────────────────────────────────────────────────────────────
export const SessionList = () => (
    <List
        filters={sessionFilters}
        sort={{ field: 'startTime', order: 'ASC' }}
        perPage={10}
        title="Sessions"
    >
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="id" label="ID" />
        <TextField source="title" label="Titre" sx={{ fontWeight: 600 }} />

        {/* ✅ CORRECTION : ArrayField sans label */}
        <ArrayField source="speakers">
          <SingleFieldList>
            <ChipField
                source="name"
                sx={{
                  borderRadius: '8px',
                  backgroundColor: 'rgba(99,102,241,0.12)',
                  color: '#a5b4fc',
                  fontSize: '0.75rem',
                }}
            />
          </SingleFieldList>
        </ArrayField>

        <TextField source="room" label="Salle" />
        <NumberField source="capacity" label="Capacité" emptyText="—" />

        <ReferenceField source="eventId" reference="events" label="Événement">
          <TextField source="title" />
        </ReferenceField>

        <DateField source="startTime" label="Début" showTime locales="fr-FR" />
        <DateField source="endTime" label="Fin" showTime locales="fr-FR" />

        <EditButton label="Modifier" />
        <DeleteButton label="Supprimer" />
      </Datagrid>
    </List>
);

// ─── CREATE ───────────────────────────────────────────────────────────────────
export const SessionCreate = () => {
  const notify = useNotify();
  const redirect = useRedirect();

  const onSuccess = () => {
    notify('Session créée avec succès', { type: 'success' });
    redirect('/admin/sessions');
  };

  return (
      <Create mutationOptions={{ onSuccess }}>
        <SimpleForm toolbar={<SessionCreateToolbar />}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextInput
                source="title"
                label="Titre"
                validate={[required('Le titre est obligatoire'), minLength(3)]}
                fullWidth
            />
            <TextInput
                source="room"
                label="Salle"
                validate={[required('La salle est obligatoire')]}
                fullWidth
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <DateTimeInput
                source="startTime"
                label="Début"
                validate={[required("L'heure de début est obligatoire")]}
                fullWidth
            />
            <DateTimeInput
                source="endTime"
                label="Fin"
                validate={[required("L'heure de fin est obligatoire")]}
                fullWidth
            />
          </Box>

          <TextInput
              source="description"
              label="Description"
              multiline
              rows={4}
              fullWidth
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <NumberInput
                source="capacity"
                label="Capacité"
                fullWidth
            />
            {/* ✅ CORRECTION : validate sur ReferenceInput */}
            <ReferenceInput
                source="eventId"
                label="Événement"
                reference="events"
            >
              <SelectInput
                  optionText="title"
                  fullWidth
                  validate={[required("L'événement est obligatoire")]}
              />
            </ReferenceInput>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>
            🎤 Intervenants à assigner
          </Typography>

          <ReferenceArrayInput
              source="speakerIds"
              label="Intervenants"
              reference="speakers"
          >
            <SelectArrayInput
                optionText="name"
                label="Sélectionner les intervenants"
                fullWidth
                sx={{
                  '& .MuiChip-root': {
                    borderRadius: '8px',
                    backgroundColor: 'rgba(99,102,241,0.15)',
                    color: '#a5b4fc',
                  }
                }}
            />
          </ReferenceArrayInput>

          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: -1 }}>
            Sélectionnez un ou plusieurs intervenants pour cette session
          </Typography>
        </SimpleForm>
      </Create>
  );
};

// ─── EDIT ─────────────────────────────────────────────────────────────────────
export const SessionEdit = () => {
  const notify = useNotify();
  const redirect = useRedirect();

  const onSuccess = () => {
    notify('Session mise à jour avec succès', { type: 'success' });
    redirect('/admin/sessions');
  };

  return (
      <Edit mutationOptions={{ onSuccess }}>
        <SimpleForm toolbar={<SessionEditToolbar />}>
          <TextInput source="id" label="ID" disabled />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextInput
                source="title"
                label="Titre"
                validate={[required('Le titre est obligatoire'), minLength(3)]}
                fullWidth
            />
            <TextInput
                source="room"
                label="Salle"
                validate={[required('La salle est obligatoire')]}
                fullWidth
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <DateTimeInput
                source="startTime"
                label="Début"
                validate={[required("L'heure de début est obligatoire")]}
                fullWidth
            />
            <DateTimeInput
                source="endTime"
                label="Fin"
                validate={[required("L'heure de fin est obligatoire")]}
                fullWidth
            />
          </Box>

          <TextInput
              source="description"
              label="Description"
              multiline
              rows={4}
              fullWidth
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <NumberInput
                source="capacity"
                label="Capacité"
                fullWidth
            />
            {/* ✅ CORRECTION : validate sur ReferenceInput */}
            <ReferenceInput
                source="eventId"
                label="Événement"
                reference="events"
            >
              <SelectInput
                  optionText="title"
                  fullWidth
                  validate={[required("L'événement est obligatoire")]}
              />
            </ReferenceInput>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>
            🎤 Intervenants assignés
          </Typography>

          <ReferenceArrayInput
              source="speakerIds"
              label="Intervenants"
              reference="speakers"
          >
            <SelectArrayInput
                optionText="name"
                label="Sélectionner les intervenants"
                fullWidth
                sx={{
                  '& .MuiChip-root': {
                    borderRadius: '8px',
                    backgroundColor: 'rgba(99,102,241,0.15)',
                    color: '#a5b4fc',
                  }
                }}
            />
          </ReferenceArrayInput>

          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: -1 }}>
            Sélectionnez un ou plusieurs intervenants pour cette session
          </Typography>
        </SimpleForm>
      </Edit>
  );
};

// ─── SHOW ─────────────────────────────────────────────────────────────────────
export const SessionShow = () => (
    <Show title="Détail de la session">
      <SimpleShowLayout>
        <TextField source="id" label="ID" />
        <TextField source="title" label="Titre" />
        <TextField source="description" label="Description" emptyText="—" />
        <TextField source="room" label="Salle" />
        <NumberField source="capacity" label="Capacité" emptyText="Illimitée" />

        <ReferenceField source="eventId" reference="events" label="Événement">
          <TextField source="title" />
        </ReferenceField>

        <DateField source="startTime" label="Début" showTime locales="fr-FR" />
        <DateField source="endTime" label="Fin" showTime locales="fr-FR" />
        <DateField source="createdAt" label="Créé le" locales="fr-FR" />

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" sx={{ mb: 2 }}>
          🎤 Intervenants
        </Typography>

        {/* ✅ CORRECTION : ArrayField sans label */}
        <ArrayField source="speakers">
          <SingleFieldList>
            <ChipField
                source="name"
                sx={{
                  borderRadius: '8px',
                  backgroundColor: 'rgba(99,102,241,0.12)',
                  color: '#a5b4fc',
                }}
            />
          </SingleFieldList>
        </ArrayField>
      </SimpleShowLayout>
    </Show>
);