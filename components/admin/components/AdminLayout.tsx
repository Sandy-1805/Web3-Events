// components/admin/components/AdminLayout.tsx
'use client';

import { Layout } from 'react-admin';
import { ReactNode } from 'react';
import AdminAppBar from './AdminAppBar';
import AdminMenu from './AdminMenu';

export const AdminLayout = ({ children }: { children: ReactNode }) => {
    return (
        <Layout
            appBar={AdminAppBar}
            menu={AdminMenu}
        >
            {children}
        </Layout>
    );
};