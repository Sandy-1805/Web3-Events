/**
 * components/admin/resources/sessions.tsx
 *
 * Vues React Admin pour la ressource "sessions".
 *
 * Champs du schéma BDD :
 *   id, title, description, startTime, endTime, room, capacity, eventId, createdAt
 *
 * Relation :
 *   eventId → référence vers la ressource "events"
 *   On utilise <ReferenceField> pour afficher le titre de l'événement
 *   et <ReferenceInput> dans les formulaires pour choisir un événement.
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
} from 'react-admin';

const sessionFilters = [
  <SearchInput source="title" alwaysOn placeholder="Rechercher une session..." />,
];

// ─── LIST ─────────────────────────────────────────────────────────────────────
/**
 * <ReferenceField source="eventId" reference="events"> :
 * Récupère automatiquement l'événement lié via dataProvider.getMany('events', ...)
 * et affiche son titre au lieu de l'ID brut.
 */
export const SessionList = () => (
  <List
    filters={sessionFilters}
    sort={{ field: 'startTime', order: 'ASC' }}
    perPage={10}
    title="Sessions"
  >
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <TextField    source="id"       label="ID" />
      <TextField    source="title"    label="Titre" />
      <TextField    source="room"     label="Salle" />
      <NumberField  source="capacity" label="Capacité" emptyText="—" />
      <ReferenceField source="eventId" reference="events" label="Événement">
        <TextField source="title" />
      </ReferenceField>
      <DateField source="startTime" label="Début" showTime locales="fr-FR" />
      <DateField source="endTime"   label="Fin"   showTime locales="fr-FR" />
      <EditButton   label="Modifier" />
      <DeleteButton label="Supprimer" />
    </Datagrid>
  </List>
);

// ─── EDIT ─────────────────────────────────────────────────────────────────────
/**
 * <ReferenceInput source="eventId" reference="events"> :
 * Charge la liste des événements via dataProvider.getList('events', ...)
 * et les affiche dans un <SelectInput> pour que l'admin puisse choisir.
 */
export const SessionEdit = () => (
  <Edit title="Modifier la session">
    <SimpleForm>
      <TextInput source="id" label="ID" disabled />

      <TextInput
        source="title"
        label="Titre"
        fullWidth
        validate={[required('Le titre est obligatoire'), minLength(3)]}
      />

      <TextInput
        source="description"
        label="Description"
        fullWidth
        multiline
        rows={3}
      />

      <TextInput
        source="room"
        label="Salle"
        validate={required('La salle est obligatoire')}
      />

      <NumberInput
        source="capacity"
        label="Capacité (places)"
        validate={minValue(1, 'La capacité doit être positive')}
        helperText="Laisser vide si illimitée"
      />

      {/* Sélecteur d'événement — charge la liste via getList('events') */}
      <ReferenceInput source="eventId" reference="events" label="Événement">
        <SelectInput
          optionText="title"
          validate={required("L'événement est obligatoire")}
          fullWidth
        />
      </ReferenceInput>

      <DateTimeInput
        source="startTime"
        label="Heure de début"
        validate={required("L'heure de début est obligatoire")}
      />

      <DateTimeInput
        source="endTime"
        label="Heure de fin"
        validate={required("L'heure de fin est obligatoire")}
      />
    </SimpleForm>
  </Edit>
);

// ─── CREATE ───────────────────────────────────────────────────────────────────
export const SessionCreate = () => (
  <Create title="Créer une session" redirect="list">
    <SimpleForm>
      <TextInput
        source="title"
        label="Titre"
        fullWidth
        validate={[required('Le titre est obligatoire'), minLength(3)]}
      />

      <TextInput
        source="description"
        label="Description"
        fullWidth
        multiline
        rows={3}
      />

      <TextInput
        source="room"
        label="Salle"
        validate={required('La salle est obligatoire')}
      />

      <NumberInput
        source="capacity"
        label="Capacité (places)"
        validate={minValue(1)}
        helperText="Laisser vide si illimitée"
      />

      <ReferenceInput source="eventId" reference="events" label="Événement">
        <SelectInput
          optionText="title"
          validate={required("L'événement est obligatoire")}
          fullWidth
        />
      </ReferenceInput>

      <DateTimeInput
        source="startTime"
        label="Heure de début"
        validate={required("L'heure de début est obligatoire")}
      />

      <DateTimeInput
        source="endTime"
        label="Heure de fin"
        validate={required("L'heure de fin est obligatoire")}
      />
    </SimpleForm>
  </Create>
);

// ─── SHOW ─────────────────────────────────────────────────────────────────────
export const SessionShow = () => (
  <Show title="Détail de la session">
    <SimpleShowLayout>
      <TextField   source="id"          label="ID" />
      <TextField   source="title"       label="Titre" />
      <TextField   source="description" label="Description"  emptyText="—" />
      <TextField   source="room"        label="Salle" />
      <NumberField source="capacity"    label="Capacité"     emptyText="Illimitée" />
      <ReferenceField source="eventId" reference="events" label="Événement">
        <TextField source="title" />
      </ReferenceField>
      <DateField source="startTime" label="Début" showTime locales="fr-FR" />
      <DateField source="endTime"   label="Fin"   showTime locales="fr-FR" />
      <DateField source="createdAt" label="Créé le"         locales="fr-FR" />
    </SimpleShowLayout>
  </Show>
);
