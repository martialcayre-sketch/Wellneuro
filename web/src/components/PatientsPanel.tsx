'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
  CreatePatientResponse,
  PatientsApiResponse,
} from '@/app/api/praticien/patients/route';
import type { CreateAssignationResponse } from '@/app/api/praticien/assignations/route';
import type { QuestionnairesApiResponse } from '@/app/api/praticien/questionnaires/route';

type SortBy = 'nom' | 'email';

function StatusBadge({ value }: { value: string }) {
  const status = value || '—';
  const classes =
    status === 'Terminé'
      ? 'bg-green-100 text-green-700'
      : status === 'Envoyé' || status === 'En_cours'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-gray-100 text-gray-600';

  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${classes}`}>{status}</span>;
}

export function PatientsPanel() {
  const [data, setData] = useState<PatientsApiResponse | null>(null);
  const [questionnaires, setQuestionnaires] = useState<QuestionnairesApiResponse['questionnaires']>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAssignation, setSavingAssignation] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('nom');
  const [feedback, setFeedback] = useState<string>('');
  const [assignationFeedback, setAssignationFeedback] = useState<string>('');
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    dateNaissance: '',
  });
  const [assignationForm, setAssignationForm] = useState({
    emailPatient: '',
    idQuestionnaire: '',
    dateLimite: '',
    notes: '',
  });

  const loadData = async () => {
    const r = await fetch('/api/praticien/patients');
    const json = (await r.json()) as PatientsApiResponse;
    setData(json);
  };

  const loadQuestionnaires = async () => {
    const r = await fetch('/api/praticien/questionnaires');
    const json = (await r.json()) as QuestionnairesApiResponse;
    setQuestionnaires(json.questionnaires ?? []);
  };

  useEffect(() => {
    Promise.all([loadData(), loadQuestionnaires()])
      .catch(() =>
        setData({
          patients: [],
          assignations: [],
          unavailable: true,
          reason: 'exception',
        })
      )
      .finally(() => setLoading(false));
  }, []);

  const onCreatePatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setFeedback('');

    try {
      const r = await fetch('/api/praticien/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const json = (await r.json()) as CreatePatientResponse;
      if (!r.ok || !json.success) {
        setFeedback(`Erreur: ${json.error ?? json.reason ?? 'unknown'}`);
        return;
      }

      setFeedback('Patient créé avec succès.');
      setForm({ prenom: '', nom: '', email: '', telephone: '', dateNaissance: '' });
      await loadData();
    } catch {
      setFeedback('Erreur technique lors de la création du patient.');
    } finally {
      setSaving(false);
    }
  };

  const onCreateAssignation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingAssignation(true);
    setAssignationFeedback('');

    try {
      const selectedQ = questionnaires.find(q => q.id === assignationForm.idQuestionnaire);
      const r = await fetch('/api/praticien/assignations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailPatient: assignationForm.emailPatient,
          idQuestionnaire: assignationForm.idQuestionnaire,
          titre: selectedQ?.titre ?? '',
          dateLimite: assignationForm.dateLimite,
          notes: assignationForm.notes,
        }),
      });

      const json = (await r.json()) as CreateAssignationResponse;
      if (!r.ok || !json.success) {
        setAssignationFeedback(`Erreur: ${json.error ?? json.reason ?? 'unknown'}`);
        return;
      }

      setAssignationFeedback('Assignation créée avec succès.');
      setAssignationForm({ emailPatient: '', idQuestionnaire: '', dateLimite: '', notes: '' });
      await loadData();
    } catch {
      setAssignationFeedback('Erreur technique lors de la création de l’assignation.');
    } finally {
      setSavingAssignation(false);
    }
  };

  const filteredPatients = useMemo(() => {
    const list = data?.patients ?? [];
    const q = search.toLowerCase().trim();

    const searched = q
      ? list.filter(p =>
          `${p.prenom} ${p.nom} ${p.email}`.toLowerCase().includes(q)
        )
      : list;

    return [...searched].sort((a, b) => {
      if (sortBy === 'email') return a.email.localeCompare(b.email);
      return `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`);
    });
  }, [data?.patients, search, sortBy]);

  if (loading) {
    return <div className="text-sm text-gray-500">Chargement des données patients...</div>;
  }

  if (data?.unavailable) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-500">
        Données patients indisponibles. Cause: <span className="font-medium">{data.reason ?? 'unknown'}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Nouveau patient</h3>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={onCreatePatient}>
          <input
            required
            value={form.prenom}
            onChange={e => setForm(prev => ({ ...prev, prenom: e.target.value }))}
            placeholder="Prénom"
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            required
            value={form.nom}
            onChange={e => setForm(prev => ({ ...prev, nom: e.target.value }))}
            placeholder="Nom"
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            required
            type="email"
            value={form.email}
            onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Email"
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={form.telephone}
            onChange={e => setForm(prev => ({ ...prev, telephone: e.target.value }))}
            placeholder="Téléphone"
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={form.dateNaissance}
            onChange={e => setForm(prev => ({ ...prev, dateNaissance: e.target.value }))}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {saving ? 'Création...' : 'Créer le patient'}
            </button>
            {feedback ? <span className="text-sm text-gray-600">{feedback}</span> : null}
          </div>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Nouvelle assignation questionnaire</h3>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={onCreateAssignation}>
          <select
            required
            value={assignationForm.emailPatient}
            onChange={e => setAssignationForm(prev => ({ ...prev, emailPatient: e.target.value }))}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Patient (email)</option>
            {(data?.patients ?? []).map(p => (
              <option key={p.idPatient} value={p.email}>
                {`${p.prenom} ${p.nom} — ${p.email}`}
              </option>
            ))}
          </select>
          <select
            required
            value={assignationForm.idQuestionnaire}
            onChange={e => setAssignationForm(prev => ({ ...prev, idQuestionnaire: e.target.value }))}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Questionnaire</option>
            {questionnaires.map(q => (
              <option key={q.id} value={q.id}>
                {`${q.titre} (${q.categorie})`}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={assignationForm.dateLimite}
            onChange={e => setAssignationForm(prev => ({ ...prev, dateLimite: e.target.value }))}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={assignationForm.notes}
            onChange={e => setAssignationForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Notes praticien (optionnel)"
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={savingAssignation}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {savingAssignation ? 'Création...' : 'Créer l’assignation'}
            </button>
            {assignationFeedback ? <span className="text-sm text-gray-600">{assignationFeedback}</span> : null}
          </div>
        </form>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher (nom, prénom, email)"
            className="w-full sm:w-80 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortBy)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="nom">Tri: nom</option>
            <option value="email">Tri: email</option>
          </select>
        </div>
        <div className="text-sm text-gray-500">{filteredPatients.length} patient(s)</div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">Patients</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">Nom</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Téléphone</th>
                <th className="px-4 py-2 text-left">Actif</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(p => (
                <tr key={p.idPatient} className="border-t border-gray-100">
                  <td className="px-4 py-2">{`${p.prenom} ${p.nom}`.trim() || '—'}</td>
                  <td className="px-4 py-2">{p.email || '—'}</td>
                  <td className="px-4 py-2">{p.telephone || '—'}</td>
                  <td className="px-4 py-2">{p.actif || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">Assignations récentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Patient</th>
                <th className="px-4 py-2 text-left">Questionnaire</th>
                <th className="px-4 py-2 text-left">Statut</th>
              </tr>
            </thead>
            <tbody>
              {(data?.assignations ?? []).map(a => (
                <tr key={a.idAssignation} className="border-t border-gray-100">
                  <td className="px-4 py-2">{a.dateAssignation || '—'}</td>
                  <td className="px-4 py-2">{a.emailPatient || a.idPatient || '—'}</td>
                  <td className="px-4 py-2">{a.titre || a.idQuestionnaire || '—'}</td>
                  <td className="px-4 py-2"><StatusBadge value={a.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
