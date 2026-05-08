/**
 * components/admin/resources/questions.tsx
 *
 * Vues React Admin pour la ressource "questions".
 *
 * Champs du schéma BDD :
 *   id, content, authorName, upvotes, sessionId, createdAt
 *
 * Remarques importantes :
 * - L'API /api/questions/[id] n'a pas de PUT → pas d'édition possible.
 *   On n'expose que List et Show, sans EditButton ni Edit.
 * - La suppression (DELETE /api/questions/[id]) est disponible.
 * - sessionId → référence vers "sessions" affichée avec <ReferenceField>.
 */

import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  ReferenceField,
  DeleteButton,
  Show,
  SimpleShowLayout,
  SearchInput,
} from 'react-admin';

const questionFilters = [
  <SearchInput source="content" alwaysOn placeholder="Rechercher une question..." />,
];

// ─── LIST ─────────────────────────────────────────────────────────────────────
/**
 * Pas de EditButton ici car l'API ne supporte pas PUT /api/questions/[id].
 * L'admin peut uniquement consulter et supprimer les questions.
 */
export const QuestionList = () => (
  <List
    filters={questionFilters}
    sort={{ field: 'upvotes', order: 'DESC' }}
    perPage={25}
    title="Questions"
  >
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <TextField    source="id"         label="ID" />
      <TextField    source="content"    label="Question" />
      <TextField    source="authorName" label="Auteur"   emptyText="Anonyme" />
      <NumberField  source="upvotes"    label="Votes" />
      <ReferenceField source="sessionId" reference="sessions" label="Session">
        <TextField source="title" />
      </ReferenceField>
      <DateField source="createdAt" label="Posée le" locales="fr-FR" />
      <DeleteButton label="Supprimer" />
    </Datagrid>
  </List>
);

// ─── SHOW ─────────────────────────────────────────────────────────────────────
export const QuestionShow = () => (
  <Show title="Détail de la question">
    <SimpleShowLayout>
      <TextField   source="id"         label="ID" />
      <TextField   source="content"    label="Contenu" />
      <TextField   source="authorName" label="Auteur"   emptyText="Anonyme" />
      <NumberField source="upvotes"    label="Votes" />
      <ReferenceField source="sessionId" reference="sessions" label="Session">
        <TextField source="title" />
      </ReferenceField>
      <DateField source="createdAt" label="Posée le" locales="fr-FR" />
    </SimpleShowLayout>
  </Show>
);
