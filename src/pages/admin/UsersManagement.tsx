import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { adminService } from '../../services/adminService';
import { Users, Search, Filter } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'CLIENT' | 'ADMIN';
  created_at: string;
  last_sign_in_at?: string;
  status: 'active' | 'suspended';
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'CLIENT' | 'ADMIN'>('ALL');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data || []);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Gestion des Utilisateurs
          </h1>
        </div>
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par email ou nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as 'ALL' | 'CLIENT' | 'ADMIN')}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="ALL">Tous les rôles</option>
            <option value="CLIENT">Clients</option>
            <option value="ADMIN">Administrateurs</option>
          </select>
        </div>
      </Card>

      {/* Liste des utilisateurs */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Utilisateurs ({filteredUsers.length})
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">Chargement...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Nom</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Rôle</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Inscription</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Dernière connexion</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-3 px-4 text-slate-900 dark:text-white">{user.email}</td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white">{user.full_name || '-'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={user.role === 'ADMIN' ? 'error' : 'success'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('fr-FR') : 'Jamais'}
                      </td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="outline">
                          Détails
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default UsersManagement;