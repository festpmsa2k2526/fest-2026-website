import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

export async function GET() {
  try {
    const [teamsRes, eventsRes, participationsRes] = await Promise.all([
      supabase.from('teams').select('*').order('name'),
      supabase.from('events').select('*').order('name'),
      supabase.from('participations').select(`
        id, event_id, team_id, student_id, result_position, performance_grade, points_earned, status,
        students ( id, name, chest_no, section, class_grade ),
        teams ( id, name, slug, color_hex ),
        events ( id, name, event_code, category, grade_type, applicable_section )
      `)
    ]);

    const rawTeams = teamsRes.data || [];
    const rawEvents = eventsRes.data || [];
    const rawParts = participationsRes.data || [];

    const SECTIONS = ['Aliya', 'Foundation', 'General', 'Foundation General'];
    const CATEGORIES = ['ON STAGE', 'OFF STAGE'];

    const teamMap: Record<string, any> = {};
    rawTeams.forEach(t => {
      teamMap[t.id] = {
        id: t.id,
        name: t.name,
        slug: t.slug || t.name,
        color_hex: t.color_hex || '#caa02f',
        penalty_points: t.penalty_points || 0,
        total_points: 0,
        net_points: 0,
        section_points: {
          'Aliya': 0,
          'Foundation': 0,
          'General': 0,
          'Foundation General': 0
        },
        category_points: {
          'ON STAGE': 0,
          'OFF STAGE': 0
        }
      };
    });

    rawParts.forEach((p: any) => {
      const tid = p.team_id;
      if (!tid || !teamMap[tid]) return;

      const pts = Number(p.points_earned) || 0;
      if (pts > 0) {
        teamMap[tid].total_points += pts;

        // Determine Section
        const evSections: string[] = Array.isArray(p.events?.applicable_section) 
          ? p.events.applicable_section 
          : (p.events?.applicable_section ? [p.events.applicable_section] : []);

        if (evSections.includes('Foundation General')) {
          teamMap[tid].section_points['Foundation General'] += pts;
        } else if (evSections.includes('General')) {
          teamMap[tid].section_points['General'] += pts;
        } else if (evSections.includes('Foundation')) {
          teamMap[tid].section_points['Foundation'] += pts;
        } else if (evSections.includes('Aliya')) {
          teamMap[tid].section_points['Aliya'] += pts;
        } else if (p.students?.section === 'Foundation') {
          teamMap[tid].section_points['Foundation'] += pts;
        } else if (p.students?.section === 'Aliya') {
          teamMap[tid].section_points['Aliya'] += pts;
        } else {
          teamMap[tid].section_points['General'] += pts;
        }

        // Determine Category (ON STAGE vs OFF STAGE)
        const cat = p.events?.category || 'OFF STAGE';
        if (teamMap[tid].category_points[cat] !== undefined) {
          teamMap[tid].category_points[cat] += pts;
        }
      }
    });

    // Calculate net points & sort
    const teamStandings = Object.values(teamMap).map((t: any) => ({
      ...t,
      net_points: Math.max(0, t.total_points - t.penalty_points)
    })).sort((a: any, b: any) => b.total_points - a.total_points);

    // Group completed event results
    const posNumMap: Record<string, number> = { 'FIRST': 1, 'SECOND': 2, 'THIRD': 3 };
    const groupedEvents: Record<string, any> = {};

    rawParts.forEach((p: any) => {
      if (!p.result_position && (!p.performance_grade || p.performance_grade === 'NONE')) return;

      const ev = p.events;
      if (!ev) return;

      if (!groupedEvents[ev.id]) {
        const evSecs = Array.isArray(ev.applicable_section) 
          ? ev.applicable_section.join(', ') 
          : (ev.applicable_section || 'General');

        groupedEvents[ev.id] = {
          id: ev.id,
          eventName: ev.name,
          eventCode: ev.event_code || '---',
          category: ev.category || 'OFF STAGE',
          gradeType: ev.grade_type || 'A',
          section: evSecs,
          isGroup: ev.grade_type === 'C',
          winners: []
        };
      }

      const posNum = p.result_position ? (posNumMap[p.result_position] || 0) : 0;
      const studentName = p.students?.name || (p.student_id ? 'Unknown' : (p.teams?.name ? `Team ${p.teams.name}` : 'Team Event'));
      const chestNo = p.students?.chest_no || '-';
      const teamName = p.teams?.name || 'Unknown Team';
      const teamColor = p.teams?.color_hex || teamMap[p.team_id]?.color_hex || '#caa02f';

      groupedEvents[ev.id].winners.push({
        id: p.id,
        pos: posNum,
        posText: p.result_position || '-',
        name: studentName,
        chestNo: chestNo,
        teamId: p.team_id,
        teamName: teamName,
        teamColor: teamColor,
        grade: p.performance_grade && p.performance_grade !== 'NONE' ? p.performance_grade : '-',
        points: Number(p.points_earned) || 0
      });
    });

    const eventResults = Object.values(groupedEvents).map((ev: any) => {
      ev.winners.sort((a: any, b: any) => {
        if (a.pos > 0 && b.pos > 0) return a.pos - b.pos;
        if (a.pos > 0) return -1;
        if (b.pos > 0) return 1;
        return b.points - a.points;
      });
      return ev;
    });

    return NextResponse.json({
      success: true,
      teams: teamStandings,
      events: eventResults,
      sections: SECTIONS,
      categories: CATEGORIES,
      lastUpdated: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching live data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch live data' },
      { status: 500 }
    );
  }
}
