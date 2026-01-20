'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // <--- ADDED THIS
import { createClient } from '@/app/utils/supabase/client'; 
import { 
  Trophy, ChevronRight, Save, Plus, Trash2, CheckCircle, AlertCircle, Loader2 // <--- ADDED Loader2
} from 'lucide-react';

// ==========================================
// ⚙️ CONFIGURATION
// ==========================================

const LEVELS = [
  { id: 'sub-junior', label: 'Sub Junior', prefix: 'SJ' },
  { id: 'junior', label: 'Junior', prefix: 'JU' },
  { id: 'senior', label: 'Senior', prefix: 'SE' },
  { id: 'general', label: 'General', prefix: 'GE' },
];

const POINT_SYSTEM = {
  'A': { 1: 12, 2: 8, 3: 4 },
  'B': { 1: 10, 2: 6, 3: 3 },
  'C': { 1: 20, 2: 15, 3: 10 } // Group events
};

// Points added for purely getting a grade (if applicable)
const GRADE_POINTS = { 'A': 5, 'B': 3, 'C': 1, 'None': 0 };

type WinnerEntry = {
  student_id: string | null;
  team_id: string | null;
  position: number | null; // 1, 2, 3 or null
  grade: string; // 'A', 'B', 'C', or 'None'
  points: number;
};

export default function AdminResultEntry() {
  const supabase = createClient();
  const router = useRouter(); // <--- Initialize Router
  
  // 🔒 AUTH STATE
  const [isAuthorized, setIsAuthorized] = useState(false); // <--- State to track if user is allowed

  // Steps: 0=Level, 1=Event, 2=Category, 3=Winners
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // Data State
  const [events, setEvents] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

  // Selection State
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<'A' | 'B' | 'C'>('A');
  const [entries, setEntries] = useState<WinnerEntry[]>([
    { student_id: '', team_id: null, position: 1, grade: 'None', points: 0 }
  ]);

  // ==========================================
  // 🔒 AUTH CHECK (NEW CODE)
  // ==========================================
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Not logged in? Redirect to login page
        router.push('/login');
      } else {
        // Logged in? Grant access
        setIsAuthorized(true);
      }
    };
    checkUser();
  }, [router, supabase]);

  // ==========================================
  // 🔄 DATA FETCHING
  // ==========================================
  useEffect(() => {
    // Only fetch data if authorized
    if (!isAuthorized) return; 

    const fetchBaseData = async () => {
      // 1. Fetch Students (Using 'chest_no' based on your CSV)
      const { data: stuData } = await supabase
        .from('students')
        .select('id, name, chest_no, team_id');
      
      if (stuData) setStudents(stuData);

      // 2. Fetch Teams
      const { data: teamData } = await supabase
        .from('teams')
        .select('id, name');
        
      if (teamData) setTeams(teamData);
    };
    fetchBaseData();
  }, [isAuthorized]); // Depend on isAuthorized

  // Fetch events when Level changes
  useEffect(() => {
    if (!selectedLevel) return;
    
    const fetchEvents = async () => {
      setLoading(true);
      const levelConfig = LEVELS.find(l => l.id === selectedLevel);
      if (!levelConfig) return;

      // Filter by Event Code Prefix (e.g., 'JUON' or 'JUOF')
      const { data, error } = await supabase
        .from('events')
        .select('*')
        // Checks if event_code starts with Prefix+ON OR Prefix+OF
        .or(`event_code.ilike.${levelConfig.prefix}ON%,event_code.ilike.${levelConfig.prefix}OF%`)
        .order('name');
      
      if (data) setEvents(data);
      setLoading(false);
    };

    fetchEvents();
  }, [selectedLevel]);

  // ==========================================
  // 🧮 LOGIC HANDLERS
  // ==========================================

  // Auto-select category if event has 'grade_type'
  const handleEventSelect = (event: any) => {
    setSelectedEvent(event);
    if (event.grade_type && ['A', 'B', 'C'].includes(event.grade_type)) {
      setSelectedCategory(event.grade_type as 'A'|'B'|'C');
    }
    setStep(2);
  };

  const handleEntryChange = (index: number, field: keyof WinnerEntry, value: any) => {
    const newEntries = [...entries];
    
    // Update Field
    (newEntries[index] as any)[field] = value;

    // If student selected, auto-fill team_id from local student data
    if (field === 'student_id') {
      const student = students.find(s => s.id === value);
      if (student) {
        newEntries[index].team_id = student.team_id;
      }
    }

    // Auto-Calculate Points
    const entry = newEntries[index];
    let totalPoints = 0;

    // 1. Position Points
    if (entry.position && entry.position <= 3) {
      // @ts-ignore
      totalPoints += POINT_SYSTEM[selectedCategory][entry.position] || 0;
    }

    // 2. Grade Points (Optional: Add this if grades add EXTRA points)
    // Remove the next line if Position Points already include Grade Points
    // @ts-ignore
    totalPoints += GRADE_POINTS[entry.grade] || 0;

    newEntries[index].points = totalPoints;
    setEntries(newEntries);
  };

  const addEntry = () => {
    // Suggest next position automatically
    const lastPos = entries[entries.length - 1]?.position || 0;
    const nextPos = lastPos < 3 ? lastPos + 1 : null;
    
    setEntries([...entries, { 
      student_id: '', team_id: null, position: nextPos, grade: 'None', points: 0 
    }]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setFeedback(null);

    try {
      const payload = entries.map(entry => ({
        event_id: selectedEvent.id,
        student_id: entry.student_id || null,
        team_id: entry.team_id || null, 
        position: entry.position, 
        grade: entry.grade === 'None' ? null : entry.grade,
        points: entry.points,
        published: true, 
      }));

      const { error } = await supabase.from('results').insert(payload);

      if (error) throw error;

      setFeedback({ type: 'success', msg: 'Results Published Successfully!' });
      
      // Reset logic
      setTimeout(() => {
        setStep(0);
        setEntries([{ student_id: '', team_id: null, position: 1, grade: 'None', points: 0 }]);
        setFeedback(null);
      }, 2000);

    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.message || 'Failed to save results' });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 🚫 BLOCK UNAUTHORIZED ACCESS
  // ==========================================
  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 flex-col gap-4 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-sm font-medium animate-pulse">Verifying Admin Access...</p>
      </div>
    );
  }

  // ==========================================
  // 🖥️ UI RENDER (Only Shows if Authorized)
  // ==========================================

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-50 min-h-screen font-sans text-slate-900">
      
      <header className="mb-8">
        <h1 className="text-3xl font-black text-[#0033A0] flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" /> 
          Result Manager
        </h1>
        <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
          <span className={step >= 0 ? "text-blue-600 font-bold" : ""}>1. Level</span>
          <ChevronRight className="w-4 h-4" />
          <span className={step >= 1 ? "text-blue-600 font-bold" : ""}>2. Event</span>
          <ChevronRight className="w-4 h-4" />
          <span className={step >= 2 ? "text-blue-600 font-bold" : ""}>3. Category</span>
          <ChevronRight className="w-4 h-4" />
          <span className={step >= 3 ? "text-blue-600 font-bold" : ""}>4. Winners</span>
        </div>
      </header>

      {feedback && (
        <div className={`p-4 mb-6 rounded-lg flex items-center gap-2 ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {feedback.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
          {feedback.msg}
        </div>
      )}

      {/* STEP 1: SELECT LEVEL */}
      {step === 0 && (
        <div className="grid grid-cols-2 gap-4">
          {LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => { setSelectedLevel(level.id); setStep(1); }}
              className="p-8 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
            >
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Level</span>
              <span className="text-xl font-bold text-slate-800 group-hover:text-blue-700">{level.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* STEP 2: SELECT EVENT */}
      {step === 1 && (
        <div className="space-y-4">
          <button onClick={() => setStep(0)} className="text-sm text-slate-500 hover:text-blue-600 mb-2">← Back to Levels</button>
          <h2 className="text-xl font-bold mb-4">Select {LEVELS.find(l=>l.id===selectedLevel)?.label} Event</h2>
          
          {loading ? <div className="text-center py-10 text-slate-400">Loading Events...</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => handleEventSelect(event)}
                  className="p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left flex justify-between items-center"
                >
                  <span className="font-semibold text-slate-700">{event.name}</span>
                  <div className="text-right">
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono block mb-1">{event.event_code}</span>
                    {event.grade_type && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1 rounded">Cat {event.grade_type}</span>}
                  </div>
                </button>
              ))}
              {events.length === 0 && <div className="text-slate-400 col-span-2 text-center py-8">No events found for this level.</div>}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: SELECT CATEGORY */}
      {step === 2 && (
        <div className="space-y-6">
           <button onClick={() => setStep(1)} className="text-sm text-slate-500 hover:text-blue-600">← Back to Events</button>
           <h2 className="text-xl font-bold">Confirm Category for <span className="text-blue-600">{selectedEvent?.name}</span></h2>
           
           <div className="grid grid-cols-3 gap-6">
             {['A', 'B', 'C'].map((cat) => (
               <button
                 key={cat}
                 // @ts-ignore
                 onClick={() => { setSelectedCategory(cat); setStep(3); }}
                 className={`p-6 border-2 rounded-xl transition-all text-center relative overflow-hidden ${selectedCategory === cat ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-200 bg-white hover:border-blue-300'}`}
               >
                 <div className="text-4xl font-black text-slate-200 absolute -top-2 -right-2 opacity-50">{cat}</div>
                 <div className="text-2xl font-bold text-slate-800 mb-2">Category {cat}</div>
                 <div className="text-xs text-slate-500 space-y-1 font-mono">
                   {/* @ts-ignore */}
                   <div>1st: {POINT_SYSTEM[cat][1]} pts</div>
                   {/* @ts-ignore */}
                   <div>2nd: {POINT_SYSTEM[cat][2]} pts</div>
                   {/* @ts-ignore */}
                   <div>3rd: {POINT_SYSTEM[cat][3]} pts</div>
                 </div>
               </button>
             ))}
           </div>
        </div>
      )}

      {/* STEP 4: ADD WINNERS */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <button onClick={() => setStep(2)} className="text-sm text-slate-500 hover:text-blue-600">← Change Category</button>
             <div className="text-right">
                <div className="text-sm text-slate-500">Event: <b>{selectedEvent?.name}</b></div>
                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded inline-block font-bold">Category {selectedCategory}</div>
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b">
                <tr>
                  <th className="p-4 w-24">Pos</th>
                  <th className="p-4">Student (Chest No)</th>
                  <th className="p-4 w-32">Grade</th>
                  <th className="p-4 w-24">Points</th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry, index) => (
                  <tr key={index}>
                    {/* Position Input */}
                    <td className="p-4">
                      <select 
                        value={entry.position || ''} 
                        onChange={(e) => handleEntryChange(index, 'position', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full p-2 border rounded font-bold text-center bg-slate-50"
                      >
                        <option value="1">1st</option>
                        <option value="2">2nd</option>
                        <option value="3">3rd</option>
                        <option value="">-</option>
                      </select>
                    </td>

                    {/* Participant Select */}
                    <td className="p-4">
                        <select 
                          className="w-full p-2 border rounded bg-white"
                          value={entry.student_id || ''}
                          onChange={(e) => handleEntryChange(index, 'student_id', e.target.value)}
                        >
                          <option value="">Select Student...</option>
                          {students.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name} (Chest: {s.chest_no})
                            </option>
                          ))}
                        </select>
                    </td>

                    {/* Grade Select */}
                    <td className="p-4">
                      <div className="flex gap-1 justify-center">
                        {['A', 'B', 'C', 'None'].map(g => (
                          <button
                            key={g}
                            onClick={() => handleEntryChange(index, 'grade', g)}
                            className={`px-2 py-1 rounded text-xs font-bold border transition-colors ${entry.grade === g ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'}`}
                          >
                            {g === 'None' ? '-' : g}
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Calculated Points */}
                    <td className="p-4">
                      <div className="font-mono font-black text-blue-600 text-xl text-center">
                        {entry.points}
                      </div>
                    </td>

                    {/* Delete */}
                    <td className="p-4 text-center">
                      <button onClick={() => removeEntry(index)} className="text-red-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="p-4 bg-slate-50 border-t flex justify-between items-center">
               <button 
                 onClick={addEntry}
                 className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-100 px-4 py-2 rounded transition-colors"
               >
                 <Plus className="w-4 h-4" /> Add Participant
               </button>
               
               <div className="text-xs text-slate-400 italic">
                 Points = Position ({selectedCategory}) + Grade Bonus
               </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading || entries.length === 0}
              className="flex items-center gap-2 bg-[#0033A0] text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-900 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {loading ? 'Publishing...' : (
                <>
                  <Save className="w-5 h-5" /> Publish Results
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}