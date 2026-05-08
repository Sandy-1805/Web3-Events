/**
 * app/admin/layout.tsx
 * Désactive le layout global (Header / Footer) de Next.js
 * uniquement pour les pages /admin.
 * React Admin apporte son propre layout complet.
 */

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}