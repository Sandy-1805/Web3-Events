// components/admin/resources/users.tsx
/**
 * components/admin/resources/users.tsx
 *
 * Vues React Admin pour la ressource "users".
 *
 * Champs du schéma BDD :
 *   id, name, email, role, createdAt
 */

import {
    List,
    Datagrid,
    TextField,
    DateField,
    Show,
    SimpleShowLayout,
    SearchInput,
} from 'react-admin';

const userFilters = [
    <SearchInput source="name" alwaysOn placeholder="Rechercher un utilisateur..." />,
];

// ─── LIST ─────────────────────────────────────────────────────────────────────
export const UserList = () => (
    <List
        filters={userFilters}
        sort={{ field: 'name', order: 'ASC' }}
        perPage={10}
        title="Utilisateurs"
    >
        <Datagrid rowClick="show" bulkActionButtons={false}>
            <TextField source="id" label="ID" />
            <TextField source="name" label="Nom" />
            <TextField source="email" label="Email" />
            <TextField source="role" label="Rôle" />
            <DateField source="createdAt" label="Créé le" locales="fr-FR" />
        </Datagrid>
    </List>
);

// ─── SHOW ─────────────────────────────────────────────────────────────────────
export const UserShow = () => (
    <Show title="Détail de l'utilisateur">
        <SimpleShowLayout>
            <TextField source="id" label="ID" />
            <TextField source="name" label="Nom" />
            <TextField source="email" label="Email" />
            <TextField source="role" label="Rôle" />
            <DateField source="createdAt" label="Créé le" locales="fr-FR" />
        </SimpleShowLayout>
    </Show>
);