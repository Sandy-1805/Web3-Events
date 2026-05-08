/**
 * components/admin/resources/events.tsx
 *
 * Vues React Admin pour la ressource "events".
 *
 * Champs du schéma BDD :
 *   id, title, description, startDate, endDate, location, createdAt
 *
 * Composants exportés :
 *   EventList   → tableau paginé avec recherche et tri
 *   EventEdit   → formulaire de modification
 *   EventCreate → formulaire de création
 *   EventShow   → vue détail (lecture seule)
 */

import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  DeleteButton,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  DateTimeInput,
  Show,
  SimpleShowLayout,
  SearchInput,
  required,
  minLength,
} from 'react-admin';

// ─── Filtres affichés dans la barre de recherche ──────────────────────────────
// SearchInput filtre sur le champ "title" côté client (via dataProvider.applyFilter).
const eventFilters = [
  <SearchInput source="title" alwaysOn placeholder="Rechercher un événement..." />,
];

// ─── LIST ─────────────────────────────────────────────────────────────────────
/**
 * Tableau des événements avec :
 * - Colonnes triables : titre, lieu, date de début, date de fin, date de création
 * - Boutons Edit et Delete sur chaque ligne
 * - Barre de recherche par titre
 */
export const EventList = () => (
  <List
    filters={eventFilters}
    sort={{ field: 'startDate', order: 'DESC' }}
    perPage={10}
    title="Événements"
  >
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <TextField source="id"          label="ID" />
      <TextField source="title"       label="Titre" />
      <TextField source="location"    label="Lieu" emptyText="—" />
      <DateField source="startDate"   label="Début"    showTime locales="fr-FR" />
      <DateField source="endDate"     label="Fin"      showTime locales="fr-FR" />
      <DateField source="createdAt"   label="Créé le"           locales="fr-FR" />
      <EditButton   label="Modifier" />
      <DeleteButton label="Supprimer" />
    </Datagrid>
  </List>
);

// ─── EDIT ─────────────────────────────────────────────────────────────────────
/**
 * Formulaire de modification d'un événement existant.
 * Envoie un PUT /api/events/{id} avec les données du formulaire.
 *
 * Validations :
 * - title   : obligatoire, minimum 3 caractères
 * - startDate / endDate : obligatoires
 */
export const EventEdit = () => (
  <Edit title="Modifier l'événement">
    <SimpleForm>
      {/* L'ID est affiché en lecture seule — jamais modifiable */}
      <TextInput source="id" label="ID" disabled />

      <TextInput
        source="title"
        label="Titre"
        fullWidth
        validate={[required('Le titre est obligatoire'), minLength(3, 'Minimum 3 caractères')]}
      />

      <TextInput
        source="description"
        label="Description"
        fullWidth
        multiline
        rows={4}
      />

      <DateTimeInput
        source="startDate"
        label="Date de début"
        validate={required('La date de début est obligatoire')}
      />

      <DateTimeInput
        source="endDate"
        label="Date de fin"
        validate={required('La date de fin est obligatoire')}
      />

      <TextInput
        source="location"
        label="Lieu"
        fullWidth
      />
    </SimpleForm>
  </Edit>
);

// ─── CREATE ───────────────────────────────────────────────────────────────────
/**
 * Formulaire de création d'un nouvel événement.
 * Envoie un POST /api/events avec les données du formulaire.
 * L'API attend : { title, description, startDate, endDate, location }
 */
export const EventCreate = () => (
  <Create title="Créer un événement" redirect="list">
    <SimpleForm>
      <TextInput
        source="title"
        label="Titre"
        fullWidth
        validate={[required('Le titre est obligatoire'), minLength(3, 'Minimum 3 caractères')]}
      />

      <TextInput
        source="description"
        label="Description"
        fullWidth
        multiline
        rows={4}
      />

      <DateTimeInput
        source="startDate"
        label="Date de début"
        validate={required('La date de début est obligatoire')}
      />

      <DateTimeInput
        source="endDate"
        label="Date de fin"
        validate={required('La date de fin est obligatoire')}
      />

      <TextInput
        source="location"
        label="Lieu"
        fullWidth
      />
    </SimpleForm>
  </Create>
);

// ─── SHOW ─────────────────────────────────────────────────────────────────────
/**
 * Vue détail d'un événement en lecture seule.
 * Accessible via le bouton "Voir" ou en cliquant sur une ligne
 * si rowClick="show" est configuré dans le Datagrid.
 */
export const EventShow = () => (
  <Show title="Détail de l'événement">
    <SimpleShowLayout>
      <TextField source="id"          label="ID" />
      <TextField source="title"       label="Titre" />
      <TextField source="description" label="Description" emptyText="Aucune description" />
      <TextField source="location"    label="Lieu"         emptyText="—" />
      <DateField source="startDate"   label="Début"    showTime locales="fr-FR" />
      <DateField source="endDate"     label="Fin"      showTime locales="fr-FR" />
      <DateField source="createdAt"   label="Créé le"           locales="fr-FR" />
    </SimpleShowLayout>
  </Show>
);
