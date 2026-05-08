/**
 * components/admin/resources/speakers.tsx
 *
 * Vues React Admin pour la ressource "speakers".
 *
 * Champs du schéma BDD :
 *   id, name, photo (URL), bio, socialLinks (JSON string), createdAt
 */

import {
  List,
  Datagrid,
  TextField,
  DateField,
  UrlField,
  EditButton,
  DeleteButton,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  Show,
  SimpleShowLayout,
  SearchInput,
  required,
  minLength,
} from 'react-admin';

const speakerFilters = [
  <SearchInput source="name" alwaysOn placeholder="Rechercher un intervenant..." />,
];

// ─── LIST ─────────────────────────────────────────────────────────────────────
export const SpeakerList = () => (
  <List
    filters={speakerFilters}
    sort={{ field: 'name', order: 'ASC' }}
    perPage={10}
    title="Intervenants"
  >
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <TextField source="id"          label="ID" />
      <TextField source="name"        label="Nom" />
      <TextField source="bio"         label="Bio"    emptyText="—" />
      <UrlField  source="photo"       label="Photo"  emptyText="—" />
      <DateField source="createdAt"   label="Créé le" locales="fr-FR" />
      <EditButton   label="Modifier" />
      <DeleteButton label="Supprimer" />
    </Datagrid>
  </List>
);

// ─── EDIT ─────────────────────────────────────────────────────────────────────
export const SpeakerEdit = () => (
  <Edit title="Modifier l'intervenant">
    <SimpleForm>
      <TextInput source="id"   label="ID" disabled />

      <TextInput
        source="name"
        label="Nom"
        fullWidth
        validate={[required('Le nom est obligatoire'), minLength(2)]}
      />

      <TextInput
        source="bio"
        label="Biographie"
        fullWidth
        multiline
        rows={4}
      />

      <TextInput
        source="photo"
        label="URL de la photo"
        fullWidth
        type="url"
        helperText="URL complète vers la photo de profil (ex: https://...)"
      />

      <TextInput
        source="socialLinks"
        label="Liens sociaux (JSON)"
        fullWidth
        multiline
        rows={2}
        helperText='Ex: {"twitter":"@handle","linkedin":"https://..."}'
      />
    </SimpleForm>
  </Edit>
);

// ─── CREATE ───────────────────────────────────────────────────────────────────
export const SpeakerCreate = () => (
  <Create title="Ajouter un intervenant" redirect="list">
    <SimpleForm>
      <TextInput
        source="name"
        label="Nom"
        fullWidth
        validate={[required('Le nom est obligatoire'), minLength(2)]}
      />

      <TextInput
        source="bio"
        label="Biographie"
        fullWidth
        multiline
        rows={4}
      />

      <TextInput
        source="photo"
        label="URL de la photo"
        fullWidth
        type="url"
        helperText="URL complète vers la photo de profil (ex: https://...)"
      />

      <TextInput
        source="socialLinks"
        label="Liens sociaux (JSON)"
        fullWidth
        multiline
        rows={2}
        helperText='Ex: {"twitter":"@handle","linkedin":"https://..."}'
      />
    </SimpleForm>
  </Create>
);

// ─── SHOW ─────────────────────────────────────────────────────────────────────
export const SpeakerShow = () => (
  <Show title="Détail de l'intervenant">
    <SimpleShowLayout>
      <TextField source="id"          label="ID" />
      <TextField source="name"        label="Nom" />
      <TextField source="bio"         label="Biographie"    emptyText="Aucune biographie" />
      <UrlField  source="photo"       label="Photo"         emptyText="—" />
      <TextField source="socialLinks" label="Liens sociaux" emptyText="—" />
      <DateField source="createdAt"   label="Créé le"       locales="fr-FR" />
    </SimpleShowLayout>
  </Show>
);
