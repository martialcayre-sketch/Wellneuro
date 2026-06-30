import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

const DATA_START = 3;

type Questionnaire = {
  id: string;
  titre: string;
  categorie: string;
  duree: string;
};

export type QuestionnairesApiResponse = {
  questionnaires: Questionnaire[];
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

function mapSheetsReason(status: number): QuestionnairesApiResponse['reason'] {
  if (status === 400) return 'sheets_400';
  if (status === 401) return 'sheets_401';
  if (status === 403) return 'sheets_403';
  if (status === 404) return 'sheets_404';
  return 'exception';
}

export async function GET(): Promise<NextResponse<QuestionnairesApiResponse>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { questionnaires: [], unavailable: true, reason: 'unauthenticated' },
      { status: 401 }
    );
  }

  const sheetId = process.env.SHEET_ID;
  const accessToken = session.accessToken;

  if (!sheetId || !accessToken) {
    return NextResponse.json({
      questionnaires: [],
      unavailable: true,
      reason: !sheetId ? 'no_sheet_id' : 'no_access_token',
    });
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent('Questionnaires!A:F')}`;

  try {
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });

    if (!resp.ok) {
      return NextResponse.json({
        questionnaires: [],
        unavailable: true,
        reason: mapSheetsReason(resp.status),
      });
    }

    const data = await resp.json();
    const rows: string[][] = (data.values ?? []).slice(DATA_START);

    const questionnaires = rows
      .filter(row => row[0] && row[5] === 'OUI')
      .map(row => ({
        id: row[0] ?? '',
        titre: row[1] ?? '',
        categorie: row[2] ?? '',
        duree: row[4] ?? '',
      }));

    return NextResponse.json({ questionnaires });
  } catch {
    return NextResponse.json({
      questionnaires: [],
      unavailable: true,
      reason: 'exception',
    });
  }
}
