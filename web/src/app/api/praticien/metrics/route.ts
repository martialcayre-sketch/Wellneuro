import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Ligne de début des données dans les Sheets (0-indexé)
// Sheets : row 1 = titre, row 2 = note, row 3 = headers, row 4+ = données
const DATA_START = 3;

export type MetricsResponse = {
  patients: number | null;
  questionnairesEnCours: number | null;
  synthesiesIA: number | null;
  bookletsEnvoyes: number | null;
  unavailable?: boolean;
  reason?:
    | 'unauthenticated'
    | 'no_sheet_id'
    | 'no_access_token'
    | 'sheets_400'
    | 'sheets_401'
    | 'sheets_403'
    | 'sheets_404'
    | 'exception';
};

export async function GET(): Promise<NextResponse<MetricsResponse>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      {
        patients: null,
        questionnairesEnCours: null,
        synthesiesIA: null,
        bookletsEnvoyes: null,
        unavailable: true,
        reason: 'unauthenticated',
      },
      { status: 401 }
    );
  }

  const sheetId = process.env.SHEET_ID;
  const accessToken = session.accessToken;

  // Si la configuration n'est pas faite, retourner un état "indisponible" propre
  if (!sheetId || !accessToken) {
    console.log('[metrics] config manquante — sheetId:', !!sheetId, '| accessToken:', !!accessToken);
    return NextResponse.json({
      patients: null,
      questionnairesEnCours: null,
      synthesiesIA: null,
      bookletsEnvoyes: null,
      unavailable: true,
      reason: !sheetId ? 'no_sheet_id' : 'no_access_token',
    });
  }

  const ranges = [
    'Patients!A:C',          // A=ID, B=email, C=rôle
    'Assignations!A:H',      // H=statut (index 7)
    'Syntheses_IA!A:A',
    'Booklet_Envois!A:A',
  ];

  const qs = ranges.map(r => `ranges=${encodeURIComponent(r)}`).join('&');
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchGet?${qs}`;

  try {
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });

    if (!resp.ok) {
      // Ne pas logger le détail de l'erreur (peut contenir des infos sensibles)
      console.error(`[metrics] Sheets API réponse ${resp.status}`);
      const errBody = await resp.json().catch(() => ({}));
      console.error('[metrics] Sheets error body:', JSON.stringify(errBody).slice(0, 300));
      return NextResponse.json({
        patients: null,
        questionnairesEnCours: null,
        synthesiesIA: null,
        bookletsEnvoyes: null,
        unavailable: true,
        reason:
          resp.status === 400
            ? 'sheets_400'
            : resp.status === 401
              ? 'sheets_401'
              : resp.status === 403
                ? 'sheets_403'
                : resp.status === 404
                  ? 'sheets_404'
                  : 'exception',
      });
    }

    const data = await resp.json();
    const [patientsRange, assignationsRange, synthesesRange, bookletsRange] =
      data.valueRanges ?? [];

    const patientsRows: string[][] = (patientsRange?.values ?? []).slice(DATA_START);
    const patients = patientsRows.filter(row => row[2] === 'Patient').length;

    const assignationsRows: string[][] = (assignationsRange?.values ?? []).slice(DATA_START);
    const questionnairesEnCours = assignationsRows.filter(
      row => row[7] === 'Envoyé' || row[7] === 'En_cours'
    ).length;

    const synthesesRows: string[][] = (synthesesRange?.values ?? []).slice(DATA_START);
    const synthesiesIA = synthesesRows.filter(row => row[0]).length;

    const bookletsRows: string[][] = (bookletsRange?.values ?? []).slice(DATA_START);
    const bookletsEnvoyes = bookletsRows.filter(row => row[0]).length;

    return NextResponse.json({ patients, questionnairesEnCours, synthesiesIA, bookletsEnvoyes });
  } catch (err) {
    console.error('[metrics] Exception:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({
      patients: null,
      questionnairesEnCours: null,
      synthesiesIA: null,
      bookletsEnvoyes: null,
      unavailable: true,
      reason: 'exception',
    });
  }
}
