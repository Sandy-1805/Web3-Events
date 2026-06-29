/**
 * components/admin/resources/speakers.tsx
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
    ImageField,
    Toolbar,
    SaveButton,
    useNotify,
    useRedirect,
    useRecordContext,
} from 'react-admin';
import { useState } from 'react';

const speakerFilters = [
    <SearchInput source="name" alwaysOn placeholder="Rechercher un intervenant..." />,
];

// ─── TOOLBARS ─────────────────────────────────────────────────────────────────
const SpeakerEditToolbar = () => (
    <Toolbar>
        <SaveButton />
        <DeleteButton />
    </Toolbar>
);

// ─── COMPOSANT D'UPLOAD ─────────────────────────────────────────────────────
const ImageUpload = ({ source, label }: { source: string; label: string }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Erreur d'upload");
            }

            const data = await response.json();
            setPreview(data.url);

            const input = document.querySelector(`[name="${source}"]`) as HTMLInputElement;
            if (input) {
                input.value = data.url;
                const event = new Event('change', { bubbles: true });
                input.dispatchEvent(event);
            }
        } catch (error: any) {
            alert(error.message || "Erreur lors de l'upload");
        } finally {
            setUploading(false);
        }
    };

    const currentValue = (document.querySelector(`[name="${source}"]`) as HTMLInputElement)?.value || '';

    return (
        <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.875rem' }}>
                {label}
            </label>

            {(preview || currentValue) && (
                <div style={{ marginBottom: '12px' }}>
                    <img
                        src={preview || currentValue}
                        alt="Aperçu"
                        style={{
                            maxWidth: '200px',
                            maxHeight: '200px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            objectFit: 'cover',
                        }}
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </div>
            )}

            <label
                style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    opacity: uploading ? 0.6 : 1,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    background: 'transparent',
                    color: '#f1f5f9',
                }}
            >
                {uploading ? 'Upload en cours...' : 'Choisir une photo'}
                <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    disabled={uploading}
                />
            </label>

            <p style={{ marginTop: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                Formats acceptés : JPEG, PNG, WebP, GIF (max 5MB)
            </p>

            <input type="hidden" name={source} />
        </div>
    );
};

// ─── COMPOSANT PHOTO POUR SHOW ─────────────────────────────────────────────
const SpeakerPhoto = () => {
    const record = useRecordContext();
    if (!record?.photo) return null;

    return (
        <div style={{ margin: '16px 0' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.875rem' }}>Photo</label>
            <img
                src={record.photo}
                alt={record.name || 'Intervenant'}
                style={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid rgba(255,255,255,0.1)',
                }}
                onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                }}
            />
        </div>
    );
};

// ─── LIST ─────────────────────────────────────────────────────────────────────
export const SpeakerList = () => (
    <List
        filters={speakerFilters}
        sort={{ field: 'name', order: 'ASC' }}
        perPage={10}
        title="Intervenants"
    >
        <Datagrid rowClick="edit" bulkActionButtons={false}>
            <TextField source="id" label="ID" />
            <ImageField
                source="photo"
                label="Photo"
                sx={{
                    '& img': {
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        objectFit: 'cover',
                    },
                }}
            />
            <TextField source="name" label="Nom" />
            <TextField source="bio" label="Bio" emptyText="—" />
            <DateField source="createdAt" label="Créé le" locales="fr-FR" />
            <EditButton label="Modifier" />
            <DeleteButton label="Supprimer" />
        </Datagrid>
    </List>
);

// ─── EDIT ─────────────────────────────────────────────────────────────────────
export const SpeakerEdit = () => {
    const notify = useNotify();
    const redirect = useRedirect();

    const onSuccess = () => {
        notify('Intervenant mis à jour avec succès', { type: 'success' });
        redirect('/admin/speakers');
    };

    return (
        <Edit mutationOptions={{ onSuccess }}>
            <SimpleForm toolbar={<SpeakerEditToolbar />}>
                <TextInput source="id" label="ID" disabled />

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

                <ImageUpload source="photo" label="Photo de profil" />

                <TextInput
                    source="photo"
                    label="URL de la photo (ou utilisez l'upload ci-dessus)"
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
};

// ─── CREATE ──────────────────────────────────────────────────────────────────
export const SpeakerCreate = () => {
    const notify = useNotify();
    const redirect = useRedirect();

    const onSuccess = () => {
        notify('Intervenant créé avec succès', { type: 'success' });
        redirect('/admin/speakers');
    };

    return (
        <Create mutationOptions={{ onSuccess }}>
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

                <ImageUpload source="photo" label="Photo de profil" />

                <TextInput
                    source="photo"
                    label="URL de la photo (ou utilisez l'upload ci-dessus)"
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
};

// ─── SHOW ─────────────────────────────────────────────────────────────────────
export const SpeakerShow = () => (
    <Show title="Détail de l'intervenant">
        <SimpleShowLayout>
            <TextField source="id" label="ID" />
            <SpeakerPhoto />
            <TextField source="name" label="Nom" />
            <TextField source="bio" label="Biographie" emptyText="Aucune biographie" />
            <UrlField source="photo" label="Photo" emptyText="—" />
            <TextField source="socialLinks" label="Liens sociaux" emptyText="—" />
            <DateField source="createdAt" label="Créé le" locales="fr-FR" />
        </SimpleShowLayout>
    </Show>
);