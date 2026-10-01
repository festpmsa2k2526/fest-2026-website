import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xsoifeyivoybqzruaguu.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzb2lmZXlpdm95YnF6cnVhZ3V1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1NTQ1NiwiZXhwIjoyMDc5ODMxNDU2fQ.vCYTFn59Kz8S5qYPCKbMgOCjm6R02QhiN1GV36t33n0";

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Helper to check if event is a group event
function isGroupEvent(name: string, grade: string): boolean {
  const n = (name || '').toUpperCase();
  const g = (grade || '').toUpperCase();
  if (g === 'C') return true;
  if (n.includes('BROCHURE MAKING') || n.includes('STORY WAVING') || n.includes('STORY WEAVING')) return true;
  if (n.includes('CONVERSATION ENG') || n.includes('CONVERSATION MAL')) return true;
  return false;
}

export async function GET() {
  try {
    const [teamsRes, eventsRes, studentsRes, participationsRes, assetsRes] = await Promise.all([
      supabase.from("teams").select("id, name, slug, color_hex, penalty_points").order("name"),
      supabase.from("events").select("id, name, event_code, category, grade_type, applicable_section, max_participants_per_team").order("name"),
      supabase.from("students").select("id, name, chest_no, section, class_grade, team_id"),
      supabase.from("participations").select("id, event_id, student_id, team_id, result_position, performance_grade, points_earned, status, attendance_status, code_letter"),
      supabase.from("site_assets").select("key, value")
    ]);

    const rawTeams = teamsRes.data || [];
    const rawEvents = eventsRes.data || [];
    const rawStudents = studentsRes.data || [];
    const rawParticipations = participationsRes.data || [];
    const rawAssets = assetsRes.data || [];

    const eventMap = new Map(rawEvents.map(e => [e.id, e]));
    const studentMap = new Map(rawStudents.map(s => [s.id, s]));
    const teamMap = new Map(rawTeams.map(t => [t.id, t]));

    // 1. Calculate Team Scores & Breakdowns
    const teamStats: Record<string, {
      id: string;
      name: string;
      slug: string;
      color_hex: string;
      penalty_points: number;
      points: number;
      net_points: number;
      sections: { aliya: number; foundation: number; general: number };
      categories: { onStage: number; offStage: number };
    }> = {};

    rawTeams.forEach(t => {
      teamStats[t.id] = {
        id: t.id,
        name: t.name,
        slug: t.slug || t.id,
        color_hex: t.color_hex || "#caa02f",
        penalty_points: Number(t.penalty_points) || 0,
        points: 0,
        net_points: 0,
        sections: { aliya: 0, foundation: 0, general: 0 },
        categories: { onStage: 0, offStage: 0 }
      };
    });

    rawParticipations.forEach(p => {
      const teamId = p.team_id;
      if (!teamId || !teamStats[teamId]) return;
      const pts = Number(p.points_earned) || 0;
      if (pts <= 0) return;

      teamStats[teamId].points += pts;

      const ev = eventMap.get(p.event_id);
      if (ev) {
        // Section Breakdown
        const sections = Array.isArray(ev.applicable_section) ? ev.applicable_section : [ev.applicable_section];
        const secStr = sections.join(" ").toLowerCase();

        if (secStr.includes("general")) {
          teamStats[teamId].sections.general += pts;
        } else if (secStr.includes("foundation")) {
          teamStats[teamId].sections.foundation += pts;
        } else if (secStr.includes("aliya")) {
          teamStats[teamId].sections.aliya += pts;
        } else {
          teamStats[teamId].sections.general += pts;
        }

        // Category Breakdown (On Stage / Off Stage)
        const cat = (ev.category || "").toUpperCase();
        if (cat.includes("ON")) {
          teamStats[teamId].categories.onStage += pts;
        } else if (cat.includes("OFF")) {
          teamStats[teamId].categories.offStage += pts;
        }
      }
    });

    Object.values(teamStats).forEach(t => {
      t.net_points = Math.max(0, t.points - t.penalty_points);
    });

    const teamsLeaderboard = Object.values(teamStats).sort((a, b) => b.points - a.points);

    // 2. Format Event Results & Winners (Group Aware)
    // Group participations by event
    const eventPartsMap: Record<string, typeof rawParticipations> = {};
    rawParticipations.forEach(p => {
      if (!p.result_position && (!p.performance_grade || p.performance_grade === 'NONE')) return;
      if (!eventPartsMap[p.event_id]) eventPartsMap[p.event_id] = [];
      eventPartsMap[p.event_id].push(p);
    });

    const eventsWithResults: Array<{
      id: string;
      eventName: string;
      event_code: string;
      category: string;
      section: string;
      grade_type: string;
      isGroup: boolean;
      winners: Array<{
        pos: number;
        posLabel: string;
        name: string;
        chest_no?: string | null;
        teamId: string;
        teamName: string;
        teamColor: string;
        grade: string | null;
        points: number;
        codeLetter?: string | null;
      }>;
    }> = [];

    Object.entries(eventPartsMap).forEach(([eventId, parts]) => {
      const ev = eventMap.get(eventId);
      if (!ev) return;

      const isGrp = isGroupEvent(ev.name, ev.grade_type);

      let secDisplay = "General";
      if (ev.applicable_section) {
        const arr = Array.isArray(ev.applicable_section) ? ev.applicable_section : [ev.applicable_section];
        secDisplay = arr.join(", ");
      }

      const eventItem = {
        id: ev.id,
        eventName: ev.name,
        event_code: ev.event_code || "",
        category: ev.category || "ON STAGE",
        section: secDisplay,
        grade_type: ev.grade_type || "A",
        isGroup: isGrp,
        winners: [] as any[]
      };

      if (isGrp) {
        // Group by group key: team_id + '_' + (code_letter || 'grp')
        const groupsMap: Record<string, typeof parts> = {};
        parts.forEach(p => {
          const code = p.code_letter ? p.code_letter.trim().toUpperCase() : '';
          const key = code ? `${p.team_id}_code_${code}` : `${p.team_id}_${p.result_position || 'part'}`;
          if (!groupsMap[key]) groupsMap[key] = [];
          groupsMap[key].push(p);
        });

        Object.values(groupsMap).forEach(grpParts => {
          const firstP = grpParts[0];
          const tm = teamMap.get(firstP.team_id);
          const posStr = grpParts.find(p => p.result_position)?.result_position || null;
          const gradeStr = grpParts.find(p => p.performance_grade && p.performance_grade !== 'NONE')?.performance_grade || null;

          let posNum = 0;
          if (posStr === "FIRST") posNum = 1;
          else if (posStr === "SECOND") posNum = 2;
          else if (posStr === "THIRD") posNum = 3;

          // Group members names & chests
          const studentMembers = grpParts.map(p => {
            const st = p.student_id ? studentMap.get(p.student_id) : null;
            return {
              name: st?.name || 'Participant',
              chest_no: st?.chest_no || null
            };
          });

          let displayName = studentMembers.map(s => s.name).join(' & ');
          let displayChest = studentMembers.map(s => s.chest_no).filter(Boolean).join(', ');

          if (!displayName || displayName === '') {
            displayName = tm ? tm.name : 'Team Group';
          }

          // Sum points for this group (max of points_earned in group to avoid 0s)
          const totalPts = Math.max(...grpParts.map(p => Number(p.points_earned) || 0));

          eventItem.winners.push({
            pos: posNum,
            posLabel: posStr || "PARTICIPANT",
            name: displayName,
            chest_no: displayChest || null,
            teamId: firstP.team_id,
            teamName: tm?.name || "Unknown Team",
            teamColor: tm?.color_hex || "#caa02f",
            grade: gradeStr,
            points: totalPts,
            codeLetter: firstP.code_letter || null
          });
        });
      } else {
        // Individual Event
        parts.forEach(p => {
          let posNum = 0;
          if (p.result_position === "FIRST") posNum = 1;
          else if (p.result_position === "SECOND") posNum = 2;
          else if (p.result_position === "THIRD") posNum = 3;

          let winnerName = "Student Participant";
          let chestNo = null;

          if (p.student_id) {
            const st = studentMap.get(p.student_id);
            if (st) {
              winnerName = st.name;
              chestNo = st.chest_no;
            }
          }

          const tm = teamMap.get(p.team_id);

          eventItem.winners.push({
            pos: posNum,
            posLabel: p.result_position || "PARTICIPANT",
            name: winnerName,
            chest_no: chestNo,
            teamId: p.team_id,
            teamName: tm?.name || "Unknown Team",
            teamColor: tm?.color_hex || "#caa02f",
            grade: p.performance_grade && p.performance_grade !== "NONE" ? p.performance_grade : null,
            points: Number(p.points_earned) || 0,
            codeLetter: p.code_letter || null
          });
        });
      }

      eventItem.winners.sort((a, b) => {
        if (a.pos > 0 && b.pos > 0) return a.pos - b.pos;
        if (a.pos > 0) return -1;
        if (b.pos > 0) return 1;
        return b.points - a.points;
      });

      eventsWithResults.push(eventItem);
    });

    // Sort events alphabetically
    eventsWithResults.sort((a, b) => a.eventName.localeCompare(b.eventName));

    // 3. Category Breakdown Table Data
    const categoryBreakdown = teamsLeaderboard.map(t => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      color: t.color_hex,
      stats: {
        aliya: t.sections.aliya,
        foundation: t.sections.foundation,
        general: t.sections.general,
        onStage: t.categories.onStage,
        offStage: t.categories.offStage,
        total: t.points
      }
    }));

    // 4. TV Broadcast Controls from site_assets
    const broadcastAsset = rawAssets.find(a => a.key === "tv_broadcast_control");
    let broadcastState = null;
    if (broadcastAsset?.value) {
      try {
        broadcastState = typeof broadcastAsset.value === "string" ? JSON.parse(broadcastAsset.value) : broadcastAsset.value;
      } catch (e) {
        broadcastState = null;
      }
    }

    return NextResponse.json({
      success: true,
      teams: teamsLeaderboard,
      events: eventsWithResults,
      breakdown: categoryBreakdown,
      broadcast: broadcastState,
      totalCount: eventsWithResults.length,
      lastUpdated: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (err: any) {
    console.error("API /api/data error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
